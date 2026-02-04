/**
 * AI Settings Manager - Context analysis & auto-configuration
 * Device detection, usage patterns, smart suggestions, schema validation, localStorage persistence
 */

/**
 * Device detection: mobile/low-power → FPS 30, disable particles; desktop → high FPS, enable effects.
 */
export const detectDevice = () => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return { deviceType: 'desktop', isMobile: false, isLowPower: false };
  }
  const ua = navigator.userAgent || '';
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const narrow = window.innerWidth != null && window.innerWidth < 768;
  const isMobile = mobile || (touch && narrow);
  const isLowPower = /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4);
  const deviceType = isLowPower ? 'low-power' : isMobile ? 'mobile' : 'desktop';
  return { deviceType, isMobile, isLowPower };
};

// Settings schema: type, range, options, defaults; localStorage persistence
const SETTINGS_SCHEMA = {
  ai: {
    provider: { type: 'string', options: ['none', 'openai', 'google', 'anthropic'], default: 'none' },
    model: { type: 'string', default: 'gpt-3.5-turbo' },
    showThinking: { type: 'boolean', default: false },
    autoRouting: { type: 'boolean', default: true },
    qualityThreshold: { type: 'number', min: 0, max: 10, default: 5 },
    openaiKey: { type: 'string', default: '' },
    googleKey: { type: 'string', default: '' },
  },
  performance: {
    fps: { type: 'number', options: [30, 60, 120], default: 60 },
    particleEffects: { type: 'boolean', default: true },
    animations: { type: 'boolean', default: true },
    lowPowerMode: { type: 'boolean', default: false },
  },
  privacy: {
    analytics: { type: 'boolean', default: false },
    dataSaving: { type: 'boolean', default: true },
    stealthMode: { type: 'boolean', default: true },
  },
  study: {
    pomodoroLength: { type: 'number', min: 5, max: 60, default: 25 },
    breakLength: { type: 'number', min: 1, max: 30, default: 5 },
    notifications: { type: 'boolean', default: true },
    soundEffects: { type: 'boolean', default: true },
  },
  ui: {
    theme: { type: 'string', options: ['dark', 'light', 'auto'], default: 'dark' },
    fontSize: { type: 'number', min: 12, max: 20, default: 14 },
    compactMode: { type: 'boolean', default: false },
    sidebarPosition: { type: 'string', options: ['left', 'right'], default: 'right' },
  },
};

/**
 * Get all current settings
 */
export const getAllSettings = () => {
  const settings = {};
  
  for (const [category, categorySettings] of Object.entries(SETTINGS_SCHEMA)) {
    settings[category] = {};
    for (const [key, schema] of Object.entries(categorySettings)) {
      const storageKey = `nexus_${category}_${key}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored !== null) {
        settings[category][key] = schema.type === 'boolean' ? stored === 'true' : 
                                   schema.type === 'number' ? parseFloat(stored) : 
                                   stored;
      } else {
        settings[category][key] = schema.default;
      }
    }
  }
  
  return settings;
};

/**
 * Get specific setting value
 */
export const getSetting = (category, key) => {
  const storageKey = `nexus_${category}_${key}`;
  const stored = localStorage.getItem(storageKey);
  const schema = SETTINGS_SCHEMA[category]?.[key];
  
  if (!schema) return null;
  
  if (stored !== null) {
    return schema.type === 'boolean' ? stored === 'true' : 
           schema.type === 'number' ? parseFloat(stored) : 
           stored;
  }
  
  return schema.default;
};

/**
 * Update setting value with validation
 */
export const updateSetting = (category, key, value) => {
  const schema = SETTINGS_SCHEMA[category]?.[key];
  
  if (!schema) {
    return { success: false, error: `Unknown setting: ${category}.${key}` };
  }
  
  // Validate type
  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    return { success: false, error: `${key} must be a boolean` };
  }
  
  if (schema.type === 'number' && typeof value !== 'number') {
    return { success: false, error: `${key} must be a number` };
  }
  
  // Validate range
  if (schema.type === 'number') {
    if (schema.min !== undefined && value < schema.min) {
      return { success: false, error: `${key} must be at least ${schema.min}` };
    }
    if (schema.max !== undefined && value > schema.max) {
      return { success: false, error: `${key} must be at most ${schema.max}` };
    }
  }
  
  // Validate options
  if (schema.options && !schema.options.includes(value)) {
    return { success: false, error: `${key} must be one of: ${schema.options.join(', ')}` };
  }
  
  // Save to localStorage
  const storageKey = `nexus_${category}_${key}`;
  localStorage.setItem(storageKey, value.toString());
  
  return { success: true, value, message: `Updated ${category}.${key} to ${value}` };
};

/**
 * Batch update multiple settings
 */
export const updateSettings = (settingsObject) => {
  const results = [];
  
  for (const [category, settings] of Object.entries(settingsObject)) {
    for (const [key, value] of Object.entries(settings)) {
      const result = updateSetting(category, key, value);
      results.push({ category, key, ...result });
    }
  }
  
  return results;
};

/**
 * Reset settings to defaults
 */
export const resetSettings = (category = null) => {
  if (category) {
    // Reset specific category
    const categorySettings = SETTINGS_SCHEMA[category];
    if (!categorySettings) {
      return { success: false, error: `Unknown category: ${category}` };
    }
    
    for (const key of Object.keys(categorySettings)) {
      const storageKey = `nexus_${category}_${key}`;
      localStorage.removeItem(storageKey);
    }
    
    return { success: true, message: `Reset ${category} settings to defaults` };
  } else {
    // Reset all settings
    for (const cat of Object.keys(SETTINGS_SCHEMA)) {
      for (const key of Object.keys(SETTINGS_SCHEMA[cat])) {
        const storageKey = `nexus_${cat}_${key}`;
        localStorage.removeItem(storageKey);
      }
    }
    
    return { success: true, message: 'Reset all settings to defaults' };
  }
};

/**
 * Usage pattern analysis + smart suggestions.
 * Each suggestion: setting path, value, reasoning, priority.
 * High → auto-apply; medium/low → return for confirmation.
 */
export const suggestSettings = (userContext = {}) => {
  const suggestions = [];
  const current = getAllSettings();
  const device = userContext.device ?? detectDevice();
  const deviceType = userContext.deviceType ?? device.deviceType;

  // Device: mobile / low-power → FPS 30, disable particles
  if (deviceType === 'mobile' || deviceType === 'low-power') {
    if (current.performance.fps > 30) {
      suggestions.push({
        category: 'performance',
        key: 'fps',
        value: 30,
        reason: 'Mobile/low-power device – reduce FPS for battery',
        priority: 'high',
      });
    }
    if (current.performance.particleEffects) {
      suggestions.push({
        category: 'performance',
        key: 'particleEffects',
        value: false,
        reason: 'Disabling particles on mobile for smoother performance',
        priority: 'high',
      });
    }
  }

  // Short sessions (<20 min) → reduce Pomodoro length
  if (userContext.sessionLength != null && userContext.sessionLength < 20) {
    if (current.study.pomodoroLength > 20) {
      suggestions.push({
        category: 'study',
        key: 'pomodoroLength',
        value: 15,
        reason: 'Short sessions – adjusting Pomodoro length',
        priority: 'medium',
      });
    }
  }

  // Late night (22:00–06:00) → auto dark theme
  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 6) {
    if (current.ui.theme !== 'dark') {
      suggestions.push({
        category: 'ui',
        key: 'theme',
        value: 'dark',
        reason: 'Late night – dark theme for comfort',
        priority: 'low',
      });
    }
  }

  // Frequent stealth use → enable stealth by default
  if (userContext.usesStealthMode && !current.privacy.stealthMode) {
    suggestions.push({
      category: 'privacy',
      key: 'stealthMode',
      value: true,
      reason: 'Frequent stealth use – enabling by default',
      priority: 'high',
    });
  }

  return suggestions;
};

/**
 * Auto-configure: apply high-priority suggestions; return medium/low for confirmation.
 */
export const autoConfigureSettings = (userContext = {}) => {
  const ctx = { ...userContext, device: userContext.device ?? detectDevice() };
  const suggestions = suggestSettings(ctx);
  const applied = [];

  for (const s of suggestions) {
    if (s.priority === 'high') {
      const result = updateSetting(s.category, s.key, s.value);
      if (result.success) applied.push({ ...s, applied: true });
    }
  }

  return {
    autoApplied: applied,
    suggestions: suggestions.filter((s) => s.priority !== 'high'),
  };
};

/**
 * Export settings profile
 */
export const exportSettings = () => {
  const settings = getAllSettings();
  const profile = {
    version: '1.0',
    timestamp: Date.now(),
    settings,
  };
  
  return JSON.stringify(profile, null, 2);
};

/**
 * Import settings profile
 */
export const importSettings = (profileJson) => {
  try {
    const profile = JSON.parse(profileJson);
    
    if (!profile.settings) {
      return { success: false, error: 'Invalid profile format' };
    }
    
    const results = updateSettings(profile.settings);
    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      return { 
        success: false, 
        error: `Failed to import ${failed.length} settings`, 
        details: failed 
      };
    }
    
    return { success: true, message: 'Settings imported successfully' };
  } catch (err) {
    return { success: false, error: `Import failed: ${err.message}` };
  }
};

export default {
  detectDevice,
  getAllSettings,
  getSetting,
  updateSetting,
  updateSettings,
  resetSettings,
  suggestSettings,
  autoConfigureSettings,
  exportSettings,
  importSettings,
  SETTINGS_SCHEMA,
};
