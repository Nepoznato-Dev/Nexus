import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, Bell } from 'lucide-react';
import { createPageUrl } from 'utils';
import { session, storage } from './Components/Storage/clientStorage.js';
import { redirectOnSessionInvalid } from './utils/iframeNavigation';
import KeyboardHandler from './Components/UI/KeyboardHandler.js';
import WidgetsOverlay from './Components/Widgets/WidgetsOverlay.js';
import Sidebar from './Components/UI/Sidebar.js';
import { useNotifications, NotificationCenter, NotificationToast } from './Components/Notifications/NotificationCenter.js';
import ScheduleTracker from './Components/Schedule/ScheduleTracker.js';
import DecoyScreen from './Components/Stealth/DecoyScreen.js';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen.js';
import { AnimatePresence } from 'framer-motion';
import PerformancePanel from './Components/Performance/PerformancePanel.js';

const getFakeTitle = () => {
  const titles = ['Math Homework', 'Study Session', 'Project Notes', 'Research Dashboard'];
  return titles[Math.floor(Math.random() * titles.length)];
};

export default function Layout({ children, currentPageName }) {
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
    const baseTitle = currentPageName ? `Nexus — ${currentPageName}` : 'Nexus';
    const title = pageStatus ? `${baseTitle} — ${pageStatus}` : baseTitle;
    document.title = title;
    
    window.nexusNotifications = {
      show: (notification) => {
        const newNotif = notifications.addNotification(notification);
        setActiveToasts((prev) => [...prev, newNotif]);
      }
    };

    const originalFavicon = '/favicon.ico';
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const fakeTitle = getFakeTitle();
        document.title = fakeTitle;
        // Change favicon to neutral study icon
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><text x=\"50\" y=\"70\" font-size=\"70\" text-anchor=\"middle\" fill=\"%23333\">📚</text></svg>';
        if (!document.querySelector("link[rel*='icon']")) {
          document.head.appendChild(link);
        }
      } else {
        // Tab is active - show real title
        document.title = pageStatus ? `${baseTitle} — ${pageStatus}` : baseTitle;
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = originalFavicon;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const openNotifications = () => setNotificationCenterOpen(true);
    window.addEventListener('nexus:open-notifications', openNotifications);
    return () => {
      delete window.nexusNotifications;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('nexus:open-notifications', openNotifications);
    };
  }, [notifications, currentPageName, pageStatus]);

  // Dynamic loading: wait for both min time AND page readiness
  useEffect(() => {
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
  }, [location.pathname]);

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
        const sessions = JSON.parse(localStorage.getItem('nexus_active_sessions') || '[]');
        const email = localStorage.getItem('nexus_user_email') || sessionStorage.getItem('nexus_user_email') || 'Anonymous';
        const role = session.getRole?.() || 'guest';
        const sessionId = session.get?.();
        
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

    // Check for kicks every 5 seconds (reduced from 1s for performance)
    const kickInterval = setInterval(checkKickStatus, 5000);
    
    // Check for bans every 5 seconds
    const banInterval = setInterval(checkBanStatus, 5000);
    
    // Check for timeout every 60 seconds
    const timeoutInterval = setInterval(checkTimeout, 60000);
    
    // Update heartbeat every 10 seconds
    updateHeartbeat();
    const heartbeatInterval = setInterval(updateHeartbeat, 10000);
    
    return () => {
      clearInterval(kickInterval);
      clearInterval(banInterval);
      clearInterval(timeoutInterval);
      clearInterval(heartbeatInterval);
    };
  }, [navigate]);
  
  // Don't show search bar on Browser or StudyTools page
  const isBrowserPage = location.pathname.includes('/browser');
  const isStudyToolsPage = location.pathname.includes('/study');
  const isLandingPage = location.pathname.includes('/landing') || location.pathname === '/';
  const isAuthPage = location.pathname.includes('/auth');
  const isConsentPage = location.pathname.includes('/consent');
  const shouldHideUI = isLandingPage || isAuthPage || isConsentPage;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (searchMode === 'browser') {
        navigate(createPageUrl('Browser'), { state: { url: searchInput.trim() } });
        setSearchInput('');
      } else {
        // AI mode: open dropdown instead of navigating
        setAiDropdownOpen(true);
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

  if (requireAboutBlank) {

  return (
    <div className="min-h-screen bg-[#2a2a3e] flex flex-col">
      <LoadingScreen isLoading={isPageLoading} showDuration={900} />

      {!shouldHideUI && <KeyboardHandler />}

      <div className="flex min-h-screen flex-1">
        {!shouldHideUI && (
          <Sidebar
            onWidthChange={setSidebarWidth}
            onTogglePerformance={() => setShowPerformancePanel((v) => !v)}
            performanceOpen={showPerformancePanel}
          />
        )}

        {!shouldHideUI && (
          <PerformancePanel visible={showPerformancePanel} sidebarWidth={sidebarWidth} />
        )}

        <div className="flex-1 flex flex-col min-h-screen">
          {!shouldHideUI && <WidgetsOverlay />}

          {!shouldHideUI && !isBrowserPage && !isStudyToolsPage && (
            <div className="z-10 backdrop-blur-sm border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAiModeToggle}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      searchMode === 'ai' || aiDropdownOpen
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
                      placeholder={searchMode === 'browser' ? 'Search or enter URL...' : 'Ask AI anything...'}
                      className={`w-full pl-10 pr-4 py-2 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        searchMode === 'ai'
                          ? 'border-purple-500/30 focus:ring-purple-500/50'
                          : 'border-cyan-500/30 focus:ring-cyan-500/50'
                      }`}
                    />
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

          <div className="relative max-w-7xl mx-auto px-4 pb-16 w-full flex-1">
            {children}
          </div>

          <ScheduleTracker />
        </div>
      </div>

      <style>{`
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


      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications.notifications}
        onMarkAsRead={notifications.markAsRead}
        onMarkAllAsRead={notifications.markAllAsRead}
        onDelete={notifications.deleteNotification}
        onClearAll={notifications.clearAll}
      />

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
          <DecoyScreen onDismiss={() => setShowDecoy(false)} reason={decoyReason} />
        )}
      </AnimatePresence>
    </div>
  );
}