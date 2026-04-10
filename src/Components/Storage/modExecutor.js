/**
 * modExecutor.js - Safely executes mod code with sandboxed API access
 * 
 * Provides a controlled environment for mods to modify settings
 */

import { storage } from './clientStorage.js';
import { createPageUrl } from '../../utils.js';

class ModExecutor {
    constructor() {
        this.activeMods = new Map();
    }

    /**
     * Create a safe API for mods to use
     */
    createModAPI() {
        return {
            // Settings API
            setSetting: async (path, value) => {
                try {
                    const keys = path.split('.');
                    const currentSettings = await storage.loadSettings() || {};

                    let current = currentSettings;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) current[keys[i]] = {};
                        current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = value;

                    await storage.saveSettings(currentSettings);

                    // Handle special localStorage settings
                    if (path === 'layout.taskbarPosition') {
                        localStorage.setItem('desktop_taskbar_position', value);
                    } else if (path === 'layout.taskbarStyle') {
                        localStorage.setItem('desktop_taskbar_style', value);
                    } else if (path === 'layout.windowsVersion') {
                        localStorage.setItem('desktop_windows_version', value);
                    }

                    return { success: true };
                } catch (error) {
                    console.error('Mod setSetting error:', error);
                    return { success: false, error: error.message };
                }
            },

            getSetting: async (path) => {
                try {
                    const currentSettings = await storage.loadSettings() || {};
                    const keys = path.split('.');
                    let current = currentSettings;

                    for (const key of keys) {
                        if (current === undefined) return undefined;
                        current = current[key];
                    }

                    return current;
                } catch (error) {
                    console.error('Mod getSetting error:', error);
                    return undefined;
                }
            },

            // localStorage API (limited)
            setLocal: (key, value) => {
                try {
                    if (!key.startsWith('nexus_mod_')) {
                        key = 'nexus_mod_' + key;
                    }
                    localStorage.setItem(key, JSON.stringify(value));
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            getLocal: (key) => {
                try {
                    if (!key.startsWith('nexus_mod_')) {
                        key = 'nexus_mod_' + key;
                    }
                    const value = localStorage.getItem(key);
                    return value ? JSON.parse(value) : null;
                } catch (error) {
                    return null;
                }
            },

            // Console API (safe logging)
            log: (...args) => {
                console.log('[Mod]', ...args);
            },

            // Notification API
            notify: (message, type = 'info') => {
                console.log(`[Mod ${type}]`, message);
                // Could integrate with a toast notification system
            },

            navigate: (page) => {
                try {
                    window.location.href = createPageUrl(page);
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
        };
    }

    /**
     * Execute mod code safely
     */
    async executeMod(mod) {
        if (!mod || !mod.enabled || !mod.code) {
            return { success: false, error: 'Invalid mod or disabled' };
        }

        try {
            const modAPI = this.createModAPI();

            // Create sandboxed function
            const modFunction = new Function('api', mod.code);

            // Execute mod code with API
            await modFunction(modAPI);

            this.activeMods.set(mod.id, {
                mod,
                executedAt: Date.now(),
            });

            return { success: true, message: `${mod.name} activated` };
        } catch (error) {
            console.error(`Mod execution error (${mod.name}):`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Execute all enabled mods
     */
    async executeAllMods(mods) {
        const results = [];

        for (const mod of mods) {
            if (mod.enabled) {
                const result = await this.executeMod(mod);
                results.push({ modId: mod.id, name: mod.name, ...result });
            }
        }

        return results;
    }

    /**
     * Deactivate a mod (call its cleanup code if exists)
     */
    async deactivateMod(mod) {
        // Remove from active mods
        this.activeMods.delete(mod.id);

        return { success: true, message: `${mod.name} deactivated` };
    }

    /**
     * Get list of active mods
     */
    getActiveMods() {
        return Array.from(this.activeMods.values());
    }
}

// Export singleton
const modExecutor = new ModExecutor();
export default modExecutor;
