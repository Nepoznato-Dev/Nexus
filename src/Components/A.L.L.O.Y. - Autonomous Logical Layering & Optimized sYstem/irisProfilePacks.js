/**
 * I.R.I.S. Profile Packs System
 * =============================
 * Bundle user preferences, layouts, and personalization into portable packs
 */

import {storage} from '../Storage/clientStorage.js';

export class ProfilePack {
  constructor(name, version = '1.0') {
    this.id = generateId();
    this.name = name;
    this.version = version;
    this.created = Date.now();
    this.modified = Date.now();
    this.description = '';
    this.tags = [];
    this.contents = {};
  }

  addSettings(settings) {
    this.contents.settings = settings;
    return this;
  }

  addLayout(layout) {
    this.contents.layout = layout;
    return this;
  }

  addWidgets(widgets) {
    this.contents.widgets = widgets;
    return this;
  }

  addBindings(bindings) {
    this.contents.bindings = bindings;
    return this;
  }

  addPersonality(personality) {
    this.contents.personality = personality;
    return this;
  }

  addCustomTheme(theme) {
    this.contents.customTheme = theme;
    return this;
  }

  addFeatureFlags(flags) {
    this.contents.featureFlags = flags;
    return this;
  }

  export() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      created: this.created,
      modified: this.modified,
      description: this.description,
      tags: this.tags,
      ...this.contents,
    };
  }
}

/**
 * Create a profile pack from current settings
 */
export async function createProfilePack(name, options = {}) {
  try {
    const {
      includeSettings = true,
      includeLayout = true,
      includeWidgets = true,
      includeBindings = true,
      includePersonality = true,
      includeCustomTheme = false,
      includeFeatureFlags = false,
    } = options;

    const pack = new ProfilePack(name);
    const settings = await storage.loadSettings();

    if (includeSettings) {
      pack.addSettings({
        theme: settings.appearance?.theme,
        fontSize: settings.appearance?.fontSize,
        language: settings.language,
        aiProvider: settings.aiProvider,
      });
    }

    if (includeLayout && settings.layout) {
      pack.addLayout(settings.layout);
    }

    if (includeWidgets && settings.widgets) {
      pack.addWidgets(settings.widgets);
    }

    if (includeBindings && settings.actionBindings) {
      pack.addBindings(settings.actionBindings);
    }

    if (includePersonality && settings.personality) {
      pack.addPersonality(settings.personality);
    }

    if (includeCustomTheme && settings.customTheme) {
      pack.addCustomTheme(settings.customTheme);
    }

    if (includeFeatureFlags && settings.featureFlags) {
      pack.addFeatureFlags(settings.featureFlags);
    }

    // Save pack
    const packs = await getAllProfilePacks();
    packs.push(pack.export());

    const newSettings = await storage.loadSettings();
    newSettings.profilePacks = packs;
    await storage.saveSettings(newSettings);

    return {success: true, packId: pack.id};
  } catch (error) {
    console.error('Error creating profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get all profile packs
 */
export async function getAllProfilePacks() {
  try {
    const settings = await storage.loadSettings();
    return settings?.profilePacks || [];
  } catch (error) {
    console.error('Error getting profile packs:', error);
    return [];
  }
}

/**
 * Get profile pack by ID
 */
export async function getProfilePack(packId) {
  try {
    const packs = await getAllProfilePacks();
    return packs.find((p) => p.id === packId) || null;
  } catch (error) {
    console.error('Error getting profile pack:', error);
    return null;
  }
}

/**
 * Apply profile pack
 */
export async function applyProfilePack(packId, options = {}) {
  try {
    const pack = await getProfilePack(packId);
    if (!pack) {
      return {success: false, error: 'Pack not found'};
    }

    const {
      overwrite = true,
      preserveMemory = true,
    } = options;

    const settings = await storage.loadSettings();

    if (pack.settings) {
      if (!overwrite) {
        settings.appearance = {...settings.appearance, ...pack.settings};
      } else {
        settings.appearance = pack.settings;
      }
    }

    if (pack.layout) {
      settings.layout = pack.layout;
    }

    if (pack.widgets) {
      settings.widgets = pack.widgets;
    }

    if (pack.bindings) {
      settings.actionBindings = pack.bindings;
    }

    if (pack.personality) {
      settings.personality = pack.personality;
    }

    if (pack.customTheme) {
      settings.customTheme = pack.customTheme;
    }

    if (pack.featureFlags && !preserveMemory) {
      settings.featureFlags = pack.featureFlags;
    }

    await storage.saveSettings(settings);

    return {success: true, applied: pack.name};
  } catch (error) {
    console.error('Error applying profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete profile pack
 */
export async function deleteProfilePack(packId) {
  try {
    const settings = await storage.loadSettings();
    settings.profilePacks = (settings.profilePacks || []).filter((p) => p.id !== packId);
    await storage.saveSettings(settings);

    return {success: true, deleted: packId};
  } catch (error) {
    console.error('Error deleting profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Rename profile pack
 */
export async function renameProfilePack(packId, newName) {
  try {
    const settings = await storage.loadSettings();
    const packs = settings.profilePacks || [];

    const pack = packs.find((p) => p.id === packId);
    if (!pack) {
      return {success: false, error: 'Pack not found'};
    }

    pack.name = newName;
    pack.modified = Date.now();

    await storage.saveSettings(settings);

    return {success: true, packId};
  } catch (error) {
    console.error('Error renaming profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Duplicate profile pack
 */
export async function duplicateProfilePack(packId, newName) {
  try {
    const pack = await getProfilePack(packId);
    if (!pack) {
      return {success: false, error: 'Pack not found'};
    }

    const newPack = {
      ...pack,
      id: generateId(),
      name: newName,
      created: Date.now(),
      modified: Date.now(),
    };

    const settings = await storage.loadSettings();
    if (!settings.profilePacks) {
      settings.profilePacks = [];
    }

    settings.profilePacks.push(newPack);
    await storage.saveSettings(settings);

    return {success: true, packId: newPack.id};
  } catch (error) {
    console.error('Error duplicating profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export profile pack as JSON
 */
export async function exportProfilePack(packId) {
  try {
    const pack = await getProfilePack(packId);
    if (!pack) {
      return {success: false, error: 'Pack not found'};
    }

    return {
      success: true,
      data: pack,
      filename: `profile_${pack.name.replace(/\s+/g, '_')}_${Date.now()}.json`,
    };
  } catch (error) {
    console.error('Error exporting profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import profile pack from JSON
 */
export async function importProfilePack(data) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.profilePacks) {
      settings.profilePacks = [];
    }

    const newPack = {
      ...data,
      id: generateId(),
      created: Date.now(),
      modified: Date.now(),
    };

    settings.profilePacks.push(newPack);
    await storage.saveSettings(settings);

    return {success: true, packId: newPack.id};
  } catch (error) {
    console.error('Error importing profile pack:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get pack metadata
 */
export async function getPackMetadata(packId) {
  try {
    const pack = await getProfilePack(packId);
    if (!pack) {
      return null;
    }

    const contents = [];
    if (pack.settings) contents.push('Settings');
    if (pack.layout) contents.push('Layout');
    if (pack.widgets) contents.push('Widgets');
    if (pack.bindings) contents.push('Bindings');
    if (pack.personality) contents.push('Personality');
    if (pack.customTheme) contents.push('Custom Theme');
    if (pack.featureFlags) contents.push('Feature Flags');

    return {
      id: pack.id,
      name: pack.name,
      version: pack.version,
      created: new Date(pack.created).toISOString(),
      modified: new Date(pack.modified).toISOString(),
      contents,
      description: pack.description,
      tags: pack.tags,
    };
  } catch (error) {
    console.error('Error getting pack metadata:', error);
    return null;
  }
}

function generateId() {
  return `pack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
