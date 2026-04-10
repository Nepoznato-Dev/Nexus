#!/usr/bin/env node
/**
 * Game Icon Extractor - Extracts icon URLs from HTML game files
 * Usage: node scripts/games/extract-icon-urls.js > icon-urls.txt
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const htmlGamesDir = path.join(repoRoot, 'Games, HTML files');
const results = [];

if (!fs.existsSync(htmlGamesDir)) {
    console.error('HTML games directory not found!');
    process.exit(1);
}

const htmlFiles = fs.readdirSync(htmlGamesDir)
    .filter(file => file.endsWith('.html'))
    .sort();

console.log('# Game Icon URLs\n');
console.log('Generated:', new Date().toISOString());
console.log('='.repeat(80));
console.log('');

for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(htmlGamesDir, htmlFile);
    const content = fs.readFileSync(htmlPath, 'utf8');
    const gameTitle = htmlFile.replace('.html', '');

    // Extract base href
    const baseRegex = /<base[^>]+href=["']([^"']+)["']/i;
    const baseMatch = content.match(baseRegex);
    const baseHref = baseMatch ? baseMatch[1] : null;

    // Extract all icon references
    const iconRegex = /<link[^>]*(?:rel=["'](?:icon|apple-touch-icon|shortcut icon|mask-icon)["']|type=["']image\/(?:png|x-icon|svg\+xml|webp)["'])[^>]*href=["']([^"']+)["'][^>]*>/gi;

    const icons = [];
    let match;
    while ((match = iconRegex.exec(content)) !== null) {
        const iconPath = match[1];

        // Build full URL
        let fullUrl = iconPath;
        if (baseHref && !iconPath.startsWith('http') && !iconPath.startsWith('//')) {
            fullUrl = baseHref + iconPath;
        } else if (iconPath.startsWith('//')) {
            fullUrl = 'https:' + iconPath;
        }

        icons.push(fullUrl);
    }

    // Also check for meta tags with images
    const metaImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
    const metaMatch = content.match(metaImageRegex);
    if (metaMatch) {
        let metaUrl = metaMatch[1];
        if (baseHref && !metaUrl.startsWith('http')) {
            metaUrl = baseHref + metaUrl;
        }
        icons.push(metaUrl);
    }

    if (icons.length > 0) {
        console.log(`## ${gameTitle}`);
        console.log('');

        // Remove duplicates
        const uniqueIcons = [...new Set(icons)];

        uniqueIcons.forEach((icon, index) => {
            // Extract filename
            const urlParts = icon.split('/');
            const filename = urlParts[urlParts.length - 1];
            const ext = path.extname(filename);

            console.log(`**Icon ${index + 1}:** ${icon}`);
            console.log(`- Filename: \`${filename}\``);
            console.log(`- Format: ${ext || 'unknown'}`);
            console.log('');

            // Generate wget command
            const safeTitle = gameTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const outputName = `${safeTitle}${ext || '.png'}`;
            console.log('```bash');
            console.log(`wget -O "public/game-icons/${outputName}" "${icon}"`);
            console.log('```');
            console.log('');
        });

        console.log('---');
        console.log('');

        results.push({
            game: gameTitle,
            icons: uniqueIcons
        });
    }
}

console.log('\n## Summary\n');
console.log(`Total games with icons: ${results.length}`);
console.log(`Total icon URLs found: ${results.reduce((sum, r) => sum + r.icons.length, 0)}`);
console.log('\n## Bulk Download Script\n');
console.log('```bash');
console.log('# Download all game icons');
console.log('mkdir -p public/game-icons\n');

results.forEach(({ game, icons }) => {
    if (icons.length > 0) {
        const safeTitle = game.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const icon = icons[0]; // Use first icon
        const ext = path.extname(icon.split('/').pop()) || '.png';
        const outputName = `${safeTitle}${ext}`;
        console.log(`wget -q -O "public/game-icons/${outputName}" "${icon}" && echo "✓ ${game}" || echo "✗ ${game}"`);
    }
});

console.log('```');
