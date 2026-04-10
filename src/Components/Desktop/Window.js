import React, { useRef, useEffect, useState, memo } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useWindowManager } from './WindowManager';

function WindowComponent({ window }) {
    const { closeWindow, minimizeWindow, maximizeWindow, bringToFront, updateWindowPosition, updateWindowSize } = useWindowManager();
    const windowRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Trigger animation on mount
    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseDown = (e) => {
        // Only prevent dragging if clicking directly on a button or control
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        bringToFront(window.id);
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - window.x,
            y: e.clientY - window.y,
        });
    };

    const handleResizeStart = (e) => {
        e.stopPropagation();
        bringToFront(window.id);
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: window.width,
            height: window.height,
        });
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const viewportWidth = windowRef.current?.parentElement?.clientWidth || globalThis.innerWidth || 0;
            const viewportHeight = windowRef.current?.parentElement?.clientHeight || globalThis.innerHeight || 0;
            const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, viewportWidth - 100));
            const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, viewportHeight - 100));
            updateWindowPosition(window.id, newX, newY);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, window.id, updateWindowPosition]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;
            const newWidth = Math.max(window.minWidth, resizeStart.width + deltaX);
            const newHeight = Math.max(window.minHeight, resizeStart.height + deltaY);
            updateWindowSize(window.id, newWidth, newHeight);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeStart, window.id, window.minWidth, window.minHeight, updateWindowSize]);

    // Return null only AFTER all hooks have been declared
    if (window.minimized) return null;

    const windowStyle = window.maximized
        ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 48px)' }
        : { left: window.x, top: window.y, width: window.width, height: window.height };

    return (
        <div
            ref={windowRef}
            className="desktop-window"
            style={{
                position: 'absolute',
                ...windowStyle,
                zIndex: window.zIndex,
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: window.maximized ? 0 : '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={() => bringToFront(window.id)}
        >
            {/* Title Bar */}
            <div
                className="window-titlebar"
                onMouseDown={handleMouseDown}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#252525',
                    borderBottom: '1px solid #333',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {window.icon && <span style={{ fontSize: '16px' }}>{window.icon}</span>}
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                        {window.title}
                    </span>
                </div>

                {/* Window Controls */}
                <div className="window-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Custom Controls (e.g., Fullscreen button for games) */}
                    {window.customControls && (
                        <div style={{ display: 'flex', gap: '8px', marginRight: '8px' }}>
                            {window.customControls}
                        </div>
                    )}

                    <button
                        onClick={() => minimizeWindow(window.id)}
                        style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#aaa',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <Minus size={16} />
                    </button>

                    {window.resizable && (
                        <button
                            onClick={() => maximizeWindow(window.id)}
                            style={{
                                padding: '4px 8px',
                                background: 'transparent',
                                border: 'none',
                                color: '#aaa',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            {window.maximized ? <Square size={16} /> : <Maximize2 size={16} />}
                        </button>
                    )}

                    {window.closable && (
                        <button
                            onClick={() => closeWindow(window.id)}
                            style={{
                                padding: '4px 8px',
                                background: 'transparent',
                                border: 'none',
                                color: '#aaa',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#e53e3e';
                                e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#aaa';
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Window Content */}
            <div
                className="window-content"
                style={{
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: 'transparent',
                }}
            >
                {typeof window.component === 'function'
                    ? React.createElement(window.component, {
                        windowId: window.id,
                        windowZIndex: window.zIndex,
                        ...(window.componentProps || {})
                    })
                    : React.isValidElement(window.component)
                        ? React.cloneElement(window.component, {
                            windowId: window.id,
                            windowZIndex: window.zIndex,
                            ...(window.componentProps || {})
                        })
                        : window.component}
            </div>

            {/* Resize Handle */}
            {window.resizable && !window.maximized && (
                <div
                    onMouseDown={handleResizeStart}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '16px',
                        height: '16px',
                        cursor: 'nwse-resize',
                        background: 'linear-gradient(135deg, transparent 50%, #444 50%)',
                    }}
                />
            )}
        </div>
    );
}

const Window = memo(WindowComponent, (prevProps, nextProps) => {
    // Window objects are immutable updates from WindowManager.
    // If the reference is unchanged, skip rerendering this window.
    return prevProps.window === nextProps.window;
});

Window.displayName = 'Window';

export default Window;
