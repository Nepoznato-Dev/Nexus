#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const mcRoot = path.join(repoRoot, 'Minecraft_FULLcode');
const version = process.argv[2] || '1.12.2';
const versionDir = path.join(mcRoot, 'versions', version);
const versionJsonPath = path.join(versionDir, `${version}.json`);
const versionJarPath = path.join(versionDir, `${version}.jar`);

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

if (!fs.existsSync(versionJsonPath)) {
    fail(`Missing version JSON: ${versionJsonPath}`);
}

if (!fs.existsSync(versionJarPath)) {
    fail(`Missing version JAR: ${versionJarPath}`);
}

const raw = fs.readFileSync(versionJsonPath, 'utf8');
let metadata;

try {
    metadata = JSON.parse(raw);
} catch (err) {
    fail(`Invalid JSON in ${versionJsonPath}: ${err.message}`);
}

const libraries = Array.isArray(metadata.libraries) ? metadata.libraries : [];
const classpathEntries = [versionJarPath];
const classpathSet = new Set(classpathEntries);
const missing = [];

for (const lib of libraries) {
    if (!libraryAppliesToCurrentOs(lib)) {
        continue;
    }

    const artifactPath = lib?.downloads?.artifact?.path;
    const artifactSize = lib?.downloads?.artifact?.size;
    if (!artifactPath) {
        continue;
    }

    // Mojang metadata sometimes contains tiny placeholder artifacts (for native-only libs).
    // They don't contain usable bytecode and can confuse classpath scanners.
    if (typeof artifactSize === 'number' && artifactSize <= 1024) {
        continue;
    }

    const localPath = path.join(mcRoot, 'libraries', artifactPath);
    if (fs.existsSync(localPath)) {
        if (!classpathSet.has(localPath)) {
            classpathSet.add(localPath);
            classpathEntries.push(localPath);
        }
    } else {
        missing.push({
            name: lib.name || artifactPath,
            path: artifactPath,
            url: lib?.downloads?.artifact?.url || ''
        });
    }
}

const outDir = path.join(repoRoot, 'build', 'minecraft-browser', version);
fs.mkdirSync(outDir, { recursive: true });

const classpathFile = path.join(outDir, 'classpath.txt');
const classpathLinesFile = path.join(outDir, 'classpath.lines.txt');
const missingFile = path.join(outDir, 'missing-libraries.json');
const compileConfigFile = path.join(outDir, 'compile-config.json');

fs.writeFileSync(classpathFile, classpathEntries.join(path.delimiter));
fs.writeFileSync(classpathLinesFile, classpathEntries.join('\n') + '\n');
fs.writeFileSync(missingFile, JSON.stringify(missing, null, 2));
fs.writeFileSync(
    compileConfigFile,
    JSON.stringify(
        {
            version,
            mainClass: metadata.mainClass || 'net.minecraft.client.main.Main',
            classpathFile,
            classpathLinesFile,
            classpathEntryCount: classpathEntries.length,
            missingLibraryCount: missing.length,
            outputDir: path.join(repoRoot, 'build', 'minecraft-browser', version, 'teavm-out')
        },
        null,
        2
    )
);

console.log(`Prepared classpath for Minecraft ${version}`);
console.log(`Classpath entries: ${classpathEntries.length}`);
console.log(`Missing libraries: ${missing.length}`);
console.log(`Main class: ${metadata.mainClass || 'net.minecraft.client.main.Main'}`);
console.log(`Classpath file: ${classpathFile}`);
console.log(`Missing libraries report: ${missingFile}`);

if (missing.length > 0) {
    console.log('\nSome libraries are missing from Minecraft_FULLcode/libraries.');
    console.log('Fill them before compiling to avoid classpath errors.');
}
