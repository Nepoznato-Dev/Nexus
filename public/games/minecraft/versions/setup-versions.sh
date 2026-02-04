#!/bin/bash
# Setup script for Minecraft versions structure

cd "$(dirname "$0")"

echo "Setting up Minecraft versions structure..."
echo ""

# Create all 19 version directories with mods folders
versions=(
  # Classic Era
  "1.0" "1.2.5" "1.4.7" "1.5.2" "1.6.4"
  # Legacy
  "1.7.10" "1.8.9"
  # Classic Modded
  "1.12.2"
  # Modern
  "1.16.5" "1.17.1" "1.18.2"
  # Recent Stable
  "1.19.2" "1.19.4" "1.20.1" "1.20.2" "1.20.4"
  # Newest (Experimental)
  "1.20.5" "1.20.6" "1.21" "1.21.1" "1.21.4"
)

for version in "${versions[@]}"; do
    mkdir -p "$version/mods"
    echo "✓ Created $version/mods/"
done

# Create info files for each version
cat > "1.7.10/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.7.10:
- OptiFine HD U E7
- FastCraft 1.25
- FoamFix

Download from:
- https://optifine.net/downloads
- https://www.curseforge.com/minecraft/mc-mods/fastcraft
- https://www.curseforge.com/minecraft/mc-mods/foamfix-optimization-mod
EOF

cat > "1.8.9/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.8.9:
- OptiFine HD U M5
- Patcher

Download from:
- https://optifine.net/downloads
- https://sk1er.club/mods/patcher
EOF

cat > "1.12.2/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.12.2:
- OptiFine HD U G5
- FoamFix
- Phosphor
- VanillaFix

Download from:
- https://optifine.net/downloads
- https://www.curseforge.com/minecraft/mc-mods/foamfix-optimization-mod
- https://www.curseforge.com/minecraft/mc-mods/phosphor-forge
- https://www.curseforge.com/minecraft/mc-mods/vanillafix
EOF

cat > "1.16.5/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.16.5 (Fabric):
- Sodium 0.3.4
- Lithium 0.7.10
- Phosphor 0.8.1
- Starlight 1.0.2

Download from:
- https://modrinth.com/mod/sodium
- https://modrinth.com/mod/lithium
- https://modrinth.com/mod/phosphor
- https://modrinth.com/mod/starlight

Requires Fabric Loader!
EOF

cat > "1.18.2/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.18.2 (Fabric):
- Sodium 0.4.4
- Lithium 0.7.10
- Starlight 1.1.1
- FerriteCore 4.2.1
- LazyDFU

Download from Modrinth:
- https://modrinth.com/mod/sodium
- https://modrinth.com/mod/lithium
- https://modrinth.com/mod/starlight
- https://modrinth.com/mod/ferrite-core
- https://modrinth.com/mod/lazydfu

Requires Fabric Loader!
EOF

cat > "1.19.4/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.19.4 (Fabric):
- Sodium 0.4.10
- Lithium 0.11.1
- Starlight 1.1.1
- C2ME 0.2.0+alpha.10
- FerriteCore 5.0.3

Download from Modrinth:
- https://modrinth.com/mod/sodium
- https://modrinth.com/mod/lithium
- https://modrinth.com/mod/starlight
- https://modrinth.com/mod/c2me-fabric
- https://modrinth.com/mod/ferrite-core

Requires Fabric Loader!
EOF

cat > "1.20.4/mods/MODS.txt" << 'EOF'
Optimization Mods for 1.20.4 (Fabric):
- Sodium 0.5.5
- Lithium 0.12.1
- ModernFix 5.11.1
- FerriteCore 6.0.1
- Noisium
- C2ME

Download from Modrinth:
- https://modrinth.com/mod/sodium
- https://modrinth.com/mod/lithium
- https://modrinth.com/mod/modernfix
- https://modrinth.com/mod/ferrite-core
- https://modrinth.com/mod/noisium
- https://modrinth.com/mod/c2me-fabric

Requires Fabric Loader 0.15.0+!
EOF

# Create MODS.txt for experimental newest versions
for experimental_version in "1.0" "1.2.5" "1.4.7" "1.5.2" "1.6.4"; do
  cat > "$experimental_version/mods/MODS.txt" << EOF
Classic Version $experimental_version:
⚠️ Very old version - limited mod support

May require:
- Java 8 (instead of Java 17)
- OptiFine (if available for this version)

This version is for nostalgia/historical purposes.
Modern optimization mods do not support this version.
EOF
done

for intermediate_version in "1.17.1" "1.19.2" "1.20.1" "1.20.2"; do
  cat > "$intermediate_version/mods/MODS.txt" << EOF
Optimization Mods for $intermediate_version (Fabric):
- Sodium (check Modrinth for exact version)
- Lithium
- Starlight or Phosphor
- FerriteCore
- ModernFix (if available)

Download from Modrinth:
- https://modrinth.com/mod/sodium
- https://modrinth.com/mod/lithium
- https://modrinth.com/mod/starlight
- https://modrinth.com/mod/ferrite-core
- https://modrinth.com/mod/modernfix

⚠️ Check version compatibility on Modrinth before downloading!
Requires Fabric Loader!
EOF
done

for newest_version in "1.20.5" "1.20.6" "1.21" "1.21.1" "1.21.4"; do
  cat > "$newest_version/mods/MODS.txt" << EOF
⚠️ EXPERIMENTAL VERSION $newest_version - Use at your own risk!

Optimization Mods (if available):
- Sodium - May have limited support
- Lithium - Check compatibility
- ModernFix - If version exists
- Noisium - Experimental

Download from Modrinth:
- https://modrinth.com/mod/sodium
- https://modrinth.com/mod/lithium
- https://modrinth.com/mod/modernfix
- https://modrinth.com/mod/noisium

⚠️ WARNING: Newest versions may not have stable optimization mods yet!
⚠️ Check Modrinth for latest compatible versions before use.
⚠️ Some mods may cause crashes or compatibility issues.

Requires latest Fabric Loader!
EOF
done

echo ""
echo "✓ All version directories created!"
echo ""
echo "Next steps:"
echo "1. Add minecraft-{version}.jar to each version folder"
echo "2. Download optimization mods (see MODS.txt in each mods/ folder)"
echo "3. Place mod .jar files in the corresponding mods/ folder"
echo ""
echo "Directory structure:"
for version in "${versions[@]}"; do
    echo "  versions/$version/"
    echo "    ├── minecraft-$version.jar (add this)"
    echo "    └── mods/ (add optimization mods here)"
done

echo ""
echo "Done! 🎮"
