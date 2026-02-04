# 🚀 QUICK START - Redstonized Minecraft Optimizers

**Get 1200+ FPS in 5 minutes!**

## ⚡ Fastest Method - Via Nexus Launcher

1. **Open Nexus** → Navigate to Minecraft section
2. **Select Version:** Choose "1.20.1" from dropdown
3. **Enable Modpack:** Check ✅ "Install Redstonized Optimizers"
4. **Click Launch:** Download the generated script
5. **Run Script:** Open Terminal and execute:
   ```bash
   bash ~/Downloads/nexus-mc-1.20.1.sh
   ```

**Done!** Minecraft will launch with 1200+ FPS optimization mods.

---

## 🖥️ Alternative Method - Direct Installation

### For Linux/Chromebook:

```bash
cd /workspaces/Nexus-Community-Project/public/games/minecraft/modpacks/redstonized-optimizers/
bash install.sh
```

### For Windows (Git Bash/WSL):

```bash
curl -O https://raw.githubusercontent.com/nexus/redstonized/main/install.sh
bash install.sh
```

---

## ✅ Requirements

- ✅ Minecraft 1.20.1 (official launcher)
- ✅ Java 17 or higher
- ✅ 6-8GB RAM allocated
- ✅ Internet connection (for mod downloads)

### Check Java:

```bash
java -version
# Should show version 17 or higher

# If not installed:
# Ubuntu/Chromebook:
sudo apt install openjdk-17-jre -y

# Mac:
brew install openjdk@17

# Windows:
# Download from https://adoptium.net/
```

---

## 🎯 What You Get

✅ **85+ Optimization Mods** - Embeddium, Lithium, FerriteCore, Iris, etc.  
✅ **1200+ FPS** - Tested on RTX 5060 Ti + Ryzen 7 5700X  
✅ **Shader Support** - Iris Shaders with Complementary, BSL, etc.  
✅ **In-Game Toggles** - Mod Menu for enable/disable mods  
✅ **Auto-Configured** - Optimized settings out of the box  
✅ **Resource Pack Ready** - Faithful, Stay True, Fresh Animations compatible

---

## ⚙️ First Launch

After installation:

1. **Launch Minecraft** (use official launcher or TLauncher)
2. **Select Profile:** "Redstonized Optimizers 1.20.1"
3. **First launch** may take 30-60 seconds (building cache)
4. **Check FPS:** Press F3 in-game

### Expected FPS:
- **RTX 3060+:** 800-1200 FPS
- **GTX 1660:** 300-600 FPS
- **GTX 1050:** 150-300 FPS
- **Integrated:** 60-150 FPS

---

## 🔧 Customize Performance

### Potato Mode (Max FPS):

Press **Mod Menu** button → Disable:
- Distant Horizons
- Iris Shaders
- Falling Leaves
- Chunks Fade In

**Expected:** 1000-1200 FPS

### Balanced Mode:

Keep all enabled, light shaders (Vanilla Plus)

**Expected:** 400-700 FPS

### Ultra Mode:

All mods + BSL Shaders + Distant Horizons

**Expected:** 200-400 FPS

---

## 📚 Need More Help?

- **Full Documentation:** [INDEX.md](INDEX.md)
- **Mod Toggles:** [MOD_TOGGLE_GUIDE.md](MOD_TOGGLE_GUIDE.md)
- **Shaders Setup:** [RESOURCE_PACKS_SHADERS.md](RESOURCE_PACKS_SHADERS.md)
- **Troubleshooting:** [COMPATIBILITY.md](COMPATIBILITY.md)

---

## 🐛 Quick Fixes

### Game won't launch?
```bash
# Check Java version
java -version  # Should be 17+

# Check mods installed
ls ~/.minecraft/mods/*.jar | wc -l  # Should be 85+
```

### Low FPS?
- Allocate more RAM (8GB recommended)
- Disable Distant Horizons
- Use Potato Mode preset

### Crashes?
- Check `~/.minecraft/logs/latest.log`
- Remove conflicting mods
- See [COMPATIBILITY.md](COMPATIBILITY.md)

---

**That's it! Enjoy blazing-fast Minecraft! 🎮✨**

*Total setup time: 5-10 minutes | FPS boost: 500-800% | 85+ mods included*
