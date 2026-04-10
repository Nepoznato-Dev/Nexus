const WORKSPACE_DB_NAME = 'NexusWorkspaceDB';
const WORKSPACE_DB_VERSION = 1;
const STORE_CHECKPOINTS = 'workspace_checkpoints';
const STORE_JOURNAL = 'workspace_journal';
const MAX_MIRRORED_SETTING_BYTES = 4096;
const SETTINGS_MIRROR_ALLOWLIST = [
    'nexus_settings',
    'nexus_theme',
    'nexus_language',
    'nexus_username',
    'nexus_display_name',
    'nexus_user_email',
    'nexus_openai_key',
    'nexus_google_key',
    'nexus_accessibility',
];

function nowMs() {
    return Date.now();
}

function parseJson(raw, fallback = null) {
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

async function compressString(value) {
    // Keep browser support broad: use CompressionStream if available, else plain UTF-8 string.
    if (typeof CompressionStream === 'undefined') {
        return { encoding: 'plain', payload: value };
    }

    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(new TextEncoder().encode(value));
    writer.close();

    const compressed = await new Response(stream.readable).arrayBuffer();
    const bytes = Array.from(new Uint8Array(compressed));
    return { encoding: 'gzip-u8', payload: bytes };
}

async function decompressToString(blob) {
    if (!blob) return null;
    if (blob.encoding === 'plain') return blob.payload;

    if (blob.encoding === 'gzip-u8') {
        if (typeof DecompressionStream === 'undefined') {
            return null;
        }
        const uint8 = new Uint8Array(blob.payload);
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        writer.write(uint8);
        writer.close();
        const plainBuffer = await new Response(stream.readable).arrayBuffer();
        return new TextDecoder().decode(new Uint8Array(plainBuffer));
    }

    return null;
}

function openWorkspaceDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(WORKSPACE_DB_NAME, WORKSPACE_DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(STORE_CHECKPOINTS)) {
                db.createObjectStore(STORE_CHECKPOINTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_JOURNAL)) {
                const journal = db.createObjectStore(STORE_JOURNAL, { keyPath: 'id', autoIncrement: true });
                journal.createIndex('by_ts', 'ts', { unique: false });
            }
        };
    });
}

function txDone(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    });
}

/**
 * Storage-backed workspace orchestrator.
 *
 * Workspace is not "load everything into RAM".
 * It keeps normalized state + pointers and lazily materializes heavy payloads.
 */
export class WorkspaceStorageManager {
    constructor(options = {}) {
        this.db = null;
        this.writable = options.writable !== undefined ? Boolean(options.writable) : true;
        this.workspace = {
            settings: {},
            state: {},
            assets: {},
            meta: {
                bootedAt: nowMs(),
                checkpointVersion: 1,
            },
        };

        this.dirtyPaths = new Set();
        this.flushTimer = null;
        this.flushDelayMs = options.flushDelayMs || 3000;
        this.checkpointIntervalMs = options.checkpointIntervalMs || 180000; // 3 min
        this.maxJournalRows = options.maxJournalRows || 2000;
        this.onStage = options.onStage || (() => { });
        this.requestCommit = options.requestCommit || null;
        this.timers = [];
    }

    setWritable(isWritable) {
        this.writable = Boolean(isWritable);
    }

    async start() {
        this.onStage({ stage: 'ui', detail: 'Workspace boot started' });
        this.db = await openWorkspaceDb();

        this.onStage({ stage: 'preferences', detail: 'Loading bounded local settings into workspace' });
        this.#loadSettingsFromLocalStorage();

        this.onStage({ stage: 'apps', detail: 'Loading checkpoint and replaying journal' });
        await this.#restoreFromCheckpointAndJournal();

        this.onStage({ stage: 'ai', detail: 'AI stage reserved (lazy load)' });

        this.onStage({ stage: 'extras', detail: 'Starting periodic checkpoint scheduler' });
        this.#startPeriodicCheckpoint();

        window.addEventListener('beforeunload', this.#onBeforeUnload);
    }

    stop() {
        this.timers.forEach(clearInterval);
        this.timers = [];
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        window.removeEventListener('beforeunload', this.#onBeforeUnload);
    }

    get(path, fallback = null) {
        const parts = path.split('.');
        let cursor = this.workspace;
        for (const part of parts) {
            if (cursor == null || typeof cursor !== 'object' || !(part in cursor)) {
                return fallback;
            }
            cursor = cursor[part];
        }
        return cursor;
    }

    set(path, value, options = {}) {
        const parts = path.split('.');
        let cursor = this.workspace;

        for (let i = 0; i < parts.length - 1; i++) {
            const key = parts[i];
            if (cursor[key] == null || typeof cursor[key] !== 'object') {
                cursor[key] = {};
            }
            cursor = cursor[key];
        }

        cursor[parts[parts.length - 1]] = value;

        if (options.skipJournal) {
            return;
        }

        if (this.writable) {
            this.dirtyPaths.add(path);
            this.#scheduleJournalFlush();
            return;
        }

        if (typeof this.requestCommit === 'function') {
            this.requestCommit({
                type: 'workspace-set',
                path,
                value,
                ts: nowMs(),
            });
        }
    }

    applyRemoteMutation(mutation) {
        if (!mutation || mutation.type !== 'workspace-set' || !mutation.path) {
            return;
        }

        this.set(mutation.path, mutation.value, { skipJournal: false });
    }

    async createCheckpoint(reason = 'manual') {
        if (!this.writable) {
            return;
        }

        const payload = JSON.stringify(this.workspace);
        const compressed = await compressString(payload);

        const tx = this.db.transaction([STORE_CHECKPOINTS], 'readwrite');
        const store = tx.objectStore(STORE_CHECKPOINTS);
        store.put({
            id: 'latest',
            ts: nowMs(),
            reason,
            blob: compressed,
        });

        await txDone(tx);
    }

    async flushJournal() {
        if (!this.writable) {
            return;
        }

        if (!this.db || this.dirtyPaths.size === 0) {
            return;
        }

        const entries = [];
        const ts = nowMs();
        this.dirtyPaths.forEach((path) => {
            entries.push({
                ts,
                path,
                value: this.get(path),
            });
        });

        this.dirtyPaths.clear();

        const tx = this.db.transaction([STORE_JOURNAL], 'readwrite');
        const journal = tx.objectStore(STORE_JOURNAL);
        entries.forEach((entry) => journal.add(entry));
        await txDone(tx);

        await this.#trimJournalIfNeeded();
    }

    #scheduleJournalFlush() {
        if (this.flushTimer) return;

        this.flushTimer = setTimeout(async () => {
            this.flushTimer = null;
            try {
                await this.flushJournal();
            } catch (error) {
                console.warn('[WorkspaceStorageManager] journal flush failed', error);
            }
        }, this.flushDelayMs);
    }

    #loadSettingsFromLocalStorage() {
        Object.keys(localStorage).forEach((key) => {
            if (!key.startsWith('nexus_')) return;
            if (!SETTINGS_MIRROR_ALLOWLIST.includes(key)) return;

            const raw = localStorage.getItem(key);
            if (typeof raw !== 'string') return;
            if (raw.length > MAX_MIRRORED_SETTING_BYTES) return;

            this.workspace.settings[key] = parseJson(raw, raw);
        });
    }

    async #restoreFromCheckpointAndJournal() {
        const checkpointTx = this.db.transaction([STORE_CHECKPOINTS], 'readonly');
        const checkpointStore = checkpointTx.objectStore(STORE_CHECKPOINTS);
        const checkpointReq = checkpointStore.get('latest');

        const checkpoint = await new Promise((resolve, reject) => {
            checkpointReq.onsuccess = () => resolve(checkpointReq.result || null);
            checkpointReq.onerror = () => reject(checkpointReq.error);
        });
        await txDone(checkpointTx);

        if (checkpoint?.blob) {
            const plain = await decompressToString(checkpoint.blob);
            if (plain) {
                const parsed = parseJson(plain, null);
                if (parsed && typeof parsed === 'object') {
                    this.workspace = parsed;
                }
            }
        }

        const journalTx = this.db.transaction([STORE_JOURNAL], 'readonly');
        const journalStore = journalTx.objectStore(STORE_JOURNAL);
        const cursorReq = journalStore.openCursor();

        await new Promise((resolve, reject) => {
            cursorReq.onerror = () => reject(cursorReq.error);
            cursorReq.onsuccess = () => {
                const cursor = cursorReq.result;
                if (!cursor) {
                    resolve();
                    return;
                }
                const entry = cursor.value;
                this.set(entry.path, entry.value, { skipJournal: true });
                cursor.continue();
            };
        });

        await txDone(journalTx);
    }

    async #trimJournalIfNeeded() {
        const tx = this.db.transaction([STORE_JOURNAL], 'readwrite');
        const store = tx.objectStore(STORE_JOURNAL);
        const rows = [];

        await new Promise((resolve, reject) => {
            const req = store.openCursor();
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) {
                    resolve();
                    return;
                }
                rows.push({ id: cursor.primaryKey, ts: cursor.value.ts });
                cursor.continue();
            };
        });

        if (rows.length > this.maxJournalRows) {
            rows.sort((a, b) => a.ts - b.ts);
            const toDelete = rows.slice(0, rows.length - this.maxJournalRows);
            toDelete.forEach((row) => store.delete(row.id));
        }

        await txDone(tx);
    }

    #startPeriodicCheckpoint() {
        this.timers.push(setInterval(async () => {
            try {
                await this.flushJournal();
                await this.createCheckpoint('periodic');
            } catch (error) {
                console.warn('[WorkspaceStorageManager] periodic checkpoint failed', error);
            }
        }, this.checkpointIntervalMs));
    }

    #onBeforeUnload = () => {
        if (!this.writable) {
            return;
        }

        // Keep unload path tiny: flush journal only; heavy checkpointing should happen periodically.
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        // Fire-and-forget; browser may terminate quickly.
        this.flushJournal().catch(() => { });
    };
}

export async function createWorkspaceStorageManager(options) {
    const manager = new WorkspaceStorageManager(options);
    await manager.start();
    return manager;
}
