# Minecraft Mods Reference - Complete Catalog

**Comprehensive mod listing for IRIS download system**

---

## 🎯 Purpose

This document catalogs all available Minecraft mods for IRIS to download on-demand. Instead of storing 1.6GB+ of mod files in the repository, IRIS reads this file and downloads mods directly from Modrinth/CurseForge when needed.

**Storage Saved**: ~1.6GB (MinecraftMods + VisualMods folders can be deleted after cataloging)

---

## 📦 Performance Mods (Sodium-Compatible)

### Core Performance
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **Sodium** | `sodium` | Performance | Modern rendering engine, +200-400% FPS |
| **Lithium** | `lithium` | Performance | Server-side optimization, reduces lag |
| **Starlight** | `starlight` | Performance | Lighting engine rewrite |
| **FerriteCore** | `ferrite-core` | Performance | Memory usage reduction |
| **ModernFix** | `modernfix` | Performance | Fixes performance bugs |
| **EntityCulling** | `entityculling` | Performance | Don't render unseen entities |
| **ImmediatelyFast** | `immediatelyfast` | Performance | Batches rendering calls |

### Memory Optimization
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **FerriteCore** | `ferrite-core` | Memory | Reduces memory usage by 50% |
| **LazyDFU** | `lazydfu` | Memory | Faster game startup |
| **Krypton** | `krypton` | Memory | Network stack optimization |

---

## 🎨 Visual Mods (QoL + Enhancements)

### Shaders & Rendering
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **Iris Shaders** | `iris` | Visual | Shader support for Sodium |
| **Entity Model Features** | `entity-model-features` | Visual | Custom entity models (Optifine parity) |
| **Entity Texture Features** | `entity-texture-features` | Visual | Custom textures (Optifine parity) |

### UI & HUD
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **AppleSkin** | `appleskin` | UI | Food/hunger info overlay |
| **Jade** | `jade` | UI | Advanced WAILA (What Am I Looking At) |
| **AutoHUD** | `autohud` | UI | Auto-hide HUD when not needed |
| **Convenient Name Tags** | `convenientnametags` | UI | Better name tag rendering |

### Animations
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **Not Enough Animations** | `not-enough-animations` | Animation | More player animations |
| **Player Animation Lib** | `player-animation-lib` | Animation | Animation library |
| **Mob/Player Animator** | `mobplayeranimator` | Animation | Custom mob animations |

---

## 🛠️ Quality of Life Mods

### Inventory & Items
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **Inventory Sorter** | `inventory-sorter` | QoL | Auto-sort inventories |
| **Inventory Particles** | `inventory-particles` | QoL | Visual item pickup feedback |
| **Inventory Full Notifier** | `inventory-full-notifier` | QoL | Alerts when inventory full |
| **Packed Inventory** | `packed-inventory` | QoL | Better inventory compression |
| **Sophisticated Backpacks** | `sophisticatedbackpacks` | QoL | Advanced backpack system |

### Comfort & Utilities
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **Comforts** | `comforts` | QoL | Sleeping bags & hammocks |
| **Crash Assistant** | `crash-assistant` | Utility | Better crash reports |

---

## 📚 Library/Dependency Mods

### Required Dependencies
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| **Fabric API** | `fabric-api` | Library | Core Fabric mod loader API |
| **Cloth Config** | `cloth-config` | Library | Config screen library |
| **Architectury API** | `architectury-api` | Library | Multi-loader support |
| **Forge Config API Port** | `forge-config-api-port` | Library | Forge config compatibility |
| **MossyLib** | `mossylib` | Library | Dependency for various mods |
| **Sophisticated Core** | `sophisticatedcore` | Library | Core for Sophisticated mods |

---

## 🎮 Gameplay Mods

### World Generation
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| *(To be cataloged)* | | WorldGen | Biome/structure mods |

### Client-Only Features
| Mod | Modrinth ID | Category | Description |
|-----|-------------|----------|-------------|
| *(To be cataloged)* | | Client | Minimap, cosmetics, etc. |

---

## 📁 Cataloged from Physical Files

### From: `MinecraftMods sodium, optifine/`
**Structure**:
- `preformace/sodiummods/` - Performance-focused mods
- `preformace/optifinemods/` - Optifine alternatives
- `visuals/sodiumvisualsmods/` - Visual enhancement mods
- `qol/sodiummods/` - Quality of life mods
- `ui/` - UI enhancement mods
- `client/` - Client-side only mods
- `gameplay/` - Gameplay changes
- `library/` - Dependencies
- `worldgen/` - World generation

### From: `VisualMods (organize Into MinecraftMods sodium, optifine)/mods/`
**Actual JAR files found** (example set):
```
CrashAssistant-fabric-1.19-1.21.4-1.10.28.jar
Jade-1.20-Fabric-11.13.1.jar
appleskin-fabric-mc1.20.1-2.5.2.jar
autohud-8.11+1.20.1-fabric.jar
cloth-config-11.1.136-fabric.jar
entity_model_features_1.20.1-fabric-3.0.11.jar
entity_texture_features_1.20.1-fabric-7.0.8.jar
fabric-api-0.92.7+1.20.1.jar
iris-1.7.6+mc1.20.1.jar
sodium-fabric-0.5.13+mc1.20.1.jar
sophisticatedbackpacks-1.20.1-3.23.4.5.110.jar
...and more
```

---

## 🔧 IRIS Integration

### How IRIS Uses This Document

1. **Parse Mod IDs**: IRIS reads this file to get Modrinth/CurseForge IDs
2. **On-Demand Download**: When user selects mods, IRIS downloads them via API
3. **Browser Cache**: Downloaded mods stored in browser IndexedDB (no repo bloat)
4. **Version Resolution**: IRIS automatically finds compatible versions
5. **Dependency Resolution**: Auto-downloads required dependencies

### API Endpoints Used
- **Modrinth**: `https://api.modrinth.com/v2/project/{mod-id}/version`
- **CurseForge**: `https://api.curseforge.com/v1/mods/{mod-id}/files`

### Storage Strategy
```javascript
// Instead of 1.6GB in repo:
IndexedDB: nexus_mod_cache
  - Key: "mod-id@minecraft-version"
  - Value: { downloadUrl, fileName, fileSize, hash }
  - Size: ~5-10MB (just metadata + cache references)

// Actual mod files downloaded to browser's cache
// User can clear cache without losing mod list
```

---

## 🗑️ Space Savings

**Before**: 
- `MinecraftMods sodium, optifine/` = 1.3GB
- `VisualMods (organize Into MinecraftMods sodium, optifine)/` = 327MB
- **Total**: ~1.6GB in repository

**After**:
- `docs/MODS_CATALOG.md` = ~15KB
- IRIS downloads on-demand
- Browser cache handles storage
- **Repository size**: ~1.6GB freed 🎉

---

## 📝 Maintenance

To add new mods to this catalog:
1. Get Modrinth/CurseForge project ID
2. Add row to appropriate table above
3. IRIS will auto-detect and offer for download
4. No need to store physical mod files

---

## 🔗 References

**IRIS Integration**: `src/Components/I.R.I.S (Formally known as AAS)/`
- `irisModResolver.js` - Dependency resolution
- `modAPIHandler.js` - Modrinth/CurseForge API calls
- `irisCacheManager.js` - Browser cache management (to be created)

**Component**: `src/Components/Games/ModManager.js`  
**Mod Profiles**: `src/Components/Games/modProfiles.js`

---

**Last Updated**: 2026-02-04  
**Mods Cataloged**: 30+ performance/visual/QoL mods  
**Storage Freed**: ~1.6GB
