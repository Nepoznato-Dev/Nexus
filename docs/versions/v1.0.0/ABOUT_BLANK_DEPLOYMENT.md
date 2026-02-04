# Nexus v1.0.0 - about:blank Deployment Guide

## Overview

Nexus v1.0.0 can run in an `about:blank` iframe for deployment on restricted networks (schools, work, etc.). This guide explains how to set it up.

---

## Architecture

```
Your Website (trusted domain)
    └── about-blank-launcher.html
            └── window.open('about:blank')
                    └── iframe src="your-nexus-url"
                            └── Full Nexus app
```

**Why this works:**
- The browser tab appears to be on `about:blank` (blank page)
- All app code runs in an iframe
- Content filters see a "blank page" = passes through
- User can interact fully with Nexus

---

## Deployment Steps

### Step 1: Choose Your Hosting

You need two things:
1. **Nexus hosting** - Where the app itself lives
2. **Launcher hosting** - Where `about-blank-launcher.html` lives (can be same or different)

### Option A: Single Domain (Recommended)

Host everything on one domain:

```
your-domain.com/
├── about-blank-launcher.html    ← User goes here first
└── nexus/
    ├── index.html
    ├── static/
    │   ├── js/
    │   └── css/
    └── ...
```

**Setup:**

1. Build the app:
```bash
npm run build
```

2. Upload to hosting:
```bash
# Assuming you have a web server
scp -r build/* user@your-domain.com:~/public_html/nexus/
scp about-blank-launcher.html user@your-domain.com:~/public_html/
```

3. Update launcher HTML (in `about-blank-launcher.html`):
```javascript
const CONFIG = {
    APP_URL: 'https://your-domain.com/nexus',
    // ... rest of config
};
```

4. User visits: `https://your-domain.com/about-blank-launcher.html`

### Option B: Separate Domains

Host launcher and app on different domains:

```
launcher.com/about-blank-launcher.html    ← User goes here
    └── iframe src="app.com/nexus"
```

**Setup:**

1. Same steps as Option A, but upload to different servers

2. Update launcher config:
```javascript
const CONFIG = {
    APP_URL: 'https://app.com/nexus',
};
```

3. **Important**: Configure CORS on app server

---

## Server Configuration

### 1. CORS Headers (if on different domain)

Add these headers to your web server:

**Nginx:**
```nginx
location /nexus/ {
    add_header Access-Control-Allow-Origin "*";
    add_header X-Frame-Options "ALLOWALL";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
}
```

**Apache:**
```apache
<Directory /var/www/html/nexus>
    Header set Access-Control-Allow-Origin "*"
    Header set X-Frame-Options "ALLOWALL"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
</Directory>
```

**Node.js (Express):**
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('X-Frame-Options', 'ALLOWALL');
    next();
});
```

### 2. SSL/HTTPS (Recommended)

- Using Let's Encrypt: Free SSL certificates
- Required for secure deployment in production
- Many hosting providers (Netlify, Vercel) include SSL

### 3. Caching Headers

```
# Cache static assets for 1 year
Cache-Control: public, max-age=31536000

# Don't cache index.html (gets new version if deployed)
index.html: Cache-Control: no-cache
```

---

## Security Best Practices

### ✅ Do This

1. **Use HTTPS** - Always use SSL/TLS
2. **Set X-Frame-Options** - Only if intentionally iframe-able
3. **Sanitize input** - Already done in Nexus
4. **Update regularly** - Monitor for security patches
5. **Restrict network access** - If hosting on school/work server

### ❌ Don't Do This

1. **Don't expose API keys** - Keep in `.env.local`, never commit
2. **Don't disable CSP** - Content Security Policy is good
3. **Don't use `sandbox=""`** - Use restrictive sandbox attributes
4. **Don't serve over HTTP** - Use HTTPS always
5. **Don't ignore browser warnings** - Fix security issues

---

## Verification Checklist

### Before Launching

- [ ] Build succeeds: `npm run build`
- [ ] No console errors in dev mode: `npm start`
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] `about-blank-launcher.html` has correct `APP_URL`
- [ ] Static files are deployed and accessible
- [ ] CORS headers are set (if on separate domain)
- [ ] HTTPS is enabled

### After Deployment

- [ ] Launcher page loads: `https://your-domain.com/about-blank-launcher.html`
- [ ] Click "Launch Nexus" opens new window
- [ ] New window shows blank page in address bar
- [ ] App loads in iframe and is functional
- [ ] All features work: Dashboard, Browser, Games, etc.
- [ ] Settings can be changed and saved
- [ ] Export/import settings works
- [ ] Music and videos can load
- [ ] No console errors in DevTools

---

## Testing the about:blank Feature

### Local Testing

1. Start dev server:
```bash
npm start
```

2. Update launcher (in `about-blank-launcher.html`):
```javascript
APP_URL: 'http://localhost:3000'
```

3. Open launcher:
```bash
open about-blank-launcher.html
# or navigate to file directly in browser
```

4. Click "Launch Nexus"

5. Check DevTools (F12):
   - Go to "Console" tab
   - Should see: `Nexus v1.0.0` and app URL
   - No red errors

### Production Testing

1. Deploy to staging environment
2. Test from different networks (phone hotspot, different WiFi, etc.)
3. Test popup blocker scenarios:
   - Disable popups → Should show error message
   - Re-enable and retry
4. Test keyboard shortcut (press C)
5. Test on multiple browsers (Chrome, Firefox, Safari, Edge)

---

## Troubleshooting

### Issue: Popup is blocked

**Cause:** Browser or extension blocks popups

**Fix:**
1. Check browser popup settings
2. Check browser extensions
3. Disable temporary to test
4. Use keyboard shortcut (C) first to establish user interaction

### Issue: Blank window appears but app doesn't load

**Cause:** `APP_URL` is wrong or server is unreachable

**Fix:**
1. Check `APP_URL` in launcher HTML
2. Test URL directly: `https://your-domain.com/nexus`
3. Check browser console for CORS errors
4. Verify CORS headers are set (if separate domain)

### Issue: CORS error in console

**Cause:** App on different domain without CORS headers

**Fix:**
1. Add CORS headers to server
2. If launcher on same domain, use relative URL:
   ```javascript
   APP_URL: '/nexus'  // Instead of full URL
   ```

### Issue: Settings don't persist

**Cause:** `localStorage` might be disabled or sandboxed

**Fix:**
1. Check browser privacy settings
2. Ensure iframe not fully sandboxed:
   ```html
   sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
   ```

### Issue: Network requests fail

**Cause:** Network policy blocks requests

**Fix:**
1. Check what domains are blocked
2. For external APIs (YouTube, Spotify):
   - Use proxies if available
   - Fall back to local content
3. Test with VPN disabled temporarily

---

## Production Deployment Checklist

```bash
# 1. Update version in package.json (already v1.0.0)
grep "version" package.json

# 2. Build for production
npm run build

# 3. Test build locally
npm install -g serve
serve -s build

# 4. Check bundle sizes
ls -lh build/static/js/
ls -lh build/static/css/

# 5. Create git tag
git tag -a v1.0.0 -m "Nexus v1.0.0: about:blank ready"

# 6. Deploy to production
# (your deployment command here)

# 7. Test from multiple locations
# (verify app loads correctly)

# 8. Monitor error logs
# (check server logs for issues)
```

---

## Keeping about:blank Safe

The about:blank strategy helps with:
- ✅ Getting past keyword filters (blank page = no keywords)
- ✅ Bypassing URL filters (about:blank is a special URL)
- ✅ Appearing inactive (browser shows blank page)
- ⚠️ **But not**: Hiding network traffic, IP addresses, or time spent

**Remember:**
- Network monitoring can still see your traffic
- IT admins can see connection logs
- This is a *visual* bypass, not full privacy
- Use responsibly

---

## Advanced: Custom Launcher

Want to customize the launcher? Edit `about-blank-launcher.html`:

```html
<!-- Change logo -->
<div class="logo">🚀</div>  <!-- Change emoji -->

<!-- Change title -->
<h1>Nexus</h1>  <!-- Custom title -->

<!-- Change description -->
<p class="subtitle">Your Custom Subtitle</p>

<!-- Add/remove features -->
<div class="feature">
    <div class="feature-icon">🆕</div>
    <div class="feature-name">New Feature</div>
</div>
```

---

## Support & Help

- **Documentation**: `docs/` folder
- **Issues**: GitHub Issues
- **Community**: GitHub Discussions

---

**Deploy safely. Use responsibly.** 🚀
