# 🛠️ Compatibility Patches & Best Practices

This document lists all compatibility tweaks, config changes, and best practices to ensure all mods in Redstonized Optimizers work together with minimal conflicts and maximum performance.

---

## 1. Rendering & Performance Mods

- **Embeddium (Sodium fork):**
  - Do NOT use Sodium or OptiFine at the same time.
  - Indium is required for mod compatibility (keep enabled).
  - If using Iris Shaders, always use Embeddium + Indium + Iris together.
- **Indium:**
  - Required for rendering API compatibility (e.g., with Continuity, Enhanced Block Entities).
- **Iris Shaders:**
  - Disable Distant Horizons if using heavy shaders for best stability.
  - Use Complementary or BSL for best compatibility.
- **Distant Horizons:**
  - May conflict with some shaders; use lighter packs or disable when using heavy shaders.
  - Lower LOD and chunk settings if stuttering occurs.
- **Enhanced Block Entities, Continuity, CullLeaves:**
  - All compatible with Embeddium/Indium.
  - If visual glitches occur, update all to latest versions.

---

## 2. Entity & Texture Mods

- **Entity Texture Features, Entity Model Features, CIT Resewn:**
  - Required for OptiFine-style resource packs (Fresh Animations, CIT, etc.).
  - Keep enabled for best resource pack compatibility.
- **LambDynamicLights:**
  - Works with Embeddium/Indium/Iris.
  - If lighting glitches, update to latest version.

---

## 3. Chunk Loading & Memory

- **Bobby, Distant Horizons, C2ME:**
  - Bobby and Distant Horizons are compatible but may use more RAM.
  - C2ME (if present) can improve chunk loading but may cause instability; test on your system.
- **FerriteCore, ModernFix, LazyDFU:**
  - All compatible and recommended for memory optimization.

---

## 4. UI & Quality of Life

- **Mod Menu, YACL, Jade, JEI, Inventory Profiles Next, Mouse Tweaks:**
  - All compatible; minimal performance impact.
- **Better Advancements, AutoHUD, Blur, etc.:**
  - No known conflicts.

---

## 5. Compatibility/Bridge Mods

- **Indium:**
  - Always keep enabled with Embeddium.
- **CIT Resewn, Entity Texture Features, Entity Model Features:**
  - Required for resource pack compatibility (OptiFine-style packs).
- **Sinytra Connector:**
  - Use if you need to run Forge mods on Fabric (advanced users only).

---

## 6. Config Tweaks (Recommended)

- **Distant Horizons:**
  - Lower LOD and chunk settings if using shaders.
  - Set `enableFogBlending = false` for best performance.
- **Iris Shaders:**
  - Use "Shader Compatibility Mode" if you experience crashes.
- **Bobby:**
  - Lower `maxRenderDistance` if you have less than 8GB RAM.
- **EntityCulling:**
  - Increase `tracingDistance` for more aggressive culling, but test for visual bugs.
- **Embeddium:**
  - Use "Safe Mode" if you experience rendering issues with other mods.

---

## 7. General Best Practices

- **Update all mods to latest versions** for best compatibility.
- **Never use OptiFine or Sodium with Embeddium.**
- **If a mod causes crashes, disable it and check for updates.**
- **Use Mod Menu to toggle mods and test combinations.**
- **Read [COMPATIBILITY.md](COMPATIBILITY.md) for troubleshooting.**

---

## 8. Troubleshooting

- **Crash on startup:**
  - Check for duplicate or incompatible mods (Sodium, OptiFine, outdated Fabric API).
- **Visual glitches:**
  - Update all rendering mods (Embeddium, Indium, Iris, Continuity, Enhanced Block Entities).
- **Low FPS:**
  - Lower render distance, disable Distant Horizons, use Potato Mode preset.
- **Resource packs not working:**
  - Ensure CIT Resewn, Entity Texture Features, and Indium are enabled.

---

**For more details, see the main [COMPATIBILITY.md](COMPATIBILITY.md) and [MOD_TOGGLE_GUIDE.md](MOD_TOGGLE_GUIDE.md).**
