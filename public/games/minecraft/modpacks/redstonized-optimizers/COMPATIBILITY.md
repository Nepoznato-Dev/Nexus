# Redstonized Minecraft Optimizers - Compatibility Guide

## 🔄 Mod Compatibility Matrix

### ✅ Fully Compatible

| Mod | Compatible With | Notes |
|-----|----------------|-------|
| Embeddium | All optimization mods | Core rendering mod |
| Lithium | All mods | General optimization |
| FerriteCore | All mods | Memory optimization |
| ImmediatelyFast | Embeddium, Iris | Works great together |
| EntityCulling | All rendering mods | No conflicts |
| ModernFix | All mods | Broad compatibility |
| Iris Shaders | Embeddium required | Shader support |
| Distant Horizons | Iris, Embeddium | May impact FPS |
| Bobby | Distant Horizons | Great combo for exploration |

### ⚠️ Partial Compatibility

| Mod | Issue | Workaround |
|-----|-------|-----------|
| Distant Horizons + Heavy Shaders | FPS drops | Use lighter shaders (Vanilla Plus, Sildur's) |
| Embeddium + Canvas | Rendering conflicts | Disable Canvas, use Embeddium |
| ImmediatelyFast + Some Cosmetic Mods | Visual glitches | Disable immediate font rendering |
| Bobby + Low RAM | Memory issues | Reduce Bobby cache size in config |

### ❌ Incompatible

| Mod | Reason | Alternative |
|-----|--------|-------------|
| OptiFine | Conflicts with Embeddium | Use Embeddium + Iris instead |
| Sodium | Replaced by Embeddium | Embeddium is Sodium fork |
| Phosphor | Replaced by Starlight | Starlight included in modpack |
| Canvas Renderer | Incompatible with Embeddium | Use Embeddium for rendering |

## 🛠️ Compatibility Fixes

### Issue: OptiFine Dependency

**Problem:** Some mods/resource packs require OptiFine  
**Solution:** Install compatibility mods:
- **CIT Resewn** - Custom Item Textures
- **Entity Texture Features** - Random entity textures
- **Entity Model Features** - Custom entity models
- **Continuity** - Connected textures
- **LambDynamicLights** - Dynamic lighting

All included in modpack!

### Issue: Fabric vs Forge Mods

**Problem:** Want to use Forge-only mods  
**Solution:** 
1. Use **Sinytra Connector** to run Forge mods on Fabric
2. Or find Fabric alternatives:
   - Forge: JEI → Fabric: REI or JEI Fabric
   - Forge: Create → Fabric: Create Fabric
   - Forge: Biomes O' Plenty → Fabric: Terralith (datapack)

### Issue: Shader Performance

**Problem:** Shaders cause FPS drops  
**Solution:**
1. Use performance shader packs:
   - **Vanilla Plus** - Minimal impact
   - **Sildur's Enhanced Default** - Light
   - **Complementary** - Medium
2. Disable Distant Horizons when using shaders
3. Reduce render distance to 12-16 chunks
4. In Iris settings: Disable "Voxelization"

### Issue: Distant Horizons Stuttering

**Problem:** Stuttering while chunks load  
**Solution:**
1. Open Distant Horizons config (Mod Menu)
2. Reduce "LOD Quality" to "Low" or "Medium"
3. Set "Chunk Generation Distance" to 128 or lower
4. Enable "CPU Load" management
5. Allocate more RAM (8GB+)

### Issue: Memory Leaks

**Problem:** Game slows down after hours of play  
**Solution:**
1. Mods included to fix this:
   - **MemoryLeakFix** - Prevents leaks
   - **FerriteCore** - Reduces memory usage
   - **ModernFix** - Fixes launch memory issues
2. Use recommended Java arguments (in modpack.json)
3. Restart game every 4-6 hours

## 🎮 Mod Toggles & Presets

### Using Mod Menu

1. Launch Minecraft
2. Click "Mod Menu" button
3. Find mod you want to disable
4. Click mod → "Config" → Look for "Enabled" toggle
5. Some mods require restart

### Performance Presets

#### Potato Mode (Low-End PCs)
Disable these mods:
- Distant Horizons
- Iris Shaders
- Falling Leaves
- Chunks Fade In
- 3D Skin Layers
- Better Animations
- Not Enough Animations

Enable these:
- All core optimizations (Embeddium, Lithium, etc.)
- Entity Culling
- Dynamic FPS

**Settings:**
- Render Distance: 8 chunks
- Graphics: Fast
- Smooth Lighting: Off
- Particles: Minimal

#### Balanced (Mid-Range)
Keep all optimization mods enabled.
Optional mods:
- Light shaders (Vanilla Plus, Sildur's)
- Distant Horizons (Medium LOD)

**Settings:**
- Render Distance: 16 chunks
- Graphics: Fancy
- Smooth Lighting: Maximum
- Shaders: Light

#### Ultra (High-End)
All mods enabled!

**Settings:**
- Render Distance: 32 chunks
- Graphics: Fancy
- Smooth Lighting: Maximum
- Shaders: Ultra (Complementary, BSL)
- Distant Horizons: High LOD

## 🔧 Mod-Specific Config Fixes

### Embeddium Settings

Navigate to: Video Settings → Embeddium Options

**For Best Performance:**
- Quality → Fog Quality: Fast
- Quality → Leaves Quality: Fast
- Performance → Chunk Builder Threads: CPU cores - 2
- Performance → Use Advanced OpenGL: On
- Performance → Use Fog Occlusion: On

**For Best Visuals:**
- Quality → Everything on Fancy/High
- Advanced → Terrain Face Culling: Off

### EntityCulling Settings

Config file: `config/entityculling.json`

```json
{
  "skipRenderingDistance": 64,
  "blockEntityWhitelist": [],
  "entityWhitelist": [],
  "tracingDistance": 128,
  "checkClientSide": true
}
```

Increase `tracingDistance` for more aggressive culling.

### Bobby Settings

Config file: `config/bobby.conf`

```
maxRenderDistance = 32
deleteUnusedRegionsAfterDays = 7
viewDistanceOverwrite = -1
tintation = true
```

Reduce `maxRenderDistance` if low on RAM.

### Iris Shaders Settings

In-game: Options → Video Settings → Shader Packs

**Performance Tips:**
- Disable "Voxelization" for +20-30 FPS
- Lower "Shadow Distance" to 8 chunks
- Disable "Old Lighting" (use new lighting)

### Distant Horizons Settings

Config file: `config/DistantHorizons.toml`

```toml
[Client]
[Client.Advanced.Graphics.Quality]
lodChunkRenderDistance = 128
lodBias = 1.0
drawRadius = 128

[Client.Advanced.Graphics.Performance]
enableFogBlending = false
```

**Low-End Fix:**
- Set `lodChunkRenderDistance = 64`
- Set `lodBias = 0.5`

## 🐛 Common Issues & Fixes

### Crash on Startup

**Cause:** Mod conflict  
**Fix:**
1. Check crash log (`.minecraft/crash-reports/`)
2. Look for "Caused by" line
3. Remove conflicting mod
4. Common culprits: Canvas, Optifabric, outdated Fabric API

### White/Black Screen

**Cause:** Graphics driver issue  
**Fix:**
1. Update GPU drivers
2. Disable Iris Shaders temporarily
3. In Embeddium settings, disable "Advanced OpenGL"

### Low FPS Despite Mods

**Cause:** Wrong Java version or settings  
**Fix:**
1. Use Java 17 or higher
2. Apply recommended JVM arguments (see modpack.json)
3. Allocate 6-8GB RAM
4. Close background applications

### Mods Not Loading

**Cause:** Wrong Fabric version  
**Fix:**
1. Check you have Fabric Loader 0.15.11+
2. Ensure all mods are for Minecraft 1.20.1
3. Install Fabric API (included in modpack)

### Config Changes Not Saving

**Cause:** File permissions  
**Fix:**
1. Close Minecraft completely
2. Edit configs while game is closed
3. On Linux/Mac: `chmod +w config/*`

## 🔄 Multi-Version Compatibility

### Porting to 1.19.4

Most mods work, but replace:
- Embeddium → Use Sodium 0.5.x for 1.19.4
- Some mods may need 1.19.4-specific versions

### Porting to 1.18.2

- FerriteCore: Use 5.0.x
- Lithium: Use 0.10.x
- Many visual mods unavailable

### Porting to 1.16.5

- Sodium instead of Embeddium
- Starlight may not be available (use Phosphor)
- Fewer visual enhancement mods

## 📞 Getting Help

**Check logs:**
```bash
# Latest log
.minecraft/logs/latest.log

# Crash reports
.minecraft/crash-reports/
```

**Common log locations:**
- Mod conflicts: "mixin.*.json"
- Missing dependencies: "requires"
- Version mismatch: "expected"

**Report issues:**
1. Include full log file
2. List all mods and versions
3. System specs (CPU, GPU, RAM)
4. Steps to reproduce

---

**Need more help?** Visit Nexus Community Discord or GitHub Issues!
