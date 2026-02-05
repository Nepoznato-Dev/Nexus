/**
 * I.R.I.S. Action Binding System
 * ==============================
 * Bind UI elements to actions for quick execution
 */

import {storage} from '../Storage/clientStorage.js';

export class ActionBinding {
  constructor(elementId, actionName, parameters = {}, options = {}) {
    this.id = generateId();
    this.elementId = elementId;
    this.actionName = actionName;
    this.parameters = parameters;
    this.hotkey = options.hotkey || null;
    this.displayText = options.displayText || actionName;
    this.icon = options.icon || null;
    this.tooltip = options.tooltip || actionName;
    this.confirmOnExecute = options.confirmOnExecute || false;
    this.enabled = options.enabled !== false;
  }

  export() {
    return {
      id: this.id,
      elementId: this.elementId,
      actionName: this.actionName,
      parameters: this.parameters,
      hotkey: this.hotkey,
      displayText: this.displayText,
      icon: this.icon,
      tooltip: this.tooltip,
      confirmOnExecute: this.confirmOnExecute,
      enabled: this.enabled,
    };
  }
}

/**
 * Create and save a new binding
 */
export async function createBinding(binding) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.actionBindings) {
      settings.actionBindings = [];
    }

    settings.actionBindings.push(binding.export());
    await storage.saveSettings(settings);

    return {success: true, bindingId: binding.id};
  } catch (error) {
    console.error('Error creating binding:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get binding by ID
 */
export async function getBinding(bindingId) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.actionBindings || [];
    return bindings.find((b) => b.id === bindingId) || null;
  } catch (error) {
    console.error('Error getting binding:', error);
    return null;
  }
}

/**
 * Get bindings for element
 */
export async function getBindingsForElement(elementId) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.actionBindings || [];
    return bindings.filter((b) => b.elementId === elementId);
  } catch (error) {
    console.error('Error getting element bindings:', error);
    return [];
  }
}

/**
 * Get binding by hotkey
 */
export async function getBindingByHotkey(hotkey) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.actionBindings || [];
    return bindings.find((b) => b.hotkey === hotkey) || null;
  } catch (error) {
    console.error('Error getting hotkey binding:', error);
    return null;
  }
}

/**
 * Get all bindings
 */
export async function getAllBindings() {
  try {
    const settings = await storage.loadSettings();
    return settings?.actionBindings || [];
  } catch (error) {
    console.error('Error getting all bindings:', error);
    return [];
  }
}

/**
 * Update binding
 */
export async function updateBinding(bindingId, updates) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.actionBindings || [];

    const index = bindings.findIndex((b) => b.id === bindingId);
    if (index === -1) {
      return {success: false, error: 'Binding not found'};
    }

    bindings[index] = {...bindings[index], ...updates, id: bindingId};
    settings.actionBindings = bindings;
    await storage.saveSettings(settings);

    return {success: true, bindingId};
  } catch (error) {
    console.error('Error updating binding:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete binding
 */
export async function deleteBinding(bindingId) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.actionBindings) {
      return {success: false, error: 'No bindings found'};
    }

    settings.actionBindings = settings.actionBindings.filter((b) => b.id !== bindingId);
    await storage.saveSettings(settings);

    return {success: true, deleted: bindingId};
  } catch (error) {
    console.error('Error deleting binding:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete all bindings for element
 */
export async function deleteBindingsForElement(elementId) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.actionBindings) {
      return {success: true, deletedCount: 0};
    }

    const before = settings.actionBindings.length;
    settings.actionBindings = settings.actionBindings.filter((b) => b.elementId !== elementId);
    const deleted = before - settings.actionBindings.length;

    await storage.saveSettings(settings);

    return {success: true, deletedCount: deleted};
  } catch (error) {
    console.error('Error deleting element bindings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Execute bound action
 */
export async function executeBinding(bindingId) {
  try {
    const binding = await getBinding(bindingId);

    if (!binding) {
      return {success: false, error: 'Binding not found'};
    }

    if (!binding.enabled) {
      return {success: false, error: 'Binding is disabled'};
    }

    // Log execution
    await logBindingExecution(binding);

    // Would call actual action handler
    return {
      success: true,
      action: binding.actionName,
      parameters: binding.parameters,
    };
  } catch (error) {
    console.error('Error executing binding:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Enable binding
 */
export async function enableBinding(bindingId) {
  return await updateBinding(bindingId, {enabled: true});
}

/**
 * Disable binding
 */
export async function disableBinding(bindingId) {
  return await updateBinding(bindingId, {enabled: false});
}

/**
 * Check if hotkey is available
 */
export async function isHotkeyAvailable(hotkey) {
  try {
    const binding = await getBindingByHotkey(hotkey);
    return binding === null;
  } catch (error) {
    console.error('Error checking hotkey:', error);
    return false;
  }
}

/**
 * Get all hotkey bindings
 */
export async function getAllHotkeys() {
  try {
    const bindings = await getAllBindings();
    return bindings
      .filter((b) => b.hotkey !== null)
      .map((b) => ({hotkey: b.hotkey, actionName: b.actionName}));
  } catch (error) {
    console.error('Error getting hotkeys:', error);
    return [];
  }
}

/**
 * Export bindings as JSON
 */
export async function exportBindings() {
  try {
    const bindings = await getAllBindings();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      bindingCount: bindings.length,
      bindings,
    };
  } catch (error) {
    console.error('Error exporting bindings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import bindings from JSON
 */
export async function importBindings(data) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.actionBindings) {
      settings.actionBindings = [];
    }

    let imported = 0;
    let skipped = 0;

    for (const binding of data.bindings) {
      // Check for duplicates
      if (!settings.actionBindings.find((b) => b.id === binding.id)) {
        settings.actionBindings.push(binding);
        imported++;
      } else {
        skipped++;
      }
    }

    await storage.saveSettings(settings);

    return {success: true, imported, skipped};
  } catch (error) {
    console.error('Error importing bindings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get binding execution history
 */
export async function getBindingHistory(bindingId, limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const history = settings?.bindingExecutionLog || [];
    return history.filter((h) => h.bindingId === bindingId).slice(-limit);
  } catch (error) {
    console.error('Error getting binding history:', error);
    return [];
  }
}

/**
 * Clear all bindings
 */
export async function clearAllBindings() {
  try {
    const settings = await storage.loadSettings();
    settings.actionBindings = [];
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error clearing bindings:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Internal: Log binding execution
 */
async function logBindingExecution(binding) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.bindingExecutionLog) {
      settings.bindingExecutionLog = [];
    }

    settings.bindingExecutionLog.push({
      bindingId: binding.id,
      actionName: binding.actionName,
      timestamp: Date.now(),
    });

    // Keep last 1000 executions
    if (settings.bindingExecutionLog.length > 1000) {
      settings.bindingExecutionLog = settings.bindingExecutionLog.slice(-1000);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging binding execution:', error);
  }
}

function generateId() {
  return `binding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
