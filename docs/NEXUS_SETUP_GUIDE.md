# Nexus Community Project 2.0.0 - Complete Setup Guide

**Status**: Production-Ready | **Last Updated**: Feb 4, 2026 | **Version**: 2.0.0

---

## 📋 Quick Navigation

| System | Purpose | Quick Start |
|--------|---------|------------|
| **RAZONET** | AI-powered Minecraft mod management | See [IRIS_FEATURES.md](IRIS_FEATURES.md) |
| **Games Library** | 80+ open-source games catalog | 50,000+ games indexed in `/Games` |
| **Audio System** | Background music & sound integration | Configured in `src/Components/Music` |
| **Study Tools** | Flashcards, notes, Pomodoro timer | See `src/Components/Study` |
| **Browser** | In-app web browser component | See `src/Components/Browser` |

---

## 🚀 Installation & Development

### Prerequisites

```bash
Node.js 16+ (LTS recommended)
npm 8+
```

### Quick Setup (5 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

**Development URL**: `http://localhost:3000`  
**Production Build**: `/build` folder (optimized & minified)

---

## 📂 Project Structure

```
src/
├── Components/
│   ├── RAZONET/                    # AI mod management system (18 modules)
│   ├── Games/                       # Game library & mod profiles
│   ├── Study/                       # Educational tools
│   ├── Music/                       # Audio system
│   ├── Browser/                     # In-app browser
│   └── ...                          # Other components
├── PagesDisplay/                    # Page views (Landing, Auth, Dashboard, etc)
├── Layout.js                        # Main layout wrapper
├── App.js                           # Root component
└── index.js                         # Entry point

Entities/                            # Data models
docs/                                # Documentation (this folder)
package.json                         # Dependencies & scripts
```

---

## 🎮 RAZONET System (Minecraft Mod Intelligence)

**What is RAZONET?**  
An intelligent AI system that helps students safely manage Minecraft mods with:

- Crash analysis & prevention
- Dependency resolution
- Performance optimization
- Personalized recommendations

**18 Core Modules:**

1. `aiIntegration.js` - Google Gemini AI integration
2. `aiMemorySystem.js` - IndexedDB-backed conversation memory
3. `aiProactiveSuggestions.js` - Anticipatory recommendations
4. `irisCrashAnalyzer.js` - Crash log parsing (7 error signatures)
5. `irisUpdateChecker.js` - Mod version updates
6. `irisModResolver.js` - Dependency resolution + risk analysis
7. `irisRecommendations.js` - Shader/resource pack suggestions
8. - 11 more specialized modules

**See**: [`IRIS_FEATURES.md`](IRIS_FEATURES.md) for complete feature list

---

## 🎯 Phase 2 (2.0.0 Beta) - New Features

**Outcome-Aware Intelligence**: RAZONET learns from your actual gameplay

- "Did this setup work?" feedback dialog
- FPS tracking before/after
- Crash frequency per mod combo stored locally

**Predictive Crash Prevention**: Warns before launch

- "High risk: This combo crashed 73% of the time"
- Pre-launch compatibility check
- Suggest auto-disable unsafe mods

**Personal Failure Memory** (Opt-In): Your personal learning curve

- "On your PC, shaders + [X] always crash"
- Adaptive warnings tailored to your patterns
- 100% local, no tracking

**See**: [`IRIS_2.0.0_PHASE2_GUIDE.md`](IRIS_2.0.0_PHASE2_GUIDE.md) for implementation details

---

## 🕹️ Games Library

**80+ Open-Source Games** available in the Games section:

- Portal 2D, Pacman, Snake, Chess, etc.
- Fully playable in-browser
- No external dependencies

**Catalog**: `games-manifest-85.json` indexes all available games  
**See**: Game library component in UI

---

## 🎵 Audio System

**Background Music Integration:**

- Configurable per-page music
- Volume controls
- Fade in/out transitions

**Components**: `src/Components/Music/MusicPlayer.js`

---

## 📚 Study Tools

**Educational Features:**

- **Flashcard Deck**: Create/study card sets
- **Notes Panel**: Organize study notes
- **Pomodoro Timer**: 25-min focus cycles
- **Dictionary**: Quick term lookup
- **Scientific Calculator**: Advanced math
- **Formula Sheet**: Math reference

**Location**: `src/Components/Study/`

---

## 🔧 Configuration & Data

### localStorage Keys (Client-Side Persistence)

```javascript
nexus_safe_mode              // Safe mode enabled
nexus_last_known_good        // Last working mod config
nexus_custom_modpacks        // User-created mod packs
iris_outcomes_log            // FPS/crash history (Phase 2)
iris_personal_failures       // Personal failure patterns (Phase 2)
```

### IndexedDB Stores (Long-Term Memory)

```javascript
iris_conversations           // AI conversation history
iris_user_profile           // User expertise level, preferences
iris_important_facts        // Learned user-specific info
iris_crash_patterns         // Historical crash analysis (Phase 2)
```

---

## 🚨 Troubleshooting

### Common Issues

**Issue**: Mods not loading  
**Solution**: Check `ModManager` -> `RAZONET` tab -> `Run Performance Scan` -> check crash log

**Issue**: Performance drops  
**Solution**: RAZONET -> `Performance Scan` -> identify heavy mods -> try `Safe Mode`

**Issue**: Lost mod configuration  
**Solution**: RAZONET -> `Restore Last Known Good` (automatic backup)

**Issue**: Out of disk space  
**Solution**: See [CLEANUP_GUIDE.md](#cleanup)

---

## 🔐 Privacy & Safety

**Data Storage:**

- ✅ All data stored **locally** in browser (localStorage + IndexedDB)
- ✅ No tracking, no analytics, no cloud sync
- ✅ Optional: Google Gemini API calls (AI fallback only)
- ✅ Safe mode protection: prevents corrupting configs

**Student Safety:**

- School-friendly (no ads, no trackers)
- Works offline (except AI chat)
- Safe mod recommendations
- Crash prevention before they happen

---

## 🤝 Contributing

**Bug Reports**: File issues with:

1. Steps to reproduce
2. Error message (from RAZONET crash analyzer)
3. Browser & OS details

**Feature Requests**: Ideas always welcome!

---

## 📦 Build & Deployment

### Development Build (with hot reload)

```bash
npm start
```

### Production Build

```bash
npm run build
```

Output: `/build` folder (optimized, minified, tree-shaken)

**Size**: ~3MB gzipped (includes all 200+ RAZONET features)

---

## 📜 License

See [COPYRIGHT.md](COPYRIGHT.md)

---

## 🔗 Quick Links

- **RAZONET Features**: [IRIS_FEATURES.md](IRIS_FEATURES.md)
- **Phase 2 Guide**: [IRIS_2.0.0_PHASE2_GUIDE.md](IRIS_2.0.0_PHASE2_GUIDE.md)
- **Keyboard Shortcuts**: [KEYBOARD_SHORTCUTS.md](KEYBOARD_SHORTCUTS.md)
- **License**: [COPYRIGHT.md](COPYRIGHT.md)

---

**Questions?** Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for other resources.
