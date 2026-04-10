/**
 * Window Memory Manager
 * Aggressively frees memory when windows are closed
 */
export class WindowMemoryManager {
    static windowResources = new Map();

    // Register resources for a window
    static registerWindow(windowId, resources = {}) {
        WindowMemoryManager.windowResources.set(windowId, {
            eventListeners: [],
            timers: [],
            intervals: [],
            observers: [],
            dataCache: {},
            createTime: Date.now(),
            ...resources
        });
    }

    // Register event listener for cleanup
    static registerEventListener(windowId, element, event, handler) {
        const window = WindowMemoryManager.windowResources.get(windowId);
        if (window) {
            element.addEventListener(event, handler);
            window.eventListeners.push({ element, event, handler });
        }
    }

    // Register timer for cleanup
    static registerTimer(windowId, timerId) {
        const window = WindowMemoryManager.windowResources.get(windowId);
        if (window) {
            window.timers.push(timerId);
        }
    }

    // Register interval for cleanup
    static registerInterval(windowId, intervalId) {
        const window = WindowMemoryManager.windowResources.get(windowId);
        if (window) {
            window.intervals.push(intervalId);
        }
    }

    // Register observer for cleanup
    static registerObserver(windowId, observer) {
        const window = WindowMemoryManager.windowResources.get(windowId);
        if (window) {
            window.observers.push(observer);
        }
    }

    // Cache data for window
    static cacheData(windowId, key, data) {
        const window = WindowMemoryManager.windowResources.get(windowId);
        if (window) {
            window.dataCache[key] = data;
        }
    }

    /**
     * Clean up window and free memory
     */
    static cleanupWindow(windowId) {
        const windowData = WindowMemoryManager.windowResources.get(windowId);
        if (!windowData) return;

        // Clear all event listeners
        windowData.eventListeners.forEach(({ element, event, handler }) => {
            try {
                element.removeEventListener(event, handler);
            } catch (e) { }
        });
        windowData.eventListeners = null;

        // Clear all timers
        windowData.timers.forEach(timerId => {
            try {
                clearTimeout(timerId);
            } catch (e) { }
        });
        windowData.timers = null;

        // Clear all intervals
        windowData.intervals.forEach(intervalId => {
            try {
                clearInterval(intervalId);
            } catch (e) { }
        });
        windowData.intervals = null;

        // Stop all observers
        windowData.observers.forEach(observer => {
            try {
                if (observer.disconnect) observer.disconnect();
                if (observer.unobserve) observer.unobserve();
            } catch (e) { }
        });
        windowData.observers = null;

        // Clear data cache
        windowData.dataCache = null;

        // Remove window data
        WindowMemoryManager.windowResources.delete(windowId);

        // Force garbage collection if available
        if (window.gc) {
            try {
                window.gc();
            } catch (e) { }
        }
    }

    // Clean up all windows
    static cleanupAllWindows() {
        WindowMemoryManager.windowResources.forEach((_, windowId) => {
            WindowMemoryManager.cleanupWindow(windowId);
        });
    }

    // Get memory stats
    static getStats() {
        const stats = {
            totalWindows: WindowMemoryManager.windowResources.size,
            totalEventListeners: 0,
            totalTimers: 0,
            totalIntervals: 0,
            totalObservers: 0
        };

        WindowMemoryManager.windowResources.forEach(window => {
            stats.totalEventListeners += window.eventListeners.length;
            stats.totalTimers += window.timers.length;
            stats.totalIntervals += window.intervals.length;
            stats.totalObservers += window.observers.length;
        });

        return stats;
    }
}
