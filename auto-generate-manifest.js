#!/usr/bin/env node
/**
 * Auto-generate games manifest by scanning the "Games, HTML files" folder
 * This eliminates the need to manually add each game to the manifest
 */

const fs = require('fs');
const path = require('path');

const sourceGamesDir = path.join(__dirname, 'Games, HTML files');
const publicGamesDir = path.join(__dirname, 'public', 'games-html-files');
const manifestPath = path.join(__dirname, 'public', 'games-html-files-manifest.json');
const minecraftVersionsDir = path.join(__dirname, 'MinecraftVersions');
const minecraftManifestPath = path.join(__dirname, 'public', 'minecraft-versions-manifest.json');
const descriptionsPath = path.join(__dirname, 'game-descriptions.json');

// Try to load existing descriptions
let descriptions = {};
try {
    if (fs.existsSync(descriptionsPath)) {
        descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
    }
} catch (err) {
    console.log('⚠️  No descriptions file found, will use defaults');
}

// Category detection based on game title keywords
const categoryRules = {
    horror: ['fnaf', 'freddy', 'bendy', 'baldi', 'granny', 'amanda', 'backrooms', 'endoparasitic', 'candy', 'winston', 'epstein', 'scary', 'horror'],
    racing: ['mario kart', 'racing', 'moto x3m', 'drift', 'car', 'bike', 'rally'],
    shooter: ['doom', 'shooting', 'gun', 'fps', 'shooter', 'battle'],
    puzzle: ['2048', 'puzzle', 'wordle', 'sudoku', 'tetris', 'match'],
    platformer: ['mario', 'sonic', 'vex', 'climbing', 'cuphead', 'hollow knight', 'celeste'],
    rhythm: ['fnf', 'friday night', 'rhythm', 'music', 'beat'],
    sports: ['soccer', 'football', 'basketball', 'baseball', 'pool', 'bike'],
    strategy: ['chess', 'civilization', 'tower defense', 'strategy'],
    action: ['superhot', 'ultrakill', 'getting over it', 'happy wheels', 'elastic man'],
    simulation: ['bitlife', 'life simulator', 'sims', 'farm', 'tycoon', 'cookie clicker'],
    multiplayer: ['agar', 'slither', 'among us', 'impostor'],
    classic: ['pac-man', 'tetris', 'snake', 'pong', 'asteroids', 'breakout'],
};

// Emoji assignment based on category or title
function getGameEmoji(title, category) {
    const lower = title.toLowerCase();

    // Specific game emojis
    if (lower.includes('freddy') || lower.includes('fnaf')) return '🐻';
    if (lower.includes('doom')) return '👹';
    if (lower.includes('mario')) return '🍄';
    if (lower.includes('sonic')) return '💨';
    if (lower.includes('cuphead')) return '☕';
    if (lower.includes('undertale')) return '❤️';
    if (lower.includes('terraria')) return '⛏️';
    if (lower.includes('bendy')) return '🖋️';
    if (lower.includes('baldi')) return '📏';
    if (lower.includes('granny')) return '👵';
    if (lower.includes('cookie')) return '🍪';
    if (lower.includes('bitlife')) return '👤';
    if (lower.includes('among') || lower.includes('impostor')) return '🚀';
    if (lower.includes('slither')) return '🐍';
    if (lower.includes('agar')) return '⚫';
    if (lower.includes('wordle')) return '🔤';
    if (lower.includes('geometry')) return '🔷';
    if (lower.includes('happy wheels')) return '🦽';
    if (lower.includes('vex')) return '🏃';
    if (lower.includes('climbing')) return '⛰️';
    if (lower.includes('crossy road')) return '🐔';
    if (lower.includes('moto')) return '🏍️';

    // Category-based emojis
    const categoryEmojis = {
        horror: '👻',
        racing: '🏎️',
        shooter: '🔫',
        puzzle: '🧩',
        platformer: '🎮',
        rhythm: '🎵',
        sports: '⚽',
        strategy: '♟️',
        action: '⚔️',
        simulation: '🎲',
        multiplayer: '👥',
        classic: '👾',
    };

    return categoryEmojis[category] || '🎮';
}

// Color assignment based on category
function getGameColor(category) {
    const categoryColors = {
        horror: '#dc2626',
        racing: '#f59e0b',
        shooter: '#ef4444',
        puzzle: '#8b5cf6',
        platformer: '#3b82f6',
        rhythm: '#ec4899',
        sports: '#10b981',
        strategy: '#64748b',
        action: '#f97316',
        simulation: '#14b8a6',
        multiplayer: '#22c55e',
        classic: '#a78bfa',
        local: '#6366f1',
    };

    return categoryColors[category] || '#6366f1';
}

// Detect category from title
function detectCategory(title) {
    const lower = title.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryRules)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                return category;
            }
        }
    }

    return 'local';
}

function detectMinecraftLoader(instanceData) {
    const loaderName = (instanceData?.baseModLoader?.name || '').toLowerCase();
    if (loaderName.includes('fabric')) return 'fabric';
    if (loaderName.includes('forge')) return 'forge';
    if (loaderName.includes('quilt')) return 'quilt';
    if (loaderName.includes('neoforge')) return 'neoforge';
    if (instanceData?.isVanilla) return 'vanilla';
    return 'unknown';
}

function getMinecraftLoaderColor(loader) {
    const colors = {
        fabric: '#38bdf8',
        forge: '#f97316',
        quilt: '#a855f7',
        neoforge: '#22c55e',
        vanilla: '#facc15',
        unknown: '#64748b',
    };

    return colors[loader] || colors.unknown;
}

function getMinecraftLoaderEmoji(loader) {
    const emojis = {
        fabric: '🧵',
        forge: '🔥',
        quilt: '🪡',
        neoforge: '⚒️',
        vanilla: '🟫',
        unknown: '⛏️',
    };

    return emojis[loader] || emojis.unknown;
}

console.log('🎮 Auto-Generating Games Manifest\n');
console.log('='.repeat(50));

if (!fs.existsSync(sourceGamesDir)) {
    console.error('❌ Error: "Games, HTML files" directory not found!');
    console.error(`   Expected at: ${sourceGamesDir}`);
    process.exit(1);
}

if (!fs.existsSync(publicGamesDir)) {
    fs.mkdirSync(publicGamesDir, { recursive: true });
    console.log(`📁 Created public games directory: ${publicGamesDir}`);
}

// Scan source directory for HTML files
const sourceHtmlFiles = fs.readdirSync(sourceGamesDir)
    .filter(file => file.endsWith('.html'))
    .sort();

console.log(`\n📁 Found ${sourceHtmlFiles.length} HTML source game files\n`);

// Sync source files to the public folder served by the app.
let copiedCount = 0;
let updatedCount = 0;

sourceHtmlFiles.forEach((filename) => {
    const srcPath = path.join(sourceGamesDir, filename);
    const destPath = path.join(publicGamesDir, filename);

    const srcStat = fs.statSync(srcPath);
    let shouldCopy = false;

    if (!fs.existsSync(destPath)) {
        shouldCopy = true;
        copiedCount += 1;
    } else {
        const destStat = fs.statSync(destPath);
        // If file size or mtime differs, refresh the public copy.
        if (destStat.size !== srcStat.size || destStat.mtimeMs < srcStat.mtimeMs) {
            shouldCopy = true;
            updatedCount += 1;
        }
    }

    if (shouldCopy) {
        fs.copyFileSync(srcPath, destPath);
    }
});

console.log(`🔄 Synced public files: ${copiedCount} new, ${updatedCount} updated\n`);

// Build manifest from the public folder so every URL is guaranteed to exist.
const htmlFiles = fs.readdirSync(publicGamesDir)
    .filter(file => file.endsWith('.html'))
    .sort();

console.log(`📦 Generating manifest from ${htmlFiles.length} public HTML files\n`);

// Generate manifest entries
const manifest = htmlFiles.map((filename, index) => {
    // Extract title from filename (remove .html extension)
    const title = filename.replace('.html', '');

    // URL encode the filename for web access
    const encodedFilename = encodeURIComponent(filename).replace(/'/g, '%27');
    const url = `/games-html-files/${encodedFilename}`;

    // Detect category
    const category = detectCategory(title);

    // Get emoji and color
    const emoji = getGameEmoji(title, category);
    const color = getGameColor(category);

    // Check for description
    const description = descriptions[title] || null;

    console.log(`✅ ${index + 1}. ${title}`);
    console.log(`   Category: ${category} | Emoji: ${emoji} | URL: ${url}`);
    if (description) {
        console.log(`   Description: ${description.substring(0, 60)}...`);
    }
    console.log('');

    return {
        id: 1000 + index,
        title,
        url,
        category,
        emoji,
        color,
        source: 'local-html',
        description
    };
});

// Write manifest file
try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('='.repeat(50));
    console.log(`\n✨ Successfully generated manifest!`);
    console.log(`   📄 File: ${manifestPath}`);
    console.log(`   🎮 Total games: ${manifest.length}`);
    console.log(`   📊 Categories: ${[...new Set(manifest.map(g => g.category))].join(', ')}`);
    console.log(`   📝 Games with descriptions: ${manifest.filter(g => g.description).length}`);
    console.log('\n💡 Tip: Run this script whenever you add new HTML files to auto-update the manifest!');
} catch (err) {
    console.error(`\n❌ Error writing manifest: ${err.message}`);
    process.exit(1);
}

// Generate Minecraft versions manifest from lightweight instance metadata only.
if (fs.existsSync(minecraftVersionsDir)) {
    console.log('\n' + '='.repeat(50));
    console.log('\n⛏️ Generating Minecraft versions manifest\n');

    const versionDirs = fs.readdirSync(minecraftVersionsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    const minecraftManifest = versionDirs.map((dirName, index) => {
        const instancePath = path.join(minecraftVersionsDir, dirName, 'minecraftinstance.json');
        const modsPath = path.join(minecraftVersionsDir, dirName, 'mods');

        let instanceData = {};
        try {
            if (fs.existsSync(instancePath)) {
                instanceData = JSON.parse(fs.readFileSync(instancePath, 'utf8'));
            }
        } catch (error) {
            console.warn(`⚠️  Failed to parse ${instancePath}: ${error.message}`);
        }

        const installedAddons = Array.isArray(instanceData.installedAddons) ? instanceData.installedAddons : [];
        const modFiles = fs.existsSync(modsPath)
            ? fs.readdirSync(modsPath).filter(file => file.endsWith('.jar'))
            : [];
        const loader = detectMinecraftLoader(instanceData);
        const modCount = installedAddons.length || modFiles.length;
        const topMods = installedAddons.slice(0, 5).map(mod => mod.name).filter(Boolean);
        const relativeInstancePath = `MinecraftVersions/${dirName}`;
        const protocolUrl = `nexus-launcher://minecraft-instance?folder=${encodeURIComponent(dirName)}&version=${encodeURIComponent(instanceData.gameVersion || dirName)}&loader=${encodeURIComponent(loader)}`;

        const entry = {
            id: `minecraft-${dirName}`,
            title: dirName,
            version: instanceData.gameVersion || dirName,
            category: 'minecraft-version',
            loader,
            loaderLabel: instanceData.baseModLoader?.name || (loader === 'vanilla' ? 'Vanilla' : 'Unknown Loader'),
            modCount,
            topMods,
            allocatedMemoryMb: instanceData.allocatedMemory || null,
            playCount: instanceData.playedCount || 0,
            lastPlayed: instanceData.lastPlayed || null,
            relativeInstancePath,
            protocolUrl,
            emoji: getMinecraftLoaderEmoji(loader),
            color: getMinecraftLoaderColor(loader),
            description: `${dirName} instance with ${modCount} installed mod${modCount === 1 ? '' : 's'}.`,
        };

        console.log(`✅ ${index + 1}. Minecraft ${entry.version}`);
        console.log(`   Loader: ${entry.loaderLabel} | Mods: ${entry.modCount}`);

        return entry;
    });

    try {
        fs.writeFileSync(minecraftManifestPath, JSON.stringify(minecraftManifest, null, 2), 'utf8');
        console.log(`\n✨ Minecraft manifest written: ${minecraftManifestPath}`);
        console.log(`   ⛏️ Total versions: ${minecraftManifest.length}`);
    } catch (error) {
        console.error(`\n❌ Error writing Minecraft manifest: ${error.message}`);
        process.exit(1);
    }
}
