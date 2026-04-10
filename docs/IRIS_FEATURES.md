# RAZONET Complete Feature Reference

> **RAZONET** is Nexus's AI-powered automation, diagnostics, and optimization engine. It provides intelligent mod management, crash analysis, performance optimization, conversational AI assistance, and proactive system monitoring.

---

## 🎮 Minecraft Mod Intelligence

### Dependency Management

- **Recursive Dependency Resolution**
  - Automatically discovers all required and optional dependencies for any mod
  - Traverses the entire dependency tree to find nested dependencies
  - Detects circular dependencies and warns users
  - Provides a complete download queue with all necessary files

- **Smart Dependency Download**
  - One-click download of all dependencies
  - Prioritizes server-side cache for injection workflows
  - Falls back to browser download if cache unavailable
  - Tracks download progress and file sizes
  - Batch downloads with staggered timing to avoid rate limits

### Compatibility & Safety

- **Multi-Layer Compatibility Checking**
  - Detects known incompatible mod pairs (Sodium vs Optifine, etc.)
  - Checks loader conflicts (Fabric-only vs Forge-only mods)
  - Validates Minecraft version requirements
  - Identifies mixin conflicts and library incompatibilities
  - Generates severity-ranked conflict reports (high/medium/low)

- **Install Risk Simulation**
  - Analyzes entire mod list before download
  - Calculates risk score (0-100) based on conflicts, warnings, and performance impact
  - Categorizes risk as low/medium/high
  - Provides actionable notes on what could go wrong
  - Shows full compatibility report for review

- **Version Pinning System**
  - Automatically selects latest compatible version for each mod
  - Locks versions to prevent accidental updates
  - Stores pinned version IDs and names for export
  - Supports version rollback to known-good configurations

### Server & Multiplayer Support

- **Server Compatibility Analysis**
  - Categorizes mods into three types:
    - **Client-only**: UI mods, minimaps, shaders (safe for multiplayer)
    - **Server-required**: API mods, libraries (must be on server)
    - **Universal**: Gameplay mods (work anywhere)
  - Helps students understand which mods work on school servers
  - Prevents installation of server-breaking mods

### Update Management

- **Intelligent Update Checker**
  - Scans all selected mods for available updates
  - Compares current version against latest compatible version
  - Shows update status: up-to-date, update available, or error
  - Preserves loader and Minecraft version compatibility
  - Provides one-click update flow (future feature)

### Modpack System

- **Modpack Export (.modpack.json)**
  - Exports current mod list with all metadata
  - Includes pinned versions, sources, loader, and Minecraft version
  - Generates timestamped, shareable JSON files
  - Preserves complete configuration for team sharing

- **Modpack Import**
  - Parses .modpack.json files with validation
  - Restores entire mod list from imported file
  - Auto-switches to RAZONET tab after import
  - Error handling for corrupted or invalid files

- **Community Packs (Local)**
  - Pre-curated modpacks for common use cases:
    - **Student FPS Boost**: Laptop-optimized performance mods
    - **Vanilla+ Lite**: Small QOL upgrades without heavy visuals
    - **Chill Builds**: Building-focused helpers with light performance
  - One-click import of entire curated sets
  - Maintained by Nexus community

### Download & Distribution

- **Server Cache Download Pipeline**
  - Downloads mods directly to server-side cache
  - Makes files ready for instant injection into game folders
  - Provides public URLs for cached files
  - Tracks successful/failed downloads with detailed reports
  - Reduces bandwidth usage through centralized caching

- **Performance Impact Estimation**
  - Analyzes mod categories to predict FPS impact
  - Scores mods as optimization (+performance) or heavy (-performance)
  - Provides overall performance rating (Excellent/Good/Moderate/Heavy)
  - Suggests adding optimization mods if score is poor

---

## 🔧 Crash Analysis & Diagnostics

### Crash Log Analyzer

- **Intelligent Log Parsing**
  - Detects common error signatures:
    - `NoClassDefFoundError` → Missing dependency
    - `MixinApplyError` → Mod conflict or incompatible versions
    - `OutOfMemoryError` → Increase RAM allocation
    - `DuplicateMod` → Remove duplicate or older versions
    - `ModResolutionException` → Required mods missing
    - `IncompatibleClassChangeError` → Update or remove incompatible mods
    - `InvalidModException` → Corrupt mod file, re-download needed

- **Mod ID Extraction**
  - Automatically pulls suspected mod IDs from crash logs
  - Parses stack traces and error messages
  - Identifies failing JAR files
  - Highlights likely culprit mods

- **Loader Detection**
  - Auto-detects Fabric, Forge, or Quilt from crash logs
  - Suggests loader-specific fixes
  - Validates mod loader compatibility

- **Actionable Suggestions**
  - Provides step-by-step fix instructions
  - Suggests which mods to temporarily remove
  - Links to common solutions and documentation
  - Prioritizes most likely fixes first

---

## ⚡ Performance Management

### System Performance Profiler

- **Real-Time Resource Monitoring**
  - **RAM Usage**: Tracks JavaScript heap size and percentage
  - **CPU Load**: Estimates via benchmark timing (0-100%)
  - **GPU/FPS**: Monitors frame rate and rendering performance
  - **Process List**: Shows all active iframes, canvases, videos, widgets
  - Updates every 5 seconds with live data

### Smart Task Manager

- **Active Process Detection**
  - Scans for browser tabs/iframes (games, tools)
  - Detects canvas elements (game engines)
  - Monitors AI thinking processes
  - Tracks media players (videos, audio)
  - Identifies open widgets with protection status

- **Auto-Optimization Engine**
  - Three aggressiveness levels (low/medium/high)
  - Custom thresholds for RAM and CPU intervention
  - Automatically suspends high-resource processes
  - Protects user-marked critical apps
  - Never culls open widgets (protected elements)

- **Safe Mode & Rollback**
  - Toggleable safe mode for stability
  - Stores "last known good" configuration
  - One-click restore to working state
  - Persists across browser sessions via localStorage
  - Auto-loads safe mode configuration on crashes

### Widget Protection System

- **Smart Widget Management**
  - Marks open widgets as `data-protected="true"`
  - Prevents RAZONET from culling active widgets
  - Detects widgets by `data-widget-open="true"` attribute
  - Includes widget info in process list
  - Never auto-optimizes protected elements

---

## 🎯 Recommendations & Guidance

### Shader Recommendations

- **Context-Aware Suggestions**
  - Detects if Iris/OptiFine is installed
  - Recommends shader packs by performance tier:
    - **Performance**: MakeUp Ultra Fast (best FPS for low-end)
    - **Balanced**: Complementary Reimagined (great visuals + solid FPS)
    - **Visual**: BSL Shaders, Sildur's Vibrant (cinematic lighting)
  - Provides notes on each shader's strengths
  - Only shows full list if shader mod detected

### Resource Pack Recommendations

- **Curated Pack Suggestions**
  - **Performance**: VanillaTweaks (minimal changes, optional tweaks)
  - **Balanced**: Faithful 32x (vanilla+ with crisp textures)
  - **Visual**: Better Default (stylized but vanilla-friendly)
  - Tiered by visual impact and performance cost

### Installation Guides

- **Step-by-Step Walkthroughs**
  - Auto-generated guides based on selected mods and loader
  - Includes mod loader installation steps
  - Shows exact file paths for .minecraft/mods folder
  - Provides download links and verification steps
  - Tailored instructions per operating system

---

## 🤖 AI Conversational Intelligence

### Memory System (IndexedDB)

- **Persistent Conversation History**
  - Stores all messages across sessions
  - Organizes by conversation ID
  - Tracks timestamps and metadata
  - Enables context-aware responses

- **User Profiling**
  - Learns user preferences over time
  - Tracks behavior patterns
  - Stores personality preferences (professionalism, mentorship levels)
  - Remembers important facts and context

- **Memory Categorization**
  - Stores important facts with importance scores
  - Categories: preferences, projects, problems, goals
  - Retrieves relevant memories during conversations
  - Enables long-term relationship building

### Proactive Suggestions

- **Context Analysis**
  - Analyzes last 10 messages for topic trends
  - Detects expertise level (beginner/intermediate/advanced)
  - Identifies conversation pace (fast/normal/deliberate)
  - Tracks recurring topics: coding, learning, career, business, etc.

- **Next-Step Suggestions**
  - Anticipates logical follow-up questions
  - Suggests deeper dives into topics
  - Recommends practice opportunities
  - Warns about edge cases and common pitfalls

- **Proactive Warnings**
  - Detects risky patterns in user questions
  - Warns about common mistakes before they happen
  - Provides severity-ranked alerts (high/medium/low)
  - Explains why each warning matters

### Personality Enhancement

- **Dynamic Tone Adjustment**
  - Adjustable professionalism (0-1 scale)
  - Mentorship mode for learning contexts
  - Emoji usage based on context
  - Formality vs casual language balancing

- **Self-Awareness Integration**
  - Scores confidence in answers (0-1)
  - Admits uncertainty when appropriate
  - Detects guessing vs knowledge
  - Provides transparent reasoning

### Common Sense Engine

- **Question-the-Premise Thinking**
  - Challenges false dichotomies
  - Suggests "handbrake" alternatives (unexpected third options)
  - Identifies hidden assumptions
  - Encourages unconventional solutions

- **Fallback Chains**
  - Attempts local generation first (instant, free)
  - Falls back to Google Gemini if needed
  - Handles API failures gracefully
  - Always provides some response

### Search Solver Integration

- **Intelligent Query Routing**
  - Determines if question needs API or can be answered locally
  - Routes based on complexity, specificity, and context
  - Optimizes for speed and cost
  - Maintains conversation flow

---

## 📊 Report & Feedback Management

### Report Classification System

- **Intelligent Report Sorting**
  - Auto-classifies submissions as: bug, complaint, feature request, feedback, or junk
  - Uses keyword matching and pattern detection
  - Scores confidence level for each classification
  - Filters out spam and low-quality submissions

- **Validation Pipeline**
  - Minimum length requirements (12 characters)
  - Junk pattern detection (symbol spam, repeated characters)
  - Confidence thresholds for auto-acceptance
  - Manual review queue for uncertain submissions

- **Storage & Organization**
  - Inbox for new reports
  - Review queue for uncertain classifications
  - Metadata tracking (timestamps, status, classification)
  - localStorage persistence for offline access

---

## 🔄 Automation & Workflow

### Auto-Dependency Resolution

- **Triggered on Mod Selection**
  - Runs automatically when viewing mod details
  - Resolves all dependencies in background
  - Shows progress and warnings
  - Builds download queue automatically

### Batch Download Orchestration

- **Profile Installation Flow**
  - Selects all mods in profile
  - Checks compatibility automatically
  - Downloads entire bundle with one click
  - Tracks success/failure per mod
  - Generates summary report

### Conflict Auto-Resolution

- **Suggestion Engine**
  - Provides specific fix actions for each conflict
  - Prioritizes easiest-to-implement solutions
  - Shows trade-offs for each option
  - Links to documentation when needed

---

## 🛠️ Developer & Advanced Features

### API Integration Layer

- **Multi-Provider Support**
  - Modrinth API integration
  - CurseForge API support (with key)
  - Google Gemini AI fallback
  - Local response generation

- **Rate Limiting & Caching**
  - Request queue management
  - 30-minute cache TTL
  - Deduplication for repeated queries
  - Respectful API usage patterns

### Data Persistence

- **localStorage Integration**
  - Safe mode state
  - Last known good configuration
  - Custom modpacks
  - User preferences

- **IndexedDB Usage**
  - Full conversation history
  - User profile data
  - Memory storage
  - Long-term data retention

### Error Handling

- **Graceful Degradation**
  - API failures fall back to local generation
  - Missing dependencies handled gracefully
  - Invalid inputs sanitized
  - User-friendly error messages

---

## 📈 Future-Ready Architecture

### Planned Enhancements (Hooks Wired)

- **One-Click Modpack Installer**: Direct .modpack file handling
- **Real-Time Update Monitoring**: Background update checks
- **Advanced Crash Guidance**: ML-based crash pattern recognition
- **Community Pack Sharing**: Cloud-based pack distribution
- **Performance Telemetry**: Anonymous FPS/RAM tracking
- **Shader Compatibility Matrix**: Automated shader testing
- **Resource Pack Bundling**: Paired packs with mod profiles

### Extension Points

- Pluggable AI providers
- Custom compatibility rules
- User-defined automation scripts
- Third-party integration APIs

---

## 🎯 Key Differentiators

**Why RAZONET is Special:**

1. **Truly Intelligent**: Not just rules-based - uses context, memory, and reasoning
2. **Proactive**: Suggests next steps before you ask
3. **Safe by Default**: Safe mode, rollback, and risk analysis built-in
4. **Student-Focused**: Designed for school environments with limited permissions
5. **Fully Integrated**: Works across mod management, performance, AI chat, and diagnostics
6. **Transparent**: Shows confidence scores, admits uncertainty, explains reasoning
7. **Offline-Capable**: Local generation for instant responses
8. **Privacy-Respecting**: All data stored locally, no tracking

---

## � Phase 2: Predictive Intelligence (NEW - v2.0.0)

### Outcome-Aware Mod Intelligence

- **Post-Installation Feedback Loop**
  - Prompts users: "How did your setup perform?" after installation
  - Records FPS baseline before and after mod installation
  - Tracks RAM usage, CPU impact, and stability metrics
  - Builds personal failure rate database for each mod combination
  - Uses historical data to improve future recommendations

- **Crash Pattern Analysis**
  - Analyzes crash logs to identify mod interactions that commonly fail
  - Stores anonymized crash patterns locally (100% private)
  - Builds compatibility matrix: mod A + mod B = crash risk X%
  - Learns which Minecraft versions have highest failure rates
  - Identifies loader-specific problems (Fabric vs Forge vs Quilt)

- **Performance Trend Tracking**
  - Measures FPS improvement/regression per mod
  - Identifies which mods have highest performance cost
  - Tracks RAM and CPU usage patterns
  - Shows historical performance trends over time
  - Alerts if recent mods are degrading system stability

### Predictive Crash Prevention

- **Pre-Launch Risk Calculator**
  - Analyzes mod combination BEFORE launch against historical failures
  - Predicts crash likelihood with 0-1 confidence score
  - Multi-factor risk assessment:
    - Historical crash rate for exact mod combo
    - Known mod conflicts (e.g., Sodium + Optifine)
    - RAM requirements vs system allocation
    - Mod maturity and compatibility status
  - Returns risk level: low/medium/high with actionable warnings

- **Crash Risk Warnings**
  - Shows pre-launch warnings if risk > 70%
  - Example: "⚠️ HIGH RISK: This combo crashed 73% of the time. Suggest disabling Optifine."
  - Lists specific mods causing conflict
  - Provides one-click suggested fixes
  - Can auto-disable risky mods if user trusts the system

- **Auto-Fix Suggestions**
  - Identifies which single mod to remove to reduce risk
  - Shows expected risk reduction: "Removing Optifine reduces risk from 78% → 15%"
  - Recommends alternatives: "Use Iris shaders instead of Optifine"
  - Can execute fixes with user approval
  - Confidence-gated automation (only auto-fixes when 95%+ confident)

### Personal Failure Memory (Opt-In)

- **User-Specific Failure Tracking**
  - Records YOUR personal crash history (100% local, never shared)
  - Learns which mods crash on YOUR specific hardware
  - Detects patterns: "Shaders always crash on your laptop"
  - Builds per-user mod reliability ratings
  - Saves hardware profile for context

- **Adaptive Personalized Warnings**
  - "On your system, Sodium has crashed 3x out of 5 uses"
  - "You historically underestimate RAM requirements"
  - "Entity Texture Features conflicts with your GPU drivers"
  - Adapts suggestions to user's unique history
  - Gets smarter with every installation

- **Reliable Mods (User's "Safe List")**
  - Identifies mods that have NEVER crashed on user's system
  - Prioritizes these in recommendations
  - Shows success streak: "Lithium: 12 successful uses"
  - Suggests mods with similar reliability
  - Builds user confidence in recommendations

- **Privacy-Respecting Design**
  - Completely opt-in with clear privacy notice
  - 100% local storage - no cloud sync, no tracking
  - User can export personal memory anytime (GDPR data export)
  - User can delete all data anytime (right to be forgotten)
  - Transparent about what data is collected
  - Cannot be enabled without explicit user consent

---

## 📊 Unified Feedback Loop (Outcome → Prediction → Learning)

The three Phase 2 systems work together to create intelligent feedback loops:

```
User Installs Mods
    ↓
Outcome Learning captures results (FPS, crashes)
    ↓
Predictive Prevention learns from outcome
    ↓
Personal Memory builds user-specific patterns
    ↓
Next Installation: "I predict 15% crash risk. Recommend disabling X."
    ↓
User approves/modifies
    ↓
Loop continues: system gets smarter
```

**Why This Matters:**

- RAZONET moves from **reactive** (help after crash) to **predictive** (prevent crash before it happens)
- **Learns continuously** from every installation across all users (+ personal history)
- **Personalization** adapts to each user's unique system and preferences
- **Transparent confidence** scores show when RAZONET is guessing vs confident
- **User control** via opt-in, manual overrides, and easy data deletion

---

## 📚 Technical Stack

- **Languages**: JavaScript (ES6+), React
- **Storage**: IndexedDB (long-term learning), localStorage (ephemeral state)
- **APIs**: Modrinth, CurseForge, Google Gemini
- **Architecture**: Modular, event-driven, async-first
- **Performance**: Real-time monitoring, smart caching, lazy loading
- **Privacy**: Local-first, no cloud sync, user-controlled data

---

**Last updated:** 2026-02-04  
**Version:** 2.0.0 (Production-Ready with Phase 2 Predictive Intelligence)  
**Modules:** 21 core components, 250+ features  
**New in v2.0.0:** Outcome Learning, Predictive Crash Prevention, Personal Failure Memory
