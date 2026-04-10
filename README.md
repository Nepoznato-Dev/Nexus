# Nexus Community Project

**Copyright (c) 2026 Nepoznato-Dev - All Rights Reserved**

⚠️ **PROPRIETARY SOFTWARE** - Unauthorized copying or use is prohibited. See [LICENSE](LICENSE) and [COPYRIGHT.md](COPYRIGHT.md).

---

A privacy-first, local-first student hub designed for Chromebooks and personal use. Nexus focuses on study tools, utilities, and safe entertainment with a clean UI and fast performance.

## Highlights

- 🔒 **Privacy-First**: Data stays on the device (local storage / IndexedDB)
- 📚 **Study Toolkit**: Dictionary, flashcards, notes, formula sheets, timers
- 🧮 **Utilities**: Calculator, unit converter, whiteboard, productivity tools
- 🎮 **Games Hub**: Curated web games
- 🎵 **Media Tools**: Local music playback and video library
- 🤖 **RAZONET (AI)**: Smart assistant and study helper (local-first design)
- 🧩 **Minecraft Mod Manager**: Discovery, safety tips, and learning guides
- 🔄 **Auto-Recovery**: Handles launch failures and retries automatically

## Quick Start

### Development (Recommended)

```bash
npm install
npm start
```

Open <http://localhost:3000>

### Production Build

```bash
npm run build
npm run serve
```

## Architecture

- **Frontend**: React 18 + React Router
- **Styling**: Tailwind CSS + custom glassmorphism
- **Storage**: IndexedDB + localStorage
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Local-First Design

Nexus is designed to work offline for core functionality:

- No server dependency for core features
- Local storage by default
- Optional online integrations may be added for specific tools

## Key Pages

- Utilities: [src/PagesDisplay/Utilities.js](src/PagesDisplay/Utilities.js)
- Games: [src/PagesDisplay/Games.js](src/PagesDisplay/Games.js)
- Study Tools: [src/PagesDisplay/StudyTools.js](src/PagesDisplay/StudyTools.js)
- Settings: [src/PagesDisplay/Settings.js](src/PagesDisplay/Settings.js)

## Minecraft Mod Manager

The Mod Manager provides a student-friendly way to discover mods, learn safe installation practices, and manage dependencies. See [MOD_MANAGER_SETUP.md](MOD_MANAGER_SETUP.md) for details.

## Stability Notes

- **Port 3000**: Default dev port for compatibility
- **Codespaces**: Works reliably with CI disabled
- **Launcher**: Includes auto-retry and fallback behavior

## Troubleshooting

### Launch Issues

- **Popup blocked**: Allow popups for the site in browser settings
- **Server not running**: Run `npm start`
- **Port conflicts**: Ensure port 3000 is free

### Recovery Options

- **Auto-retry**: Launcher retries failed launches
- **Manual retry**: Press `R` on the launcher
- **Refresh**: Press `F5` if the launcher gets stuck

## Contributing

Personal project — feel free to fork and adapt for your own use.
