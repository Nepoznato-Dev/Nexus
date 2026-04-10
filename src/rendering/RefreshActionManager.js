const PRIORITY_WEIGHT = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
};

const PRESSURE_WEIGHT = {
    stable: 0,
    strained: 1,
    degraded: 2,
    critical: 3,
};

const PRESSURE_PRIORITY_LIMIT = {
    stable: 'low',
    strained: 'normal',
    degraded: 'high',
    critical: 'critical',
};

const FAILURE_AUTO_DISABLE_COUNT = 3;
const MAX_LOG_ENTRIES = 200;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVisibleNow() {
    return typeof document === 'undefined' || !document.hidden;
}

function clampPriority(priority) {
    return PRIORITY_WEIGHT[priority] !== undefined ? priority : 'normal';
}

function nowMs() {
    return Date.now();
}

function withTimeout(promise, timeoutMs, signal) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
        return promise;
    }

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Action timed out'));
        }, timeoutMs);

        const onAbort = () => {
            clearTimeout(timeoutId);
            reject(new Error('Action canceled'));
        };

        if (signal) {
            if (signal.aborted) {
                onAbort();
                return;
            }
            signal.addEventListener('abort', onAbort, { once: true });
        }

        Promise.resolve(promise)
            .then((result) => {
                clearTimeout(timeoutId);
                if (signal) {
                    signal.removeEventListener('abort', onAbort);
                }
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                if (signal) {
                    signal.removeEventListener('abort', onAbort);
                }
                reject(error);
            });
    });
}

export class RefreshActionManager {
    constructor({ getPressure, getSnapshot }) {
        this.getPressure = getPressure;
        this.getSnapshot = getSnapshot;
        this.actions = new Map();
        this.queue = [];
        this.logs = [];
        this.lastAction = null;
        this.running = false;
        this.safeMode = false;
        this.handlers = {
            component: new Map(),
            view: new Map(),
            data: new Map(),
            global: new Map(),
        };
        this.cooldownUntil = new Map();
        this.rateBuckets = new Map();
        this.debounceUntil = new Map();
        this.throttleUntil = new Map();
        this.failureCounts = new Map();
        this.autoDisabled = new Set();
        this.lastRunAt = new Map();
        this.activeBySupersedeKey = new Map();
        this.activeControllers = new Map();
        this.actionImpact = new Map();
        this.lastVisibleState = isVisibleNow();
        this.installDefaultActions();
    }

    installDefaultActions() {
        this.registerAction({
            id: 'refresh-desktop-widgets',
            name: 'Refresh desktop widgets',
            scope: 'component',
            target: 'widgets-overlay',
            permission: 'safe',
            priority: 'normal',
            cooldownMs: 5000,
            timeoutMs: 3000,
            retry: { maxRetries: 1, baseDelayMs: 200 },
            triggers: [
                { type: 'event', event: 'window-focus' },
                { type: 'state', state: 'visible-transition' },
            ],
            conditions: ({ staleSeconds }) => staleSeconds > 20,
        });

        this.registerAction({
            id: 'refresh-current-view',
            name: 'Refresh current view',
            scope: 'view',
            target: 'current-route',
            permission: 'safe',
            priority: 'high',
            cooldownMs: 3000,
            debounceMs: 300,
            timeoutMs: 4500,
            supersedeKey: 'view:current-route',
            triggers: [
                { type: 'event', event: 'route-change' },
                { type: 'event', event: 'window-focus' },
                { type: 'state', state: 'fps-below', threshold: 45, sustainMs: 1200 },
            ],
            conditions: ({ staleSeconds }) => staleSeconds > 5,
        });

        this.registerAction({
            id: 'reload-game-list',
            name: 'Reload game list',
            scope: 'data',
            target: 'games-list',
            permission: 'safe',
            priority: 'low',
            cooldownMs: 10000,
            timeoutMs: 7000,
            retry: { maxRetries: 2, baseDelayMs: 400, maxDelayMs: 2500 },
            supersedeKey: 'data:games-list',
            triggers: [
                { type: 'event', event: 'app-launch' },
                { type: 'event', event: 'route-change', routePrefix: '/games' },
                { type: 'event', event: 'timer' },
                { type: 'state', state: 'stale-seconds', threshold: 60 },
            ],
            conditions: ({ routePath }) => routePath === '/games' || routePath.startsWith('/games/'),
        });

        this.registerAction({
            id: 'clear-stale-cache-then-rerender',
            name: 'Clear stale cache then rerender',
            scope: 'global',
            target: 'app-runtime',
            permission: 'guarded',
            priority: 'critical',
            cooldownMs: 15000,
            timeoutMs: 10000,
            retry: { maxRetries: 1, baseDelayMs: 800 },
            supersedeKey: 'global:runtime-reset',
            triggers: [
                { type: 'event', event: 'memory-pressure' },
            ],
            conditions: ({ pressure }) => pressure === 'critical' || pressure === 'degraded',
        });
    }

    registerScopeHandler(scope, target, handler) {
        const bucket = this.handlers[scope];
        if (!bucket) return () => {};

        const key = `${scope}:${target}`;
        const current = bucket.get(key) || new Set();
        current.add(handler);
        bucket.set(key, current);

        return () => {
            const next = bucket.get(key);
            if (!next) return;
            next.delete(handler);
            if (next.size === 0) {
                bucket.delete(key);
            }
        };
    }

    registerAction(action) {
        if (!action?.id) return;
        this.actions.set(action.id, {
            id: action.id,
            name: action.name || action.id,
            scope: action.scope || 'view',
            target: action.target || 'current-route',
            permission: action.permission || 'safe',
            priority: clampPriority(action.priority),
            cooldownMs: Number(action.cooldownMs) || 0,
            rateLimit: action.rateLimit || { windowMs: 60000, maxRuns: 8 },
            debounceMs: Number(action.debounceMs) || 0,
            throttleMs: Number(action.throttleMs) || 0,
            timeoutMs: Number(action.timeoutMs) || 5000,
            retry: action.retry || { maxRetries: 0, baseDelayMs: 300, maxDelayMs: 2000 },
            supersedeKey: action.supersedeKey || null,
            triggers: Array.isArray(action.triggers) ? action.triggers : [],
            conditions: typeof action.conditions === 'function' ? action.conditions : null,
            handler: typeof action.handler === 'function' ? action.handler : null,
        });
    }

    unregisterAction(actionId) {
        this.actions.delete(actionId);
    }

    setSafeMode(enabled) {
        this.safeMode = Boolean(enabled);
        this.logEntry({
            actionId: 'system:safe-mode',
            name: 'Safe mode switch',
            scope: 'global',
            target: 'app-runtime',
            reason: 'manual',
            status: 'success',
            durationMs: 0,
            meta: { enabled: this.safeMode },
        });
    }

    isAllowedByPermission(action) {
        if (!this.safeMode) return true;
        return action.permission === 'safe';
    }

    enqueueAction(actionId, options = {}) {
        const action = this.actions.get(actionId);
        if (!action) return { accepted: false, reason: 'not-found' };
        if (this.autoDisabled.has(actionId)) return { accepted: false, reason: 'auto-disabled' };
        if (!this.isAllowedByPermission(action)) return { accepted: false, reason: 'safe-mode-blocked' };

        const now = nowMs();
        const reason = options.reason || 'manual';
        const eventType = options.eventType || null;
        const routePath = options.routePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
        const staleSeconds = this.getStaleSeconds(actionId, now);
        const pressure = this.getPressure();
        const fps = this.getSnapshot()?.fps || 60;

        const context = {
            now,
            reason,
            eventType,
            routePath,
            staleSeconds,
            pressure,
            fps,
            visible: isVisibleNow(),
            payload: options.payload,
        };

        if (action.conditions && !action.conditions(context)) {
            return { accepted: false, reason: 'conditions-not-met' };
        }

        const cooldownUntil = this.cooldownUntil.get(actionId) || 0;
        if (cooldownUntil > now) {
            return { accepted: false, reason: 'cooldown-active' };
        }

        if (!this.withinRateLimit(action, now)) {
            return { accepted: false, reason: 'rate-limited' };
        }

        if (!this.applyDebounceAndThrottle(action, now)) {
            return { accepted: false, reason: 'debounced-or-throttled' };
        }

        if (!this.withinPressurePriority(action)) {
            return { accepted: false, reason: 'priority-blocked-by-pressure' };
        }

        if (action.supersedeKey) {
            this.cancelSuperseded(action.supersedeKey);
            this.queue = this.queue.filter((queued) => queued.supersedeKey !== action.supersedeKey);
        }

        const id = `${actionId}:${now}:${Math.random().toString(36).slice(2, 7)}`;
        const queued = {
            id,
            actionId,
            name: action.name,
            scope: action.scope,
            target: action.target,
            priority: action.priority,
            supersedeKey: action.supersedeKey,
            reason,
            eventType,
            enqueuedAt: now,
            payload: options.payload,
        };

        this.queue.push(queued);
        this.queue.sort((a, b) => (PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]) || (a.enqueuedAt - b.enqueuedAt));
        this.processQueue();
        return { accepted: true, id };
    }

    cancelAction(actionId) {
        this.queue = this.queue.filter((entry) => entry.actionId !== actionId);
        for (const [tokenId, controller] of this.activeControllers.entries()) {
            if (tokenId.startsWith(`${actionId}:`)) {
                controller.abort();
                this.activeControllers.delete(tokenId);
            }
        }
    }

    cancelSuperseded(supersedeKey) {
        const activeToken = this.activeBySupersedeKey.get(supersedeKey);
        if (activeToken) {
            const controller = this.activeControllers.get(activeToken);
            if (controller) {
                controller.abort();
            }
            this.activeControllers.delete(activeToken);
            this.activeBySupersedeKey.delete(supersedeKey);
        }
    }

    triggerEvent(eventType, payload = {}) {
        const routePath = payload.routePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
        for (const action of this.actions.values()) {
            const eventRule = action.triggers.find((rule) => rule.type === 'event' && rule.event === eventType);
            if (!eventRule) continue;
            if (eventRule.routePrefix && !routePath.startsWith(eventRule.routePrefix)) {
                continue;
            }
            this.enqueueAction(action.id, {
                reason: payload.reason || 'auto',
                eventType,
                payload,
                routePath,
            });
        }
    }

    evaluateStateRules(state = {}) {
        const visible = isVisibleNow();
        const becameVisible = !this.lastVisibleState && visible;
        this.lastVisibleState = visible;

        for (const action of this.actions.values()) {
            for (const rule of action.triggers) {
                if (rule.type !== 'state') continue;

                if (rule.state === 'visible-transition' && becameVisible) {
                    this.enqueueAction(action.id, { reason: 'visibility', eventType: 'visible-transition', payload: state });
                    continue;
                }

                if (rule.state === 'stale-seconds') {
                    const staleSeconds = this.getStaleSeconds(action.id, nowMs());
                    if (staleSeconds >= (rule.threshold || 30)) {
                        this.enqueueAction(action.id, { reason: 'stale', eventType: 'stale-seconds', payload: state });
                    }
                    continue;
                }

                if (rule.state === 'fps-below') {
                    const fps = Number(state.fps) || 60;
                    const sustainMs = Number(rule.sustainMs) || 0;
                    if (fps < (rule.threshold || 45)) {
                        const key = `state:${action.id}:fps-below`;
                        const started = this.debounceUntil.get(key) || nowMs();
                        if (!this.debounceUntil.get(key)) {
                            this.debounceUntil.set(key, started);
                        }
                        if ((nowMs() - started) >= sustainMs) {
                            this.enqueueAction(action.id, { reason: 'pressure', eventType: 'fps-below', payload: state });
                            this.debounceUntil.delete(key);
                        }
                    } else {
                        this.debounceUntil.delete(`state:${action.id}:fps-below`);
                    }
                }
            }
        }
    }

    async processQueue() {
        if (this.running) return;
        this.running = true;

        try {
            while (this.queue.length > 0) {
                const next = this.queue.shift();
                await this.executeQueued(next);
            }
        } finally {
            this.running = false;
        }
    }

    async executeQueued(queued) {
        const action = this.actions.get(queued.actionId);
        if (!action) return;
        if (!this.isAllowedByPermission(action)) return;
        if (this.autoDisabled.has(action.id)) return;

        const token = `${queued.actionId}:${queued.id}`;
        const controller = new AbortController();
        this.activeControllers.set(token, controller);
        if (action.supersedeKey) {
            this.activeBySupersedeKey.set(action.supersedeKey, token);
        }

        const startedAt = nowMs();
        let attempt = 0;
        let lastError = null;
        const maxRetries = Math.max(0, Number(action.retry?.maxRetries) || 0);

        while (attempt <= maxRetries) {
            attempt += 1;
            try {
                const context = {
                    signal: controller.signal,
                    payload: queued.payload,
                    reason: queued.reason,
                    action,
                    snapshot: this.getSnapshot?.() || {},
                };

                const runPromise = action.handler
                    ? action.handler(context)
                    : this.invokeScopeAction(action.scope, action.target, context);

                await withTimeout(runPromise, action.timeoutMs, controller.signal);

                const durationMs = nowMs() - startedAt;
                this.cooldownUntil.set(action.id, nowMs() + action.cooldownMs);
                this.lastRunAt.set(action.id, nowMs());
                this.failureCounts.set(action.id, 0);
                this.recordImpact(action.id, durationMs, true);
                this.logEntry({
                    actionId: action.id,
                    name: action.name,
                    scope: action.scope,
                    target: action.target,
                    reason: queued.reason,
                    status: 'success',
                    durationMs,
                    meta: { attempt },
                });
                return;
            } catch (error) {
                lastError = error;
                if (controller.signal.aborted) {
                    this.logEntry({
                        actionId: action.id,
                        name: action.name,
                        scope: action.scope,
                        target: action.target,
                        reason: queued.reason,
                        status: 'canceled',
                        durationMs: nowMs() - startedAt,
                        meta: { attempt },
                    });
                    return;
                }

                if (attempt <= maxRetries) {
                    const base = Math.max(100, Number(action.retry?.baseDelayMs) || 300);
                    const maxDelay = Math.max(base, Number(action.retry?.maxDelayMs) || 2000);
                    const delay = Math.min(maxDelay, base * (2 ** (attempt - 1)));
                    await sleep(delay);
                }
            }
        }

        const durationMs = nowMs() - startedAt;
        this.recordImpact(action.id, durationMs, false);
        this.logEntry({
            actionId: action.id,
            name: action.name,
            scope: action.scope,
            target: action.target,
            reason: queued.reason,
            status: 'failed',
            durationMs,
            meta: { error: lastError?.message || 'unknown' },
        });

        const failures = (this.failureCounts.get(action.id) || 0) + 1;
        this.failureCounts.set(action.id, failures);
        if (failures >= FAILURE_AUTO_DISABLE_COUNT) {
            this.autoDisabled.add(action.id);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nexus:refresh-action-disabled', {
                    detail: {
                        actionId: action.id,
                        reason: 'repeated-failures',
                        failures,
                    },
                }));
            }
        }
    }

    async invokeScopeAction(scope, target, context) {
        const key = `${scope}:${target}`;
        const bucket = this.handlers[scope];
        const handlers = bucket?.get(key);

        if (handlers && handlers.size > 0) {
            await Promise.all(Array.from(handlers).map((handler) => Promise.resolve(handler(context))));
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(`nexus:refresh-${scope}`, {
                detail: {
                    target,
                    reason: context.reason,
                    payload: context.payload,
                },
            }));
        }
    }

    withinRateLimit(action, now) {
        const limit = action.rateLimit || { windowMs: 60000, maxRuns: 8 };
        const bucket = this.rateBuckets.get(action.id) || [];
        const recent = bucket.filter((timestamp) => now - timestamp < (limit.windowMs || 60000));
        if (recent.length >= (limit.maxRuns || 8)) {
            this.rateBuckets.set(action.id, recent);
            return false;
        }
        recent.push(now);
        this.rateBuckets.set(action.id, recent);
        return true;
    }

    applyDebounceAndThrottle(action, now) {
        const debounceUntil = this.debounceUntil.get(action.id) || 0;
        if (debounceUntil > now) return false;

        const throttleUntil = this.throttleUntil.get(action.id) || 0;
        if (throttleUntil > now) return false;

        if (action.debounceMs > 0) {
            this.debounceUntil.set(action.id, now + action.debounceMs);
        }
        if (action.throttleMs > 0) {
            this.throttleUntil.set(action.id, now + action.throttleMs);
        }
        return true;
    }

    withinPressurePriority(action) {
        const pressure = this.getPressure();
        const maxPriority = PRESSURE_PRIORITY_LIMIT[pressure] || 'normal';
        return PRIORITY_WEIGHT[action.priority] <= PRIORITY_WEIGHT[maxPriority];
    }

    getStaleSeconds(actionId, now) {
        const last = this.lastRunAt.get(actionId) || 0;
        if (!last) return Number.POSITIVE_INFINITY;
        return (now - last) / 1000;
    }

    recordImpact(actionId, durationMs, success) {
        const existing = this.actionImpact.get(actionId) || {
            runs: 0,
            failures: 0,
            avgDurationMs: 0,
        };

        const runs = existing.runs + 1;
        const failures = existing.failures + (success ? 0 : 1);
        const avgDurationMs = ((existing.avgDurationMs * existing.runs) + durationMs) / runs;

        this.actionImpact.set(actionId, {
            runs,
            failures,
            avgDurationMs: Number(avgDurationMs.toFixed(1)),
        });
    }

    logEntry(entry) {
        const enriched = {
            at: nowMs(),
            ...entry,
        };

        this.logs.unshift(enriched);
        this.lastAction = enriched;

        if (this.logs.length > MAX_LOG_ENTRIES) {
            this.logs.length = MAX_LOG_ENTRIES;
        }
    }

    getStatus({ includeLogs = false, logLimit = 50 } = {}) {
        return {
            safeMode: this.safeMode,
            queueLength: this.queue.length,
            autoDisabled: Array.from(this.autoDisabled),
            lastAction: this.lastAction,
            logs: includeLogs ? this.logs.slice(0, Math.max(1, logLimit)) : undefined,
            impact: Object.fromEntries(this.actionImpact.entries()),
        };
    }
}

export default RefreshActionManager;
