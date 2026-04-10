import React, { useState, useEffect, useRef } from 'react';
import './MouseOverlay.css';

/**
 * System Loading Indicator
 * 
 * Shows a spinning swirl near the cursor when system operations are in progress.
 * 
 * Usage Examples:
 * 
 * // Show loading indicator
 * window.setSystemLoading(true);
 * 
 * // Hide loading indicator
 * window.setSystemLoading(false);
 * 
 * // You can also import the function
 * import { setSystemLoading } from './MouseOverlay';
 * setSystemLoading(true);
 */

// Global loading state manager
let loadingState = {
    isLoading: false,
    listeners: []
};

export const setSystemLoading = (loading) => {
    loadingState.isLoading = loading;
    loadingState.listeners.forEach(listener => listener(loading));
};

// Expose to window for easy access
if (typeof window !== 'undefined') {
    window.setSystemLoading = setSystemLoading;
}

export const MouseOverlay = () => {
    const [isLoading, setIsLoading] = useState(false);
    const indicatorRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (indicatorRef.current) {
                indicatorRef.current.style.transform = `translate3d(${e.clientX + 12}px, ${e.clientY - 12}px, 0)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        // Subscribe to loading state changes
        const listener = (loading) => {
            setIsLoading(loading);
        };

        loadingState.listeners.push(listener);

        return () => {
            loadingState.listeners = loadingState.listeners.filter(l => l !== listener);
        };
    }, []);

    return (
        <div className="mouse-overlay-container">
            {/* Loading Indicator - only shows when system is loading */}
            {isLoading && (
                <div
                    ref={indicatorRef}
                    className="system-loading-indicator"
                >
                    {/* Spinning swirl */}
                    <div className="loading-swirl">
                        <div className="swirl-ring"></div>
                        <div className="swirl-inner"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
