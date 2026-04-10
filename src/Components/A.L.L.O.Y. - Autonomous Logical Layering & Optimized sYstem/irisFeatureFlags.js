/**
 * I.R.I.S. Feature Flags System
 * =============================
 * Toggle AI features on/off at runtime without redeploying
 * Persist settings to IndexedDB and allow admin control
 */

import { storage } from '../Storage/clientStorage.js';

/**
 * Default feature flag states
 * All features enabled by default unless explicitly disabled
 */
export const DEFAULT_FEATURE_FLAGS = {
  // Core I.R.I.S. features
  COMMON_SENSE_ENABLED: true,
  PROACTIVE_SUGGESTIONS_ENABLED: true,
  SELF_AWARENESS_ENABLED: true,
  SEARCH_SOLVER_ENABLED: true,
  DASHBOARD_INTEGRATION_ENABLED: true,
  PERSONALITY_ENHANCER_ENABLED: true,
  MEMORY_SYSTEM_ENABLED: true,

  // Safety features
  AUTO_SAVE_ENABLED: true,
  THINKING_DISPLAY_ENABLED: false,
  UNDO_REDO_ENABLED: true,
  SNAPSHOTS_ENABLED: true,

  // Performance features
  RESPONSE_CACHING_ENABLED: true,
  REAL_TIME_ANALYSIS_ENABLED: true,

  // UI features
  DARK_MODE_ENABLED: true,
  CUSTOM_OVERLAYS_ENABLED: true,
  COMMAND_PALETTE_ENABLED: true,

  // Experimental features
  EXPERIMENTAL_FEATURES_ENABLED: false,
};

/**
 * Feature flag metadata: description, risk level, category
 */
export const FEATURE_DESCRIPTIONS = {
  COMMON_SENSE_ENABLED: {
    name: 'Common Sense Engine',
    description: 'Detect false dilemmas and find non-obvious solutions',
    category: 'core',
    riskLevel: 'low',
  },
  PROACTIVE_SUGGESTIONS_ENABLED: {
    name: 'Proactive Suggestions',
    description: 'Anticipate user needs and suggest next steps',
    category: 'core',
    riskLevel: 'low',
  },
  SELF_AWARENESS_ENABLED: {
    name: 'Self-Awareness System',
    description: 'Score confidence and admit uncertainty',
    category: 'core',
    riskLevel: 'low',
  },
  SEARCH_SOLVER_ENABLED: {
    name: 'Search & Problem Solver',
    description: 'Internet search and math problem solving',
    category: 'core',
    riskLevel: 'medium',
  },
  DASHBOARD_INTEGRATION_ENABLED: {
    name: 'Dashboard Integration',
    description: 'AI can read and modify dashboard settings',
    category: 'core',
    riskLevel: 'high',
  },
  PERSONALITY_ENHANCER_ENABLED: {
    name: 'Personality Enhancer',
    description: 'Add emojis, kaomojis, and natural language',
    category: 'enhancement',
    riskLevel: 'low',
  },
  MEMORY_SYSTEM_ENABLED: {
    name: 'Memory System',
    description: 'Store conversations and user profile',
    category: 'core',
    riskLevel: 'medium',
  },
  AUTO_SAVE_ENABLED: {
    name: 'Auto-Save',
    description: 'Automatically save changes to IndexedDB',
    category: 'safety',
    riskLevel: 'low',
  },
  THINKING_DISPLAY_ENABLED: {
    name: 'Show Thinking Process',
    description: 'Display I.R.I.S. internal reasoning',
    category: 'enhancement',
    riskLevel: 'low',
  },
  UNDO_REDO_ENABLED: {
    name: 'Undo/Redo System',
    description: 'Undo and redo user and AI actions',
    category: 'safety',
    riskLevel: 'low',
  },
  SNAPSHOTS_ENABLED: {
    name: 'Snapshots',
    description: 'Save and restore app state snapshots',
    category: 'safety',
    riskLevel: 'low',
  },
  RESPONSE_CACHING_ENABLED: {
    name: 'Response Caching',
    description: 'Cache API responses to reduce redundant calls',
    category: 'performance',
    riskLevel: 'low',
  },
  REAL_TIME_ANALYSIS_ENABLED: {
    name: 'Real-Time Analysis',
    description: 'Analyze user input in real-time',
    category: 'performance',
    riskLevel: 'medium',
  },
  DARK_MODE_ENABLED: {
    name: 'Dark Mode',
    description: 'Support dark mode theme',
    category: 'ui',
    riskLevel: 'low',
  },
  CUSTOM_OVERLAYS_ENABLED: {
    name: 'Custom Overlays',
    description: 'User-created UI overlays',
    category: 'ui',
    riskLevel: 'medium',
  },
  COMMAND_PALETTE_ENABLED: {
    name: 'Command Palette',
    description: 'Universal command bar (Ctrl/⌘K)',
    category: 'ui',
    riskLevel: 'low',
  },
  EXPERIMENTAL_FEATURES_ENABLED: {
    name: 'Experimental Features',
    description: 'Enable experimental and in-development features',
    category: 'experimental',
    riskLevel: 'high',
  },
};

/**
 * Get current flag value
 * Falls back to default if not found in storage
 */
export async function isFeatureEnabled(flagName) {
  // Validate flag name
  if (!(flagName in DEFAULT_FEATURE_FLAGS)) {
    console.warn(`Unknown feature flag: ${flagName}`);
    return DEFAULT_FEATURE_FLAGS[flagName] ?? false;
  }

  try {
    const settings = await storage.loadSettings();
    const flags = settings?.featureFlags || {};

    // Return user override or default
    return flagName in flags ? flags[flagName] : DEFAULT_FEATURE_FLAGS[flagName];
  } catch (error) {
    console.error(`Error loading feature flag ${flagName}:`, error);
    return DEFAULT_FEATURE_FLAGS[flagName];
  }
}

/**
 * Set feature flag value
 * Persists to storage and logs change
 */
export async function setFeatureFlag(flagName, enabled) {
  if (!(flagName in DEFAULT_FEATURE_FLAGS)) {
    throw new Error(`Unknown feature flag: ${flagName}`);
  }

  try {
    const settings = await storage.loadSettings();
    const oldValue = await isFeatureEnabled(flagName);

    // Update flag
    if (!settings.featureFlags) {
      settings.featureFlags = {};
    }
    settings.featureFlags[flagName] = enabled;

    // Save to storage
    await storage.saveSettings(settings);

    // Log change to audit trail
    await logFlagChange({
      flagName,
      oldValue,
      newValue: enabled,
      timestamp: Date.now(),
      source: 'user', // Could be 'system', 'admin', etc
    });

    // Notify listeners
    notifyFlagChange(flagName, enabled, oldValue);

    return {
      success: true,
      flagName,
      previous: oldValue,
      current: enabled,
    };
  } catch (error) {
    console.error(`Error setting feature flag ${flagName}:`, error);
    return {
      success: false,
      error: error.message,
      flagName,
    };
  }
}

/**
 * Get all feature flags with current values
 */
export async function getAllFeatureFlags() {
  const result = {};

  for (const flagName of Object.keys(DEFAULT_FEATURE_FLAGS)) {
    result[flagName] = await isFeatureEnabled(flagName);
  }

  return result;
}

/**
 * Get feature flags grouped by category
 */
export async function getFlagsByCategory(category) {
  const allFlags = await getAllFeatureFlags();
  const result = {};

  for (const [flagName, enabled] of Object.entries(allFlags)) {
    const desc = FEATURE_DESCRIPTIONS[flagName];
    if (desc?.category === category) {
      result[flagName] = enabled;
    }
  }

  return result;
}

/**
 * Get all flags in a specific risk level
 */
export async function getFlagsByRiskLevel(riskLevel) {
  const allFlags = await getAllFeatureFlags();
  const result = {};

  for (const [flagName, enabled] of Object.entries(allFlags)) {
    const desc = FEATURE_DESCRIPTIONS[flagName];
    if (desc?.riskLevel === riskLevel) {
      result[flagName] = enabled;
    }
  }

  return result;
}

/**
 * Reset all flags to defaults
 */
export async function resetFlagsToDefaults() {
  try {
    const settings = await storage.loadSettings();
    settings.featureFlags = {};
    await storage.saveSettings(settings);

    // Log reset
    await logFlagChange({
      flagName: '*',
      action: 'resetToDefaults',
      timestamp: Date.now(),
      source: 'user',
    });

    // Notify all listeners
    Object.keys(DEFAULT_FEATURE_FLAGS).forEach((flagName) => {
      notifyFlagChange(flagName, DEFAULT_FEATURE_FLAGS[flagName], null);
    });

    return {
      success: true,
      restored: Object.keys(DEFAULT_FEATURE_FLAGS),
    };
  } catch (error) {
    console.error('Error resetting feature flags:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Disable multiple flags at once (useful for safe mode)
 */
export async function disableFlags(flagNames) {
  const results = [];

  for (const flagName of flagNames) {
    const result = await setFeatureFlag(flagName, false);
    results.push(result);
  }

  return {success: results.every((r) => r.success), results};
}

/**
 * Enable multiple flags at once
 */
export async function enableFlags(flagNames) {
  const results = [];

  for (const flagName of flagNames) {
    const result = await setFeatureFlag(flagName, true);
    results.push(result);
  }

  return {success: results.every((r) => r.success), results};
}

/**
 * Get feature flag metadata
 */
export function getFeatureDescription(flagName) {
  return FEATURE_DESCRIPTIONS[flagName] || null;
}

/**
 * Get all feature descriptions
 */
export function getAllFeatureDescriptions() {
  return { ...FEATURE_DESCRIPTIONS };
}

/**
 * Check if feature is available (enabled and not in safe mode)
 */
export async function isFeatureAvailable(flagName, options = {}) {
  const enabled = await isFeatureEnabled(flagName);
  const inSafeMode = options.safeMode ?? false;

  if (inSafeMode) {
    // In safe mode, only allow safety-related features
    const desc = FEATURE_DESCRIPTIONS[flagName];
    return enabled && desc?.category === 'safety';
  }

  return enabled;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Internal flag change listeners
 */
const flagChangeListeners = {};

/**
 * Subscribe to flag changes
 */
export function onFlagChange(flagName, callback) {
  if (!flagChangeListeners[flagName]) {
    flagChangeListeners[flagName] = [];
  }
  flagChangeListeners[flagName].push(callback);

  // Return unsubscribe function
  return () => {
    flagChangeListeners[flagName] = flagChangeListeners[flagName].filter(
      (cb) => cb !== callback
    );
  };
}

/**
 * Notify listeners of flag change
 */
function notifyFlagChange(flagName, newValue, oldValue) {
  const listeners = flagChangeListeners[flagName] || [];
  listeners.forEach((callback) => {
    try {
      callback({flagName, newValue, oldValue});
    } catch (error) {
      console.error(`Error in flag change listener for ${flagName}:`, error);
    }
  });
}

/**
 * Log flag changes to audit trail
 */
async function logFlagChange(changeData) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.auditLog) {
      settings.auditLog = [];
    }

    settings.auditLog.push({
      type: 'flagChange',
      ...changeData,
    });

    // Keep only last 1000 audit entries
    if (settings.auditLog.length > 1000) {
      settings.auditLog = settings.auditLog.slice(-1000);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging flag change:', error);
  }
}

/**
 * Get audit trail for feature flags
 */
export async function getFeatureFlagAuditTrail(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const auditLog = (settings?.auditLog || []).filter(
      (entry) => entry.type === 'flagChange'
    );

    return auditLog.slice(-limit);
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
}

/**
 * Export feature flag configuration
 */
export async function exportFlagConfiguration() {
  const allFlags = await getAllFeatureFlags();
  const auditTrail = await getFeatureFlagAuditTrail();

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    flags: allFlags,
    descriptions: FEATURE_DESCRIPTIONS,
    auditTrail,
  };
}

/**
 * Import feature flag configuration
 */
export async function importFlagConfiguration(config) {
  try {
    const settings = await storage.loadSettings();
    settings.featureFlags = config.flags || {};
    await storage.saveSettings(settings);

    return {success: true, imported: Object.keys(config.flags)};
  } catch (error) {
    console.error('Error importing flag configuration:', error);
    return {success: false, error: error.message};
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize feature flag system
 * Called on app startup
 */
export async function initializeFeatureFlags() {
  try {
    const flags = await getAllFeatureFlags();

    console.log('✅ Feature flags loaded:', flags);

    // Log initialization
    const settings = await storage.loadSettings();
    if (!settings.featureFlagsInitialized) {
      settings.featureFlagsInitialized = Date.now();
      await storage.saveSettings(settings);
    }

    return {success: true, flags};
  } catch (error) {
    console.error('❌ Error initializing feature flags:', error);
    return {success: false, error: error.message};
  }
}
