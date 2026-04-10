/**
 * I.R.I.S. Keyboard Shortcuts System
 * ==================================
 * Global keyboard shortcuts manager
 */

import {storage} from '../Storage/clientStorage.js';

export const DEFAULT_SHORTCUTS = {
  'ctrl+z': {action: 'undo', description: 'Undo last action'},
  'ctrl+shift+z': {action: 'redo', description: 'Redo last undone action'},
  'ctrl+s': {action: 'save', description: 'Save current state'},
  'ctrl+e': {action: 'export', description: 'Export data'},
  'ctrl+i': {action: 'import', description: 'Import data'},
  'shift+?': {action: 'help', description: 'Show help'},
  'ctrl+k': {action: 'commandPalette', description: 'Open command palette'},
  'alt+shift+l': {action: 'layout', description: 'Save layout preset'},
  'ctrl+,': {action: 'settings', description: 'Open settings'},
  'esc': {action: 'closeModals', description: 'Close all modals'},
};

/**
 * Parse keyboard event to shortcut string
 */
export function eventToShortcut(event) {
  const parts = [];

  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  if (event.metaKey) parts.push('cmd');

  // Add key
  let key = event.key.toLowerCase();
  if (key === ' ') key = 'space';
  if (key === 'enter') key = 'return';
  if (key === 'arrowup') key = 'up';
  if (key === 'arrowdown') key = 'down';
  if (key === 'arrowleft') key = 'left';
  if (key === 'arrowright') key = 'right';

  parts.push(key);

  return parts.join('+');
}

/**
 * Create shortcut handler
 */
export class ShortcutManager {
  constructor() {
    this.shortcuts = new Map(Object.entries(DEFAULT_SHORTCUTS));
    this.bindings = new Map();
    this.enabled = true;

    this.setupKeyListener();
  }

  /**
   * Setup global key listener
   */
  setupKeyListener() {
    document.addEventListener('keydown', (event) => {
      if (!this.enabled) return;

      const shortcut = eventToShortcut(event);
      const handler = this.shortcuts.get(shortcut);

      if (handler) {
        event.preventDefault();

        const callback = this.bindings.get(handler.action);
        if (callback) {
          callback(event);
        }
      }
    });
  }

  /**
   * Register shortcut
   */
  registerShortcut(shortcut, action, description = '') {
    this.shortcuts.set(shortcut, {
      action,
      description,
    });
  }

  /**
   * Bind action to callback
   */
  bindAction(action, callback) {
    this.bindings.set(action, callback);
  }

  /**
   * Get shortcut for action
   */
  getShortcutForAction(action) {
    for (const [shortcut, handler] of this.shortcuts) {
      if (handler.action === action) {
        return shortcut;
      }
    }

    return null;
  }

  /**
   * Get all shortcuts
   */
  getShortcuts() {
    const shortcuts = [];

    for (const [key, handler] of this.shortcuts) {
      shortcuts.push({
        shortcut: key,
        action: handler.action,
        description: handler.description,
      });
    }

    return shortcuts;
  }

  /**
   * Disable shortcuts
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Enable shortcuts
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Export shortcuts
   */
  export() {
    const data = {};

    for (const [shortcut, handler] of this.shortcuts) {
      data[shortcut] = handler;
    }

    return data;
  }
}

const globalShortcutManager = new ShortcutManager();

/**
 * Get global shortcut manager
 */
export function getShortcutManager() {
  return globalShortcutManager;
}

/**
 * Save shortcuts
 */
export async function saveShortcuts() {
  try {
    const settings = await storage.loadSettings();
    settings.shortcuts = globalShortcutManager.export();
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving shortcuts:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Load shortcuts
 */
export async function loadShortcuts() {
  try {
    const settings = await storage.loadSettings();
    const shortcuts = settings?.shortcuts || {};

    globalShortcutManager.shortcuts.clear();

    for (const [shortcut, handler] of Object.entries(shortcuts)) {
      globalShortcutManager.shortcuts.set(shortcut, handler);
    }

    return {success: true, loaded: Object.keys(shortcuts).length};
  } catch (error) {
    console.error('Error loading shortcuts:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Reset shortcuts to defaults
 */
export function resetShortcutsToDefaults() {
  globalShortcutManager.shortcuts.clear();

  for (const [shortcut, handler] of Object.entries(DEFAULT_SHORTCUTS)) {
    globalShortcutManager.shortcuts.set(shortcut, handler);
  }

  return {success: true, reset: Object.keys(DEFAULT_SHORTCUTS).length};
}
