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