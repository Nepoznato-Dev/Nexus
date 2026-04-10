/**
 * I.R.I.S Pending Undo Manager
 *
 * Manages one active "Keep | Undo" action at a time.
 */

let pendingEntry = null;
let expireTimer = null;
const listeners = new Set();

function notify() {
    listeners.forEach((listener) => {
        try {
            listener(pendingEntry);
        } catch (error) {
            console.error('[I.R.I.S] pending undo listener error:', error);
        }
    });
}

function clearTimer() {
    if (expireTimer) {
        clearTimeout(expireTimer);
        expireTimer = null;
    }
}

function clearEntry() {
    clearTimer();
    pendingEntry = null;
    notify();
}

async function runAction(action) {
    if (typeof action === 'function') {
        return await action();
    }
    return undefined;
}

export function getPendingUndo() {
    return pendingEntry;
}

export function subscribePendingUndo(listener) {
    listeners.add(listener);
    listener(pendingEntry);

    return () => {
        listeners.delete(listener);
    };
}

/**
 * Push a new pending undo entry. Replaces existing one and auto-keeps it.
 */
export async function pushPendingUndo({ summary, undo, keep, expiresMs = 30000 }) {
    if (!summary || typeof undo !== 'function') {
        throw new Error('pushPendingUndo requires summary and undo function');
    }

    // One pending at a time: auto-keep previous change.
    if (pendingEntry) {
        try {
            await runAction(pendingEntry.keep);
        } catch (error) {
            console.error('[I.R.I.S] auto-keep previous pending action failed:', error);
        }
    }

    clearTimer();

    const createdAt = Date.now();
    pendingEntry = {
        id: `pending_${createdAt}_${Math.random().toString(36).slice(2, 8)}`,
        summary,
        createdAt,
        expiresAt: createdAt + expiresMs,
        undo,
        keep,
    };

    expireTimer = setTimeout(async () => {
        if (!pendingEntry) return;

        try {
            await runAction(pendingEntry.keep);
        } catch (error) {
            console.error('[I.R.I.S] pending action keep-on-expire failed:', error);
        } finally {
            clearEntry();
        }
    }, expiresMs);

    notify();
    return pendingEntry;
}

export async function keepPendingUndo() {
    if (!pendingEntry) {
        return { success: false, reason: 'none-pending' };
    }

    const current = pendingEntry;
    try {
        await runAction(current.keep);
        clearEntry();
        return { success: true, action: 'keep', id: current.id };
    } catch (error) {
        return { success: false, action: 'keep', error: error.message };
    }
}

export async function undoPendingUndo() {
    if (!pendingEntry) {
        return { success: false, reason: 'none-pending' };
    }

    const current = pendingEntry;
    try {
        await runAction(current.undo);
        clearEntry();
        return { success: true, action: 'undo', id: current.id };
    } catch (error) {
        return { success: false, action: 'undo', error: error.message };
    }
}

if (typeof window !== 'undefined') {
    window.irisPendingUndo = {
        get: getPendingUndo,
        keep: keepPendingUndo,
        undo: undoPendingUndo,
    };
}
