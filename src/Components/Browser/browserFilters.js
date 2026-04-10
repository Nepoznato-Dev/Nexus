/**
 * Browser Filters - Ad/Tracker blocking filter lists and utilities
 */

// Known ad/tracker domains (compact subset of EasyList / EasyPrivacy patterns)
export const AD_DOMAINS = new Set([
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adservice.google.com', 'pagead2.googlesyndication.com',
  'ads.youtube.com', 'advertising.com', 'adnxs.com',
  'adsafeprotected.com', 'moatads.com', 'scorecardresearch.com',
  'quantserve.com', 'mediaplex.com', 'rubiconproject.com',
  'openx.net', 'pubmatic.com', 'smaato.net', 'mopub.com',
  'amazon-adsystem.com', 'adsystem.amazon.com',
  'taboola.com', 'outbrain.com', 'revcontent.com',
  'mgid.com', 'content.ad', 'zergnet.com',
  'criteo.com', 'criteo.net', 'bing.com/ads',
  'ads.twitter.com', 'static.ads-twitter.com',
  'ads.linkedin.com', 'insight.adsrvr.org',
  'yahoo.com/adserver', 'media.net',
  'adblade.com', 'propellerads.com', 'popads.net',
  'popcash.net', 'exoclick.com', 'adcash.com',
  'bidvertiser.com', 'yllix.com',
]);

export const TRACKER_DOMAINS = new Set([
  // Analytics / tracking
  'google-analytics.com', 'analytics.google.com',
  'gtag/js', 'googletagmanager.com', 'googletagservices.com',
  'facebook.com/tr', 'connect.facebook.net',
  'hotjar.com', 'mouseflow.com', 'fullstory.com',
  'mixpanel.com', 'amplitude.com', 'segment.io',
  'segment.com', 'intercom.io', 'intercom.com',
  'heap.io', 'smartlook.com', 'logrocket.com',
  // Fingerprinting
  'fingerprintjs.com', 'fpjs.io', 'fingerprint.com',
  'canvas.fingerprint.io',
  // Pixel trackers
  'px.ads.linkedin.com', 'bat.bing.com',
  'twitter.com/i/adsct', 't.co/i/adsct',
  'sync.crwdcntrl.net', 'sync.adotmob.com',
  'pixel.adsafeprotected.com',
  // Session recording / heatmaps
  'cdn.optimizely.com', 'optmz.com',
  'appsflyer.com', 'branch.io', 'adjust.com',
  'kochava.com',
]);

// Common cookie consent/decline button selectors (for auto-decline)
export const COOKIE_DECLINE_SELECTORS = [
  // Generic decline
  '[data-testid*="reject"]', '[data-testid*="decline"]',
  '[id*="reject-all"]', '[id*="decline-all"]',
  '[class*="reject-all"]', '[class*="decline-all"]',
  '[aria-label*="reject"]', '[aria-label*="decline"]',
  // Common consent management platforms
  '#onetrust-reject-all-handler',
  '.reject-all', '.decline-all', '.btn-refuse',
  '[data-gdpr="deny"]',
  // GDPR Cookie Consent
  '.fc-cta-do-not-consent',
  '.cc-deny',
  // Cookiebot
  '#CybotCookiebotDialogBodyButtonDecline',
  // Quantcast
  '.qc-cmp2-summary-buttons button:first-child',
  // Didomi
  '[data-click*="disagree"]',
  // TrustArc
  '.pdynamicbutton .call',
];

/**
 * Check if a URL is blocked by ad/tracker lists
 * @param {string} url 
 * @param {boolean} adBlockerEnabled 
 * @param {boolean} trackerBlockingEnabled 
 * @param {string[]} allowlist - domains to skip
 * @returns {boolean} true if should block
 */
export function shouldBlockUrl(url, adBlockerEnabled, trackerBlockingEnabled, allowlist = []) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    
    // Check allowlist first
    if (allowlist.some(allowed => hostname === allowed || hostname.endsWith('.' + allowed))) {
      return false;
    }
    
    if (adBlockerEnabled) {
      for (const domain of AD_DOMAINS) {
        if (hostname === domain || hostname.endsWith('.' + domain) || url.includes(domain)) {
          return true;
        }
      }
    }
    
    if (trackerBlockingEnabled) {
      for (const domain of TRACKER_DOMAINS) {
        if (hostname === domain || hostname.endsWith('.' + domain) || url.includes(domain)) {
          return true;
        }
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Upgrade URL to HTTPS if possible
 */
export function enforceHttps(url) {
  if (url && url.startsWith('http://')) {
    return 'https://' + url.slice(7);
  }
  return url;
}

/**
 * Auto-categorize a URL into topic tags for smart bookmarks
 */
export function autoTagUrl(url, title = '') {
  const tags = [];
  const text = (url + ' ' + title).toLowerCase();
  
  const categories = {
    social: ['facebook', 'twitter', 'instagram', 'linkedin', 'reddit', 'tiktok', 'snapchat'],
    video: ['youtube', 'vimeo', 'twitch', 'netflix', 'hulu', 'disney'],
    code: ['github', 'gitlab', 'stackoverflow', 'codepen', 'npm', 'developer'],
    news: ['news', 'bbc', 'cnn', 'reuters', 'guardian', 'nytimes', 'techcrunch'],
    shopping: ['amazon', 'ebay', 'etsy', 'shop', 'store', 'cart', 'buy'],
    search: ['google', 'bing', 'duckduckgo', 'startpage', 'searx'],
    reference: ['wikipedia', 'wiki', 'docs', 'documentation', 'reference'],
    finance: ['bank', 'finance', 'stock', 'crypto', 'invest', 'paypal'],
    tools: ['tool', 'utility', 'converter', 'calculator', 'generator'],
    ai: ['openai', 'anthropic', 'claude', 'chatgpt', 'gemini', 'copilot', 'ai'],
  };
  
  for (const [tag, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags.length > 0 ? tags : ['other'];
}

/**
 * Generate a readable/clean URL for display in the address bar
 */
export function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/**
 * Detect if a URL is a special internal browser page
 */
export function isInternalUrl(url) {
  return url && (
    url.startsWith('browser://') ||
    url.startsWith('about:') ||
    url === ''
  );
}

/**
 * Get search engine URL
 */
export const SEARCH_ENGINES = {
  startpage: { name: 'Startpage', url: 'https://www.startpage.com/do/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  brave: { name: 'Brave Search', url: 'https://search.brave.com/search?q=' },
  searx: { name: 'Searx', url: 'https://searx.be/search?q=' },
  google: { name: 'Google', url: 'https://www.google.com/search?q=' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
};

export function buildSearchUrl(query, engine = 'duckduckgo') {
  const se = SEARCH_ENGINES[engine] || SEARCH_ENGINES.duckduckgo;
  return se.url + encodeURIComponent(query);
}

/**
 * Normalize input to a navigable URL
 */
export function normalizeUrl(input, searchEngine = 'duckduckgo') {
  if (!input) return '';
  input = input.trim();
  
  if (input.startsWith('browser://') || input.startsWith('about:')) {
    return input;
  }
  
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }
  
  // Has dots and no spaces — likely a URL
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(input) && !input.includes(' ')) {
    return 'https://' + input;
  }
  
  // Otherwise it's a search query
  return buildSearchUrl(input, searchEngine);
}

/**
 * Keyboard shortcut matching
 */
export function matchShortcut(event, shortcut) {
  if (!shortcut) return false;
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const ctrl = parts.includes('ctrl');
  const shift = parts.includes('shift');
  const alt = parts.includes('alt');
  const meta = parts.includes('meta');
  
  return (
    (event.key.toLowerCase() === key || event.code.toLowerCase() === 'key' + key) &&
    event.ctrlKey === ctrl &&
    event.shiftKey === shift &&
    event.altKey === alt &&
    event.metaKey === meta
  );
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Format time duration
 */
export function formatDuration(ms) {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
}
