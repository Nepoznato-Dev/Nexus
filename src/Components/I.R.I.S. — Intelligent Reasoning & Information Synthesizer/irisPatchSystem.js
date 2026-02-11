/**
 * I.R.I.S. Patch System
 * =====================
 * Track all changes as reversible patches (like Git diff)
 */

import {storage} from '../Storage/clientStorage.js';

export class PatchEntry {
  constructor(source, description, forward, reverse, metadata = {}) {
    this.id = generateId();
    this.timestamp = Date.now();
    this.source = source; // 'AI' | 'USER' | 'SYSTEM'
    this.description = description;
    this.forward = forward;
    this.reverse = reverse;
    this.metadata = metadata;
  }

  export() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      source: this.source,
      description: this.description,
      metadata: this.metadata,
    };
  }
}

/**
 * Create a settings patch
 */
export function createSettingsPatch(path, oldValue, newValue, source = 'USER') {
  return new PatchEntry(
    source,
    `Changed ${path} from ${oldValue} to ${newValue}`,
    async () => {
      const settings = await storage.loadSettings();
      setNestedValue(settings, path, newValue);
      await storage.saveSettings(settings);
    },
    async () => {
      const settings = await storage.loadSettings();
      setNestedValue(settings, path, oldValue);
      await storage.saveSettings(settings);
    },
    {type: 'settings', path, oldValue, newValue}
  );
}

/**
 * Create a widget patch
 */
export function createWidgetPatch(action, widgetId, oldState, newState, source = 'USER') {
  const description = {
    add: `Added widget: ${widgetId}`,
    remove: `Removed widget: ${widgetId}`,
    modify: `Modified widget: ${widgetId}`,
  }[action] || `Widget action: ${action}`;

  return new PatchEntry(
    source,
    description,
    async () => {
      const settings = await storage.loadSettings();
      if (!settings.widgets) settings.widgets = {};

      if (action === 'remove') {
        delete settings.widgets[widgetId];
      } else {
        settings.widgets[widgetId] = newState;
      }

      await storage.saveSettings(settings);
    },
    async () => {
      const settings = await storage.loadSettings();
      if (!settings.widgets) settings.widgets = {};

      if (action === 'add') {
        delete settings.widgets[widgetId];
      } else {
        settings.widgets[widgetId] = oldState;
      }

      await storage.saveSettings(settings);
    },
    {type: 'widget', action, widgetId}
  );
}

/**
 * Create a layout patch
 */
export function createLayoutPatch(oldLayout, newLayout, source = 'USER') {
  return new PatchEntry(
    source,
    'Changed layout',
    async () => {
      const settings = await storage.loadSettings();
      settings.layout = newLayout;
      await storage.saveSettings(settings);
    },
    async () => {
      const settings = await storage.loadSettings();
      settings.layout = oldLayout;
      await storage.saveSettings(settings);
    },
    {type: 'layout'}
  );
}

/**
 * Get patch history between timestamps
 */
export async function getPatchesBetween(startTime, endTime) {
  try {
    const settings = await storage.loadSettings();
    const patches = settings?.patchLog || [];

    return patches.filter((p) => p.timestamp >= startTime && p.timestamp <= endTime);
  } catch (error) {
    console.error('Error getting patch history:', error);
    return [];
  }
}

/**
 * Get patches by source
 */
export async function getPatchesBySource(source) {
  try {
    const settings = await storage.loadSettings();
    const patches = settings?.patchLog || [];

    return patches.filter((p) => p.source === source);
  } catch (error) {
    console.error('Error filtering patches:', error);
    return [];
  }
}

/**
 * Get patch description
 */
export async function getPatchDescription(patchId) {
  try {
    const settings = await storage.loadSettings();
    const patches = settings?.patchLog || [];
    const patch = patches.find((p) => p.id === patchId);

    return patch?.description || null;
  } catch (error) {
    console.error('Error getting patch description:', error);
    return null;
  }
}

/**
 * Log a patch
 */
export async function logPatch(patch) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.patchLog) {
      settings.patchLog = [];
    }

    settings.patchLog.push(patch.export());

    // Keep last 1000 patches
    if (settings.patchLog.length > 1000) {
      settings.patchLog = settings.patchLog.slice(-1000);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging patch:', error);
  }
}

/**
 * Export patch log as JSON
 */
export async function exportPatchLog(startTime, endTime) {
  try {
    const patches = await getPatchesBetween(startTime, endTime);

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      startTime,
      endTime,
      patchCount: patches.length,
      patches,
    };
  } catch (error) {
    console.error('Error exporting patch log:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import patch log
 */
export async function importPatchLog(patchLog) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.patchLog) {
      settings.patchLog = [];
    }

    const applied = [];
    const skipped = [];

    for (const patch of patchLog.patches) {
      // Check for duplicates
      if (settings.patchLog.find((p) => p.id === patch.id)) {
        skipped.push(patch.id);
      } else {
        settings.patchLog.push(patch);
        applied.push(patch.id);
      }
    }

    await storage.saveSettings(settings);

    return {applied, skipped};
  } catch (error) {
    console.error('Error importing patch log:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Diff states between two timestamps
 */
export async function diffStates(timestamp1, timestamp2) {
  try {
    const patches1 = await getPatchesBetween(timestamp1, timestamp1);
    const patches2 = await getPatchesBetween(timestamp2, timestamp2);

    const changes = {
      added: patches2.filter((p) => !patches1.find((p1) => p1.id === p.id)),
      removed: patches1.filter((p) => !patches2.find((p2) => p2.id === p.id)),
    };

    return {success: true, changes};
  } catch (error) {
    console.error('Error diffing states:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get all patches (paginated)
 */
export async function getAllPatches(page = 0, pageSize = 50) {
  try {
    const settings = await storage.loadSettings();
    const allPatches = settings?.patchLog || [];

    const start = page * pageSize;
    const end = start + pageSize;

    return {
      patches: allPatches.slice(start, end),
      total: allPatches.length,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error getting patches:', error);
    return {patches: [], total: 0, error: error.message};
  }
}

/**
 * Clear patch log
 */
export async function clearPatchLog() {
  try {
    const settings = await storage.loadSettings();
    settings.patchLog = [];
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error clearing patch log:', error);
    return {success: false, error: error.message};
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function generateId() {
  return `patch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set nested value in object
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Get nested value in object
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!(key in current)) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}
