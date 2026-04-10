/**
 * I.R.I.S. Action Inspector
 * =========================
 * Inspect and debug actions with detailed information
 */

import {storage} from '../Storage/clientStorage.js';

export class ActionInspector {
  constructor() {
    this.inspectedActions = new Map();
    this.breakpoints = new Map();
    this.watchedActions = new Set();
    this.logs = [];
  }

  /**
   * Inspect an action
   */
  inspectAction(actionName, parameters = {}) {
    const inspection = {
      id: generateId(),
      actionName,
      parameters,
      timestamp: Date.now(),
      result: null,
      error: null,
      duration: 0,
      status: 'pending',
    };

    this.inspectedActions.set(inspection.id, inspection);

    return inspection;
  }

  /**
   * Set breakpoint on action
   */
  setBreakpoint(actionName) {
    this.breakpoints.set(actionName, {
      enabled: true,
      hitCount: 0,
      conditions: [],
    });
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(actionName) {
    this.breakpoints.delete(actionName);
  }

  /**
   * Check if breakpoint is set
   */
  hasBreakpoint(actionName) {
    return this.breakpoints.has(actionName);
  }

  /**
   * Watch action execution
   */
  watchAction(actionName) {
    this.watchedActions.add(actionName);
  }

  /**
   * Stop watching action
   */
  unwatchAction(actionName) {
    this.watchedActions.delete(actionName);
  }

  /**
   * Get watched actions
   */
  getWatchedActions() {
    return Array.from(this.watchedActions);
  }

  /**
   * Log action execution
   */
  logActionExecution(inspection, result, error = null, duration = 0) {
    inspection.result = result;
    inspection.error = error;
    inspection.duration = duration;
    inspection.status = error ? 'error' : 'success';

    const log = {
      id: inspection.id,
      actionName: inspection.actionName,
      status: inspection.status,
      timestamp: inspection.timestamp,
      duration,
      hasError: !!error,
    };

    this.logs.push(log);

    // Keep last 500 logs
    if (this.logs.length > 500) {
      this.logs.shift();
    }
  }

  /**
   * Get execution logs
   */
  getExecutionLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  /**
   * Filter logs by action
   */
  filterLogs(actionName) {
    return this.logs.filter((l) => l.actionName === actionName);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      totalExecutions: this.logs.length,
      successCount: this.logs.filter((l) => l.status === 'success').length,
      errorCount: this.logs.filter((l) => l.status === 'error').length,
      avgDuration: 0,
      slowestActions: [],
    };

    if (this.logs.length > 0) {
      const totalDuration = this.logs.reduce((sum, l) => sum + l.duration, 0);
      stats.avgDuration = totalDuration / this.logs.length;

      // Find slowest actions
      const actionDurations = {};
      for (const log of this.logs) {
        if (!actionDurations[log.actionName]) {
          actionDurations[log.actionName] = [];
        }
        actionDurations[log.actionName].push(log.duration);
      }

      stats.slowestActions = Object.entries(actionDurations)
        .map(([name, durations]) => ({
          name,
          avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
          maxDuration: Math.max(...durations),
        }))
        .sort((a, b) => b.avgDuration - a.avgDuration)
        .slice(0, 10);
    }

    return stats;
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs
   */
  export() {
    return {
      logs: this.logs,
      breakpoints: Array.from(this.breakpoints.keys()),
      watchedActions: Array.from(this.watchedActions),
      statistics: this.getStatistics(),
    };
  }
}

const globalInspector = new ActionInspector();

/**
 * Get global action inspector
 */
export function getActionInspector() {
  return globalInspector;
}

/**
 * Get action from inspection result
 */
export async function getActionDetails(actionName) {
  try {
    const registry = await import('./irisActionRegistry.js');
    const action = registry.getAction(actionName);

    if (!action) {
      return {success: false, error: 'Action not found'};
    }

    return {
      success: true,
      action: {
        name: action.name,
        description: action.description,
        riskLevel: action.riskLevel,
        reversible: action.reversible,
        category: action.category,
        parameters: action.parameters,
      },
    };
  } catch (error) {
    console.error('Error getting action details:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Save inspector state
 */
export async function saveInspectorState() {
  try {
    const settings = await storage.loadSettings();
    settings.actionInspectorState = globalInspector.export();
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving inspector state:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
