/**
 * I.R.I.S. Undo/Redo Manager
 * ==========================
 * Complete undo/redo system with action tracking
 */

import {storage} from '../Storage/clientStorage.js';

export class UndoManager {
  constructor(maxStackSize = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxStackSize;
    this.isExecuting = false;
  }

  /**
   * Record an action for undo
   * action: {id, type, description, timestamp, forward, reverse, metadata}
   */
  recordAction(action) {
    if (this.isExecuting) return; // Prevent recursive recording

    // Clear redo stack when new action is recorded
    this.redoStack = [];

    // Add action to undo stack
    this.undoStack.push({
      id: action.id || this.generateId(),
      type: action.type,
      description: action.description,
      timestamp: action.timestamp || Date.now(),
      forward: action.forward,
      reverse: action.reverse,
      metadata: action.metadata || {},
    });

    // Enforce max size
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }

    this.saveStack();
    return this.undoStack.length - 1;
  }

  /**
   * Undo the last action
   */
  async undo() {
    if (this.undoStack.length === 0) {
      return {success: false, message: 'Nothing to undo'};
    }

    this.isExecuting = true;
    const action = this.undoStack.pop();

    try {
      await action.reverse();
      this.redoStack.push(action);
      this.saveStack();

      return {
        success: true,
        action: {
          description: action.description,
          type: action.type,
        },
        stackSize: this.undoStack.length,
      };
    } catch (error) {
      console.error('Undo failed:', error);
      this.undoStack.push(action); // Restore to stack
      return {success: false, error: error.message};
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Redo the last undone action
   */
  async redo() {
    if (this.redoStack.length === 0) {
      return {success: false, message: 'Nothing to redo'};
    }

    this.isExecuting = true;
    const action = this.redoStack.pop();

    try {
      await action.forward();
      this.undoStack.push(action);
      this.saveStack();

      return {
        success: true,
        action: {
          description: action.description,
          type: action.type,
        },
        stackSize: this.undoStack.length,
      };
    } catch (error) {
      console.error('Redo failed:', error);
      this.redoStack.push(action); // Restore to stack
      return {success: false, error: error.message};
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Get action history
   */
  getHistory(limit = 50) {
    const combined = [...this.undoStack];
    return combined.slice(-limit).map((action, index) => ({
      index,
      id: action.id,
      type: action.type,
      description: action.description,
      timestamp: action.timestamp,
      canUndo: index === combined.length - 1,
      canRedo: this.redoStack.length > 0,
    }));
  }

  /**
   * Get undo stack for display
   */
  getUndoStack() {
    return this.undoStack.map((a) => ({
      description: a.description,
      type: a.type,
      timestamp: a.timestamp,
    }));
  }

  /**
   * Get redo stack for display
   */
  getRedoStack() {
    return this.redoStack.map((a) => ({
      description: a.description,
      type: a.type,
      timestamp: a.timestamp,
    }));
  }

  /**
   * Create a checkpoint (labeled snapshot)
   */
  setCheckpoint(label) {
    const checkpointId = this.generateId();

    return {
      checkpointId,
      label,
      stackSize: this.undoStack.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Revert to specific action (undo multiple at once)
   */
  async revertToCheckpoint(checkpointId, targetIndex) {
    const undone = 0;

    while (this.undoStack.length > targetIndex && this.undoStack.length > 0) {
      const result = await this.undo();
      if (!result.success) return {success: false, actionCount: undone};
    }

    return {success: true, actionCount: undone};
  }

  /**
   * Clear all undo/redo history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.saveStack();
    return {success: true};
  }

  /**
   * Check if can undo
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if can redo
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Get stack statistics
   */
  getStats() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      maxSize: this.maxSize,
      oldestAction: this.undoStack[0],
      newestAction: this.undoStack[this.undoStack.length - 1],
    };
  }

  /**
   * Export history for persistence
   */
  exportHistory() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      undoStack: this.undoStack,
      redoStack: this.redoStack,
    };
  }

  /**
   * Internal: Save stack to storage for persistence
   */
  async saveStack() {
    try {
      const settings = await storage.loadSettings();
      if (!settings.undoRedoState) {
        settings.undoRedoState = {};
      }

      settings.undoRedoState = {
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length,
        exportDate: new Date().toISOString(),
      };

      await storage.saveSettings(settings);
    } catch (error) {
      console.error('Error saving undo/redo state:', error);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global instance
let globalUndoManager = null;

/**
 * Get or create global undo manager
 */
export function getUndoManager() {
  if (!globalUndoManager) {
    globalUndoManager = new UndoManager();
  }
  return globalUndoManager;
}

/**
 * Initialize undo manager
 */
export function initializeUndoManager(maxSize = 50) {
  globalUndoManager = new UndoManager(maxSize);
  return globalUndoManager;
}

/**
 * Reset global undo manager
 */
export function resetUndoManager() {
  if (globalUndoManager) {
    globalUndoManager.clear();
  }
}
