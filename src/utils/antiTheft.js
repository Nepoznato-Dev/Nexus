// Anti-theft utilities (cleaned)

const AUTHORIZED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'nexus-community.vercel.app'
];

const WATERMARK = {
  owner: 'Nepoznato-Dev',
  project: 'Nexus Community Project',
  license: 'Proprietary - All Rights Reserved',
  built: new Date().toISOString(),
  fingerprint: `NEXUS-${Math.random().toString(36).slice(2)}-${Date.now()}`
};

if (typeof window !== 'undefined') {
  window.__NEXUS_AUTH__ = WATERMARK;
}

const reportTheft = (domain) => {
  try {
    const data = {
      type: 'theft_attempt',
      domain,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      watermark: WATERMARK
    };
    console.warn('THEFT ATTEMPT LOGGED:', data);
  } catch (err) {
    // Ignore errors
  }
};

export const verifyDomain = () => {
  const hostname = window.location.hostname;
  const isAuthorized = AUTHORIZED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    reportTheft(hostname);
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          background: #000;
          color: #ff4d4d;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-family: monospace;
          z-index: 999999;
        ">
          <h1 style="font-size: 2.5em; margin-bottom: 12px;">Unauthorized Domain</h1>
          <p style="margin: 6px 0;">This software is proprietary.</p>
          <p style="margin: 6px 0;">Domain: ${hostname}</p>
          <p style="margin: 6px 0;">Owner: ${WATERMARK.owner}</p>
          <p style="margin-top: 12px; font-size: 0.9em; color: #bbb;">Incident logged</p>
        </div>
      `;
    }, 2500);
    return false;
  }

  return true;
};

export const detectDevTools = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const threshold = 160;
  let open = false;

  const check = () => {
    const w = window.outerWidth - window.innerWidth > threshold;
    const h = window.outerHeight - window.innerHeight > threshold;

    if (w || h) {
      if (!open) {
        open = true;
        reportTheft('devtools-detected');
      }
    } else {
      open = false;
    }
  };

  setInterval(check, 1000);
};

export const preventInspection = () => {
  if (process.env.NODE_ENV !== 'production') return;

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });
};

export const displayCopyright = () => {
  console.log('⚠️ STOP ⚠️');
  console.log('This is proprietary software.');
  console.log(`Owner: ${WATERMARK.owner}`);
  console.log('Unauthorized copying or modification is prohibited.');
};

export const initializeAntiTheft = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  displayCopyright();

  if (process.env.NODE_ENV === 'production') {
    verifyDomain();
    detectDevTools();
    preventInspection();
  }

  const metaAuthor = document.createElement('meta');
  metaAuthor.setAttribute('name', 'author');
  metaAuthor.setAttribute('content', WATERMARK.owner);
  document.head.appendChild(metaAuthor);

  const metaCopyright = document.createElement('meta');
  metaCopyright.setAttribute('name', 'copyright');
  metaCopyright.setAttribute('content', `Copyright ${new Date().getFullYear()} ${WATERMARK.owner}. All Rights Reserved.`);
  document.head.appendChild(metaCopyright);
};

export default {
  initializeAntiTheft,
  verifyDomain,
  detectDevTools,
  preventInspection,
  displayCopyright,
  WATERMARK
};
