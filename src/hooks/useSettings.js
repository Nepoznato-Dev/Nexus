import { useState, useEffect } from 'react';
import { storage } from '../Components/Storage/clientStorage.js';
import { settingsEmitter } from '../utils/settingsEmitter.js';

const DEFAULT_SETTINGS = {
  theme: {
    mode: 'dark',
    background: '#0a0a0f',
    accent: '#00f0ff',
    text: '#ffffff',
    contrast: 'normal',
    blur: true,
    transparency: true
  },
  background: { type: 'soft-particle-drift', particleCount: 50, speed: 0.5, opacity: 0.4, blur: 2, desktopWallpaper: 'nexus-default' },
  layout: { density: 'default' },
  motion: { animations: 'full' },
  input: { holdToConfirm: false, contextMenus: true, scrollSpeed: 1 },
  accessibility: {
    grayscale: false,
    colorblindMode: 'none',
    cursorSize: 'normal',
    cursorHighlight: false,
    linkUnderlines: false,
    iconLabels: false,
    textSelectionColor: '#00f0ff',
    dyslexiaFont: false,
    readingRuler: false,
    lineHeight: 'normal',
    focusMode: false,
    bionicReading: false,
    readingGuide: false,
    largeText: false,
    soundEffects: false,
    screenReaderAnnouncements: true,
    alertTones: true,
    reducedSound: false,
    extendedTimeout: false,
    breakReminders: false,
    breakInterval: 25,
    timeLimitWarnings: true,
    globalPause: false,
    stickyKeys: false,
    clickAssist: false,
    clickDelay: 1000,
    oneHandedMode: false,
    simplifiedUI: false,
    plainLanguage: false,
    extraConfirmations: true,
    undoBuffer: true,
    photosensitiveMode: false,
    autoplayControl: true,
    panicButton: true,
    panicSite: 'classroom',
    tabCloakProfile: 'classroom',
    panicReturnTimeout: 60,
    fakeTabName: 'Google Classroom',
    focusIndicators: true,
    reducedTransparency: false,
    screenReaderOptimized: false
  },
  performance: { targetFPS: 60, fpsCapEnabled: true, vsyncEnabled: true, ramLimit: 1024, pageRAMSoftLimit: 750, pageRAMHardLimit: 1250, gamesRAMSoftLimit: 1024, gamesRAMHardLimit: 4096, animationScale: 1, widgetLimit: 3, adaptivePerf: true, showFPS: false, preloadPages: false, preloadProfile: 'essential' },
  games: { fullscreenOnLaunch: true, escToClose: true, lazyLoadStrength: 'medium' },
  widgets: { enabled: true, spotify: true, youtube: true, tiktok: false, autoDisable: true, dockInSidebar: true },
  aiTools: { enabled: false, autoSuggest: true, personality: 'adaptive', apiProvider: 'none', apiKey: '', model: 'gpt-3.5-turbo' },
  browser: { openLinksIn: 'nexus', searchEngine: 'startpage' },
  lowEndMode: false
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings on mount
    const loadSettings = async () => {
      try {
        await storage.init();
        const saved = await storage.loadSettings();
        if (saved) {
          setSettings(prev => ({ ...prev, ...saved }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Subscribe to settings changes
    const unsubscribe = settingsEmitter.subscribe((newSettings) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
    });

    return unsubscribe;
  }, []);

  return { settings, loading };
}
