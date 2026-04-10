/**
 * I.R.I.S. Protected Regions System
 * =================================
 * Protect specific areas from editing, resizing, or movement
 */

import {storage} from '../Storage/clientStorage.js';

export class ProtectedRegion {
  constructor(id, bounds, options = {}) {
    this.id = id;
    this.bounds = bounds; // {x, y, width, height}
    this.label = options.label || 'Protected Region';
    this.protection = {
      preventEdit: options.preventEdit !== false,
      preventResize: options.preventResize !== false,
      preventMove: options.preventMove !== false,
      preventDelete: options.preventDelete !== false,
    };
    this.created = Date.now();
  }

  /**
   * Check if point is inside region
   */
  contains(x, y) {
    return (
      x >= this.bounds.x &&
      x <= this.bounds.x + this.bounds.width &&
      y >= this.bounds.y &&
      y <= this.bounds.y + this.bounds.height
    );
  }

  /**
   * Check if element overlaps region
   */
  overlaps(elementBounds) {
    return !(
      elementBounds.x + elementBounds.width < this.bounds.x ||
      this.bounds.x + this.bounds.width < elementBounds.x ||
      elementBounds.y + elementBounds.height < this.bounds.y ||
      this.bounds.y + this.bounds.height < elementBounds.y
    );
  }

  /**
   * Export region
   */
  export() {
    return {
      id: this.id,
      bounds: this.bounds,
      label: this.label,
      protection: this.protection,
      created: this.created,
    };
  }
}

/**
 * Create protected region
 */
export async function createProtectedRegion(bounds, options = {}) {
  try {
    const region = new ProtectedRegion(generateId(), bounds, options);

    const settings = await storage.loadSettings();
    if (!settings.protectedRegions) {
      settings.protectedRegions = [];
    }

    settings.protectedRegions.push(region.export());
    await storage.saveSettings(settings);

    return {success: true, regionId: region.id};
  } catch (error) {
    console.error('Error creating protected region:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get all protected regions
 */
export async function getProtectedRegions() {
  try {
    const settings = await storage.loadSettings();
    return settings?.protectedRegions || [];
  } catch (error) {
    console.error('Error getting protected regions:', error);
    return [];
  }
}

/**
 * Delete protected region
 */
export async function deleteProtectedRegion(regionId) {
  try {
    const settings = await storage.loadSettings();
    settings.protectedRegions = (settings.protectedRegions || []).filter(
      (r) => r.id !== regionId
    );
    await storage.saveSettings(settings);

    return {success: true, deleted: regionId};
  } catch (error) {
    console.error('Error deleting protected region:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Check if action is allowed
 */
export async function isActionAllowed(elementBounds, action) {
  try {
    const regions = await getProtectedRegions();

    for (const regionData of regions) {
      const region = new ProtectedRegion(regionData.id, regionData.bounds, regionData);

      if (region.overlaps(elementBounds)) {
        switch (action) {
          case 'edit':
            if (region.protection.preventEdit) return false;
            break;
          case 'resize':
            if (region.protection.preventResize) return false;
            break;
          case 'move':
            if (region.protection.preventMove) return false;
            break;
          case 'delete':
            if (region.protection.preventDelete) return false;
            break;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking action allowed:', error);
    return true; // Default to allow if error
  }
}

/**
 * Get protection status
 */
export async function getProtectionStatus(elementBounds) {
  try {
    const regions = await getProtectedRegions();
    const status = {
      isProtected: false,
      regions: [],
      protectionMap: {
        edit: false,
        resize: false,
        move: false,
        delete: false,
      },
    };

    for (const regionData of regions) {
      const region = new ProtectedRegion(regionData.id, regionData.bounds, regionData);

      if (region.overlaps(elementBounds)) {
        status.isProtected = true;
        status.regions.push(region.label);

        // Update protection map
        if (region.protection.preventEdit) status.protectionMap.edit = true;
        if (region.protection.preventResize) status.protectionMap.resize = true;
        if (region.protection.preventMove) status.protectionMap.move = true;
        if (region.protection.preventDelete) status.protectionMap.delete = true;
      }
    }

    return status;
  } catch (error) {
    console.error('Error getting protection status:', error);
    return {
      isProtected: false,
      regions: [],
      protectionMap: {edit: false, resize: false, move: false, delete: false},
    };
  }
}

/**
 * List all protected regions
 */
export async function listProtectedRegions() {
  try {
    const regions = await getProtectedRegions();

    return regions.map((r) => ({
      id: r.id,
      label: r.label,
      bounds: r.bounds,
      protections: Object.keys(r.protection).filter((k) => r.protection[k]),
    }));
  } catch (error) {
    console.error('Error listing protected regions:', error);
    return [];
  }
}

function generateId() {
  return `region_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
