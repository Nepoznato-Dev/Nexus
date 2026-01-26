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

## 17. Enhanced Role System
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

**Last Updated:** January 26, 2026
**Status:** Living document—updates as priorities shift
