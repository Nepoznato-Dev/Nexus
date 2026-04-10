const CHANNEL_NAME = 'nexus-tab-bus';
const HOME_LEASE_KEY = 'nexus_home_lease_v1';

function nowMs() {
    return Date.now();
}

function randomId() {
    return `tab_${Math.random().toString(36).slice(2)}_${nowMs()}`;
}

function parseJson(raw, fallback = null) {
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function writeLease(lease) {
    localStorage.setItem(HOME_LEASE_KEY, JSON.stringify(lease));
}

function readLease() {
    return parseJson(localStorage.getItem(HOME_LEASE_KEY), null);
}

/**
 * Home/child tab governance manager.
 *
 * - One tab owns "home" write authority.
 * - Child tabs forward commit intents to home.
 * - If home lease expires, children deterministically elect a replacement.
 */
export class TabGovernance {
    constructor(options = {}) {
        this.tabId = randomId();
        this.sessionStartedAt = nowMs();
        this.role = 'unknown';
        this.epoch = 0;
        this.channel = null;
        this.isApprovedChild = Boolean(options.isApprovedChild);
        this.heartbeatMs = options.heartbeatMs || 3000;
        this.homeTimeoutMs = options.homeTimeoutMs || 10000;
        this.leaseMs = options.leaseMs || 12000;
        this.lastHomeHeartbeatAt = 0;
        this.seenTabs = new Map();
        this.homeTimer = null;
        this.electionTimer = null;

        this.onRoleChange = options.onRoleChange || (() => { });
        this.onCommitRequest = options.onCommitRequest || (() => { });
        this.onDuplicateUnapproved = options.onDuplicateUnapproved || (() => { });
    }

    start() {
        if (typeof window === 'undefined') return;

        if ('BroadcastChannel' in window) {
            this.channel = new BroadcastChannel(CHANNEL_NAME);
            this.channel.onmessage = (event) => this.#handleMessage(event.data);
        }

        window.addEventListener('storage', this.#onStorageEvent);

        this.#announceHello();
        this.#evaluateRole();
        this.#startLoops();
    }

    stop() {
        if (this.homeTimer) {
            clearTimeout(this.homeTimer);
            this.homeTimer = null;
        }
        if (this.electionTimer) {
            clearTimeout(this.electionTimer);
            this.electionTimer = null;
        }
        this.homeTimer = null;
        this.electionTimer = null;
        window.removeEventListener('storage', this.#onStorageEvent);
        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }
    }

    requestCommit(mutation) {
        if (this.role === 'home') {
            this.onCommitRequest({ mutation, from: this.tabId, epoch: this.epoch });
            return;
        }

        this.#send({
            type: 'COMMIT_REQ',
            from: this.tabId,
            epoch: this.epoch,
            mutation,
            ts: nowMs(),
        });
    }

    #startLoops() {
        const scheduleHomeTick = () => {
            const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';
            const delay = isVisible ? this.heartbeatMs : this.heartbeatMs * 3;

            this.homeTimer = setTimeout(() => {
                if (this.role === 'home') {
                    this.#renewHomeLease();
                    this.#sendHeartbeat();
                }
                scheduleHomeTick();
            }, delay);
        };

        const scheduleElectionTick = () => {
            const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';
            const visibleDelay = Math.max(1000, Math.floor(this.heartbeatMs / 2));
            const hiddenDelay = Math.max(4000, this.heartbeatMs * 2);
            const delay = isVisible ? visibleDelay : hiddenDelay;

            this.electionTimer = setTimeout(() => {
                if (this.role !== 'home') {
                    this.#checkHomeTimeoutAndElect();
                }
                scheduleElectionTick();
            }, delay);
        };

        scheduleHomeTick();
        scheduleElectionTick();
    }

    #setRole(role, reason = 'unknown') {
        if (this.role === role) return;
        this.role = role;
        this.onRoleChange({ role, epoch: this.epoch, reason, tabId: this.tabId });
    }

    #evaluateRole() {
        const lease = readLease();
        const currentTime = nowMs();

        if (!lease || lease.leaseUntil <= currentTime) {
            this.#becomeHome('lease-missing-or-expired');
            return;
        }

        if (lease.homeId === this.tabId) {
            this.epoch = lease.epoch || 0;
            this.#setRole('home', 'lease-owned');
            return;
        }

        this.epoch = lease.epoch || 0;
        this.lastHomeHeartbeatAt = currentTime;
        this.#setRole(this.isApprovedChild ? 'child-approved' : 'child-unapproved', 'lease-owned-by-other');

        if (!this.isApprovedChild) {
            this.onDuplicateUnapproved({ tabId: this.tabId, homeId: lease.homeId });
        }
    }

    #becomeHome(reason) {
        const lease = readLease();
        const nextEpoch = (lease?.epoch || 0) + 1;
        this.epoch = nextEpoch;

        this.#renewHomeLease();
        this.#setRole('home', reason);
        this.#send({
            type: 'PROMOTE_HOME',
            from: this.tabId,
            epoch: this.epoch,
            ts: nowMs(),
        });
    }

    #renewHomeLease() {
        const lease = {
            homeId: this.tabId,
            epoch: this.epoch,
            leaseUntil: nowMs() + this.leaseMs,
            startedAt: this.sessionStartedAt,
        };
        writeLease(lease);
    }

    #sendHeartbeat() {
        this.#send({
            type: 'HEARTBEAT',
            from: this.tabId,
            epoch: this.epoch,
            ts: nowMs(),
        });
    }

    #announceHello() {
        this.#send({
            type: 'HELLO',
            from: this.tabId,
            ts: nowMs(),
            startedAt: this.sessionStartedAt,
            approvedChild: this.isApprovedChild,
        });
    }

    #checkHomeTimeoutAndElect() {
        const currentTime = nowMs();
        const lease = readLease();

        if (lease && lease.leaseUntil > currentTime) {
            return;
        }

        if (currentTime - this.lastHomeHeartbeatAt < this.homeTimeoutMs) {
            return;
        }

        // Deterministic election: oldest approved child wins, then lexical tabId tie-break.
        const candidates = [];
        this.seenTabs.forEach((meta, id) => {
            if (meta.approvedChild) {
                candidates.push({ id, startedAt: meta.startedAt || Number.MAX_SAFE_INTEGER });
            }
        });

        // Include self if approved.
        if (this.isApprovedChild) {
            candidates.push({ id: this.tabId, startedAt: this.sessionStartedAt });
        }

        if (candidates.length === 0) {
            return;
        }

        candidates.sort((a, b) => {
            if (a.startedAt !== b.startedAt) return a.startedAt - b.startedAt;
            return a.id.localeCompare(b.id);
        });

        if (candidates[0].id === this.tabId) {
            this.#becomeHome('child-election-win');
        }
    }

    #send(payload) {
        if (this.channel) {
            this.channel.postMessage(payload);
        }
    }

    #handleMessage(message) {
        if (!message || typeof message !== 'object') return;
        const { type, from, ts } = message;

        if (from && from !== this.tabId) {
            this.seenTabs.set(from, {
                lastSeenAt: ts || nowMs(),
                startedAt: message.startedAt,
                approvedChild: Boolean(message.approvedChild),
            });
        }

        if (type === 'HEARTBEAT') {
            const lease = readLease();
            if (lease?.homeId === from) {
                this.lastHomeHeartbeatAt = nowMs();
                this.epoch = lease.epoch || this.epoch;
            }
            return;
        }

        if (type === 'PROMOTE_HOME') {
            if (from !== this.tabId) {
                this.epoch = Math.max(this.epoch, message.epoch || 0);
                this.lastHomeHeartbeatAt = nowMs();
                this.#setRole(this.isApprovedChild ? 'child-approved' : 'child-unapproved', 'remote-promotion');
            }
            return;
        }

        if (type === 'COMMIT_REQ' && this.role === 'home') {
            this.onCommitRequest({
                mutation: message.mutation,
                from,
                epoch: message.epoch,
                ts,
            });
        }
    }

    #onStorageEvent = (event) => {
        if (event.key !== HOME_LEASE_KEY) return;
        const lease = parseJson(event.newValue, null);

        if (!lease) return;

        if (lease.homeId === this.tabId) {
            this.epoch = lease.epoch || this.epoch;
            this.#setRole('home', 'storage-lease-owned');
            return;
        }

        this.epoch = lease.epoch || this.epoch;
        this.lastHomeHeartbeatAt = nowMs();

        if (this.role === 'home') {
            this.#setRole(this.isApprovedChild ? 'child-approved' : 'child-unapproved', 'storage-home-changed');
        }
    };
}

export function createTabGovernance(options) {
    const manager = new TabGovernance(options);
    manager.start();
    return manager;
}
