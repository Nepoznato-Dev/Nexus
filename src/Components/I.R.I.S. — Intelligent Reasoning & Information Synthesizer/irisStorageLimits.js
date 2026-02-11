/**
 * I.R.I.S. Storage Limits & Quotas
 * ================================
 * Manage IndexedDB storage with automatic cleanup
 */

import {storage} from '../Storage/clientStorage.js';

export const STORAGE_CATEGORIES = {
  CONVERSATIONS: 'conversations',
  ANALYSIS: 'analysis',
  SETTINGS: 'settings',
  SNAPSHOTS: 'snapshots',
  MEMORY_CAPSULES: 'memoryCapsules',
  LOGS: 'logs',
  MEDIA: 'media',
};

export const DEFAULT_QUOTAS = {
  conversations: 50, // max entries
  analysis: 1000, // max entries
  settings: 1, // single object
  snapshots: 20, // max snapshots
  memoryCapsules: 50, // max capsules
  logs: 1000, // max log entries per category
  media: 10, // max media items
};

/**
 * Get storage usage
 */
export async function getStorageUsage() {
  try {
    const estimate = await navigator.storage?.estimate?.();

    if (!estimate) {
      return {available: false};
    }

    const usagePercent = Math.round((estimate.usage / estimate.quota) * 100);

    return {
      status: 'ok',
      usage: estimate.usage,
      quota: estimate.quota,
      available: estimate.quota - estimate.usage,
      percentUsed: usagePercent,
    };
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return {error: error.message};
  }
}

/**
 * Get quota for category
 */
export function getQuotaForCategory(category) {
  return DEFAULT_QUOTAS[category] || null;
}

/**
 * Set custom quota for category
 */
export async function setQuotaForCategory(category, limit) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.storageQuotas) {
      settings.storageQuotas = {...DEFAULT_QUOTAS};
    }

    settings.storageQuotas[category] = limit;
    await storage.saveSettings(settings);

    return {success: true, category, limit};
  } catch (error) {
    console.error('Error setting quota:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get category sizes
 */
export async function getCategorySizes() {
  try {
    const settings = await storage.loadSettings();

    const sizes = {
      conversations: (settings.conversationHistory || []).length,
      analysis: Object.keys(settings.analysis || {}).length,
      settings: 1,
      snapshots: (settings.snapshots || []).length,
      memoryCapsules: (settings.memoryCapsules || []).length,
      actionLog: (settings.actionLog || []).length,
      patchLog: (settings.patchLog || []).length,
      conflictLog: (settings.conflictLog || []).length,
    };

    return sizes;
  } catch (error) {
    console.error('Error getting category sizes:', error);
    return {};
  }
}

/**
 * Check if category is over quota
 */
export async function isOverQuota(category) {
  try {
    const settings = await storage.loadSettings();
    const quotas = settings.storageQuotas || DEFAULT_QUOTAS;
    const quota = quotas[category];

    if (!quota) return false;

    let count = 0;

    switch (category) {
      case STORAGE_CATEGORIES.CONVERSATIONS:
        count = (settings.conversationHistory || []).length;
        break;
      case STORAGE_CATEGORIES.ANALYSIS:
        count = Object.keys(settings.analysis || {}).length;
        break;
      case STORAGE_CATEGORIES.SNAPSHOTS:
        count = (settings.snapshots || []).length;
        break;
      case STORAGE_CATEGORIES.MEMORY_CAPSULES:
        count = (settings.memoryCapsules || []).length;
        break;
    }

    return count > quota;
  } catch (error) {
    console.error('Error checking quota:', error);
    return false;
  }
}

/**
 * Enforce quota for category
 */
export async function enforceQuota(category) {
  try {
    const settings = await storage.loadSettings();
    const quotas = settings.storageQuotas || DEFAULT_QUOTAS;
    const quota = quotas[category];

    if (!quota) return {success: true, action: 'none'};

    let data = [];
    let key = null;

    switch (category) {
      case STORAGE_CATEGORIES.CONVERSATIONS:
        key = 'conversationHistory';
        data = settings.conversationHistory || [];
        break;
      case STORAGE_CATEGORIES.SNAPSHOTS:
        key = 'snapshots';
        data = settings.snapshots || [];
        break;
      case STORAGE_CATEGORIES.MEMORY_CAPSULES:
        key = 'memoryCapsules';
        data = settings.memoryCapsules || [];
        break;
      case STORAGE_CATEGORIES.LOGS:
        // Enforce all log types
        const logTypes = ['actionLog', 'patchLog', 'conflictLog', 'permissionLog'];
        let removed = 0;

        for (const logType of logTypes) {
          if (settings[logType]?.length > quota) {
            removed += settings[logType].length - quota;
            settings[logType] = settings[logType].slice(-quota);
          }
        }

        await storage.saveSettings(settings);

        return {success: true, action: 'trimmed', removed};
    }

    if (key && data.length > quota) {
      const removed = data.length - quota;
      settings[key] = data.slice(-quota);
      await storage.saveSettings(settings);

      return {success: true, action: 'trimmed', removed};
    }

    return {success: true, action: 'none'};
  } catch (error) {
    console.error('Error enforcing quota:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Enforce all quotas
 */
export async function enforceAllQuotas() {
  try {
    const results = {};

    for (const category of Object.values(STORAGE_CATEGORIES)) {
      results[category] = await enforceQuota(category);
    }

    return {success: true, results};
  } catch (error) {
    console.error('Error enforcing all quotas:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get quota status for all categories
 */
export async function getQuotaStatus() {
  try {
    const sizes = await getCategorySizes();
    const quotas = await getStorageUsage();
    const settings = await storage.loadSettings();
    const customQuotas = settings.storageQuotas || DEFAULT_QUOTAS;

    const status = {};

    for (const category of Object.values(STORAGE_CATEGORIES)) {
      const quota = customQuotas[category];
      const used = sizes[category] || 0;

      status[category] = {
        quota,
        used,
        available: quota - used,
        percentUsed: Math.round((used / quota) * 100),
        isOverQuota: used > quota,
      };
    }

    return {
      success: true,
      storage: quotas,
      categories: status,
    };
  } catch (error) {
    console.error('Error getting quota status:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Auto-cleanup when storage is low
 */
export async function autoCleanup() {
  try {
    const storageUsage = await getStorageUsage();

    if (storageUsage.percentUsed < 80) {
      return {success: true, action: 'none', reason: 'Storage not critical'};
    }

    console.warn('⚠️ Storage usage critical, starting cleanup');

    let totalFreed = 0;

    // Trim oldest logs first
    const logKeys = ['actionLog', 'patchLog', 'conflictLog', 'permissionLog'];
    const settings = await storage.loadSettings();

    for (const logKey of logKeys) {
      if (settings[logKey]?.length > 100) {
        const before = settings[logKey].length;
        settings[logKey] = settings[logKey].slice(-100);
        totalFreed += before - settings[logKey].length;
      }
    }

    // Clear older snapshots if needed
    if (settings.snapshots?.length > 10) {
      const before = settings.snapshots.length;
      settings.snapshots = settings.snapshots.slice(-10);
      totalFreed += before - settings.snapshots.length;
    }

    await storage.saveSettings(settings);

    return {
      success: true,
      action: 'cleanup_performed',
      itemsRemoved: totalFreed,
    };
  } catch (error) {
    console.error('Error in auto-cleanup:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get storage recommendations
 */
export async function getStorageRecommendations() {
  try {
    const quota = await getQuotaStatus();
    const recommendations = [];

    for (const [category, status] of Object.entries(quota.categories || {})) {
      if (status.percentUsed > 90) {
        recommendations.push({
          category,
          priority: 'CRITICAL',
          message: `${category} is at ${status.percentUsed}% of quota`,
          suggestion: `Consider reducing ${category} quota or deleting old items`,
        });
      } else if (status.percentUsed > 75) {
        recommendations.push({
          category,
          priority: 'HIGH',
          message: `${category} is at ${status.percentUsed}% of quota`,
          suggestion: `Monitor ${category} usage and plan cleanup`,
        });
      }
    }

    if (quota.storage?.percentUsed > 90) {
      recommendations.push({
        category: 'OVERALL',
        priority: 'CRITICAL',
        message: 'Overall storage at 90% capacity',
        suggestion: 'Run auto-cleanup or export data for archival',
      });
    }

    return {success: true, recommendations};
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {success: false, error: error.message};
  }
}
