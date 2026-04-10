/**
 * FPS Throttler - Actually limits frame rate to target FPS
 * When targetFPS is 15, the app will run at 15 FPS, not just display 15 FPS
 */

class FPSThrottler {
    constructor() {
        this.targetFPS = 60;
        this.fpsCapEnabled = true;
        this.vsyncEnabled = true;
        this.isThrottling = false;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60;
        this.rafCallbacks = new Set();
        this.currentFPS = 60;
        this.frameTimes = [];
        this.originalRAF = null;
    }

    /**
     * Set target FPS and start throttling
     * @param {number} fps - Target frames per second (5-165)
     */
    setTargetFPS(fps) {
        const numericFPS = Number(fps);
        if (!Number.isFinite(numericFPS)) return;

        this.targetFPS = Math.max(5, Math.min(165, Math.round(numericFPS)));
        this.frameInterval = 1000 / this.targetFPS;

        if (!this.fpsCapEnabled) {
            return;
        }

        if (!this.isThrottling) {
            this.startThrottling();
        }
    }

    /**
     * Enable or disable FPS capping.
     * @param {boolean} enabled
     */
    setCapEnabled(enabled) {
        this.fpsCapEnabled = Boolean(enabled);

        if (this.fpsCapEnabled) {
            this.frameInterval = 1000 / this.targetFPS;
            this.startThrottling();
            return;
        }

        this.stopThrottling();
    }

    /**
     * Store v-sync preference. This does not force browser VSync behavior,
     * but keeps one source of truth for render policies.
     * @param {boolean} enabled
     */
    setVsyncEnabled(enabled) {
        this.vsyncEnabled = Boolean(enabled);
    }

    /**
     * Apply all FPS-related settings at once.
     */
    applySettings({ targetFPS, fpsCapEnabled, vsyncEnabled } = {}) {
        if (targetFPS !== undefined) {
            this.setTargetFPS(targetFPS);
        }
        if (fpsCapEnabled !== undefined) {
            this.setCapEnabled(fpsCapEnabled);
        }
        if (vsyncEnabled !== undefined) {
            this.setVsyncEnabled(vsyncEnabled);
        }
    }

    /**
     * Start intercepting requestAnimationFrame
     */
    startThrottling() {
        if (this.isThrottling) return;

        this.isThrottling = true;
        this.lastFrameTime = performance.now();

        // Store original RAF
        if (!this.originalRAF) {
            this.originalRAF = window.requestAnimationFrame.bind(window);
        }

        // Override requestAnimationFrame
        window.requestAnimationFrame = (callback) => {
            this.rafCallbacks.add(callback);
            return this.originalRAF(this.throttledLoop.bind(this));
        };

        // Start the throttled loop
        this.throttledLoop();
    }

    /**
     * Throttled animation frame loop
     */
    throttledLoop(timestamp = performance.now()) {
        if (!this.isThrottling) return;

        const elapsed = timestamp - this.lastFrameTime;

        // Only execute callbacks if enough time has passed
        if (elapsed >= this.frameInterval) {
            // Calculate actual FPS
            this.frameTimes.push(timestamp);
            if (this.frameTimes.length > 60) {
                this.frameTimes.shift();
            }
            if (this.frameTimes.length >= 2) {
                const totalTime = this.frameTimes[this.frameTimes.length - 1] - this.frameTimes[0];
                const avgFPS = (this.frameTimes.length - 1) / (totalTime / 1000);
                this.currentFPS = Math.round(avgFPS);
            }

            this.lastFrameTime = timestamp - (elapsed % this.frameInterval);

            // Execute all registered callbacks
            const callbacks = Array.from(this.rafCallbacks);
            this.rafCallbacks.clear();

            callbacks.forEach(callback => {
                try {
                    callback(timestamp);
                } catch (error) {
                    console.error('RAF callback error:', error);
                }
            });
        }

        // Continue loop
        this.originalRAF(this.throttledLoop.bind(this));
    }

    /**
     * Stop throttling and restore original RAF
     */
    stopThrottling() {
        if (!this.isThrottling) return;

        this.isThrottling = false;

        // Restore original RAF
        if (this.originalRAF) {
            window.requestAnimationFrame = this.originalRAF;
        }

        this.rafCallbacks.clear();
    }

    /**
     * Get current actual FPS
     */
    getCurrentFPS() {
        if (!this.fpsCapEnabled || !this.isThrottling) {
            // If not throttling, measure naturally
            if (window.fpsMonitor?.getCurrentFPS) {
                return window.fpsMonitor.getCurrentFPS();
            }
            return 60;
        }
        return Math.min(this.currentFPS, this.targetFPS);
    }

    /**
     * Get target FPS
     */
    getTargetFPS() {
        return this.targetFPS;
    }

    isCapEnabled() {
        return this.fpsCapEnabled;
    }

    isVsyncEnabled() {
        return this.vsyncEnabled;
    }
}

// Create singleton instance
const fpsThrottler = new FPSThrottler();

// Make it globally accessible for monitoring
if (typeof window !== 'undefined') {
    window.fpsThrottler = fpsThrottler;
}

export default fpsThrottler;
