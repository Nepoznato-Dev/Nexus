const PRIORITY_WEIGHT = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
    background: 4,
};

const PRESSURE_WEIGHT = {
    stable: 0,
    strained: 1,
    degraded: 2,
    critical: 3,
};

const PRESSURE_CONFIG = {
    stable: {
        frameBudgetMs: 12,
        allowedPriority: 'background',
        cadence: {
            critical: 1,
            high: 1,
            normal: 1,
            low: 1,
            background: 1,
        },
    },
    strained: {
        frameBudgetMs: 9,
        allowedPriority: 'low',
        cadence: {
            critical: 1,
            high: 1,
            normal: 1,
            low: 2,
            background: 3,
        },
    },
    degraded: {
        frameBudgetMs: 6,
        allowedPriority: 'normal',
        cadence: {
            critical: 1,
            high: 1,
            normal: 2,
            low: 4,
            background: Number.POSITIVE_INFINITY,
        },
    },
    critical: {
        frameBudgetMs: 3.5,
        allowedPriority: 'high',
        cadence: {
            critical: 1,
            high: 2,
            normal: 6,
            low: Number.POSITIVE_INFINITY,
            background: Number.POSITIVE_INFINITY,
        },
    },
};

const HYSTERESIS_CONFIG = {
    escalationDwellMs: 140,
    recoveryDwellMs: 950,
    holdByPressureMs: {
        stable: 0,
        strained: 700,
        degraded: 1200,
        critical: 1800,
    },
};

const FPS_SMOOTHING_CONFIG = {
    historySize: 120,
    minSamples: 20,
    escalationPercentile: 0.2,
    recoveryPercentile: 0.65,
};

function normalizePriority(priority) {
    return PRIORITY_WEIGHT[priority] !== undefined ? priority : 'normal';
}

function normalizePressure(pressure) {
    return PRESSURE_CONFIG[pressure] ? pressure : 'stable';
}

function mapFpsToPressure(fps) {
    if (!Number.isFinite(fps)) return 'stable';
    if (fps < 24) return 'critical';
    if (fps < 35) return 'degraded';
    if (fps < 50) return 'strained';
    return 'stable';
}

function pressureFromWeight(weight) {
    if (weight >= PRESSURE_WEIGHT.critical) return 'critical';
    if (weight >= PRESSURE_WEIGHT.degraded) return 'degraded';
    if (weight >= PRESSURE_WEIGHT.strained) return 'strained';
    return 'stable';
}

export class RenderManager {
    constructor() {
        this.frameId = 0;
        this.uiPressure = 'stable';
        this.bootPhase = 'skeleton';
        this.targetFPS = 60;
        this.lastFrameAt = 0;
        this.avgFrameDelta = 1000 / 60;
        this.fpsHistory = [];
        this.subscribers = new Set();
        this.frameSubscribers = new Set();
        this.renderRegistry = new Map();
        this.effectivePressure = 'stable';
        this.lastPressureChangeAt = 0;
        this.escalationCandidate = null;
        this.escalationCandidateSince = 0;
        this.recoveryCandidate = null;
        this.recoveryCandidateSince = 0;
        this.cachedFpsP20 = null;
        this.cachedFpsP65 = null;
        this.lastPercentileUpdateFrame = 0;
        this.stats = {
            lastFrameAllowed: 0,
            lastFrameSkipped: 0,
            totalAllowed: 0,
            totalSkipped: 0,
        };
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    subscribeFrame(callback) {
        this.frameSubscribers.add(callback);
        return () => this.frameSubscribers.delete(callback);
    }

    notify() {
        const snapshot = this.getSnapshot();
        this.subscribers.forEach((callback) => {
            try {
                callback(snapshot);
            } catch (error) {
                console.error('[RenderManager] subscriber error', error);
            }
        });
    }

    setTargetFPS(targetFPS) {
        if (!Number.isFinite(targetFPS) || targetFPS <= 0) return;
        this.targetFPS = targetFPS;
    }

    setBootPhase(phase) {
        const next = phase === 'interactive' ? 'interactive' : 'skeleton';
        if (next === this.bootPhase) return;
        this.bootPhase = next;
        this.notify();
    }

    updatePressure(pressure) {
        const nextPressure = normalizePressure(pressure);
        if (nextPressure === this.uiPressure) return;
        this.uiPressure = nextPressure;
        this.notify();
    }

    register(id, options = {}) {
        const priority = normalizePriority(options.priority);
        const budgetCost = Math.max(1, Number(options.budgetCost) || 1);
        const metadata = {
            id,
            priority,
            budgetCost,
            lastRenderedFrame: -1,
            blockedFrames: 0,
            droppedFrames: 0,
        };
        this.renderRegistry.set(id, metadata);
        this.notify();
        return metadata;
    }

    unregister(id) {
        this.renderRegistry.delete(id);
        this.notify();
    }

    nextFrame(now = performance.now()) {
        if (this.lastFrameAt > 0) {
            const delta = now - this.lastFrameAt;
            if (delta > 0 && Number.isFinite(delta)) {
                // Exponential moving average for stability.
                this.avgFrameDelta = (this.avgFrameDelta * 0.85) + (delta * 0.15);

                const fpsSample = 1000 / delta;
                if (Number.isFinite(fpsSample) && fpsSample > 0) {
                    this.fpsHistory.push(fpsSample);
                    if (this.fpsHistory.length > FPS_SMOOTHING_CONFIG.historySize) {
                        this.fpsHistory.shift();
                    }
                }
            }
        }
        this.lastFrameAt = now;
        this.frameId += 1;
        this.refreshCachedPercentiles();
        this.stats.lastFrameAllowed = 0;
        this.stats.lastFrameSkipped = 0;

        this.frameSubscribers.forEach((callback) => {
            try {
                callback(this.frameId);
            } catch (error) {
                console.error('[RenderManager] frame subscriber error', error);
            }
        });
    }

    shouldRender(id, options = {}) {
        const priority = normalizePriority(options.priority);
        const budgetCost = Math.max(1, Number(options.budgetCost) || 1);
        const layer = options.layer || 'content';
        const entry = this.renderRegistry.get(id) || this.register(id, { priority, budgetCost });

        // Refresh mutable configuration if caller changed it.
        entry.priority = priority;
        entry.budgetCost = budgetCost;

        if (this.bootPhase === 'skeleton' && layer === 'content') {
            entry.blockedFrames += 1;
            entry.droppedFrames += 1;
            this.stats.lastFrameSkipped += 1;
            this.stats.totalSkipped += 1;
            return false;
        }

        const pressure = this.resolveEffectivePressure();
        const config = PRESSURE_CONFIG[pressure];
        const cadence = config.cadence[priority] ?? 1;
        const maxPriority = config.allowedPriority;
        const hardBlocked = PRIORITY_WEIGHT[priority] > PRIORITY_WEIGHT[maxPriority] && cadence === Number.POSITIVE_INFINITY;

        if (hardBlocked) {
            entry.blockedFrames += 1;
            entry.droppedFrames += 1;
            this.stats.lastFrameSkipped += 1;
            this.stats.totalSkipped += 1;
            return false;
        }

        const isCadenceFrame = cadence <= 1 || (this.frameId % cadence === 0);
        const frameBudgetMs = config.frameBudgetMs;
        const normalizedBudgetUse = budgetCost / frameBudgetMs;
        const budgetPressure = normalizedBudgetUse > 1 && priority !== 'critical';

        if (!isCadenceFrame || budgetPressure) {
            entry.blockedFrames += 1;
            entry.droppedFrames += 1;
            this.stats.lastFrameSkipped += 1;
            this.stats.totalSkipped += 1;
            return false;
        }

        entry.lastRenderedFrame = this.frameId;
        entry.blockedFrames = 0;
        this.stats.lastFrameAllowed += 1;
        this.stats.totalAllowed += 1;
        return true;
    }

    computeFpsPercentile(percentile, sortedSamples) {
        if (this.fpsHistory.length < FPS_SMOOTHING_CONFIG.minSamples) {
            return null;
        }

        const p = Number.isFinite(percentile)
            ? Math.max(0, Math.min(1, percentile))
            : 0;
        const index = Math.floor((sortedSamples.length - 1) * p);
        return sortedSamples[index];
    }

    refreshCachedPercentiles(force = false) {
        if (!force && (this.frameId - this.lastPercentileUpdateFrame) < 6) {
            return;
        }

        if (this.fpsHistory.length < FPS_SMOOTHING_CONFIG.minSamples) {
            this.cachedFpsP20 = null;
            this.cachedFpsP65 = null;
            this.lastPercentileUpdateFrame = this.frameId;
            return;
        }

        const sorted = [...this.fpsHistory].sort((a, b) => a - b);
        this.cachedFpsP20 = this.computeFpsPercentile(FPS_SMOOTHING_CONFIG.escalationPercentile, sorted);
        this.cachedFpsP65 = this.computeFpsPercentile(FPS_SMOOTHING_CONFIG.recoveryPercentile, sorted);
        this.lastPercentileUpdateFrame = this.frameId;
    }

    resolveEffectivePressure(now = performance.now()) {
        const fps = this.avgFrameDelta > 0 ? (1000 / this.avgFrameDelta) : this.targetFPS;
        const escalationFps = Number.isFinite(this.cachedFpsP20) ? Math.min(fps, this.cachedFpsP20) : fps;
        const recoveryFps = Number.isFinite(this.cachedFpsP65) ? Math.max(fps, this.cachedFpsP65) : fps;

        const currentWeight = PRESSURE_WEIGHT[this.uiPressure] ?? PRESSURE_WEIGHT.stable;
        const escalationWeight = Math.max(
            currentWeight,
            PRESSURE_WEIGHT[mapFpsToPressure(escalationFps)] ?? PRESSURE_WEIGHT.stable,
        );
        const recoveryWeight = Math.max(
            currentWeight,
            PRESSURE_WEIGHT[mapFpsToPressure(recoveryFps)] ?? PRESSURE_WEIGHT.stable,
        );

        const desiredEscalationPressure = pressureFromWeight(escalationWeight);
        const desiredRecoveryPressure = pressureFromWeight(recoveryWeight);
        const effectiveWeight = PRESSURE_WEIGHT[this.effectivePressure] ?? PRESSURE_WEIGHT.stable;

        // Escalate quickly, but not instantly, to avoid one-frame spikes causing churn.
        if (escalationWeight > effectiveWeight) {
            if (this.escalationCandidate !== desiredEscalationPressure) {
                this.escalationCandidate = desiredEscalationPressure;
                this.escalationCandidateSince = now;
            }

            this.recoveryCandidate = null;
            this.recoveryCandidateSince = 0;

            if ((now - this.escalationCandidateSince) >= HYSTERESIS_CONFIG.escalationDwellMs) {
                this.effectivePressure = pressureFromWeight(effectiveWeight + 1);
                this.lastPressureChangeAt = now;
                this.escalationCandidate = null;
                this.escalationCandidateSince = 0;
            }

            return this.effectivePressure;
        }

        this.escalationCandidate = null;
        this.escalationCandidateSince = 0;

        if (recoveryWeight < effectiveWeight) {
            const holdMs = HYSTERESIS_CONFIG.holdByPressureMs[this.effectivePressure] || 0;
            const holdSatisfied = (now - this.lastPressureChangeAt) >= holdMs;

            if (!holdSatisfied) {
                this.recoveryCandidate = null;
                this.recoveryCandidateSince = 0;
                return this.effectivePressure;
            }

            if (this.recoveryCandidate !== desiredRecoveryPressure) {
                this.recoveryCandidate = desiredRecoveryPressure;
                this.recoveryCandidateSince = now;
            }

            if ((now - this.recoveryCandidateSince) >= HYSTERESIS_CONFIG.recoveryDwellMs) {
                this.effectivePressure = pressureFromWeight(effectiveWeight - 1);
                this.lastPressureChangeAt = now;
                this.recoveryCandidate = null;
                this.recoveryCandidateSince = 0;
            }

            return this.effectivePressure;
        }

        this.recoveryCandidate = null;
        this.recoveryCandidateSince = 0;
        return this.effectivePressure;
    }

    getSnapshot() {
        const effectivePressure = this.resolveEffectivePressure();
        const fps = this.avgFrameDelta > 0 ? Number((1000 / this.avgFrameDelta).toFixed(1)) : this.targetFPS;

        return {
            frameId: this.frameId,
            uiPressure: this.uiPressure,
            effectivePressure,
            bootPhase: this.bootPhase,
            targetFPS: this.targetFPS,
            fps,
            fpsP20: Number.isFinite(this.cachedFpsP20) ? Number(this.cachedFpsP20.toFixed(1)) : null,
            fpsP65: Number.isFinite(this.cachedFpsP65) ? Number(this.cachedFpsP65.toFixed(1)) : null,
            stats: { ...this.stats },
            activeEntries: this.renderRegistry.size,
        };
    }
}

const renderManager = new RenderManager();

export default renderManager;
