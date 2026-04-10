/**
 * I.R.I.S. Error Recovery System
 * ==============================
 * Detect, log, and recover from errors gracefully
 */

import {storage} from '../Storage/clientStorage.js';

export const ERROR_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Error Recovery Handler
 */
export class ErrorRecoveryHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 500;
    this.recoveryStrategies = new Map();
  }

  /**
   * Register recovery strategy
   */
  registerStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  /**
   * Log error
   */
  logError(error, context = {}) {
    const errorEntry = {
      id: generateId(),
      timestamp: Date.now(),
      message: error.message || String(error),
      stack: error.stack || '',
      severity: context.severity || ERROR_SEVERITY.ERROR,
      type: context.type || 'unknown',
      context,
      recovered: false,
      recovery: null,
    };

    this.errors.push(errorEntry);

    // Keep last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Attempt automatic recovery
    this.attemptRecovery(errorEntry);

    return errorEntry;
  }

  /**
   * Attempt recovery
   */
  async attemptRecovery(errorEntry) {
    const strategy = this.recoveryStrategies.get(errorEntry.type);

    if (!strategy) {
      return;
    }

    try {
      const result = await strategy(errorEntry);

      if (result.success) {
        errorEntry.recovered = true;
        errorEntry.recovery = result;
      }
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError);
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50) {
    return this.errors.slice(-limit);
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors() {
    return this.errors.filter((e) => !e.recovered);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity) {
    return this.errors.filter((e) => e.severity === severity);
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {
      totalErrors: this.errors.length,
      bySeverity: {},
      byType: {},
      recovered: 0,
      unresolved: 0,
    };

    for (const error of this.errors) {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      if (error.recovered) {
        stats.recovered++;
      } else {
        stats.unresolved++;
      }
    }

    return stats;
  }

  /**
   * Clear errors
   */
  clear() {
    this.errors = [];
  }

  /**
   * Export error log
   */
  export() {
    return {
      timestamp: Date.now(),
      errors: this.errors,
      stats: this.getStats(),
    };
  }
}

const globalErrorHandler = new ErrorRecoveryHandler();

/**
 * Get global error handler
 */
export function getErrorHandler() {
  return globalErrorHandler;
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers() {
  // Uncaught errors
  window.addEventListener('error', (event) => {
    globalErrorHandler.logError(event.error, {
      type: 'uncaught_error',
      severity: ERROR_SEVERITY.CRITICAL,
      filename: event.filename,
      lineno: event.lineno,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.logError(event.reason, {
      type: 'unhandled_rejection',
      severity: ERROR_SEVERITY.CRITICAL,
    });
  });
}

/**
 * Save error log
 */
export async function saveErrorLog() {
  try {
    const settings = await storage.loadSettings();

    if (!settings.errorLogs) {
      settings.errorLogs = [];
    }

    const logEntry = {
      timestamp: Date.now(),
      errorCount: globalErrorHandler.errors.length,
      errors: globalErrorHandler.export(),
    };

    settings.errorLogs.push(logEntry);

    // Keep last 100 log entries
    if (settings.errorLogs.length > 100) {
      settings.errorLogs = settings.errorLogs.slice(-100);
    }

    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving error log:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get error logs
 */
export async function getErrorLogs(limit = 20) {
  try {
    const settings = await storage.loadSettings();
    const logs = settings?.errorLogs || [];

    return logs.slice(-limit);
  } catch (error) {
    console.error('Error getting error logs:', error);
    return [];
  }
}

/**
 * Recover from critical error
 */
export async function recoverFromCriticalError() {
  try {
    // Reset to safe defaults
    const settings = await storage.loadSettings();

    settings.lastKnownGoodState = {
      timestamp: Date.now(),
      settings,
    };

    // Log recovery attempt
    globalErrorHandler.logError(new Error('Critical error recovery initiated'), {
      type: 'critical_recovery',
      severity: ERROR_SEVERITY.CRITICAL,
    });

    await storage.saveSettings(settings);

    return {
      success: true,
      message: 'Recovery initiated',
      savedState: true,
    };
  } catch (error) {
    console.error('Critical recovery failed:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Restore from saved state
 */
export async function restoreFromSavedState() {
  try {
    const settings = await storage.loadSettings();

    if (!settings.lastKnownGoodState) {
      return {success: false, error: 'No saved state available'};
    }

    const savedState = settings.lastKnownGoodState.settings;
    await storage.saveSettings(savedState);

    return {
      success: true,
      message: 'Restored from saved state',
      restoredAt: settings.lastKnownGoodState.timestamp,
    };
  } catch (error) {
    console.error('Error restoring state:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
