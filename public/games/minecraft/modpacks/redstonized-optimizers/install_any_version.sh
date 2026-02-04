#!/bin/bash
# Redstonized Optimizers - Universal Multi-Version Installer
# Uses MinecraftVersions folder for per-version mod management

set -e

MINECRAFT_VERSIONS="/workspaces/Nexus-Community-Project/MinecraftVersions"
MC_DIR="$HOME/.minecraft"
MODS_DIR="$MC_DIR/mods"

# List available versions
echo "Available Minecraft Versions:"
ls "$MINECRAFT_VERSIONS"
echo ""
read -p "Enter Minecraft version to install mods for (e.g., 1.20.1): " MC_VERSION

SRC_MODS="$MINECRAFT_VERSIONS/$MC_VERSION/mods"
SRC_CONFIG="$MINECRAFT_VERSIONS/$MC_VERSION/config"

if [ ! -d "$SRC_MODS" ]; then
  echo "❌ No mods found for $MC_VERSION!"
  exit 1
fi

mkdir -p "$MODS_DIR"
echo "Copying mods for $MC_VERSION..."
cp "$SRC_MODS"/*.jar "$MODS_DIR/" 2>/dev/null || echo "No .jar mods found."
echo "✓ Mods installed for $MC_VERSION"

# Optionally copy configs if present
if [ -d "$SRC_CONFIG" ]; then
  CONFIG_DIR="$MC_DIR/config"
  mkdir -p "$CONFIG_DIR"
  cp -r "$SRC_CONFIG"/* "$CONFIG_DIR/" 2>/dev/null || true
  echo "✓ Configs installed for $MC_VERSION"
fi

echo ""
echo "Done! Launch Minecraft $MC_VERSION with your new mods."
