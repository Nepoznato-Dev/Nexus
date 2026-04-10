import { useEffect, useRef, useCallback } from 'react';

/**
 * Memory Manager Hook - Aggressively frees memory when not needed
 * Tracks memory usage and forces cleanup on component unmount
 */
export function useMemoryManager(componentName = 'Unknown') {
    const memorySnapshot = useRef(null);
    const cleanupFunctions = useRef([]);

    // Register cleanup function to be called on unmount
    const registerCleanup = useCallback((cleanupFn) => {
        if (typeof cleanupFn === 'function') {
            cleanupFunctions.current.push(cleanupFn);
        }
    }, []);

    // Force garbage collection (if available)
    const forceGarbageCollection = useCallback(() => {
        if (window.gc) {
            try {
                window.gc();
            } catch (e) {
                console.warn('Garbage collection not available');
            }
        }
    }, []);

    // Clear all cached data
    const clearCaches = useCallback(() => {
        // Clear performance data
        if (window.performance && window.performance.clearMarks) {
            try {
                window.performance.clearMarks();
                window.performance.clearMeasures();
            } catch (e) { }
        }

        // Clear local/session storage if not needed
        try {
            const keysToKeep = ['user_data', 'settings', 'desktop_items', 'mods'];
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) { }

        // Clear unused image/resource caches
        try {
            const images = document.querySelectorAll('img[data-cached="true"]');
            images.forEach(img => {
                img.src = '';
                img.srcset = '';
            });
        } catch (e) { }
    }, []);

    // Get current memory usage
    const getMemoryUsage = useCallback(() => {
        if (performance.memory) {
            return {
                usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
                heapUsagePercent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1) + '%'
            };
        }
        return null;
    }, []);

    // Log memory on demand
    const logMemory = useCallback(() => {
        const memory = getMemoryUsage();
        if (memory) {
            console.log(`[Memory ${componentName}]`, memory);
        }
    }, [componentName, getMemoryUsage]);

    // Aggressive cleanup on unmount
    useEffect(() => {
        return () => {
            // Execute all registered cleanup functions
            cleanupFunctions.current.forEach(fn => {
                try {
                    fn();
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
            });

            // Clear the cleanup array
            cleanupFunctions.current = [];

            // Force immediate memory cleanup
            clearCaches();
            forceGarbageCollection();

            // Log final memory usage
            logMemory();
        };
    }, [clearCaches, forceGarbageCollection, logMemory]);

    return {
        registerCleanup,
        forceGarbageCollection,
        clearCaches,
        getMemoryUsage,
        logMemory
    };
}
