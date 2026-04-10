import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WindowMemoryManager } from '../../utils/WindowMemoryManager';

const WindowManagerContext = createContext();

export const useWindowManager = () => {
    const context = useContext(WindowManagerContext);
    if (!context) {
        throw new Error('useWindowManager must be used within WindowManagerProvider');
    }
    return context;
};

export const WindowManagerProvider = ({ children }) => {
    const [windows, setWindows] = useState([]);
    const windowsRef = useRef([]);
    const zIndexCounterRef = useRef(99);

    useEffect(() => {
        windowsRef.current = windows;
    }, [windows]);

    const allocateZIndex = useCallback(() => {
        zIndexCounterRef.current += 1;
        return zIndexCounterRef.current;
    }, []);

    const bringToFront = useCallback((windowId) => {
        const nextZ = allocateZIndex();
        setWindows((prev) => {
            const target = prev.find((w) => w.id === windowId);
            if (!target) return prev;
            return prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZ } : w));
        });
    }, [allocateZIndex]);

    const openWindow = useCallback((config) => {
        const windowId = config.id || `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if window is already open
        const existingWindow = windowsRef.current.find((w) => w.id === windowId);
        if (existingWindow) {
            // Bring to front
            bringToFront(windowId);
            return windowId;
        }

        // Register window in memory manager
        WindowMemoryManager.registerWindow(windowId);

        const newWindow = {
            id: windowId,
            title: config.title || 'Untitled',
            component: config.component,
            icon: config.icon,
            x: config.x || 100,
            y: config.y || 100,
            width: config.width || 800,
            height: config.height || 600,
            minWidth: config.minWidth || 300,
            minHeight: config.minHeight || 200,
            zIndex: allocateZIndex(),
            minimized: false,
            maximized: false,
            alwaysOnTop: config.alwaysOnTop || false,
            resizable: config.resizable !== false,
            closable: config.closable !== false,
            customControls: config.customControls || null,
            onClose: config.onClose || null,
            renderPriority: config.renderPriority || 'normal',
            renderBudgetCost: config.renderBudgetCost || 1,
        };

        setWindows((prev) => [...prev, newWindow]);
        return windowId;
    }, [bringToFront, allocateZIndex]);

    const closeWindow = useCallback((windowId) => {
        // Get window before closing to access onClose callback
        const windowToClose = windowsRef.current.find((w) => w.id === windowId);
        const onClose = windowToClose?.onClose;

        // Sever heavy references ASAP so closed windows are GC-eligible immediately.
        if (windowToClose) {
            windowToClose.component = null;
            windowToClose.componentProps = null;
            windowToClose.customControls = null;
            windowToClose.onClose = null;
        }

        // Clean up memory for this window
        WindowMemoryManager.cleanupWindow(windowId);

        setWindows((prev) => prev.filter((w) => w.id !== windowId));

        // Call onClose callback if it exists
        if (typeof onClose === 'function') {
            onClose();
        }

        // Hint GC on the next idle slice for environments that expose it.
        if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(() => {
                if (typeof window.gc === 'function') {
                    try {
                        window.gc();
                    } catch (e) { }
                }
            }, { timeout: 250 });
        }
    }, []);

    const minimizeWindow = useCallback((windowId) => {
        setWindows((prev) => prev.map((w) =>
            w.id === windowId ? { ...w, minimized: true } : w,
        ));
    }, []);

    const restoreWindow = useCallback((windowId) => {
        setWindows((prev) => prev.map((w) =>
            w.id === windowId ? { ...w, minimized: false, maximized: false } : w,
        ));
        bringToFront(windowId);
    }, [bringToFront]);

    const maximizeWindow = useCallback((windowId) => {
        setWindows((prev) => prev.map((w) =>
            w.id === windowId ? { ...w, maximized: !w.maximized } : w,
        ));
    }, []);

    const updateWindowPosition = useCallback((windowId, x, y) => {
        setWindows(prev => prev.map(w =>
            w.id === windowId ? { ...w, x, y } : w
        ));
    }, []);

    const updateWindowSize = useCallback((windowId, width, height) => {
        setWindows(prev => prev.map(w =>
            w.id === windowId ? { ...w, width, height } : w
        ));
    }, []);

    const value = {
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        maximizeWindow,
        bringToFront,
        updateWindowPosition,
        updateWindowSize,
    };

    return (
        <WindowManagerContext.Provider value={value}>
            {children}
        </WindowManagerContext.Provider>
    );
};
