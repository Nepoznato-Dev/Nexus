/**
 * I.R.I.S. Overlay Rendering Engine
 * ==================================
 * Render custom overlays on top of Nexus dashboard
 */

import {storage} from '../Storage/clientStorage.js';

export class OverlayRenderer {
  constructor() {
    this.overlays = new Map();
    this.zIndexCounter = 1000;
    this.renderQueue = [];
  }

  /**
   * Create and register an overlay
   */
  createOverlay(id, options = {}) {
    const overlay = {
      id,
      visible: options.visible !== false,
      zIndex: this.zIndexCounter++,
      elements: [],
      styles: options.styles || {},
      animations: options.animations || {},
      eventHandlers: {},
      timestamp: Date.now(),
    };

    this.overlays.set(id, overlay);
    return overlay;
  }

  /**
   * Show overlay
   */
  showOverlay(id) {
    const overlay = this.overlays.get(id);
    if (overlay) {
      overlay.visible = true;
      this.queueRender(id);
    }
  }

  /**
   * Hide overlay
   */
  hideOverlay(id) {
    const overlay = this.overlays.get(id);
    if (overlay) {
      overlay.visible = false;
      this.queueRender(id);
    }
  }

  /**
   * Add element to overlay
   */
  addElement(overlayId, element) {
    const overlay = this.overlays.get(overlayId);

    if (!overlay) {
      throw new Error(`Overlay ${overlayId} not found`);
    }

    const el = {
      id: generateId(),
      type: element.type,
      content: element.content || '',
      position: element.position || {x: 0, y: 0},
      size: element.size || {width: 100, height: 100},
      style: element.style || {},
      className: element.className || '',
    };

    overlay.elements.push(el);
    this.queueRender(overlayId);

    return el.id;
  }

  /**
   * Remove element from overlay
   */
  removeElement(overlayId, elementId) {
    const overlay = this.overlays.get(overlayId);

    if (!overlay) return false;

    const index = overlay.elements.findIndex((el) => el.id === elementId);

    if (index !== -1) {
      overlay.elements.splice(index, 1);
      this.queueRender(overlayId);
      return true;
    }

    return false;
  }

  /**
   * Update element
   */
  updateElement(overlayId, elementId, updates) {
    const overlay = this.overlays.get(overlayId);

    if (!overlay) return false;

    const element = overlay.elements.find((el) => el.id === elementId);

    if (!element) return false;

    Object.assign(element, updates);
    this.queueRender(overlayId);

    return true;
  }

  /**
   * Get overlay elements
   */
  getElements(overlayId) {
    const overlay = this.overlays.get(overlayId);
    return overlay ? overlay.elements : [];
  }

  /**
   * Queue render
   */
  queueRender(overlayId) {
    if (!this.renderQueue.includes(overlayId)) {
      this.renderQueue.push(overlayId);
    }
  }

  /**
   * Render all queued overlays
   */
  renderAll() {
    const rendered = [];

    for (const overlayId of this.renderQueue) {
      const overlay = this.overlays.get(overlayId);

      if (overlay) {
        rendered.push(this.renderOverlay(overlay));
      }
    }

    this.renderQueue = [];
    return rendered;
  }

  /**
   * Render single overlay
   */
  renderOverlay(overlay) {
    return {
      id: overlay.id,
      visible: overlay.visible,
      zIndex: overlay.zIndex,
      elementCount: overlay.elements.length,
      elements: overlay.elements,
    };
  }

  /**
   * Bring overlay to front
   */
  bringToFront(overlayId) {
    const overlay = this.overlays.get(overlayId);

    if (overlay) {
      overlay.zIndex = this.zIndexCounter++;
      this.queueRender(overlayId);
    }
  }

  /**
   * Send overlay to back
   */
  sendToBack(overlayId) {
    const overlay = this.overlays.get(overlayId);

    if (overlay) {
      overlay.zIndex = 1000;
      this.queueRender(overlayId);
    }
  }

  /**
   * Delete overlay
   */
  deleteOverlay(overlayId) {
    this.overlays.delete(overlayId);
  }
}

const globalRenderer = new OverlayRenderer();

/**
 * Get global overlay renderer
 */
export function getOverlayRenderer() {
  return globalRenderer;
}

/**
 * Save overlay configuration
 */
export async function saveOverlayConfig(overlayId) {
  try {
    const overlay = globalRenderer.overlays.get(overlayId);

    if (!overlay) {
      return {success: false, error: 'Overlay not found'};
    }

    const settings = await storage.loadSettings();

    if (!settings.overlayConfigs) {
      settings.overlayConfigs = {};
    }

    settings.overlayConfigs[overlayId] = {
      visible: overlay.visible,
      elements: overlay.elements,
      styles: overlay.styles,
    };

    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving overlay config:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Restore overlay configuration
 */
export async function restoreOverlayConfig(overlayId) {
  try {
    const settings = await storage.loadSettings();
    const config = settings.overlayConfigs?.[overlayId];

    if (!config) {
      return {success: false, error: 'Config not found'};
    }

    const overlay = globalRenderer.createOverlay(overlayId, {visible: config.visible});

    for (const element of config.elements) {
      overlay.elements.push(element);
    }

    overlay.styles = config.styles;

    return {success: true};
  } catch (error) {
    console.error('Error restoring overlay config:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Clear all overlays
 */
export function clearAllOverlays() {
  globalRenderer.overlays.clear();
  globalRenderer.renderQueue = [];
  return {success: true};
}

function generateId() {
  return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
