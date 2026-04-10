/**
 * I.R.I.S. Memory Capsules System
 * ===============================
 * Bundle conversation history, analysis, and user profile into portable memory
 */

import {storage} from '../Storage/clientStorage.js';

export class MemoryCapsule {
  constructor(label, options = {}) {
    this.id = generateId();
    this.label = label;
    this.created = Date.now();
    this.sealed = false;
    this.conversations = [];
    this.analysis = {},
    this.userProfile = {},
    this.tags = options.tags || [];
    this.metadata = options.metadata || {};
  }

  addConversation(conversation) {
    this.conversations.push(conversation);
    return this;
  }

  addAnalysis(analysis) {
    this.analysis = analysis;
    return this;
  }

  addUserProfile(profile) {
    this.userProfile = profile;
    return this;
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    return this;
  }

  seal() {
    this.sealed = true;
    this.sealedAt = Date.now();
    return this;
  }

  getSize() {
    return JSON.stringify(this).length;
  }

  export() {
    return {
      id: this.id,
      label: this.label,
      created: this.created,
      sealed: this.sealed,
      sealedAt: this.sealedAt,
      conversations: this.conversations,
      analysis: this.analysis,
      userProfile: this.userProfile,
      tags: this.tags,
      metadata: this.metadata,
    };
  }
}

/**
 * Create a memory capsule from current memory
 */
export async function createMemoryCapsule(label, options = {}) {
  try {
    const {
      includeConversations = true,
      includeAnalysis = true,
      includeProfile = true,
      autoSeal = false,
    } = options;

    const capsule = new MemoryCapsule(label, options);
    const settings = await storage.loadSettings();

    if (includeConversations && settings.conversationHistory) {
      capsule.conversations = settings.conversationHistory.slice();
    }

    if (includeAnalysis && settings.analysis) {
      capsule.analysis = settings.analysis;
    }

    if (includeProfile && settings.userProfile) {
      capsule.userProfile = settings.userProfile;
    }

    if (autoSeal) {
      capsule.seal();
    }

    // Save capsule
    const capsules = await getAllMemoryCapsules();
    capsules.push(capsule.export());

    const newSettings = await storage.loadSettings();
    newSettings.memoryCapsules = capsules;
    await storage.saveSettings(newSettings);

    return {success: true, capsuleId: capsule.id};
  } catch (error) {
    console.error('Error creating memory capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get all memory capsules
 */
export async function getAllMemoryCapsules() {
  try {
    const settings = await storage.loadSettings();
    return settings?.memoryCapsules || [];
  } catch (error) {
    console.error('Error getting memory capsules:', error);
    return [];
  }
}

/**
 * Get memory capsule by ID
 */
export async function getMemoryCapsule(capsuleId) {
  try {
    const capsules = await getAllMemoryCapsules();
    return capsules.find((c) => c.id === capsuleId) || null;
  } catch (error) {
    console.error('Error getting memory capsule:', error);
    return null;
  }
}

/**
 * List capsules with metadata
 */
export async function listMemoryCapsules() {
  try {
    const capsules = await getAllMemoryCapsules();

    return capsules.map((c) => ({
      id: c.id,
      label: c.label,
      created: c.created,
      sealed: c.sealed,
      conversationCount: c.conversations?.length || 0,
      size: JSON.stringify(c).length,
      tags: c.tags,
    }));
  } catch (error) {
    console.error('Error listing capsules:', error);
    return [];
  }
}

/**
 * Restore from memory capsule
 */
export async function restoreFromCapsule(capsuleId, options = {}) {
  try {
    const capsule = await getMemoryCapsule(capsuleId);

    if (!capsule) {
      return {success: false, error: 'Capsule not found'};
    }

    if (capsule.sealed && !options.force) {
      return {
        success: false,
        error: 'Cannot modify sealed capsule',
        sealed: true,
      };
    }

    const {
      restoreConversations = true,
      restoreAnalysis = true,
      restoreProfile = false, // Default false for privacy
    } = options;

    const settings = await storage.loadSettings();

    if (restoreConversations && capsule.conversations?.length > 0) {
      settings.conversationHistory = capsule.conversations;
    }

    if (restoreAnalysis && capsule.analysis) {
      settings.analysis = capsule.analysis;
    }

    if (restoreProfile && capsule.userProfile) {
      settings.userProfile = capsule.userProfile;
    }

    await storage.saveSettings(settings);

    return {success: true, restored: capsule.label};
  } catch (error) {
    console.error('Error restoring capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Seal a memory capsule (make read-only)
 */
export async function sealMemoryCapsule(capsuleId) {
  try {
    const settings = await storage.loadSettings();
    const capsules = settings?.memoryCapsules || [];

    const capsule = capsules.find((c) => c.id === capsuleId);
    if (!capsule) {
      return {success: false, error: 'Capsule not found'};
    }

    capsule.sealed = true;
    capsule.sealedAt = Date.now();

    await storage.saveSettings(settings);

    return {success: true, sealed: capsuleId};
  } catch (error) {
    console.error('Error sealing capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Unseal a memory capsule
 */
export async function unsealMemoryCapsule(capsuleId) {
  try {
    const settings = await storage.loadSettings();
    const capsules = settings?.memoryCapsules || [];

    const capsule = capsules.find((c) => c.id === capsuleId);
    if (!capsule) {
      return {success: false, error: 'Capsule not found'};
    }

    capsule.sealed = false;

    await storage.saveSettings(settings);

    return {success: true, unsealed: capsuleId};
  } catch (error) {
    console.error('Error unsealing capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete memory capsule
 */
export async function deleteMemoryCapsule(capsuleId) {
  try {
    const settings = await storage.loadSettings();
    settings.memoryCapsules = (settings.memoryCapsules || []).filter(
      (c) => c.id !== capsuleId
    );
    await storage.saveSettings(settings);

    return {success: true, deleted: capsuleId};
  } catch (error) {
    console.error('Error deleting capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export memory capsule
 */
export async function exportMemoryCapsule(capsuleId) {
  try {
    const capsule = await getMemoryCapsule(capsuleId);

    if (!capsule) {
      return {success: false, error: 'Capsule not found'};
    }

    return {
      success: true,
      data: capsule,
      filename: `memory_capsule_${capsule.label.replace(/\s+/g, '_')}_${Date.now()}.json`,
    };
  } catch (error) {
    console.error('Error exporting capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import memory capsule
 */
export async function importMemoryCapsule(data) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.memoryCapsules) {
      settings.memoryCapsules = [];
    }

    const newCapsule = {
      ...data,
      id: generateId(),
      created: Date.now(),
    };

    settings.memoryCapsules.push(newCapsule);
    await storage.saveSettings(settings);

    return {success: true, capsuleId: newCapsule.id};
  } catch (error) {
    console.error('Error importing capsule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get capsule statistics
 */
export async function getCapsuleStats() {
  try {
    const capsules = await getAllMemoryCapsules();

    const stats = {
      totalCapsules: capsules.length,
      sealedCapsules: capsules.filter((c) => c.sealed).length,
      totalConversations: capsules.reduce((sum, c) => sum + (c.conversations?.length || 0), 0),
      totalSize: capsules.reduce((sum, c) => sum + JSON.stringify(c).length, 0),
      oldestCapsule: capsules.length > 0 ? capsules[0].created : null,
      newestCapsule: capsules.length > 0 ? capsules[capsules.length - 1].created : null,
    };

    return stats;
  } catch (error) {
    console.error('Error getting capsule stats:', error);
    return {};
  }
}

/**
 * Archive old capsules
 */
export async function archiveOldCapsules(daysOld = 30) {
  try {
    const settings = await storage.loadSettings();
    const capsules = settings?.memoryCapsules || [];

    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const archived = capsules.filter((c) => c.created < cutoffTime);

    if (!settings.archivedCapsules) {
      settings.archivedCapsules = [];
    }

    settings.archivedCapsules.push(...archived);
    settings.memoryCapsules = capsules.filter((c) => c.created >= cutoffTime);

    await storage.saveSettings(settings);

    return {success: true, archivedCount: archived.length};
  } catch (error) {
    console.error('Error archiving capsules:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `capsule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
