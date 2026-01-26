import React, { useEffect, useState } from 'react';
import './FakeErrorScreen.css';

export default function FakeErrorScreen({ onDismiss }) {
    const [browserType, setBrowserType] = useState('google');
    const [showError, setShowError] = useState(true);

    useEffect(() => {
        // Detect user's actual browser
        function detectBrowser() {
            const ua = navigator.userAgent;
            
            if (/Chrome/.test(ua) && !/Chromium/.test(ua) && !/Edg/.test(ua)) {
                return 'chrome';
            } else if (/Firefox/.test(ua)) {
                return 'firefox';
            } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
                return 'safari';
            } else if (/Edg/.test(ua)) {
                return 'edge';
            } else {
                return 'google';
            }
        }

        setBrowserType(detectBrowser());

        // Listen for 'C' key to dismiss error screen
        const handleKeyDown = (e) => {
            if (e.key === 'c' || e.key === 'C') {
                e.preventDefault();
                setShowError(false);
                // Remove the embedded parameter from URL so it doesn't show again
                if (window.history && window.history.replaceState) {
                    const url = new URL(window.location);
                    url.searchParams.delete('embedded');
                    window.history.replaceState(null, '', url.toString());
                }
                if (onDismiss) onDismiss();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onDismiss]);

    if (!showError) return null;

    return (
        <div className={`fake-error-screen ${browserType}`}>
            <div className="error-container">
                {/* Google-style 404 */}
                {browserType !== 'chrome' && (
                    <>
                        <div className="error-code">404</div>
                        <div className="error-title">That's an error.</div>
                        <div className="error-message">
                            The requested URL was not found on this server. 
                            <span style={{ fontStyle: 'italic' }}>That's all we know.</span>
                        </div>
                        
                        <div className="suggestions">
                            <div className="suggestions-title">Things you can try:</div>
                            <ul>
                                <li>• Check the URL and try again</li>
                                <li>• <a href="#" onClick={(e) => { e.preventDefault(); }}>Go back to the previous page</a></li>
                                <li>• Try searching for what you're looking for using the search bar</li>
                            </ul>
                        </div>
                    </>
                )}

                {/* Chrome-style 404 */}
                {browserType === 'chrome' && (
                    <>
                        <svg className="robot-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <rect x="20" y="30" width="60" height="50" fill="none" stroke="#999" strokeWidth="2" rx="5"/>
                            <circle cx="35" cy="50" r="5" fill="#999"/>
                            <circle cx="65" cy="50" r="5" fill="#999"/>
                            <rect x="20" y="85" width="20" height="8" fill="#999"/>
                            <rect x="60" y="85" width="20" height="8" fill="#999"/>
                        </svg>
                        <div className="error-code">404</div>
                        <div className="error-title">Not Found</div>
                        <div className="error-message">
                            The requested URL was not found on this server.
                        </div>
                    </>
                )}
            </div>

            {browserType !== 'chrome' && (
                <div className="footer">
                    <span>Google</span>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
            )}
        </div>
    );
}
