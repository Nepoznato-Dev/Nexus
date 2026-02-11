/**
 * I.R.I.S. Patch Preview System
 * =============================
 * Preview changes before applying patches
 */

import {storage} from '../Storage/clientStorage.js';

export class PatchPreview {
  constructor(patch) {
    this.patch = patch;
    this.preview = null;
    this.diff = null;
    this.isApplied = false;
  }

  /**
   * Generate preview
   */
  async generatePreview() {
    try {
      const current = await storage.loadSettings();
      const preview = {...current};

      // Apply forward function to preview
      await this.patch.forward?.call({...preview}, preview);

      this.preview = preview;

      // Generate diff
      this.diff = this.generateDiff(current, preview);

      return {success: true, diff: this.diff};
    } catch (error) {
      console.error('Error generating preview:', error);
      return {success: false, error: error.message};
    }
  }

  /**
   * Generate diff between two objects
   */
  generateDiff(before, after) {
    const diff = {
      added: {},
      modified: {},
      deleted: {},
    };

    // Check for added and modified
    for (const key in after) {
      if (!(key in before)) {
        diff.added[key] = after[key];
      } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diff.modified[key] = {
          before: before[key],
          after: after[key],
        };
      }
    }

    // Check for deleted
    for (const key in before) {
      if (!(key in after)) {
        diff.deleted[key] = before[key];
      }
    }

    return diff;
  }

  /**
   * Get preview summary
   */
  getSummary() {
    if (!this.diff) return null;

    return {
      changes: Object.keys(this.diff.modified).length,
      additions: Object.keys(this.diff.added).length,
      deletions: Object.keys(this.diff.deleted).length,
    };
  }

  /**
   * Apply patch
   */
  async apply() {
    if (this.isApplied) {
      return {success: false, error: 'Patch already applied'};
    }

    try {
      await this.patch.forward?.();
      this.isApplied = true;
      return {success: true, applied: true};
    } catch (error) {
      console.error('Error applying patch:', error);
      return {success: false, error: error.message};
    }
  }

  /**
   * Revert patch
   */
  async revert() {
    if (!this.isApplied) {
      return {success: false, error: 'Patch not applied'};
    }

    try {
      await this.patch.reverse?.();
      this.isApplied = false;
      return {success: true, reverted: true};
    } catch (error) {
      console.error('Error reverting patch:', error);
      return {success: false, error: error.message};
    }
  }

  /**
   * Export preview as JSON
   */
  export() {
    return {
      patch: this.patch,
      diff: this.diff,
      summary: this.getSummary(),
      isApplied: this.isApplied,
    };
  }
}

/**
 * Preview a patch
 */
export async function previewPatch(patch) {
  try {
    const preview = new PatchPreview(patch);
    const result = await preview.generatePreview();

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      diff: preview.diff,
      summary: preview.getSummary(),
    };
  } catch (error) {
    console.error('Error previewing patch:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Compare multiple patches
 */
export async function comparePatchEffects(patches) {
  try {
    const effects = [];

    for (const patch of patches) {
      const preview = new PatchPreview(patch);
      await preview.generatePreview();

      effects.push({
        description: patch.description,
        summary: preview.getSummary(),
      });
    }

    return {success: true, effects};
  } catch (error) {
    console.error('Error comparing patches:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get impact analysis
 */
export async function getImpactAnalysis(patch) {
  try {
    const preview = new PatchPreview(patch);
    await preview.generatePreview();

    const impact = {
      severity: determineSeverity(preview.diff),
      affectedAreas: getAffectedAreas(preview.diff),
      riskLevel: assessRisk(preview.diff),
      recommendations: getRecommendations(preview.diff),
    };

    return {success: true, impact};
  } catch (error) {
    console.error('Error analyzing impact:', error);
    return {success: false, error: error.message};
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function determineSeverity(diff) {
  const changeCount = Object.keys(diff.modified).length +
    Object.keys(diff.added).length +
    Object.keys(diff.deleted).length;

  if (changeCount > 10) return 'HIGH';
  if (changeCount > 5) return 'MEDIUM';
  return 'LOW';
}

function getAffectedAreas(diff) {
  const areas = new Set();

  for (const key of Object.keys(diff.modified)) {
    areas.add(key.split('.')[0]);
  }

  for (const key of Object.keys(diff.added)) {
    areas.add(key.split('.')[0]);
  }

  return Array.from(areas);
}

function assessRisk(diff) {
  const criticalKeys = [
    'conversationHistory',
    'userProfile',
    'apiKey',
    'permissions',
  ];

  for (const key of Object.keys(diff.deleted)) {
    if (criticalKeys.some((ck) => key.includes(ck))) {
      return 'CRITICAL';
    }
  }

  return 'LOW';
}

function getRecommendations(diff) {
  const recommendations = [];

  if (Object.keys(diff.deleted).length > 0) {
    recommendations.push('This patch deletes data. Consider creating a snapshot first.');
  }

  if (Object.keys(diff.modified).length > 5) {
    recommendations.push('Many settings will be changed. Review carefully before applying.');
  }

  return recommendations;
}
