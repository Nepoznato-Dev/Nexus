# Nexus v1.0.0 Release Notes

**Release Date:** January 27, 2026  
**Status:** ✅ **STABLE - PRODUCTION READY**

---

## 🎯 About this Release

Nexus v1.0.0 is the stable foundation release of a privacy-first student hub. This is the first major release after development and includes all core features with iframe support for deployment on restricted networks.

## ✨ Features

### Core Features
- **📊 Dashboard** - Quick actions, personalized greeting, activity overview
- **🌐 Private Browser** - Built-in browser with history, search engines, tab management
- **🎮 Games Collection** - Curated games for breaks and entertainment
- **🎵 Music Player** - Stream music with playlist management
- **📚 Study Tools** - Notes, flashcards, Pomodoro timer, scientific calculator, formula sheet
- **⚙️ Settings** - Comprehensive preferences and device profiles
- **👥 Admin Dashboard** - Analytics, user management, system monitoring
- **🎬 Videos** - Educational and entertainment content library
- **💾 Local Storage** - All data stored locally in browser, never sent to servers
- **🔒 Privacy First** - No tracking, no ads, no data collection

### Stealth Features
- **🚨 Decoy Screen** - Fake error page to escape quickly
- **📈 Performance Monitoring** - Real-time FPS and memory tracking
- **🎨 Customization** - Themes, layouts, accessibility options
- **📱 Responsive Design** - Works on all screen sizes

### Deployment
- **🔗 about:blank Launcher** - Run in iframe on restricted networks
- **🌐 Standalone** - Works on any host
- **🔄 Portable** - Settings backup/restore across devices
- **⚡ Fast** - Optimized build, < 200KB gzipped

## 📦 What's Included

```
build/                        # Production-ready build
  ├── index.html              # Main HTML file
  ├── static/
  │   ├── js/
  │   ├── css/
  │   └── media/              # Game assets, images
  
src/                          # Source code
  ├── Components/             # React components
  ├── PagesDisplay/           # Page components
  ├── utils/
  │   └── iframeNavigation.js # NEW: Iframe-safe navigation
  └── versionConfig.json      # Version feature gates

about-blank-launcher.html     # NEW: Launcher for about:blank deployment
archive/                      # Archived code for future versions
docs/                         # Complete documentation
```

## 🚀 Deployment Options

### Option 1: about:blank Launcher (School/Work Safe)
Perfect for restricted networks. Keep the launcher HTML on your personal site:

```html
<a href="about-blank-launcher.html" target="_blank">Launch Nexus</a>
```

**How it works:**
- Launcher opens a blank window
- Embeds Nexus in an iframe
- Window URL stays at `about:blank` (bypasses network filters)
- User activity appears to be reading a blank page

### Option 2: Standard Web Hosting
Deploy the `build/` folder to any static hosting:

```bash
# Using Netlify
netlify deploy --prod --dir=build

# Using Vercel
vercel --prod

# Using GitHub Pages (if public)
npm run build
git subtree push --prefix build origin gh-pages
```

### Option 3: Docker/Container
```dockerfile
FROM node:18
WORKDIR /app
COPY build/ .
RUN npm install -g serve
CMD ["serve", "-s", ".", "-l", "3000"]
```

## 🔧 iframe Requirements

When running in an iframe (about:blank or embedded), ensure:

1. **Parent window allows iframes:**
   ```html
   <iframe 
     src="https://your-nexus-url"
     allow="fullscreen; clipboard-read; clipboard-write"
   ></iframe>
   ```

2. **CORS headers** (if on different domain):
   - `Access-Control-Allow-Origin: *`
   - `X-Frame-Options: ALLOWALL`

3. **Sandbox attributes** (recommended):
   ```html
   sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
   ```

## 🛠️ What's Fixed for Iframe Support

- ✅ `window.location.href` → React Router with iframe fallback
- ✅ `window.location.reload()` → Safe reload with error handling
- ✅ Panic mode redirect → Opens in new tab instead of replacing window
- ✅ Settings import → Works seamlessly in iframe context
- ✅ New utility: `src/utils/iframeNavigation.js`

## 📋 Breaking Changes

None. v1.0.0 is the first release.

## 🔒 Security Notes

- **API Keys**: Store in `.env.local` (not committed)
- **Data Privacy**: All user data stored locally, never transmitted
- **XSS Protection**: React's built-in XSS prevention
- **CSRF**: LocalStorage-based, no cross-site risks
- **Recommended**: Deploy over HTTPS when possible

## 🚀 Performance

- **Bundle Size**: 192 KB (gzipped)
- **Time to Interactive**: < 1.5s on modern connections
- **Chrome DevTools Score**: 95+ Lighthouse score
- **Mobile**: Fully responsive, tested on iOS & Android

## 📚 Documentation

- [README.md](../README.md) - Quick start guide
- [docs/setup/](../docs/setup/) - Detailed setup instructions
- [docs/development/](../docs/development/) - For developers
- [docs/versions/v1.0.0/](../docs/versions/v1.0.0/) - Release-specific docs

## 🤝 Support

For issues, questions, or suggestions:
1. Check the documentation
2. Search existing issues
3. Open a new issue with details

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Nepoznato-Dev/Nexus.git
cd Nexus

# Install dependencies
npm install

# Run in development
npm start

# Build for production
npm run build

# Deploy the build/ folder
```

## 📞 Contact

- **Repository**: https://github.com/Nepoznato-Dev/Nexus
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 📄 License

See [LICENSE](../LICENSE) file for details.

---

**Nexus v1.0.0** - Built with ❤️ for students who value privacy.
