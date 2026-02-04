# Mod Toggle System - Implementation Guide

## 🎮 In-Game Mod Management via Mod Menu

The Redstonized Minecraft Optimizers includes **Mod Menu**, which provides a built-in interface for enabling/disabling mods without editing files.

## 📋 How to Use Mod Toggles (No Custom Mod Required!)

### Method 1: Using Mod Menu (Built-in)

1. Launch Minecraft with Redstonized Optimizers
2. From the main menu, click **"Mods"** button
3. Browse the list of installed mods
4. Click on any mod to view its details
5. Some mods have a **Config** button - click it to access settings
6. Look for "Enabled" or "Disable" toggles
7. Apply changes and restart Minecraft

### Method 2: Manual Config Editing

For mods without GUI toggles:

```bash
cd ~/.minecraft/config
nano <mod-name>.json  # or .toml, .conf
```

Look for `"enabled": true` and change to `false`

### Method 3: Move Mod Files (Quick Toggle)

Create a disabled mods folder:

```bash
mkdir ~/.minecraft/mods-disabled

# To disable a mod:
mv ~/.minecraft/mods/some-mod.jar ~/.minecraft/mods-disabled/

# To re-enable:
mv ~/.minecraft/mods-disabled/some-mod.jar ~/.minecraft/mods/
```

## 🔧 Mod-Specific Toggle Locations

### Embeddium (Sodium)
- **Location:** Video Settings → Embeddium Options
- **Toggles:** Quality settings, performance options, advanced rendering
- **No restart needed** for most settings

### Iris Shaders
- **Location:** Video Settings → Shader Packs
- **Toggle:** Select "Off" to disable shaders
- **No restart needed**

### Distant Horizons
- **Location:** Mod Menu → Distant Horizons → Config
- **Key Toggles:**
  - Enable/Disable: `enabled = true/false`
  - LOD Rendering: Can be toggled in-game
- **Restart:** Required for full disable

### EntityCulling
- **Config:** `config/entityculling.json`
```json
{
  "enabled": true,  // Change to false to disable
  "skipRenderingDistance": 64
}
```
- **Restart:** Required

### Dynamic FPS
- **Location:** Mod Menu → Dynamic FPS → Config
- **Toggles:**
  - Reduce FPS when window inactive
  - Custom FPS limits
- **No restart needed**

### Falling Leaves
- **Config:** `config/fallingleaves.json`
```json
{
  "enabled": true,  // Visual effect toggle
  "leafLifespan": 20
}
```

### 3D Skin Layers
- **Location:** Options → Skin Customization → 3D Skin Layers
- **No restart needed**

## 🚀 Creating Custom Mod Preset Profiles

Since Mod Menu doesn't have built-in "profiles", we can create scripts to switch between preset configurations:

### Preset Script System

Create `~/.minecraft/modpack-presets/` directory:

```bash
mkdir -p ~/.minecraft/modpack-presets
```

### Potato Mode Script

`~/.minecraft/modpack-presets/potato-mode.sh`:

```bash
#!/bin/bash
# Potato Mode - Maximum FPS, minimal visuals

MODS_DIR="$HOME/.minecraft/mods"
DISABLED_DIR="$HOME/.minecraft/mods-disabled"

mkdir -p "$DISABLED_DIR"

# Disable heavy mods
mv "$MODS_DIR"/DistantHorizons-*.jar "$DISABLED_DIR/" 2>/dev/null
mv "$MODS_DIR"/iris-*.jar "$DISABLED_DIR/" 2>/dev/null
mv "$MODS_DIR"/fallingleaves-*.jar "$DISABLED_DIR/" 2>/dev/null
mv "$MODS_DIR"/skinlayers3d-*.jar "$DISABLED_DIR/" 2>/dev/null
mv "$MODS_DIR"/chunksfadein-*.jar "$DISABLED_DIR/" 2>/dev/null

echo "✓ Potato Mode enabled"
echo "  - Disabled: Distant Horizons, Iris, visual effects"
echo "  - Expected FPS boost: +40-60%"
```

### Balanced Mode Script

`~/.minecraft/modpack-presets/balanced-mode.sh`:

```bash
#!/bin/bash
# Balanced Mode - Good balance of performance and visuals

MODS_DIR="$HOME/.minecraft/mods"
DISABLED_DIR="$HOME/.minecraft/mods-disabled"

# Re-enable most mods
mv "$DISABLED_DIR"/iris-*.jar "$MODS_DIR/" 2>/dev/null
mv "$DISABLED_DIR"/fallingleaves-*.jar "$MODS_DIR/" 2>/dev/null

# Keep Distant Horizons disabled (performance killer)
# Distant Horizons stays disabled

echo "✓ Balanced Mode enabled"
echo "  - Enabled: Shaders, visual effects"
echo "  - Disabled: Distant Horizons"
echo "  - Expected FPS: 400-700"
```

### Ultra Mode Script

`~/.minecraft/modpack-presets/ultra-mode.sh`:

```bash
#!/bin/bash
# Ultra Mode - All features enabled

MODS_DIR="$HOME/.minecraft/mods"
DISABLED_DIR="$HOME/.minecraft/mods-disabled"

# Re-enable everything
mv "$DISABLED_DIR"/*.jar "$MODS_DIR/" 2>/dev/null

echo "✓ Ultra Mode enabled"
echo "  - All mods active"
echo "  - Expected FPS: 200-600 (depending on hardware)"
echo "  - Recommended: RTX 3060+ or equivalent"
```

### Make scripts executable:

```bash
chmod +x ~/.minecraft/modpack-presets/*.sh
```

### Usage:

```bash
# Switch to potato mode
bash ~/.minecraft/modpack-presets/potato-mode.sh
# Then launch Minecraft

# Switch to balanced
bash ~/.minecraft/modpack-presets/balanced-mode.sh

# Switch to ultra
bash ~/.minecraft/modpack-presets/ultra-mode.sh
```

## 💡 Advanced: Creating a GUI Toggle Manager

For a more user-friendly experience, you could create a custom mod that adds a "Modpack Settings" screen.

### Fabric Mod Structure:

```
RedstonizedToggles/
├── src/main/java/
│   └── com/redstonized/toggles/
│       ├── RedstonizedToggles.java       # Main mod class
│       ├── config/
│       │   └── ModpackConfig.java        # Config handling
│       └── gui/
│           └── ModToggleScreen.java      # Custom GUI
├── src/main/resources/
│   ├── fabric.mod.json                   # Mod metadata
│   └── redstonized-toggles.mixins.json  # Mixins config
└── build.gradle                          # Build configuration
```

### Example: RedstonizedToggles.java

```java
package com.redstonized.toggles;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.fabricmc.fabric.api.client.keybinding.v1.KeyBindingHelper;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.option.KeyBinding;
import net.minecraft.client.util.InputUtil;
import org.lwjgl.glfw.GLFW;

public class RedstonizedToggles implements ModInitializer {
    
    private static KeyBinding toggleMenuKey;
    
    @Override
    public void onInitialize() {
        // Register keybinding (default: F6)
        toggleMenuKey = KeyBindingHelper.registerKeyBinding(new KeyBinding(
            "key.redstonized.togglemenu",
            InputUtil.Type.KEYSYM,
            GLFW.GLFW_KEY_F6,
            "category.redstonized"
        ));
        
        // Register tick event to detect key press
        ClientTickEvents.END_CLIENT_TICK.register(client -> {
            if (toggleMenuKey.wasPressed()) {
                openToggleMenu(client);
            }
        });
    }
    
    private void openToggleMenu(MinecraftClient client) {
        client.setScreen(new ModToggleScreen());
    }
}
```

### Example: ModToggleScreen.java

```java
package com.redstonized.toggles.gui;

import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.ButtonWidget;
import net.minecraft.text.Text;

public class ModToggleScreen extends Screen {
    
    public ModToggleScreen() {
        super(Text.literal("Redstonized Mod Toggles"));
    }
    
    @Override
    protected void init() {
        super.init();
        
        int centerX = this.width / 2;
        int startY = 40;
        int buttonWidth = 200;
        int buttonHeight = 20;
        int spacing = 25;
        
        // Potato Mode button
        this.addDrawableChild(ButtonWidget.builder(
            Text.literal("Potato Mode (Max FPS)"),
            button -> applyPotatoMode()
        ).dimensions(centerX - 100, startY, buttonWidth, buttonHeight).build());
        
        // Balanced Mode button
        this.addDrawableChild(ButtonWidget.builder(
            Text.literal("Balanced Mode"),
            button -> applyBalancedMode()
        ).dimensions(centerX - 100, startY + spacing, buttonWidth, buttonHeight).build());
        
        // Ultra Mode button
        this.addDrawableChild(ButtonWidget.builder(
            Text.literal("Ultra Mode (All Features)"),
            button -> applyUltraMode()
        ).dimensions(centerX - 100, startY + spacing * 2, buttonWidth, buttonHeight).build());
        
        // Individual toggles
        addDrawableChild(ButtonWidget.builder(
            Text.literal("Toggle Distant Horizons"),
            button -> toggleMod("distanthorizons")
        ).dimensions(centerX - 100, startY + spacing * 4, buttonWidth, buttonHeight).build());
        
        addDrawableChild(ButtonWidget.builder(
            Text.literal("Toggle Shaders"),
            button -> toggleMod("iris")
        ).dimensions(centerX - 100, startY + spacing * 5, buttonWidth, buttonHeight).build());
        
        addDrawableChild(ButtonWidget.builder(
            Text.literal("Toggle Visual Effects"),
            button -> toggleMod("visuals")
        ).dimensions(centerX - 100, startY + spacing * 6, buttonWidth, buttonHeight).build());
        
        // Done button
        this.addDrawableChild(ButtonWidget.builder(
            Text.literal("Done"),
            button -> this.close()
        ).dimensions(centerX - 100, this.height - 30, buttonWidth, buttonHeight).build());
    }
    
    private void applyPotatoMode() {
        // Disable heavy mods
        ModpackConfig.setModEnabled("distanthorizons", false);
        ModpackConfig.setModEnabled("iris", false);
        ModpackConfig.setModEnabled("fallings", false);
        ModpackConfig.save();
        
        // Show message
        client.player.sendMessage(Text.literal("§aPotat Mode enabled! Restart for changes."), false);
    }
    
    private void applyBalancedMode() {
        ModpackConfig.setModEnabled("iris", true);
        ModpackConfig.setModEnabled("distanthorizons", false);
        ModpackConfig.save();
        
        client.player.sendMessage(Text.literal("§aBalanced Mode enabled! Restart for changes."), false);
    }
    
    private void applyUltraMode() {
        // Enable all mods
        ModpackConfig.setModEnabled("distanthorizons", true);
        ModpackConfig.setModEnabled("iris", true);
        ModpackConfig.setModEnabled("visuals", true);
        ModpackConfig.save();
        
        client.player.sendMessage(Text.literal("§aUltra Mode enabled! Restart for changes."), false);
    }
    
    private void toggleMod(String modId) {
        boolean currentState = ModpackConfig.isModEnabled(modId);
        ModpackConfig.setModEnabled(modId, !currentState);
        ModpackConfig.save();
        
        String status = !currentState ? "§aenabled" : "§cdisabled";
        client.player.sendMessage(Text.literal("§7Mod " + status + "§7! Restart for changes."), false);
    }
}
```

### fabric.mod.json

```json
{
  "schemaVersion": 1,
  "id": "redstonized-toggles",
  "version": "1.0.0",
  "name": "Redstonized Mod Toggles",
  "description": "In-game mod toggle system for Redstonized Optimizers",
  "authors": ["Redstonized"],
  "contact": {
    "homepage": "https://nexus.community",
    "sources": "https://github.com/nexus/redstonized-toggles"
  },
  "license": "MIT",
  "icon": "icon.png",
  "environment": "client",
  "entrypoints": {
    "main": [
      "com.redstonized.toggles.RedstonizedToggles"
    ]
  },
  "depends": {
    "fabricloader": ">=0.15.0",
    "minecraft": "1.20.1",
    "java": ">=17",
    "fabric-api": "*"
  }
}
```

## 🎯 Quick Reference: Toggling Specific Mods

| Mod | Method | Location | Restart Required |
|-----|--------|----------|------------------|
| Embeddium | In-game | Video Settings → Embeddium | No |
| Iris Shaders | In-game | Video Settings → Shaders | No |
| Distant Horizons | Config | `config/DistantHorizons.toml` | Yes |
| EntityCulling | Config | `config/entityculling.json` | Yes |
| Dynamic FPS | Mod Menu | Mod Menu → Dynamic FPS | No |
| Falling Leaves | Config | `config/fallingleaves.json` | Yes |
| 3D Skin Layers | In-game | Options → Skin Customization | No |
| Bobby | Config | `config/bobby.conf` | Yes |
| Chunks Fade In | File Move | Move .jar file | Yes |
| Not Enough Animations | Config | `config/notenoughanimations.json` | No |

## 📝 Summary

**Current Solution (No Custom Mod Needed):**
- Use **Mod Menu** for GUI-based toggles
- Edit config files for advanced options
- Move .jar files to disable/enable mods
- Use preset scripts for quick profile switching

**Future Enhancement (Custom Mod):**
- Create custom Fabric mod with GUI
- Add one-click preset switching
- No file moving required
- Integrated into Minecraft menu

The current system using Mod Menu is fully functional and doesn't require any custom development!

---

**Press F6 (if custom mod installed) or use Mod Menu button to access toggles!**
