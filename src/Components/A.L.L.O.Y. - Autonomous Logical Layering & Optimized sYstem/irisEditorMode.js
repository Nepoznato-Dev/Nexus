/**
 * I.R.I.S. Editor Mode System
 * ===========================
 * Toggle between view and edit modes with live preview
 */

import {storage} from '../Storage/clientStorage.js';

export const EDITOR_MODES = {
  VIEW: 'view',
  EDIT: 'edit',
  PREVIEW: 'preview',
};

export class EditorMode {
  constructor() {
    this.currentMode = EDITOR_MODES.VIEW;
    this.previousMode = EDITOR_MODES.VIEW;
    this.editHistory = [];
    this.pendingChanges = [];
    this.isLivePreview = true;
    this.selectedElement = null;
  }

  /**
   * Enter edit mode
   */
  enterEditMode() {
    this.previousMode = this.currentMode;
    this.currentMode = EDITOR_MODES.EDIT;
    this.pendingChanges = [];
    this.recordModeChange('enter-edit');
    return this;
  }

  /**
   * Exit edit mode (discard changes)
   */
  exitEditMode(discard = false) {
    if (discard) {
      this.pendingChanges = [];
    }

    this.previousMode = this.currentMode;
    this.currentMode = EDITOR_MODES.VIEW;
    this.recordModeChange('exit-edit', {discarded: discard});
    return this;
  }

  /**
   * Save changes
   */
  async saveChanges() {
    if (this.currentMode !== EDITOR_MODES.EDIT) {
      return {success: false, error: 'Not in edit mode'};
    }

    try {
      const settings = await storage.loadSettings();

      // Apply pending changes
      for (const change of this.pendingChanges) {
        // Apply change logic
      }

      this.pendingChanges = [];
      this.recordModeChange('save-changes', {changeCount: this.pendingChanges.length});

      await storage.saveSettings(settings);

      return {success: true, saved: this.pendingChanges.length};
    } catch (error) {
      console.error('Error saving changes:', error);
      return {success: false, error: error.message};
    }
  }

  /**
   * Toggle live preview
   */
  toggleLivePreview() {
    this.isLivePreview = !this.isLivePreview;
    return this.isLivePreview;
  }

  /**
   * Enter preview mode
   */
  enterPreviewMode() {
    this.previousMode = this.currentMode;
    this.currentMode = EDITOR_MODES.PREVIEW;
    this.recordModeChange('enter-preview');
    return this;
  }

  /**
   * Track element selection
   */
  selectElement(elementId) {
    this.selectedElement = elementId;
  }

  /**
   * Track change
   */
  recordChange(change) {
    if (this.currentMode === EDITOR_MODES.EDIT) {
      this.pendingChanges.push({
        ...change,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Undo last change
   */
  undoChange() {
    if (this.pendingChanges.length > 0) {
      const undone = this.pendingChanges.pop();
      this.recordModeChange('undo', {change: undone});
      return undone;
    }

    return null;
  }

  /**
   * Get pending changes
   */
  getPendingChanges() {
    return this.pendingChanges;
  }

  /**
   * Get mode status
   */
  getStatus() {
    return {
      currentMode: this.currentMode,
      previousMode: this.previousMode,
      pendingChanges: this.pendingChanges.length,
      selectedElement: this.selectedElement,
      livePreview: this.isLivePreview,
    };
  }

  /**
   * Internal: Record mode change
   */
  recordModeChange(action, metadata = {}) {
    this.editHistory.push({
      action,
      mode: this.currentMode,
      timestamp: Date.now(),
      metadata,
    });

    // Keep last 100 changes
    if (this.editHistory.length > 100) {
      this.editHistory.shift();
    }
  }

  /**
   * Get edit history
   */
  getEditHistory(limit = 50) {
    return this.editHistory.slice(-limit);
  }
}

const globalEditorMode = new EditorMode();

/**
 * Get global editor mode
 */
export function getEditorMode() {
  return globalEditorMode;
}

/**
 * Check if in edit mode
 */
export function isInEditMode() {
  return globalEditorMode.currentMode === EDITOR_MODES.EDIT;
}

/**
 * Check if in view mode
 */
export function isInViewMode() {
  return globalEditorMode.currentMode === EDITOR_MODES.VIEW;
}

/**
 * Check if in preview mode
 */
export function isInPreviewMode() {
  return globalEditorMode.currentMode === EDITOR_MODES.PREVIEW;
}
