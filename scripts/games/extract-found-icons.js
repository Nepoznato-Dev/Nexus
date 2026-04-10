#!/usr/bin/env node
/**
 * Targeted icon extraction based on found icons in build/games
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

// Known icon locations from scan
const iconMappings = {
    '2048': {
        source: 'build/games/2048/meta/apple-touch-icon.png',
        dest: 'public/game-icons/2048.png',
        title: '2048'
    },
    'pacman': {
        source: 'build/games/pacman-canvas/img/Icon-512x512.png',
        dest: 'public/game-icons/pacman.png',
        title: 'Pac-Man'
    },
    'pacman-alt': {
        source: 'build/games/pacman-canvas/img/Pacman-Icon.svg',
        dest: 'public/game-icons/pacman.svg',
        title: 'Pacman'
    },
    'hexgl': {
        source: 'build/games/hexgl/icon_256.png',
        dest: 'public/game-icons/hexgl.png',
        title: 'HexGL'
    },
    'openttd': {
        source: 'build/games/openttd/media/openttd.512.png',
        dest: 'public/game-icons/openttd.png',
        title: 'OpenTTD'
    },
    'ancient-beast': {
        source: 'build/games/ancient-beast/assets/favicon.png',
        dest: 'public/game-icons/ancient-beast.png',
        title: 'Ancient Beast'
    },
    'browser-quest': {
        source: 'build/games/browser-quest/client/img/common/favicon.png',
        dest: 'public/game-icons/browser-quest.png',
        title: 'Browser Quest'
    },
    'browserquest': {
        source: 'build/games/browserquest/client/img/common/favicon.png',
        dest: 'public/game-icons/browserquest.png',
        title: 'BrowserQuest'
    },
    'dark-room': {
        source: 'build/games/dark-room/img/adr.png',
        dest: 'public/game-icons/dark-room.png',
        title: 'A Dark Room'
    },
    'emberwind': {
        source: 'build/games/emberwind/icon_114x114.png',
        dest: 'public/game-icons/emberwind.png',
        title: 'Emberwind'
    }
};

// Load icon config
const iconConfigPath = path.join(repoRoot, 'public/game-icons/game-icons-config.json');
let iconConfig = {};

try {
    iconConfig = JSON.parse(fs.readFileSync(iconConfigPath, 'utf8'));
} catch (err) {
    console.log('⚠️  Could not load icon config');
}

console.log('🎮 Extracting Real Game Icons\n');
console.log('='.repeat(50));

let copied = 0;
let failed = 0;

for (const [key, info] of Object.entries(iconMappings)) {
    const sourcePath = path.join(repoRoot, info.source);
    const destPath = path.join(repoRoot, info.dest);

    if (!fs.existsSync(sourcePath)) {
        console.log(`❌ ${info.title}: Source not found`);
        failed++;
        continue;
    }

    try {
        // Ensure directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy file
        fs.copyFileSync(sourcePath, destPath);

        // Update config
        const configPath = '/game-icons/' + path.basename(destPath);
        iconConfig[info.title] = configPath;

        console.log(`✅ ${info.title}: ${path.basename(destPath)}`);
        copied++;
    } catch (err) {
        console.log(`❌ ${info.title}: ${err.message}`);
        failed++;
    }
}

// Save updated config
try {
    fs.writeFileSync(iconConfigPath, JSON.stringify(iconConfig, null, 4), 'utf8');
    console.log(`\n💾 Updated icon config`);
} catch (err) {
    console.log(`\n❌ Failed to save config: ${err.message}`);
}

console.log(`\n✨ Complete!`);
console.log(`   Copied: ${copied}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total games in config: ${Object.keys(iconConfig).length}`);
