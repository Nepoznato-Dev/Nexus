/**
 * I.R.I.S. Disagreement Handling
 * ==============================
 * Handle disagreements between AI models and user feedback
 */

import {storage} from '../Storage/clientStorage.js';

export const DISAGREEMENT_TYPES = {
  ACCURACY: 'accuracy',
  RELEVANCE: 'relevance',
  TONE: 'tone',
  COMPLETENESS: 'completeness',
  SAFETY: 'safety',
};

/**
 * Record disagreement
 */
export async function recordDisagreement(responseId, feedbackData) {
  try {
    const disagreement = {
      id: generateId(),
      responseId,
      type: feedbackData.type,
      severity: feedbackData.severity || 'medium',
      aiResponse: feedbackData.aiResponse,
      userCorrection: feedbackData.userCorrection,
      explanation: feedbackData.explanation || '',
      timestamp: Date.now(),
      resolved: false,
    };

    const settings = await storage.loadSettings();
    if (!settings.disagreements) {
      settings.disagreements = [];
    }

    settings.disagreements.push(disagreement);

    // Keep last 500 disagreements
    if (settings.disagreements.length > 500) {
      settings.disagreements = settings.disagreements.slice(-500);
    }

    await storage.saveSettings(settings);

    // Learn from disagreement
    await learnFromDisagreement(disagreement);

    return {success: true, disagreementId: disagreement.id};
  } catch (error) {
    console.error('Error recording disagreement:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get disagreement history
 */
export async function getDisagreements(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const disagreements = settings?.disagreements || [];

    return disagreements.slice(-limit);
  } catch (error) {
    console.error('Error getting disagreements:', error);
    return [];
  }
}

/**
 * Get unresolved disagreements
 */
export async function getUnresolvedDisagreements() {
  try {
    const settings = await storage.loadSettings();
    const disagreements = settings?.disagreements || [];

    return disagreements.filter((d) => !d.resolved);
  } catch (error) {
    console.error('Error getting unresolved disagreements:', error);
    return [];
  }
}

/**
 * Resolve disagreement
 */
export async function resolveDisagreement(disagreementId, resolution) {
  try {
    const settings = await storage.loadSettings();
    const disagreement = (settings.disagreements || []).find((d) => d.id === disagreementId);

    if (!disagreement) {
      return {success: false, error: 'Disagreement not found'};
    }

    disagreement.resolved = true;
    disagreement.resolution = resolution;
    disagreement.resolvedAt = Date.now();

    await storage.saveSettings(settings);

    return {success: true, resolved: disagreementId};
  } catch (error) {
    console.error('Error resolving disagreement:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get disagreement statistics
 */
export async function getDisagreementStats() {
  try {
    const settings = await storage.loadSettings();
    const disagreements = settings?.disagreements || [];

    const stats = {
      total: disagreements.length,
      resolved: disagreements.filter((d) => d.resolved).length,
      unresolved: disagreements.filter((d) => !d.resolved).length,
      byType: {},
      bySeverity: {},
    };

    for (const disagreement of disagreements) {
      stats.byType[disagreement.type] = (stats.byType[disagreement.type] || 0) + 1;
      stats.bySeverity[disagreement.severity] = (stats.bySeverity[disagreement.severity] || 0) + 1;
    }

    // Resolution rate
    stats.resolutionRate = stats.total > 0 ? 
      Math.round((stats.resolved / stats.total) * 100) : 0;

    return stats;
  } catch (error) {
    console.error('Error getting disagreement stats:', error);
    return {total: 0};
  }
}

/**
 * Internal: Learn from disagreement
 */
async function learnFromDisagreement(disagreement) {
  try {
    // This would integrate with the learning system
    // For now, just log it

    const settings = await storage.loadSettings();
    if (!settings.learningData) {
      settings.learningData = [];
    }

    settings.learningData.push({
      type: disagreement.type,
      aiResponse: disagreement.aiResponse,
      correctResponse: disagreement.userCorrection,
      timestamp: disagreement.timestamp,
    });

    // Keep last 1000 learning examples
    if (settings.learningData.length > 1000) {
      settings.learningData = settings.learningData.slice(-1000);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error in learning:', error);
  }
}

/**
 * Generate improvement recommendations
 */
export async function getImprovementRecommendations() {
  try {
    const stats = await getDisagreementStats();

    const recommendations = [];

    // Find most common disagreement type
    let mostCommonType = null;
    let maxCount = 0;

    for (const [type, count] of Object.entries(stats.byType)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    }

    if (mostCommonType) {
      recommendations.push({
        category: 'High Disagreement Rate',
        issue: `Most common disagreement type: ${mostCommonType}`,
        suggestion: `Review AI model behavior in "${mostCommonType}" category`,
        priority: 'HIGH',
      });
    }

    // Check for high severity
    if (stats.bySeverity?.high > stats.total * 0.1) {
      recommendations.push({
        category: 'Quality Concern',
        issue: 'High proportion of severe disagreements',
        suggestion: 'Consider retraining or adjusting model parameters',
        priority: 'CRITICAL',
      });
    }

    // Check resolution rate
    if (stats.resolutionRate < 50) {
      recommendations.push({
        category: 'Process Issue',
        issue: 'Low disagreement resolution rate',
        suggestion: 'Improve workflow for addressing disagreements',
        priority: 'MEDIUM',
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

function generateId() {
  return `disagreement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
