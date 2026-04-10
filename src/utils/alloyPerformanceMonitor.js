const MAX_FRAME_SAMPLES = 120;
const MAX_HEALTH_SAMPLES = 20;
const METRIC_REFRESH_MS = 2000;
const EVENT_LOOP_PULSE_MS = 500;

function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

class AlloyPerformanceMonitor {
    constructor() {
        this.started = false;
        this.frameSamples = [];
        this.longTaskSamples = [];
        this.lastFrameTime = 0;
        this.lastMetricRefresh = 0;
        this.currentFPS = 60;
        this.currentHeapUsedMB = 0;
        this.currentRTT = 0;
        this.longTaskCount = 0;
        this.eventLoopLagSamples = [];
        this.interactionLatencySamples = [];
        this.lastIntervalTick = 0;
        this.eventLoopIntervalId = null;
        this.interactionHandler = this.handleInteraction.bind(this);
        this.eventLoopPulse = this.measureEventLoopLag.bind(this);
        this.health = 'stable';
        this.healthHistory = [];
        this.lastUIPressure = 'stable';
        this.selfProtectionApplied = false;
        this.rafId = null;
        this.longTaskObserver = null;
        this.boundFrameLoop = this.frameLoop.bind(this);
        this.visibilityHandler = this.handleVisibilityChange.bind(this);
    }

    start() {
        if (this.started || typeof window === 'undefined') return;
        this.started = true;
        this.lastFrameTime = performance.now();
        this.lastMetricRefresh = this.lastFrameTime;
        this.lastIntervalTick = this.lastFrameTime;
        this.attachLongTaskObserver();
        this.attachInteractionTracking();
        document.addEventListener('visibilitychange', this.visibilityHandler);
        this.handleVisibilityChange();
    }

    stop() {
        if (!this.started || typeof window === 'undefined') return;
        this.started = false;
        document.removeEventListener('visibilitychange', this.visibilityHandler);
        this.stopFrameLoop();
        this.stopEventLoopPulse();
        if (this.longTaskObserver) {
            this.longTaskObserver.disconnect();
            this.longTaskObserver = null;
        }
        this.detachInteractionTracking();
    }

    attachLongTaskObserver() {
        if (typeof PerformanceObserver === 'undefined') return;
        try {
            this.longTaskObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries() || [];
                this.longTaskCount += entries.length;
            });
            this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
            this.longTaskObserver = null;
        }
    }

    attachInteractionTracking() {
        window.addEventListener('pointerdown', this.interactionHandler, true);
        window.addEventListener('keydown', this.interactionHandler, true);
        window.addEventListener('click', this.interactionHandler, true);
    }

    detachInteractionTracking() {
        window.removeEventListener('pointerdown', this.interactionHandler, true);
        window.removeEventListener('keydown', this.interactionHandler, true);
        window.removeEventListener('click', this.interactionHandler, true);
    }

    handleInteraction(event) {
        const now = performance.now();
        const eventTime = clampNumber(event?.timeStamp, now);
        const latency = Math.max(0, now - eventTime);
        this.interactionLatencySamples.push(latency);
        if (this.interactionLatencySamples.length > MAX_HEALTH_SAMPLES) {
            this.interactionLatencySamples.shift();
        }
    }

    measureEventLoopLag() {
        const now = performance.now();
        const elapsed = now - this.lastIntervalTick;
        const lag = Math.max(0, elapsed - EVENT_LOOP_PULSE_MS);
        this.eventLoopLagSamples.push(lag);
        if (this.eventLoopLagSamples.length > MAX_HEALTH_SAMPLES) {
            this.eventLoopLagSamples.shift();
        }
        this.lastIntervalTick = now;
    }

    startEventLoopPulse() {
        if (!this.started || this.eventLoopIntervalId) return;
        this.lastIntervalTick = performance.now();
        this.eventLoopIntervalId = window.setInterval(this.eventLoopPulse, EVENT_LOOP_PULSE_MS);
    }

    stopEventLoopPulse() {
        if (!this.eventLoopIntervalId) return;
        window.clearInterval(this.eventLoopIntervalId);
        this.eventLoopIntervalId = null;
    }

    startFrameLoop() {
        if (!this.started || this.rafId) return;
        this.lastFrameTime = performance.now();
        this.rafId = window.requestAnimationFrame(this.boundFrameLoop);
    }

    stopFrameLoop() {
        if (!this.rafId) return;
        window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }

    handleVisibilityChange() {
        if (!this.started || typeof document === 'undefined') return;
        const isVisible = document.visibilityState === 'visible';

        if (isVisible) {
            this.startEventLoopPulse();
            this.startFrameLoop();
            this.refreshSecondaryMetrics();
            return;
        }

        this.stopEventLoopPulse();
        this.stopFrameLoop();
    }

    frameLoop(now) {
        if (!this.started) return;
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            this.rafId = null;
            return;
        }

        const delta = now - this.lastFrameTime;
        if (delta > 0) {
            const fps = 1000 / delta;
            this.frameSamples.push(clampNumber(fps, 60));
            if (this.frameSamples.length > MAX_FRAME_SAMPLES) {
                this.frameSamples.shift();
            }
            this.currentFPS = Math.round(average(this.frameSamples));
        }
        this.lastFrameTime = now;

        if (now - this.lastMetricRefresh >= METRIC_REFRESH_MS) {
            this.refreshSecondaryMetrics();
            this.lastMetricRefresh = now;
        }

        this.rafId = window.requestAnimationFrame(this.boundFrameLoop);
    }

    refreshSecondaryMetrics() {
        const memory = performance?.memory || {};
        const connection = navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection || {};

        this.currentHeapUsedMB = Number((((memory.usedJSHeapSize || 0) / (1024 * 1024))).toFixed(1));
        this.currentRTT = clampNumber(connection.rtt, 0);
        this.longTaskSamples.push(this.longTaskCount);
        if (this.longTaskSamples.length > MAX_HEALTH_SAMPLES) {
            this.longTaskSamples.shift();
        }
        this.health = this.classifyHealth();
        const snapshot = this.getSnapshot();
        this.applySelfProtection(snapshot);
        this.healthHistory.push(this.health);
        if (this.healthHistory.length > MAX_HEALTH_SAMPLES) {
            this.healthHistory.shift();
        }
    }

    applySelfProtection(snapshot) {
        const uiPressure = snapshot.uiPressure || 'stable';
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.dataset.alloyUiPressure = uiPressure;
            root.classList.toggle('alloy-ui-pressure-strained', uiPressure === 'strained');
            root.classList.toggle('alloy-ui-pressure-degraded', uiPressure === 'degraded');
            root.classList.toggle('alloy-ui-pressure-critical', uiPressure === 'critical');
        }

        this.selfProtectionApplied = uiPressure !== 'stable';

        if (uiPressure !== this.lastUIPressure && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('alloy:ui-pressure', {
                detail: {
                    uiPressure,
                    previous: this.lastUIPressure,
                    snapshot,
                },
            }));
            this.lastUIPressure = uiPressure;
        }
    }

    classifyHealth() {
        const avgLongTasks = average(this.longTaskSamples);
        const avgEventLoopLag = average(this.eventLoopLagSamples);
        const avgInteractionLatency = average(this.interactionLatencySamples);
        if (this.currentFPS < 22 || avgLongTasks >= 30 || this.currentHeapUsedMB >= 1100 || this.currentRTT >= 900 || avgEventLoopLag >= 180 || avgInteractionLatency >= 220) {
            return 'critical';
        }
        if (this.currentFPS < 35 || avgLongTasks >= 12 || this.currentHeapUsedMB >= 800 || this.currentRTT >= 500 || avgEventLoopLag >= 90 || avgInteractionLatency >= 120) {
            return 'degraded';
        }
        if (this.currentFPS < 50 || avgLongTasks >= 5 || this.currentHeapUsedMB >= 500 || this.currentRTT >= 250 || avgEventLoopLag >= 40 || avgInteractionLatency >= 70) {
            return 'strained';
        }
        return 'stable';
    }

    classifyUIPressure(health, eventLoopLagMs, interactionLatencyMs) {
        if (health === 'critical' || eventLoopLagMs >= 180 || interactionLatencyMs >= 220) {
            return 'critical';
        }
        if (health === 'degraded' || eventLoopLagMs >= 90 || interactionLatencyMs >= 120) {
            return 'degraded';
        }
        if (health === 'strained' || eventLoopLagMs >= 40 || interactionLatencyMs >= 70) {
            return 'strained';
        }
        return 'stable';
    }

    getSnapshot() {
        const avgLongTasks = average(this.longTaskSamples);
        const eventLoopLagMs = Number(average(this.eventLoopLagSamples).toFixed(1));
        const interactionLatencyMs = Number(average(this.interactionLatencySamples).toFixed(1));
        const uiPressure = this.classifyUIPressure(this.health, eventLoopLagMs, interactionLatencyMs);

        return {
            fps: clampNumber(this.currentFPS, 60),
            fpsAverage: Number(average(this.frameSamples).toFixed(1)) || clampNumber(this.currentFPS, 60),
            longTaskCount: clampNumber(this.longTaskCount, 0),
            longTaskRate: Number(avgLongTasks.toFixed(1)),
            heapUsedMB: clampNumber(this.currentHeapUsedMB, 0),
            rttMs: clampNumber(this.currentRTT, 0),
            eventLoopLagMs,
            interactionLatencyMs,
            uiPressure,
            health: this.health,
            sampleWindowMs: METRIC_REFRESH_MS * MAX_HEALTH_SAMPLES,
        };
    }

    getCapabilitySignal() {
        const snapshot = this.getSnapshot();
        return {
            schemaVersion: 'alloy.capability.v1',
            source: 'browser-js',
            collectedAt: new Date().toISOString(),
            fps: snapshot.fps,
            longTaskCount: snapshot.longTaskCount,
            heapUsedMB: snapshot.heapUsedMB,
            rttMs: snapshot.rttMs,
            runtime: {
                performance: snapshot,
                ui: {
                    interactionLatencyMs: snapshot.interactionLatencyMs,
                    eventLoopLagMs: snapshot.eventLoopLagMs,
                    uiPressure: snapshot.uiPressure,
                },
                environment: {
                    hardwareConcurrency: navigator?.hardwareConcurrency || 4,
                    deviceMemory: navigator?.deviceMemory || 4,
                    userAgent: navigator?.userAgent || 'unknown',
                },
            },
            capabilities: {
                owner: 'javascript',
                collector: 'alloyPerformanceMonitor',
                canCollectRealtimeMetrics: true,
                canThrottleUIWork: true,
                shouldReportToAlloy: true,
                selfProtectionApplied: this.selfProtectionApplied,
            },
        };
    }
}

const alloyPerformanceMonitor = new AlloyPerformanceMonitor();

export function startAlloyPerformanceMonitor() {
    alloyPerformanceMonitor.start();
}

export function stopAlloyPerformanceMonitor() {
    alloyPerformanceMonitor.stop();
}

export function getAlloyPerformanceSnapshot() {
    return alloyPerformanceMonitor.getSnapshot();
}

export function getAlloyCapabilitySignal() {
    return alloyPerformanceMonitor.getCapabilitySignal();
}

export default alloyPerformanceMonitor;