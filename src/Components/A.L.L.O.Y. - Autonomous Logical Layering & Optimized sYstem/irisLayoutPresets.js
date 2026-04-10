/**
 * I.R.I.S. Layout Presets System
 * ==============================
 * Save and load dashboard layout configurations
 */

import {storage} from '../Storage/clientStorage.js';

export class LayoutPreset {
  constructor(name, layout) {
    this.id = generateId();
    this.name = name;
    this.layout = layout;
    this.created = Date.now();
    this.modified = Date.now();
    this.usage = 0;
    this.tags = [];
    this.description = '';
  }

  export() {
    return {
      id: this.id,
      name: this.name,
      layout: this.layout,
      created: this.created,
      modified: this.modified,
      usage: this.usage,
      tags: this.tags,
      description: this.description,
    };
  }
}

/**
 * Save current layout as preset
 */
export async function saveLayoutAsPreset(name, options = {}) {
  try {
    const {tags = [], description = ''} = options;

    const settings = await storage.loadSettings();

    const preset = new LayoutPreset(name, settings.layout);
    preset.tags = tags;
    preset.description = description;

    // Save preset
    if (!settings.layoutPresets) {
      settings.layoutPresets = [];
    }

    settings.layoutPresets.push(preset.export());
    await storage.saveSettings(settings);

    return {success: true, presetId: preset.id};
  } catch (error) {
    console.error('Error saving layout preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get all layout presets
 */
export async function getAllLayoutPresets() {
  try {
    const settings = await storage.loadSettings();
    return settings?.layoutPresets || [];
  } catch (error) {
    console.error('Error getting layout presets:', error);
    return [];
  }
}

/**
 * Get preset by ID
 */
export async function getLayoutPreset(presetId) {
  try {
    const presets = await getAllLayoutPresets();
    return presets.find((p) => p.id === presetId) || null;
  } catch (error) {
    console.error('Error getting layout preset:', error);
    return null;
  }
}

/**
 * Apply layout preset
 */
export async function applyLayoutPreset(presetId) {
  try {
    const preset = await getLayoutPreset(presetId);

    if (!preset) {
      return {success: false, error: 'Preset not found'};
    }

    const settings = await storage.loadSettings();
    settings.layout = preset.layout;

    // Update usage
    preset.usage = (preset.usage || 0) + 1;
    preset.lastUsed = Date.now();

    await storage.saveSettings(settings);

    return {success: true, applied: preset.name};
  } catch (error) {
    console.error('Error applying layout preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete layout preset
 */
export async function deleteLayoutPreset(presetId) {
  try {
    const settings = await storage.loadSettings();
    settings.layoutPresets = (settings.layoutPresets || []).filter((p) => p.id !== presetId);
    await storage.saveSettings(settings);

    return {success: true, deleted: presetId};
  } catch (error) {
    console.error('Error deleting layout preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Rename layout preset
 */
export async function renameLayoutPreset(presetId, newName) {
  try {
    const settings = await storage.loadSettings();
    const presets = settings.layoutPresets || [];

    const preset = presets.find((p) => p.id === presetId);
    if (!preset) {
      return {success: false, error: 'Preset not found'};
    }

    preset.name = newName;
    preset.modified = Date.now();

    await storage.saveSettings(settings);

    return {success: true, presetId};
  } catch (error) {
    console.error('Error renaming layout preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Update preset description and tags
 */
export async function updatePresetMetadata(presetId, metadata) {
  try {
    const settings = await storage.loadSettings();
    const presets = settings.layoutPresets || [];

    const preset = presets.find((p) => p.id === presetId);
    if (!preset) {
      return {success: false, error: 'Preset not found'};
    }

    if (metadata.description !== undefined) {
      preset.description = metadata.description;
    }

    if (metadata.tags !== undefined) {
      preset.tags = metadata.tags;
    }

    preset.modified = Date.now();

    await storage.saveSettings(settings);

    return {success: true, presetId};
  } catch (error) {
    console.error('Error updating preset metadata:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get presets by tag
 */
export async function getPresetsByTag(tag) {
  try {
    const presets = await getAllLayoutPresets();
    return presets.filter((p) => p.tags?.includes(tag) || false);
  } catch (error) {
    console.error('Error getting presets by tag:', error);
    return [];
  }
}

/**
 * Duplicate preset
 */
export async function duplicateLayoutPreset(presetId, newName) {
  try {
    const preset = await getLayoutPreset(presetId);

    if (!preset) {
      return {success: false, error: 'Preset not found'};
    }

    const newPreset = new LayoutPreset(newName, preset.layout);
    newPreset.tags = [...preset.tags];
    newPreset.description = `Copy of: ${preset.name}`;

    const settings = await storage.loadSettings();
    (settings.layoutPresets || []).push(newPreset.export());
    await storage.saveSettings(settings);

    return {success: true, presetId: newPreset.id};
  } catch (error) {
    console.error('Error duplicating preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export layout preset
 */
export async function exportLayoutPreset(presetId) {
  try {
    const preset = await getLayoutPreset(presetId);

    if (!preset) {
      return {success: false, error: 'Preset not found'};
    }

    return {
      success: true,
      data: preset,
      filename: `layout_${preset.name.replace(/\s+/g, '_')}_${Date.now()}.json`,
    };
  } catch (error) {
    console.error('Error exporting preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import layout preset
 */
export async function importLayoutPreset(data) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.layoutPresets) {
      settings.layoutPresets = [];
    }

    const newPreset = {...data, id: generateId(), created: Date.now()};

    settings.layoutPresets.push(newPreset);
    await storage.saveSettings(settings);

    return {success: true, presetId: newPreset.id};
  } catch (error) {
    console.error('Error importing preset:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get preset statistics
 */
export async function getPresetStats() {
  try {
    const presets = await getAllLayoutPresets();

    const stats = {
      totalPresets: presets.length,
      mostUsed: presets.reduce((prev, current) =>
        (prev.usage || 0) > (current.usage || 0) ? prev : current
      ),
      tags: new Set(presets.flatMap((p) => p.tags || [])),
      totalUsage: presets.reduce((sum, p) => sum + (p.usage || 0), 0),
    };

    stats.tags = Array.from(stats.tags);

    return stats;
  } catch (error) {
    console.error('Error getting preset stats:', error);
    return {totalPresets: 0};
  }
}

/**
 * Clear unused presets
 */
export async function clearUnusedPresets(daysUnused = 30) {
  try {
    const settings = await storage.loadSettings();
    const presets = settings.layoutPresets || [];

    const cutoffTime = Date.now() - daysUnused * 24 * 60 * 60 * 1000;

    const unused = presets.filter((p) => (p.lastUsed || p.created) < cutoffTime);

    settings.layoutPresets = presets.filter((p) => (p.lastUsed || p.created) >= cutoffTime);

    await storage.saveSettings(settings);

    return {success: true, clearedCount: unused.length};
  } catch (error) {
    console.error('Error clearing unused presets:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
