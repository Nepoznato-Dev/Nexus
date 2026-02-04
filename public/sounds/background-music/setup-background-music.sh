#!/bin/bash

# Setup script for Nexus page background music system
# Creates directory structure for background music

set -e

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎵 Nexus Background Music Setup${NC}"
echo -e "${BLUE}================================${NC}\n"

# Create main directory
mkdir -p public/sounds/background-music
echo -e "${GREEN}✓${NC} Created main directory"

# Define categories and subdirectories
declare -A categories
categories=(
  ["loading"]="Loading screens and startup sounds"
  ["pages"]="Main page ambient music"
  ["utilities"]="Utilities and tools pages"
  ["gaming"]="Gaming and recreation"
  ["study"]="Study and learning tools"
  ["system"]="System and settings"
  ["entertainment"]="Entertainment and media"
  ["social"]="Social and authentication"
  ["aesthetic"]="Aesthetic backgrounds"
  ["nostalgia"]="Nostalgic retro sounds"
)

# Create all category directories
for category in "${!categories[@]}"; do
  mkdir -p "public/sounds/background-music/$category"
  echo -e "${GREEN}✓${NC} Created category: ${BLUE}$category${NC} - ${categories[$category]}"
done

# Create README in main directory
cat > public/sounds/background-music/README.md << 'EOF'
# Background Music Directory

This directory contains background music for different pages in Nexus.

## Structure

- **loading/** - Startup/loading screen music
- **pages/** - Main dashboard and page ambient music
- **utilities/** - Calculator, whiteboard, converter pages
- **gaming/** - Games and Minecraft pages
- **study/** - Study tools, flashcards, pomodoro
- **system/** - Settings and admin panel
- **entertainment/** - Music player, videos, browser
- **social/** - Auth, login, social pages
- **aesthetic/** - Background and visual pages
- **nostalgia/** - Retro and OS sounds

## File Naming Convention

Use lowercase with hyphens:
- ✅ `dashboard-ambient.mp3`
- ✅ `focus-study.mp3`
- ❌ `Dashboard Ambient.mp3`
- ❌ `FocusStudy.mp3`

## Audio Specifications

- **Format**: MP3
- **Bitrate**: 128-192 kbps
- **Duration**: 2-3 minutes minimum
- **Size**: < 5 MB per file

## Configuration

Edit `src/config/pageSoundConfig.js` to map music files to pages.

## Free Music Sources

- Pixabay: https://pixabay.com/music/
- Incompetech: https://incompetech.com/
- Bensound: https://www.bensound.com/
- OpenGameArt: https://opengameart.org/
- Free Music Archive: https://freemusicarchive.org/

See PAGE_BACKGROUND_MUSIC_GUIDE.md for full documentation.
EOF

echo -e "\n${GREEN}✓${NC} Created ${BLUE}README.md${NC} in background-music directory"

# Create category README files
for category in "${!categories[@]}"; do
  cat > "public/sounds/background-music/$category/README.md" << EOF
# $category

${categories[$category]}

## Files to Add

- *.mp3 audio files for this category

## Naming Examples

For gaming category:
- arcade-retro.mp3
- minecraft-calm.mp3
- puzzle-focus.mp3

For study category:
- focus-ambient.mp3
- learning-upbeat.mp3
- pomodoro-calm.mp3

## Installation

1. Download royalty-free music from sources below
2. Save as MP3 format
3. Place in this directory
4. Update \`src/config/pageSoundConfig.js\` with file path

## Free Music Sources

- **Pixabay**: https://pixabay.com/music/
- **Incompetech**: https://incompetech.com/ (Kevin MacLeod)
- **Bensound**: https://www.bensound.com/
- **OpenGameArt**: https://opengameart.org/
- **Free Music Archive**: https://freemusicarchive.org/
- **YouTube Audio Library**: https://www.youtube.com/audio-library

All sources offer royalty-free music for use.
EOF
done

echo -e "${GREEN}✓${NC} Created ${BLUE}README.md${NC} files in each category"

# Create a quick reference file
cat > public/sounds/background-music/QUICK_REFERENCE.txt << 'EOF'
🎵 NEXUS BACKGROUND MUSIC - QUICK REFERENCE

DIRECTORY STRUCTURE:
  loading/          - Startup/loading sounds
  pages/            - Main page ambient
  utilities/        - Tools and utilities
  gaming/           - Games and minecraft
  study/            - Study tools
  system/           - Settings/admin
  entertainment/    - Music, videos, browser
  social/           - Auth and social
  aesthetic/        - Backgrounds
  nostalgia/        - Retro sounds

CONFIGURATION:
  Edit: src/config/pageSoundConfig.js
  Pattern: 'page-id' -> { url: '/sounds/background-music/category/file.mp3', ... }

ADDING MUSIC:
  1. Download from Pixabay/Incompetech/etc (see README.md)
  2. Place MP3 file in appropriate category folder
  3. Update pageSoundConfig.js with URL and settings
  4. Test in browser

FILE REQUIREMENTS:
  Format: MP3
  Bitrate: 128-192 kbps
  Duration: 2-3 minutes minimum
  Size: < 5 MB

RECOMMENDED FIRST TRACKS:
  1. pages/dashboard-ambient.mp3
  2. study/focus-ambient.mp3
  3. gaming/arcade-retro.mp3
  4. pages/landing-cinematic.mp3
  5. gaming/minecraft-calm.mp3

BROWSER AUTOPLAY:
  - Requires user interaction first (click/keypress)
  - After first interaction, music plays automatically
  - 🎵 icon shows music is playing
  - Click icon to toggle music on/off

TESTING CHECKLIST:
  [ ] Files in correct directories
  [ ] Config updated with file paths
  [ ] Component imported in App.js
  [ ] Click app to enable autoplay
  [ ] Navigate between pages
  [ ] Music changes with page
  [ ] Volume is appropriate

For full documentation: PAGE_BACKGROUND_MUSIC_GUIDE.md
EOF

echo -e "${GREEN}✓${NC} Created ${BLUE}QUICK_REFERENCE.txt${NC}"

# Summary
echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}\n"
echo -e "Created directories:"
echo -e "  ${BLUE}public/sounds/background-music/${NC}"
echo -e "  ├── loading/"
echo -e "  ├── pages/"
echo -e "  ├── utilities/"
echo -e "  ├── gaming/"
echo -e "  ├── study/"
echo -e "  ├── system/"
echo -e "  ├── entertainment/"
echo -e "  ├── social/"
echo -e "  ├── aesthetic/"
echo -e "  ├── nostalgia/"
echo -e "  └── README files in each\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Download music from free sources (see PAGE_BACKGROUND_MUSIC_GUIDE.md)"
echo "2. Place MP3 files in appropriate category folders"
echo "3. Update src/config/pageSoundConfig.js with file paths"
echo "4. Import PageBackgroundMusic component in App.js"
echo "5. Test page transitions in browser"
echo ""
echo -e "${YELLOW}Free Music Sources:${NC}"
echo "  • Pixabay: https://pixabay.com/music/"
echo "  • Incompetech: https://incompetech.com/"
echo "  • Bensound: https://www.bensound.com/"
echo "  • OpenGameArt: https://opengameart.org/"
echo "  • Free Music Archive: https://freemusicarchive.org/"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  • PAGE_BACKGROUND_MUSIC_GUIDE.md - Full guide"
echo "  • PAGE_MUSIC_QUICK_START.md - Quick reference"
echo ""
