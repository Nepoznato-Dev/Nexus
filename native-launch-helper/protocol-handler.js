#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function readConfig() {
    const configPath = path.join(__dirname, 'config.json');
    if (!fs.existsSync(configPath)) {
        throw new Error('Missing config.json. Copy config.example.json to config.json and set your launcher command.');
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function parseProtocol(rawArg) {
    const decoded = rawArg.replace(/^\"|\"$/g, '');
    const url = new URL(decoded);

    if (url.protocol !== 'nexus-launcher:') {
        throw new Error(`Unsupported protocol: ${url.protocol}`);
    }

    return {
        folder: url.searchParams.get('folder') || '',
        version: url.searchParams.get('version') || '',
        loader: url.searchParams.get('loader') || ''
    };
}

function buildCommand(template, context) {
    return template
        .replaceAll('{instanceName}', context.instanceName)
        .replaceAll('{instanceFolder}', context.instanceFolder)
        .replaceAll('{instancePath}', context.instancePath)
        .replaceAll('{version}', context.version)
        .replaceAll('{loader}', context.loader);
}

function main() {
    const rawArg = process.argv[2];
    if (!rawArg) {
        throw new Error('No protocol URL received.');
    }

    const config = readConfig();
    const payload = parseProtocol(rawArg);

    if (!config.projectRoot) {
        throw new Error('config.json is missing projectRoot.');
    }

    if (!config.launchCommandTemplate) {
        throw new Error('config.json is missing launchCommandTemplate.');
    }

    const instanceFolder = payload.folder;
    const instanceName = payload.version || payload.folder;
    const instancePath = path.join(config.projectRoot, 'MinecraftVersions', instanceFolder);

    if (!fs.existsSync(instancePath)) {
        throw new Error(`Minecraft instance folder not found: ${instancePath}`);
    }

    const command = buildCommand(config.launchCommandTemplate, {
        instanceName,
        instanceFolder,
        instancePath,
        version: payload.version,
        loader: payload.loader
    });

    exec(command, {
        cwd: config.workingDirectory || config.projectRoot
    }, (error) => {
        if (error) {
            console.error(`Launch failed: ${error.message}`);
            process.exit(1);
        }
    });
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
