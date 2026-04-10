/**
 * nexusModStorage.js - Nexus Mods Management System
 * 
 * Handles:
 * - Installing/Uninstalling mods
 * - Managing mod metadata
 * - Mod dependency resolution
 * - Mod enable/disable
 * - Mod data persistence via localStorage + IndexedDB
 */

class NexusModStorage {
    constructor() {
        this.dbName = 'NexusModsDB';
        this.storeName = 'mods';
        this.db = null;
        this.mods = [];
    }

    /**
     * Initialize IndexedDB for mod storage
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.loadMods();
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('enabled', 'enabled', { unique: false });
                    store.createIndex('installDate', 'installDate', { unique: false });
                }
            };
        });
    }

    /**
     * Load all mods from storage
     */
    loadMods() {
        const cached = localStorage.getItem('nexus_mods_cache');
        if (cached) {
            try {
                this.mods = JSON.parse(cached);
            } catch (e) {
                console.error('Failed to load cached mods:', e);
                this.mods = [];
            }
        }
    }

    /**
     * Save mods to persistent storage
     */
    saveMods() {
        localStorage.setItem('nexus_mods_cache', JSON.stringify(this.mods));

        // Also save to IndexedDB if available
        if (this.db) {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            this.mods.forEach(mod => {
                store.put(mod);
            });
        }
    }

    /**
     * Install a mod from a file or URL
     * @param {Object} modData - Mod metadata and code
     * @returns {Object} Installation result
     */
    async installMod(modData) {
        // Validate mod structure
        if (!modData.id || !modData.name || !modData.code) {
            return { success: false, error: 'Invalid mod format' };
        }

        // Check if already installed
        const exists = this.mods.find(m => m.id === modData.id);
        if (exists) {
            return { success: false, error: 'Mod already installed' };
        }

        // Create mod object
        const mod = {
            id: modData.id,
            name: modData.name,
            author: modData.author || 'Unknown',
            version: modData.version || '1.0.0',
            description: modData.description || '',
            code: modData.code,
            enabled: true,
            installDate: Date.now(),
            dependencies: modData.dependencies || [],
            icon: modData.icon || null,
            permissions: modData.permissions || [],
            visual: modData.visual || null,
        };

        // Check dependencies
        const missingDeps = this.checkDependencies(mod.dependencies);
        if (missingDeps.length > 0) {
            return {
                success: false,
                error: `Missing dependencies: ${missingDeps.join(', ')}`,
                missingDeps
            };
        }

        // Add mod
        this.mods.push(mod);
        this.saveMods();

        return {
            success: true,
            mod,
            message: `${mod.name} v${mod.version} installed successfully`
        };
    }

    /**
     * Uninstall a mod
     */
    uninstallMod(modId) {
        const modIndex = this.mods.findIndex(m => m.id === modId);
        if (modIndex === -1) {
            return { success: false, error: 'Mod not found' };
        }

        // Check if other mods depend on this
        const dependents = this.mods.filter(m =>
            m.dependencies && m.dependencies.includes(modId)
        );

        if (dependents.length > 0) {
            return {
                success: false,
                error: `Other mods depend on this: ${dependents.map(m => m.name).join(', ')}`,
                dependents
            };
        }

        const mod = this.mods[modIndex];
        this.mods.splice(modIndex, 1);
        this.saveMods();

        return {
            success: true,
            message: `${mod.name} uninstalled`
        };
    }

    /**
     * Enable/disable a mod
     */
    toggleMod(modId) {
        const mod = this.mods.find(m => m.id === modId);
        if (!mod) {
            return { success: false, error: 'Mod not found' };
        }

        mod.enabled = !mod.enabled;
        this.saveMods();

        return {
            success: true,
            enabled: mod.enabled,
            message: mod.enabled ? `${mod.name} enabled` : `${mod.name} disabled`
        };
    }

    /**
     * Check if dependencies are met
     */
    checkDependencies(dependencies) {
        if (!dependencies || dependencies.length === 0) return [];

        return dependencies.filter(depId => {
            return !this.mods.find(m => m.id === depId && m.enabled);
        });
    }

    /**
     * Get all installed mods
     */
    getAllMods() {
        return this.mods;
    }

    /**
     * Get enabled mods
     */
    getEnabledMods() {
        return this.mods.filter(m => m.enabled);
    }

    /**
     * Get a specific mod
     */
    getMod(modId) {
        return this.mods.find(m => m.id === modId);
    }

    /**
     * Export a mod as JSON (for sharing)
     */
    exportMod(modId) {
        const mod = this.mods.find(m => m.id === modId);
        if (!mod) return null;

        return {
            id: mod.id,
            name: mod.name,
            author: mod.author,
            version: mod.version,
            description: mod.description,
            code: mod.code,
            dependencies: mod.dependencies,
            icon: mod.icon,
            permissions: mod.permissions,
            visual: mod.visual || null,
        };
    }

    /**
     * Export all mods as ZIP-like JSON
     */
    exportAllMods() {
        return {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            mods: this.mods.map(mod => this.exportMod(mod.id)),
            count: this.mods.length,
        };
    }

    /**
     * Import mods from JSON
     */
    async importMods(modsData) {
        if (!modsData.mods || !Array.isArray(modsData.mods)) {
            return { success: false, error: 'Invalid import format' };
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };

        for (const modData of modsData.mods) {
            const result = await this.installMod(modData);
            if (result.success) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push({ mod: modData.name, error: result.error });
            }
        }

        return { success: true, ...results };
    }

    /**
     * Get mod size and data usage
     */
    getStorageUsage() {
        let totalSize = 0;
        this.mods.forEach(mod => {
            // Estimate size: code length + metadata
            totalSize += (mod.code?.length || 0) + JSON.stringify(mod).length;
        });

        return {
            totalBytes: totalSize,
            totalMB: (totalSize / 1024 / 1024).toFixed(2),
            modCount: this.mods.length,
        };
    }
}

// Export singleton instance
const nexusModStorage = new NexusModStorage();
export default nexusModStorage;
