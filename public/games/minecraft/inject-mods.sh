#!/bin/bash
# Minecraft Mod Injector
# Automatically copies mods from MinecraftMods folder to Minecraft versions

MODS_SOURCE="/workspaces/Nexus-Community-Project/MinecraftMods sodium, optifine"
MINECRAFT_BASE="/workspaces/Nexus-Community-Project/public/games/minecraft"
PERFORMANCE_ENABLED=true
SODIUM_OR_OPTIFINE="sodium" # Can be "sodium" or "optifine"

# Function to inject mods into a specific version
inject_mods_to_version() {
  local version=$1
  local version_path="$MINECRAFT_BASE/versions/$version/mods"
  
  if [ ! -d "$version_path" ]; then
    echo "Creating mods directory for version $version"
    mkdir -p "$version_path"
  fi
  
  echo "Injecting mods into $version..."
  
  # Copy performance mods if enabled
  if [ "$PERFORMANCE_ENABLED" = true ]; then
    echo "  → Copying performance mods..."
    
    # Client mods
    if [ -d "$MODS_SOURCE/client/$SODIUM_OR_OPTIFINE" ]; then
      cp -r "$MODS_SOURCE/client/$SODIUM_OR_OPTIFINE"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # Performance mods
    if [ "$SODIUM_OR_OPTIFINE" = "sodium" ]; then
      cp -r "$MODS_SOURCE/preformace/sodiummods"/*.jar "$version_path/" 2>/dev/null || true
    else
      cp -r "$MODS_SOURCE/preformace/optifinemods"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # Debug mods
    if [ -d "$MODS_SOURCE/debug/$SODIUM_OR_OPTIFINE" ]; then
      cp -r "$MODS_SOURCE/debug/$SODIUM_OR_OPTIFINE"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # Gameplay mods
    if [ -d "$MODS_SOURCE/gameplay/$SODIUM_OR_OPTIFINE" ]; then
      cp -r "$MODS_SOURCE/gameplay/$SODIUM_OR_OPTIFINE"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # Library mods
    if [ "$SODIUM_OR_OPTIFINE" = "sodium" ]; then
      cp -r "$MODS_SOURCE/library/sodiummods"/*.jar "$version_path/" 2>/dev/null || true
    else
      cp -r "$MODS_SOURCE/library/optifinemods"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # QOL mods
    if [ "$SODIUM_OR_OPTIFINE" = "sodium" ]; then
      cp -r "$MODS_SOURCE/qol/sodiummods"/*.jar "$version_path/" 2>/dev/null || true
    else
      cp -r "$MODS_SOURCE/qol/optifinemods"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # UI mods
    if [ "$SODIUM_OR_OPTIFINE" = "sodium" ]; then
      cp -r "$MODS_SOURCE/ui/sodiummods"/*.jar "$version_path/" 2>/dev/null || true
    else
      cp -r "$MODS_SOURCE/ui/optifinemods"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # Visual mods
    if [ "$SODIUM_OR_OPTIFINE" = "sodium" ]; then
      cp -r "$MODS_SOURCE/visuals/sodiumvisualsmods"/*.jar "$version_path/" 2>/dev/null || true
    else
      cp -r "$MODS_SOURCE/visuals/optifinevisualsmods"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    # World gen mods
    if [ "$SODIUM_OR_OPTIFINE" = "sodium" ]; then
      cp -r "$MODS_SOURCE/worldgen/sodiumworldgenmods"/*.jar "$version_path/" 2>/dev/null || true
    else
      cp -r "$MODS_SOURCE/worldgen/optifineworldgenmods"/*.jar "$version_path/" 2>/dev/null || true
    fi
    
    echo "  ✓ Performance mods injected"
  fi
  
  # Count total mods
  local mod_count=$(ls "$version_path"/*.jar 2>/dev/null | wc -l)
  echo "  Total mods: $mod_count"
}

# Main execution
echo "========================================="
echo "Minecraft Mod Injection System"
echo "========================================="
echo ""
echo "Source: $MODS_SOURCE"
echo "Target: $MINECRAFT_BASE/versions"
echo "Performance Mods: $PERFORMANCE_ENABLED"
echo "Loader Preference: $SODIUM_OR_OPTIFINE"
echo ""

# Inject into all versions
for version_dir in "$MINECRAFT_BASE/versions"/*; do
  if [ -d "$version_dir" ]; then
    version_name=$(basename "$version_dir")
    inject_mods_to_version "$version_name"
  fi
done

echo ""
echo "========================================="
echo "Mod injection complete!"
echo "========================================="
