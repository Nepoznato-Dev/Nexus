import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  Star,
  Search,
  Bookmark,
  Settings,
  Globe,
  X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl, openInAboutBlank, resolveAboutBlankTargetForAppUrl, shouldForceAboutBlankFirst } from 'utils';
import { useNavigateBack } from '../hooks/useNavigateBack.js';
import { useSettings } from '../hooks/useSettings.js';
import { storage } from '../Components/Storage/clientStorage.js';
import AnimatedBackground from '../Components/UI/AnimatedBackground.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import BrowserTab from '../Components/Browser/BrowserTab.js';
import { Input } from '../Components/UI/input.js';

const DEFAULT_BOOKMARKS = [
  { id: 1, title: 'Startpage', url: 'https://www.startpage.com', favicon: 'https://www.startpage.com/favicon.ico' },
  { id: 2, title: 'Wikipedia', url: 'https://www.wikipedia.org', favicon: 'https://www.wikipedia.org/favicon.ico' },
  { id: 3, title: 'Archive.org', url: 'https://archive.org', favicon: 'https://archive.org/favicon.ico' },
  { id: 4, title: 'Internet Archive', url: 'https://web.archive.org', favicon: 'https://web.archive.org/favicon.ico' },
];

export default function Browser() {
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const { settings } = useSettings();
  const [tabs, setTabs] = useState([
    { id: 1, title: 'New Tab', url: '', loading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [lastRequestedUrl, setLastRequestedUrl] = useState('');
  const hydratedRef = useRef(false);

  const accentColor = '#3498db';
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Search engine URLs - using iframe-friendly alternatives
  const searchEngines = {
    startpage: 'https://www.startpage.com/do/search?q=',
    searx: 'https://searx.be/search?q=',
    metager: 'https://metager.org/meta/meta.ger3?eingabe=',
    mojeek: 'https://www.mojeek.com/search?q=',
    qwant: 'https://www.qwant.com/?q=',
    swisscows: 'https://swisscows.com/en/web?query='
  };

  useEffect(() => {
    loadBrowserState();
  }, []);

  // Save browser state whenever tabs or activeTabId changes
  useEffect(() => {
    if (!hydratedRef.current) return;
    const id = setTimeout(() => {
      saveBrowserState();
    }, 350);

    return () => clearTimeout(id);
  }, [tabs, activeTabId]);

  // Open URL from navigation state
  useEffect(() => {
    if (location.state?.url) {
      navigateTo(location.state.url);
    }
  }, [location.state]);

  // While showing error screen, allow pressing "c" to jump to Landing
  useEffect(() => {
    if (!iframeError) return;
    const handleKey = (e) => {
      if (e.key && e.key.toLowerCase() === 'c') {
        navigate(createPageUrl('Landing'));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [iframeError, navigate]);

  const loadBrowserState = async () => {
    try {
      await storage.init();
      const saved = await storage.loadBrowserState();
      if (saved && saved.tabs && saved.tabs.length > 0) {
        setTabs(saved.tabs);
        setActiveTabId(saved.activeTabId || saved.tabs[0].id);
        setUrlInput(saved.tabs.find(t => t.id === saved.activeTabId)?.url || '');
      }
    } catch (err) {
      console.error('Failed to load browser state:', err);
    } finally {
      hydratedRef.current = true;
    }
  };

  const saveBrowserState = async () => {
    try {
      await storage.init();
      const persistentTabs = tabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        loading: false
      }));
      await storage.saveBrowserState({
        tabs: persistentTabs,
        activeTabId
      });
    } catch (err) {
      console.error('Failed to save browser state:', err);
    }
  };

  const createTab = () => {
    const newTab = {
      id: Date.now(),
      title: 'New Tab',
      url: '',
      loading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('');
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) {
      createTab();
    }
    setTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTabId === tabId) {
      const remaining = tabs.filter(t => t.id !== tabId);
      if (remaining.length > 0) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
    }
  };

  const navigateTo = (url) => {
    if (!url) return;

    // Reset states
    setIframeError(false);

    // Add https if not present
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it's a search query or URL
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        // Use selected search engine
        const searchEngine = settings.browser?.searchEngine || 'startpage';
        const searchUrl = searchEngines[searchEngine] || searchEngines.startpage;
        finalUrl = `${searchUrl}${encodeURIComponent(url)}`;
      }
    }

    // Validate URL before loading
    try {
      new URL(finalUrl);
    } catch (err) {
      console.error('Invalid URL:', err);
      alert('Invalid URL. Please try again.');
      return;
    }

    const aboutBlankTarget = resolveAboutBlankTargetForAppUrl(finalUrl);
    if (aboutBlankTarget) {
      openInAboutBlank(aboutBlankTarget, 'Google Classroom');
      return;
    }

    if (shouldForceAboutBlankFirst(finalUrl)) {
      let launchTitle = 'about:blank';
      try {
        launchTitle = new URL(finalUrl).hostname.replace(/^www\./, '') || launchTitle;
      } catch (error) {
        // Keep fallback title.
      }
      openInAboutBlank(finalUrl, launchTitle);
      return;
    }

    setTabs(prev => prev.map(t =>
      t.id === activeTabId
        ? { ...t, url: finalUrl, title: new URL(finalUrl).hostname, loading: true }
        : t
    ));
    setLastRequestedUrl(finalUrl);

    // Simulate loading
    setTimeout(() => {
      setTabs(prev => prev.map(t =>
        t.id === activeTabId
          ? { ...t, loading: false }
          : t
      ));
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  const addBookmark = () => {
    if (activeTab?.url) {
      const newBookmark = {
        id: Date.now(),
        title: activeTab.title,
        url: activeTab.url,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(activeTab.url).hostname}`
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const goHome = () => {
    setTabs(prev => prev.map(t =>
      t.id === activeTabId
        ? { ...t, url: '', title: 'New Tab' }
        : t
    ));
    setUrlInput('');
  };

  const refresh = () => {
    if (activeTab?.url) {
      setIframeError(false);
      setTabs(prev => prev.map(t =>
        t.id === activeTabId
          ? { ...t, loading: true }
          : t
      ));
      setTimeout(() => {
        setTabs(prev => prev.map(t =>
          t.id === activeTabId
            ? { ...t, loading: false }
            : t
        ));
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground type="gradient" accentColor={accentColor} />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="px-4 py-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <NeonButton variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </NeonButton>
            <div>
              <h1 className="text-xl font-bold text-white">Browser</h1>
            </div>
          </div>
        </motion.header>

        {/* Browser Window */}
        <GlassCard className="flex-grow flex flex-col overflow-hidden mx-2 mb-2" hover={false}>
          {/* Tabs Bar */}
          <div className="flex items-center gap-1 p-2 border-b border-white/10 overflow-x-auto">
            <AnimatePresence mode="popLayout">
              {tabs.map(tab => (
                <BrowserTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onSelect={() => {
                    setActiveTabId(tab.id);
                    setUrlInput(tab.url);
                  }}
                  onClose={() => closeTab(tab.id)}
                  accentColor={accentColor}
                />
              ))}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={createTab}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center gap-2 p-3 border-b border-white/10">
            <div className="flex items-center gap-1">
              <NeonButton variant="ghost" size="icon" disabled>
                <ArrowLeft className="w-4 h-4" />
              </NeonButton>
              <NeonButton variant="ghost" size="icon" disabled>
                <ArrowRight className="w-4 h-4" />
              </NeonButton>
              <NeonButton variant="ghost" size="icon" onClick={refresh}>
                <RotateCw className={`w-4 h-4 ${activeTab?.loading ? 'animate-spin' : ''}`} />
              </NeonButton>
              <NeonButton variant="ghost" size="icon" onClick={goHome}>
                <Home className="w-4 h-4" />
              </NeonButton>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Search or enter URL..."
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white h-9"
                />
              </div>
            </form>

            <NeonButton variant="ghost" size="icon" onClick={addBookmark}>
              <Star className="w-4 h-4" />
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="icon"
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              <Bookmark className="w-4 h-4" />
            </NeonButton>
          </div>

          {/* Content Area */}
          <div className="flex-grow relative">
            {activeTab?.url ? (
              <div className="w-full h-full bg-white rounded-lg overflow-hidden relative">
                {activeTab.loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                      <p className="text-white/60">Loading...</p>
                    </div>
                  </div>
                ) : iframeError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5]">
                    <motion.div
                      className="text-left p-6 sm:p-8 max-w-lg w-full bg-white border border-gray-200 shadow-md rounded-md"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 flex items-center justify-center">
                          <svg viewBox="0 0 64 64" className="w-14 h-14 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="14" y="12" width="36" height="32" rx="4" ry="4" />
                            <circle cx="24" cy="30" r="2" />
                            <circle cx="40" cy="30" r="2" />
                            <path d="M22 42c4 4 16 4 20 0" />
                            <path d="M18 12l-4-6" />
                            <path d="M46 12l4-6" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">404. That’s an error.</h3>
                          <p className="text-sm text-gray-600 mb-2">The requested URL <span className="break-all">{lastRequestedUrl || activeTab.title}</span> could not be displayed here.</p>
                          <p className="text-sm text-gray-600 mb-4">That’s all we know.</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => window.open(activeTab.url, '_blank', 'noopener,noreferrer')}
                              className="px-4 py-2 bg-[#1a73e8] text-white rounded shadow hover:bg-[#1664c4] transition-colors"
                            >
                              Open in new tab
                            </button>
                            <button
                              onClick={() => {
                                setIframeError(false);
                                setTabs(prev => prev.map(t =>
                                  t.id === activeTabId ? { ...t, url: '', title: 'New Tab' } : t
                                ));
                                setUrlInput('');
                              }}
                              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              Go back
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <iframe
                      src={activeTab.url}
                      className="w-full h-full border-0"
                      title={activeTab.title}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                      referrerPolicy="no-referrer"
                      onLoad={() => {
                        setIframeError(false);
                        setTabs(prev => prev.map(t =>
                          t.id === activeTabId ? { ...t, loading: false } : t
                        ));
                      }}
                      onError={() => setIframeError(true)}
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <div className="flex gap-2">
                        <NeonButton
                          variant="solid"
                          onClick={() => window.open(activeTab.url, '_blank', 'noopener,noreferrer')}
                        >
                          Open in new tab ↗
                        </NeonButton>
                        <NeonButton
                          variant="ghost"
                          onClick={() => openInAboutBlank(activeTab.url, activeTab.title || 'Browser')}
                        >
                          Open in about:blank
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8">
                {/* New Tab Page */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
                  <p className="text-white/50">Search or enter a URL to get started</p>
                </motion.div>

                {/* Bookmarks Grid */}
                {showBookmarks && (
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {bookmarks.map((bookmark, index) => (
                      <motion.button
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        onClick={() => {
                          setUrlInput(bookmark.url);
                          navigateTo(bookmark.url);
                        }}
                        className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-center"
                      >
                        <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white/10 flex items-center justify-center">
                          {bookmark.favicon ? (
                            <img src={bookmark.favicon} alt="" className="w-6 h-6" />
                          ) : (
                            <Globe className="w-5 h-5 text-white/50" />
                          )}
                        </div>
                        <span className="text-sm text-white/70 group-hover:text-white truncate block">
                          {bookmark.title}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}