/**
 * I.R.I.S. Action Registry
 * ========================
 * Central registry of all allowed actions (whitelist approach)
 * Every AI and system action must be registered here
 */

/**
 * Action Registry: All allowed actions with metadata
 */
export const ACTION_REGISTRY = {
  // ============================================================================
  // DASHBOARD ACTIONS
  // ============================================================================

  'dashboard.setTheme': {
    name: 'Set Theme',
    description: 'Change dashboard theme (dark/light)',
    handler: async (params) => {
      // Implementation will be provided by app
      return {success: true, theme: params.theme};
    },
    riskLevel: 'LOW',
    parameters: {theme: {type: 'string', enum: ['dark', 'light']}},
    reversible: true,
    category: 'dashboard',
  },

  'dashboard.toggleWidget': {
    name: 'Toggle Widget',
    description: 'Show or hide a widget',
    handler: async (params) => {
      return {success: true, widgetId: params.widgetId, visible: params.visible};
    },
    riskLevel: 'LOW',
    parameters: {
      widgetId: {type: 'string'},
      visible: {type: 'boolean'},
    },
    reversible: true,
    category: 'dashboard',
  },

  'dashboard.moveWidget': {
    name: 'Move Widget',
    description: 'Change widget position',
    handler: async (params) => {
      return {success: true, widgetId: params.widgetId, position: params.position};
    },
    riskLevel: 'MEDIUM',
    parameters: {
      widgetId: {type: 'string'},
      position: {type: 'object', properties: {x: 'number', y: 'number'}},
    },
    reversible: true,
    category: 'dashboard',
  },

  'dashboard.addWidget': {
    name: 'Add Widget',
    description: 'Add a new widget to dashboard',
    handler: async (params) => {
      return {success: true, widgetId: params.widgetType, added: true};
    },
    riskLevel: 'MEDIUM',
    parameters: {
      widgetType: {type: 'string'},
      position: {type: 'object'},
    },
    reversible: true,
    category: 'dashboard',
  },

  'dashboard.removeWidget': {
    name: 'Remove Widget',
    description: 'Remove widget from dashboard',
    handler: async (params) => {
      return {success: true, widgetId: params.widgetId, removed: true};
    },
    riskLevel: 'MEDIUM',
    parameters: {widgetId: {type: 'string'}},
    reversible: true,
    category: 'dashboard',
  },

  'dashboard.resizeWidget': {
    name: 'Resize Widget',
    description: 'Change widget dimensions',
    handler: async (params) => {
      return {success: true, widgetId: params.widgetId, size: params.size};
    },
    riskLevel: 'LOW',
    parameters: {
      widgetId: {type: 'string'},
      size: {type: 'object', properties: {width: 'number', height: 'number'}},
    },
    reversible: true,
    category: 'dashboard',
  },

  // ============================================================================
  // SETTINGS ACTIONS
  // ============================================================================

  'settings.updateAiProvider': {
    name: 'Update AI Provider',
    description: 'Change preferred AI provider (OpenAI/Google/Anthropic)',
    handler: async (params) => {
      return {success: true, provider: params.provider};
    },
    riskLevel: 'MEDIUM',
    parameters: {provider: {type: 'string', enum: ['openai', 'google', 'anthropic']}},
    reversible: true,
    category: 'settings',
  },

  'settings.updatePersonality': {
    name: 'Update Personality',
    description: 'Change AI personality settings',
    handler: async (params) => {
      return {success: true, personality: params.personality};
    },
    riskLevel: 'LOW',
    parameters: {
      personality: {
        type: 'object',
        properties: {
          professionalism: 'number',
          mentorship: 'number',
          preset: 'string',
        },
      },
    },
    reversible: true,
    category: 'settings',
  },

  'settings.resetAll': {
    name: 'Reset All Settings',
    description: 'Reset all settings to defaults',
    handler: async (params) => {
      return {success: true, reset: true};
    },
    riskLevel: 'CRITICAL',
    parameters: {},
    reversible: true,
    category: 'settings',
  },

  // ============================================================================
  // MEMORY ACTIONS
  // ============================================================================

  'memory.clearConversations': {
    name: 'Clear Conversations',
    description: 'Delete all conversation history',
    handler: async (params) => {
      return {success: true, deleted: true};
    },
    riskLevel: 'CRITICAL',
    parameters: {},
    reversible: true,
    category: 'memory',
  },

  'memory.clearUserProfile': {
    name: 'Clear User Profile',
    description: 'Delete learned user profile',
    handler: async (params) => {
      return {success: true, cleared: true};
    },
    riskLevel: 'CRITICAL',
    parameters: {},
    reversible: true,
    category: 'memory',
  },

  'memory.exportMemory': {
    name: 'Export Memory',
    description: 'Export memory capsule',
    handler: async (params) => {
      return {success: true, exported: true};
    },
    riskLevel: 'LOW',
    parameters: {},
    reversible: false,
    category: 'memory',
  },

  // ============================================================================
  // AI ACTIONS
  // ============================================================================

  'ai.suggest': {
    name: 'AI Suggestion',
    description: 'I.R.I.S. suggests next action',
    handler: async (params) => {
      return {success: true, suggestion: params.suggestion};
    },
    riskLevel: 'LOW',
    parameters: {context: {type: 'string'}},
    reversible: false,
    category: 'ai',
  },

  'ai.generateResponse': {
    name: 'Generate Response',
    description: 'Generate AI response to user query',
    handler: async (params) => {
      return {success: true, response: params.response};
    },
    riskLevel: 'MEDIUM',
    parameters: {userMessage: {type: 'string'}},
    reversible: false,
    category: 'ai',
  },

  'ai.analyzeContext': {
    name: 'Analyze Context',
    description: 'I.R.I.S. analyzes current context',
    handler: async (params) => {
      return {success: true, analysis: params.analysis};
    },
    riskLevel: 'LOW',
    parameters: {},
    reversible: false,
    category: 'ai',
  },

  // ============================================================================
  // UI/OVERLAY ACTIONS
  // ============================================================================

  'ui.addElement': {
    name: 'Add UI Element',
    description: 'Add element to custom overlay',
    handler: async (params) => {
      return {success: true, elementId: params.elementId};
    },
    riskLevel: 'MEDIUM',
    parameters: {element: {type: 'object'}},
    reversible: true,
    category: 'ui',
  },

  'ui.removeElement': {
    name: 'Remove UI Element',
    description: 'Remove element from custom overlay',
    handler: async (params) => {
      return {success: true, removed: true};
    },
    riskLevel: 'MEDIUM',
    parameters: {elementId: {type: 'string'}},
    reversible: true,
    category: 'ui',
  },

  'ui.updateElement': {
    name: 'Update UI Element',
    description: 'Modify element properties',
    handler: async (params) => {
      return {success: true, elementId: params.elementId};
    },
    riskLevel: 'LOW',
    parameters: {
      elementId: {type: 'string'},
      properties: {type: 'object'},
    },
    reversible: true,
    category: 'ui',
  },

  // ============================================================================
  // SYSTEM ACTIONS
  // ============================================================================

  'system.enterSafeMode': {
    name: 'Enter Safe Mode',
    description: 'Boot app in safe mode',
    handler: async (params) => {
      return {success: true, safeMode: true};
    },
    riskLevel: 'LOW',
    parameters: {},
    reversible: true,
    category: 'system',
  },

  'system.exportProfile': {
    name: 'Export Profile',
    description: 'Export user profile pack',
    handler: async (params) => {
      return {success: true, exported: true};
    },
    riskLevel: 'LOW',
    parameters: {selections: {type: 'object'}},
    reversible: false,
    category: 'system',
  },

  'system.importProfile': {
    name: 'Import Profile',
    description: 'Import user profile pack',
    handler: async (params) => {
      return {success: true, imported: true};
    },
    riskLevel: 'HIGH',
    parameters: {pack: {type: 'object'}},
    reversible: true,
    category: 'system',
  },
};

/**
 * Execute an action from the registry
 * Performs validation, permission checks, and audit logging
 */
export async function executeAction(
  actionName,
  parameters = {},
  options = {}
) {
  const {source = 'USER', requirePermission = true, logExecution = true} = options;

  // Validate action exists
  if (!(actionName in ACTION_REGISTRY)) {
    throw new Error(`Unknown action: ${actionName}`);
  }

  const action = ACTION_REGISTRY[actionName];

  // Check permissions if required
  if (requirePermission) {
    const permissions = await import('./irisPermissions.js');
    const hasPermission = await permissions.hasPermissionForAction(
      actionName,
      parameters
    );
    if (!hasPermission) {
      throw new Error(`Permission denied for action: ${actionName}`);
    }
  }

  // Execute action
  try {
    const result = await action.handler(parameters);

    // Log execution
    if (logExecution) {
      await logActionExecution({
        actionName,
        parameters,
        source,
        result,
        timestamp: Date.now(),
      });
    }

    return {success: true, result};
  } catch (error) {
    throw new Error(`Action failed: ${actionName} - ${error.message}`);
  }
}

/**
 * Get available actions for a category
 */
export function getActionsByCategory(category) {
  const actions = {};
  for (const [name, config] of Object.entries(ACTION_REGISTRY)) {
    if (config.category === category) {
      actions[name] = {
        name: config.name,
        description: config.description,
        riskLevel: config.riskLevel,
        reversible: config.reversible,
      };
    }
  }
  return actions;
}

/**
 * Get all available actions
 */
export function getAllActions() {
  const actions = {};
  for (const [name, config] of Object.entries(ACTION_REGISTRY)) {
    actions[name] = {
      name: config.name,
      description: config.description,
      riskLevel: config.riskLevel,
      reversible: config.reversible,
      category: config.category,
    };
  }
  return actions;
}

/**
 * Get action by name with full details
 */
export function getAction(actionName) {
  return ACTION_REGISTRY[actionName] || null;
}

/**
 * Log action execution to audit trail
 */
async function logActionExecution(data) {
  try {
    const storage = await import('../Storage/clientStorage.js');
    const settings = await storage.default.loadSettings();

    if (!settings.actionLog) {
      settings.actionLog = [];
    }

    settings.actionLog.push(data);

    // Keep last 500 actions
    if (settings.actionLog.length > 500) {
      settings.actionLog = settings.actionLog.slice(-500);
    }

    await storage.default.saveSettings(settings);
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

/**
 * Get action execution history
 */
export async function getActionHistory(limit = 100) {
  try {
    const storage = await import('../Storage/clientStorage.js');
    const settings = await storage.default.loadSettings();
    const history = settings?.actionLog || [];
    return history.slice(-limit);
  } catch (error) {
    console.error('Error fetching action history:', error);
    return [];
  }
}

/**
 * Clear action history
 */
export async function clearActionHistory() {
  try {
    const storage = await import('../Storage/clientStorage.js');
    const settings = await storage.default.loadSettings();
    settings.actionLog = [];
    await storage.default.saveSettings(settings);
    return {success: true};
  } catch (error) {
    console.error('Error clearing action history:', error);
    return {success: false, error: error.message};
  }
}
