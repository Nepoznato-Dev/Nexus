/**
 * AI Dashboard Integration
 * Allows AI to see, modify, and configure dashboard, widgets, and settings
 */

import { storage } from '../Storage/clientStorage.js';

/**
 * Get current dashboard state
 */
export async function getDashboardState() {
  try {
    const settings = await storage.loadSettings();
    const favorites = await storage.loadFavorites();
    const browserState = await storage.loadBrowserState();

    return {
      widgets: settings?.widgets || [],
      theme: settings?.theme || 'dark',
      accentColor: settings?.colors?.accent || '#a55eea',
      layout: settings?.layout || 'grid',
      background: settings?.background || 'particles',
      quickActions: settings?.quickActions || [],
      favorites: favorites || [],
      tabs: browserState?.tabs || [],
      performance: settings?.performance || 'balanced',
      language: settings?.language || 'en',
    };
  } catch (err) {
    return {
      error: 'Could not load dashboard state',
      details: err.message,
    };
  }
}

/**
 * Describe dashboard state in natural language
 */
export async function describeDashboard() {
  const state = await getDashboardState();

  if (state.error) {
    return `I couldn't access the dashboard right now. ${state.error}`;
  }

  const description = [];

  // Theme
  description.push(`🎨 You're using the **${state.theme}** theme with **${state.accentColor}** accent color.`);

  // Background
  description.push(`✨ Background: **${state.background}**`);

  // Widgets
  if (state.widgets && state.widgets.length > 0) {
    description.push(`📊 Active widgets: ${state.widgets.map((w) => w.name || w).join(', ')}`);
  } else {
    description.push(`📊 No widgets currently active.`);
  }

  // Layout
  description.push(`📐 Layout mode: **${state.layout}**`);

  // Performance
  description.push(`⚡ Performance: **${state.performance}** mode`);

  // Favorites
  if (state.favorites && state.favorites.length > 0) {
    description.push(`⭐ You have ${state.favorites.length} favorites saved`);
  }

  // Browser tabs
  if (state.tabs && state.tabs.length > 0) {
    description.push(`🌐 ${state.tabs.length} browser tabs open`);
  }

  return description.join('\n');
}

/**
 * Change dashboard settings via AI
 */
export async function changeDashboardSetting(setting, value) {
  try {
    const currentSettings = await storage.loadSettings();

    const validSettings = {
      theme: ['light', 'dark', 'auto'],
      background: ['particles', 'waves', 'gradient', 'stars', 'none'],
      layout: ['grid', 'list', 'masonry'],
      performance: ['low', 'balanced', 'high', 'ultra'],
      language: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
    };

    if (setting === 'theme' && validSettings.theme.includes(value)) {
      currentSettings.theme = value;
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Theme changed to **${value}**`,
      };
    }

    if (setting === 'background' && validSettings.background.includes(value)) {
      currentSettings.background = value;
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Background changed to **${value}**`,
      };
    }

    if (setting === 'layout' && validSettings.layout.includes(value)) {
      currentSettings.layout = value;
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Layout changed to **${value}**`,
      };
    }

    if (setting === 'performance' && validSettings.performance.includes(value)) {
      currentSettings.performance = value;
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Performance mode set to **${value}**`,
      };
    }

    if (setting === 'accentColor' || setting === 'accent') {
      if (!currentSettings.colors) currentSettings.colors = {};
      currentSettings.colors.accent = value;
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Accent color changed to **${value}**`,
      };
    }

    return {
      success: false,
      error: `I can't change "${setting}" to "${value}". Valid options: ${JSON.stringify(validSettings[setting] || [])}`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to change setting: ${err.message}`,
    };
  }
}

/**
 * Add/remove widgets
 */
export async function manageWidget(action, widgetName) {
  try {
    const currentSettings = await storage.loadSettings();
    if (!currentSettings.widgets) currentSettings.widgets = [];

    const availableWidgets = ['spotify', 'youtube', 'weather', 'calendar', 'todo', 'notes', 'clock'];

    if (action === 'add') {
      if (!availableWidgets.includes(widgetName.toLowerCase())) {
        return {
          success: false,
          error: `Widget "${widgetName}" not found. Available: ${availableWidgets.join(', ')}`,
        };
      }

      if (currentSettings.widgets.includes(widgetName)) {
        return {
          success: false,
          message: `Widget "${widgetName}" is already active`,
        };
      }

      currentSettings.widgets.push(widgetName);
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Added **${widgetName}** widget`,
      };
    }

    if (action === 'remove') {
      const index = currentSettings.widgets.indexOf(widgetName);
      if (index === -1) {
        return {
          success: false,
          message: `Widget "${widgetName}" is not active`,
        };
      }

      currentSettings.widgets.splice(index, 1);
      await storage.saveSettings(currentSettings);
      return {
        success: true,
        message: `✅ Removed **${widgetName}** widget`,
      };
    }

    return {
      success: false,
      error: `Invalid action "${action}". Use "add" or "remove"`,
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to manage widget: ${err.message}`,
    };
  }
}

/**
 * Parse natural language commands for dashboard changes
 */
export function parseDashboardCommand(message) {
  const lower = message.toLowerCase();

  // Theme changes
  if (lower.includes('change theme') || lower.includes('set theme')) {
    if (lower.includes('dark')) return { action: 'changeSetting', setting: 'theme', value: 'dark' };
    if (lower.includes('light')) return { action: 'changeSetting', setting: 'theme', value: 'light' };
  }

  // Background changes
  if (lower.includes('change background') || lower.includes('set background')) {
    if (lower.includes('particles')) return { action: 'changeSetting', setting: 'background', value: 'particles' };
    if (lower.includes('waves')) return { action: 'changeSetting', setting: 'background', value: 'waves' };
    if (lower.includes('gradient')) return { action: 'changeSetting', setting: 'background', value: 'gradient' };
    if (lower.includes('stars')) return { action: 'changeSetting', setting: 'background', value: 'stars' };
  }

  // Performance changes
  if (lower.includes('performance mode') || lower.includes('set performance')) {
    if (lower.includes('low')) return { action: 'changeSetting', setting: 'performance', value: 'low' };
    if (lower.includes('high') || lower.includes('ultra')) return { action: 'changeSetting', setting: 'performance', value: 'high' };
    if (lower.includes('balanced')) return { action: 'changeSetting', setting: 'performance', value: 'balanced' };
  }

  // Widget management
  if (lower.includes('add widget') || lower.includes('enable widget')) {
    const widgets = ['spotify', 'youtube', 'weather', 'calendar', 'todo', 'notes', 'clock'];
    const widget = widgets.find((w) => lower.includes(w));
    if (widget) return { action: 'manageWidget', widgetAction: 'add', widget };
  }

  if (lower.includes('remove widget') || lower.includes('disable widget')) {
    const widgets = ['spotify', 'youtube', 'weather', 'calendar', 'todo', 'notes', 'clock'];
    const widget = widgets.find((w) => lower.includes(w));
    if (widget) return { action: 'manageWidget', widgetAction: 'remove', widget };
  }

  // View dashboard info
  if (lower.includes('show dashboard') || lower.includes('what is my dashboard') || lower.includes('dashboard status')) {
    return { action: 'describeDashboard' };
  }

  return null;
}

/**
 * Execute dashboard command
 */
export async function executeDashboardCommand(message) {
  const command = parseDashboardCommand(message);

  if (!command) {
    return null; // Not a dashboard command
  }

  if (command.action === 'describeDashboard') {
    const description = await describeDashboard();
    return {
      success: true,
      response: description,
    };
  }

  if (command.action === 'changeSetting') {
    return await changeDashboardSetting(command.setting, command.value);
  }

  if (command.action === 'manageWidget') {
    return await manageWidget(command.widgetAction, command.widget);
  }

  return null;
}

/**
 * AI can suggest dashboard improvements based on usage
 */
export async function suggestDashboardImprovements() {
  const state = await getDashboardState();

  if (state.error) {
    return 'I need access to your dashboard to make suggestions';
  }

  const suggestions = [];

  // Performance suggestions
  if (state.performance === 'low') {
    suggestions.push('💡 Consider upgrading to **balanced** performance mode for a better experience');
  }

  // Widget suggestions
  if (!state.widgets || state.widgets.length === 0) {
    suggestions.push('📊 Your dashboard is empty! Try adding widgets like Spotify, YouTube, or Weather');
  }

  // Theme suggestions
  const hour = new Date().getHours();
  if (state.theme === 'light' && (hour < 6 || hour > 20)) {
    suggestions.push('🌙 It's nighttime - maybe switch to dark theme for easier viewing?');
  }

  // Browser tab suggestions
  if (state.tabs && state.tabs.length > 10) {
    suggestions.push('🌐 You have many tabs open. Consider bookmarking some to reduce clutter');
  }

  if (suggestions.length === 0) {
    return '✨ Your dashboard looks great! Everything is configured nicely.';
  }

  return suggestions.join('\n\n');
}

export default {
  getDashboardState,
  describeDashboard,
  changeDashboardSetting,
  manageWidget,
  parseDashboardCommand,
  executeDashboardCommand,
  suggestDashboardImprovements,
};
