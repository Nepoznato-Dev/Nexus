/**
 * modProfiles.js - Pre-configured Mod Profiles & Bundles
 * 
 * Allows users to install curated mod packs:
 * - Performance Only (Sodium, Iris, Lithium, etc.)
 * - Vanilla Enhanced (Performance + QoL)
 * - Visual Enhanced (Performance + Visual mods)
 * - Full Features (Performance + Visual + QoL)
 */

export const MOD_PROFILES = {
  // ===== CURATED PROFILES =====
  
  performanceOnly: {
    id: 'performance-only',
    name: '⚡ Performance Only',
    description: 'Maximum FPS - essential performance mods only',
    color: '#FF6B6B',
    icon: '⚡',
    mods: [
      'sodium-fabric',
      'lithium',
      'phosphor',
      'starlight',
      'modernfix',
      'ferritecore',
      'iris'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~45MB',
    performanceGain: '+200-400% FPS',
    recommendation: 'For students with older laptops or Chromebooks'
  },

  vanillaEnhanced: {
    id: 'vanilla-enhanced',
    name: '✨ Vanilla Enhanced',
    description: 'Performance + Quality of Life (better HUD, tooltips, UI)',
    color: '#4ECDC4',
    icon: '✨',
    mods: [
      'sodium-fabric',
      'lithium',
      'phosphor',
      'iris',
      'architectury',
      'cloth-config',
      'appleskin',
      'jade',
      'autohud',
      'inventory-sorter',
      'inventory-full-notifier'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~65MB',
    performanceGain: '+150-300% FPS',
    recommendation: 'Best for most students - balance of FPS and usability'
  },

  visualEnhanced: {
    id: 'visual-enhanced',
    name: '🎨 Visual Enhanced',
    description: 'Performance + Visual improvements (animations, textures, particles)',
    color: '#A78BFA',
    icon: '🎨',
    mods: [
      'sodium-fabric',
      'lithium',
      'iris',
      'entity-model-features',
      'entity-texture-features',
      'notenoughanimations',
      'mobplayeranimator',
      'player-animation-lib',
      'appleskin',
      'jade',
      'inventory-particles',
      'packed-inventory',
      'architectury',
      'cloth-config'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~85MB',
    performanceGain: '+100-200% FPS',
    recommendation: 'Great visuals without sacrificing too much performance'
  },

  fullFeatures: {
    id: 'full-features',
    name: '🚀 Full Features',
    description: 'Performance + Visual + QoL (everything bundled)',
    color: '#00D4FF',
    icon: '🚀',
    mods: [
      'sodium-fabric',
      'lithium',
      'phosphor',
      'starlight',
      'modernfix',
      'ferritecore',
      'iris',
      'entity-model-features',
      'entity-texture-features',
      'notenoughanimations',
      'mobplayeranimator',
      'player-animation-lib',
      'appleskin',
      'jade',
      'autohud',
      'inventory-sorter',
      'inventory-full-notifier',
      'inventory-particles',
      'packed-inventory',
      'architectury',
      'cloth-config',
      'comforts',
      'convenient-nametags',
      'sophisticated-backpacks',
      'sophisticated-core'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~120MB',
    performanceGain: '+80-150% FPS',
    recommendation: 'For gaming laptops - feature-rich with solid performance'
  }
};

// ===== MOD DATABASE WITH MODRINTH IDS =====

export const MOD_DATABASE = {
  // Performance Mods
  'sodium-fabric': {
    name: 'Sodium',
    category: 'performance',
    description: 'Modern rendering engine - massive FPS improvement',
    modrinthId: 'AANobbMI',
    icon: '⚡',
    essential: true,
    performanceRating: 5,
    estimatedFpsGain: '+100-200%'
  },
  lithium: {
    name: 'Lithium',
    category: 'performance',
    description: 'Optimizes server & client logic',
    modrinthId: 'gvQqBUqZ',
    icon: '⚡',
    essential: true,
    performanceRating: 4,
    estimatedFpsGain: '+20-40%'
  },
  phosphor: {
    name: 'Phosphor',
    category: 'performance',
    description: 'Lighting engine optimization',
    modrinthId: 'hEOE4GEm',
    icon: '⚡',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: '+10-20%'
  },
  starlight: {
    name: 'Starlight',
    category: 'performance',
    description: 'Complete lighting engine rewrite (1.18+)',
    modrinthId: 'H8CaAYWC',
    icon: '⚡',
    essential: false,
    performanceRating: 4,
    estimatedFpsGain: '+15-30%'
  },
  modernfix: {
    name: 'ModernFix',
    category: 'performance',
    description: 'Various optimizations for modern Java',
    modrinthId: 'P7dR8mSH',
    icon: '⚡',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: '+10-25%'
  },
  ferritecore: {
    name: 'FerriteCore',
    category: 'performance',
    description: 'Memory usage optimization',
    modrinthId: 'uXXizFIs',
    icon: '⚡',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: 'Reduces lag spikes'
  },

  // Shader Support
  iris: {
    name: 'Iris Shaders',
    category: 'performance',
    description: 'Shader support with minimal performance impact',
    modrinthId: 'YL57xq9U',
    icon: '✨',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: 'Supports shaders'
  },

  // Visual Mods
  'entity-model-features': {
    name: 'Entity Model Features',
    category: 'visual',
    description: 'Custom entity models & features',
    modrinthId: 'Z9GyJpSs',
    icon: '🎨',
    essential: false,
    prerequisite: 'entity-texture-features'
  },
  'entity-texture-features': {
    name: 'Entity Texture Features',
    category: 'visual',
    description: 'Custom entity textures & animations',
    modrinthId: 'AnNiDVt7',
    icon: '🎨',
    essential: false
  },
  notenoughanimations: {
    name: 'Not Enough Animations',
    category: 'visual',
    description: 'Smooth player animations',
    modrinthId: 'MsxjXAYN',
    icon: '🎬',
    essential: false
  },
  mobplayeranimator: {
    name: 'Mob/Player Animator',
    category: 'visual',
    description: 'Enhanced mob & player animations',
    modrinthId: 'XXXX',
    icon: '🎬',
    essential: false
  },
  'player-animation-lib': {
    name: 'Player Animation Library',
    category: 'visual',
    description: 'Library for custom player animations',
    modrinthId: 'XXXX',
    icon: '📚',
    essential: false,
    prerequisite: 'architectury'
  },
  'inventory-particles': {
    name: 'Inventory Particles',
    category: 'visual',
    description: 'Particle effects in inventory',
    modrinthId: 'XXXX',
    icon: '✨',
    essential: false
  },

  // QoL Mods
  appleskin: {
    name: 'AppleSkin',
    category: 'qol',
    description: 'Better hunger/saturation HUD',
    modrinthId: 'aBaM1IS6',
    icon: '🍎',
    essential: false
  },
  jade: {
    name: 'Jade',
    category: 'qol',
    description: 'Waila replacement - block/entity info tooltips',
    modrinthId: '6EhYlNS5',
    icon: '💎',
    essential: false
  },
  autohud: {
    name: 'AutoHUD',
    category: 'qol',
    description: 'Auto-hide HUD elements when not needed',
    modrinthId: 'n7eMU2Mm',
    icon: '🎮',
    essential: false
  },
  'inventory-sorter': {
    name: 'Inventory Sorter',
    category: 'qol',
    description: 'One-click inventory sorting',
    modrinthId: 'XxWXtpHf',
    icon: '📦',
    essential: false
  },
  'inventory-full-notifier': {
    name: 'Inventory Full Notifier',
    category: 'qol',
    description: 'Alert when inventory is full',
    modrinthId: 'f3sHhhWQ',
    icon: '⚠️',
    essential: false
  },
  'packed-inventory': {
    name: 'Packed Inventory',
    category: 'qol',
    description: 'Compact inventory display',
    modrinthId: 'XXXX',
    icon: '📦',
    essential: false
  },
  comforts: {
    name: 'Comforts',
    category: 'qol',
    description: 'Sleeping bags & hammocks for easier sleeping',
    modrinthId: 'ynEUqJZC',
    icon: '🛏️',
    essential: false
  },
  'convenient-nametags': {
    name: 'Convenient Nametags',
    category: 'qol',
    description: 'Better nametag management',
    modrinthId: 'XXXX',
    icon: '🏷️',
    essential: false
  },
  'sophisticated-backpacks': {
    name: 'Sophisticated Backpacks',
    category: 'qol',
    description: 'Upgradeable backpacks',
    modrinthId: '82i8bzvV',
    icon: '🎒',
    essential: false,
    prerequisite: 'sophisticated-core'
  },
  'sophisticated-core': {
    name: 'Sophisticated Core',
    category: 'qol',
    description: 'Core library for sophisticated mods',
    modrinthId: 'XXXX',
    icon: '⚙️',
    essential: false
  },

  // Libraries/Core
  architectury: {
    name: 'Architectury API',
    category: 'library',
    description: 'Cross-platform mod API',
    modrinthId: 'lL0HkA0o',
    icon: '📚',
    essential: false
  },
  'cloth-config': {
    name: 'Cloth Config API',
    category: 'library',
    description: 'Config screen library',
    modrinthId: '9s6osm5g',
    icon: '📚',
    essential: false
  },
  'fabric-api': {
    name: 'Fabric API',
    category: 'library',
    description: 'Essential Fabric loader API',
    modrinthId: 'P7dR8mSH',
    icon: '📚',
    essential: true
  }
};

// ===== MOD PROFILE FUNCTIONS =====

/**
 * Get all mods for a profile with full details
 */
export function getProfileMods(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return null;

  return profile.mods.map(modId => ({
    ...MOD_DATABASE[modId],
    id: modId
  }));
}

/**
 * Get profile recommendations based on user's system
 */
export function getRecommendedProfile(isLowEnd = false, prefersVisuals = false) {
  if (isLowEnd) {
    return MOD_PROFILES.performanceOnly;
  } else if (prefersVisuals) {
    return MOD_PROFILES.visualEnhanced;
  } else {
    return MOD_PROFILES.vanillaEnhanced;
  }
}

/**
 * Calculate total profile size
 */
export function calculateProfileSize(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return '0MB';

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
    mobplayeranimator: 0.8,
    'player-animation-lib': 0.6,
    'inventory-particles': 0.5,
    appleskin: 0.8,
    jade: 1.2,
    autohud: 0.7,
    'inventory-sorter': 0.6,
    'inventory-full-notifier': 0.4,
    'packed-inventory': 0.5,
    comforts: 1.2,
    'convenient-nametags': 0.4,
    'sophisticated-backpacks': 2.0,
    'sophisticated-core': 1.5,
    architectury: 0.9,
    'cloth-config': 1.1,
    'fabric-api': 3.0
  };

  let total = 0;
  profile.mods.forEach(modId => {
    total += sizes[modId] || 0.5;
  });

  return `~${total.toFixed(0)}MB`;
}

/**
 * Check for mod conflicts in a profile
 */
export function checkProfileConflicts(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return [];

  const conflicts = [];
  
  // Check for known conflicts
  if (profile.mods.includes('sodium-fabric') && profile.mods.includes('optifine')) {
    conflicts.push({
      mods: ['Sodium', 'Optifine'],
      severity: 'high',
      message: 'Sodium and Optifine both modify rendering - use only one'
    });
  }

  return conflicts;
}

/**
 * Export profile as importable JSON
 */
export function exportProfile(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return null;

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: {
      ...profile,
      mods: profile.mods.map(modId => MOD_DATABASE[modId])
    }
  };
}

export default MOD_PROFILES;
/**
 * modProfiles.js - Pre-configured Mod Profiles & Bundles
 * 
 * Allows users to install curated mod packs:
 * - Performance Only (Sodium, Iris, Lithium, etc.)
 * - Vanilla Enhanced (Performance + QoL)
 * - Visual Enhanced (Performance + Visual mods)
 * - Full Features (Performance + Visual + QoL)
 */

export const MOD_PROFILES = {
  // ===== CURATED PROFILES =====
  
  performanceOnly: {
    id: 'performance-only',
    name: '⚡ Performance Only',
    description: 'Maximum FPS - essential performance mods only',
    color: '#FF6B6B',
    icon: '⚡',
    mods: [
      'sodium-fabric',
      'lithium',
      'phosphor',
      'starlight',
      'modernfix',
      'ferritecore',
      'iris'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~45MB',
    performanceGain: '+200-400% FPS',
    recommendation: 'For students with older laptops or Chromebooks'
  },

  vanillaEnhanced: {
    id: 'vanilla-enhanced',
    name: '✨ Vanilla Enhanced',
    description: 'Performance + Quality of Life (better HUD, tooltips, UI)',
    color: '#4ECDC4',
    icon: '✨',
    mods: [
      'sodium-fabric',
      'lithium',
      'phosphor',
      'iris',
      'architectury',
      'cloth-config',
      'appleskin',
      'jade',
      'autohud',
      'inventory-sorter',
      'inventory-full-notifier'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~65MB',
    performanceGain: '+150-300% FPS',
    recommendation: 'Best for most students - balance of FPS and usability'
  },

  visualEnhanced: {
    id: 'visual-enhanced',
    name: '🎨 Visual Enhanced',
    description: 'Performance + Visual improvements (animations, textures, particles)',
    color: '#A78BFA',
    icon: '🎨',
    mods: [
      'sodium-fabric',
      'lithium',
      'iris',
      'entity-model-features',
      'entity-texture-features',
      'notenoughanimations',
      'mobplayeranimator',
      'player-animation-lib',
      'appleskin',
      'jade',
      'inventory-particles',
      'packed-inventory',
      'architectury',
      'cloth-config'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~85MB',
    performanceGain: '+100-200% FPS',
    recommendation: 'Great visuals without sacrificing too much performance'
  },

  fullFeatures: {
    id: 'full-features',
    name: '🚀 Full Features',
    description: 'Performance + Visual + QoL (everything bundled)',
    color: '#00D4FF',
    icon: '🚀',
    mods: [
      'sodium-fabric',
      'lithium',
      'phosphor',
      'starlight',
      'modernfix',
      'ferritecore',
      'iris',
      'entity-model-features',
      'entity-texture-features',
      'notenoughanimations',
      'mobplayeranimator',
      'player-animation-lib',
      'appleskin',
      'jade',
      'autohud',
      'inventory-sorter',
      'inventory-full-notifier',
      'inventory-particles',
      'packed-inventory',
      'architectury',
      'cloth-config',
      'comforts',
      'convenient-nametags',
      'sophisticated-backpacks',
      'sophisticated-core'
    ],
    minecraftVersions: ['1.20.1', '1.20', '1.19.2'],
    loader: 'fabric',
    fileSize: '~120MB',
    performanceGain: '+80-150% FPS',
    recommendation: 'For gaming laptops - feature-rich with solid performance'
  }
};

// ===== MOD DATABASE WITH MODRINTH IDS =====

export const MOD_DATABASE = {
  // Performance Mods
  'sodium-fabric': {
    name: 'Sodium',
    category: 'performance',
    description: 'Modern rendering engine - massive FPS improvement',
    modrinthId: 'AANobbMI',
    icon: '⚡',
    essential: true,
    performanceRating: 5,
    estimatedFpsGain: '+100-200%'
  },
  lithium: {
    name: 'Lithium',
    category: 'performance',
    description: 'Optimizes server & client logic',
    modrinthId: 'gvQqBUqZ',
    icon: '⚡',
    essential: true,
    performanceRating: 4,
    estimatedFpsGain: '+20-40%'
  },
  phosphor: {
    name: 'Phosphor',
    category: 'performance',
    description: 'Lighting engine optimization',
    modrinthId: 'hEOE4GEm',
    icon: '⚡',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: '+10-20%'
  },
  starlight: {
    name: 'Starlight',
    category: 'performance',
    description: 'Complete lighting engine rewrite (1.18+)',
    modrinthId: 'H8CaAYWC',
    icon: '⚡',
    essential: false,
    performanceRating: 4,
    estimatedFpsGain: '+15-30%'
  },
  modernfix: {
    name: 'ModernFix',
    category: 'performance',
    description: 'Various optimizations for modern Java',
    modrinthId: 'P7dR8mSH',
    icon: '⚡',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: '+10-25%'
  },
  ferritecore: {
    name: 'FerriteCore',
    category: 'performance',
    description: 'Memory usage optimization',
    modrinthId: 'uXXizFIs',
    icon: '⚡',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: 'Reduces lag spikes'
  },

  // Shader Support
  iris: {
    name: 'Iris Shaders',
    category: 'performance',
    description: 'Shader support with minimal performance impact',
    modrinthId: 'YL57xq9U',
    icon: '✨',
    essential: false,
    performanceRating: 3,
    estimatedFpsGain: 'Supports shaders'
  },

  // Visual Mods
  'entity-model-features': {
    name: 'Entity Model Features',
    category: 'visual',
    description: 'Custom entity models & features',
    modrinthId: 'Z9GyJpSs',
    icon: '🎨',
    essential: false,
    prerequisite: 'entity-texture-features'
  },
  'entity-texture-features': {
    name: 'Entity Texture Features',
    category: 'visual',
    description: 'Custom entity textures & animations',
    modrinthId: 'AnNiDVt7',
    icon: '🎨',
    essential: false
  },
  notenoughanimations: {
    name: 'Not Enough Animations',
    category: 'visual',
    description: 'Smooth player animations',
    modrinthId: 'MsxjXAYN',
    icon: '🎬',
    essential: false
  },
  mobplayeranimator: {
    name: 'Mob/Player Animator',
    category: 'visual',
    description: 'Enhanced mob & player animations',
    modrinthId: 'XXXX',
    icon: '🎬',
    essential: false
  },
  'player-animation-lib': {
    name: 'Player Animation Library',
    category: 'visual',
    description: 'Library for custom player animations',
    modrinthId: 'XXXX',
    icon: '📚',
    essential: false,
    prerequisite: 'architectury'
  },
  'inventory-particles': {
    name: 'Inventory Particles',
    category: 'visual',
    description: 'Particle effects in inventory',
    modrinthId: 'XXXX',
    icon: '✨',
    essential: false
  },

  // QoL Mods
  appleskin: {
    name: 'AppleSkin',
    category: 'qol',
    description: 'Better hunger/saturation HUD',
    modrinthId: 'aBaM1IS6',
    icon: '🍎',
    essential: false
  },
  jade: {
    name: 'Jade',
    category: 'qol',
    description: 'Waila replacement - block/entity info tooltips',
    modrinthId: '6EhYlNS5',
    icon: '💎',
    essential: false
  },
  autohud: {
    name: 'AutoHUD',
    category: 'qol',
    description: 'Auto-hide HUD elements when not needed',
    modrinthId: 'n7eMU2Mm',
    icon: '🎮',
    essential: false
  },
  'inventory-sorter': {
    name: 'Inventory Sorter',
    category: 'qol',
    description: 'One-click inventory sorting',
    modrinthId: 'XxWXtpHf',
    icon: '📦',
    essential: false
  },
  'inventory-full-notifier': {
    name: 'Inventory Full Notifier',
    category: 'qol',
    description: 'Alert when inventory is full',
    modrinthId: 'f3sHhhWQ',
    icon: '⚠️',
    essential: false
  },
  'packed-inventory': {
    name: 'Packed Inventory',
    category: 'qol',
    description: 'Compact inventory display',
    modrinthId: 'XXXX',
    icon: '📦',
    essential: false
  },
  comforts: {
    name: 'Comforts',
    category: 'qol',
    description: 'Sleeping bags & hammocks for easier sleeping',
    modrinthId: 'ynEUqJZC',
    icon: '🛏️',
    essential: false
  },
  'convenient-nametags': {
    name: 'Convenient Nametags',
    category: 'qol',
    description: 'Better nametag management',
    modrinthId: 'XXXX',
    icon: '🏷️',
    essential: false
  },
  'sophisticated-backpacks': {
    name: 'Sophisticated Backpacks',
    category: 'qol',
    description: 'Upgradeable backpacks',
    modrinthId: '82i8bzvV',
    icon: '🎒',
    essential: false,
    prerequisite: 'sophisticated-core'
  },
  'sophisticated-core': {
    name: 'Sophisticated Core',
    category: 'qol',
    description: 'Core library for sophisticated mods',
    modrinthId: 'XXXX',
    icon: '⚙️',
    essential: false
  },

  // Libraries/Core
  architectury: {
    name: 'Architectury API',
    category: 'library',
    description: 'Cross-platform mod API',
    modrinthId: 'lL0HkA0o',
    icon: '📚',
    essential: false
  },
  'cloth-config': {
    name: 'Cloth Config API',
    category: 'library',
    description: 'Config screen library',
    modrinthId: '9s6osm5g',
    icon: '📚',
    essential: false
  },
  'fabric-api': {
    name: 'Fabric API',
    category: 'library',
    description: 'Essential Fabric loader API',
    modrinthId: 'P7dR8mSH',
    icon: '📚',
    essential: true
  }
};

// ===== MOD PROFILE FUNCTIONS =====

/**
 * Get all mods for a profile with full details
 */
export function getProfileMods(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return null;

  return profile.mods.map(modId => ({
    ...MOD_DATABASE[modId],
    id: modId
  }));
}

/**
 * Get profile recommendations based on user's system
 */
export function getRecommendedProfile(isLowEnd = false, prefersVisuals = false) {
  if (isLowEnd) {
    return MOD_PROFILES.performanceOnly;
  } else if (prefersVisuals) {
    return MOD_PROFILES.visualEnhanced;
  } else {
    return MOD_PROFILES.vanillaEnhanced;
  }
}

/**
 * Calculate total profile size
 */
export function calculateProfileSize(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return '0MB';

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
    mobplayeranimator: 0.8,
    'player-animation-lib': 0.6,
    'inventory-particles': 0.5,
    appleskin: 0.8,
    jade: 1.2,
    autohud: 0.7,
    'inventory-sorter': 0.6,
    'inventory-full-notifier': 0.4,
    'packed-inventory': 0.5,
    comforts: 1.2,
    'convenient-nametags': 0.4,
    'sophisticated-backpacks': 2.0,
    'sophisticated-core': 1.5,
    architectury: 0.9,
    'cloth-config': 1.1,
    'fabric-api': 3.0
  };

  let total = 0;
  profile.mods.forEach(modId => {
    total += sizes[modId] || 0.5;
  });

  return `~${total.toFixed(0)}MB`;
}

/**
 * Check for mod conflicts in a profile
 */
export function checkProfileConflicts(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return [];

  const conflicts = [];
  
  // Check for known conflicts
  if (profile.mods.includes('sodium-fabric') && profile.mods.includes('optifine')) {
    conflicts.push({
      mods: ['Sodium', 'Optifine'],
      severity: 'high',
      message: 'Sodium and Optifine both modify rendering - use only one'
    });
  }

  return conflicts;
}

/**
 * Export profile as importable JSON
 */
export function exportProfile(profileId) {
  const profile = MOD_PROFILES[profileId];
  if (!profile) return null;

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: {
      ...profile,
      mods: profile.mods.map(modId => MOD_DATABASE[modId])
    }
  };
}

export default MOD_PROFILES;
