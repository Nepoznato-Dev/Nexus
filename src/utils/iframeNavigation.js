/**
 * iframe-Safe Navigation Utilities
 * Handles navigation when running in about:blank iframe or standalone
 * 
 * Usage:
 *   import { navigateTo, reloadPage } from './utils/iframeNavigation';
 *   navigateTo('/dashboard');  // Use react-router if available, fallback to window.location
 *   reloadPage();              // Safe page reload
 */

// Detect if we're running in an iframe
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // Assume iframe if access denied (cross-origin)
  }
};

// Navigate safely - tries React Router first, falls back to window.location
export const navigateTo = (path, navigate) => {
  if (navigate && typeof navigate === 'function') {
    // Use React Router if available
    navigate(path);
  } else if (typeof window !== 'undefined') {
    // Fallback to window.location
    window.location.href = path;
  }
};

// Reload page safely
export const reloadPage = () => {
  if (typeof window !== 'undefined') {
    try {
      window.location.reload();
    } catch (e) {
      console.error('Page reload failed:', e);
      // If reload fails, try replacing current entry
      try {
        window.location.replace(window.location.href);
      } catch (e2) {
        console.error('Location replace also failed:', e2);
      }
    }
  }
};

// Navigate to external URL (respects iframe context)
export const navigateToExternal = (url) => {
  if (typeof window !== 'undefined') {
    try {
      // If in iframe, try opening in new tab to escape the about:blank context
      if (isInIframe()) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    } catch (e) {
      console.error('External navigation failed:', e);
      // Last resort: try to open in new window
      try {
        window.open(url, '_blank');
      } catch (e2) {
        console.error('Could not open external URL:', e2);
      }
    }
  }
};

// Create an iframe-compatible page URL
export const createPageUrl = (pageName) => {
  // This assumes the app is hosted at root or configured correctly
  // In about:blank iframe, the iframe src should point to the app URL
  const basePath = process.env.PUBLIC_URL || '';
  
  // Handle home/landing page
  if (pageName === 'Landing' || pageName === '' || pageName === '/') {
    return basePath + '/';
  }
  
  // Handle page names
  const pagePath = pageName.charAt(0).toLowerCase() + pageName.slice(1);
  return basePath + '/' + pagePath;
};

// Safe session redirect with fallback
export const redirectOnSessionInvalid = (navigate) => {
  try {
    // Try React Router first
    if (navigate && typeof navigate === 'function') {
      navigate('/landing');
    } else {
      // Fallback to window.location
      const landingUrl = createPageUrl('Landing');
      window.location.href = landingUrl;
    }
  } catch (err) {
    console.error('Session redirect failed:', err);
    // Last resort: reload page
    try {
      reloadPage();
    } catch (e) {
      console.error('Fallback reload also failed:', e);
    }
  }
};

export default {
  isInIframe,
  navigateTo,
  reloadPage,
  navigateToExternal,
  createPageUrl,
  redirectOnSessionInvalid
};
