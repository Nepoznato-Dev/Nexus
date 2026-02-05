# Nexus Community Project

**Copyright (c) 2026 Nepoznato-Dev - All Rights Reserved**

⚠️ **PROPRIETARY SOFTWARE** - Unauthorized copying or use is prohibited. See [LICENSE](LICENSE) and [COPYRIGHT.md](COPYRIGHT.md).

---

A privacy-first, local-only student hub designed for Chromebooks and personal use.

## Features

- 🔒 **Privacy-First**: All data stays local on your device
- 🎮 **Games Platform**: Access to various web games
- 📚 **Study Tools**: Whiteboard, calculator, dictionary, flashcards
- 🎵 **Music Player**: Local music playback
- 📺 **Video Library**: Video content access
- 🌐 **Web Browser**: Built-in browsing capabilities
- 👥 **Social Hub**: Community features
- ⚙️ **Settings**: Customizable preferences
- 🛠️ **Utilities**: Calculator, unit converter, etc.
- 🔄 **Auto-Recovery**: Automatically handles launch failures and retries

## Quick Start

### For Personal Use (Recommended)

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Access Nexus:**
   - Go to: `http://localhost:3000`
   - The launcher will automatically open Nexus in a new window after 3 seconds
   - Or press `C` to launch immediately
   - The launcher window will close automatically

### For School/Chromebook Use

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Access:**
   - Navigate to `http://localhost:3000`
   - Press `C` or wait 3 seconds for auto-launch

### Alternative: Production Build

If the development server is unstable:
```bash
npm run serve  # Builds and serves on port 3000
```
   - Nexus opens in a popup window for unrestricted access

## Architecture

- **Frontend**: React 18 with React Router
- **Styling**: Tailwind CSS with custom glassmorphism
- **Storage**: IndexedDB for local data persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Serving**: Production build served via Python HTTP server (most stable)

## Stability Notes

- **Development Server**: Now configured with `CI=false` for better stability in Codespaces
- **Port 3000**: Default port for development (most compatible with Codespaces)
- **GitHub Codespaces**: Development server should now work reliably
- **Production Build**: Available via `npm run serve` for maximum stability

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Local-Only Design

This app is designed to work entirely offline and locally:
- No external API calls
- All data stored in browser storage
- No server dependencies for core functionality
- Privacy-focused by design

## Troubleshooting

### Launch Issues
- **Popup blocked**: Allow popups for the site in your browser settings
- **Server not running**: Run `npm start` to start the development server
- **Port conflicts**: The app uses port 3000 by default

### Recovery Options
- **Auto-retry**: The launcher automatically retries failed launches
- **Manual retry**: Press `R` when launch fails to restart the process
- **Refresh**: Press `F5` to reload the launcher if it gets stuck
- **Browser restart**: Close and reopen your browser if issues persist

### Error Messages
- **"Popup blocked"**: Enable popups in browser settings
- **"Server not running"**: Start the server with `npm start`
- **"Failed to load Nexus"**: Check that the React server is running on port 3000

## Contributors
- **Nepoznato-Dev**