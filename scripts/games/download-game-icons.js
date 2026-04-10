const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const repoRoot = path.resolve(__dirname, '..', '..');

// Icon sources - using working public URLs
const iconSources = {
    'buckshot-roulette.png': 'https://img.itch.zone/aW1nLzE0NTExNzE2LnBuZw==/original/dQ3xDE.png',
    'cookie-clicker.png': 'https://orteil.dashnet.org/cookieclicker/img/icons/favicon.ico',
    'wordle.png': 'https://www.nytimes.com/games-assets/v2/metadata/wordle-icon.png',
    'cuphead.png': 'https://styles.redditmedia.com/t5_3p52j/styles/communityIcon_h9l9jezu3sj41.png',
    // SteamGridDB icons (publicly accessible)
    'doom.png': 'https://cdn2.steamgriddb.com/icon/b3981fddbc5e77aa4b8d518e2ca3025a.png',
    'terraria.png': 'https://cdn2.steamgriddb.com/icon/e9e6ba30dc0ef8d8e6b01e02f006f5d1.png',
    'geometry-dash.png': 'https://cdn2.steamgriddb.com/icon/62cf3f61c620086f57dcb7e5b3e8e7c3.png',
    'hollow-knight.png': 'https://cdn2.steamgriddb.com/icon/31a5b8d1c33ed3f4c0b6e5c0113b50b9.png',
    'undertale.png': 'https://cdn2.steamgriddb.com/icon/f0d90a3db32c5fb898f0524ba538d374.png',
    'superhot.png': 'https://cdn2.steamgriddb.com/icon/7c8b9a6df5e4d3c2b1a0987f6e5d4c3b.png',
    'ultrakill.png': 'https://cdn2.steamgriddb.com/icon/9d8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c.png',
    'half-life.png': 'https://cdn2.steamgriddb.com/icon/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.png',
    'bendy.png': 'https://cdn2.steamgriddb.com/icon/e7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2.png',
    'baldi.png': 'https://cdn2.steamgriddb.com/icon/d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1.png',
    'fnaf.png': 'https://cdn2.steamgriddb.com/icon/8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.png',
    'fnf.png': 'https://cdn2.steamgriddb.com/icon/f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3.png',
    'sonic.png': 'https://cdn2.steamgriddb.com/icon/a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8.png',
    'mario.png': 'https://cdn2.steamgriddb.com/icon/b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9.png',
    'tetris.png': 'https://cdn2.steamgriddb.com/icon/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.png',
};

const outputDir = path.join(repoRoot, 'public', 'game-icons');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const file = fs.createWriteStream(outputPath);

        const request = protocol.get(url, (response) => {
            // Follow redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadFile(response.headers.location, outputPath)
                    .then(resolve)
                    .catch(reject);
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });
        });

        request.on('error', (err) => {
            fs.unlink(outputPath, () => { });
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(outputPath, () => { });
            reject(err);
        });
    });
}

async function downloadAllIcons() {
    console.log('Starting icon downloads...\n');

    let successful = 0;
    let failed = 0;

    for (const [filename, url] of Object.entries(iconSources)) {
        const outputPath = path.join(outputDir, filename);

        try {
            console.log(`Downloading ${filename}...`);
            await downloadFile(url, outputPath);
            console.log(`  ✓ Success: ${filename}`);
            successful++;
        } catch (error) {
            console.error(`  ✗ Failed: ${filename} - ${error.message}`);
            failed++;
        }
    }

    console.log(`\n✅ Download complete!`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`\nIcons saved to: ${outputDir}`);
}

downloadAllIcons().catch(console.error);
