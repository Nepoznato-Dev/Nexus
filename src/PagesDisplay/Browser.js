import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, RotateCw, Home, Plus, Star, Search, Bookmark,
  Settings, Globe, X, Shield, Eye, BookOpen, Clock, Layers, Lock, Zap,
  FileText, AlertTriangle, Timer, User, MapPin, Camera
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl, openInAboutBlank } from 'utils';
import { useNavigateBack } from '../hooks/useNavigateBack.js';
import { useSettings } from '../hooks/useSettings.js';
import AnimatedBackground from '../Components/UI/AnimatedBackground.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import BrowserTab from '../Components/Browser/BrowserTab.js';
import BrowserNewTab from '../Components/Browser/BrowserNewTab.js';
import BrowserCanvas2D from '../Components/Browser/BrowserCanvas2D.js';
import BrowserCanvas3D from '../Components/Browser/BrowserCanvas3D.js';
import BrowserSettings from '../Components/Browser/BrowserSettings.js';
import { HistoryPanel, BookmarksPanel, ReadingListPanel, NotesListPanel, SessionPanel } from '../Components/Browser/BrowserPanels.js';
import { loadBrowserState, saveBrowserState, DEFAULT_BROWSER_STATE, DEFAULT_SETTINGS } from '../Components/Browser/browserState.js';
import { shouldBlockUrl, enforceHttps, autoTagUrl, normalizeUrl, matchShortcut, displayUrl } from '../Components/Browser/browserFilters.js';

export default function Browser() {
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const { settings: appSettings } = useSettings();
  const iframeRef = useRef(null);
  const urlInputRef = useRef(null);

  const [tabs, setTabs] = useState(DEFAULT_BROWSER_STATE.tabs);
  const [activeTabId, setActiveTabId] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [bookmarks, setBookmarks] = useState(DEFAULT_BROWSER_STATE.bookmarks);
  const [history, setHistory] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState({});
  const [groups, setGroups] = useState([]);
  const [profiles, setProfiles] = useState(DEFAULT_BROWSER_STATE.profiles);
  const [currentProfile, setCurrentProfile] = useState('default');
  const [browserSettings, setBrowserSettings] = useState(DEFAULT_SETTINGS);

  const [sidePanel, setSidePanel] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [lastRequestedUrl, setLastRequestedUrl] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [readerMode, setReaderMode] = useState(false);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#ffdd57');
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(null);
  const [pomodoroBreakMode, setPomodoroBreakMode] = useState(false);

  const accentColor = browserSettings.themeColors?.accent || '#3498db';
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const isVertical = browserSettings.layout === 'vertical' || browserSettings.layout === 'sidebar';
  const density = browserSettings.density || 'normal';
  const paddingY = density === 'compact' ? 'py-1' : density === 'spacious' ? 'py-3' : 'py-2';
  const toolbarBg = browserSettings.themeColors?.toolbar || '#0f0f1a';
  const tabsBg = browserSettings.themeColors?.tabs || '#1a1a2e';

  useEffect(() => {
    const saved = loadBrowserState();
    if (saved) {
      if (saved.tabs?.length > 0) setTabs(saved.tabs);
      if (saved.activeTabId) setActiveTabId(saved.activeTabId);
      if (saved.bookmarks?.length > 0) setBookmarks(saved.bookmarks);
      if (saved.history) setHistory(saved.history);
      if (saved.readingList) setReadingList(saved.readingList);
      if (saved.sessions) setSessions(saved.sessions);
      if (saved.notes) setNotes(saved.notes);
      if (saved.groups) setGroups(saved.groups);
      if (saved.profiles) setProfiles(saved.profiles);
      if (saved.currentProfile) setCurrentProfile(saved.currentProfile);
      if (saved.settings) setBrowserSettings({ ...DEFAULT_SETTINGS, ...saved.settings });
    }
  }, []);

  useEffect(() => {
    saveBrowserState({ tabs, activeTabId, bookmarks, history, readingList, sessions, notes, groups, profiles, currentProfile, settings: browserSettings });
  }, [tabs, activeTabId, bookmarks, history, readingList, sessions, notes, groups, profiles, currentProfile, browserSettings]);

  useEffect(() => {
    setUrlInput(activeTab?.url || '');
    setIframeError(false);
    setReaderMode(false);
    if (activeTab?.url) {
      try {
        const domain = new URL(activeTab.url).hostname;
        setStickyNotes(notes[domain] || []);
      } catch { setStickyNotes([]); }
    } else {
      setStickyNotes([]);
    }
  }, [activeTabId, activeTab?.url]);

  useEffect(() => {
    if (location.state?.url) navigateTo(location.state.url);
  }, [location.state]);

  useEffect(() => {
    const timeout = browserSettings.hibernationTimeout;
    if (!timeout) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId || t.hibernated || !t.url) return t;
        if (t.lastActive && (now - t.lastActive) > timeout * 60 * 1000) return { ...t, hibernated: true };
        return t;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, [browserSettings.hibernationTimeout, activeTabId]);

  useEffect(() => {
    if (!pomodoroActive || pomodoroTime === null) return;
    if (pomodoroTime <= 0) {
      const isBreak = pomodoroBreakMode;
      setPomodoroBreakMode(!isBreak);
      setPomodoroTime(!isBreak ? (browserSettings.pomodoroBreak || 5) * 60 : (browserSettings.pomodoroWork || 25) * 60);
      return;
    }
    const t = setTimeout(() => setPomodoroTime(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [pomodoroActive, pomodoroTime, pomodoroBreakMode]);

  useEffect(() => {
    const handler = (e) => {
      const shortcuts = browserSettings.shortcuts || DEFAULT_SETTINGS.shortcuts;
      if (matchShortcut(e, shortcuts.newTab)) { e.preventDefault(); createTab(); }
      else if (matchShortcut(e, shortcuts.closeTab)) { e.preventDefault(); closeTab(activeTabId); }
      else if (matchShortcut(e, shortcuts.focusUrl)) { e.preventDefault(); urlInputRef.current?.focus(); urlInputRef.current?.select(); }
      else if (matchShortcut(e, shortcuts.reload)) { e.preventDefault(); refreshTab(); }
      else if (matchShortcut(e, shortcuts.incognito)) { e.preventDefault(); createTab(true); }
      else if (matchShortcut(e, shortcuts.readerMode)) { e.preventDefault(); toggleReaderMode(); }
      else if (matchShortcut(e, shortcuts.screenshot)) { e.preventDefault(); captureScreenshot(); }
      else if (matchShortcut(e, shortcuts.settings)) { e.preventDefault(); setShowSettings(s => !s); }
      else if (matchShortcut(e, shortcuts.nextTab)) { e.preventDefault(); cycleTab(1); }
      else if (matchShortcut(e, shortcuts.prevTab)) { e.preventDefault(); cycleTab(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [browserSettings.shortcuts, activeTabId, tabs]);

  const createTab = (incognito = false) => {
    const newTab = {
      id: Date.now(), title: 'New Tab', url: '', loading: false, favicon: null,
      groupId: null, hibernated: false, muted: false, pinned: false,
      incognito: incognito || browserSettings.incognitoMode,
      history: [], historyIndex: -1, lastActive: Date.now(),
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('');
  };

  const closeTab = (tabId) => {
    const remaining = tabs.filter(t => t.id !== tabId);
    if (remaining.length === 0) { createTab(); return; }
    setTabs(remaining);
    if (activeTabId === tabId) {
      const closedIdx = tabs.findIndex(t => t.id === tabId);
      setActiveTabId(remaining[Math.max(0, closedIdx - 1)]?.id || remaining[0].id);
    }
  };

  const cycleTab = (dir) => {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    setActiveTabId(tabs[(idx + dir + tabs.length) % tabs.length].id);
  };

  const selectTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    if (tab.hibernated) setTabs(prev => prev.map(t => t.id === tabId ? { ...t, hibernated: false } : t));
    setActiveTabId(tabId);
    setUrlInput(tab.url || '');
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, lastActive: Date.now() } : t));
  };

  const navigateTo = useCallback((rawUrl) => {
    if (!rawUrl) return;
    if (rawUrl === 'browser://canvas2d' || rawUrl === 'browser://canvas3d') {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: rawUrl, title: rawUrl, loading: false } : t));
      setUrlInput(rawUrl);
      setIframeError(false);
      return;
    }
    const searchEngine = browserSettings.searchEngine || 'duckduckgo';
    let finalUrl = normalizeUrl(rawUrl, searchEngine);
    if (browserSettings.httpsEnforcer && finalUrl.startsWith('http://')) finalUrl = enforceHttps(finalUrl);
    if (shouldBlockUrl(finalUrl, browserSettings.adBlocker, browserSettings.trackerBlocking, browserSettings.adBlockerAllowlist || [])) {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: 'blocked:' + finalUrl, title: 'Blocked', loading: false } : t));
      setUrlInput('blocked:' + finalUrl);
      setIframeError(false);
      return;
    }
    setIframeError(false);
    setReaderMode(false);
    let hostname = '';
    try { hostname = new URL(finalUrl).hostname; } catch {}
    setTabs(prev => prev.map(t => t.id === activeTabId
      ? { ...t, url: finalUrl, title: hostname || finalUrl, loading: true, favicon: hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32` : null, lastActive: Date.now() }
      : t
    ));
    setUrlInput(finalUrl);
    setLastRequestedUrl(finalUrl);
    if (!activeTab?.incognito && !browserSettings.incognitoMode) {
      setHistory(prev => [
        { url: finalUrl, title: hostname || finalUrl, favicon: hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32` : null, timestamp: Date.now() },
        ...prev.filter(h => h.url !== finalUrl)
      ].slice(0, 1000));
    }
    setTimeout(() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t)), 1500);
  }, [activeTabId, browserSettings, activeTab]);

  const handleUrlSubmit = (e) => { e.preventDefault(); setShowSuggestions(false); navigateTo(urlInput); };
  const goHome = () => { setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: '', title: 'New Tab' } : t)); setUrlInput(''); };
  const refreshTab = () => {
    if (activeTab?.url) {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: true } : t));
      setTimeout(() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, loading: false } : t)), 1000);
    }
  };
  const toggleReaderMode = () => { if (!activeTab?.url || activeTab.url.startsWith('browser://')) return; setReaderMode(r => !r); };
  const toggleMute = (tabId) => setTabs(prev => prev.map(t => t.id === tabId ? { ...t, muted: !t.muted } : t));

  const updateSuggestions = (input) => {
    if (!input || input.length < 2) { setSearchSuggestions([]); setShowSuggestions(false); return; }
    const q = input.toLowerCase();
    const suggestions = [];
    tabs.forEach(t => { if (t.url && (t.url.toLowerCase().includes(q) || t.title?.toLowerCase().includes(q))) suggestions.push({ type: 'tab', label: t.title || t.url, value: t.url }); });
    bookmarks.forEach(b => { if (b.url?.toLowerCase().includes(q) || b.title?.toLowerCase().includes(q)) suggestions.push({ type: 'bookmark', label: b.title, value: b.url }); });
    history.slice(0, 200).forEach(h => { if (h.url?.toLowerCase().includes(q) || h.title?.toLowerCase().includes(q)) suggestions.push({ type: 'history', label: h.title || h.url, value: h.url }); });
    suggestions.push({ type: 'search', label: `Search: "${input}"`, value: input });
    setSearchSuggestions(suggestions.slice(0, 8));
    setShowSuggestions(true);
  };

  const addBookmark = () => {
    if (!activeTab?.url || activeTab.url.startsWith('browser://') || activeTab.url.startsWith('blocked:')) return;
    if (bookmarks.some(b => b.url === activeTab.url)) { setBookmarks(prev => prev.filter(b => b.url !== activeTab.url)); return; }
    const hostname = (() => { try { return new URL(activeTab.url).hostname; } catch { return activeTab.url; } })();
    setBookmarks(prev => [...prev, { id: Date.now(), title: activeTab.title || hostname, url: activeTab.url, favicon: activeTab.favicon, tags: autoTagUrl(activeTab.url, activeTab.title), savedAt: Date.now() }]);
  };
  const isBookmarked = bookmarks.some(b => b.url === activeTab?.url);

  const addToReadingList = (url, title) => {
    if (!url || readingList.some(r => r.url === url)) return;
    setReadingList(prev => [{ id: Date.now(), url, title, savedAt: Date.now(), read: false }, ...prev]);
  };

  const addNote = () => {
    if (!newNoteText.trim() || !activeTab?.url) return;
    try {
      const domain = new URL(activeTab.url).hostname;
      const note = { id: Date.now(), content: newNoteText, color: noteColor, createdAt: Date.now(), x: 100 + Math.random() * 200, y: 100 + Math.random() * 100 };
      const updated = { ...notes, [domain]: [...(notes[domain] || []), note] };
      setNotes(updated);
      setStickyNotes(updated[domain]);
      setNewNoteText('');
      setShowNoteEditor(false);
    } catch {}
  };

  const removeNote = (noteId) => {
    if (!activeTab?.url) return;
    try {
      const domain = new URL(activeTab.url).hostname;
      const updated = { ...notes, [domain]: (notes[domain] || []).filter(n => n.id !== noteId) };
      setNotes(updated);
      setStickyNotes(updated[domain] || []);
    } catch {}
  };

  const saveSession = (name) => setSessions(prev => [...prev, { id: Date.now(), name, tabs: tabs.map(t => ({ url: t.url, title: t.title })), savedAt: Date.now() }]);
  const restoreSession = (session) => {
    const newTabs = session.tabs.map((t, i) => ({ ...DEFAULT_BROWSER_STATE.tabs[0], id: Date.now() + i, title: t.title, url: t.url, loading: false }));
    setTabs(newTabs);
    setActiveTabId(newTabs[0].id);
    setSidePanel(null);
  };

  const captureScreenshot = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 675;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0a12'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Nexus Browser Screenshot', 24, 40);
      ctx.font = '14px sans-serif'; ctx.fillStyle = '#ffffff80';
      ctx.fillText(`URL: ${activeTab?.url || 'New Tab'}`, 24, 68);
      ctx.fillText(`Captured: ${new Date().toLocaleString()}`, 24, 90);
      ctx.fillStyle = '#ffffff08'; ctx.fillRect(20, 110, canvas.width - 40, canvas.height - 130);
      ctx.fillStyle = '#ffffff40'; ctx.font = '13px sans-serif';
      ctx.fillText('Full page screenshots require same-origin content.', 24, canvas.height / 2);
      const link = document.createElement('a');
      link.download = `nexus-screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error(e); }
  };

  const startPomodoro = () => { setPomodoroBreakMode(false); setPomodoroTime((browserSettings.pomodoroWork || 25) * 60); setPomodoroActive(true); setBrowserSettings(s => ({ ...s, focusModeActive: true })); };
  const stopPomodoro = () => { setPomodoroActive(false); setPomodoroTime(null); setBrowserSettings(s => ({ ...s, focusModeActive: false })); };
  const formatPomodoroTime = () => pomodoroTime === null ? '' : `${Math.floor(pomodoroTime / 60)}:${(pomodoroTime % 60).toString().padStart(2, '0')}`;

  const isFocusBlocked = (url) => {
    if (!browserSettings.focusModeActive || !url) return false;
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return (browserSettings.focusBlocklist || []).some(d => hostname === d || hostname.endsWith('.' + d));
    } catch { return false; }
  };

  const renderSpecialPage = (url) => {
    if (url === 'browser://canvas2d') return <BrowserCanvas2D />;
    if (url === 'browser://canvas3d') return <BrowserCanvas3D />;
    if (url?.startsWith('blocked:')) {
      const blocked = url.slice(8);
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a12]">
          <div className="text-center p-8 max-w-md">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400/60" />
            <h2 className="text-xl font-semibold text-white mb-2">Blocked by Nexus Privacy Filter</h2>
            <p className="text-white/50 text-sm mb-4">This URL was blocked by ad/tracker filters.</p>
            <p className="text-white/30 text-xs font-mono break-all mb-4">{blocked}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={goHome} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg">← Home</button>
              <button onClick={() => { try { const s = { ...browserSettings, adBlockerAllowlist: [...(browserSettings.adBlockerAllowlist || []), new URL(blocked).hostname] }; setBrowserSettings(s); setTimeout(() => navigateTo(blocked), 100); } catch {} }} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg">Allow this site</button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" onClick={() => setShowSuggestions(false)}>
      <AnimatedBackground type="gradient" accentColor={accentColor} />
      <div className="relative z-10 h-screen flex flex-col">
        <motion.header className={`px-4 ${paddingY} flex items-center gap-3 border-b border-white/5 flex-shrink-0`} style={{ background: toolbarBg + 'cc' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <NeonButton variant="ghost" size="icon" onClick={goBack} title="Back to Nexus"><ArrowLeft className="w-5 h-5" /></NeonButton>
          <span className="text-sm font-semibold text-white/70">Nexus Browser</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-80" style={{ background: (profiles[currentProfile]?.color || '#3498db') + '33', color: profiles[currentProfile]?.color || '#3498db' }} onClick={() => setShowSettings(true)}>
            <User className="w-3 h-3" />{profiles[currentProfile]?.name || 'Default'}
          </div>
          {(browserSettings.incognitoMode || activeTab?.incognito) && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
              <Eye className="w-3 h-3" />Incognito+
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {pomodoroActive && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${pomodoroBreakMode ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                <Timer className="w-3 h-3" />{pomodoroBreakMode ? 'Break' : 'Focus'} {formatPomodoroTime()}
                <button onClick={stopPomodoro} className="ml-1 opacity-60 hover:opacity-100">✕</button>
              </div>
            )}
            {browserSettings.focusModeActive && !pomodoroActive && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs">
                <Shield className="w-3 h-3" />Focus Mode
                <button onClick={() => setBrowserSettings(s => ({ ...s, focusModeActive: false }))} className="ml-1 opacity-60 hover:opacity-100">✕</button>
              </div>
            )}
          </div>
        </motion.header>

        <GlassCard className="flex-grow flex overflow-hidden mx-2 mb-2" hover={false}>
          <div className="flex flex-col w-full h-full overflow-hidden">
            {isVertical ? (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="w-52 flex-shrink-0 flex flex-col border-r border-white/10 overflow-hidden" style={{ background: tabsBg }}>
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5">
                    <span className="text-xs text-white/40 font-medium">Tabs ({tabs.length})</span>
                    <div className="flex gap-1">
                      <button onClick={() => createTab()} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => createTab(true)} className="p-1 hover:bg-purple-500/20 rounded text-white/40 hover:text-purple-300"><Eye className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {tabs.map(tab => <BrowserTab key={tab.id} tab={tab} isActive={tab.id === activeTabId} onSelect={() => selectTab(tab.id)} onClose={() => closeTab(tab.id)} onToggleMute={() => toggleMute(tab.id)} accentColor={accentColor} vertical={true} groupColor={tab.groupId ? groups.find(g => g.id === tab.groupId)?.color : null} />)}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  {renderNavBar()}
                  {renderContent()}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-0.5 border-b border-white/10 overflow-x-auto flex-shrink-0" style={{ background: tabsBg, paddingTop: density === 'compact' ? 3 : 5, paddingLeft: 6, paddingRight: 6 }}>
                  <AnimatePresence mode="popLayout">
                    {tabs.map(tab => <BrowserTab key={tab.id} tab={tab} isActive={tab.id === activeTabId} onSelect={() => selectTab(tab.id)} onClose={() => closeTab(tab.id)} onToggleMute={() => toggleMute(tab.id)} accentColor={accentColor} groupColor={tab.groupId ? groups.find(g => g.id === tab.groupId)?.color : null} />)}
                  </AnimatePresence>
                  <button onClick={() => createTab()} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white flex-shrink-0 mb-0.5" title="New Tab (Ctrl+T)"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => createTab(true)} className="p-2 rounded-lg hover:bg-purple-500/20 text-white/30 hover:text-purple-300 flex-shrink-0 mb-0.5" title="Incognito+ (Ctrl+Shift+N)"><Eye className="w-4 h-4" /></button>
                </div>
                {renderNavBar()}
                {renderContent()}
              </>
            )}
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {sidePanel && (
          <motion.div className="fixed right-0 top-0 h-full w-80 z-50 shadow-2xl overflow-hidden border-l border-white/10" style={{ background: '#0f0f1a' }} initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
            {sidePanel === 'history' && <HistoryPanel history={history} onNavigate={(url) => { navigateTo(url); setSidePanel(null); }} onClose={() => setSidePanel(null)} onClear={() => setHistory([])} />}
            {sidePanel === 'bookmarks' && <BookmarksPanel bookmarks={bookmarks} onNavigate={(url) => { navigateTo(url); setSidePanel(null); }} onClose={() => setSidePanel(null)} onDelete={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))} onAdd={addBookmark} currentUrl={activeTab?.url} currentTitle={activeTab?.title} />}
            {sidePanel === 'reading' && <ReadingListPanel items={readingList} onNavigate={(url) => { navigateTo(url); setSidePanel(null); }} onClose={() => setSidePanel(null)} onDelete={(id) => setReadingList(prev => prev.filter(r => r.id !== id))} onToggleRead={(id) => setReadingList(prev => prev.map(r => r.id === id ? { ...r, read: !r.read } : r))} onAdd={() => addToReadingList(activeTab?.url, activeTab?.title)} currentUrl={activeTab?.url} currentTitle={activeTab?.title} />}
            {sidePanel === 'notes' && <NotesListPanel notes={notes} onClose={() => setSidePanel(null)} onNavigate={(url) => { navigateTo(url); setSidePanel(null); }} />}
            {sidePanel === 'sessions' && <SessionPanel sessions={sessions} tabs={tabs} onClose={() => setSidePanel(null)} onSave={saveSession} onRestore={restoreSession} onDelete={(id) => setSessions(prev => prev.filter(s => s.id !== id))} />}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <motion.div className="relative w-[700px] max-w-[96vw] h-[520px] rounded-2xl overflow-hidden shadow-2xl z-10" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <BrowserSettings settings={browserSettings} onUpdate={setBrowserSettings} profiles={profiles} currentProfile={currentProfile} onSwitchProfile={(id) => { setCurrentProfile(id); setShowSettings(false); }} onClose={() => setShowSettings(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {stickyNotes.map(note => (
        <StickyNote key={note.id} note={note} onRemove={() => removeNote(note.id)} onUpdate={(updated) => {
          try {
            const domain = new URL(activeTab.url).hostname;
            const updatedNotes = { ...notes, [domain]: (notes[domain] || []).map(n => n.id === note.id ? updated : n) };
            setNotes(updatedNotes);
            setStickyNotes(updatedNotes[domain] || []);
          } catch {}
        }} />
      ))}
    </div>
  );

  function renderNavBar() {
    const isInsecure = activeTab?.url?.startsWith('http://');
    const isBlocked = activeTab?.url?.startsWith('blocked:');
    return (
      <div className={`flex items-center gap-1 px-2 ${paddingY} border-b border-white/10 flex-shrink-0 flex-wrap`} style={{ background: toolbarBg }}>
        <NeonButton variant="ghost" size="icon" onClick={() => window.history.back()} title="Back"><ArrowLeft className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => window.history.forward()} title="Forward"><ArrowRight className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={refreshTab} title="Reload (Ctrl+R)"><RotateCw className={`w-4 h-4 ${activeTab?.loading ? 'animate-spin' : ''}`} /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={goHome} title="Home"><Home className="w-4 h-4" /></NeonButton>
        <div className="flex-grow relative min-w-[160px]">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            {isBlocked ? <Shield className="w-3.5 h-3.5 text-red-400" /> : isInsecure ? <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" title="Insecure" /> : activeTab?.url ? <Lock className="w-3 h-3 text-green-400/70" title="HTTPS" /> : <Search className="w-3.5 h-3.5 text-white/30" />}
          </div>
          <form onSubmit={handleUrlSubmit}>
            <input ref={urlInputRef} value={urlInput} onChange={(e) => { setUrlInput(e.target.value); updateSuggestions(e.target.value); }} onFocus={(e) => { e.target.select(); setUrlInput(activeTab?.url || ''); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} className={`w-full pl-7 pr-2 py-1.5 bg-white/5 border ${isInsecure ? 'border-yellow-500/30' : 'border-white/10'} focus:border-white/25 text-white text-sm rounded-xl outline-none`} placeholder="Search or enter URL..." autoComplete="off" spellCheck={false} />
          </form>
          <AnimatePresence>
            {showSuggestions && searchSuggestions.length > 0 && (
              <motion.div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                {searchSuggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer" onClick={() => { navigateTo(s.value); setShowSuggestions(false); }}>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${s.type === 'tab' ? 'bg-blue-500/20 text-blue-300' : s.type === 'bookmark' ? 'bg-yellow-500/20 text-yellow-300' : s.type === 'history' ? 'bg-white/10 text-white/50' : 'bg-green-500/20 text-green-300'}`}>{s.type}</span>
                    <span className="text-sm text-white/70 truncate">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <NeonButton variant="ghost" size="icon" onClick={addBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark'} className={isBookmarked ? 'text-yellow-400' : ''}><Star className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-400' : ''}`} /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={toggleReaderMode} title="Reader Mode" className={readerMode ? 'text-green-400' : ''}><BookOpen className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => setSidePanel(sidePanel === 'history' ? null : 'history')} title="History" className={sidePanel === 'history' ? 'text-blue-400' : ''}><Clock className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => setSidePanel(sidePanel === 'bookmarks' ? null : 'bookmarks')} title="Bookmarks" className={sidePanel === 'bookmarks' ? 'text-yellow-400' : ''}><Bookmark className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => setSidePanel(sidePanel === 'reading' ? null : 'reading')} title="Reading List" className={sidePanel === 'reading' ? 'text-green-400' : ''}><FileText className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => setShowNoteEditor(!showNoteEditor)} title="Pin Note" className={showNoteEditor ? 'text-yellow-400' : ''}><MapPin className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => setSidePanel(sidePanel === 'sessions' ? null : 'sessions')} title="Sessions" className={sidePanel === 'sessions' ? 'text-purple-400' : ''}><Layers className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={captureScreenshot} title="Screenshot"><Camera className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={pomodoroActive ? stopPomodoro : startPomodoro} title="Pomodoro" className={pomodoroActive ? 'text-orange-400' : ''}><Timer className="w-4 h-4" /></NeonButton>
        <NeonButton variant="ghost" size="icon" onClick={() => setShowSettings(true)} title="Settings"><Settings className="w-4 h-4" /></NeonButton>
        <button onClick={() => navigateTo('browser://canvas2d')} className="px-2 py-1 text-xs bg-white/5 hover:bg-blue-500/20 text-white/50 hover:text-blue-300 rounded-lg" title="2D Canvas">2D</button>
        <button onClick={() => navigateTo('browser://canvas3d')} className="px-2 py-1 text-xs bg-white/5 hover:bg-purple-500/20 text-white/50 hover:text-purple-300 rounded-lg" title="3D WebGL">3D</button>
      </div>
    );
  }

  function renderContent() {
    const noteEditorEl = showNoteEditor && activeTab?.url && !activeTab.url.startsWith('browser://') ? (
      <div className="absolute top-2 right-2 z-20 w-64 bg-[#1a1a2e] border border-white/15 rounded-xl p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/70">📌 Pin Note</span>
          <button onClick={() => setShowNoteEditor(false)} className="text-white/30 hover:text-white">✕</button>
        </div>
        <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} className="w-full bg-white/5 text-white text-xs rounded px-2 py-1.5 outline-none resize-none h-20 mb-2" placeholder="Write your note..." autoFocus />
        <div className="flex gap-1 mb-2">
          {['#ffdd57', '#ff6b6b', '#a8ff78', '#74b9ff', '#fd79a8'].map(c => <button key={c} onClick={() => setNoteColor(c)} className={`w-5 h-5 rounded-full hover:scale-110 transition-transform ${noteColor === c ? 'ring-2 ring-white' : ''}`} style={{ background: c }} />)}
        </div>
        <button onClick={addNote} disabled={!newNoteText.trim()} className="w-full py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg disabled:opacity-40">📌 Pin Note</button>
      </div>
    ) : null;

    if (isFocusBlocked(activeTab?.url)) {
      return (
        <div className="flex-1 flex items-center justify-center bg-[#0a0a12]">
          <div className="text-center p-8">
            <Shield className="w-16 h-16 mx-auto mb-4 text-orange-400/60" />
            <h2 className="text-xl font-semibold text-white mb-2">Focus Mode Active</h2>
            <p className="text-white/50 text-sm mb-4">This site is blocked during your focus session.</p>
            {pomodoroActive && <p className="text-orange-300 font-mono text-lg mb-4">{pomodoroBreakMode ? '☕ Break' : '🎯 Focus'}: {formatPomodoroTime()}</p>}
            <div className="flex gap-2 justify-center">
              <button onClick={goHome} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg">← Home</button>
              <button onClick={() => setBrowserSettings(s => ({ ...s, focusModeActive: false }))} className="px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg">Disable Focus Mode</button>
            </div>
          </div>
        </div>
      );
    }

    const special = renderSpecialPage(activeTab?.url);
    if (special) return <div className="flex-1 relative overflow-hidden">{special}</div>;

    if (!activeTab?.url) {
      return (
        <div className="flex-1 relative overflow-hidden">
          <BrowserNewTab bookmarks={bookmarks} onNavigate={navigateTo} settings={browserSettings} onUpdateSettings={(updates) => setBrowserSettings(s => ({ ...s, ...updates }))} />
          {noteEditorEl}
        </div>
      );
    }

    if (readerMode) {
      const bgColor = browserSettings.readerBackground === 'dark' ? '#1a1a2e' : browserSettings.readerBackground === 'sepia' ? '#f5e6c8' : '#ffffff';
      const textColor = browserSettings.readerBackground === 'dark' ? '#e0e0e0' : '#333333';
      return (
        <div className="flex-1 overflow-auto relative" style={{ background: bgColor }}>
          <div className="max-w-2xl mx-auto p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: textColor + '33' }}>
              <Globe className="w-4 h-4 flex-shrink-0" style={{ color: textColor + '60' }} />
              <span className="text-sm truncate flex-1" style={{ color: textColor + '80' }}>{activeTab?.url}</span>
              <button onClick={toggleReaderMode} className="text-xs text-blue-500 hover:underline flex-shrink-0">Exit Reader</button>
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {['light', 'dark', 'sepia'].map(bg => <button key={bg} onClick={() => setBrowserSettings(s => ({ ...s, readerBackground: bg }))} className={`px-3 py-1 text-xs rounded capitalize ${browserSettings.readerBackground === bg ? 'bg-blue-500 text-white' : 'bg-black/10 hover:bg-black/20'}`}>{bg}</button>)}
              <input type="range" min="12" max="28" value={browserSettings.readerFontSize || 18} onChange={e => setBrowserSettings(s => ({ ...s, readerFontSize: +e.target.value }))} className="w-24 accent-blue-500" title="Font size" />
            </div>
            <h1 className="font-bold mb-6" style={{ fontSize: ((browserSettings.readerFontSize || 18) + 6) + 'px', color: textColor }}>{activeTab?.title}</h1>
            <p className="leading-relaxed" style={{ fontSize: (browserSettings.readerFontSize || 18) + 'px', lineHeight: browserSettings.readerLineHeight || 1.7, color: textColor + 'cc' }}>
              Reader mode strips the page to its core text content for distraction-free reading.
              Page content is extracted and rendered here for a clean reading experience.
            </p>
          </div>
          {noteEditorEl}
        </div>
      );
    }

    return (
      <div className="flex-1 relative overflow-hidden">
        {activeTab?.loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
              <p className="text-white/60 text-sm">Loading...</p>
              <p className="text-white/30 text-xs mt-1 max-w-xs truncate">{activeTab.url}</p>
            </div>
          </div>
        ) : iframeError ? (
          <IframeError url={lastRequestedUrl || activeTab?.url} onGoBack={goHome} />
        ) : (
          <div className="relative w-full h-full">
            <iframe ref={iframeRef} key={activeTab.url} src={activeTab.url} className="w-full h-full border-0 bg-white" title={activeTab.title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads" referrerPolicy={browserSettings.incognitoMode || activeTab?.incognito ? 'no-referrer' : 'strict-origin-when-cross-origin'} onError={() => setIframeError(true)} style={{ zoom: ((browserSettings.siteZoom?.[activeTab.url] || browserSettings.globalZoom) || 100) / 100 }} />
            {browserSettings.dataSaver && <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1.5"><Zap className="w-3 h-3 text-green-400" />Data Saver</div>}
            <div className="absolute top-2 right-2 z-10 flex gap-1.5">
              <button onClick={() => window.open(activeTab.url, '_blank', 'noopener,noreferrer')} className="px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg backdrop-blur">↗ New Tab</button>
              <button onClick={() => openInAboutBlank(activeTab.url, activeTab.title || 'Browser')} className="px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg backdrop-blur">□ Blank</button>
            </div>
          </div>
        )}
        {noteEditorEl}
      </div>
    );
  }
}

function StickyNote({ note, onRemove, onUpdate }) {
  const [pos, setPos] = useState({ x: note.x || 100, y: note.y || 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content);

  const startDrag = (e) => { setDragging(true); setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y }); };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    const onUp = () => { setDragging(false); onUpdate({ ...note, x: pos.x, y: pos.y }); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, offset.x, offset.y, pos.x, pos.y]);

  return (
    <div className="fixed z-40 rounded-lg shadow-2xl w-52" style={{ left: pos.x, top: pos.y, background: note.color }}>
      <div className="flex items-center justify-between px-2 py-1 rounded-t-lg cursor-grab active:cursor-grabbing select-none" style={{ background: note.color + 'cc' }} onMouseDown={startDrag}>
        <span className="text-xs font-bold text-black/50">📌</span>
        <div className="flex gap-1">
          <button onClick={() => setEditing(!editing)} className="text-black/40 hover:text-black text-xs px-1">✏</button>
          <button onClick={onRemove} className="text-black/40 hover:text-red-600 text-xs px-1">✕</button>
        </div>
      </div>
      {editing ? (
        <div className="p-2">
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full bg-black/10 text-black/80 text-xs resize-none outline-none h-20 rounded p-1" autoFocus />
          <button onClick={() => { onUpdate({ ...note, content }); setEditing(false); }} className="mt-1 text-xs text-black/60 hover:text-black font-medium">Save ✓</button>
        </div>
      ) : (
        <div className="p-2 text-xs text-black/80 whitespace-pre-wrap max-h-36 overflow-auto cursor-default" onMouseDown={e => e.stopPropagation()}>{content}</div>
      )}
    </div>
  );
}

function IframeError({ url, onGoBack }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5]">
      <motion.div className="text-left p-6 max-w-lg w-full bg-white border border-gray-200 shadow-md rounded-md" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <Globe className="w-14 h-14 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">This page can't be loaded here</h3>
            <p className="text-sm text-gray-500 break-all mb-1">{url}</p>
            <p className="text-xs text-gray-400 mb-4">Many websites block embedding in iframes. Try opening in a new tab.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} className="px-4 py-2 bg-[#1a73e8] text-white rounded hover:bg-[#1664c4] text-sm">Open in new tab ↗</button>
              <button onClick={onGoBack} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 text-sm">← Go back</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
