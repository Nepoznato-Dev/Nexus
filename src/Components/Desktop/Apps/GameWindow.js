import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useWindowManager } from '../WindowManager';
import useMemoryPressure from '../../../rendering/useMemoryPressure';

const GameWindow = forwardRef(({ game, windowId, windowZIndex }, ref) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [gameLoading, setGameLoading] = useState(true);
    const [gameLoadProgress, setGameLoadProgress] = useState(5);
    const [loadError, setLoadError] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isFocused, setIsFocused] = useState(true);
    const [isBackgroundSuspended, setIsBackgroundSuspended] = useState(false);
    const [iframeMountKey, setIframeMountKey] = useState(0);
    const gameIframeRef = useRef(null);
    const adObserverRef = useRef(null);
    const containerRef = useRef(null);
    const { windows } = useWindowManager();
    const memoryPressure = useMemoryPressure();

    // Expose toggleFullscreen to parent
    useImperativeHandle(ref, () => ({
        toggleFullscreen: () => {
            const container = containerRef.current;
            if (!container) return;

            if (!isFullscreen) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
    }));

    // Check if this window is focused (has highest zIndex among visible windows)
    useEffect(() => {
        const visibleWindows = windows.filter(w => !w.minimized);
        const maxZIndex = Math.max(...visibleWindows.map(w => w.zIndex), 0);
        const hasFocus = windowZIndex === maxZIndex;
        setIsFocused(hasFocus);

        // Mute/unmute based on focus
        if (gameIframeRef.current) {
            try {
                const iframeWindow = gameIframeRef.current.contentWindow;
                if (iframeWindow) {
                    // Mute by setting volume to 0 (HTML5 audio)
                    const audioElements = gameIframeRef.current.contentDocument?.querySelectorAll('audio, video');
                    audioElements?.forEach(el => {
                        el.muted = !hasFocus;
                    });
                }
                setIsMuted(!hasFocus);
            } catch (err) {
                // Cross-origin restriction
            }
        }
    }, [windowZIndex, windows]);

    useEffect(() => {
        const shouldSuspend = !isFocused && memoryPressure.shouldSuspendBackgroundGames;
        setIsBackgroundSuspended(shouldSuspend);
    }, [isFocused, memoryPressure.shouldSuspendBackgroundGames]);

    // Progress animation effect
    useEffect(() => {
        if (!gameLoading) return;

        const interval = setInterval(() => {
            setGameLoadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + 5;
            });
        }, 120);

        return () => clearInterval(interval);
    }, [gameLoading]);

    // Setup iframe load handler with content detection
    useEffect(() => {
        setLoadError('');
        setGameLoading(true);
        setGameLoadProgress(5);

        const iframe = gameIframeRef.current;
        if (!iframe) return;

        let loadCheckInterval;
        let timeoutId;

        const checkIframeLoaded = () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                const iframeLocation = iframe.contentWindow?.location;

                // Check if iframe has actual content loaded
                if (iframeDoc && iframeDoc.readyState === 'complete') {
                    const isLocalHtmlGame = typeof game.url === 'string' && game.url.startsWith('/games-html-files/');
                    const loadedPath = iframeLocation?.pathname || '';
                    const loadedTitle = (iframeDoc.title || '').toLowerCase();
                    const hasReactRoot = !!iframeDoc.getElementById('root');

                    // If a local game URL resolves to app shell/index, stop to prevent recursive nesting.
                    const loadedSiteShell = isLocalHtmlGame && hasReactRoot && (
                        loadedPath === '/' ||
                        loadedPath === '/index.html' ||
                        loadedTitle.includes('nexus')
                    );

                    if (loadedSiteShell) {
                        setLoadError('This game file was not found in public/games-html-files, so the app shell loaded instead.');
                        setGameLoadProgress(100);
                        setGameLoading(false);
                        iframe.src = 'about:blank';

                        if (loadCheckInterval) clearInterval(loadCheckInterval);
                        if (timeoutId) clearTimeout(timeoutId);
                        return true;
                    }

                    if (unwrapHostEmbed(iframeDoc, iframe)) {
                        // A host wrapper was detected and replaced with direct game URL.
                        return true;
                    }

                    const hasContent = iframeDoc.body &&
                        (iframeDoc.body.children.length > 0 ||
                            iframeDoc.body.innerHTML.trim().length > 0);

                    if (hasContent) {
                        // Content is ready
                        setGameLoadProgress(100);
                        setTimeout(() => {
                            setGameLoading(false);
                        }, 400);

                        // Remove host menu UX elements and keep monitoring for reinjection.
                        removeInjectedAds(iframeDoc);
                        setupAdObserver();

                        if (loadCheckInterval) clearInterval(loadCheckInterval);
                        if (timeoutId) clearTimeout(timeoutId);
                        return true;
                    }
                }
            } catch (err) {
                // Cross-origin - just wait for load event
                console.log('Cross-origin iframe, using load event');
            }
            return false;
        };

        const handleLoad = () => {
            // Start checking for content
            if (checkIframeLoaded()) return;

            // Keep checking every 200ms for up to 5 seconds
            let attempts = 0;
            loadCheckInterval = setInterval(() => {
                attempts++;
                if (checkIframeLoaded() || attempts > 25) {
                    clearInterval(loadCheckInterval);
                    if (!checkIframeLoaded()) {
                        // Fallback: hide loading after timeout
                        setGameLoadProgress(100);
                        setTimeout(() => setGameLoading(false), 400);
                    }
                }
            }, 200);
        };

        // Fallback timeout - hide loading after 10 seconds no matter what
        timeoutId = setTimeout(() => {
            setGameLoadProgress(100);
            setTimeout(() => setGameLoading(false), 400);
            if (loadCheckInterval) clearInterval(loadCheckInterval);
        }, 10000);

        iframe.addEventListener('load', handleLoad);

        return () => {
            iframe.removeEventListener('load', handleLoad);
            if (loadCheckInterval) clearInterval(loadCheckInterval);
            if (timeoutId) clearTimeout(timeoutId);
            if (adObserverRef.current) {
                adObserverRef.current.disconnect();
                adObserverRef.current = null;
            }
        };
    }, [game.url]);

    const unwrapHostEmbed = (doc, iframe) => {
        if (!doc?.body || !iframe) return false;

        try {
            const directIframe = doc.querySelector('body > iframe[src]');
            if (!directIframe) return false;

            const iframeCount = doc.querySelectorAll('iframe[src]').length;
            const hasPlayableSurface = !!doc.querySelector(
                'canvas, #unity-container, #openfl-content, #game, #gameContainer, [id*="game-canvas"]'
            );

            if (iframeCount !== 1 || hasPlayableSurface) return false;

            const nestedSrc = directIframe.getAttribute('src') || '';
            const isHostWrapper = /(truffled\.lol|cdn\.jsdelivr\.net\/gh\/gn-math|gn-math)/i.test(nestedSrc);

            if (!isHostWrapper) return false;

            const resolvedSrc = new URL(nestedSrc, iframe.contentWindow?.location?.href || window.location.href).toString();
            if (!resolvedSrc || resolvedSrc === iframe.src) return false;

            iframe.src = resolvedSrc;
            return true;
        } catch {
            return false;
        }
    };

    // Ad + host menu UX removal function
    const removeInjectedAds = (doc) => {
        if (!doc) return;

        try {
            const adSelectors = [
                '#sidebarad1', '#sidebarad2',
                '.sidebar-close',
                '.sidebar-frame',
                '#truffled-logo',
                'a[href*="truffled.lol"][target="_blank"]',
                'a[href*="gn-math"][target="_blank"]',
                '.adsbygoogle',
                'ins.adsbygoogle',
                '[id*="google_ads"]',
                '[class*="google-ad"]',
                'iframe[src*="googlesyndication.com"]',
                'script[src*="googlesyndication.com"]'
            ];

            adSelectors.forEach(selector => {
                const elements = doc.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
        } catch (err) {
            console.log('Ad removal warning (cross-origin):', err.message);
        }
    };

    // Setup mutation observer for continuous ad removal
    const setupAdObserver = () => {
        const iframe = gameIframeRef.current;
        if (!iframe) return;

        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) return;

            if (adObserverRef.current) {
                adObserverRef.current.disconnect();
            }

            const observer = new MutationObserver(() => {
                removeInjectedAds(iframeDoc);
            });

            observer.observe(iframeDoc.body || iframeDoc, {
                childList: true,
                subtree: true
            });

            adObserverRef.current = observer;
        } catch (err) {
            console.log('Observer setup warning:', err.message);
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(isCurrentlyFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0a0a0a',
                position: 'relative',
            }}
        >
            {/* Game Container */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {/* Loading Overlay */}
                {gameLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15), rgba(0, 0, 0, 0.95))',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '24px',
                            zIndex: 1000,
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <div
                            style={{
                                color: '#fff',
                                fontSize: '24px',
                                fontWeight: 600,
                                textAlign: 'center',
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }}
                        >
                            Please wait...
                        </div>
                        <div
                            style={{
                                width: '340px',
                                height: '8px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                        >
                            <div
                                style={{
                                    width: `${gameLoadProgress}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                                    borderRadius: '4px',
                                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 0 12px rgba(37, 99, 235, 0.6)',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                color: '#aaa',
                                fontSize: '14px',
                                textAlign: 'center',
                            }}
                        >
                            Loading {game.title}...
                        </div>
                    </div>
                )}

                {/* Load error overlay */}
                {!gameLoading && loadError && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.92)',
                            color: '#fff',
                            zIndex: 1001,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '24px',
                            fontSize: '14px',
                            lineHeight: 1.6,
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
                                Failed to load game file
                            </div>
                            <div style={{ color: '#cbd5e1', maxWidth: '640px' }}>{loadError}</div>
                        </div>
                    </div>
                )}

                {/* Background suspension overlay */}
                {isBackgroundSuspended && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.9)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            zIndex: 1002,
                            color: '#cbd5e1',
                            textAlign: 'center',
                            padding: '24px',
                        }}
                    >
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Game paused to save RAM</div>
                        <div style={{ fontSize: '13px' }}>
                            Memory pressure is {memoryPressure.level}. Background games are suspended first.
                        </div>
                        <button
                            onClick={() => {
                                setIsBackgroundSuspended(false);
                                setIframeMountKey((prev) => prev + 1);
                            }}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #3b82f6',
                                background: 'rgba(37,99,235,0.25)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                            }}
                        >
                            Resume Game
                        </button>
                    </div>
                )}

                {/* Game iframe */}
                {!isBackgroundSuspended && (
                    <iframe
                        key={iframeMountKey}
                        ref={gameIframeRef}
                        src={game.url}
                        title={game.title}
                        sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-presentation"
                        allow="accelerometer; gyroscope; fullscreen"
                        loading="eager"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            backgroundColor: '#000',
                            imageRendering: memoryPressure.shouldConserve ? 'pixelated' : 'auto',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
);

GameWindow.displayName = 'GameWindow';

export default GameWindow;