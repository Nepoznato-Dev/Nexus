import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import renderManager from './RenderManager';
import fpsThrottler from '../utils/fpsThrottler';
import RefreshActionManager from './RefreshActionManager';

const RenderManagerContext = createContext(null);

const PRESSURE_WEIGHT = {
    stable: 0,
    strained: 1,
    degraded: 2,
    critical: 3,
};

function resolveHigherPressure(a, b) {
    const left = PRESSURE_WEIGHT[a] ?? PRESSURE_WEIGHT.stable;
    const right = PRESSURE_WEIGHT[b] ?? PRESSURE_WEIGHT.stable;
    return left >= right ? a : b;
}

export function RenderManagerProvider({ children }) {
    const [snapshot, setSnapshot] = useState(renderManager.getSnapshot());
    const [refreshStatus, setRefreshStatus] = useState({
        safeMode: false,
        queueLength: 0,
        autoDisabled: [],
        lastAction: null,
        impact: {},
    });
    const rafRef = useRef(null);
    const refreshManagerRef = useRef(null);
    const lastStateEvalAtRef = useRef(0);
    const lastSnapshotPublishAtRef = useRef(0);

    if (!refreshManagerRef.current) {
        refreshManagerRef.current = new RefreshActionManager({
            getPressure: () => renderManager.getSnapshot().effectivePressure || 'stable',
            getSnapshot: () => renderManager.getSnapshot(),
        });
    }

    useEffect(() => {
        const unsubscribe = renderManager.subscribe((nextSnapshot) => {
            setSnapshot(nextSnapshot);
        });

        const refreshManager = refreshManagerRef.current;

        const unregisterGlobalRefresh = refreshManager.registerScopeHandler('global', 'app-runtime', async () => {
            window.dispatchEvent(new Event('nexus:clear-ram'));
            window.dispatchEvent(new CustomEvent('nexus:refresh-view', {
                detail: {
                    target: 'current-route',
                    reason: 'global-recovery',
                },
            }));
        });

        const isSameRefreshStatus = (left, right) => {
            if (!left || !right) return false;
            const leftLastAt = left.lastAction?.at || 0;
            const rightLastAt = right.lastAction?.at || 0;
            if (left.safeMode !== right.safeMode) return false;
            if (left.queueLength !== right.queueLength) return false;
            if (leftLastAt !== rightLastAt) return false;
            if ((left.autoDisabled?.length || 0) !== (right.autoDisabled?.length || 0)) return false;

            for (let index = 0; index < (left.autoDisabled?.length || 0); index += 1) {
                if (left.autoDisabled[index] !== right.autoDisabled[index]) return false;
            }

            return true;
        };

        const updateRefreshStatus = () => {
            setRefreshStatus((prev) => {
                const next = refreshManager.getStatus();
                return isSameRefreshStatus(prev, next) ? prev : next;
            });
        };

        const refreshApi = {
            enqueue: (actionId, options = {}) => {
                const result = refreshManager.enqueueAction(actionId, options);
                updateRefreshStatus();
                return result;
            },
            registerAction: (action) => refreshManager.registerAction(action),
            unregisterAction: (actionId) => refreshManager.unregisterAction(actionId),
            registerScopeHandler: (scope, target, handler) => refreshManager.registerScopeHandler(scope, target, handler),
            cancelAction: (actionId) => {
                refreshManager.cancelAction(actionId);
                updateRefreshStatus();
            },
            setSafeMode: (enabled) => {
                refreshManager.setSafeMode(enabled);
                updateRefreshStatus();
            },
            getStatus: (options = {}) => refreshManager.getStatus(options),
            triggerEvent: (eventType, payload = {}) => {
                refreshManager.triggerEvent(eventType, payload);
                updateRefreshStatus();
            },
        };

        window.nexusRefreshActions = refreshApi;

        const onPressureEvent = (event) => {
            const pressure = event?.detail?.uiPressure || 'stable';
            renderManager.updatePressure(pressure);
            if (pressure === 'degraded' || pressure === 'critical') {
                refreshManager.triggerEvent('memory-pressure', {
                    reason: 'pressure',
                    pressure,
                });
                updateRefreshStatus();
            }
        };

        const onFocus = () => {
            refreshManager.triggerEvent('window-focus', { reason: 'visibility' });
            updateRefreshStatus();
        };

        const onVisibilityChange = () => {
            if (!document.hidden) {
                onFocus();
            }
        };

        const onRouteChange = (event) => {
            const routePath = event?.detail?.path || window.location.pathname;
            refreshManager.triggerEvent('route-change', {
                reason: 'navigation',
                routePath,
            });
            updateRefreshStatus();
        };

        let timerTick = 0;
        const timerId = window.setInterval(() => {
            timerTick += 1;
            const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';
            if (!isVisible && timerTick % 4 !== 0) {
                return;
            }

            refreshManager.triggerEvent('timer', {
                reason: 'auto',
                routePath: window.location.pathname,
            });
            updateRefreshStatus();
        }, 15000);

        const frameLoop = (now) => {
            renderManager.setTargetFPS(fpsThrottler.getTargetFPS());
            renderManager.nextFrame(now);
            const nextSnapshot = renderManager.getSnapshot();

            if ((now - lastSnapshotPublishAtRef.current) >= 250) {
                lastSnapshotPublishAtRef.current = now;
                setSnapshot(nextSnapshot);
            }

            if ((now - lastStateEvalAtRef.current) >= 500) {
                lastStateEvalAtRef.current = now;
                refreshManager.evaluateStateRules({
                    fps: nextSnapshot.fps,
                    pressure: nextSnapshot.effectivePressure,
                    routePath: window.location.pathname,
                });
                updateRefreshStatus();
            }
            rafRef.current = window.requestAnimationFrame(frameLoop);
        };

        refreshManager.triggerEvent('app-launch', {
            reason: 'auto',
            routePath: window.location.pathname,
        });
        updateRefreshStatus();

        window.addEventListener('alloy:ui-pressure', onPressureEvent);
        window.addEventListener('focus', onFocus);
        window.addEventListener('nexus:route-change', onRouteChange);
        document.addEventListener('visibilitychange', onVisibilityChange);
        rafRef.current = window.requestAnimationFrame(frameLoop);

        return () => {
            unsubscribe();
            unregisterGlobalRefresh();
            window.clearInterval(timerId);
            if (rafRef.current) {
                window.cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            window.removeEventListener('alloy:ui-pressure', onPressureEvent);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('nexus:route-change', onRouteChange);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            delete window.nexusRefreshActions;
        };
    }, []);

    const value = useMemo(() => {
        const globalPressure = document?.documentElement?.dataset?.alloyUiPressure || 'stable';
        const effectivePressure = resolveHigherPressure(snapshot.effectivePressure || 'stable', globalPressure);

        return {
            manager: renderManager,
            refreshActions: refreshManagerRef.current,
            snapshot: {
                ...snapshot,
                effectivePressure,
            },
            refreshStatus,
        };
    }, [snapshot, refreshStatus]);

    return (
        <RenderManagerContext.Provider value={value}>
            {children}
        </RenderManagerContext.Provider>
    );
}

export function useRenderManager() {
    const context = useContext(RenderManagerContext);
    if (!context) {
        throw new Error('useRenderManager must be used inside RenderManagerProvider');
    }
    return context;
}

export function useRenderPermission({ id, priority = 'normal', budgetCost = 1, layer = 'content' }) {
    const { manager, snapshot } = useRenderManager();
    const [enabled, setEnabled] = useState(true);
    const [frameTick, setFrameTick] = useState(0);

    useEffect(() => {
        manager.register(id, { priority, budgetCost });
        return () => manager.unregister(id);
    }, [manager, id, priority, budgetCost]);

    useEffect(() => {
        const unsubscribe = manager.subscribeFrame(() => {
            setFrameTick((prev) => prev + 1);
        });
        return unsubscribe;
    }, [manager]);

    useEffect(() => {
        const allowed = manager.shouldRender(id, { priority, budgetCost, layer });
        setEnabled(allowed);
    }, [manager, id, priority, budgetCost, layer, frameTick, snapshot.effectivePressure, snapshot.bootPhase]);

    return {
        enabled,
        pressure: snapshot.effectivePressure,
        bootPhase: snapshot.bootPhase,
        frameId: snapshot.frameId,
    };
}
