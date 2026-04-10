// Utility functions for Nexus

export function createPageUrl(page) {
  return `/${page.toLowerCase()}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function openInAboutBlank(url, title = 'Nexus') {
  const win = window.open('about:blank', '_blank');
  if (!win) {
    alert('Popup blocked. Please allow popups to open about:blank.');
    return false;
  }

  const safeTitle = String(title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeUrl = String(url).replace(/"/g, '&quot;');

  win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #0b0f17; }
      iframe { border: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <iframe src="${safeUrl}" allow="clipboard-read; clipboard-write; fullscreen;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"></iframe>
  </body>
</html>`);
  win.document.close();
  return true;
}

function isDevelopmentPortUrl(urlObj) {
  const host = String(urlObj.hostname || '').toLowerCase();
  const port = String(urlObj.port || '');
  const isLocalDevHost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  const hasExplicitNonStandardPort = Boolean(port) && port !== '80' && port !== '443';
  return isLocalDevHost || hasExplicitNonStandardPort;
}

export function isDevelopmentUrl(input) {
  try {
    const parsed = input instanceof URL ? input : new URL(String(input));
    return isDevelopmentPortUrl(parsed);
  } catch (error) {
    return false;
  }
}

export function shouldForceAboutBlankFirst(input) {
  try {
    const parsed = input instanceof URL ? input : new URL(String(input));
    const protocol = String(parsed.protocol || '').toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }
    return !isDevelopmentPortUrl(parsed);
  } catch (error) {
    return false;
  }
}

export function resolveAboutBlankTargetForAppUrl(rawInput) {
  if (typeof window === 'undefined') return null;

  const text = String(rawInput || '').trim();
  if (!text || text.includes(' ')) return null;

  let normalized = text;
  if (!/^https?:\/\//i.test(normalized)) {
    if (!normalized.includes('.')) return null;
    normalized = `https://${normalized}`;
  }

  let targetUrl;
  let currentUrl;
  try {
    targetUrl = new URL(normalized);
    currentUrl = new URL(window.location.href);
  } catch (error) {
    return null;
  }

  const sameHost = targetUrl.hostname === currentUrl.hostname;
  if (!sameHost) return null;

  if (isDevelopmentPortUrl(targetUrl) || isDevelopmentPortUrl(currentUrl)) {
    return null;
  }

  return targetUrl.toString();
}