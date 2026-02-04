# 🎨 Resource Packs & Shaders Guide

Enhance your Minecraft experience with these carefully selected resource packs and shaders, optimized for use with Redstonized Minecraft Optimizers.

## 📦 Recommended Resource Packs

### 1. Faithful 32x (High-Resolution Vanilla)

**Description:** Doubles the resolution of default Minecraft textures while maintaining the vanilla aesthetic.

**Download:** [faithfulpack.net](https://faithfulpack.net/)

**Installation:**
```bash
# Download the pack
curl -L -o ~/.minecraft/resourcepacks/Faithful-32x.zip https://faithfulpack.net/download/latest

# Or manual:
# 1. Download from website
# 2. Place in ~/.minecraft/resourcepacks/
# 3. Enable in Options → Resource Packs
```

**Performance Impact:** Minimal (~5-10 FPS drop on low-end systems)

**Best For:** Players who want sharper textures without changing the vanilla look

---

### 2. Stay True (Enhanced Vanilla)

**Description:** Subtle improvements to vanilla textures with better details and consistency.

**Download:** [Modrinth - Stay True](https://modrinth.com/resourcepack/stay-true)

**Installation:**
```bash
cd ~/.minecraft/resourcepacks
curl -L -o StayTrue.zip "https://cdn.modrinth.com/data/bZAZlxWQ/versions/latest/StayTrue.zip"
```

**Performance Impact:** None

**Best For:** Enhanced vanilla aesthetics without major changes

---

### 3. Fresh Animations

**Description:** Adds smooth, realistic animations to mobs and players.

**Download:** [CurseForge - Fresh Animations](https://www.curseforge.com/minecraft/texture-packs/fresh-animations)

**Installation:**
```bash
# Requires Entity Model Features mod (included in Redstonized)
# Download pack and place in resourcepacks folder
```

**Performance Impact:** Minimal (requires Entity Model Features mod)

**Best For:** Better mob animations and immersion

---

### 4. Vanilla Tweaks

**Description:** Customizable pack with hundreds of small improvements.

**Download:** [vanillatweaks.net](https://vanillatweaks.net/)

**Installation:**
1. Visit website
2. Select desired tweaks (recommended: Better Particles, Cleaner UI, Nicer Leaves)
3. Download custom pack
4. Place in `~/.minecraft/resourcepacks/`

**Performance Impact:** None to minimal

**Best For:** Customizing specific aspects of Minecraft

---

### 5. Complementary Unbound (Resource Pack)

**Description:** Designed to work perfectly with Complementary Shaders.

**Download:** Comes with Complementary Shaders

**Performance Impact:** None

**Best For:** Use alongside Complementary Shaders for maximum compatibility

---

## 🌈 Recommended Shader Packs

### 1. Complementary Unbound (Best Overall)

**Description:** Beautiful, balanced shader pack with excellent performance optimization.

**Download:** [Modrinth - Complementary Unbound](https://modrinth.com/shader/complementary-unbound)

**Installation:**
```bash
cd ~/.minecraft/shaderpacks
curl -L -o ComplementaryUnbound.zip "https://cdn.modrinth.com/data/HVnmMxH1/versions/latest/ComplementaryUnbound.zip"
```

**Performance:**
- High-end GPUs (RTX 3060+): 200-400 FPS
- Mid-range GPUs (GTX 1660): 80-150 FPS
- Low-end GPUs (GTX 1050): 40-80 FPS

**Features:**
- Realistic lighting
- Beautiful water
- Waving grass/leaves
- Custom sky
- Screen space reflections

**Best For:** Players wanting beautiful graphics without killing performance

---

### 2. BSL Shaders (Most Beautiful)

**Description:** Stunning visuals with vibrant colors and realistic lighting.

**Download:** [Modrinth - BSL Shaders](https://modrinth.com/shader/bsl-shaders)

**Installation:**
```bash
cd ~/.minecraft/shaderpacks
curl -L -o BSL_Shaders.zip "https://cdn.modrinth.com/data/Q5tRYavL/versions/latest/BSL_Shaders.zip"
```

**Performance:**
- High-end: 150-300 FPS
- Mid-range: 60-100 FPS
- Low-end: 30-60 FPS

**Features:**
- Volumetric lighting
- Advanced water physics
- Beautiful sunrises/sunsets
- Realistic shadows

**Best For:** Screenshot enthusiasts and content creators

---

### 3. Sildur's Vibrant Shaders (Balanced)

**Description:** Multiple versions (Lite, Medium, High, Extreme) for different performance levels.

**Download:** [sildurs-shaders.github.io](https://sildurs-shaders.github.io/)

**Versions:**
- **Vibrant Lite:** ~10% FPS impact
- **Vibrant Medium:** ~30% FPS impact
- **Vibrant High:** ~50% FPS impact
- **Vibrant Extreme:** ~70% FPS impact

**Installation:**
```bash
cd ~/.minecraft/shaderpacks
# Choose your version:
# Lite (recommended for mid-range)
curl -L -o Sildurs_Vibrant_Lite.zip "<download-link>"
```

**Best For:** Players who want to choose their performance/quality balance

---

### 4. Vanilla Plus Shaders (Minimal Impact)

**Description:** Subtle improvements to vanilla lighting with minimal performance cost.

**Download:** [Modrinth - Vanilla Plus](https://modrinth.com/shader/vanilla-plus-shader)

**Installation:**
```bash
cd ~/.minecraft/shaderpacks
curl -L -o VanillaPlus.zip "https://cdn.modrinth.com/data/MpPJRAvq/versions/latest/VanillaPlus.zip"
```

**Performance:**
- High-end: <5% FPS impact
- Mid-range: <10% FPS impact
- Low-end: <15% FPS impact

**Features:**
- Enhanced vanilla lighting
- Better shadows
- Smoother water
- No heavy effects

**Best For:** Potato mode users who still want slight visual improvements

---

### 5. Photon Shaders (Path Tracing)

**Description:** Realistic path-traced lighting (EXTREMELY demanding).

**Download:** [Modrinth - Photon](https://modrinth.com/shader/photon-shader)

**Performance:**
- RTX 4090: 60-120 FPS
- RTX 3080: 30-60 FPS
- RTX 3060: 15-30 FPS
- Not recommended for non-RTX GPUs

**Requirements:**
- RTX 2000+ series or equivalent
- 8GB+ VRAM
- Iris Shaders (included in Redstonized)

**Best For:** Ultra-realistic screenshots, RTX GPU owners

---

## ⚙️ Installation Methods

### Method 1: Automatic (Recommended)

Use the install script with modpack:

```bash
bash /games/minecraft/modpacks/redstonized-optimizers/install.sh
# Choose "yes" when prompted for shaders and resource packs
```

### Method 2: Manual

```bash
# Create directories if they don't exist
mkdir -p ~/.minecraft/resourcepacks
mkdir -p ~/.minecraft/shaderpacks

# Download packs (replace URLs with actual download links)
cd ~/.minecraft/resourcepacks
curl -L -o Faithful-32x.zip "<download-link>"
curl -L -o StayTrue.zip "<download-link>"

cd ~/.minecraft/shaderpacks
curl -L -o ComplementaryUnbound.zip "<download-link>"
curl -L -o BSL_Shaders.zip "<download-link>"
```

### Method 3: In-Game Download (Mod Menu + Resource Pack Manager)

Some mods allow in-game resource pack/shader downloads:
- Install **CurseForge Mod** (if available for Fabric)
- Or use **Mod Menu** to access download links

---

## 🎯 Recommended Combinations

### Ultra Performance (1000+ FPS)
- **Resource Pack:** None or Vanilla Tweaks (minimal)
- **Shaders:** None or Vanilla Plus
- **Settings:** All optimizations enabled

### Balanced (400-700 FPS)
- **Resource Pack:** Faithful 32x or Stay True
- **Shaders:** Complementary Unbound or Sildur's Vibrant Medium
- **Settings:** Disable Distant Horizons

### Maximum Beauty (100-300 FPS)
- **Resource Pack:** Fresh Animations + Stay True
- **Shaders:** BSL Shaders or Complementary Unbound
- **Settings:** All mods enabled, high render distance

### Screenshot Mode (30-60 FPS)
- **Resource Pack:** Faithful 32x + Fresh Animations
- **Shaders:** Photon (RTX only) or BSL Extreme
- **Settings:** Maximum everything, pause during screenshots

---

## 🔧 Configuration Tips

### Shader Settings (Iris)

Access shader settings in-game:
1. Options → Video Settings → Shader Packs
2. Select your shader
3. Click "Shader Pack Settings"

**Performance Tweaks:**
- Lower "Shadow Distance" (default: 12 → 8 chunks)
- Disable "Volumetric Lighting" for +20-30 FPS
- Reduce "Shadow Quality" (2048 → 1024)
- Disable "Screen Space Reflections" if laggy

### Resource Pack Settings

**Optimal Order** (top to bottom in game):
1. Fresh Animations (animations)
2. Faithful/Stay True (textures)
3. Vanilla Tweaks (tweaks)
4. Default (vanilla fallback)

**Mipmap Levels:**
- Set to 4 for best quality
- Set to 0 for +5-10 FPS on low-end systems

---

## 📥 Quick Install Scripts

### Install All Recommended Packs

`install-packs.sh`:

```bash
#!/bin/bash

MC_DIR="$HOME/.minecraft"
RP_DIR="$MC_DIR/resourcepacks"
SP_DIR="$MC_DIR/shaderpacks"

mkdir -p "$RP_DIR" "$SP_DIR"

echo "📦 Installing Recommended Packs..."

# Resource Packs
echo "  → Faithful 32x"
curl -L -o "$RP_DIR/Faithful-32x.zip" "https://faithfulpack.net/download/latest" 2>/dev/null

echo "  → Stay True"
curl -L -o "$RP_DIR/StayTrue.zip" "https://cdn.modrinth.com/data/bZAZlxWQ/versions/latest/StayTrue.zip" 2>/dev/null

# Shader Packs
echo "  → Complementary Unbound"
curl -L -o "$SP_DIR/ComplementaryUnbound.zip" "https://cdn.modrinth.com/data/HVnmMxH1/versions/latest/ComplementaryUnbound.zip" 2>/dev/null

echo "  → BSL Shaders"
curl -L -o "$SP_DIR/BSL_Shaders.zip" "https://cdn.modrinth.com/data/Q5tRYavL/versions/latest/BSL_Shaders.zip" 2>/dev/null

echo "  → Vanilla Plus"
curl -L -o "$SP_DIR/VanillaPlus.zip" "https://cdn.modrinth.com/data/MpPJRAvq/versions/latest/VanillaPlus.zip" 2>/dev/null

echo ""
echo "✓ Installation complete!"
echo "  Resource packs: $RP_DIR"
echo "  Shader packs: $SP_DIR"
echo ""
echo "Enable in-game:"
echo "  1. Options → Resource Packs"
echo "  2. Video Settings → Shader Packs"
```

Make executable and run:
```bash
chmod +x install-packs.sh
./install-packs.sh
```

---

## 🐛 Troubleshooting

### Shaders not working
- **Cause:** Iris Shaders mod not installed
- **Fix:** Ensure Iris is in `~/.minecraft/mods/` (included in Redstonized)

### Low FPS with shaders
- **Cause:** Too demanding for your GPU
- **Fix:** Use lighter shader (Vanilla Plus or Sildur's Lite)

### Resource pack textures not showing
- **Cause:** Wrong Minecraft version or pack order
- **Fix:** Ensure pack is for 1.20.1, check pack order

### Missing textures (pink/black blocks)
- **Cause:** Corrupted download or incompatible pack
- **Fix:** Re-download pack, ensure it's for correct version

---

## 📊 Performance Comparison Table

| Configuration | Resource Pack | Shader | FPS (RTX 5060 Ti) | FPS (GTX 1660) |
|---------------|--------------|--------|-------------------|----------------|
| Vanilla | None | None | 1200+ | 400-600 |
| Light Enhancement | Vanilla Tweaks | Vanilla Plus | 900-1100 | 300-450 |
| Balanced | Faithful 32x | Complementary | 600-800 | 150-250 |
| Beautiful | Stay True + Fresh | BSL Shaders | 300-500 | 80-120 |
| Ultra | Faithful + Fresh | BSL Extreme | 150-300 | 40-70 |
| Screenshot | Faithful + Fresh | Photon (RTX) | 60-120 | Not recommended |

---

## 🔗 Download Links Summary

**Resource Packs:**
- Faithful: https://faithfulpack.net/
- Stay True: https://modrinth.com/resourcepack/stay-true
- Fresh Animations: https://www.curseforge.com/minecraft/texture-packs/fresh-animations
- Vanilla Tweaks: https://vanillatweaks.net/

**Shaders:**
- Complementary: https://modrinth.com/shader/complementary-unbound
- BSL: https://modrinth.com/shader/bsl-shaders
- Sildur's: https://sildurs-shaders.github.io/
- Vanilla Plus: https://modrinth.com/shader/vanilla-plus-shader
- Photon: https://modrinth.com/shader/photon-shader

---

**Enjoy your enhanced Minecraft experience! 🎨✨**
