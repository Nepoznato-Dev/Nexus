/**
 * I.R.I.S. Snapshots System
 * =========================
 * Save and restore full app state snapshots
 */

import {storage} from '../Storage/clientStorage.js';

/**
 * Create a state snapshot
 */
export async function createSnapshot(label, options = {}) {
  const {
    autoTriggered = false,
    includeMemory = false,
    includeUndoStack = false,
  } = options;

  try {
    const snapshot = {
      id: generateId(),
      timestamp: Date.now(),
      label: label,
      autoTriggered,
      contents: {},
    };

    // Capture dashboard state
    const settings = await storage.loadSettings();
    snapshot.contents.settings = JSON.parse(JSON.stringify(settings));

    // Optional: capture memory
    if (includeMemory) {
      // memory capture logic
    }

    // Optional: capture undo stack
    if (includeUndoStack) {
      // undo stack capture logic
    }

    // Calculate size
    const jsonStr = JSON.stringify(snapshot);
    snapshot.size = new Blob([jsonStr]).size;

    // Save snapshot
    const snapshots = await getAllSnapshots();
    snapshots.push(snapshot);

    // Keep only last 20 snapshots
    if (snapshots.length > 20) {
      snapshots.shift();
    }

    const snapshotSettings = await storage.loadSettings();
    snapshotSettings.snapshots = snapshots;
    await storage.saveSettings(snapshotSettings);

    return {
      success: true,
      snapshot: {
        id: snapshot.id,
        label: snapshot.label,
        timestamp: snapshot.timestamp,
        size: snapshot.size,
      },
    };
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return {success: false, error: error.message};
  }
}

/**
 * List all snapshots
 */
export async function listSnapshots(limit = 20) {
  try {
    const snapshots = await getAllSnapshots();

    return snapshots
      .slice(-limit)
      .map((s) => ({
        id: s.id,
        label: s.label,
        timestamp: s.timestamp,
        size: s.size,
        autoTriggered: s.autoTriggered,
      }));
  } catch (error) {
    console.error('Error listing snapshots:', error);
    return [];
  }
}

/**
 * Restore from snapshot
 */
export async function restoreSnapshot(snapshotId) {
  try {
    const snapshots = await getAllSnapshots();
    const snapshot = snapshots.find((s) => s.id === snapshotId);

    if (!snapshot) {
      return {success: false, error: 'Snapshot not found'};
    }

    // Restore settings
    if (snapshot.contents.settings) {
      await storage.saveSettings(snapshot.contents.settings);
    }

    // Restore other contents as needed

    return {success: true, restored: snapshot.label};
  } catch (error) {
    console.error('Error restoring snapshot:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete snapshot
 */
export async function deleteSnapshot(snapshotId) {
  try {
    let snapshots = await getAllSnapshots();
    snapshots = snapshots.filter((s) => s.id !== snapshotId);

    const settings = await storage.loadSettings();
    settings.snapshots = snapshots;
    await storage.saveSettings(settings);

    return {success: true, deleted: snapshotId};
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Compare two snapshots
 */
export async function diffSnapshots(id1, id2) {
  try {
    const snapshots = await getAllSnapshots();
    const snap1 = snapshots.find((s) => s.id === id1);
    const snap2 = snapshots.find((s) => s.id === id2);

    if (!snap1 || !snap2) {
      return {success: false, error: 'Snapshot not found'};
    }

    const changes = [];
    // TODO: Implement diff logic

    return {success: true, changes};
  } catch (error) {
    console.error('Error diffing snapshots:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Export snapshot as JSON
 */
export async function exportSnapshot(snapshotId) {
  try {
    const snapshots = await getAllSnapshots();
    const snapshot = snapshots.find((s) => s.id === snapshotId);

    if (!snapshot) {
      return {success: false, error: 'Snapshot not found'};
    }

    return {
      success: true,
      data: snapshot,
      download: `snapshot_${snapshot.label}_${snapshot.timestamp}.json`,
    };
  } catch (error) {
    console.error('Error exporting snapshot:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Clear all snapshots
 */
export async function clearAllSnapshots() {
  try {
    const settings = await storage.loadSettings();
    settings.snapshots = [];
    await storage.saveSettings(settings);

    return {success: true, cleared: true};
  } catch (error) {
    console.error('Error clearing snapshots:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Auto-snapshot before risky action
 */
export async function autoSnapshot(riskReason) {
  return await createSnapshot(`Auto: ${riskReason}`, {
    autoTriggered: true,
    includeMemory: false,
  });
}

/**
 * Internal: Get all snapshots
 */
async function getAllSnapshots() {
  try {
    const settings = await storage.loadSettings();
    return settings?.snapshots || [];
  } catch (error) {
    console.error('Error getting snapshots:', error);
    return [];
  }
}

/**
 * Internal: Generate ID
 */
function generateId() {
  return `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
