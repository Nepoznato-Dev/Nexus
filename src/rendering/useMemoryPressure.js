import { useEffect, useMemo, useState } from 'react';

const PRESSURE_WEIGHT = {
    stable: 0,
    strained: 1,
    degraded: 2,
    critical: 3,
};

function readPressureFromDom() {
    if (typeof document === 'undefined') return 'stable';
    const pressure = document.documentElement?.dataset?.alloyUiPressure;
    if (pressure && PRESSURE_WEIGHT[pressure] !== undefined) {
        return pressure;
    }
    return 'stable';
}

function readFps() {
    if (typeof window === 'undefined') return 60;
    if (window.fpsThrottler?.getCurrentFPS) {
        return Number(window.fpsThrottler.getCurrentFPS()) || 60;
    }
    if (window.fpsMonitor?.getCurrentFPS) {
        return Number(window.fpsMonitor.getCurrentFPS()) || 60;
    }
    return 60;
}

const memoryPressureStore = {
    pressure: readPressureFromDom(),
    fps: readFps(),
    memoryPercent: 0,
    listeners: new Set(),
    intervalId: null,
    intervalMs: 1000,
    pressureListener: null,
    visibilityListener: null,
};

function resolveSampleIntervalMs() {
    if (typeof document === 'undefined') return 1000;
    return document.visibilityState === 'visible' ? 1000 : 5000;
}

function restartSampleInterval() {
    if (typeof window === 'undefined') return;
    const nextMs = resolveSampleIntervalMs();
    if (memoryPressureStore.intervalId !== null && memoryPressureStore.intervalMs === nextMs) {
        return;
    }

    if (memoryPressureStore.intervalId !== null) {
        window.clearInterval(memoryPressureStore.intervalId);
    }

    memoryPressureStore.intervalMs = nextMs;
    memoryPressureStore.intervalId = window.setInterval(sampleMemoryPressure, nextMs);
}

function emitMemoryPressureChange() {
    memoryPressureStore.listeners.forEach((listener) => {
        try {
            listener();
        } catch (err) {
            console.error('Memory pressure listener failed:', err);
        }
    });
}

function sampleMemoryPressure() {
    let changed = false;

    const nextPressure = readPressureFromDom();
    if (nextPressure !== memoryPressureStore.pressure) {
        memoryPressureStore.pressure = nextPressure;
        changed = true;
    }

    const nextFps = readFps();
    if (nextFps !== memoryPressureStore.fps) {
        memoryPressureStore.fps = nextFps;
        changed = true;
    }

    let nextMemoryPercent = 0;
    if (typeof performance !== 'undefined' && performance?.memory?.usedJSHeapSize && performance?.memory?.jsHeapSizeLimit) {
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        nextMemoryPercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
    }

    if (nextMemoryPercent !== memoryPressureStore.memoryPercent) {
        memoryPressureStore.memoryPercent = nextMemoryPercent;
        changed = true;
    }

    if (changed) {
        emitMemoryPressureChange();
    }
}

function startMemoryPressureStore() {
    if (typeof window === 'undefined') return;
    if (memoryPressureStore.intervalId !== null) return;

    memoryPressureStore.pressureListener = (event) => {
        const next = event?.detail?.uiPressure;
        if (next && PRESSURE_WEIGHT[next] !== undefined && next !== memoryPressureStore.pressure) {
            memoryPressureStore.pressure = next;
            emitMemoryPressureChange();
            return;
        }
        sampleMemoryPressure();
    };

    memoryPressureStore.visibilityListener = () => {
        restartSampleInterval();
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
            sampleMemoryPressure();
        }
    };

    restartSampleInterval();
    window.addEventListener('alloy:ui-pressure', memoryPressureStore.pressureListener);
    document.addEventListener('visibilitychange', memoryPressureStore.visibilityListener);
    sampleMemoryPressure();
}

function stopMemoryPressureStoreIfIdle() {
    if (typeof window === 'undefined') return;
    if (memoryPressureStore.listeners.size > 0) return;

    if (memoryPressureStore.intervalId !== null) {
        window.clearInterval(memoryPressureStore.intervalId);
        memoryPressureStore.intervalId = null;
    }

    if (memoryPressureStore.pressureListener) {
        window.removeEventListener('alloy:ui-pressure', memoryPressureStore.pressureListener);
        memoryPressureStore.pressureListener = null;
    }

    if (memoryPressureStore.visibilityListener) {
        document.removeEventListener('visibilitychange', memoryPressureStore.visibilityListener);
        memoryPressureStore.visibilityListener = null;
    }
}

function subscribeMemoryPressure(listener) {
    memoryPressureStore.listeners.add(listener);
    startMemoryPressureStore();

    return () => {
        memoryPressureStore.listeners.delete(listener);
        stopMemoryPressureStoreIfIdle();
    };
}

export default function useMemoryPressure() {
    const [pressure, setPressure] = useState(memoryPressureStore.pressure);
    const [fps, setFps] = useState(memoryPressureStore.fps);
    const [memoryPercent, setMemoryPercent] = useState(memoryPressureStore.memoryPercent);

    useEffect(() => {
        return subscribeMemoryPressure(() => {
            setPressure(memoryPressureStore.pressure);
            setFps(memoryPressureStore.fps);
            setMemoryPercent(memoryPressureStore.memoryPercent);
        });
    }, []);

    return useMemo(() => {
        const weight = PRESSURE_WEIGHT[pressure] ?? PRESSURE_WEIGHT.stable;
        const memoryIsHigh = memoryPercent >= 80;
        const fpsIsLow = fps < 45;
        const fpsIsVeryLow = fps < 35;

        return {
            level: pressure,
            fps,
            memoryPercent,
            shouldConserve: weight >= PRESSURE_WEIGHT.strained || memoryIsHigh || fpsIsLow,
            shouldSuspendBackgroundGames: weight >= PRESSURE_WEIGHT.degraded || memoryIsHigh || fpsIsVeryLow,
            shouldReduceAnimations: weight >= PRESSURE_WEIGHT.strained || fpsIsLow,
            shouldDropVisualEffects: weight >= PRESSURE_WEIGHT.degraded || memoryIsHigh,
        };
    }, [pressure, fps, memoryPercent]);
}
