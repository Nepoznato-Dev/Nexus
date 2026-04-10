import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, Bell } from 'lucide-react';
import { createPageUrl, openInAboutBlank, resolveAboutBlankTargetForAppUrl, shouldForceAboutBlankFirst } from 'utils';
import { session, storage } from './Components/Storage/clientStorage.js';
import { redirectOnSessionInvalid } from './utils/iframeNavigation';
import KeyboardHandler from './Components/UI/KeyboardHandler.js';
import Sidebar from './Components/UI/Sidebar.js';
import { useNotifications, NotificationCenter, NotificationToast } from './Components/Notifications/NotificationCenter.js';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen.js';
import { AnimatePresence } from 'framer-motion';
import nexusModStorage from './Components/Storage/nexusModStorage.js';
import modExecutor from './Components/Storage/modExecutor.js';
import { processQuickAsk, createHandoffPayload } from './Components/F.L.U.X. - Fast Logic & URL eXtraction/sparkQueryEngine.js';
import { runParallelDiagnostics } from './Components/A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/collaborativeDiagnostics.js';
import fpsThrottler from './utils/fpsThrottler.js';
import RenderGate from './rendering/RenderGate';
import { useRenderManager } from './rendering/RenderManagerProvider';

const DesktopView = lazy(() => import('./Components/Desktop/DesktopView'));
const WidgetsOverlay = lazy(() => import('./Components/Widgets/WidgetsOverlay.js'));
const ScheduleTracker = lazy(() => import('./Components/Schedule/ScheduleTracker.js'));
const DecoyScreen = lazy(() => import('./Components/Stealth/DecoyScreen.js'));
const PerformancePanel = lazy(() => import('./Components/Performance/PerformancePanel.js'));
const ESSENTIAL_PRELOAD_IMPORTERS = [
  () => import('./PagesDisplay/Games.js'),
  () => import('./PagesDisplay/Browser.js'),
  () => import('./PagesDisplay/Settings.js'),
  () => import('./PagesDisplay/Utilities.js')
];
const AGGRESSIVE_PRELOAD_IMPORTERS = [
  ...ESSENTIAL_PRELOAD_IMPORTERS,
  () => import('./PagesDisplay/Music.js'),
  () => import('./PagesDisplay/Videos.js'),
  () => import('./PagesDisplay/Social.js'),
  () => import('./PagesDisplay/StudyTools.js')
];

const getFakeTitle = () => {
  const titles = ['Math Homework', 'Study Session', 'Project Notes', 'Research Dashboard'];
  return titles[Math.floor(Math.random() * titles.length)];
};

const RAZONET_HANDOFF_EVENT = 'nexus:razonet-handoff-ready';
const LEGACY_IRIS_HANDOFF_EVENT = 'nexus:iris-handoff-ready';
const RAZONET_HANDOFF_SESSION_KEY = 'nexus_razonet_handoff';
const LEGACY_IRIS_HANDOFF_SESSION_KEY = 'nexus_iris_handoff';
const RENDER_REVEAL_MS = 280;

function resolveSkeletonVariant(pathname = '/', desktopMode = false) {
  if (desktopMode) return 'desktop';
  if (pathname.startsWith('/games')) return 'games';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname === '/dashboard' || pathname === '/admindashboard') return 'dashboard';
  return 'default';
}

function RenderSkeletonContent({ variant }) {
  if (variant === 'desktop') {
    return (
      <div className="flex-1 p-4 grid grid-cols-12 gap-4">
        <div className="col-span-8 rounded-xl border border-white/15 bg-black/10" />
        <div className="col-span-4 flex flex-col gap-4">
          <div className="h-32 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-32 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-48 rounded-xl border border-white/15 bg-black/10" />
        </div>
      </div>
    );
  }

  if (variant === 'games') {
    return (
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="h-16 rounded-xl border border-white/15 bg-black/10" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-32 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-32 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-32 rounded-xl border border-white/15 bg-black/10" />
        </div>
        <div className="grid grid-cols-4 gap-4 flex-1">
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
          <div className="rounded-xl border border-white/15 bg-black/10" />
        </div>
      </div>
    );
  }

  if (variant === 'settings') {
    return (
      <div className="flex-1 p-4 grid grid-cols-12 gap-4">
        <div className="col-span-3 rounded-xl border border-white/15 bg-black/10" />
        <div className="col-span-9 flex flex-col gap-4">
          <div className="h-16 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
          <div className="h-24 rounded-xl border border-white/15 bg-black/10" />
        </div>
        <div className="grid grid-cols-12 gap-4 flex-1">
          <div className="col-span-8 rounded-xl border border-white/15 bg-black/10" />
          <div className="col-span-4 rounded-xl border border-white/15 bg-black/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="h-full rounded-xl border border-white/15 bg-black/10" />
    </div>
  );
}

function RenderSkeletonShell({ className = '', style = undefined, variant = 'default' }) {
  return (
    <div className={`min-h-screen bg-[#2a2a3e] flex flex-col ${className}`} style={style}>
      <div className="flex min-h-screen flex-1">
        <RenderGate id="skeleton:sidebar" priority="critical" layer="outline">
          <div className="w-[72px] border-r border-white/15 bg-black/15" />
        </RenderGate>
        <div className="flex-1 flex flex-col">
          <RenderGate id="skeleton:topbar" priority="critical" layer="outline">
            <div className="h-[58px] border-b border-white/15 bg-black/10" />
          </RenderGate>
          <RenderGate id="skeleton:content" priority="high" layer="outline">
            <RenderSkeletonContent variant={variant} />
          </RenderGate>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const { manager } = useRenderManager();
  // Generate unique sessionId on mount
  const sessionIdRef = useRef(sessionStorage.getItem('nexus_session_id'));
  if (!sessionIdRef.current) {
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('nexus_session_id', sessionIdRef.current);
  }
  const sessionId = sessionIdRef.current;

  const [searchInput, setSearchInput] = useState('');
  const [searchMode, setSearchMode] = useState('browser'); // 'browser' or 'ai'
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const [aiQuickAskLoading, setAiQuickAskLoading] = useState(false);
  const [aiQuickAskResult, setAiQuickAskResult] = useState(null);
  const [aiQuickAskError, setAiQuickAskError] = useState('');

  // S.P.A.R.K Chat Mode
  const [sparkChatMode, setSparkChatMode] = useState(false); // true = in chat with S.P.A.R.K
  const [sparkChatHistory, setSparkChatHistory] = useState([]); // Array of {role: 'USER' | 'SPARK', message, timestamp}
  const [sparkChatLoading, setSparkChatLoading] = useState(false);
  const [irisNextReady, setIrisNextReady] = useState(false); // Show "Continue to RAZONET" button after S.P.A.R.K responds

  const [lastActivity, setLastActivity] = useState(Date.now());
  const lastActivityRef = useRef(Date.now());
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState([]);
  const [showDecoy, setShowDecoy] = useState(false);
  const [decoyReason, setDecoyReason] = useState('idle');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageLoadStartTime, setPageLoadStartTime] = useState(Date.now());
  const [pageStatus, setPageStatus] = useState(null); // null | 'Thinking' | 'Saving' etc.
  const [pageReady, setPageReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const notifications = useNotifications();
  // Track if DecoyScreen was just dismissed to skip loading screen
  const [decoyJustDismissed, setDecoyJustDismissed] = useState(false);
  const preloadedProfileRef = useRef(null);
  const lastCloakProfileRef = useRef(null);
  const [uiResetKey, setUiResetKey] = useState(0);
  const [revealPhase, setRevealPhase] = useState('skeleton'); // skeleton -> revealing -> interactive

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nexus:route-change', {
      detail: {
        path: location.pathname,
      },
    }));
  }, [location.pathname]);

  useEffect(() => {
    if (isPageLoading) {
      setRevealPhase('skeleton');
      return;
    }

    setRevealPhase('revealing');
    const timer = setTimeout(() => {
      setRevealPhase('interactive');
    }, RENDER_REVEAL_MS);

    return () => clearTimeout(timer);
  }, [isPageLoading]);

  useEffect(() => {
    manager.setBootPhase(revealPhase === 'skeleton' ? 'skeleton' : 'interactive');
  }, [manager, revealPhase]);

  useEffect(() => {
    // When DecoyScreen is dismissed, temporarily skip loading screen
    if (!showDecoy && decoyJustDismissed === false) {
      setDecoyJustDismissed(true);
      const timer = setTimeout(() => setDecoyJustDismissed(false), 100);
      return () => clearTimeout(timer);
    }
  }, [showDecoy, decoyJustDismissed]);

  const MIN_LOADING_TIME = 800; // Minimum hangover time in ms
  const MAX_LOADING_TIME = 5000; // Timeout if page never signals ready

  // Expose setPageStatus and pageReady globally for other components
  useEffect(() => {
    window.nexusPageStatus = setPageStatus;
    window.nexusPageReady = () => {
      setPageReady(true);
    };
    return () => {
      delete window.nexusPageStatus;
      delete window.nexusPageReady;
    };
  }, []);

  // Expose notifications globally and manage tab title/favicon
  useEffect(() => {
    const baseCloakProfileOrder = ['classroom', 'ixl', 'docs', 'drive', 'canva', 'quizlet', 'aboutblank'];

    window.nexusNotifications = {
      show: (notification) => {
        const newNotif = notifications.addNotification(notification);
        setActiveToasts((prev) => [...prev, newNotif]);
      }
    };

    const fallbackIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="70" font-size="70" text-anchor="middle" fill="%23333">📚</text></svg>';
    const cloakProfiles = {
      classroom: { title: 'Google Classroom', site: 'https://classroom.google.com' },
      ixl: { title: 'IXL | Math, Language Arts, Science, Social Studies, and Spanish', site: 'https://www.ixl.com' },
      docs: { title: 'Google Docs', site: 'https://docs.google.com' },
      drive: { title: 'My Drive - Google Drive', site: 'https://drive.google.com' },
      canva: { title: 'Canva', site: 'https://www.canva.com' },
      canvas: { title: 'Canva', site: 'https://www.canva.com' },
      quizlet: { title: 'Quizlet', site: 'https://quizlet.com' },
      aboutblank: { title: 'Google Classroom', site: 'https://classroom.google.com' },
    };

    const setFavicon = (href) => {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = href;
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
    };

    const applyCloakFavicon = (site) => {
      let hostname = '';
      try {
        hostname = new URL(site).hostname;
      } catch (error) {
        hostname = '';
      }

      if (!hostname) {
        setFavicon(fallbackIcon);
        return;
      }

      const candidates = [
        `https://${hostname}/favicon.ico`,
        `https://${hostname}/favicon.png`,
        `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(hostname)}`,
        fallbackIcon,
      ];

      const tryAt = (index) => {
        if (index >= candidates.length) {
          setFavicon(fallbackIcon);
          return;
        }

        const candidate = candidates[index];
        if (candidate.startsWith('data:image/')) {
          setFavicon(candidate);
          return;
        }

        const probe = new Image();
        probe.onload = () => setFavicon(candidate);
        probe.onerror = () => tryAt(index + 1);
        probe.src = candidate;
      };

      tryAt(0);
    };

    const unwrapCloakSite = (inputSite) => {
      const wrapperParams = ['url', 'u', 'target', 'dest', 'destination', 'redirect', 'redirect_url', 'redir', 'to', 'q'];
      let current = String(inputSite || '').trim();
      if (!current) return '';

      if (!/^https?:\/\//i.test(current)) {
        current = `https://${current}`;
      }

      for (let i = 0; i < 4; i += 1) {
        let parsed;
        try {
          parsed = new URL(current);
        } catch (error) {
          break;
        }

        let unwrapped = null;
        for (const param of wrapperParams) {
          const value = parsed.searchParams.get(param);
          if (!value) continue;

          const decoded = decodeURIComponent(value).trim();
          const candidate = /^https?:\/\//i.test(decoded) ? decoded : `https://${decoded}`;
          try {
            const nested = new URL(candidate);
            if (nested.hostname) {
              unwrapped = nested.toString();
              break;
            }
          } catch (nestedError) {
            // Ignore non-URL parameter values.
          }
        }

        if (!unwrapped) {
          return parsed.toString();
        }

        current = unwrapped;
      }

      return current;
    };

    const resolveCloak = () => {
      try {
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        const a11y = settings?.accessibility || {};
        const rawProfileId = a11y.tabCloakProfile || a11y.panicSite || 'classroom';
        const profileId = rawProfileId === 'canvas' ? 'canva' : rawProfileId;
        const customSite = unwrapCloakSite(a11y.tabCloakCustomSite || '');
        const customTitle = (a11y.tabCloakCustomTitle || '').trim();
        const profile = profileId === 'custom'
          ? { title: 'Google Classroom', site: customSite || cloakProfiles.classroom.site }
          : (cloakProfiles[profileId] || cloakProfiles.classroom);
        const manualTitle = (a11y.fakeTabName || '').trim();

        let derivedTitle = profile.title;
        if (profileId === 'custom' && customSite) {
          try {
            const customHost = new URL(customSite).hostname.replace(/^www\./, '');
            derivedTitle = customHost;
          } catch (error) {
            derivedTitle = profile.title;
          }
        }

        const resolvedTitle = profileId === 'custom'
          ? (customTitle || derivedTitle || getFakeTitle())
          : (manualTitle || derivedTitle || getFakeTitle());

        return {
          title: resolvedTitle,
          site: profile.site,
        };
      } catch (error) {
        return {
          title: cloakProfiles.classroom.title,
          site: cloakProfiles.classroom.site,
        };
      }
    };

    const setTabTitle = (nextTitle) => {
      document.title = nextTitle;

      // If Nexus is running inside the about:blank iframe wrapper, keep wrapper title in sync.
      try {
        if (window.top && window.top !== window && window.top.document) {
          window.top.document.title = nextTitle;
        }
      } catch (error) {
        // Cross-origin or restricted top window access; ignore safely.
      }
    };

    const setVisibleCloakedTitle = () => {
      const cloak = resolveCloak();
      setTabTitle(pageStatus ? `${cloak.title} - ${pageStatus}` : cloak.title);
      applyCloakFavicon(cloak.site);
    };

    setVisibleCloakedTitle();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const cloak = resolveCloak();
        setTabTitle(cloak.title);
        applyCloakFavicon(cloak.site);
      } else {
        setVisibleCloakedTitle();
      }
    };

    let isInternalSettingsPatch = false;

    const getCloakProfileOrder = (a11y) => {
      const hasCustomSite = Boolean(String(a11y?.tabCloakCustomSite || '').trim());
      return hasCustomSite ? [...baseCloakProfileOrder, 'custom'] : [...baseCloakProfileOrder];
    };

    const handleSettingsChanged = (event) => {
      const incoming = event?.detail;
      const latestSettings = incoming || JSON.parse(localStorage.getItem('nexus_settings') || '{}');
      const a11y = latestSettings?.accessibility || {};
      const rawProfileId = a11y.tabCloakProfile || a11y.panicSite || 'classroom';
      const profileId = rawProfileId === 'canvas' ? 'canva' : rawProfileId;
      const manualTitle = String(a11y.fakeTabName || '').trim();
      const customTitle = String(a11y.tabCloakCustomTitle || '').trim();
      const hasCustomSite = Boolean(String(a11y.tabCloakCustomSite || '').trim());
      const customLooksStale = hasCustomSite && customTitle && manualTitle && manualTitle !== customTitle;

      if (!isInternalSettingsPatch && customLooksStale) {
        isInternalSettingsPatch = true;
        const nextSettings = {
          ...latestSettings,
          accessibility: {
            ...a11y,
          },
        };

        delete nextSettings.accessibility.tabCloakCustomSite;
        delete nextSettings.accessibility.tabCloakCustomTitle;
        if (nextSettings.accessibility.tabCloakProfile === 'custom') {
          nextSettings.accessibility.tabCloakProfile = 'classroom';
        }

        localStorage.setItem('nexus_settings', JSON.stringify(nextSettings));
        window.dispatchEvent(new CustomEvent('nexus:settings-changed', {
          detail: nextSettings,
        }));
        isInternalSettingsPatch = false;
      }

      if (!isInternalSettingsPatch && profileId === 'aboutblank' && lastCloakProfileRef.current !== 'aboutblank') {
        const target = resolveAboutBlankTargetForAppUrl(window.location.href);
        if (target && window.self === window.top) {
          openInAboutBlank(target, manualTitle || cloakProfiles.aboutblank.title);
        }
      }
      lastCloakProfileRef.current = profileId;

      if (!document.hidden) {
        setVisibleCloakedTitle();
      }
    };

    const updateAccessibilitySettings = (mutator) => {
      try {
        const currentSettings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        if (!currentSettings.accessibility) {
          currentSettings.accessibility = {};
        }

        mutator(currentSettings.accessibility);
        localStorage.setItem('nexus_settings', JSON.stringify(currentSettings));

        window.dispatchEvent(new CustomEvent('nexus:settings-changed', {
          detail: currentSettings,
        }));

        if (document.hidden) {
          const cloak = resolveCloak();
          setTabTitle(cloak.title);
          applyCloakFavicon(cloak.site);
        } else {
          setVisibleCloakedTitle();
        }
      } catch (error) {
        console.warn('[Tab Cloak] Failed to update quick-action settings:', error);
      }
    };

    const applyCloakProfileToSettings = (a11y, profileId) => {
      const normalizedProfile = profileId === 'canvas' ? 'canva' : profileId;
      a11y.tabCloakProfile = normalizedProfile;

      if (normalizedProfile === 'custom') {
        const customSite = unwrapCloakSite(a11y.tabCloakCustomSite || '');
        try {
          const customHost = new URL(customSite).hostname.replace(/^www\./, '');
          a11y.tabCloakCustomTitle = customHost;
          a11y.fakeTabName = customHost;
        } catch (error) {
          a11y.fakeTabName = 'Google Classroom';
        }
        return;
      }

      if (normalizedProfile === 'aboutblank') {
        a11y.fakeTabName = 'about:blank';
        return;
      }

      a11y.fakeTabName = cloakProfiles[normalizedProfile]?.title || 'Google Classroom';
    };

    const setManualCustomSite = (a11y, inputValue) => {
      const normalizedSite = unwrapCloakSite(String(inputValue || '').trim());
      const validated = new URL(normalizedSite);
      if (!validated.hostname) {
        throw new Error('Invalid hostname');
      }

      const unwrappedFinalSite = unwrapCloakSite(validated.toString());
      const finalUrl = new URL(unwrappedFinalSite);
      const hostTitle = finalUrl.hostname.replace(/^www\./, '');

      a11y.tabCloakCustomSite = finalUrl.toString();
      a11y.tabCloakProfile = 'custom';
      a11y.tabCloakCustomTitle = hostTitle;
      a11y.fakeTabName = hostTitle;
    };

    const handleCloakQuickActions = (event) => {
      const target = event.target;
      const targetTag = (target?.tagName || '').toLowerCase();
      const isTypingTarget = targetTag === 'input' || targetTag === 'textarea' || target?.isContentEditable;
      if (isTypingTarget) return;

      if (event.key === '*' || event.code === 'NumpadMultiply') {
        event.preventDefault();
        updateAccessibilitySettings((a11y) => {
          const cloakProfileOrder = getCloakProfileOrder(a11y);
          const current = a11y.tabCloakProfile || a11y.panicSite || 'classroom';
          const currentIndex = cloakProfileOrder.includes(current) ? cloakProfileOrder.indexOf(current) : 0;
          const nextIndex = (currentIndex - 1 + cloakProfileOrder.length) % cloakProfileOrder.length;
          applyCloakProfileToSettings(a11y, cloakProfileOrder[nextIndex]);
        });
        return;
      }

      const isNextKey = event.key === ')' || (event.shiftKey && event.code === 'Digit0');
      if (isNextKey) {
        event.preventDefault();
        updateAccessibilitySettings((a11y) => {
          const cloakProfileOrder = getCloakProfileOrder(a11y);
          const current = a11y.tabCloakProfile || a11y.panicSite || 'classroom';
          const currentIndex = cloakProfileOrder.includes(current) ? cloakProfileOrder.indexOf(current) : 0;
          const nextIndex = (currentIndex + 1) % cloakProfileOrder.length;
          applyCloakProfileToSettings(a11y, cloakProfileOrder[nextIndex]);
        });
        return;
      }

      const isManualSiteKey = event.key === '(' || (event.shiftKey && event.code === 'Digit9');
      if (isManualSiteKey) {
        event.preventDefault();
        const currentSettings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        const a11y = currentSettings?.accessibility || {};
        const hasSavedCustom = Boolean(String(a11y.tabCloakCustomSite || '').trim());

        const chooserOptions = [
          { id: 'classroom', label: 'Google Classroom' },
          { id: 'ixl', label: 'IXL Learning' },
          { id: 'docs', label: 'Google Docs' },
          { id: 'drive', label: 'Google Drive' },
          { id: 'canva', label: 'Canva' },
          { id: 'quizlet', label: 'Quizlet' },
          { id: 'aboutblank', label: 'about:blank Launcher' },
        ];

        if (hasSavedCustom) {
          const customSite = unwrapCloakSite(a11y.tabCloakCustomSite || '');
          try {
            const customHost = new URL(customSite).hostname.replace(/^www\./, '');
            chooserOptions.push({ id: 'custom', label: `Saved Custom (${customHost})` });
          } catch (error) {
            chooserOptions.push({ id: 'custom', label: 'Saved Custom URL' });
          }
        }

        chooserOptions.push({ id: 'manual-custom', label: 'Type New Custom URL...' });

        const menuText = [
          'Select Tab Cloak Target:',
          ...chooserOptions.map((option, index) => `${index + 1}) ${option.label}`),
          '',
          'Enter number:',
        ].join('\n');

        const selectionRaw = window.prompt(menuText, '1');
        if (!selectionRaw) return;
        const selectedIndex = Number.parseInt(selectionRaw, 10) - 1;
        if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= chooserOptions.length) {
          return;
        }

        const selectedOption = chooserOptions[selectedIndex];
        if (selectedOption.id === 'manual-custom') {
          const existingSite = a11y.tabCloakCustomSite || '';
          const input = window.prompt('Enter tab-cloak site URL:', existingSite || 'https://classroom.google.com');
          if (!input || !input.trim()) return;

          try {
            updateAccessibilitySettings((nextA11y) => {
              setManualCustomSite(nextA11y, input);
            });
          } catch (error) {
            console.warn('[Tab Cloak] Invalid custom site URL:', input);
          }
          return;
        }

        updateAccessibilitySettings((nextA11y) => {
          applyCloakProfileToSettings(nextA11y, selectedOption.id);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleCloakQuickActions, true);
    window.addEventListener('nexus:settings-changed', handleSettingsChanged);
    const openNotifications = () => setNotificationCenterOpen(true);
    const onRefreshActionDisabled = (event) => {
      const actionId = event?.detail?.actionId || 'unknown-action';
      notifications.addNotification({
        type: 'warning',
        title: 'Refresh Action Disabled',
        message: `${actionId} was disabled after repeated failures.`,
      });
    };
    window.addEventListener('nexus:open-notifications', openNotifications);
    window.addEventListener('nexus:refresh-action-disabled', onRefreshActionDisabled);
    return () => {
      delete window.nexusNotifications;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleCloakQuickActions, true);
      window.removeEventListener('nexus:settings-changed', handleSettingsChanged);
      window.removeEventListener('nexus:open-notifications', openNotifications);
      window.removeEventListener('nexus:refresh-action-disabled', onRefreshActionDisabled);
    };
  }, [notifications, currentPageName, pageStatus]);

  // Dynamic loading: wait for both min time AND page readiness
  // Skip loading screen for Auth-related pages and when DecoyScreen is dismissed
  useEffect(() => {
    const authPages = ['Auth', 'Landing', 'Consent', 'Privacy', 'Terms'];

    // Skip loading screen if DecoyScreen was just dismissed
    if (decoyJustDismissed) {
      setIsPageLoading(false);
      setPageStatus(null);
      setPageReady(false);
      return;
    }

    // Skip loading screen for auth pages
    if (authPages.includes(currentPageName)) {
      setIsPageLoading(false);
      setPageStatus(null);
      setPageReady(false);
      return;
    }

    setIsPageLoading(true);
    setPageStatus('Loading');
    setPageReady(false);
    setPageLoadStartTime(Date.now());

    let minTimeElapsed = false;
    let maxTimeoutReached = false;

    // Minimum display timer (hangover)
    const minTimer = setTimeout(() => {
      minTimeElapsed = true;
      checkDismiss();
    }, MIN_LOADING_TIME);

    // Maximum timeout fallback
    const maxTimer = setTimeout(() => {
      maxTimeoutReached = true;
      checkDismiss();
    }, MAX_LOADING_TIME);

    function checkDismiss() {
      // Dismiss if: (min time elapsed AND page ready) OR max timeout reached
      if ((minTimeElapsed && pageReady) || maxTimeoutReached) {
        setIsPageLoading(false);
        setPageStatus(null);
      }
    }

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [location.pathname, currentPageName, decoyJustDismissed]);

  // Check dismissal when pageReady changes
  useEffect(() => {
    if (pageReady && !isPageLoading) return; // Already dismissed

    const elapsed = Date.now() - pageLoadStartTime;
    if (elapsed >= MIN_LOADING_TIME && pageReady) {
      setIsPageLoading(false);
      setPageStatus(null);
    }
  }, [pageReady, pageLoadStartTime, isPageLoading]);

  // Boss Key Handler
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
    const stealthSettings = settings.stealth || {};

    const handleBossKey = (e) => {
      if (!stealthSettings.bossKeyEnabled) return;

      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setShowDecoy(prev => !prev);
        setDecoyReason('bosskey');
      }
    };

    document.addEventListener('keydown', handleBossKey);
    return () => document.removeEventListener('keydown', handleBossKey);
  }, []);

  // FPS Throttler Initialization
  useEffect(() => {
    const applyFPSThrottle = async () => {
      try {
        const settings = await storage.loadSettings();
        const performanceSettings = settings?.performance || {};
        const targetFPS = performanceSettings.targetFPS ?? 60;
        const fpsCapEnabled = performanceSettings.fpsCapEnabled ?? true;
        const vsyncEnabled = performanceSettings.vsyncEnabled ?? true;

        // Apply FPS throttle
        fpsThrottler.applySettings({ targetFPS, fpsCapEnabled, vsyncEnabled });

        console.log(`[FPS Throttler] Initialized: ${fpsCapEnabled ? `${targetFPS} FPS cap` : 'Unlimited'} (V-Sync ${vsyncEnabled ? 'On' : 'Off'})`);
      } catch (error) {
        console.error('[FPS Throttler] Failed to load settings:', error);
        // Default to 60 FPS on error
        fpsThrottler.applySettings({ targetFPS: 60, fpsCapEnabled: true, vsyncEnabled: true });
      }
    };

    applyFPSThrottle();

    // Listen for settings changes
    const handleSettingsChange = (e) => {
      const performanceSettings = e.detail?.performance;
      if (!performanceSettings) return;

      fpsThrottler.applySettings({
        targetFPS: performanceSettings.targetFPS,
        fpsCapEnabled: performanceSettings.fpsCapEnabled,
        vsyncEnabled: performanceSettings.vsyncEnabled,
      });

      const nextTargetFPS = performanceSettings.targetFPS ?? fpsThrottler.getTargetFPS();
      const nextCapEnabled = performanceSettings.fpsCapEnabled ?? fpsThrottler.isCapEnabled();
      const nextVsyncEnabled = performanceSettings.vsyncEnabled ?? fpsThrottler.isVsyncEnabled();
      console.log(`[FPS Throttler] Updated: ${nextCapEnabled ? `${nextTargetFPS} FPS cap` : 'Unlimited'} (V-Sync ${nextVsyncEnabled ? 'On' : 'Off'})`);
    };

    window.addEventListener('nexus:settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('nexus:settings-changed', handleSettingsChange);
    };
  }, []);

  // Idle Decoy Mode
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
    const stealthSettings = settings.stealth || {};

    if (!stealthSettings.idleDecoyEnabled || showDecoy) return;

    let idleTimeout;

    const resetIdleTimer = () => {
      setLastActivity(Date.now());
      lastActivityRef.current = Date.now();
      clearTimeout(idleTimeout);

      const timeoutMinutes = stealthSettings.idleDecoyTimeout || 3;
      idleTimeout = setTimeout(() => {
        setShowDecoy(true);
        setDecoyReason('idle');
      }, timeoutMinutes * 60 * 1000);
    };

    // Activity listeners - consolidated set
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Initialize idle timer
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [showDecoy]);

  // Monitor for admin kicks, bans, and timeouts
  useEffect(() => {
    // Note: Activity tracking is now consolidated in the Idle Decoy Mode effect above
    // This ensures we don't have duplicate listeners

    const checkKickStatus = () => {
      try {
        const kickList = JSON.parse(localStorage.getItem('nexus_kick_list') || '[]');
        const sessionId = session.get?.();
        const kicked = kickList.find(k => k.sessionId === sessionId);

        if (kicked) {
          // User has been kicked
          localStorage.removeItem('nexus_kick_list');
          sessionStorage.clear();
          redirectOnSessionInvalid(navigate);
        }
      } catch (err) {
        console.error('Kick check failed:', err);
      }
    };

    const checkBanStatus = () => {
      try {
        const accessCode = session.get?.();
        if (!accessCode) return;

        // Check if user got banned during their session
        if (storage.isBanned(accessCode)) {
          const banInfo = storage.getBanInfo(accessCode);
          let message = 'Your account has been banned.';
          if (banInfo && !banInfo.isPermanent) {
            const minutesLeft = Math.ceil(banInfo.timeRemaining / 60000);
            message = `Your account has been temporarily banned. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`;
          }

          alert(message);
          session.clear();
          sessionStorage.clear();
          redirectOnSessionInvalid(navigate);
        }
      } catch (err) {
        console.error('Ban check failed:', err);
      }
    };

    // Update heartbeat for active sessions tracking
    const updateHeartbeat = () => {
      try {
        const sessionId = session.get?.();
        if (!sessionId) return;

        const sessions = JSON.parse(localStorage.getItem('nexus_active_sessions') || '[]');
        const email = localStorage.getItem('nexus_user_email') || sessionStorage.getItem('nexus_user_email') || 'Anonymous';
        const role = session.getRole?.() || 'guest';

        // Remove old session entries for this sessionId
        const filtered = sessions.filter(s => s.sessionId !== sessionId);

        // Add current session with role
        filtered.push({
          sessionId,
          email,
          role,
          lastSeen: Date.now()
        });

        // Keep only last 50 sessions
        const recent = filtered.slice(-50);
        localStorage.setItem('nexus_active_sessions', JSON.stringify(recent));
      } catch (err) {
        console.error('Heartbeat failed:', err);
      }
    };

    // Check for session timeout (30 minutes of inactivity)
    const checkTimeout = () => {
      const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
      const inactive = Date.now() - lastActivityRef.current;

      if (inactive > TIMEOUT_DURATION) {
        alert('Your session has expired due to inactivity. Please login again.');
        session.clear();
        sessionStorage.clear();
        navigate(createPageUrl('Landing'));
      }
    };

    let pollTick = 0;
    const poll = () => {
      pollTick += 1;
      const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';

      // Session integrity checks run frequently in foreground and less often in background.
      if (isVisible || pollTick % 4 === 0) {
        checkKickStatus();
        checkBanStatus();
      }

      // Heartbeat every 10s in foreground, every 30s in background.
      if ((isVisible && pollTick % 2 === 0) || (!isVisible && pollTick % 6 === 0)) {
        updateHeartbeat();
      }

      // Timeout checks remain effectively every 60 seconds.
      if (pollTick % 12 === 0) {
        checkTimeout();
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkKickStatus();
        checkBanStatus();
        updateHeartbeat();
      }
    };

    // Prime immediately, then continue with adaptive polling.
    checkKickStatus();
    checkBanStatus();
    checkTimeout();
    updateHeartbeat();
    const monitorInterval = setInterval(poll, 5000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(monitorInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);

  // Don't show search bar on Browser or StudyTools page
  const isBrowserPage = location.pathname.includes('/browser');
  const isStudyToolsPage = location.pathname.includes('/study');
  const isLandingPage = location.pathname.includes('/landing') || location.pathname === '/';
  const isAuthPage = location.pathname.includes('/auth');
  const isConsentPage = location.pathname.includes('/consent');
  const shouldHideUI = isLandingPage || isAuthPage || isConsentPage;

  const getQuickAskUserName = () => {
    const candidates = [
      localStorage.getItem('nexus_username'),
      localStorage.getItem('nexus_display_name'),
      localStorage.getItem('username'),
    ].filter(Boolean);

    if (candidates.length > 0) {
      return candidates[0];
    }

    return 'Friend';
  };

  const runQuickAsk = async (query) => {
    setAiDropdownOpen(true);
    setAiQuickAskLoading(true);
    setAiQuickAskError('');

    try {
      const result = await processQuickAsk(query, getQuickAskUserName(), {
        apiKeys: {
          openai: localStorage.getItem('nexus_openai_key') || '',
          google: localStorage.getItem('nexus_google_key') || '',
        },
        conversationHistory: [],
      });

      setAiQuickAskResult({ ...result, originalQuery: query });
    } catch (error) {
      console.error('Quick Ask failed:', error);
      setAiQuickAskError('I could not process that right now. Please try again.');
      setAiQuickAskResult(null);
    } finally {
      setAiQuickAskLoading(false);
    }
  };

  const deleteFlaggedIncompatibleMods = async (suggestedMods = []) => {
    const idsToRemove = new Set(
      suggestedMods
        .map(mod => mod?.id || mod?.slug || mod?.name)
        .filter(Boolean)
    );

    if (idsToRemove.size === 0) return [];

    const keysToUpdate = ['nexus_last_known_good_mods', 'nexus_mods_cache'];
    const deleted = [];

    keysToUpdate.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;

        const kept = [];
        parsed.forEach((mod) => {
          const modKey = mod?.id || mod?.slug || mod?.name;
          if (modKey && idsToRemove.has(modKey)) {
            deleted.push(mod);
          } else {
            kept.push(mod);
          }
        });

        localStorage.setItem(key, JSON.stringify(kept));
      } catch (storageError) {
        console.warn(`[Collaborative Diagnostics] Failed to update ${key}:`, storageError);
      }
    });

    return deleted;
  };

  const handleRunCollaborative = async () => {
    if (!searchInput.trim() && !aiQuickAskResult?.originalQuery) return;

    const query = searchInput.trim() || aiQuickAskResult.originalQuery;
    setAiQuickAskLoading(true);
    setAiQuickAskError(null);

    try {
      const apiKeys = await storage.getApiKeys();
      const report = await runParallelDiagnostics(query, {
        userName: session.getUser()?.username || 'User',
        apiKeys: {
          openai: apiKeys?.openai,
          google: apiKeys?.google,
        },
        modCleanupApproval: false,
        onDeleteIncompatibleMods: deleteFlaggedIncompatibleMods,
      });

      if (report?.modCleanupPlan?.available && !report?.modCleanupPlan?.execution?.executed) {
        const flaggedCount = report.modCleanupPlan.suggestedMods.length;
        const approved = window.confirm(
          `RAZONET and F.L.U.X flagged ${flaggedCount} potentially incompatible mod(s).\n\nApprove automatic removal now?`
        );

        if (approved) {
          const deletedMods = await deleteFlaggedIncompatibleMods(report.modCleanupPlan.suggestedMods);
          report.modCleanupPlan.execution = {
            executed: true,
            deletedCount: deletedMods.length,
            deletedMods,
          };

          report.unifiedReport += `\n\n---\n\n## ✅ Cleanup Execution\n\n`;
          report.unifiedReport += `User approved auto-removal. Removed ${deletedMods.length} flagged mod(s).\n`;

          notifications.addNotification({
            title: 'Incompatible mods removed',
            message: `Auto-removed ${deletedMods.length} flagged mod(s) after your approval.`,
            type: 'success',
          });
        } else {
          report.unifiedReport += `\n\n---\n\n## ⏸ Cleanup Deferred\n\n`;
          report.unifiedReport += `User did not approve auto-removal at this time.\n`;
        }
      }

      setAiQuickAskResult({
        response: report.unifiedReport,
        source: 'COLLABORATIVE',
        confidence: 90,
        originalQuery: query,
        collaborativeData: report,
      });
    } catch (error) {
      console.error('[Quick Ask Collaborative] Error:', error);
      setAiQuickAskError(error.message || 'Collaborative diagnostic failed');
    } finally {
      setAiQuickAskLoading(false);
    }
  };

  const handleContinueInIRIS = () => {
    if (!aiQuickAskResult?.response) return;

    const payload = createHandoffPayload(aiQuickAskResult, aiQuickAskResult.originalQuery || searchInput.trim());
    sessionStorage.setItem(RAZONET_HANDOFF_SESSION_KEY, JSON.stringify(payload));
    sessionStorage.setItem(LEGACY_IRIS_HANDOFF_SESSION_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(RAZONET_HANDOFF_EVENT, { detail: payload }));
    window.dispatchEvent(new CustomEvent(LEGACY_IRIS_HANDOFF_EVENT, { detail: payload }));
    setAiDropdownOpen(false);
    navigate(createPageUrl('Utilities'), {
      state: {
        fromIrisHandoff: true,
        source: 'quick-ask',
      },
    });

    notifications.addNotification({
      title: 'RAZONET handoff ready',
      message: 'Opening AI tools with your handoff context.',
      type: 'info',
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // S.P.A.R.K Chat Mode Functions
  // ═══════════════════════════════════════════════════════════════

  const handleStartSparkChat = () => {
    if (!searchInput.trim()) return;

    // Enter chat mode
    setSparkChatMode(true);
    setSearchMode('ai');
    setAiDropdownOpen(false);

    // Add user message to history
    const userMessage = searchInput.trim();
    setSparkChatHistory([{
      role: 'USER',
      message: userMessage,
      timestamp: Date.now()
    }]);

    // Send to S.P.A.R.K
    handleSparkChatMessage(userMessage);
    setSearchInput('');
  };

  const handleSparkChatMessage = async (message) => {
    if (!message.trim() || sparkChatLoading) return;

    setSparkChatLoading(true);

    try {
      const apiKeys = await storage.getApiKeys();

      // Get S.P.A.R.K response using processQuickAsk
      const sparkResponse = await processQuickAsk(message, {
        userName: session.getUser()?.username || 'User',
        apiKeys: {
          openai: apiKeys?.openai,
          google: apiKeys?.google,
        },
      });

      // Add S.P.A.R.K response to history
      setSparkChatHistory(prev => [...prev, {
        role: 'SPARK',
        message: sparkResponse?.response || 'Sorry, I couldn\'t process that.',
        timestamp: Date.now()
      }]);

      // Enable RAZONET transition
      setIrisNextReady(true);

    } catch (error) {
      console.error('[S.P.A.R.K Chat] Error:', error);
      setSparkChatHistory(prev => [...prev, {
        role: 'SPARK',
        message: `Error: ${error.message || 'Failed to get response'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setSparkChatLoading(false);
    }
  };

  const handleSendSparkChatMessage = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || sparkChatLoading) return;

    const userMessage = searchInput.trim();

    // Add user message to history
    setSparkChatHistory(prev => [...prev, {
      role: 'USER',
      message: userMessage,
      timestamp: Date.now()
    }]);

    setSearchInput('');
    await handleSparkChatMessage(userMessage);
  };

  const handleContinueToIrisChat = () => {
    // Create context from S.P.A.R.K chat
    const chatContext = sparkChatHistory
      .map(entry => `${entry.role}: ${entry.message}`)
      .join('\n\n');

    const payload = {
      source: 'spark-chat',
      originalQuery: sparkChatHistory[0]?.message || '',
      sparkContext: chatContext,
      sparkHistory: sparkChatHistory
    };

    sessionStorage.setItem(RAZONET_HANDOFF_SESSION_KEY, JSON.stringify(payload));
    sessionStorage.setItem(LEGACY_IRIS_HANDOFF_SESSION_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(RAZONET_HANDOFF_EVENT, { detail: payload }));
    window.dispatchEvent(new CustomEvent(LEGACY_IRIS_HANDOFF_EVENT, { detail: payload }));

    // Close chat mode and navigate
    setSparkChatMode(false);
    setSparkChatHistory([]);
    setIrisNextReady(false);

    navigate(createPageUrl('Utilities'), {
      state: {
        fromIrisHandoff: true,
        source: 'spark-chat',
      },
    });

    notifications.addNotification({
      title: 'Continuing to RAZONET',
      message: 'Opening RAZONET with F.L.U.X context.',
      type: 'info',
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (searchMode === 'browser') {
        const aboutBlankTarget = resolveAboutBlankTargetForAppUrl(searchInput.trim());
        if (aboutBlankTarget) {
          openInAboutBlank(aboutBlankTarget, 'Google Classroom');
          setSearchInput('');
          return;
        }

        const raw = searchInput.trim();
        let maybeUrl = raw;
        if (!/^https?:\/\//i.test(maybeUrl) && raw.includes('.') && !raw.includes(' ')) {
          maybeUrl = `https://${raw}`;
        }

        if (shouldForceAboutBlankFirst(maybeUrl)) {
          let launchTitle = 'about:blank';
          try {
            launchTitle = new URL(maybeUrl).hostname.replace(/^www\./, '') || launchTitle;
          } catch (error) {
            // Keep fallback title.
          }
          openInAboutBlank(maybeUrl, launchTitle);
          setSearchInput('');
          return;
        }

        navigate(createPageUrl('Browser'), { state: { url: searchInput.trim() } });
        setSearchInput('');
      } else if (searchMode === 'ai') {
        // Start S.P.A.R.K chat mode
        if (!sparkChatMode) {
          handleStartSparkChat();
        } else {
          // Already in chat, send message
          await handleSendSparkChatMessage(e);
        }
      }
    }
  };

  // Toggle AI dropdown when clicking AI mode button
  const handleAiModeToggle = () => {
    if (searchMode === 'ai') {
      // Already in AI mode, toggle dropdown
      setAiDropdownOpen(!aiDropdownOpen);
    } else {
      // Switch to AI mode and open dropdown
      setSearchMode('ai');
      setAiDropdownOpen(true);
    }
  };

  // Check for desktop mode (dashboard is always windows mode)
  const isDashboardRoute = location.pathname === '/dashboard';
  const isDesktopMode = isDashboardRoute || localStorage.getItem('desktop_mode') === 'true';
  const skeletonVariant = resolveSkeletonVariant(location.pathname, isDesktopMode);

  useEffect(() => {
    let cancelled = false;
    let idleCallbackId = null;

    const preloadConfiguredPages = () => {
      try {
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        // Hard-disable preload to keep idle RAM low and prevent eager tab/page hydration.
        if (settings?.performance?.preloadPages === true) {
          const nextSettings = {
            ...settings,
            performance: {
              ...(settings.performance || {}),
              preloadPages: false,
            },
          };
          localStorage.setItem('nexus_settings', JSON.stringify(nextSettings));
        }

        preloadedProfileRef.current = null;
        return;
      } catch (error) {
        console.error('Failed to preload pages:', error);
      }
    };

    preloadConfiguredPages();

    return () => {
      cancelled = true;
      if (idleCallbackId && typeof window !== 'undefined' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    const clearPageCaches = async () => {
      try {
        const settings = JSON.parse(localStorage.getItem('nexus_settings') || '{}');
        const preloadPagesEnabled = settings?.performance?.preloadPages === true;
        if (preloadPagesEnabled) {
          return;
        }

        const removableLocalStorageKeys = [];
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key) continue;
          const lowerKey = key.toLowerCase();
          const isCacheKey = lowerKey.includes('cache') || lowerKey.includes('prefetch') || lowerKey.includes('preload');
          const keepKey = lowerKey.includes('nexus_settings') || lowerKey.includes('nexus_user') || lowerKey.includes('nexus_session');
          if (isCacheKey && !keepKey) {
            removableLocalStorageKeys.push(key);
          }
        }

        removableLocalStorageKeys.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) { }
        });

        const removableSessionStorageKeys = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index);
          if (!key) continue;
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('cache') || lowerKey.includes('prefetch') || lowerKey.includes('preload')) {
            removableSessionStorageKeys.push(key);
          }
        }

        removableSessionStorageKeys.forEach((key) => {
          try {
            sessionStorage.removeItem(key);
          } catch (e) { }
        });

        if ('caches' in window) {
          try {
            const cacheKeys = await window.caches.keys();
            await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
          } catch (e) { }
        }
      } catch (error) {
        console.error('Failed to clear page caches:', error);
      }
    };

    clearPageCaches();
  }, [location.pathname]);

  useEffect(() => {
    if (shouldHideUI || isDesktopMode) return;
    let cancelled = false;

    const initMods = async () => {
      try {
        await nexusModStorage.initialize();
        if (cancelled) return;
        const enabledMods = nexusModStorage.getEnabledMods();
        await modExecutor.executeAllMods(enabledMods);
      } catch (error) {
        console.error('Failed to initialize mods:', error);
      }
    };

    initMods();
    return () => {
      cancelled = true;
    };
  }, [shouldHideUI, isDesktopMode]);

  useEffect(() => {
    const handleViewRefresh = (event) => {
      const target = event?.detail?.target || 'current-route';
      if (target !== 'current-route') return;

      setPageStatus('Refreshing View');
      setUiResetKey((prev) => prev + 1);
      setTimeout(() => setPageStatus(null), 500);
    };

    window.addEventListener('nexus:refresh-view', handleViewRefresh);
    return () => {
      window.removeEventListener('nexus:refresh-view', handleViewRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClearRam = () => {
      const clearRuntimeCaches = async () => {
        const removableLocalStorageKeys = [];
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key) continue;
          const lowerKey = key.toLowerCase();
          const isCacheKey = lowerKey.includes('cache') || lowerKey.includes('prefetch') || lowerKey.includes('preload');
          const keepKey = lowerKey.includes('nexus_settings') || lowerKey.includes('nexus_user') || lowerKey.includes('nexus_session');
          if (isCacheKey && !keepKey) {
            removableLocalStorageKeys.push(key);
          }
        }

        removableLocalStorageKeys.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) { }
        });

        const removableSessionStorageKeys = [];
        for (let index = 0; index < sessionStorage.length; index += 1) {
          const key = sessionStorage.key(index);
          if (!key) continue;
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('cache') || lowerKey.includes('prefetch') || lowerKey.includes('preload')) {
            removableSessionStorageKeys.push(key);
          }
        }

        removableSessionStorageKeys.forEach((key) => {
          try {
            sessionStorage.removeItem(key);
          } catch (e) { }
        });

        if ('caches' in window) {
          try {
            const cacheKeys = await window.caches.keys();
            await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
          } catch (e) { }
        }
      };

      try {
        clearRuntimeCaches();
        setPageStatus('Refreshing UI');
        setAiDropdownOpen(false);
        setNotificationCenterOpen(false);
        setActiveToasts([]);
        setShowPerformancePanel(false);
        setPageReady(false);

        setUiResetKey((prev) => prev + 1);

        if (typeof window !== 'undefined' && window.gc) {
          try {
            window.gc();
          } catch (e) { }
        }

        setTimeout(() => {
          setPageStatus(null);
        }, 700);
      } catch (error) {
        console.error('Failed to clear RAM/UI:', error);
      }
    };

    window.addEventListener('nexus:clear-ram', handleClearRam);
    return () => {
      window.removeEventListener('nexus:clear-ram', handleClearRam);
    };
  }, []);

  // Check for session expiration in desktop mode - use effect to avoid setState during render
  useEffect(() => {
    if (isDesktopMode && !shouldHideUI) {
      const sessionActive = session.get();
      if (!sessionActive) {
        // Session expired, exit desktop mode and redirect
        localStorage.setItem('desktop_mode', 'false');
        navigate('/landing');
      }
    }
  }, [isDesktopMode, shouldHideUI, navigate]);

  // If desktop mode is enabled, render DesktopView instead
  if (isDesktopMode && !shouldHideUI) {
    const sessionActive = session.get();
    if (!sessionActive) {
      // Session will be cleared by useEffect above, show nothing during transition
      return null;
    }

    if (revealPhase === 'skeleton') {
      return (
        <>
          <LoadingScreen isLoading showDuration={900} />
          <RenderSkeletonShell variant={skeletonVariant} />
        </>
      );
    }

    return (
      <div className="relative min-h-screen bg-[#2a2a3e] overflow-hidden">
        {revealPhase === 'revealing' && (
          <RenderSkeletonShell
            variant={skeletonVariant}
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ animation: `nexusSkeletonFade ${RENDER_REVEAL_MS}ms ease forwards` }}
          />
        )}
        <div
          style={{
            animation: revealPhase === 'revealing' ? `nexusContentFade ${RENDER_REVEAL_MS}ms ease forwards` : undefined,
            pointerEvents: revealPhase === 'interactive' ? 'auto' : 'none',
          }}
        >
          <Suspense fallback={<LoadingScreen isLoading showDuration={500} />}>
            <DesktopView key={`desktop-${uiResetKey}`} />
          </Suspense>
        </div>
      </div>
    );
  }

  if (revealPhase === 'skeleton') {
    return (
      <>
        <LoadingScreen isLoading showDuration={900} />
        <RenderSkeletonShell variant={skeletonVariant} />
      </>
    );
  }

  return (
    <div key={`main-${uiResetKey}`} className="relative min-h-screen bg-[#2a2a3e] flex flex-col overflow-hidden">
      {revealPhase === 'revealing' && (
        <RenderSkeletonShell
          variant={skeletonVariant}
          className="absolute inset-0 z-30 pointer-events-none"
          style={{ animation: `nexusSkeletonFade ${RENDER_REVEAL_MS}ms ease forwards` }}
        />
      )}

      {!shouldHideUI && <KeyboardHandler />}

      <div
        className="flex min-h-screen flex-1"
        style={{
          animation: revealPhase === 'revealing' ? `nexusContentFade ${RENDER_REVEAL_MS}ms ease forwards` : undefined,
          pointerEvents: revealPhase === 'interactive' ? 'auto' : 'none',
        }}
      >
        {!shouldHideUI && (
          <Sidebar
            onWidthChange={setSidebarWidth}
            onTogglePerformance={() => setShowPerformancePanel((v) => !v)}
            performanceOpen={showPerformancePanel}
          />
        )}

        {!shouldHideUI && showPerformancePanel && (
          <Suspense fallback={null}>
            <PerformancePanel visible={showPerformancePanel} sidebarWidth={sidebarWidth} />
          </Suspense>
        )}

        <div className="flex-1 flex flex-col min-h-screen">
          {!shouldHideUI && (
            <Suspense fallback={null}>
              <WidgetsOverlay />
            </Suspense>
          )}

          {!shouldHideUI && !isBrowserPage && !isStudyToolsPage && (
            <div className="z-10 backdrop-blur-sm border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAiModeToggle}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${searchMode === 'ai' || aiDropdownOpen
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    title={searchMode === 'ai' ? 'Open AI Assistant' : 'Switch to AI mode'}
                  >
                    {searchMode === 'browser' ? <Search className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span className="text-sm font-medium hidden sm:inline">
                      {searchMode === 'browser' ? 'Browser' : 'AI'}
                    </span>
                  </button>

                  <div className="relative flex-1">
                    {searchMode === 'browser' ? (
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                    ) : (
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                    )}
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (sparkChatMode) {
                            handleSendSparkChatMessage(e);
                          } else {
                            handleSearch(e);
                          }
                        }
                      }}
                      placeholder={sparkChatMode ? 'Ask F.L.U.X anything...' : (searchMode === 'browser' ? 'Search or enter URL...' : 'Ask RAZONET anything...')}
                      className={`w-full pl-10 pr-12 py-2 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${searchMode === 'ai'
                        ? 'border-purple-500/30 focus:ring-purple-500/50'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50'
                        }`}
                    />
                    {/* Send Button for Chat Mode */}
                    {sparkChatMode && (
                      <button
                        type="button"
                        onClick={handleSendSparkChatMessage}
                        disabled={!searchInput.trim() || sparkChatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:text-purple-600 disabled:cursor-not-allowed transition-colors"
                        title="Send message"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a.961.961 0 00-1.788 0l-7.848 12.986a.96.96 0 001.532 1.032L5 13.91l.846 8.256a.96.96 0 001.907 0l.846-8.256 3.21 5.661a.96.96 0 001.532-1.032L10.894 2.553Z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationCenterOpen(true)}
                    className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 text-white" />
                    {notifications.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div
            className="relative max-w-7xl mx-auto px-4 pb-16 w-full flex-1"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}
          >
            {children}
          </div>

          <Suspense fallback={null}>
            <ScheduleTracker />
          </Suspense>
        </div>
      </div>

      <style>{`
        @keyframes nexusSkeletonFade {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes nexusContentFade {
          from { opacity: 0.35; filter: blur(1px); }
          to { opacity: 1; filter: blur(0px); }
        }

        :root {
          --background: 0 0% 3.9%;
          --foreground: 0 0% 98%;
          --card: 0 0% 3.9%;
          --card-foreground: 0 0% 98%;
          --popover: 0 0% 3.9%;
          --popover-foreground: 0 0% 98%;
          --primary: 0 0% 98%;
          --primary-foreground: 0 0% 9%;
          --secondary: 0 0% 14.9%;
          --secondary-foreground: 0 0% 98%;
          --muted: 0 0% 14.9%;
          --muted-foreground: 0 0% 63.9%;
          --accent: 0 0% 14.9%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 14.9%;
          --input: 0 0% 14.9%;
          --ring: 0 0% 83.1%;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        body {
          background: #0a0a0f;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* AI Dropdown */}
      {aiDropdownOpen && !shouldHideUI && !isBrowserPage && !isStudyToolsPage && (
        <div className="fixed z-40 w-full max-w-2xl left-1/2 -translate-x-1/2 top-20 px-4">
          <div className="rounded-xl border border-purple-500/30 bg-[#151526]/95 backdrop-blur-md shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-purple-300">Quick Ask (F.L.U.X)</div>
              <button
                type="button"
                onClick={() => setAiDropdownOpen(false)}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {aiQuickAskLoading && (
              <div className="text-sm text-white/80">Thinking…</div>
            )}

            {!aiQuickAskLoading && aiQuickAskError && (
              <div className="text-sm text-red-300">{aiQuickAskError}</div>
            )}

            {!aiQuickAskLoading && !aiQuickAskError && aiQuickAskResult?.response && (
              <>
                <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                  {aiQuickAskResult.response}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded border ${aiQuickAskResult.source === 'COLLABORATIVE'
                    ? 'text-white border-purple-500/40 bg-gradient-to-r from-purple-500/10 to-blue-500/10'
                    : aiQuickAskResult.source === 'IRIS'
                      ? 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
                      : 'text-purple-300 border-purple-500/40 bg-purple-500/10'
                    }`}>
                    {aiQuickAskResult.source === 'COLLABORATIVE'
                      ? '🤝 F.L.U.X + RAZONET'
                      : aiQuickAskResult.source === 'IRIS'
                        ? 'RAZONET'
                        : 'F.L.U.X'}
                  </span>
                  <span className="text-white/60">Confidence {Math.round(aiQuickAskResult.confidence || 0)}%</span>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {aiQuickAskResult.source !== 'COLLABORATIVE' && (
                    <button
                      type="button"
                      onClick={handleRunCollaborative}
                      className="px-3 py-1.5 rounded-md text-sm text-white bg-gradient-to-r from-purple-600/70 to-blue-600/70 hover:from-purple-600 hover:to-blue-600 transition-colors flex items-center gap-1.5"
                      title="Both F.L.U.X and RAZONET analyze together"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Collaborative
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleContinueInIRIS}
                    className="px-3 py-1.5 rounded-md text-sm text-white bg-purple-600/70 hover:bg-purple-600 transition-colors"
                  >
                    Continue in RAZONET
                  </button>
                  <button
                    type="button"
                    onClick={() => runQuickAsk(searchInput.trim() || aiQuickAskResult.originalQuery || '')}
                    className="px-3 py-1.5 rounded-md text-sm text-white/85 bg-white/10 hover:bg-white/15 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications.notifications}
        onMarkAsRead={notifications.markAsRead}
        onMarkAllAsRead={notifications.markAllAsRead}
        onDelete={notifications.deleteNotification}
        onClearAll={notifications.clearAll}
      />

      {/* F.L.U.X Chat Modal */}
      {sparkChatMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a3e] border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-purple-500/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">F.L.U.X Chat</h2>
              </div>
              <button
                onClick={() => {
                  setSparkChatMode(false);
                  setSparkChatHistory([]);
                  setIrisNextReady(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat History */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}
            >
              {sparkChatHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Starting conversation with F.L.U.X...</p>
                </div>
              ) : (
                sparkChatHistory.map((entry, idx) => (
                  <div key={idx} className={`flex ${entry.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${entry.role === 'USER'
                        ? 'bg-purple-600/40 border border-purple-500/50 text-white'
                        : 'bg-purple-500/20 border border-purple-500/30 text-purple-200'
                        }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {entry.role === 'USER' ? 'You' : 'F.L.U.X'}
                      </p>
                      <p className="text-sm leading-relaxed">{entry.message}</p>
                    </div>
                  </div>
                ))
              )}
              {sparkChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-lg">
                    <p className="text-sm text-purple-200">
                      <span className="inline-block animate-pulse">●</span>
                      <span className="animate-pulse ml-1">Thinking...</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Next Steps */}
            <div className="border-t border-purple-500/30 p-4 space-y-2">
              {irisNextReady && !sparkChatLoading && (
                <button
                  onClick={handleContinueToIrisChat}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm"
                >
                  Continue to RAZONET →
                </button>
              )}
              <p className="text-xs text-gray-400 text-center">
                {sparkChatMode && !sparkChatLoading && 'Type in the search bar above to continue chatting'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {activeToasts.map((toast) => (
              <NotificationToast
                key={toast.id}
                notification={toast}
                onDismiss={() => setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showDecoy && (
          <Suspense fallback={null}>
            <DecoyScreen onDismiss={() => setShowDecoy(false)} reason={decoyReason} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}