# Nexus Browser Games & Minecraft Development

Quick reference for integrating and building browser-based games in Nexus.

## 🚀 Quick Start: Play Minecraft in Browser

### For Users
1. Go to Games section in Nexus
2. Click "Eaglercraft"
3. Click "Start Playing"
4. No downloads, no installation - plays in browser!

### For Developers: Install Eaglercraft

```bash
# Option 1: Automated setup
bash scripts/setup/setup-eaglercraft.sh

# Option 2: Manual setup
cd /workspaces/Nexus-Community-Project
# Visit https://github.com/LAX1DUDE/eaglercraft/releases
# Download latest .zip
# Unzip to: /public/games/eaglercraft/
```

---

## 🛠️ Building Custom Browser Games

### The Three-Phase Approach

#### Phase 1: Understand Eaglercraft ✓
- **Goal**: Get Minecraft running in Nexus browser
- **Tech**: Pre-built Eaglercraft + TeaVM compilation
- **Docs**: See `docs/BROWSER_GAMES_GUIDE.md`

#### Phase 2: Learn Java→JavaScript Translation
- **Goal**: Understand TeaVM and LWJGL→WebGL adaptation
- **Tech**: TeaVM compiler, WebGL rendering, WebSocket networking
- **Docs**: See `docs/JAVA_TO_BROWSER_TRANSPILATION.md`

#### Phase 3: Build Custom Games
- **Goal**: Create your own browser games using Java
- **Start with**: LibGDX (simpler than Minecraft)
- **Then advance to**: Full Minecraft fork
- **Docs**: See `docs/JAVA_TO_BROWSER_TRANSPILATION.md` Section 5

---

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| `docs/BROWSER_GAMES_GUIDE.md` | Setup & integration guide |
| `docs/JAVA_TO_BROWSER_TRANSPILATION.md` | Technical deep dive on compilation |
| `scripts/setup/setup-eaglercraft.sh` | Automated Eaglercraft installer |
| `public/games/eaglercraft/index.html` | Game loader UI |

---

## 🎮 Game Library Structure

```
public/games/
├── eaglercraft/        → Minecraft in browser
│   ├── index.html      → Loader (auto-loads if files present)
│   ├── assets/         → Game resources
│   └── wasm/           → WebAssembly modules
│
├── my-game/            → Your custom game
│   ├── index.html
│   ├── my-game.js      → Compiled from Java
│   └── assets/
│
└── games-manifest.json → Auto-generated catalog
```

---

## 🔧 Tech Stack Reference

**Java → Browser Pipeline:**
```
Java Source Code
    ↓ [Maven + TeaVM]
JavaScript + WebAssembly
    ↓ [Browser Runtime]
HTML5 Canvas / WebGL
```

**Key Technologies:**
- **TeaVM**: Java bytecode → JavaScript/WASM compiler
- **WebGL**: 3D graphics in browser
- **WebSocket**: Network communication (for multiplayer)
- **IndexedDB**: Persistent game saves

---

## 💡 Common Tasks

### Task: Add Pre-Built Eaglercraft
```bash
bash scripts/setup/setup-eaglercraft.sh
npm start
# Visit http://localhost:3000/games/eaglercraft
```

### Task: Build Custom LibGDX Game
1. Create LibGDX project with TeaVM support
2. Add TeaVM Maven plugin to `pom.xml` (see transpilation guide)
3. Compile: `mvn clean package`
4. Copy to: `/public/games/my-game/`
5. Add to manifest (Nexus auto-detects)

### Task: Debug Game in Browser
```bash
# Start Nexus
npm start

# Open browser DevTools: F12
# Go to Sources tab
# Set breakpoints in JavaScript (or original Java if source maps work)
# Console shows errors
```

---

## ⚠️ Known Limitations & School Safety

### What Works on School Chromebooks
✓ All browser-based games (HTML5, WebGL, JavaScript, WebAssembly)  
✓ Eaglercraft Minecraft  
✓ Multiplayer via WebSocket proxy  
✓ Game saves in browser storage (IndexedDB)

### What Doesn't Work on School Networks
✗ Downloading/installing software  
✗ Running native applications (Prism, Java, etc.)  
✗ System-level modifications (protocol handlers)  
✗ Raw TCP sockets (uses WebSocket proxy instead)

### Solution: Everything in Browser
- No downloads needed
- No administrative access required
- Works on any Chromebook/school device
- Saves data locally in browser

---

## 🎯 Project Goals for Nexus

1. **Phase 1**: Get Eaglercraft working ← **You are here**
2. **Phase 2**: Understand TeaVM compilation
3. **Phase 3**: Build first custom browser game
4. **Phase 4**: Fork Minecraft & customize
5. **Phase 5**: Multi-player server hosting (optional)

---

## 📖 Getting Help

**Stuck on setup?**
- Check: `docs/BROWSER_GAMES_GUIDE.md` → Troubleshooting section
- Run: `bash scripts/setup/setup-eaglercraft.sh -verbose`

**Want to build custom games?**
- Read: `docs/JAVA_TO_BROWSER_TRANSPILATION.md`
- Start with LibGDX (Section 5 of transpilation guide)

**Understanding Eaglercraft internals?**
- GitHub: <https://github.com/LAX1DUDE/eaglercraft>
- their README and build.sh

---

## 🔗 External Resources

- [Eaglercraft](https://github.com/LAX1DUDE/eaglercraft)
- [TeaVM](http://www.teavm.org/)
- [LibGDX](https://libgdx.badlogicgames.com/)
- [WebGL Guide](https://webglfundamentals.org/)
- [Minecraft Protocol](https://wiki.vg/)

---

**Last Updated**: March 27, 2026  
**Docs Version**: 1.0
