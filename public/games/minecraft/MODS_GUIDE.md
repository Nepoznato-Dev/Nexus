# Minecraft Mods Organization Guide

## 📥 How to Add Mods to Version Folders

### Quick Start

1. **Run the version setup** (if not done yet):
   ```bash
   cd public/games/minecraft/versions
   bash setup-versions.sh
   ```

2. **Download recommended mods** for each version from the links in `mods/MODS.txt`

3. **Place mods** in the appropriate version's `mods/` folder

### Priority Versions to Set Up

For maximum impact with minimum effort, set up these versions first:

#### ⭐ 1.8.9 - Best for Low-End Devices
```
versions/1.8.9/mods/
├── optifine-1.8.9.jar          # Get from optifine.net
└── patcher-1.8.9.jar           # Get from sk1er.club/mods/patcher
```

#### ⭐ 1.12.2 - Best for Modded Play
```
versions/1.12.2/mods/
├── optifine-1.12.2.jar         # optifine.net
├── foamfix-1.12.2.jar          # curseforge.com
├── phosphor-1.12.2.jar         # curseforge.com
└── vanillafix-1.12.2.jar       # curseforge.com
```

#### ⭐ 1.20.4 - Latest Stable
```
versions/1.20.4/mods/
├── sodium-1.20.4.jar           # modrinth.com/mod/sodium
├── lithium-1.20.4.jar          # modrinth.com/mod/lithium
├── modernfix-1.20.4.jar        # modrinth.com/mod/modernfix
├── ferritecore-1.20.4.jar      # modrinth.com/mod/ferrite-core
└── noisium-1.20.4.jar          # modrinth.com/mod/noisium
```

## 🔗 Download Sources

### OptiFine (All Versions)
- **Website:** https://optifine.net/downloads
- **What it does:** Graphics optimization, FPS boost, HD textures
- **Versions:** 1.7.10 through latest
- **Note:** Don't use with Sodium (choose one or the other)

### Sodium (Modern Fabric - 1.16+)
- **Website:** https://modrinth.com/mod/sodium
- **What it does:** Massive rendering optimization
- **FPS Boost:** 2-5x performance increase
- **Requires:** Fabric mod loader

### Lithium (Modern Fabric - 1.16+)
- **Website:** https://modrinth.com/mod/lithium
- **What it does:** Server/game tick optimization
- **Compatible with:** Sodium, all other performance mods

### Starlight (Fabric - 1.16-1.19)
- **Website:** https://modrinth.com/mod/starlight
- **What it does:** Lighting engine rewrite
- **Note:** Replaced by Phosphor in newer versions

### FerriteCore (Fabric - 1.16+)
- **Website:** https://modrinth.com/mod/ferrite-core
- **What it does:** Memory usage optimization
- **RAM Saved:** 30-50% reduction

### ModernFix (Fabric - 1.18+)
- **Website:** https://modrinth.com/mod/modernfix
- **What it does:** Various fixes and optimizations
- **Best for:** Latest versions

### FoamFix (Forge - 1.8-1.12)
- **Website:** https://www.curseforge.com/minecraft/mc-mods/foamfix
- **What it does:** Memory optimization for older versions
- **Best for:** 1.12.2 modpacks

### FastCraft (Forge - 1.7.10)
- **Website:** https://www.curseforge.com/minecraft/mc-mods/fastcraft
- **What it does:** Performance improvements for very old versions

## 📋 Installation Steps

### For Each Version You Want to Set Up:

1. **Check MODS.txt** in that version's folder:
   ```bash
   cat versions/1.20.4/mods/MODS.txt
   ```

2. **Download mods** from the links provided

3. **Verify mod loader**:
   - Forge mods: Pre-1.16 versions (1.7.10, 1.8.9, 1.12.2)
   - Fabric mods: 1.16+ versions (1.16.5, 1.18.2, 1.19.4, 1.20.4)

4. **Place .jar files** in the mods folder:
   ```bash
   # Example for 1.20.4
   mv ~/Downloads/sodium-*.jar versions/1.20.4/mods/
   mv ~/Downloads/lithium-*.jar versions/1.20.4/mods/
   ```

5. **Verify installation**:
   ```bash
   ls -lh versions/1.20.4/mods/
   ```

## ⚠️ Important Notes

### Mod Compatibility

**DO NOT MIX:**
- ❌ OptiFine + Sodium (they conflict)
- ❌ Forge mods in Fabric versions
- ❌ Fabric mods in Forge versions

**SAFE TO COMBINE:**
- ✅ Sodium + Lithium + Starlight + FerriteCore (Fabric stack)
- ✅ OptiFine + FoamFix + Phosphor (Forge stack)

### Version-Specific Warnings

**Classic Era (1.0-1.6.4):**
- Very limited mod availability
- May need Java 8 instead of Java 17
- Most performance mods don't exist for these versions

**Newest (1.20.5-1.21.4):**
- Mods may not be updated yet
- Check Modrinth for compatibility before downloading
- Some mods may cause crashes

### File Naming

Mods can have any .jar filename, but for clarity:
```
# Good (readable):
sodium-mc1.20.4-0.5.5.jar
lithium-fabric-mc1.20.4-0.12.1.jar

# Also works (but less clear):
sodium-latest.jar
lithium.jar
```

## 🎯 Recommended Mod Combinations

### Low-End Chromebook (2-4GB RAM)
**Version:** 1.8.9
```
mods/
├── optifine-1.8.9.jar
└── patcher-1.8.9.jar
```
**Expected FPS:** 60-120 on low settings

### Mid-Range Device (4-8GB RAM)
**Version:** 1.20.4
```
mods/
├── sodium-1.20.4.jar
├── lithium-1.20.4.jar
└── ferritecore-1.20.4.jar
```
**Expected FPS:** 90-200 on medium settings

### High-End Device (8GB+ RAM)
**Version:** 1.20.4
```
mods/
├── sodium-1.20.4.jar
├── lithium-1.20.4.jar
├── modernfix-1.20.4.jar
├── ferritecore-1.20.4.jar
├── noisium-1.20.4.jar
└── c2me-1.20.4.jar
```
**Expected FPS:** 200-500+ on high settings

### Modded Gameplay
**Version:** 1.12.2
```
mods/
├── optifine-1.12.2.jar      # Graphics
├── foamfix-1.12.2.jar       # Memory
├── phosphor-1.12.2.jar      # Lighting
├── vanillafix-1.12.2.jar    # Stability
└── [your gameplay mods].jar
```

## 📊 Expected Performance Gains

| Mod Combination | FPS Increase | RAM Usage | Load Time |
|-----------------|--------------|-----------|-----------|
| No mods | Baseline | High | Long |
| OptiFine only | +30-80% | -10% | Same |
| Sodium only | +100-300% | Same | Faster |
| Sodium + Lithium | +150-400% | -20% | Faster |
| Full modern stack | +200-500% | -40% | Much faster |
| Full 1.12.2 stack | +50-150% | -30% | Faster |

## 🔧 Testing Your Setup

After adding mods:

1. **Test the launcher script** on Chromebook:
   ```bash
   bash ~/Downloads/nexus-mc-1.20.4.sh
   ```

2. **Check mod loading** in game logs:
   ```
   Look for: "Loaded X mods"
   Should list: Sodium, Lithium, etc.
   ```

3. **Verify performance**:
   - Press F3 in-game
   - Check FPS (top left)
   - Should be significantly higher than vanilla

4. **Test stability**:
   - Play for 10-15 minutes
   - Join a world, fly around
   - No crashes = successful setup!

## 📁 Final Structure Example

```
versions/
├── 1.8.9/
│   ├── minecraft-1.8.9.jar ✅
│   └── mods/
│       ├── MODS.txt
│       ├── optifine-1.8.9.jar ✅
│       └── patcher-1.8.9.jar ✅
├── 1.12.2/
│   ├── minecraft-1.12.2.jar ✅
│   └── mods/
│       ├── MODS.txt
│       ├── optifine-1.12.2.jar ✅
│       ├── foamfix-1.12.2.jar ✅
│       └── phosphor-1.12.2.jar ✅
└── 1.20.4/
    ├── minecraft-1.20.4.jar ✅
    └── mods/
        ├── MODS.txt
        ├── sodium-1.20.4.jar ✅
        ├── lithium-1.20.4.jar ✅
        ├── modernfix-1.20.4.jar ✅
        └── ferritecore-1.20.4.jar ✅
```

## 🎉 Quick Setup Script

```bash
#!/bin/bash
# Quick setup for priority versions

cd versions

# 1.8.9 - Download OptiFine and Patcher manually, then:
# wget https://optifine.net/... -O 1.8.9/mods/optifine.jar

# 1.20.4 - All from Modrinth (use their CLI or download manually)
# Example using modrinth CLI:
# modrinth download sodium --game-version 1.20.4 -o 1.20.4/mods/
# modrinth download lithium --game-version 1.20.4 -o 1.20.4/mods/

echo "Download mods manually from links in MODS.txt files"
```

## 📝 Maintenance

### Updating Mods

1. Check for updates monthly on Modrinth/CurseForge
2. Download new versions
3. Delete old .jar files
4. Test in-game

### Adding New Versions

1. Create new version folder: `mkdir -p versions/1.21.5/mods`
2. Add MODS.txt with recommended mods
3. Update chromebook-launcher.html dropdown
4. Download and test

---

**Ready to add mods?** Start with 1.8.9, 1.12.2, and 1.20.4 - these three cover 90% of use cases!
