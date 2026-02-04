/**
 * AI Command Parser - Allows AI to understand and execute setting commands
 * Natural language processing for settings control
 */

import {
  getSetting,
  updateSetting,
  updateSettings,
  resetSettings,
  getAllSettings,
  suggestSettings,
  autoConfigureSettings,
  exportSettings,
  importSettings,
} from './aiSettingsManager.js';

/**
 * Command patterns for natural language processing
 */
const COMMAND_PATTERNS = {
  // Toggle commands
  enable: /^(enable|turn on|activate|start)\s+(.+)/i,
  disable: /^(disable|turn off|deactivate|stop)\s+(.+)/i,
  toggle: /^(toggle|switch)\s+(.+)/i,
  
  // Set commands
  set: /^(set|change|update)\s+(.+?)\s+to\s+(.+)/i,
  increase: /^(increase|raise|boost)\s+(.+?)(\s+by\s+(\d+))?/i,
  decrease: /^(decrease|lower|reduce)\s+(.+?)(\s+by\s+(\d+))?/i,
  
  // Query commands
  show: /^(show|display|what is|what's)\s+(.+)/i,
  list: /^(list|show all)\s+(.+)\s+settings$/i,

  // Optimization commands
  optimize: /^optimize\s+for\s+(.+)/i,
  suggest: /^suggest\s+settings/i,
  auto: /^auto[-\s]configure/i,

  // Profile commands
  export: /^export\s+settings/i,
  import: /^import\s+settings/i,
  reset: /^reset\s+(.+)\s+settings$/i,
};

/**
 * Setting name aliases for natural language
 */
const SETTING_ALIASES = {
  // AI settings
  'ai thinking': { category: 'ai', key: 'showThinking' },
  'thinking mode': { category: 'ai', key: 'showThinking' },
  'transparency': { category: 'ai', key: 'showThinking' },
  'auto routing': { category: 'ai', key: 'autoRouting' },
  'smart routing': { category: 'ai', key: 'autoRouting' },
  'openai key': { category: 'ai', key: 'openaiKey' },
  'google key': { category: 'ai', key: 'googleKey' },
  'gemini key': { category: 'ai', key: 'googleKey' },

  // Performance
  'fps': { category: 'performance', key: 'fps' },
  'frame rate': { category: 'performance', key: 'fps' },
  'particles': { category: 'performance', key: 'particleEffects' },
  'particle effects': { category: 'performance', key: 'particleEffects' },
  'animations': { category: 'performance', key: 'animations' },
  'low power': { category: 'performance', key: 'lowPowerMode' },
  'power saving': { category: 'performance', key: 'lowPowerMode' },
  
  // Privacy
  'analytics': { category: 'privacy', key: 'analytics' },
  'tracking': { category: 'privacy', key: 'analytics' },
  'data saving': { category: 'privacy', key: 'dataSaving' },
  'stealth': { category: 'privacy', key: 'stealthMode' },
  'stealth mode': { category: 'privacy', key: 'stealthMode' },
  
  // Study
  'pomodoro': { category: 'study', key: 'pomodoroLength' },
  'pomodoro length': { category: 'study', key: 'pomodoroLength' },
  'break': { category: 'study', key: 'breakLength' },
  'break length': { category: 'study', key: 'breakLength' },
  'notifications': { category: 'study', key: 'notifications' },
  'alerts': { category: 'study', key: 'notifications' },
  'sounds': { category: 'study', key: 'soundEffects' },
  'sound effects': { category: 'study', key: 'soundEffects' },
  
  // UI
  'theme': { category: 'ui', key: 'theme' },
  'font size': { category: 'ui', key: 'fontSize' },
  'text size': { category: 'ui', key: 'fontSize' },
  'compact mode': { category: 'ui', key: 'compactMode' },
  'sidebar': { category: 'ui', key: 'sidebarPosition' },
};

const CATEGORY_ALIASES = {
  ai: 'ai', performance: 'performance', perf: 'performance', privacy: 'privacy',
  study: 'study', ui: 'ui', interface: 'ui', all: 'all',
};

/**
 * Parse natural language command
 */
export const parseCommand = (message) => {
  const lower = message.toLowerCase().trim();
  
  // Check each command pattern
  for (const [commandType, pattern] of Object.entries(COMMAND_PATTERNS)) {
    const match = lower.match(pattern);
    if (match) {
      return { type: commandType, match, original: message };
    }
  }
  
  return null;
};

/**
 * Find setting from natural language
 */
const findSetting = (text) => {
  const lower = text.toLowerCase().trim();
  
  // Check aliases
  for (const [alias, setting] of Object.entries(SETTING_ALIASES)) {
    if (lower.includes(alias)) {
      return setting;
    }
  }
  
  return null;
};

/**
 * Execute parsed command
 */
export const executeCommand = (command, userContext = {}) => {
  const { type, match } = command;
  
  try {
    switch (type) {
      case 'enable':
      case 'disable':
      case 'toggle': {
        const settingText = match[2];
        const setting = findSetting(settingText);
        
        if (!setting) {
          const msg = `I couldn't find a setting for "${settingText}". Try being more specific!`;
          return { success: false, error: msg, message: msg };
        }
        
        const currentValue = getSetting(setting.category, setting.key);
        const newValue = type === 'enable' ? true : type === 'disable' ? false : !currentValue;
        
        const result = updateSetting(setting.category, setting.key, newValue);
        
        if (result.success) {
          return {
            success: true,
            message: `✅ ${type === 'toggle' ? 'Toggled' : type === 'enable' ? 'Enabled' : 'Disabled'} ${settingText}`,
            action: {
              type: 'setting_changed',
              setting: setting,
              oldValue: currentValue,
              newValue: newValue,
            },
          };
        }
        
        return { ...result, message: result.message ?? result.error };
      }

      case 'set': {
        const settingText = match[2];
        const valueText = match[3];
        const setting = findSetting(settingText);

        if (!setting) {
          const msg = `I couldn't find a setting for "${settingText}"`;
          return { success: false, error: msg, message: msg };
        }
        
        // Parse value
        let value = valueText;
        if (valueText === 'true' || valueText === 'on' || valueText === 'yes') value = true;
        if (valueText === 'false' || valueText === 'off' || valueText === 'no') value = false;
        if (!isNaN(valueText)) value = parseFloat(valueText);
        
        const result = updateSetting(setting.category, setting.key, value);
        
        if (result.success) {
          return {
            success: true,
            message: `✅ Set ${settingText} to ${value}`,
            action: {
              type: 'setting_changed',
              setting: setting,
              newValue: value,
            },
          };
        }
        return { ...result, message: result.message ?? result.error };
      }

      case 'increase':
      case 'decrease': {
        const settingText = match[2];
        const amount = match[4] ? parseInt(match[4]) : (type === 'increase' ? 5 : -5);
        const setting = findSetting(settingText);
        
        if (!setting) {
          const msg = `Couldn't find "${settingText}"`;
          return { success: false, error: msg, message: msg };
        }

        const current = getSetting(setting.category, setting.key);
        const newValue = type === 'increase' ? current + amount : current - amount;
        const result = updateSetting(setting.category, setting.key, newValue);

        if (result.success) {
          return {
            success: true,
            message: `✅ ${type === 'increase' ? 'Increased' : 'Decreased'} ${settingText} to ${newValue}`,
            action: {
              type: 'setting_changed',
              setting: setting,
              oldValue: current,
              newValue: newValue,
            },
          };
        }
        return { ...result, message: result.message ?? result.error };
      }

      case 'show': {
        const settingText = match[2];
        const setting = findSetting(settingText);
        if (!setting) {
          const msg = `Couldn't find "${settingText}"`;
          return { success: false, error: msg, message: msg };
        }
        
        const value = getSetting(setting.category, setting.key);
        return {
          success: true,
          message: `${settingText}: ${value}`,
          value: value,
        };
      }
      
      case 'list': {
        const raw = (match[2] || '').toLowerCase().trim();
        const category = CATEGORY_ALIASES[raw] ?? raw;
        const settings = getAllSettings();
        const subset = category === 'all' || !settings[category] ? settings : { [category]: settings[category] };
        return {
          success: true,
          message: category === 'all' ? 'Here are all your settings:' : `Here are your ${category} settings:`,
          settings: subset,
        };
      }
      
      case 'optimize': {
        const target = match[1];
        const context = {
          ...userContext,
          optimizeFor: target,
        };
        
        const result = autoConfigureSettings(context);
        
        return {
          success: true,
          message: `🚀 Optimized settings for ${target}`,
          autoApplied: result.autoApplied,
          suggestions: result.suggestions,
        };
      }
      
      case 'suggest': {
        const suggestions = suggestSettings(userContext);
        
        return {
          success: true,
          message: '💡 Here are my suggestions based on your usage:',
          suggestions: suggestions,
        };
      }
      
      case 'auto': {
        const result = autoConfigureSettings(userContext);
        
        return {
          success: true,
          message: '🤖 Auto-configured settings based on your device and usage',
          autoApplied: result.autoApplied,
        };
      }
      
      case 'reset': {
        const raw = (match[1] || '').toLowerCase().trim();
        const category = CATEGORY_ALIASES[raw] ?? raw;
        const result = resetSettings(category === 'all' ? null : category);
        const msg = result.success
          ? (result.message || (category === 'all' ? '🔄 Reset all settings' : `🔄 Reset ${category} settings`))
          : (result.error || 'Reset failed');
        return { success: result.success, message: msg, error: result.error };
      }
      
      case 'export': {
        const profile = exportSettings();
        
        return {
          success: true,
          message: '📦 Exported your settings profile',
          profile: profile,
        };
      }
      
      default:
        return { success: false, error: 'Unknown command type' };
    }
  } catch (err) {
    const msg = `Command failed: ${err.message}`;
    return { success: false, error: msg, message: msg };
  }
};

/**
 * Check if message contains a settings command
 */
export const isSettingsCommand = (message) => {
  const command = parseCommand(message);
  return command !== null;
};

/**
 * Process message for settings commands
 */
export const processSettingsCommand = (message, userContext = {}) => {
  const command = parseCommand(message);
  
  if (!command) {
    return null;
  }
  
  return executeCommand(command, userContext);
};

export default {
  parseCommand,
  executeCommand,
  isSettingsCommand,
  processSettingsCommand,
};
