/**
 * modDataAccessor.js - Shared Minecraft Mod Data Access for S.P.A.R.K & I.R.I.S
 * 
 * Provides unified interface for both AI systems to read current mod state,
 * enabling collaborative diagnostics without manual log pasting.
 */

const LAST_GOOD_KEY = 'nexus_last_known_good_mods';
const SAFE_MODE_KEY = 'nexus_safe_mode_enabled';
const CACHE_KEY = 'nexus_mod_cache_metadata';

/**
 * Get all mods user has selected/installed in ModManager
 * @returns {Array} Array of mod objects with {id, slug, name, version, loader, minecraftVersion, etc.}
 */
export function getCurrentModList() {
    try {
        const storedMods = localStorage.getItem(LAST_GOOD_KEY);
        if (!storedMods) return [];

        const mods = JSON.parse(storedMods);
        return Array.isArray(mods) ? mods : [];
    } catch (error) {
        console.warn('[ModDataAccessor] Failed to parse mod list:', error);
        return [];
    }
}

/**
 * Get cached mod files from browser cache
 * @returns {Array} Array of cached mod metadata
 */
export function getCachedMods() {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) return [];

        const cache = JSON.parse(cachedData);
        return Array.isArray(cache) ? cache : [];
    } catch (error) {
        console.warn('[ModDataAccessor] Failed to parse cache metadata:', error);
        return [];
    }
}

/**
 * Check if safe mode is enabled (user has a known-good mod configuration)
 * @returns {boolean}
 */
export function isSafeModeEnabled() {
    return localStorage.getItem(SAFE_MODE_KEY) === 'true';
}

/**
 * Get comprehensive mod environment snapshot for AI diagnostics
 * @returns {Object} Complete mod environment data
 */
export function getModEnvironmentSnapshot() {
    const currentMods = getCurrentModList();
    const cachedMods = getCachedMods();
    const safeModeEnabled = isSafeModeEnabled();

    // Extract key metadata
    const modLoaders = [...new Set(currentMods.map(m => m.loader || m.modLoader).filter(Boolean))];
    const minecraftVersions = [...new Set(currentMods.map(m => m.minecraftVersion || m.gameVersion).filter(Boolean))];
    const modNames = currentMods.map(m => m.name || m.slug || m.id);

    // Detect potential issues
    const hasMultipleLoaders = modLoaders.length > 1;
    const hasMultipleMinecraftVersions = minecraftVersions.length > 1;
    const modCount = currentMods.length;

    return {
        timestamp: Date.now(),
        modCount,
        safeModeEnabled,
        modLoaders,
        minecraftVersions,
        mods: currentMods.map(mod => ({
            id: mod.id,
            slug: mod.slug,
            name: mod.name,
            version: mod.version,
            loader: mod.loader || mod.modLoader,
            minecraftVersion: mod.minecraftVersion || mod.gameVersion,
            source: mod.source, // 'modrinth' or 'curseforge'
            dependencies: mod.dependencies || []
        })),
        cachedModCount: cachedMods.length,
        potentialIssues: {
            hasMultipleLoaders,
            hasMultipleMinecraftVersions,
            noModsInstalled: modCount === 0
        },
        summary: generateModListSummary(currentMods, modLoaders, minecraftVersions)
    };
}

/**
 * Generate human-readable summary for AI context
 * @private
 */
function generateModListSummary(mods, loaders, versions) {
    if (mods.length === 0) {
        return 'No mods currently installed in ModManager.';
    }

    const loaderStr = loaders.length > 0 ? loaders.join(', ') : 'unknown loader';
    const versionStr = versions.length > 0 ? versions.join(', ') : 'unknown version';
    const modList = mods.slice(0, 10).map(m => `- ${m.name || m.slug}`).join('\n');
    const truncated = mods.length > 10 ? `\n...and ${mods.length - 10} more` : '';

    return `${mods.length} mods for Minecraft ${versionStr} (${loaderStr}):\n${modList}${truncated}`;
}

/**
 * Check if user's query is about Minecraft mods
 * @param {string} query - User's question
 * @returns {boolean}
 */
export function isMinecraftModQuery(query) {
    if (!query) return false;
    const lower = query.toLowerCase();
    return /minecraft|fabric|forge|neoforge|quilt|modpack|mods?|\.jar|crash|mixin|loader|curseforge|modrinth/.test(lower);
}

/**
 * Inject mod environment into AI prompt context
 * @param {string} userQuery - User's original question
 * @returns {string} Enhanced query with mod context
 */
export function injectModContextToQuery(userQuery) {
    if (!isMinecraftModQuery(userQuery)) {
        return userQuery; // Don't inject if not relevant
    }

    const snapshot = getModEnvironmentSnapshot();

    if (snapshot.modCount === 0) {
        return `${userQuery}\n\n[Mod Environment: User has no mods installed in ModManager yet]`;
    }

    return `${userQuery}\n\n[Mod Environment]:\n${snapshot.summary}\n\nPotential Issues:\n${snapshot.potentialIssues.hasMultipleLoaders ? '⚠️ Multiple mod loaders detected\n' : ''
        }${snapshot.potentialIssues.hasMultipleMinecraftVersions ? '⚠️ Multiple Minecraft versions detected\n' : ''
        }`;
}

export default {
    getCurrentModList,
    getCachedMods,
    isSafeModeEnabled,
    getModEnvironmentSnapshot,
    isMinecraftModQuery,
    injectModContextToQuery
};
