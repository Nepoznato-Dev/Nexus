/**
 * I.R.I.S. Import System
 * ======================
 * Import user data from various sources and formats
 */

import {storage} from '../Storage/clientStorage.js';

/**
 * Import settings from JSON
 */
export async function importSettingsJSON(data, options = {}) {
  try {
    const {merge = true, validateOnly = false} = options;

    // Validate structure
    const validation = validateImportData(data);
    if (!validation.valid) {
      return {success: false, error: validation.errors.join(', ')};
    }

    if (validateOnly) {
      return {success: true, validated: true};
    }

    const currentSettings = await storage.loadSettings();

    let importedSettings;

    if (merge) {
      // Deep merge
      importedSettings = deepMerge(currentSettings, data.settings);
    } else {
      // Replace
      importedSettings = data.settings;
    }

    await storage.saveSettings(importedSettings);

    return {
      success: true,
      imported: true,
      merged: merge,
      itemsImported: Object.keys(data.settings).length,
    };
  } catch (error) {
    console.error('Error importing settings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import profile pack
 */
export async function importProfilePack(packData, options = {}) {
  try {
    const {applyAfterImport = false} = options;

    const profilePacks = await import('./irisProfilePacks.js');
    const result = await profilePacks.importProfilePack(packData);

    if (result.success && applyAfterImport) {
      const applyResult = await profilePacks.applyProfilePack(result.packId);
      return {
        ...result,
        applied: applyResult.success,
      };
    }

    return result;
  } catch (error) {
    console.error('Error importing profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import action bindings
 */
export async function importActionBindings(bindingsData, options = {}) {
  try {
    const {merge = true} = options;

    const settings = await storage.loadSettings();

    if (merge && settings.actionBindings) {
      // Merge, avoiding duplicates
      const existing = new Map(settings.actionBindings.map((b) => [b.id, b]));

      for (const binding of bindingsData) {
        if (!existing.has(binding.id)) {
          settings.actionBindings.push(binding);
        }
      }
    } else {
      settings.actionBindings = bindingsData;
    }

    await storage.saveSettings(settings);

    return {success: true, imported: bindingsData.length};
  } catch (error) {
    console.error('Error importing bindings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import feature flags configuration
 */
export async function importFeatureFlags(flagsData, options = {}) {
  try {
    const {merge = true} = options;

    const settings = await storage.loadSettings();

    if (merge && settings.featureFlags) {
      settings.featureFlags = {...settings.featureFlags, ...flagsData};
    } else {
      settings.featureFlags = flagsData;
    }

    await storage.saveSettings(settings);

    return {success: true, imported: Object.keys(flagsData).length};
  } catch (error) {
    console.error('Error importing feature flags:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import layout configuration
 */
export async function importLayout(layoutData, options = {}) {
  try {
    const {overwrite = true} = options;

    const settings = await storage.loadSettings();

    if (!overwrite && settings.layout) {
      // Merge layout elements
      settings.layout = {
        ...settings.layout,
        ...layoutData,
      };
    } else {
      settings.layout = layoutData;
    }

    await storage.saveSettings(settings);

    return {success: true, imported: true};
  } catch (error) {
    console.error('Error importing layout:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Validate import data
 */
export function validateImportData(data) {
  const errors = [];

  // Check structure
  if (!data) {
    errors.push('Data is null or undefined');
  }

  if (!data.version) {
    errors.push('Missing version field');
  }

  if (!data.exportDate) {
    errors.push('Missing exportDate field');
  }

  if (!data.settings && !data.packs && !data.bindings) {
    errors.push('No recognized data sections');
  }

  // Validate settings if present
  if (data.settings && typeof data.settings !== 'object') {
    errors.push('Settings must be an object');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get import preview (what would be imported)
 */
export async function getImportPreview(data) {
  try {
    const preview = {
      version: data.version,
      exportDate: data.exportDate,
      items: [],
    };

    if (data.settings) {
      preview.items.push({
        name: 'Settings',
        itemCount: Object.keys(data.settings).length,
      });
    }

    if (data.widgets) {
      preview.items.push({
        name: 'Widgets',
        itemCount: Object.keys(data.widgets).length,
      });
    }

    if (data.bindings) {
      preview.items.push({
        name: 'Bindings',
        itemCount: data.bindings.length,
      });
    }

    if (data.featureFlags) {
      preview.items.push({
        name: 'Feature Flags',
        itemCount: Object.keys(data.featureFlags).length,
      });
    }

    return {success: true, preview};
  } catch (error) {
    console.error('Error getting import preview:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Batch import multiple files
 */
export async function batchImport(files, options = {}) {
  try {
    const {merge = true} = options;

    const results = [];

    for (const file of files) {
      const result = await importSettingsJSON(file, {merge});
      results.push(result);
    }

    const summary = {
      totalFiles: files.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    };

    return summary;
  } catch (error) {
    console.error('Error in batch import:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import with conflict detection
 */
export async function importWithConflictDetection(data, options = {}) {
  try {
    const current = await storage.loadSettings();
    const conflicts = detectImportConflicts(current, data.settings);

    if (conflicts.length > 0 && !options.forceOverwrite) {
      return {
        success: false,
        hasConflicts: true,
        conflicts,
        message: `Found ${conflicts.length} conflicts during import`,
      };
    }

    return await importSettingsJSON(data, options);
  } catch (error) {
    console.error('Error importing with conflict detection:', error);
    return {success: false, error: error.message};
  }
}

/**
 * List available imports (from localStorage history)
 */
export async function getImportHistory(limit = 10) {
  try {
    const settings = await storage.loadSettings();
    const history = settings?.importHistory || [];
    return history.slice(-limit);
  } catch (error) {
    console.error('Error getting import history:', error);
    return [];
  }
}

/**
 * Internal: Deep merge objects
 */
function deepMerge(target, source) {
  const result = {...target};

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Internal: Detect conflicts between import and current data
 */
function detectImportConflicts(current, imported) {
  const conflicts = [];

  for (const key in imported) {
    if (current.hasOwnProperty(key)) {
      const currentValue = JSON.stringify(current[key]);
      const importedValue = JSON.stringify(imported[key]);

      if (currentValue !== importedValue) {
        conflicts.push({
          key,
          currentValue: current[key],
          importedValue: imported[key],
        });
      }
    }
  }

  return conflicts;
}
