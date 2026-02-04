# Nexus Future Ideas & Roadmap

**Status:** Ideas for v1.1+, v2.0, and beyond. Not in scope for 1.0.0.

---

## 1. Better Chat System
**Priority:** v1.1+

- Data sending, image uploads, emoji support
- Kaomoji character support
- Advanced chat filters (AI-powered)
- Device-to-device communication with ID system:
  - Alphanumeric encoding: A=1, B=2, ... Z=26
  - Fallback with `?` for unsupported chars
  - Cross-device sync via email/Gmail integration
- "Airdrop" system similar to iPhone using email notifications:
  - Detect Gmail, Google Drive, Google Docs connections
  - Show notifications for shared content
  - Optional: Full email integration

---

## 2. Advanced AI System
**Priority:** v1.1+

### Core Features
- Cache chat data (user speaking style / patterns)
- Multiple chat channels
- No pre-generated responses (only system messages like "Sorry, I cannot help...")
- Real math capability
- Multi-language support
- Kaomoji/emoji reactions to user inputs
- Feature tutorials and guidance

### AI Capabilities
- Music playback control
- Image recognition (future)
- Internet search (future - optional)
- Knowledge base: programming, math, writing, history, subjects
- Code review and analysis
- Performance suggestions
- Emotion display via custom kaomojis: `(ǒ-ô)`, `😑`, etc.

### AI Personality Slider
- Scale from "Moody" ←→ "Professional"
- "Adaptive" mode in middle for balanced personality
- Auto-adjusts based on user interaction patterns
- Manual override by user
- Cannot auto-slide when manually set

### AI Tasks/Commands
- Code review
- Performance stats analysis
- Code suggestions & refactoring
- Built-in terminal for user execution
- Data analysis
- Custom configurable behavior per user
- **YouTube + Library Search** (IRIS)
  - Search YouTube for tutorials/explanations
  - Search in-app Open Access Library sources
  - Present **books + videos** together for deeper learning
  - Encourage long-form sources for high-quality answers

### IRIS Smart Performance Manager
- **Task manager shows top resource hogs** (CPU/GPU/RAM) sorted by impact
- **Auto-cull inactive tasks** (browser tabs, videos, games, media, AI)
- **Safe-mode culling** if AI must pause (minimal culler still runs)
- **Context-aware messages** (“IRIS stopped ‘X’ — enjoy your video lag free!”)
- **User controls**: aggressiveness level + protected apps list

### Page Editor Mode
- Allow users to customize UI/layout of any page
- Fallback to original code if needed
- Full customization with "editing mode" toggle

---

## 3. Enhanced UI Systems & Elements
**Priority:** v1.2

### Layout Improvements
- Sidebar: Make smaller, integrate as part of UI
- Search bar: Move to dashboard (remove black bar)
- Notification bar: Display most recent/important + device volume-aware chime

### Widget Enhancements
- **Existing widgets:** YouTube, TikTok, Spotify
- **New widgets:** Calculator, Dictionary, Notes
- **Music widget:** Auto-switch based on provider (Spotify/YouTube Music/iTunes)
- **YouTube/TikTok widget:** Auto-combine based on active content
- **All widgets:** Customizable size, moveable, resizable
- **Persistent widgets:** Stay across page switches, only closeable via X button

### Additional Loading Screens
- GameCube-style: Code/robots rebuilding the app
- Xbox 360-style: Wires plugging into giant N, lighting up dark room
- Configurable button animations with circuit board theme
- Settings: Toggle between different loading screen styles

---

## 4. Settings Consolidation
**Priority:** 1.0.0 ✓ (IN PROGRESS)

Merge redundant settings:
- Motion/animation controls
- Accessibility overlaps
- Transparency/blur duplicates
- Organize by function, not by subsystem

---

## 5. Seasonal Backgrounds & Animations
**Priority:** v1.1

### Backgrounds
- Halloween, Christmas, New Year themes
- Auto-apply based on date/time
- Custom image & GIF upload support (all formats)
- Easter egg backgrounds
- Error handling: Graceful fallback for unsupported formats

### Animations
- Fade-in, pop-up, wiggle effects
- User-configurable per-page
- Performance-aware: Reduce on low-end devices

---

## 6. Code Obfuscation / Anti-Theft
**Priority:** v2.0

- Minify/obfuscate code for production builds
- Access code requirement for code inspection
- Anti-scraping measures
- (Note: Already have basic watermark system)

---

## 7. Less Student-Focused Design
**Priority:** v2.0

- Rebrand away from "student hub" messaging
- Add professional/work tools
- Keep study features but not center them
- Support more diverse use cases for ages 14+

---

## 8. Browser Extensions / Multi-View Ideas
**Priority:** v2.0

### IDEA 1: Per-Page Browser
- Media tab has isolated browser (saves own data)
- Games tab has isolated browser (no cross-tab data)
- Users stay on same tab, cleaner UX

### IDEA 2: Multi-View Browser
- Full-page browser mode + windowed mode
- Data syncs across all browser instances
- Keeps user on same internal page

### IDEA 3: Browser-Like Navigation
- Homepage as start page
- Top bar looks like browser navigation
- Every page click opens new page in view
- Everything visible simultaneously

---

## 9. Performance Management & Optimization
**Priority:** v1.1

### Core Features
- Performance-aware: Decrease quality/complexity as load increases
- Prefer FPS/gameplay over visual fidelity (like Minecraft mods)
- Battery awareness: Show warnings at low battery
- CPU limiter: ~10% CPU on Chromebooks with integrated graphics
- RAM tracking: Always return unused RAM to device (not hoard)
- FPS counter: Accessible explanations for non-technical users

### Task Manager
- Built-in task manager: Kill/disconnect long-running processes
- Stop AI thinking if it lags device
- RAM limiter for games (configurable)
- Option: Close all tabs for maximum game performance
- Option: ESC key → panic mode (closes game, returns to Nexus logged in)
- Show **top CPU/GPU/RAM tasks first** (sorted by impact)
- Allow **auto-cull of inactive tasks** with user-friendly notifications

### System Specs & Monitoring
- Real-time RAM, CPU, GPU usage
- Device diagnostics (optional, opt-in)
- "Stress test" feature (3DMark-style)
- Device capability detection

---

## 10. Simplified Login Flow
**Priority:** 1.0.0 ✓ (IN PROGRESS)

```
URL → Error page (with C hotkey)
↓
Landing page
↓
Access code input (NO username)
↓
Checker validates code
↓
Account found
↓
Accessibility settings (limited, first sign-in only)
↓
Optional loading screen (if toggled)
↓
Dashboard → "Good evening [NAME]"
```

---

## 11. Name/Rebranding
**Priority:** v2.0 (DECIDE LATER)

Current: "Nexus" (means connection of things)
- Too generic, used everywhere
- Want unique, standout name
- Alternatives to explore: TBD

---

## 12. Better Music Player & Widgets
**Priority:** v1.1

### Music Formats & Sources
- Support: MP3, MP4, WAV, etc.
- YouTube URL → MP3/MP4 conversion
- Spotify, iTunes, YouTube Music integration
- Download capability for convenience

### Music Player Page
- "MP Music Player" page
- Upload & save music files
- Local storage management

### Music Widget
- Smaller default size (optimize for 11" Chromebook screens)
- Resizable, moveable
- Persistent across page switches
- Volume-responsive

---

## 18. Open Access Library Hub
**Priority:** v1.1+

### Sources
- Project Gutenberg (public domain classics)
- Open Library (borrowable/archival titles)
- LibreTexts (open textbooks)
- OpenStax (open educational resources)
- OER Commons (learning materials)
- Directory of Open Access Books (DOAB)

### Features
- Unified search across all sources
- Source filters + availability tags
- Reading lists / offline queue
- Citation export (MLA/APA/Chicago)

---

## 13. System Specs & Usage Monitoring
**Priority:** v1.1+

- Real-time RAM, CPU, GPU (if available) monitoring
- Optional system-wide diagnostics
- Stress testing capability (3DMark-style)
- Used to inform performance decisions
- Never invasive—user control only

---

## 14. Free Movie Sites Integration
**Priority:** v2.0

- Integrate: Soap2day, Tinyzone, similar services
- Internal search bar: Find movies across sites
- Scam/unsafe page protection
- Fallback: "Movie not found in Nexus database"
- Support both internal and external access (optional)
- Full browser fallback always available

---

## 15. Phone / Tablet Support
**Priority:** v3.0

### Requirements
- Mobile-first optimization
- No crashes/breaks on mobile
- Mobile-specific games (no download needed)
- Works on low-RAM devices (iPhone XR ~4GB, similar to Chromebooks)
- Performance optimization critical
- Storage-conscious design

### Challenges to Solve
- Screen size adaptation
- Touch vs keyboard/mouse input
- Battery/thermal management
- Storage limitations

---

## 16. Release Strategy
**Priority:** NOW (DECISION REQUIRED)

### Current Decision
- **1.0.0:** Focus on core features + quality over quantity
- **Testing:** Full QA before release
- **Beta → Release:** Proper versioning, not rushed
- **Update cadence:** Regular minor updates vs big feature drops

### Future
- Keep in beta until stable
- Smaller quality-of-life updates regularly
- Major features in tagged versions (v1.1, v2.0, etc.)
- Community feedback loop

---

## 17. In-App Bug Reports (Zero-Cost)
**Priority:** v1.1+

- **Bug Report Inbox** inside Nexus (no external services)
- Users can submit: title, steps, expected vs actual, device info, screenshots
- **Local storage / IndexedDB** for offline-first reports
- **Export** button: download JSON/CSV so owner can review
- Optional: auto-attach basic diagnostics (FPS, RAM, page, time)
- Later upgrade: send to GitHub issues or email when funds allow

---

## 18. Enhanced Role System
**Priority:** 1.0.0 ✓ (IN PROGRESS)

### Role Hierarchy (Color-Coded)
```
🔴 Guest (LIMITED)
  - Limited AI
  - Basic functionality
  - Limited games/content
  - 15-20min temp access with invite code

🟠 Member (NORMAL)
  - Full features
  - Approve via Discord/in-app chat

🟡 Member+ (NEW)
  - Dashboard customization
  - Extended features
  - Requires Owner/Admin/Mod approval

🟢 Moderator (NEW)
  - Kick users
  - Ban: 5 min - 24 hrs
  - Requires Owner/Admin approval

🔵 Admin
  - Kick users
  - Ban: 5 min - 4 days
  - Early access to features/updates
  - Requires Owner approval

🟣 Owner
  - Full access to everything
  - New content first
  - All permissions

```

### Guest Mode Debate
- **Option A:** Remove guest mode, require access code
- **Option B:** Keep limited guest with invite system
  - Temp access: 15-20 minutes
  - Invite code: Works once per day
  - Timer pauses when app unfocused
  - Expires: "Your temporary account expired. Have a nice day!"
  
**Decision needed:** Community preference?

---

## Implementation Priority by Version

### 1.0.0 (NOW)
- [ ] Settings consolidation
- [ ] Simplified login flow
- [ ] Enhanced role system with UI
- [ ] Persistent widgets system
- [ ] Performance dashboard & task manager
- [ ] Additional loading screen options
- [ ] Seasonal backgrounds (date-based)

### v1.1
- [ ] Better AI system
- [ ] Chat enhancements (images, emoji, filters)
- [ ] Advanced performance monitoring
- [ ] System specs viewer
- [ ] Music player improvements
- [ ] Better widget system

### v1.2+
- [ ] Per-page browser mode
- [ ] Movie site integration
- [ ] Advanced animation controls
- [ ] Minecraft Mod Manager (see Section 20)

### v2.0+
- [ ] Code obfuscation
- [ ] Non-student branding
- [ ] Name rebrand decision
- [ ] Deep system integration
- [ ] Phone/tablet support research

### v3.0+
- [ ] Full mobile support
- [ ] Advanced device integration

---

## 20. Minecraft Mod Manager
**Priority:** v1.2+
**Accessibility Focus:** Bypasses school filters for educational modding

### Problem
- Modrinth and CurseForge URLs blocked by GoGuardian/school filters
- Students can't learn modding or customize their Minecraft experience
- No easy way to install mods without technical knowledge
- Hidden task manager prevents direct downloads

### Solution
IRIS becomes the **mod discovery & download proxy** for students:
- Search Modrinth/CurseForge via IRIS interface
- Download mods directly to user-selected folder
- Educational resources (mod guides, dependency info, version matching)
- Safety warnings and best practices

### Core Features

#### 1. Mod Discovery
- **Search Interface**
  - Real-time search across Modrinth + CurseForge
  - Filters: Game version, category (gameplay, decoration, optimization), sort by downloads/recency
  - Display: Screenshots, description, author, downloads count, rating
  - Version selector (which Minecraft version)

#### 2. Mod Download
- **Download Management**
  - User selects folder via file picker (bypasses blocked direct downloads)
  - Batch download (select multiple mods at once)
  - Progress tracking: File size, speed, ETA
  - Checksum validation (verify integrity)
  
#### 3. Dependency Resolution
- **Smart Dependency Detection**
  - Scans mod metadata from API
  - Alerts user: "This mod requires [Fabric/Forge] loader"
  - Suggests additional required mods ("Requires: Library X version Y")
  - One-click: "Download All Dependencies"

#### 4. Educational Content
- **Learning Resources Built-In**
  - "What is a Minecraft mod?" explainer
  - "How to install mods" step-by-step guide
  - "Mod loaders explained" (Fabric vs Forge vs Quilt)
  - "Save safety tips" - backup before installing
  - Links to mod documentation

#### 5. Version Matching
- **Game Version Compatibility**
  - Auto-detects user's Minecraft version (read from launcher)
  - Shows which mods support that version
  - Warning if mod only works on different versions
  - Multi-version support ("Works on 1.20.1, 1.19.3, 1.18+")

#### 6. Safety & Best Practices
- **Risk Warnings**
  - Flag untrusted sources (only Modrinth/CurseForge)
  - Backup reminder ("Always backup saves before mods")
  - Performance impact estimate ("Heavy mods: expect 10-20 FPS drop")
  - Mod conflicts warning ("Popular conflicts: OptiFine + Sodium")

### API Integration

#### Modrinth API
- Endpoint: `https://api.modrinth.com/v2/search`
- Rate limit: 600 req/min (sufficient for users)
- Data: mod name, description, downloads, ratings, versions, dependencies, screenshots

#### CurseForge API
- Endpoint: `https://api.curseforge.com/v1/mods/search`
- Requires API key (free tier available)
- Data: mod info, file downloads, version compatibility

### Implementation Architecture

```
ModManager.js (React Component)
├── ModSearch.js (Search UI + filters)
├── ModDetails.js (Mod info, dependencies, versions)
├── ModDownloader.js (Download + progress)
├── ModEducation.js (Learning resources)
└── modAPIHandler.js (Modrinth/CurseForge API calls)
```

### User Flow
1. Student navigates to "Minecraft Mods" in Utilities
2. Searches for mod name (e.g., "Sodium")
3. Sees compatibility: ✅ 1.20.1, ❌ 1.19 (not compatible)
4. Clicks download → selects folder
5. System detects dependency: "Needs Fabric Loader" → one-click add
6. Downloads all files to selected folder
7. Educational tip: "Now follow this guide to install mods..."

### Success Metrics
- ✅ Zero students need help installing mods manually
- ✅ No broken installations (dependency conflicts prevented)
- ✅ Mods actually work first try
- ✅ Students learn modding ecosystem through built-in guides

---

**Last Updated:** February 3, 2026
**Status:** Living document—updates as priorities shift
