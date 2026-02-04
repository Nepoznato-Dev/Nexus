#!/bin/bash
# Setup script for Operating System Sounds collection structure

cd "$(dirname "$0")"

echo "╔════════════════════════════════════════════════╗"
echo "║  Operating System Sounds Collection Setup    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Define all Windows versions
windows_versions=(
  "Windows-95"
  "Windows-98"
  "Windows-2000"
  "Windows-ME"
  "Windows-XP"
  "Windows-Vista"
  "Windows-7"
  "Windows-8"
  "Windows-10"
  "Windows-11"
)

# Define all macOS versions
macos_versions=(
  "System-7"
  "Mac-OS-8"
  "Mac-OS-9"
  "Mac-OS-X-Cheetah"
  "Mac-OS-X-Puma"
  "Mac-OS-X-Jaguar"
  "Mac-OS-X-Panther"
  "Mac-OS-X-Tiger"
  "Mac-OS-X-Leopard"
  "Mac-OS-X-Snow-Leopard"
  "Mac-OS-X-Lion"
  "OS-X-Mountain-Lion"
  "OS-X-Mavericks"
  "OS-X-Yosemite"
  "macOS-El-Capitan"
  "macOS-Sierra"
  "macOS-High-Sierra"
  "macOS-Mojave"
  "macOS-Catalina"
  "macOS-Big-Sur"
  "macOS-Monterey"
  "macOS-Ventura"
  "macOS-Sonoma"
)

# Define all Linux versions (desktop environments and distributions)
linux_versions=(
  "GNOME"
  "KDE-Plasma"
  "XFCE"
  "LXDE"
  "Cinnamon"
  "Mate"
  "Ubuntu"
  "Fedora"
  "Debian"
  "Arch-Linux"
  "Linux-Mint"
)

echo "Creating Windows version directories..."
for version in "${windows_versions[@]}"; do
    mkdir -p "Windows/$version"
    echo "✓ Created Windows/$version/"
    
    # Create README for each version
    cat > "Windows/$version/README.md" << EOF
# $version Sounds

## Available Sounds

- [ ] startup.mp3
- [ ] shutdown.mp3
- [ ] logon.mp3
- [ ] logoff.mp3
- [ ] error.mp3
- [ ] notify.mp3

## Installation

Place audio files in this directory with the naming convention:
- startup.mp3
- shutdown.mp3
- logon.mp3
- etc.

## Notes

Add information about this version's sounds here.
EOF
done

echo ""
echo "Creating macOS version directories..."
for version in "${macos_versions[@]}"; do
    mkdir -p "macOS/$version"
    echo "✓ Created macOS/$version/"
    
    # Create README for each version
    cat > "macOS/$version/README.md" << EOF
# $version Sounds

## Available Sounds

- [ ] startup.mp3
- [ ] shutdown.mp3
- [ ] error.mp3
- [ ] alert.mp3

## Installation

Place audio files in this directory with the naming convention:
- startup.mp3
- shutdown.mp3
- error.mp3
- etc.

## Notes

Add information about this version's sounds here.
EOF
done

echo ""
echo "Creating Linux version directories..."
for version in "${linux_versions[@]}"; do
    mkdir -p "Linux/$version"
    echo "✓ Created Linux/$version/"
    
    # Create README for each version
    cat > "Linux/$version/README.md" << EOF
# $version Sounds

## Available Sounds

- [ ] startup.mp3
- [ ] login.mp3
- [ ] logout.mp3
- [ ] error.mp3
- [ ] notify.mp3

## Installation

Place audio files in this directory with the naming convention:
- startup.mp3
- login.mp3
- logout.mp3
- error.mp3
- etc.

## Notes

Add information about this desktop environment/distribution's sounds here.
EOF
done

# Move existing Windows 95 startup sound if present
if [ -f "microsoft-windows-95-startup-sound.mp3" ]; then
    echo ""
    echo "📁 Moving existing Windows 95 sound..."
    mv "microsoft-windows-95-startup-sound.mp3" "Windows/Windows-95/startup.mp3"
    echo "✓ Moved to Windows/Windows-95/startup.mp3"
fi

echo ""
echo "✅ Operating System Sounds structure created!"
echo ""
echo "📂 Directory structure:"
echo "Sounds/"
echo "├── Windows/"
echo "│   ├── Windows-95/ (startup.mp3 ✅)"
echo "│   ├── Windows-98/"
echo "│   ├── Windows-XP/ (Most iconic!)"
echo "│   ├── Windows-7/ (Most beloved!)"
echo "│   └── ... (all versions)"
echo "│"
echo "├── macOS/"
echo "│   ├── System-7/"
echo "│   ├── Mac-OS-X-Leopard/"
echo "│   ├── macOS-Monterey/"
echo "│   └── ... (all versions)"
echo "│"
echo "└── Linux/"
echo "    ├── GNOME/"
echo "    ├── KDE-Plasma/"
echo "    ├── Ubuntu/"
echo "    └── ... (all DEs/distros)"
echo ""
echo "🎵 Next steps:"
echo "1. Download OS sounds from Archive.org"
echo "2. Place startup.mp3, shutdown.mp3, etc. in appropriate folders"
echo "3. The web player will automatically detect available sounds"
echo ""
echo "🎯 Priority sounds to collect:"
echo "   • Windows XP startup (most iconic)"
echo "   • Windows 7 startup/shutdown"
echo "   • macOS Leopard startup"
echo "   • System 7 startup (classic Mac)"
echo "   • Ubuntu startup"
echo ""
