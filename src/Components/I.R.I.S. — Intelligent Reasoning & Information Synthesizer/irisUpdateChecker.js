/**
 * irisUpdateChecker.js - IRIS Mod Update Checker
 */
import modAPIHandler from '../Games/modAPIHandler';

function normalizeVersionName(name = '') {
  return String(name).trim();
}

export async function checkModUpdates(modList = [], minecraftVersion, loader) {
  const results = [];

  for (const mod of modList) {
    try {
      const details = await modAPIHandler.getModDetails(mod.id, mod.source || 'modrinth');
      if (!details?.versions?.length) {
        results.push({
          id: mod.id,
          name: mod.name,
          status: 'unknown',
          currentVersion: mod.pinnedVersionName || mod.versionName || 'unknown',
          latestVersion: 'unknown'
        });
        continue;
      }

      const compatible = details.versions.find((version) => {
        const matchesGame = version.minecraftVersions?.includes(minecraftVersion);
        const matchesLoader = version.loaders?.includes(loader);
        return matchesGame && matchesLoader;
      }) || details.versions[0];

      const latestVersionName = normalizeVersionName(compatible.name || compatible.version_number || compatible.id);
      const currentVersion = normalizeVersionName(mod.pinnedVersionName || mod.versionName || 'unknown');

      const updateAvailable = currentVersion !== 'unknown' && latestVersionName !== currentVersion;

      results.push({
        id: mod.id,
        name: mod.name,
        status: updateAvailable ? 'update_available' : 'up_to_date',
        currentVersion,
        latestVersion: latestVersionName,
        source: mod.source || 'modrinth'
      });
    } catch (error) {
      results.push({
        id: mod.id,
        name: mod.name,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}

export default { checkModUpdates };
