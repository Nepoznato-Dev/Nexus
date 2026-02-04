# Minecraft Versions Structure

This directory contains Minecraft .jar files and optimization mods organized by version.

## ⚠️ Version Compatibility Notice

**Stable Versions (Recommended):** 1.0 - 1.20.4
- Full mod support and optimization
- Well-tested and stable
- Recommended for most users

**Newest Versions (Experimental):** 1.20.5 - 1.21.4
- ⚠️ Use at your own risk
- Limited optimization mod support
- May have compatibility issues
- Still receiving updates

## Directory Structure

All 19 supported versions from Classic (1.0) to Latest (1.21.4):

```
versions/
├── 1.0/              # Classic - The Beginning
├── 1.2.5/            # Classic Era
├── 1.4.7/            # Redstone Update
├── 1.5.2/            # Hopper Update
├── 1.6.4/            # Horse Update
├── 1.7.10/           # Forge Modding Standard
│   ├── minecraft-1.7.10.jar
│   └── mods/
│       ├── optifine-1.7.10.jar
│       ├── fastcraft-1.7.10.jar
│       └── foamfix-1.7.10.jar
├── 1.8.9/            # ⭐ PvP Standard (Best for low-end)
│   ├── minecraft-1.8.9.jar
│   └── mods/
│       ├── optifine-1.8.9.jar
│       └── patcher-1.8.9.jar
├── 1.12.2/           # ⭐ Best Mod Support
│   ├── minecraft-1.12.2.jar
│   └── mods/
│       ├── optifine-1.12.2.jar
│       ├── foamfix-1.12.2.jar
│       └── phosphor-1.12.2.jar
├── 1.16.5/           # Nether Update
│   ├── minecraft-1.16.5.jar
│   └── mods/
│       ├── sodium-1.16.5.jar
│       ├── lithium-1.16.5.jar
│       └── phosphor-1.16.5.jar
├── 1.17.1/           # Caves & Cliffs Part 1
├── 1.18.2/           # Caves & Cliffs Part 2
│   ├── minecraft-1.18.2.jar
│   └── mods/
│       ├── sodium-1.18.2.jar
│       ├── lithium-1.18.2.jar
│       ├── starlight-1.18.2.jar
│       └── ferritecore-1.18.2.jar
├── 1.19.2/           # Wild Update
├── 1.19.4/           # Wild Update (Stable)
│   ├── minecraft-1.19.4.jar
│   └── mods/
│       ├── sodium-1.19.4.jar
│       ├── lithium-1.19.4.jar
│       ├── starlight-1.19.4.jar
│       └── c2me-1.19.4.jar
├── 1.20.1/           # Trails & Tales
├── 1.20.2/           # Updated
├── 1.20.4/           # ⭐ Latest Stable
│   ├── minecraft-1.20.4.jar
│   └── mods/
│       ├── sodium-1.20.4.jar
│       ├── lithium-1.20.4.jar
│       ├── starlight-1.20.4.jar
│       └── modernfix-1.20.4.jar
├── 1.20.5/           # ⚠️ Armored Paws (Experimental)
├── 1.20.6/           # ⚠️ Bug Fixes (Experimental)
├── 1.21/             # ⚠️ Tricky Trials (Experimental)
├── 1.21.1/           # ⚠️ Trials Improvements (Experimental)
└── 1.21.4/           # ⚠️ Latest Release (Experimental)
```

## Optimization Mods by Version

### Classic Era (1.0 - 1.6.4)
⚠️ **Very old versions** - Limited mod support, use for nostalgia only
- **OptiFine** (if available for version)
- May require Java 8 instead of Java 17

### 1.7.10 (Legacy)
- **OptiFine** - Graphics optimization
- **FastCraft** - Performance improvements
- **FoamFix** - Memory optimization

### 1.8.9 (PvP Standard)
- **OptiFine** - Graphics + FPS boost
- **Patcher** - Bug fixes and performance

### 1.12.2 (Modded Standard)
- **OptiFine** - Graphics optimization
- **FoamFix** - Memory reduction
- **Phosphor** - Lighting engine optimization

### 1.16.5 (Modern Modded)
- **OptiFine** OR **Sodium** - Choose one
- **Lithium** - Server/game loop optimization
- **Phosphor** - Lighting optimization
- **Starlight** - Lighting rewrite (alternative to Phosphor)

### 1.18.2+ (Latest Stable)
- **Sodium** - Rendering optimization (Fabric)
- **Lithium** - Server/game optimization
- **Starlight** - Lighting engine
- **FerriteCore** - Memory optimization
- **C2ME** - Chunk loading optimization
- **ModernFix** - Various fixes and optimizations

### 1.20.5 - 1.21.4 (Newest/Experimental)
⚠️ **Use at your own risk** - Limited mod support, still in active development
- **Sodium** - May have compatibility issues
- **Lithium** - Usually works but check version compatibility
- **ModernFix** - If available for version
- **Noisium** - Experimental performance mod
- Check Modrinth for latest compatible versions before use

## Where to Download

### Minecraft .jar Files
1. **Official Launcher Method:**
   - Install official Minecraft launcher
   - Launch each version once
   - Find .jar files in:
     - Windows: `%APPDATA%\.minecraft\versions\{version}\{version}.jar`
     - Linux: `~/.minecraft/versions/{version}/{version}.jar`
     - Mac: `~/Library/Application Support/minecraft/versions/{version}/{version}.jar`

2. **Alternative:** Use MultiMC or PolyMC to download versions

### Optimization Mods
- **OptiFine:** https://optifine.net/downloads
- **Sodium:** https://modrinth.com/mod/sodium
- **Lithium:** https://modrinth.com/mod/lithium
- **Phosphor:** https://modrinth.com/mod/phosphor
- **Starlight:** https://modrinth.com/mod/starlight
- **FoamFix:** https://www.curseforge.com/minecraft/mc-mods/foamfix
- **FerriteCore:** https://modrinth.com/mod/ferrite-core
- **C2ME:** https://modrinth.com/mod/c2me-fabric
- **ModernFix:** https://modrinth.com/mod/modernfix
- **FastCraft:** https://www.curseforge.com/minecraft/mc-mods/fastcraft
- **Patcher:** https://sk1er.club/mods/patcher

## Installation Instructions

1. Create version folders as shown above
2. Add the corresponding .jar file for each version
3. Download optimization mods for that version
4. Place mods in the `mods/` subfolder
5. The launcher will automatically detect and use them

## Performance Tips

- **1GB RAM:** Use 1.7.10 or 1.8.9 with OptiFine
- **2GB RAM:** Use 1.12.2 or 1.16.5 with optimization mods
- **4GB+ RAM:** Any version works well with full mod pack
- **8GB+ RAM:** Latest versions with all optimizations

## Mod Loaders Required

- **1.7.10 - 1.12.2:** Forge recommended
- **1.16.5+:** Fabric recommended (for Sodium/Lithium)
- **OptiFine:** Standalone or with Forge
