# 📦 Redstonized Minecraft Optimizers - Complete Documentation Index

Welcome to the comprehensive documentation for the Redstonized Minecraft Optimizers modpack - the ultimate performance enhancement package achieving 1200+ FPS!

## 🚀 Quick Start

**Total Install Time:** 5-10 minutes  
**Supported Versions:** Minecraft 1.20.1 (primary), 1.19.4, 1.18.2, 1.16.5 (planned)  
**Mod Loader:** Fabric  
**Performance:** 1200+ FPS on RTX 5060 Ti + Ryzen 7 5700X

### Fastest Installation:

```bash
# Method 1: Via Nexus Launcher (Recommended)
1. Open Nexus → Minecraft Section
2. Select version 1.20.1
3. Check "Install Redstonized Optimizers"
4. Click Launch

# Method 2: Standalone Script
bash /games/minecraft/modpacks/redstonized-optimizers/install.sh
```

---

## 📚 Documentation Files

### Core Documentation

#### 1. [README.md](README.md) - Main Overview
- **Purpose:** Introduction and feature overview
- **Contains:**
  - Performance statistics (1200 FPS benchmark)
  - Complete mod list (85+ mods)
  - Installation instructions
  - Quick start guide
  - Performance presets (Potato, Balanced, Ultra)
- **Read Time:** 5 minutes
- **Target Audience:** Everyone

#### 2. [modpack.json](modpack.json) - Technical Specifications
- **Purpose:** Machine-readable configuration
- **Contains:**
  - All mod versions and file names
  - Compatibility matrix
  - Recommended settings
  - Performance impact ratings
  - Download links
- **Format:** JSON
- **Target Audience:** Developers, automated installers

### Installation & Setup

#### 3. [install.sh](install.sh) - Auto-Installer Script
- **Purpose:** One-command installation
- **Features:**
  - Detects platform (Linux/Mac/Windows)
  - Installs Fabric Loader
  - Downloads and installs mods
  - Configures optimal settings
  - Creates launch profile
- **Usage:** `bash install.sh`
- **Time:** 5-10 minutes

### Configuration Guides

#### 4. [MOD_TOGGLE_GUIDE.md](MOD_TOGGLE_GUIDE.md) - Mod Management
- **Purpose:** Enable/disable mods without file editing
- **Contains:**
  - Using Mod Menu for toggles
  - Manual config editing guide
  - Preset switching scripts (Potato/Balanced/Ultra)
  - Creating custom Fabric mod for GUI toggles
  - Per-mod toggle locations
- **Read Time:** 10 minutes
- **Target Audience:** Users wanting to customize mod loadout

#### 5. [COMPATIBILITY.md](COMPATIBILITY.md) - Mod Compatibility Matrix
- **Purpose:** Resolve mod conflicts and issues
- **Contains:**
  - Full compatibility matrix (✅ ⚠️ ❌)
  - Known issues and fixes
  - OptiFine alternatives
  - Forge vs Fabric mod equivalents
  - Performance troubleshooting
  - Per-mod configuration fixes
- **Read Time:** 15 minutes
- **Target Audience:** Users experiencing crashes or conflicts

### Enhancements

#### 6. [RESOURCE_PACKS_SHADERS.md](RESOURCE_PACKS_SHADERS.md) - Visual Enhancements
- **Purpose:** Add resource packs and shaders
- **Contains:**
  - Recommended resource packs (Faithful, Stay True, Fresh Animations)
  - Recommended shaders (Complementary, BSL, Sildur's, Vanilla Plus)
  - Performance impact analysis
  - Installation scripts
  - Shader configuration tips
  - Performance comparison table
- **Read Time:** 12 minutes
- **Target Audience:** Users wanting better visuals

### Advanced Topics

#### 7. [MULTI_VERSION_SUPPORT.md](MULTI_VERSION_SUPPORT.md) - Version Porting
- **Purpose:** Use modpack on different Minecraft versions
- **Contains:**
  - Version support matrix
  - 1.19.4, 1.18.2, 1.16.5 porting guides
  - Mod version changes per Minecraft version
  - Installation scripts for each version
  - Performance comparisons
  - Future roadmap
- **Read Time:** 20 minutes
- **Target Audience:** Advanced users, developers

---

## 🎯 Documentation by Use Case

### "I just want to install and play"
→ Read: [README.md](README.md) (first section)  
→ Run: `bash install.sh`  
→ Time: 10 minutes

### "I want maximum FPS"
→ Read: [MOD_TOGGLE_GUIDE.md](MOD_TOGGLE_GUIDE.md) → Potato Mode  
→ Disable: Distant Horizons, Shaders, visual effects  
→ Expected: 1000-1200 FPS

### "I want beautiful graphics AND good FPS"
→ Read: [RESOURCE_PACKS_SHADERS.md](RESOURCE_PACKS_SHADERS.md) → Balanced section  
→ Install: Complementary Shaders + Faithful 32x  
→ Expected: 400-700 FPS

### "Game is crashing/not working"
→ Read: [COMPATIBILITY.md](COMPATIBILITY.md) → Troubleshooting section  
→ Check: Crash logs, mod conflicts  
→ Fix: Remove conflicting mods

### "I want to use a different Minecraft version"
→ Read: [MULTI_VERSION_SUPPORT.md](MULTI_VERSION_SUPPORT.md) → Your version  
→ Install: Version-specific mod list  
→ Note: 1.20.1 has best performance

### "I want to customize which mods are enabled"
→ Read: [MOD_TOGGLE_GUIDE.md](MOD_TOGGLE_GUIDE.md) → Method 1 or 2  
→ Use: Mod Menu or manual config editing  
→ Time: 5 minutes

---

## 📊 Mod Categories & Documentation

### Core Performance (Required)
**Docs:** [README.md](README.md) → Complete Mod List → Core Optimizations

- Embeddium (rendering)
- Lithium (general optimization)
- FerriteCore (memory)
- ModernFix (launch time)
- Starlight (lighting)
- LazyDFU (startup)

**Don't disable these!** They provide 60-70% of the FPS boost.

### Rendering & Graphics (Optional)
**Docs:** [MOD_TOGGLE_GUIDE.md](MOD_TOGGLE_GUIDE.md) → Potato Mode (to disable)

- Iris Shaders (shaders support)
- Distant Horizons (far chunks)
- Enhanced Block Entities (better blocks)
- CullLeaves (optimized leaves)
- Continuity (connected textures)

**Can disable** if you want maximum FPS over visuals.

### Quality of Life (Optional)
**Docs:** [README.md](README.md) → Complete Mod List → UI & Quality of Life

- Mod Menu (**Keep enabled** - needed for toggles!)
- JEI (recipe viewer)
- Jade (tooltips)
- Inventory Profiles Next (sorting)
- Mouse Tweaks (better mouse)

**Recommended to keep enabled** - minimal performance impact.

---

## 🛠️ Configuration Files

### Generated by Install Script

```
~/.minecraft/
├── mods/                   # Mod .jar files (85+ mods)
├── config/                 # Configuration files
│   ├── embeddium-mixins.properties
│   ├── sodium-options.json
│   ├── lithium.properties
│   ├── ferritecore.mixin.properties
│   ├── iris.properties
│   ├── entityculling.json
│   ├── bobby.conf
│   └── ... (100+ config files)
├── resourcepacks/          # Resource packs
├── shaderpacks/            # Shader packs
└── redstonized-backup-*/   # Backups (if any)
```

### Important Config Locations

**Embeddium Settings:**
- In-game: Video Settings → Embeddium Options
- **Doc:** [COMPATIBILITY.md](COMPATIBILITY.md) → Mod-Specific Configs

**Distant Horizons:**
- File: `config/DistantHorizons.toml`
- **Doc:** [COMPATIBILITY.md](COMPATIBILITY.md) → Distant Horizons Settings

**Shader Settings:**
- In-game: Video Settings → Shader Packs → Settings
- **Doc:** [RESOURCE_PACKS_SHADERS.md](RESOURCE_PACKS_SHADERS.md) → Shader Settings

---

## 🎮 Integration with Nexus Launcher

### Chromebook Launcher
**File:** `/public/games/minecraft/chromebook-launcher.html`

**Features:**
- Checkbox to install Redstonized Optimizers
- Auto-selects Minecraft 1.20.1
- Generates bash script with modpack installation
- Optimized Java arguments included

**Usage:**
1. Visit Nexus → Minecraft
2. Check "Install Redstonized Optimizers"
3. Click "Launch Minecraft"
4. Run downloaded script in terminal

### Desktop Launcher
**Planned:** Native launcher integration

---

## 📈 Performance Expectations

### By Hardware Tier

**High-End** (RTX 3060+, Ryzen 7/i7):
- Vanilla: 150-250 FPS
- With Redstonized: **800-1200 FPS**
- Improvement: **500-800%**

**Mid-Range** (GTX 1660, Ryzen 5/i5):
- Vanilla: 80-150 FPS
- With Redstonized: **300-600 FPS**
- Improvement: **300-400%**

**Low-End** (Integrated Graphics, Budget CPU):
- Vanilla: 30-60 FPS
- With Redstonized: **60-150 FPS**
- Improvement: **100-200%**

*See [README.md](README.md) → Performance Comparison for full table*

---

## 🐛 Troubleshooting Quick Reference

| Issue | Doc | Section |
|-------|-----|---------|
| Crash on startup | [COMPATIBILITY.md](COMPATIBILITY.md) | Common Issues → Crash on Startup |
| Low FPS despite mods | [COMPATIBILITY.md](COMPATIBILITY.md) | Common Issues → Low FPS |
| Shaders not working | [RESOURCE_PACKS_SHADERS.md](RESOURCE_PACKS_SHADERS.md) | Troubleshooting |
| Distant Horizons lag | [COMPATIBILITY.md](COMPATIBILITY.md) | Compatibility Fixes → Distant Horizons |
| Mod conflicts | [COMPATIBILITY.md](COMPATIBILITY.md) | Incompatible Mods |
| Wrong version | [MULTI_VERSION_SUPPORT.md](MULTI_VERSION_SUPPORT.md) | Version Support Matrix |

---

## 🔗 External Resources

### Mod Download Sources
- **Modrinth:** https://modrinth.com/
- **CurseForge:** https://www.curseforge.com/
- **Fabric:** https://fabricmc.net/

### Shader Downloads
- **Complementary:** https://modrinth.com/shader/complementary-unbound
- **BSL:** https://modrinth.com/shader/bsl-shaders
- **Sildur's:** https://sildurs-shaders.github.io/

### Resource Pack Downloads
- **Faithful:** https://faithfulpack.net/
- **Vanilla Tweaks:** https://vanillatweaks.net/
- **Stay True:** https://modrinth.com/resourcepack/stay-true

---

## 📞 Support

### Getting Help

1. **Check Documentation First**
   - Search this index for your issue
   - Read relevant docs

2. **Check Logs**
   ```bash
   # Latest log
   cat ~/.minecraft/logs/latest.log
   
   # Crash report
   cat ~/.minecraft/crash-reports/latest.txt
   ```

3. **Report Issues**
   - Include: Full log, mod list, system specs
   - Where: Nexus Community Discord or GitHub Issues

---

## 🎯 Quick Command Reference

```bash
# Install modpack
bash /games/minecraft/modpacks/redstonized-optimizers/install.sh

# Switch to Potato Mode
bash ~/.minecraft/modpack-presets/potato-mode.sh

# Switch to Ultra Mode
bash ~/.minecraft/modpack-presets/ultra-mode.sh

# Backup current mods
cp -r ~/.minecraft/mods ~/.minecraft/mods-backup

# Restore backup
rm -rf ~/.minecraft/mods
mv ~/.minecraft/mods-backup ~/.minecraft/mods

# Check installed mods
ls -1 ~/.minecraft/mods/*.jar | wc -l

# View Embeddium settings
cat ~/.minecraft/config/sodium-options.json

# View Distant Horizons settings
cat ~/.minecraft/config/DistantHorizons.toml
```

---

## 📝 Documentation Maintenance

### Last Updated
**Date:** 2025  
**Version:** 1.0.0  
**Minecraft Version:** 1.20.1

### Contributors
- **Modpack Creator:** Redstonized
- **Documentation:** Nexus Team
- **Integration:** Nexus Community

---

## 🗺️ Roadmap

### Current (v1.0.0)
- ✅ 1.20.1 full support
- ✅ 85+ optimization mods
- ✅ Complete documentation
- ✅ Nexus launcher integration
- ✅ Auto-installer script

### Upcoming (v1.1.0)
- 🔄 1.19.4 support
- 🔄 GUI mod toggle system
- 🔄 In-game shader downloads
- 🔄 Auto-updater

### Future (v2.0.0)
- 🔄 Multi-version installer
- 🔄 Cross-version config sync
- 🔄 1.21.x support
- 🔄 Server-side optimizations

---

## 💡 Pro Tips

1. **Always backup** before major changes:
   ```bash
   cp -r ~/.minecraft ~/.minecraft-backup-$(date +%Y%m%d)
   ```

2. **Update mods regularly** for performance improvements

3. **Use Mod Menu** to check for mod updates in-game

4. **Allocate 6-8GB RAM** for best performance:
   - Edit launcher profile
   - Set `-Xmx8G -Xms2G`

5. **Close background apps** when gaming for maximum FPS

6. **Use Balanced preset** for best visual/performance ratio

---

**Happy gaming! Enjoy your 1200+ FPS Minecraft experience! 🚀✨**

*For questions, visit [Nexus Community](https://nexus.community) or check individual documentation files above.*
