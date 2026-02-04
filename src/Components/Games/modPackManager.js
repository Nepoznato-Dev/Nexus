/**
 * modPackManager.js - Import/Export Minecraft mod packs
 * 
 * Features:
 * - Export mods as shareable packs (.modpack JSON files)
 * - Import existing mod packs
 * - Create custom profiles
 * - Generate installation guides
 */

class ModPackManager {
  constructor() {
    this.customPacks = this.loadCustomPacks();
    console.log('[IRIS] ModPackManager initialized');
  }

  /**
   * Load saved custom packs from localStorage
   */
  loadCustomPacks() {
    try {
      const saved = localStorage.getItem('nexus_custom_modpacks');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('[IRIS] Failed to load custom packs:', error);
      return {};
    }
  }

  /**
   * Save custom packs to localStorage
   */
  saveCustomPacks() {
    try {
      localStorage.setItem('nexus_custom_modpacks', JSON.stringify(this.customPacks));
      console.log('[IRIS] Custom packs saved');
    } catch (error) {
      console.error('[IRIS] Failed to save custom packs:', error);
    }
  }

  /**
   * Create a custom mod pack from selected mods
   */
  createModPack(packData) {
    const {
      name,
      description,
      minecraftVersion,
      loader,
      mods,
      author = 'Custom Pack'
    } = packData;

    if (!name || !mods || mods.length === 0) {
      throw new Error('Pack must have name and mods');
    }

    const pack = {
      id: `custom_${Date.now()}`,
      name,
      description,
      minecraftVersion,
      loader,
      mods,
      author,
      createdAt: new Date().toISOString(),
      version: '1.0',
      size: this.calculatePackSize(mods)
    };

    this.customPacks[pack.id] = pack;
    this.saveCustomPacks();

    console.log(`[IRIS] Created custom pack: ${name}`);
    return pack;
  }

  /**
   * Export pack as JSON (downloadable file)
   */
  exportPackAsJson(packId) {
    const pack = this.customPacks[packId];
    if (!pack) throw new Error('Pack not found');

    const json = JSON.stringify(pack, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    
    return {
      blob,
      filename: `${pack.name.replace(/\s+/g, '-').toLowerCase()}-${pack.version}.modpack.json`
    };
  }

  /**
   * Export pack as ZIP with all mod JARs
   * Note: This would require backend support for actual JAR downloads
   */
  async exportPackAsZip(packId, modAPIHandler) {
    const pack = this.customPacks[packId];
    if (!pack) throw new Error('Pack not found');

    console.log(`[IRIS] Preparing ZIP export for ${pack.name}`);

    const packInfo = {
      packName: pack.name,
      packVersion: pack.version,
      packAuthor: pack.author,
      minecraftVersion: pack.minecraftVersion,
      loader: pack.loader,
      modCount: pack.mods.length,
      totalSize: pack.size,
      exportedAt: new Date().toISOString(),
      description: pack.description,
      instructions: this.generateInstallationGuide(pack)
    };

    // In production, this would create a ZIP archive
    // For now, return instructions for manual installation
    return {
      packInfo,
      manualInstall: true,
      instructions: `
# Installation Instructions

1. Download all ${pack.mods.length} mods from the list
2. Create a folder named '${pack.name}'
3. Place all .jar files in that folder
4. Copy to your .minecraft/mods directory
5. Enjoy!

## Mods to download:
${pack.mods.map((mod, i) => `${i + 1}. ${mod.name}`).join('\n')}

## Performance Impact:
Estimated FPS change: ${pack.estimatedFpsGain || 'N/A'}
`
    };
  }

  /**
   * Import pack from JSON file
   */
  importPackFromJson(jsonData) {
    try {
      const pack = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Validate pack structure
      if (!pack.name || !pack.mods || !Array.isArray(pack.mods)) {
        throw new Error('Invalid pack format');
      }

      // Add to custom packs
      const packId = `imported_${Date.now()}`;
      pack.id = packId;
      pack.importedAt = new Date().toISOString();

      this.customPacks[packId] = pack;
      this.saveCustomPacks();

      console.log(`[IRIS] Imported pack: ${pack.name}`);
      return pack;
    } catch (error) {
      console.error('[IRIS] Import failed:', error);
      throw new Error(`Failed to import pack: ${error.message}`);
    }
  }

  /**
   * Calculate pack size
   */
  calculatePackSize(mods) {
    const sizes = {
      'sodium-fabric': 3.2,
      lithium: 0.8,
      phosphor: 1.2,
      starlight: 1.5,
      modernfix: 1.0,
      ferritecore: 0.5,
      iris: 2.5,
      'entity-model-features': 2.0,
      'entity-texture-features': 1.8,
      notenoughanimations: 1.5,
      appleskin: 0.8,
      jade: 1.2,
      autohud: 0.7,
      'inventory-sorter': 0.6,
      'sophisticated-backpacks': 2.0
    };

    let total = 0;
    mods.forEach(mod => {
      const id = typeof mod === 'string' ? mod : mod.id;
      total += sizes[id] || 1.0;
    });

    return `${total.toFixed(1)}MB`;
  }

  /**
   * Generate installation guide for pack
   */
  generateInstallationGuide(pack) {
    const guide = {
      title: `Installation Guide: ${pack.name}`,
      minecraftVersion: pack.minecraftVersion,
      loader: pack.loader,
      steps: [
        {
          number: 1,
          title: `Install ${pack.loader} Mod Loader`,
          description: `Download and install ${pack.loader} for Minecraft ${pack.minecraftVersion}`,
          url: pack.loader === 'fabric' 
            ? 'https://fabricmc.net/use/' 
            : 'https://files.minecraftforge.net/'
        },
        {
          number: 2,
          title: 'Create Mods Folder',
          description: 'Navigate to .minecraft/mods (create if it doesn\'t exist)',
          path: '.minecraft/mods'
        },
        {
          number: 3,
          title: `Download ${pack.mods.length} Mods`,
          description: 'Use Nexus Mod Manager to download each mod',
          modCount: pack.mods.length
        },
        {
          number: 4,
          title: 'Copy Mod Files',
          description: 'Move all downloaded .jar files to the mods folder'
        },
        {
          number: 5,
          title: 'Launch Minecraft',
          description: `Select the ${pack.loader} profile and launch`,
          tips: [
            'Wait for mods to load on first launch',
            'Check launcher output for errors',
            'If crash, remove last mod and try again'
          ]
        }
      ]
    };

    return guide;
  }

  /**
   * Get all packs (built-in + custom)
   */
  getAllPacks(builtInProfiles) {
    const packs = {};

    // Add built-in profiles as packs
    Object.entries(builtInProfiles).forEach(([id, profile]) => {
      packs[id] = {
        ...profile,
        isBuiltIn: true,
        type: 'profile'
      };
    });

    // Add custom packs
    Object.entries(this.customPacks).forEach(([id, pack]) => {
      packs[id] = {
        ...pack,
        isCustom: true,
        type: 'custom'
      };
    });

    return packs;
  }

  /**
   * Delete custom pack
   */
  deleteCustomPack(packId) {
    if (this.customPacks[packId]) {
      delete this.customPacks[packId];
      this.saveCustomPacks();
      console.log(`[IRIS] Deleted custom pack: ${packId}`);
      return true;
    }
    return false;
  }

  /**
   * Generate pack statistics
   */
  getPackStats(pack) {
    return {
      modCount: pack.mods.length,
      size: pack.size || this.calculatePackSize(pack.mods),
      minecraftVersion: pack.minecraftVersion,
      loader: pack.loader,
      categories: this.categorizePackMods(pack.mods),
      estimatedFpsGain: this.estimatePerformanceGain(pack.mods),
      description: pack.description || 'Custom mod pack'
    };
  }

  /**
   * Categorize mods in pack
   */
  categorizePackMods(mods) {
    const categories = {
      performance: 0,
      visual: 0,
      qol: 0,
      library: 0
    };

    const categoryMap = {
      'sodium-fabric': 'performance',
      lithium: 'performance',
      iris: 'performance',
      'entity-model-features': 'visual',
      notenoughanimations: 'visual',
      appleskin: 'qol',
      jade: 'qol',
      'sophisticated-backpacks': 'qol',
      'fabric-api': 'library',
      architectury: 'library'
    };

    mods.forEach(mod => {
      const id = typeof mod === 'string' ? mod : mod.id;
      const category = categoryMap[id] || 'qol';
      categories[category]++;
    });

    return categories;
  }

  /**
   * Estimate FPS gain from mods
   */
  estimatePerformanceGain(mods) {
    let fpsGain = 0;

    const gainMap = {
      'sodium-fabric': 150,
      lithium: 20,
      phosphor: 15,
      starlight: 20,
      modernfix: 15,
      ferritecore: 0 // Helps with lag spikes, not pure FPS
    };

    mods.forEach(mod => {
      const id = typeof mod === 'string' ? mod : mod.id;
      fpsGain += gainMap[id] || 0;
    });

    if (fpsGain === 0) return 'No improvement';
    if (fpsGain < 30) return `+${fpsGain}% FPS`;
    if (fpsGain < 100) return `+${fpsGain}% FPS`;
    return `+${fpsGain}% FPS (Major improvement!)`;
  }
}

const modPackManager = new ModPackManager();
export default modPackManager;
/**
 * modPackManager.js - Import/Export Minecraft mod packs
 * 
 * Features:
 * - Export mods as shareable packs (.modpack JSON files)
 * - Import existing mod packs
 * - Create custom profiles
 * - Generate installation guides
 */

class ModPackManager {
  constructor() {
    this.customPacks = this.loadCustomPacks();
    console.log('[IRIS] ModPackManager initialized');
  }

  /**
   * Load saved custom packs from localStorage
   */
  loadCustomPacks() {
    try {
      const saved = localStorage.getItem('nexus_custom_modpacks');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('[IRIS] Failed to load custom packs:', error);
      return {};
    }
  }

  /**
   * Save custom packs to localStorage
   */
  saveCustomPacks() {
    try {
      localStorage.setItem('nexus_custom_modpacks', JSON.stringify(this.customPacks));
      console.log('[IRIS] Custom packs saved');
    } catch (error) {
      console.error('[IRIS] Failed to save custom packs:', error);
    }
  }

  /**
   * Create a custom mod pack from selected mods
   */
  createModPack(packData) {
    const {
      name,
      description,
      minecraftVersion,
      loader,
      mods,
      author = 'Custom Pack'
    } = packData;

    if (!name || !mods || mods.length === 0) {
      throw new Error('Pack must have name and mods');
    }

    const pack = {
      id: `custom_${Date.now()}`,
      name,
      description,
      minecraftVersion,
      loader,
      mods,
      author,
      createdAt: new Date().toISOString(),
      version: '1.0',
      size: this.calculatePackSize(mods)
    };

    this.customPacks[pack.id] = pack;
    this.saveCustomPacks();

    console.log(`[IRIS] Created custom pack: ${name}`);
    return pack;
  }

  /**
   * Export pack as JSON (downloadable file)
   */
  exportPackAsJson(packId) {
    const pack = this.customPacks[packId];
    if (!pack) throw new Error('Pack not found');

    const json = JSON.stringify(pack, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    
    return {
      blob,
      filename: `${pack.name.replace(/\s+/g, '-').toLowerCase()}-${pack.version}.modpack.json`
    };
  }

  /**
   * Export pack as ZIP with all mod JARs
   * Note: This would require backend support for actual JAR downloads
   */
  async exportPackAsZip(packId, modAPIHandler) {
    const pack = this.customPacks[packId];
    if (!pack) throw new Error('Pack not found');

    console.log(`[IRIS] Preparing ZIP export for ${pack.name}`);

    const packInfo = {
      packName: pack.name,
      packVersion: pack.version,
      packAuthor: pack.author,
      minecraftVersion: pack.minecraftVersion,
      loader: pack.loader,
      modCount: pack.mods.length,
      totalSize: pack.size,
      exportedAt: new Date().toISOString(),
      description: pack.description,
      instructions: this.generateInstallationGuide(pack)
    };

    // In production, this would create a ZIP archive
    // For now, return instructions for manual installation
    return {
      packInfo,
      manualInstall: true,
      instructions: `
# Installation Instructions

1. Download all ${pack.mods.length} mods from the list
2. Create a folder named '${pack.name}'
3. Place all .jar files in that folder
4. Copy to your .minecraft/mods directory
5. Enjoy!

## Mods to download:
${pack.mods.map((mod, i) => `${i + 1}. ${mod.name}`).join('\n')}

## Performance Impact:
Estimated FPS change: ${pack.estimatedFpsGain || 'N/A'}
`
    };
  }

  /**
   * Import pack from JSON file
   */
  importPackFromJson(jsonData) {
    try {
      const pack = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Validate pack structure
      if (!pack.name || !pack.mods || !Array.isArray(pack.mods)) {
        throw new Error('Invalid pack format');
      }

      // Add to custom packs
      const packId = `imported_${Date.now()}`;
      pack.id = packId;
      pack.importedAt = new Date().toISOString();

      this.customPacks[packId] = pack;
      this.saveCustomPacks();

      console.log(`[IRIS] Imported pack: ${pack.name}`);
      return pack;
    } catch (error) {
      console.error('[IRIS] Import failed:', error);
      throw new Error(`Failed to import pack: ${error.message}`);
    }
  }

  /**
   * Calculate pack size
   */
  calculatePackSize(mods) {
    const sizes = {
      'sodium-fabric': 3.2,
      lithium: 0.8,
      phosphor: 1.2,
      starlight: 1.5,
      modernfix: 1.0,
      ferritecore: 0.5,
      iris: 2.5,
      'entity-model-features': 2.0,
      'entity-texture-features': 1.8,
      notenoughanimations: 1.5,
      appleskin: 0.8,
      jade: 1.2,
      autohud: 0.7,
      'inventory-sorter': 0.6,
      'sophisticated-backpacks': 2.0
    };

    let total = 0;
    mods.forEach(mod => {
      const id = typeof mod === 'string' ? mod : mod.id;
      total += sizes[id] || 1.0;
    });

    return `${total.toFixed(1)}MB`;
  }

  /**
   * Generate installation guide for pack
   */
  generateInstallationGuide(pack) {
    const guide = {
      title: `Installation Guide: ${pack.name}`,
      minecraftVersion: pack.minecraftVersion,
      loader: pack.loader,
      steps: [
        {
          number: 1,
          title: `Install ${pack.loader} Mod Loader`,
          description: `Download and install ${pack.loader} for Minecraft ${pack.minecraftVersion}`,
          url: pack.loader === 'fabric' 
            ? 'https://fabricmc.net/use/' 
            : 'https://files.minecraftforge.net/'
        },
        {
          number: 2,
          title: 'Create Mods Folder',
          description: 'Navigate to .minecraft/mods (create if it doesn\'t exist)',
          path: '.minecraft/mods'
        },
        {
          number: 3,
          title: `Download ${pack.mods.length} Mods`,
          description: 'Use Nexus Mod Manager to download each mod',
          modCount: pack.mods.length
        },
        {
          number: 4,
          title: 'Copy Mod Files',
          description: 'Move all downloaded .jar files to the mods folder'
        },
        {
          number: 5,
          title: 'Launch Minecraft',
          description: `Select the ${pack.loader} profile and launch`,
          tips: [
            'Wait for mods to load on first launch',
            'Check launcher output for errors',
            'If crash, remove last mod and try again'
          ]
        }
      ]
    };

    return guide;
  }

  /**
   * Get all packs (built-in + custom)
   */
  getAllPacks(builtInProfiles) {
    const packs = {};

    // Add built-in profiles as packs
    Object.entries(builtInProfiles).forEach(([id, profile]) => {
      packs[id] = {
        ...profile,
        isBuiltIn: true,
        type: 'profile'
      };
    });

    // Add custom packs
    Object.entries(this.customPacks).forEach(([id, pack]) => {
      packs[id] = {
        ...pack,
        isCustom: true,
        type: 'custom'
      };
    });

    return packs;
  }

  /**
   * Delete custom pack
   */
  deleteCustomPack(packId) {
    if (this.customPacks[packId]) {
      delete this.customPacks[packId];
      this.saveCustomPacks();
      console.log(`[IRIS] Deleted custom pack: ${packId}`);
      return true;
    }
    return false;
  }

  /**
   * Generate pack statistics
   */
  getPackStats(pack) {
    return {
      modCount: pack.mods.length,
      size: pack.size || this.calculatePackSize(pack.mods),
      minecraftVersion: pack.minecraftVersion,
      loader: pack.loader,
      categories: this.categorizePackMods(pack.mods),
      estimatedFpsGain: this.estimatePerformanceGain(pack.mods),
      description: pack.description || 'Custom mod pack'
    };
  }

  /**
   * Categorize mods in pack
   */
  categorizePackMods(mods) {
    const categories = {
      performance: 0,
      visual: 0,
      qol: 0,
      library: 0
    };

    const categoryMap = {
      'sodium-fabric': 'performance',
      lithium: 'performance',
      iris: 'performance',
      'entity-model-features': 'visual',
      notenoughanimations: 'visual',
      appleskin: 'qol',
      jade: 'qol',
      'sophisticated-backpacks': 'qol',
      'fabric-api': 'library',
      architectury: 'library'
    };

    mods.forEach(mod => {
      const id = typeof mod === 'string' ? mod : mod.id;
      const category = categoryMap[id] || 'qol';
      categories[category]++;
    });

    return categories;
  }

  /**
   * Estimate FPS gain from mods
   */
  estimatePerformanceGain(mods) {
    let fpsGain = 0;

    const gainMap = {
      'sodium-fabric': 150,
      lithium: 20,
      phosphor: 15,
      starlight: 20,
      modernfix: 15,
      ferritecore: 0 // Helps with lag spikes, not pure FPS
    };

    mods.forEach(mod => {
      const id = typeof mod === 'string' ? mod : mod.id;
      fpsGain += gainMap[id] || 0;
    });

    if (fpsGain === 0) return 'No improvement';
    if (fpsGain < 30) return `+${fpsGain}% FPS`;
    if (fpsGain < 100) return `+${fpsGain}% FPS`;
    return `+${fpsGain}% FPS (Major improvement!)`;
  }
}

const modPackManager = new ModPackManager();
export default modPackManager;
