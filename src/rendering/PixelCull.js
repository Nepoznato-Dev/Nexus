import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function PixelCull({
    children,
    className,
    style,
    placeholderHeight = 180,
    root = null,
    rootMargin = '0px',
    threshold = 0,
}) {
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [cachedHeight, setCachedHeight] = useState(placeholderHeight);

    const observerOptions = useMemo(() => ({ root, rootMargin, threshold }), [root, rootMargin, threshold]);

    useEffect(() => {
        if (!containerRef.current || typeof IntersectionObserver === 'undefined') return undefined;

        const node = containerRef.current;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            const pixelVisible = Boolean(entry?.isIntersecting)
                && (entry?.intersectionRect?.width || 0) > 0
                && (entry?.intersectionRect?.height || 0) > 0;
            setIsVisible(pixelVisible);

            if (pixelVisible && entry?.boundingClientRect?.height) {
                setCachedHeight(Math.max(1, entry.boundingClientRect.height));
            }
        }, observerOptions);

        observer.observe(node);

        return () => observer.disconnect();
    }, [observerOptions]);

    useEffect(() => {
        if (!isVisible || !containerRef.current || typeof ResizeObserver === 'undefined') return undefined;

        const resizeObserver = new ResizeObserver((entries) => {
            const nextHeight = entries?.[0]?.contentRect?.height;
            if (nextHeight) {
                setCachedHeight(Math.max(1, nextHeight));
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [isVisible]);

    return (
        <div ref={containerRef} className={className} style={style}>
            {isVisible
                ? children
                : <div style={{ minHeight: cachedHeight }} aria-hidden="true" />}
        </div>
    );
}
