import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import FirstTimeSetup from '../Components/UI/FirstTimeSetup.js';
import { storage, session } from '../Components/Storage/clientStorage.js';
import LoadingScreen from '../Components/LoadingScreen/LoadingScreen.js';
import * as aiModelManager from '../utils/aiModelManager.js';

const DesktopView = lazy(() => import('../Components/Desktop/DesktopView'));

export default function DashboardWrapper() {
    const [hasCompletedSetup, setHasCompletedSetup] = useState(null);
    const [username, setUsername] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkSetupStatus = async () => {
            try {
                // Check if user is logged in
                const code = session.get();
                if (!code) {
                    navigate('/landing');
                    return;
                }

                // Load existing settings
                const savedSettings = await storage.loadSettings();
                const user = await storage.loadUser(code);

                // Check if setup has been completed
                // Setup is considered complete if settings exist with a theme configured
                const setupComplete = savedSettings?.theme?.accent && savedSettings?.hasCompletedFirstTimeSetup;

                setAccessCode(code);
                setUsername(user?.username || '');
                setHasCompletedSetup(setupComplete);
            } catch (error) {
                console.error('Failed to check setup status:', error);
                setHasCompletedSetup(false);
            }
        };

        checkSetupStatus();
    }, [navigate]);

    const handleSetupComplete = async (settings) => {
        try {
            // Save all settings from the wizard
            const finalSettings = {
                ...settings,
                hasCompletedFirstTimeSetup: true,
                theme: settings.theme || { background: '#0a0a0f', accent: '#00f0ff', text: '#ffffff' },
                background: { type: 'soft-particle-drift', particleCount: 50, speed: 0.5, opacity: 0.4, blur: 2 },
                performance: settings.performance || {
                    targetFPS: 60,
                    fpsCapEnabled: true,
                    vsyncEnabled: true,
                    ramLimit: 1024,
                    pageRAMSoftLimit: 750,
                    pageRAMHardLimit: 1250,
                    gamesRAMSoftLimit: 1024,
                    gamesRAMHardLimit: 4096,
                    animationScale: 1,
                    widgetLimit: 3,
                    adaptivePerf: true,
                    showFPS: settings.performance?.showFPS || false
                },
                games: { fullscreenOnLaunch: true, escToClose: true, lazyLoadStrength: 'medium' },
                widgets: { enabled: false, spotify: false, youtube: false, tiktok: false, autoDisable: true },
                aiTools: {
                    ...(settings.aiTools || {}),
                    enabled: false,
                    autoSuggest: true,
                    downloadChoice: settings.aiTools?.downloadChoice || 'later'
                },
                lowEndMode: false
            };

            await storage.saveSettings(finalSettings);

            // Apply theme immediately
            if (settings.theme) {
                document.documentElement.style.setProperty('--accent-color', settings.theme.accent);
                document.documentElement.style.setProperty('--bg-color', settings.theme.background);
                document.documentElement.style.setProperty('--text-color', settings.theme.text);
            }

            // Start AI model download if user chose "now"
            if (settings.aiTools?.downloadChoice === 'now') {
                aiModelManager.setAIDownloadChoice('now');
                aiModelManager.initializeAI().catch(err => {
                    console.error('AI model download failed:', err);
                });
            } else {
                aiModelManager.setAIDownloadChoice(settings.aiTools?.downloadChoice || 'later');
            }

            // Mark setup as complete and show desktop
            setHasCompletedSetup(true);
        } catch (error) {
            console.error('Failed to complete setup:', error);
            alert('Failed to save settings. Please try again.');
        }
    };

    // Loading state
    if (hasCompletedSetup === null) {
        return <LoadingScreen isLoading showDuration={1000} />;
    }

    // Show FirstTimeSetup if not completed
    if (!hasCompletedSetup) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center p-4">
                <FirstTimeSetup
                    onComplete={handleSetupComplete}
                    username={username}
                    accessCode={accessCode}
                />
            </div>
        );
    }

    // Show DesktopView if setup is complete
    return (
        <Suspense fallback={<LoadingScreen isLoading showDuration={500} />}>
            <DesktopView />
        </Suspense>
    );
}
