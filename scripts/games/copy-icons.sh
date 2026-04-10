#!/bin/bash
# Simple script to copy game icons from build/games to public/game-icons

echo "Copying game icons..."

# Array of games with known icon paths
declare -A games
games[pacman-canvas]="img/Icon-512x512.png"
games[tetris]="index.html"
games[super-mario]="index.html"
games[flappy-bird]="index.html"
games[snake]="index.html"
games[asteroids]="index.html"
games[breakout]="index.html"
games[space-invaders]="index.html"
games[minesweeper]="index.html"
games[2048]="index.html"
games[chess]="index.html"
games[chrome-dino]="index.html"
games[pac-man]="index.html"
games[geometry-wars]="index.html"

count=0

# Loop through build/games directories
for game_dir in /workspaces/Nexus-Community-Project/build/games/*/; do
    game_name=$(basename "$game_dir")
    
    # Skip special files
    [[ "$game_name" == "https:" ]] && continue
    [[ "$game_name" == "null" ]] && continue
    [[ ! -d "$game_dir" ]] && continue
    
    # Check for common icon files
    icons=(
        "img/Icon-512x512.png"
        "img/Icon-300x300.png"
        "img/icon-128.png"
        "icon.png"
        "favicon.png"
        "logo.png"
        "assets/icon.png"
    )
    
    for icon in "${icons[@]}"; do
        icon_path="$game_dir$icon"
        if [ -f "$icon_path" ]; then
            ext="${icon##*.}"
            dest_file="/workspaces/Nexus-Community-Project/public/game-icons/${game_name}.${ext}"
            cp "$icon_path" "$dest_file" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "✓ Copied ${game_name}.${ext}"
                ((count++))
            fi
            break
        fi
    done
done

echo ""
echo "Copied $count icons"
