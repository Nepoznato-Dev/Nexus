/**
 * I.R.I.S. Layers Panel
 * =====================
 * Manage z-index, visibility, and grouping of elements
 */

import {storage} from '../Storage/clientStorage.js';

export class Layer {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.visible = true;
    this.locked = false;
    this.opacity = 1;
    this.blendMode = 'normal';
    this.parent = null;
    this.children = [];
  }

  toggle() {
    this.visible = !this.visible;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  export() {
    return {
      id: this.id,
      name: this.name,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      blendMode: this.blendMode,
      parent: this.parent?.id,
      childrenCount: this.children.length,
    };
  }
}

export class LayersPanel {
  constructor() {
    this.layers = new Map();
    this.root = new Layer('root', 'Root');
    this.selectedLayer = null;
    this.layerHistory = [];
  }

  /**
   * Create a new layer
   */
  createLayer(name, options = {}) {
    const layer = new Layer(generateId(), name);

    if (options.parent) {
      const parent = this.layers.get(options.parent);
      if (parent) {
        layer.parent = parent;
        parent.children.push(layer);
      }
    } else {
      this.root.children.push(layer);
    }

    this.layers.set(layer.id, layer);
    this.recordHistory('create', layer);

    return layer;
  }

  /**
   * Delete layer
   */
  deleteLayer(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    // Remove from parent
    if (layer.parent) {
      layer.parent.children = layer.parent.children.filter((l) => l.id !== layerId);
    } else {
      this.root.children = this.root.children.filter((l) => l.id !== layerId);
    }

    this.layers.delete(layerId);
    this.recordHistory('delete', layer);

    return true;
  }

  /**
   * Rename layer
   */
  renameLayer(layerId, newName) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    const oldName = layer.name;
    layer.name = newName;
    this.recordHistory('rename', layer, {from: oldName, to: newName});

    return true;
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.toggle();
    this.recordHistory('toggleVisibility', layer);

    return true;
  }

  /**
   * Lock/unlock layer
   */
  toggleLayerLock(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    if (layer.locked) {
      layer.unlock();
    } else {
      layer.lock();
    }

    this.recordHistory('toggleLock', layer);

    return true;
  }

  /**
   * Set layer opacity
   */
  setLayerOpacity(layerId, opacity) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.opacity = Math.max(0, Math.min(1, opacity));
    return true;
  }

  /**
   * Set layer blend mode
   */
  setLayerBlendMode(layerId, blendMode) {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.blendMode = blendMode;
    return true;
  }

  /**
   * Select layer
   */
  selectLayer(layerId) {
    this.selectedLayer = this.layers.get(layerId) || null;
    return this.selectedLayer !== null;
  }

  /**
   * Get all layers (flat list)
   */
  getAllLayers() {
    return Array.from(this.layers.values());
  }

  /**
   * Get layer hierarchy
   */
  getHierarchy(parent = null) {
    const root = parent || this.root;

    return {
      id: root.id,
      name: root.name,
      visible: root.visible,
      locked: root.locked,
      children: root.children.map((child) => this.getHierarchy(child)),
    };
  }

  /**
   * Move layer up in hierarchy
   */
  moveLayerUp(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer || !layer.parent) return false;

    const children = layer.parent.children;
    const index = children.indexOf(layer);

    if (index < children.length - 1) {
      [children[index], children[index + 1]] = [children[index + 1], children[index]];
      return true;
    }

    return false;
  }

  /**
   * Move layer down in hierarchy
   */
  moveLayerDown(layerId) {
    const layer = this.layers.get(layerId);
    if (!layer || !layer.parent) return false;

    const children = layer.parent.children;
    const index = children.indexOf(layer);

    if (index > 0) {
      [children[index], children[index - 1]] = [children[index - 1], children[index]];
      return true;
    }

    return false;
  }

  /**
   * Group layers
   */
  groupLayers(layerIds, groupName) {
    const group = this.createLayer(groupName);

    for (const layerId of layerIds) {
      const layer = this.layers.get(layerId);
      if (layer && layer !== group) {
        // Move to group
        if (layer.parent) {
          layer.parent.children = layer.parent.children.filter(
            (l) => l.id !== layerId
          );
        }

        layer.parent = group;
        group.children.push(layer);
      }
    }

    return group;
  }

  /**
   * Record action in history
   */
  recordHistory(action, layer, metadata = {}) {
    this.layerHistory.push({
      action,
      layerId: layer.id,
      timestamp: Date.now(),
      metadata,
    });

    // Keep last 100 actions
    if (this.layerHistory.length > 100) {
      this.layerHistory.shift();
    }
  }

  /**
   * Export layers as JSON
   */
  exportLayers() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      hierarchy: this.getHierarchy(),
    };
  }
}

const globalLayersPanel = new LayersPanel();

/**
 * Get global layers panel
 */
export function getLayersPanel() {
  return globalLayersPanel;
}

/**
 * Save layers configuration
 */
export async function saveLayersConfig() {
  try {
    const settings = await storage.loadSettings();
    settings.layersConfig = globalLayersPanel.exportLayers();
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving layers:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
