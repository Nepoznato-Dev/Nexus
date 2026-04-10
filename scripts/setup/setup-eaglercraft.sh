#!/bin/bash

# Nexus Eaglercraft Setup Helper
# Downloads and integrates Eaglercraft into Nexus

set -e

EAGLERCRAFT_DIR="/workspaces/Nexus-Community-Project/public/games/eaglercraft"
TEMP_DIR="/tmp/eaglercraft-setup-$$"

echo "=========================================="
echo "  Nexus Eaglercraft Setup Helper"
echo "=========================================="

# Create temp directory
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo ""
echo "📦 Fetching Eaglercraft release info..."

# Get the latest release download URL
# This requires curl and jq, but we can work around with grep
RELEASE_API="https://api.github.com/repos/LAX1DUDE/eaglercraft/releases/latest"

# Try to get download URL using curl
if command -v curl &> /dev/null; then
    echo "Downloading latest Eaglercraft release..."
    
    # Get the download URL from GitHub API
    DOWNLOAD_URL=$(curl -s "$RELEASE_API" | grep -o '"browser_download_url": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$DOWNLOAD_URL" ]; then
        echo "⚠️  Could not auto-detect release URL"
        echo ""
        echo "Manual Setup Steps:"
        echo "1. Visit: https://github.com/LAX1DUDE/eaglercraft/releases"
        echo "2. Download the latest .zip or .tar.gz file"
        echo "3. Extract to: $EAGLERCRAFT_DIR"
        echo "4. Restart Nexus"
        exit 1
    fi
    
    echo "Found: $DOWNLOAD_URL"
    curl -L "$DOWNLOAD_URL" -o eaglercraft.zip
    
    # Extract
    echo "📂 Extracting files..."
    unzip -q eaglercraft.zip -d extracted
    
    # Copy to Nexus (handle different possible structures)
    echo "📁 Installing to Nexus..."
    mkdir -p "$EAGLERCRAFT_DIR"
    
    # Find and copy the actual game files
    if [ -d "extracted/eaglercraft" ]; then
        cp -r extracted/eaglercraft/* "$EAGLERCRAFT_DIR/"
    elif [ -d "extracted" ] && [ -f "extracted/index.html" ]; then
        cp -r extracted/* "$EAGLERCRAFT_DIR/"
    else
        # Try to find index.html
        FOUND_DIR=$(find extracted -name "index.html" -type f | head -1 | xargs dirname)
        if [ -n "$FOUND_DIR" ]; then
            cp -r "$FOUND_DIR"/* "$EAGLERCRAFT_DIR/"
        else
            echo "❌ Could not find Eaglercraft index.html in extracted files"
            echo "Directory structure:"
            ls -la extracted/
            exit 1
        fi
    fi
    
    # Verify installation
    if [ -f "$EAGLERCRAFT_DIR/index.html" ]; then
        echo ""
        echo "✅ Eaglercraft installed successfully!"
        echo ""
        echo "📍 Location: $EAGLERCRAFT_DIR"
        echo ""
        echo "🎮 Next steps:"
        echo "1. Start Nexus: npm start"
        echo "2. Go to Games section"
        echo "3. Click 'Eaglercraft'"
        echo "4. Click 'Start Playing'"
        echo ""
        echo "✓ Done!"
    else
        echo "❌ Installation failed - index.html not found"
        echo "Checking directory contents:"
        ls -la "$EAGLERCRAFT_DIR/" || echo "Directory is empty"
        exit 1
    fi
else
    echo "⚠️  curl not found. Using manual setup:"
    echo ""
    echo "1. Visit: https://github.com/LAX1DUDE/eaglercraft/releases"
    echo "2. Download the latest release"
    echo "3. Extract to: $EAGLERCRAFT_DIR"
    echo "4. Run: npm start"
fi

# Cleanup
rm -rf "$TEMP_DIR"
