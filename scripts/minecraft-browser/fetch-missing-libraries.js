#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const mcRoot = path.join(repoRoot, 'Minecraft_FULLcode');
const version = process.argv[2] || '1.12.2';
const versionJsonPath = path.join(mcRoot, 'versions', version, `${version}.json`);

function currentMinecraftOsName() {
    if (process.platform === 'win32') return 'windows';
    if (process.platform === 'darwin') return 'osx';
    return 'linux';
}

function libraryAppliesToCurrentOs(lib) {
    const rules = Array.isArray(lib?.rules) ? lib.rules : null;
    if (!rules || rules.length === 0) {
        return true;
    }

    const osName = currentMinecraftOsName();
    let allowed = false;

    for (const rule of rules) {
        const action = rule?.action;
        if (action !== 'allow' && action !== 'disallow') {
            continue;
        }

        const ruleOsName = rule?.os?.name;
        const osMatches = !ruleOsName || ruleOsName === osName;
        if (!osMatches) {
            continue;
        }

        allowed = action === 'allow';
    }

    return allowed;
}

function fail(message) {
    console.error(`ERROR: ${message}`);
    process.exit(1);
}

async function downloadFile(url, destination) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, Buffer.from(arrayBuffer));
}

if (!fs.existsSync(versionJsonPath)) {
    fail(`Missing version JSON: ${versionJsonPath}`);
}

let metadata;
try {
    metadata = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
} catch (err) {
    fail(`Invalid JSON in ${versionJsonPath}: ${err.message}`);
}

const libraries = Array.isArray(metadata.libraries) ? metadata.libraries : [];
const missing = [];
const seenPaths = new Set();

for (const lib of libraries) {
    if (!libraryAppliesToCurrentOs(lib)) {
        continue;
    }

    const artifactPath = lib?.downloads?.artifact?.path;
    const artifactSize = lib?.downloads?.artifact?.size;
    const artifactUrl = lib?.downloads?.artifact?.url;
    if (!artifactPath || !artifactUrl) continue;

    if (typeof artifactSize === 'number' && artifactSize <= 1024) {
        continue;
    }

    if (seenPaths.has(artifactPath)) {
        continue;
    }
    seenPaths.add(artifactPath);

    const localPath = path.join(mcRoot, 'libraries', artifactPath);
    if (!fs.existsSync(localPath)) {
        missing.push({
            name: lib.name || artifactPath,
            path: artifactPath,
            url: artifactUrl,
            localPath
        });
    }
}

if (missing.length === 0) {
    console.log(`No missing libraries for ${version}`);
    process.exit(0);
}

console.log(`Found ${missing.length} missing libraries for ${version}`);

(async () => {
    let downloaded = 0;
    const failures = [];

    for (const lib of missing) {
        process.stdout.write(`Downloading ${lib.name} ... `);
        try {
            await downloadFile(lib.url, lib.localPath);
            downloaded += 1;
            console.log('ok');
        } catch (err) {
            failures.push({ lib, error: err.message });
            console.log('failed');
        }
    }

    console.log(`\nDownloaded: ${downloaded}`);
    if (failures.length > 0) {
        console.log(`Failed: ${failures.length}`);
        const failureReport = path.join(repoRoot, 'build', 'minecraft-browser', version, 'failed-downloads.json');
        fs.mkdirSync(path.dirname(failureReport), { recursive: true });
        fs.writeFileSync(failureReport, JSON.stringify(failures, null, 2));
        console.log(`Failure report: ${failureReport}`);
        process.exit(1);
    }

    console.log('All missing libraries downloaded successfully');
})().catch((err) => fail(err.message));
