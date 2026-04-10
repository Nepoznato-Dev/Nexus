/**
 * I.R.I.S. Permissions System
 * ===========================
 * Request user confirmation for risky actions
 */

import {storage} from '../Storage/clientStorage.js';

export const RISK_LEVELS = {
  LOW: 'no confirmation needed',
  MEDIUM: 'one-click confirm',
  HIGH: 'confirm + wait 2s',
  CRITICAL: 'confirm + password',
};

export const RISKY_ACTIONS = {
  'dashboard.removeWidget': 'MEDIUM',
  'memory.clearConversations': 'CRITICAL',
  'memory.clearUserProfile': 'CRITICAL',
  'settings.resetAll': 'CRITICAL',
  'ui.addElement': 'MEDIUM',
  'system.importProfile': 'HIGH',
  'dashboard.addWidget': 'LOW',
  'ai.generateResponse': 'LOW',
};

/**
 * Request permission for an action
 */
export async function requestPermission(actionName, metadata = {}) {
  const riskLevel = RISKY_ACTIONS[actionName] || 'LOW';

  if (riskLevel === 'LOW') {
    return {granted: true, immediate: true};
  }

  // Note: Real implementation would show UI modals
  // This is the backend logic
  const settings = await storage.loadSettings();
  const userPreferences = settings?.permissionPreferences || {};

  // Check if user has auto-approved this action before
  if (userPreferences[actionName] === 'auto-approve') {
    return {granted: true, immediate: true};
  }

  if (riskLevel === 'CRITICAL') {
    // Log critical action attempt
    await logPermissionRequest({
      actionName,
      riskLevel,
      timestamp: Date.now(),
      requested: true,
    });

    // Would show modal: "This is destructive. Type password to confirm."
    return {
      granted: false,
      requiresPassword: true,
      requiresConfirm: true,
      message: `Action "${actionName}" is critical and requires password confirmation.`,
    };
  }

  if (riskLevel === 'HIGH') {
    // Would show modal: "This is a major change. Confirm + wait 2s"
    return {
      granted: false,
      requiresConfirm: true,
      countdownSeconds: 2,
      message: `Action "${actionName}" requires confirmation. Waiting 2 seconds...`,
    };
  }

  if (riskLevel === 'MEDIUM') {
    // Would show modal: One-click confirm
    return {
      granted: false,
      requiresConfirm: true,
      countdownSeconds: 0,
      message: `Confirm "${actionName}"?`,
    };
  }

  return {granted: true};
}

/**
 * Confirm permission after user input
 */
export async function confirmPermission(
  actionName,
  confirmInput = {},
  options = {}
) {
  const {password = null, userConfirmed = false} = confirmInput;
  const riskLevel = RISKY_ACTIONS[actionName] || 'LOW';

  if (riskLevel === 'CRITICAL') {
    // Verify password if needed
    if (!userConfirmed) {
      return {granted: false, error: 'User did not confirm'};
    }

    // In real app would verify password against system password
    // For now accept as is
    return {
      granted: true,
      action: actionName,
      timestamp: Date.now(),
    };
  }

  if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
    if (!userConfirmed) {
      return {granted: false, error: 'User did not confirm'};
    }

    return {
      granted: true,
      action: actionName,
      timestamp: Date.now(),
    };
  }

  return {granted: true};
}

/**
 * Check if user has permission for action
 */
export async function hasPermissionForAction(actionName, parameters = {}) {
  const settings = await storage.loadSettings();
  const permissions = settings?.permissions || {};

  // Check action-level permission
  if (permissions[actionName] === false) {
    return false;
  }

  return true;
}

/**
 * Grant permission for an action
 */
export async function grantPermission(actionName, permanent = false) {
  const settings = await storage.loadSettings();
  if (!settings.permissions) {
    settings.permissions = {};
  }

  settings.permissions[actionName] = true;

  if (permanent) {
    if (!settings.permissionPreferences) {
      settings.permissionPreferences = {};
    }
    settings.permissionPreferences[actionName] = 'auto-approve';
  }

  await storage.saveSettings(settings);

  await logPermissionRequest({
    actionName,
    action: 'granted',
    permanent,
    timestamp: Date.now(),
  });

  return {success: true};
}

/**
 * Revoke permission for an action
 */
export async function revokePermission(actionName) {
  const settings = await storage.loadSettings();
  if (!settings.permissions) {
    settings.permissions = {};
  }

  settings.permissions[actionName] = false;

  await storage.saveSettings(settings);

  await logPermissionRequest({
    actionName,
    action: 'revoked',
    timestamp: Date.now(),
  });

  return {success: true};
}

/**
 * Get all permission settings
 */
export async function getAllPermissions() {
  const settings = await storage.loadSettings();
  return settings?.permissions || {};
}

/**
 * Get permission audit log
 */
export async function getPermissionAuditLog(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const auditLog = (settings?.permissionLog || []).slice(-limit);
    return auditLog;
  } catch (error) {
    console.error('Error fetching permission audit:', error);
    return [];
  }
}

/**
 * Internal: Log permission request
 */
async function logPermissionRequest(data) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.permissionLog) {
      settings.permissionLog = [];
    }

    settings.permissionLog.push(data);

    // Keep last 200 entries
    if (settings.permissionLog.length > 200) {
      settings.permissionLog = settings.permissionLog.slice(-200);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging permission:', error);
  }
}

/**
 * Reset all permissions to defaults
 */
export async function resetPermissionsToDefaults() {
  const settings = await storage.loadSettings();
  settings.permissions = {};
  settings.permissionPreferences = {};
  await storage.saveSettings(settings);

  return {success: true, reset: true};
}
