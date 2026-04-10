/**
 * Centralized Performance Monitor Hook
 * Single source of truth for all performance metrics across the application
 * All components should use this hook instead of calculating metrics independently
 * 
 * Available Metrics:
 * - fps: Current frames per second
 * - cpu: CPU usage percentage (estimated)
 * - gpu: GPU usage percentage (estimated)
 * - ram: { used: MB, limit: MB, percentage: % }
 * - processes: Number of active processes
 * - battery: { level: %, charging: boolean, chargingTime: seconds, dischargingTime: seconds }
 * - network: { type: string, effectiveType: string, downlink: Mbps, rtt: ms, saveData: boolean }
 * - storage: { used: MB, quota: MB, percentage: % }
 * - hardware: { cores: number, deviceMemory: GB }
 */

import { useState, useEffect, useRef } from 'react';
import performanceManager from '../Components/A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisPerformanceManager.js';

// Global state to ensure all components see the same metrics
let globalMetrics = {
    fps: 60,
    cpu: 0,
    gpu: 0,
    ram: {
        used: 0,
        limit: 1024,
        percentage: 0,
        jsHeapUsed: 0,
        jsHeapLimit: 0,
        jsHeapHeadroom: 0,
        estimatedOverhead: 0,
        estimatedTotal: 0,
        confidence: 'low',
    },
    processes: 0,
    battery: {
        level: 100,
        charging: false,
        chargingTime: Infinity,
        dischargingTime: Infinity
    },
    network: {
        type: 'unknown',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
    },
    storage: {
        used: 0,
        quota: 0,
        percentage: 0
    },
    hardware: {
        cores: navigator.hardwareConcurrency || 4,
        deviceMemory: navigator.deviceMemory || 4
    },
    lastUpdate: Date.now()
};

let globalListeners = new Set();

// Update metrics at a fixed interval
let metricsInterval = null;
let batteryManager = null;
let metricsTickCount = 0;

// Battery API
const initBattery = async () => {
    if (!batteryManager && 'getBattery' in navigator) {
        try {
            batteryManager = await navigator.getBattery();
        } catch (err) {
            console.warn('[Performance Monitor] Battery API not available:', err);
        }
    }
};

// Get battery metrics
const getBatteryMetrics = () => {
    if (batteryManager) {
        return {
            level: Math.round(batteryManager.level * 100),
            charging: batteryManager.charging,
            chargingTime: batteryManager.chargingTime,
            dischargingTime: batteryManager.dischargingTime
        };
    }
    return globalMetrics.battery;
};

// Get network metrics
const getNetworkMetrics = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        return {
            type: conn.type || 'unknown',
            effectiveType: conn.effectiveType || '4g',
            downlink: conn.downlink || 10,
            rtt: conn.rtt || 50,
            saveData: conn.saveData || false
        };
    }
    return globalMetrics.network;
};

// Get storage metrics
const getStorageMetrics = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            const used = estimate.usage || 0;
            const quota = estimate.quota || 0;
            return {
                used: Math.round(used / 1024 / 1024), // MB
                quota: Math.round(quota / 1024 / 1024), // MB
                percentage: quota > 0 ? Math.round((used / quota) * 100) : 0
            };
        } catch (err) {
            console.warn('[Performance Monitor] Storage API error:', err);
        }
    }
    return globalMetrics.storage;
};

const startGlobalMonitoring = () => {
    if (metricsInterval) return;

    // Initialize battery API
    initBattery();

    // Start IRIS performance manager
    performanceManager.startMonitoring();

    // Update metrics every second
    metricsInterval = setInterval(async () => {
        try {
            metricsTickCount += 1;
            const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';

            // Hidden tabs get a lower update cadence to reduce idle churn.
            if (!isVisible && metricsTickCount % 5 !== 0) {
                return;
            }

            const taskData = performanceManager.getTaskManagerData();
            const perf = taskData?.performance;

            // FPS - try multiple sources
            let fps = 60;
            if (window.fpsThrottler?.getCurrentFPS) {
                fps = window.fpsThrottler.getCurrentFPS();
            } else if (window.fpsMonitor?.getCurrentFPS) {
                fps = window.fpsMonitor.getCurrentFPS();
            } else if (perf?.gpu?.fps) {
                fps = perf.gpu.fps;
            } else {
                fps = performanceManager.getCurrentFPS();
            }

            // CPU Usage
            const cpuUsage = perf?.cpu?.estimated ?? 0;

            // GPU Usage - infer from FPS
            let gpuEstimated = 25; // Default low
            if (fps < 30) {
                gpuEstimated = 85; // High load
            } else if (fps < 50) {
                gpuEstimated = 50; // Moderate load
            }
            if (perf?.gpu?.estimated === 'high') gpuEstimated = 85;
            else if (perf?.gpu?.estimated === 'medium') gpuEstimated = 50;

            // RAM Usage
            const ramUsedMB = perf?.ram?.used ? Math.round(perf.ram.used / 1024 / 1024) : 0;
            const ramLimitMB = perf?.ram?.limit ? Math.round(perf.ram.limit / 1024 / 1024) : 1024;
            const hasPerformanceMemory = typeof performance !== 'undefined' && Boolean(performance.memory);
            const jsHeapUsedMB = hasPerformanceMemory ? Math.round((performance.memory.usedJSHeapSize || 0) / 1024 / 1024) : 0;
            const jsHeapLimitMB = hasPerformanceMemory ? Math.round((performance.memory.jsHeapSizeLimit || 0) / 1024 / 1024) : 0;
            const measuredUsedMB = jsHeapUsedMB || ramUsedMB;
            const measuredLimitMB = jsHeapLimitMB || ramLimitMB;
            const jsHeapHeadroomMB = Math.max(0, measuredLimitMB - measuredUsedMB);

            const iframeCount = typeof document !== 'undefined' ? document.querySelectorAll('iframe').length : 0;
            const canvasCount = typeof document !== 'undefined' ? document.querySelectorAll('canvas').length : 0;
            const mediaCount = typeof document !== 'undefined' ? document.querySelectorAll('video, audio').length : 0;
            const processCount = taskData?.processes?.length ?? 0;
            const estimatedOverheadMB = Math.max(
                0,
                Math.round((processCount * 8) + (iframeCount * 20) + (canvasCount * 12) + (mediaCount * 10)),
            );
            const estimatedTotalMB = Math.max(measuredUsedMB, measuredUsedMB + estimatedOverheadMB);
            const ramPercentage = measuredLimitMB > 0 ? Math.round((estimatedTotalMB / measuredLimitMB) * 100) : 0;
            const confidence = hasPerformanceMemory ? 'high' : (perf?.ram?.used ? 'medium' : 'low');

            // Process count
            const processes = taskData?.processes?.length ?? 0;

            // Battery metrics
            const battery = getBatteryMetrics();

            // Network metrics
            const network = getNetworkMetrics();

            // Storage metrics are expensive; sample less frequently and reuse cached values between samples.
            const shouldSampleStorage = metricsTickCount % 10 === 0 || !globalMetrics.storage?.quota;
            const storage = shouldSampleStorage ? await getStorageMetrics() : globalMetrics.storage;

            // Update global metrics
            globalMetrics = {
                fps: Math.round(fps),
                cpu: Math.round(cpuUsage),
                gpu: Math.round(gpuEstimated),
                ram: {
                    used: measuredUsedMB,
                    limit: measuredLimitMB,
                    percentage: ramPercentage,
                    jsHeapUsed: jsHeapUsedMB,
                    jsHeapLimit: jsHeapLimitMB,
                    jsHeapHeadroom: jsHeapHeadroomMB,
                    estimatedOverhead: estimatedOverheadMB,
                    estimatedTotal: estimatedTotalMB,
                    confidence,
                },
                processes,
                battery,
                network,
                storage,
                hardware: {
                    cores: navigator.hardwareConcurrency || 4,
                    deviceMemory: navigator.deviceMemory || 4
                },
                lastUpdate: Date.now()
            };

            // Notify all listeners
            globalListeners.forEach(listener => {
                try {
                    listener(globalMetrics);
                } catch (err) {
                    console.error('Performance listener error:', err);
                }
            });

        } catch (error) {
            console.error('[Performance Monitor] Update error:', error);
        }
    }, 1000); // Update every second
};

const stopGlobalMonitoring = () => {
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
    }
    metricsTickCount = 0;
};

/**
 * Hook to access centralized performance metrics
 * @returns {Object} Performance metrics: { fps, cpu, gpu, ram, processes }
 */
export function usePerformanceMonitor() {
    const [metrics, setMetrics] = useState(globalMetrics);
    const listenerRef = useRef(null);

    useEffect(() => {
        // Start monitoring if not already started
        startGlobalMonitoring();

        // Subscribe to updates
        const listener = (newMetrics) => {
            setMetrics(newMetrics);
        };
        listenerRef.current = listener;
        globalListeners.add(listener);

        // Set initial state
        setMetrics(globalMetrics);

        return () => {
            // Unsubscribe
            if (listenerRef.current) {
                globalListeners.delete(listenerRef.current);
            }

            // Stop monitoring if no more listeners
            if (globalListeners.size === 0) {
                stopGlobalMonitoring();
            }
        };
    }, []);

    return metrics;
}

/**
 * Get current metrics without subscribing to updates
 * Useful for one-time reads
 */
export function getPerformanceMetrics() {
    return { ...globalMetrics };
}

/**
 * Export for direct access if needed
 */
export { performanceManager };
