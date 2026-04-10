#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const EXAMPLE_PATH = path.join(__dirname, 'config.example.json');

// Platform detection
const platform = process.platform;
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';
const isMac = platform === 'darwin';

// Common launcher paths by platform
const COMMON_LAUNCHERS = {
    win32: [
        { name: 'Prism Launcher', exe: 'C:\\Program Files\\PrismLauncher\\prismlauncher.exe', template: '"{exe}" -l "{instanceName}"' },
        { name: 'Prism Launcher (x86)', exe: 'C:\\Program Files (x86)\\PrismLauncher\\prismlauncher.exe', template: '"{exe}" -l "{instanceName}"' },
        { name: 'MultiMC', exe: 'C:\\Program Files\\MultiMC\\MultiMC.exe', template: '"{exe}" -l "{instanceName}"' },
        { name: 'MultiMC (x86)', exe: 'C:\\Program Files (x86)\\MultiMC\\MultiMC.exe', template: '"{exe}" -l "{instanceName}"' }
    ],
    linux: [
        { name: 'Prism Launcher', cmd: 'prismlauncher', template: '{cmd} -l "{instanceName}"' },
        { name: 'MultiMC', cmd: 'multimc', template: '{cmd} -l "{instanceName}"' }
    ],
    darwin: [
        { name: 'Prism Launcher', app: '/Applications/PrismLauncher.app/Contents/MacOS/PrismLauncher', template: '"{app}" -l "{instanceName}"' },
        { name: 'MultiMC', app: '/Applications/MultiMC.app/Contents/MacOS/MultiMC', template: '"{app}" -l "{instanceName}"' }
    ]
};

function getProjectRoot() {
    // Walk up from native-launch-helper to find where Nexus root is
    let current = __dirname;
    while (current !== '/') {
        if (fs.existsSync(path.join(current, 'package.json'))) {
            const pkgJson = JSON.parse(fs.readFileSync(path.join(current, 'package.json'), 'utf8'));
            if (pkgJson.name === 'nexus' || fs.existsSync(path.join(current, 'MinecraftVersions'))) {
                return current;
            }
        }
        current = path.dirname(current);
    }
    // Fallback: assume Nexus is one level up from native-launch-helper
    return path.dirname(__dirname);
}

function findInstalledLaunchers() {
    const launchers = COMMON_LAUNCHERS[platform] || [];
    const found = [];

    for (const launcher of launchers) {
        if (isWindows && launcher.exe && fs.existsSync(launcher.exe)) {
            found.push({ name: launcher.name, path: launcher.exe, template: launcher.template });
        } else if (isLinux && launcher.cmd) {
            try {
                execSync(`which ${launcher.cmd}`, { stdio: 'pipe' });
                found.push({ name: launcher.name, cmd: launcher.cmd, template: launcher.template });
            } catch (e) {
                // Command not found
            }
        } else if (isMac && launcher.app && fs.existsSync(launcher.app)) {
            found.push({ name: launcher.name, path: launcher.app, template: launcher.template });
        }
    }

    return found;
}

function question(prompt) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function selectFromList(items, displayFn) {
    console.log('\nAvailable options:');
    items.forEach((item, i) => {
        console.log(`  ${i + 1}. ${displayFn(item)}`);
    });
    console.log(`  ${items.length + 1}. Other (manual entry)`);

    let choice;
    while (true) {
        choice = await question('Select option (number): ');
        if (choice >= 1 && choice <= items.length + 1) {
            return parseInt(choice) - 1;
        }
        console.log('Invalid choice. Try again.');
    }
}

async function setupConfig() {
    console.log('\n========================================');
    console.log('  Nexus Native Launcher Setup');
    console.log('========================================\n');

    const projectRoot = getProjectRoot();
    console.log(`📁 Project Root: ${projectRoot}\n`);

    // Check if MinecraftVersions exists
    if (!fs.existsSync(path.join(projectRoot, 'MinecraftVersions'))) {
        console.error('❌ MinecraftVersions folder not found. Are you in the Nexus repo?');
        process.exit(1);
    }

    // Find installed launchers
    console.log('🔍 Searching for installed launchers...');
    const installedLaunchers = findInstalledLaunchers();

    let launchCommandTemplate;

    if (installedLaunchers.length > 0) {
        console.log(`✓ Found ${installedLaunchers.length} launcher(s)\n`);
        const choice = await selectFromList(
            installedLaunchers,
            (l) => `${l.name} (${l.path || l.cmd})`
        );

        if (choice < installedLaunchers.length) {
            const launcher = installedLaunchers[choice];
            launchCommandTemplate = launcher.template
                .replace('{exe}', launcher.path || launcher.cmd)
                .replace('{app}', launcher.path || launcher.cmd)
                .replace('{cmd}', launcher.cmd || launcher.path);
            console.log(`\n✓ Selected: ${launcher.name}`);
            console.log(`  Command: ${launchCommandTemplate}\n`);
        } else {
            launchCommandTemplate = await question('Launcher command template: ');
        }
    } else {
        console.log('⚠ No launchers auto-detected.\n');
        launchCommandTemplate = await question(
            'Enter launcher command template (e.g., "prismlauncher -l \\\"{instanceName}\\\"")\n> '
        );
    }

    // Write config
    const config = {
        projectRoot,
        launchCommandTemplate,
        workingDirectory: null
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\n✓ Config saved to config.json\n`);

    return config;
}

async function registerProtocol(config) {
    console.log('🔧 Registering nexus-launcher:// protocol...\n');

    if (isWindows) {
        console.log('📋 Windows Registry Setup:\n');
        console.log('This requires administrator privileges. Here\'s what will be registered:\n');

        const handlerPath = path.join(__dirname, 'protocol-handler.js').replace(/\\/g, '\\\\');
        const nodePath = process.execPath.replace(/\\/g, '\\\\');

        console.log(`Registry key: HKEY_CURRENT_USER\\Software\\Classes\\nexus-launcher`);
        console.log(`Default value: url:nexus-launcher Protocol`);
        console.log(`URL Protocol: (empty)`);
        console.log(`\nRegistry key: HKEY_CURRENT_USER\\Software\\Classes\\nexus-launcher\\shell\\open\\command`);
        console.log(`Default value: "${nodePath}" "${handlerPath}" "%1"\n`);

        const proceed = await question(
            'Do you want to register this now? You may need to run as admin. (y/n): '
        );

        if (proceed.toLowerCase() === 'y') {
            try {
                // Try to register
                console.log('\nAttempting registration...\n');
                require('./register-protocol-windows.js')();
                console.log('✓ Protocol registered successfully!\n');
            } catch (e) {
                console.log('⚠ Auto-registration failed. Manual steps:\n');
                console.log('1. Open Registry Editor (regedit)');
                console.log('2. Navigate to: HKEY_CURRENT_USER\\Software\\Classes\\nexus-launcher');
                console.log('3. Create this key structure if it doesn\'t exist');
                console.log('4. Set Default value to: url:nexus-launcher Protocol');
                console.log('5. Create a DWORD "URL Protocol" with value 0');
                console.log('6. Create shell\\open\\command with Default value:');
                console.log(`   "${nodePath}" "${handlerPath}" "%1"\n`);
            }
        }
    } else if (isLinux) {
        console.log('📋 Linux .desktop File Setup:\n');

        const desktopFile = path.join(process.env.HOME || '/root', '.local/share/applications/nexus-launcher.desktop');
        const handlerPath = path.join(__dirname, 'protocol-handler.js');

        console.log(`Will create: ${desktopFile}\n`);

        const content = `[Desktop Entry]
Type=Application
Name=Nexus Launcher
Exec=node "${handlerPath}" %u
MimeType=x-scheme-handler/nexus-launcher
NoDisplay=true
StartupNotify=true
`;

        fs.mkdirSync(path.dirname(desktopFile), { recursive: true });
        fs.writeFileSync(desktopFile, content);

        try {
            execSync('update-desktop-database', { cwd: path.dirname(desktopFile), stdio: 'pipe' });
        } catch (e) {
            // update-desktop-database might not exist, but file is still registered
        }

        console.log('✓ Protocol registered successfully!\n');
    } else if (isMac) {
        console.log('📋 macOS Setup:\n');
        console.log('macOS requires a shell wrapper to forward nexus-launcher:// URLs.\n');

        const wrapperPath = path.join(__dirname, 'nexus-launcher');
        const handlerPath = path.join(__dirname, 'protocol-handler.js');

        const wrapper = `#!/bin/bash
node "${handlerPath}" "$1"
`;

        fs.writeFileSync(wrapperPath, wrapper);
        fs.chmodSync(wrapperPath, 0o755);

        console.log('✓ Wrapper created. Register manually via:\n');
        console.log('   defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add "{LSHandlerURLScheme=nexus-launcher;LSHandlerRoleAll=com.yourcompany.nexus;}"');
        console.log('\n   Or use: open "${wrapperPath}"\n');
    }
}

async function main() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            console.log('\n⚠ config.json already exists:\n');
            console.log(`  projectRoot: ${existing.projectRoot}`);
            console.log(`  launchCommandTemplate: ${existing.launchCommandTemplate}\n`);

            const response = await question('Overwrite? (y/n): ');
            if (response.toLowerCase() !== 'y') {
                console.log('\nSetup cancelled.\n');
                process.exit(0);
            }
        }

        const config = await setupConfig();
        await registerProtocol(config);

        console.log('========================================');
        console.log('  ✓ Setup Complete!');
        console.log('========================================\n');
        console.log('You can now launch Minecraft from Nexus.');
        console.log('Minecraft instances will open in your configured launcher.\n');
    } catch (err) {
        console.error('\n❌ Setup failed:', err.message);
        process.exit(1);
    }
}

main();
