# 🔄 Multi-Version Automation with MinecraftVersions Folder

## Overview

The `MinecraftVersions` folder now provides a complete, organized structure for per-version mod and config management. This enables:
- Automatic selection of the correct mods for any supported Minecraft version
- Seamless compatibility and easy updates
- No more manual mod sorting for each version!

---

## Folder Structure Example

```
MinecraftVersions/
  1.16.5/
    mods/           # All .jar mods for 1.16.5
    minecraftinstance.json
    .curseclient
  1.18.2/
    mods/           # All .jar mods for 1.18.2
    ...
  1.20.1/
    mods/           # All .jar mods for 1.20.1
    ...
  ...
```

---

## How the Installer Uses This

- When installing for a specific version, the script will:
  1. Copy all mods from `MinecraftVersions/<version>/mods/` to the user's `.minecraft/mods/`
  2. Copy any version-specific configs if present
  3. Use the correct `minecraftinstance.json` for launcher profile (if needed)

---

## Example: Updated install.sh Logic

```bash
# User selects version (e.g., 1.18.2)
MC_VERSION="1.18.2"

# Set source mod folder
MODPACK_DIR="/workspaces/Nexus-Community-Project/MinecraftVersions/$MC_VERSION/mods"

# Set destination
MODS_DIR="$HOME/.minecraft/mods"

# Copy mods
if [ -d "$MODPACK_DIR" ]; then
  echo "Copying mods for $MC_VERSION..."
  cp "$MODPACK_DIR"/*.jar "$MODS_DIR/" 2>/dev/null
  echo "✓ Mods installed for $MC_VERSION"
else
  echo "No mods found for $MC_VERSION!"
fi
```

---

## Launcher Integration

- The Nexus launcher can now:
  - List all available versions from `MinecraftVersions/`
  - Auto-select the correct mods for the chosen version
  - Display a warning if a version is missing mods

---

## Maintenance

- To add/update mods for a version, just update the relevant `mods/` folder.
- No need to manually sort mods for each install—just keep the folder up to date!

---

## Next Steps

- Update all install scripts to use this structure
- Add version auto-detection to launcher UI
- Document this system in all user guides

---

**This structure makes multi-version support fast, reliable, and future-proof!**
