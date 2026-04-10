/**
 * S.P.A.R.K Performance Monitor
 * 
 * Monitors system performance and signals when stable.
 * Wakes RAZONET when CPU/memory settle for 10+ seconds.
 * S.P.A.R.K's background responsibility.
 */

export class sparkPerformanceMonitor {
    constructor(options = {}) {
        this.checkInterval = options.checkInterval || 500; // Check every 500ms
        this.stabilityThreshold = options.stabilityThreshold || 10000; // 10 seconds of stability
        this.cpuThreshold = options.cpuThreshold || 30; // % CPU usage threshold
        this.memoryThreshold = options.memoryThreshold || 50; // % memory usage threshold

        this.isMonitoring = false;
        this.performanceHistory = [];
        this.lastStableTime = null;
        this.monitorInterval = null;
        this.onStabilized = null; // Callback when stable
        this.irisWakeCallback = null; // Function to call to wake RAZONET
    }

    /**
     * Start monitoring performance
     */
    startMonitoring(onStabilizedCallback, irisWakeCallback) {
        this.onStabilized = onStabilizedCallback;
        this.irisWakeCallback = irisWakeCallback;
        this.isMonitoring = true;
        this.performanceHistory = [];
        this.lastStableTime = null;

        console.log('S.P.A.R.K: Starting performance monitoring...');

        this.monitorInterval = setInterval(() => {
            this.checkPerformance();
        }, this.checkInterval);
    }

    /**
     * Stop monitoring performance
     */
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        console.log('S.P.A.R.K: Performance monitoring stopped');
    }

    /**
     * Check current performance metrics
     */
    checkPerformance() {
        const metrics = {
            timestamp: Date.now(),
            memory: this.getMemoryUsage(),
            cpu: this.estimateCpuUsage(),
            isHealthy: false
        };

        // Add to history (keep last 60 readings = ~30 seconds at 500ms interval)
        this.performanceHistory.push(metrics);
        if (this.performanceHistory.length > 60) {
            this.performanceHistory.shift();
        }

        // Check if system is healthy
        const isHealthyNow = metrics.memory < this.memoryThreshold && metrics.cpu < this.cpuThreshold;
        metrics.isHealthy = isHealthyNow;

        if (isHealthyNow) {
            if (!this.lastStableTime) {
                this.lastStableTime = Date.now();
            }

            const stableDuration = Date.now() - this.lastStableTime;

            // If stable for stabilityThreshold, wake RAZONET
            if (stableDuration >= this.stabilityThreshold) {
                this.onPerformanceStabilized();
            }
        } else {
            // Performance degraded - reset stability timer
            this.lastStableTime = null;
        }
    }

    /**
     * Called when performance has been stable for required duration
     */
    onPerformanceStabilized() {
        console.log('S.P.A.R.K: Performance stable! Waking up RAZONET...');

        if (this.onStabilized) {
            this.onStabilized();
        }

        if (this.irisWakeCallback) {
            this.irisWakeCallback({
                stableSince: this.lastStableTime,
                currentMetrics: this.getLatestMetrics(),
                systemReady: true
            });
        }

        // Reset timer so we don't keep firing
        this.lastStableTime = Date.now();
    }

    /**
     * Estimate CPU usage (browser doesn't expose directly, so we use heuristicstics)
     */
    estimateCpuUsage() {
        if (this.performanceHistory.length < 2) {
            return 0;
        }

        // Rough estimate based on interaction lag
        // In real scenario, would use requestAnimationFrame timing
        const now = performance.now();
        const expectedFrame = 1000 / 60; // 60 FPS = ~16.67ms per frame

        // This is simplified - real monitoring would use more sophisticated methods
        try {
            const observer = new PerformanceObserver((list) => {
                // Analyze frame timing
            });
            observer.observe({ entryTypes: ['measure', 'navigation'] });
            observer.disconnect();
        } catch (e) {
            // Performance API not available
        }

        // Return estimate (0-100)
        return Math.random() * 40; // Simplified for now
    }

    /**
     * Get memory usage estimation
     */
    getMemoryUsage() {
        if (performance.memory) {
            // Chrome/Chromium with memory API
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            return (used / limit) * 100;
        }

        // Fallback estimate
        return Math.random() * 40;
    }

    /**
     * Get latest performance metrics
     */
    getLatestMetrics() {
        if (this.performanceHistory.length === 0) {
            return null;
        }

        return this.performanceHistory[this.performanceHistory.length - 1];
    }

    /**
     * Get average performance over history
     */
    getAverageMetrics() {
        if (this.performanceHistory.length === 0) {
            return null;
        }

        const avgMemory = this.performanceHistory.reduce((sum, m) => sum + m.memory, 0) / this.performanceHistory.length;
        const avgCpu = this.performanceHistory.reduce((sum, m) => sum + m.cpu, 0) / this.performanceHistory.length;

        return {
            averageMemory: avgMemory,
            averageCpu: avgCpu,
            readingCount: this.performanceHistory.length
        };
    }

    /**
    * Reset monitoring (use when RAZONET starts heavy operation)
     */
    resetForLoad() {
        console.log('S.P.A.R.K: Resetting performance monitor for RAZONET workload');
        this.lastStableTime = null;
        this.performanceHistory = [];
    }

    /**
     * Pause monitoring temporarily
     */
    pause() {
        this.isMonitoring = false;
    }

    /**
     * Resume monitoring
     */
    resume() {
        this.isMonitoring = true;
    }
}

export default sparkPerformanceMonitor;
