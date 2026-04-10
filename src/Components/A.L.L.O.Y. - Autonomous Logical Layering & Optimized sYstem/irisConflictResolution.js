/**
 * I.R.I.S. Conflict Resolution System
 * ===================================
 * Detect and resolve conflicting changes
 */

import {storage} from '../Storage/clientStorage.js';

export const CONFLICT_RESOLUTION_STRATEGIES = {
  LAST_WRITE_WINS: 'last-write-wins',
  FIRST_WRITE_WINS: 'first-write-wins',
  USER_OVERRIDE: 'user-override',
  MERGE_FIELDS: 'merge-fields',
  MANUAL_RESOLUTION: 'manual-resolution',
};

/**
 * Detect conflicts between two patches
 */
export function detectConflict(patch1, patch2) {
  // Same object path = potential conflict
  if (patch1.metadata?.path === patch2.metadata?.path) {
    return {
      detected: true,
      type: 'DIRECT_CONFLICT',
      patches: [patch1, patch2],
    };
  }

  // Same widget = potential conflict
  if (
    patch1.metadata?.type === 'widget' &&
    patch2.metadata?.type === 'widget' &&
    patch1.metadata?.widgetId === patch2.metadata?.widgetId
  ) {
    return {
      detected: true,
      type: 'WIDGET_CONFLICT',
      patches: [patch1, patch2],
    };
  }

  // No conflict
  return {
    detected: false,
    patches: [patch1, patch2],
  };
}

/**
 * Resolve conflict automatically
 */
export async function resolveConflict(conflict, strategy = CONFLICT_RESOLUTION_STRATEGIES.LAST_WRITE_WINS) {
  const [patch1, patch2] = conflict.patches;

  const resolution = {
    conflictId: generateId(),
    timestamp: Date.now(),
    strategy,
    type: conflict.type,
    winner: null,
    loser: null,
    applied: false,
  };

  try {
    if (strategy === CONFLICT_RESOLUTION_STRATEGIES.LAST_WRITE_WINS) {
      if (patch2.timestamp > patch1.timestamp) {
        resolution.winner = patch2.id;
        resolution.loser = patch1.id;
      } else {
        resolution.winner = patch1.id;
        resolution.loser = patch2.id;
      }
    } else if (strategy === CONFLICT_RESOLUTION_STRATEGIES.FIRST_WRITE_WINS) {
      if (patch1.timestamp < patch2.timestamp) {
        resolution.winner = patch1.id;
        resolution.loser = patch2.id;
      } else {
        resolution.winner = patch2.id;
        resolution.loser = patch1.id;
      }
    } else if (strategy === CONFLICT_RESOLUTION_STRATEGIES.USER_OVERRIDE) {
      // Mark as manual
      resolution.strategy = CONFLICT_RESOLUTION_STRATEGIES.MANUAL_RESOLUTION;
      resolution.requiresUserInput = true;
    } else if (strategy === CONFLICT_RESOLUTION_STRATEGIES.MERGE_FIELDS) {
      // Merge non-overlapping fields
      resolution.winner = patch1.id;
      resolution.merged = true;
    }

    // Log resolution
    await logConflictResolution(resolution);
    resolution.applied = true;

    return {success: true, resolution};
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get conflict history
 */
export async function getConflictHistory(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const history = settings?.conflictLog || [];
    return history.slice(-limit);
  } catch (error) {
    console.error('Error getting conflict history:', error);
    return [];
  }
}

/**
 * Get unresolved conflicts
 */
export async function getUnresolvedConflicts() {
  try {
    const history = await getConflictHistory(1000);
    return history.filter((c) => !c.resolved);
  } catch (error) {
    console.error('Error getting unresolved conflicts:', error);
    return [];
  }
}

/**
 * Mark conflict as resolved by user
 */
export async function resolveConflictManually(conflictId, userChoice) {
  try {
    const settings = await storage.loadSettings();
    const conflict = (settings?.conflictLog || []).find((c) => c.conflictId === conflictId);

    if (!conflict) {
      return {success: false, error: 'Conflict not found'};
    }

    conflict.resolved = true;
    conflict.userChoice = userChoice;
    conflict.resolvedAt = Date.now();

    await storage.saveSettings(settings);

    return {success: true, resolved: conflictId};
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Detect conflicts in patch batch
 */
export function detectConflictsBatch(patches) {
  const conflicts = [];

  for (let i = 0; i < patches.length; i++) {
    for (let j = i + 1; j < patches.length; j++) {
      const conflict = detectConflict(patches[i], patches[j]);
      if (conflict.detected) {
        conflicts.push(conflict);
      }
    }
  }

  return conflicts;
}

/**
 * Validate patch before applying
 */
export async function validatePatch(patch) {
  const validations = {
    hasId: !!patch.id,
    hasSource: ['AI', 'USER', 'SYSTEM'].includes(patch.source),
    hasDescription: !!patch.description,
    hasTimestamp: typeof patch.timestamp === 'number',
    hasMetadata: typeof patch.metadata === 'object',
  };

  const isValid = Object.values(validations).every((v) => v);

  return {
    valid: isValid,
    validations,
  };
}

/**
 * Check for cascading conflicts
 */
export async function checkCascadingConflicts(patch) {
  try {
    const history = await getConflictHistory(100);

    const related = history.filter((c) => {
      // Check if this patch relates to any previous conflicts
      return (
        c.patches?.some(
          (p) =>
            p.metadata?.path === patch.metadata?.path ||
            p.metadata?.widgetId === patch.metadata?.widgetId
        ) || false
      );
    });

    return {
      hasCascading: related.length > 0,
      relatedConflicts: related,
    };
  } catch (error) {
    console.error('Error checking cascading conflicts:', error);
    return {hasCascading: false, relatedConflicts: []};
  }
}

/**
 * Get conflict statistics
 */
export async function getConflictStats() {
  try {
    const history = await getConflictHistory(1000);

    const stats = {
      total: history.length,
      unresolved: history.filter((c) => !c.resolved).length,
      byStrategy: {},
      byType: {},
      resolvedRatio: 0,
    };

    for (const conflict of history) {
      stats.byStrategy[conflict.strategy] = (stats.byStrategy[conflict.strategy] || 0) + 1;
      stats.byType[conflict.type] = (stats.byType[conflict.type] || 0) + 1;
    }

    stats.resolvedRatio = ((history.length - stats.unresolved) / history.length * 100).toFixed(1);

    return stats;
  } catch (error) {
    console.error('Error getting conflict stats:', error);
    return {total: 0};
  }
}

/**
 * Clear conflict log
 */
export async function clearConflictLog() {
  try {
    const settings = await storage.loadSettings();
    settings.conflictLog = [];
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error clearing conflict log:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Internal: Log conflict
 */
async function logConflictResolution(resolution) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.conflictLog) {
      settings.conflictLog = [];
    }

    settings.conflictLog.push(resolution);

    // Keep last 500 conflicts
    if (settings.conflictLog.length > 500) {
      settings.conflictLog = settings.conflictLog.slice(-500);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging conflict:', error);
  }
}

function generateId() {
  return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
