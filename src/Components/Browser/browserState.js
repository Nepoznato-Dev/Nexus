/**
 * Browser State Management - localStorage persistence for all browser features
 */

const STORAGE_KEY = 'nexus-browser-v2';

export const DEFAULT_SETTINGS = {
  // Privacy & Security
  adBlocker: true,
  adBlockerAllowlist: [],
  trackerBlocking: true,
  httpsEnforcer: true,
  incognitoMode: false,
  cookieAutoDecline: true,

  // Customization
  theme: 'dark', // 'light', 'dark', 'auto'
  themeColors: {
    toolbar: '#0f0f1a',
    tabs: '#1a1a2e',
    sidebar: '#13131f',
    accent: '#3498db',
  },
  layout: 'top', // 'top', 'vertical', 'sidebar'
  density: 'normal', // 'compact', 'normal', 'spacious'
  newTabContent: ['clock', 'bookmarks', 'weather'],
  globalFontSize: 16,
  globalZoom: 100,
  siteZoom: {},
  siteFontSize: {},
  customCSS: {},

  // Productivity
  tabGroups: [],
  readerFontSize: 18,
  readerLineHeight: 1.6,
  readerBackground: 'light',
  preloading: true,
  dataSaver: false,

  // Performance
  hibernationTimeout: 30, // minutes, 0 = disabled
  preloadOnHover: true,

  // Power User
  focusBlocklist: ['facebook.com', 'twitter.com', 'reddit.com', 'youtube.com'],
  focusModeActive: false,
  focusModeEndTime: null,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  shortcuts: {
    newTab: 'ctrl+t',
    closeTab: 'ctrl+w',
    nextTab: 'ctrl+tab',
    prevTab: 'ctrl+shift+tab',
    focusUrl: 'ctrl+l',
    find: 'ctrl+f',
    reload: 'ctrl+r',
    incognito: 'ctrl+shift+n',
    screenshot: 'ctrl+shift+s',
    readerMode: 'ctrl+shift+r',
    settings: 'ctrl+,',
  },

  // Profiles
  currentProfile: 'default',
};

export const DEFAULT_BROWSER_STATE = {
  tabs: [{ id: 1, title: 'New Tab', url: '', loading: false, favicon: null, groupId: null, hibernated: false, muted: false, pinned: false, history: [], historyIndex: -1, incognito: false }],
  activeTabId: 1,
  bookmarks: [
    { id: 1, title: 'Startpage', url: 'https://www.startpage.com', favicon: 'https://www.startpage.com/favicon.ico', tags: ['search', 'privacy'] },
    { id: 2, title: 'Wikipedia', url: 'https://www.wikipedia.org', favicon: 'https://www.wikipedia.org/favicon.ico', tags: ['reference', 'knowledge'] },
    { id: 3, title: 'Archive.org', url: 'https://archive.org', favicon: 'https://archive.org/favicon.ico', tags: ['archive', 'history'] },
    { id: 4, title: 'GitHub', url: 'https://github.com', favicon: 'https://github.com/favicon.ico', tags: ['code', 'development'] },
  ],
  history: [],
  readingList: [],
  sessions: [],
  notes: {},
  profiles: {
    default: { name: 'Default', color: '#3498db', bookmarks: [], history: [], settings: {} },
    work: { name: 'Work', color: '#2ecc71', bookmarks: [], history: [], settings: {} },
    personal: { name: 'Personal', color: '#e74c3c', bookmarks: [], history: [], settings: {} },
  },
  settings: DEFAULT_SETTINGS,
};

export function loadBrowserState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Deep merge settings with defaults
    parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
    parsed.settings.themeColors = { ...DEFAULT_SETTINGS.themeColors, ...parsed.settings.themeColors };
    parsed.settings.shortcuts = { ...DEFAULT_SETTINGS.shortcuts, ...parsed.settings.shortcuts };
    return parsed;
  } catch (e) {
    console.error('Failed to load browser state:', e);
    return null;
  }
}

export function saveBrowserState(state) {
  try {
    // Don't save incognito tabs
    const stateCopy = { ...state };
    stateCopy.tabs = state.tabs.filter(t => !t.incognito);
    // Don't save history in incognito
    if (state.settings?.incognitoMode) {
      stateCopy.history = state.history.filter(h => !h.incognito);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateCopy));
  } catch (e) {
    console.error('Failed to save browser state:', e);
  }
}

export function getProfileKey(profileId) {
  return `nexus-browser-profile-${profileId}`;
}
