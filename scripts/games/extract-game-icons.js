#!/usr/bin/env node
/**
 * Extract game icons from HTML files and local game folders
 * This script scans both the HTML files for icon references and
 * the build/games folders for existing icon files
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

// Paths
const htmlGamesDir = path.join(repoRoot, 'Games, HTML files');
const buildGamesDir = path.join(repoRoot, 'build', 'games');
const publicIconsDir = path.join(repoRoot, 'public', 'game-icons');
const iconConfigPath = path.join(publicIconsDir, 'game-icons-config.json');

// Ensure icons directory exists
if (!fs.existsSync(publicIconsDir)) {
    fs.mkdirSync(publicIconsDir, { recursive: true });
}

// Load existing icon config
let iconConfig = {};
try {
    iconConfig = JSON.parse(fs.readFileSync(iconConfigPath, 'utf8'));
} catch (err) {
    console.log('Creating new icon config...');
}

/**
 * Scan build/games folders for icon files
 */
function scanBuildGames() {
    console.log('\n📁 Scanning build/games folders for icons...\n');

    if (!fs.existsSync(buildGamesDir)) {
        console.log('⚠️  build/games directory not found');
        return;
    }

    const gameFolders = fs.readdirSync(buildGamesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    let foundCount = 0;

    for (const folderName of gameFolders) {
        const gamePath = path.join(buildGamesDir, folderName);

        // Check for manifest.json
        const manifestPath = path.join(gamePath, 'manifest.json');
        const webManifestPath = path.join(gamePath, 'web-app-manifest.json');

        let iconPath = null;

        // Try reading manifest files
        if (fs.existsSync(manifestPath)) {
            try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                if (manifest.icons) {
                    // Get the largest icon
                    const iconSizes = Object.keys(manifest.icons).sort((a, b) => parseInt(b) - parseInt(a));
                    if (iconSizes.length > 0) {
                        iconPath = path.join(gamePath, manifest.icons[iconSizes[0]]);
                    }
                }
            } catch (err) {
                // Ignore manifest parse errors
            }
        }

        // If no manifest, look for common icon files
        if (!iconPath) {
            const commonIconPaths = [
                'img/Icon-512x512.png',
                'img/Icon-300x300.png',
                'img/Icon-200x200.png',
                'img/icon-128.png',
                'img/Pacman-Icon.svg',
                'assets/icon.png',
                'icon.png',
                'favicon.png',
                'logo.png'
            ];

            for (const commonPath of commonIconPaths) {
                const testPath = path.join(gamePath, commonPath);
                if (fs.existsSync(testPath)) {
                    iconPath = testPath;
                    break;
                }
            }
        }

        // Copy icon if found
        if (iconPath && fs.existsSync(iconPath)) {
            const ext = path.extname(iconPath);
            const destName = `${folderName}${ext}`;
            const destPath = path.join(publicIconsDir, destName);

            try {
                fs.copyFileSync(iconPath, destPath);
                console.log(`✅ ${folderName}: ${destName}`);

                // Update icon config
                // Try to match folder name to game title
                const gameTitle = folderName
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                iconConfig[gameTitle] = `/game-icons/${destName}`;
                foundCount++;
            } catch (err) {
                console.log(`❌ Failed to copy ${folderName}: ${err.message}`);
            }
        }
    }

    console.log(`\n✨ Found and copied ${foundCount} icons from build/games\n`);
}

/**
 * Extract icon URLs from HTML files
 */
function scanHTMLFiles() {
    console.log('\n📄 Scanning HTML files for icon references...\n');

    if (!fs.existsSync(htmlGamesDir)) {
        console.log('⚠️  HTML games directory not found');
        return;
    }

    const htmlFiles = fs.readdirSync(htmlGamesDir)
        .filter(file => file.endsWith('.html'));

    let foundCount = 0;

    for (const htmlFile of htmlFiles) {
        const htmlPath = path.join(htmlGamesDir, htmlFile);
        const content = fs.readFileSync(htmlPath, 'utf8');

        // Extract icon references
        const iconRegex = /<link[^>]+rel=["'](?:icon|apple-touch-icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/gi;
        let match;

        const icons = [];
        while ((match = iconRegex.exec(content)) !== null) {
            icons.push(match[1]);
        }

        // Also look for base href
        const baseRegex = /<base[^>]+href=["']([^"']+)["']/i;
        const baseMatch = content.match(baseRegex);
        const baseHref = baseMatch ? baseMatch[1] : null;

        if (icons.length > 0) {
            const gameTitle = htmlFile.replace('.html', '');
            console.log(`📌 ${gameTitle}:`);
            icons.forEach(icon => {
                const fullUrl = baseHref && !icon.startsWith('http')
                    ? baseHref + icon
                    : icon;
                console.log(`   ${fullUrl}`);
            });
            foundCount++;
        }
    }

    console.log(`\n✨ Found icon references in ${foundCount} HTML files\n`);
    console.log('💡 To use these icons, you can:');
    console.log('   1. Download them manually from the CDN URLs');
    console.log('   2. Use a screenshot tool to capture game favicons');
    console.log('   3. Search for official game assets online\n');
}

// Run both scans
console.log('🎮 Game Icon Extractor\n');
console.log('='.repeat(50));

scanBuildGames();
scanHTMLFiles();

// Save updated icon config
fs.writeFileSync(iconConfigPath, JSON.stringify(iconConfig, null, 2), 'utf8');
console.log(`\n💾 Icon config updated: ${iconConfigPath}`);
console.log(`📊 Total games with icons: ${Object.keys(iconConfig).length}`);
