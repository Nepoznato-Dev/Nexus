// Windows-specific protocol registration via registry
// This runs with Administrator privileges if available

const registry = require('windows-registry-js');
const path = require('path');
const process = require('process');

function registerProtocolWindows() {
    const handlerPath = path.join(__dirname, 'protocol-handler.js').replace(/\//g, '\\');
    const nodePath = process.execPath.replace(/\//g, '\\');

    const mainKey = 'HKEY_CURRENT_USER\\Software\\Classes\\nexus-launcher';
    const commandKey = 'HKEY_CURRENT_USER\\Software\\Classes\\nexus-launcher\\shell\\open\\command';

    try {
        // Set main protocol key
        registry.setRegistryKey(mainKey, '', 'url:nexus-launcher Protocol', 'REG_SZ');
        registry.setRegistryKey(mainKey, 'URL Protocol', '', 'REG_SZ');

        // Set command
        const command = `"${nodePath}" "${handlerPath}" "%1"`;
        registry.setRegistryKey(commandKey, '', command, 'REG_SZ');

        console.log('✓ Windows registry updated successfully');
        return true;
    } catch (e) {
        console.error('Registry update failed:', e.message);
        return false;
    }
}

module.exports = registerProtocolWindows;

if (require.main === module) {
    registerProtocolWindows();
}
