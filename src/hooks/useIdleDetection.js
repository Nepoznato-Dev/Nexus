import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect when the user is idle (tab unfocused for extended period)
 * @param {number} idleTimeout - Time in milliseconds before considering user idle (default: 30000ms = 30s)
 * @param {boolean} lowEndMode - Whether low-end mode is active
 * @returns {{ isIdle: boolean, isInactive: boolean }}
 */
export function useIdleDetection(idleTimeout = 30000, lowEndMode = false) {
    const [isInactive, setIsInactive] = useState(false); // Tab unfocused
    const [isIdle, setIsIdle] = useState(false); // Inactive + timeout passed
    const [idleTimer, setIdleTimer] = useState(null);

    const handleVisibilityChange = useCallback(() => {
        const inactive = document.hidden || !document.hasFocus();
        setIsInactive(inactive);

        if (inactive) {
            // Start idle timer when tab becomes inactive
            const timer = setTimeout(() => {
                setIsIdle(true);
            }, idleTimeout);
            setIdleTimer(timer);
        } else {
            // Clear idle state when tab becomes active
            setIsIdle(false);
            setIdleTimer(prevTimer => {
                if (prevTimer) {
                    clearTimeout(prevTimer);
                }
                return null;
            });
        }
    }, [idleTimeout]);

    useEffect(() => {
        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
            if (idleTimer) {
                clearTimeout(idleTimer);
            }
        };
    }, [handleVisibilityChange]);

    return {
        isIdle,
        isInactive,
        idleFPS: lowEndMode ? 5 : 10
    };
}
