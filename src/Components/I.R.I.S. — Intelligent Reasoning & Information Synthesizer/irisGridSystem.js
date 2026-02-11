/**
 * I.R.I.S. Grid & Snapping System
 * ===============================
 * Snap elements to grid for precise alignment
 */

export const GRID_MODES = {
  OFF: 'off',
  GRID: 'grid',
  GUIDES: 'guides',
  BOTH: 'both',
};

export class GridSystem {
  constructor(size = 8) {
    this.size = size;
    this.mode = GRID_MODES.GRID;
    this.visible = true;
    this.guides = [];
    this.snapThreshold = 5;
  }

  /**
   * Set grid size
   */
  setGridSize(size) {
    this.size = Math.max(1, size);
  }

  /**
   * Set grid mode
   */
  setGridMode(mode) {
    if (Object.values(GRID_MODES).includes(mode)) {
      this.mode = mode;
    }
  }

  /**
   * Toggle grid visibility
   */
  toggleGridVisibility() {
    this.visible = !this.visible;
    return this.visible;
  }

  /**
   * Snap position to grid
   */
  snapPosition(x, y) {
    if (this.mode === GRID_MODES.OFF) {
      return {x, y};
    }

    const snappedX = Math.round(x / this.size) * this.size;
    const snappedY = Math.round(y / this.size) * this.size;

    return {x: snappedX, y: snappedY};
  }

  /**
   * Snap size to grid
   */
  snapSize(width, height) {
    if (this.mode === GRID_MODES.OFF) {
      return {width, height};
    }

    const snappedWidth = Math.round(width / this.size) * this.size;
    const snappedHeight = Math.round(height / this.size) * this.size;

    return {width: snappedWidth, height: snappedHeight};
  }

  /**
   * Check if position is near a guide
   */
  checkGuideSnap(x, y) {
    const snap = {
      x: null,
      y: null,
      snappedX: x,
      snappedY: y,
    };

    // Check vertical guides
    for (const guide of this.guides) {
      if (guide.type === 'vertical') {
        if (Math.abs(x - guide.position) < this.snapThreshold) {
          snap.x = guide.position;
          snap.snappedX = guide.position;
        }
      }

      // Check horizontal guides
      if (guide.type === 'horizontal') {
        if (Math.abs(y - guide.position) < this.snapThreshold) {
          snap.y = guide.position;
          snap.snappedY = guide.position;
        }
      }
    }

    return snap;
  }

  /**
   * Create vertical guide
   */
  addVerticalGuide(x, label = null) {
    const guide = {
      id: generateId(),
      type: 'vertical',
      position: x,
      label,
    };

    this.guides.push(guide);
    return guide;
  }

  /**
   * Create horizontal guide
   */
  addHorizontalGuide(y, label = null) {
    const guide = {
      id: generateId(),
      type: 'horizontal',
      position: y,
      label,
    };

    this.guides.push(guide);
    return guide;
  }

  /**
   * Remove guide
   */
  removeGuide(guideId) {
    this.guides = this.guides.filter((g) => g.id !== guideId);
  }

  /**
   * Clear all guides
   */
  clearGuides() {
    this.guides = [];
  }

  /**
   * Get all guides
   */
  getGuides() {
    return this.guides;
  }

  /**
   * Enable smart guides (auto-detect edges and centers)
   */
  smartSnap(elements, movingElement) {
    const snap = {
      x: null,
      y: null,
    };

    const movingBounds = {
      left: movingElement.x,
      right: movingElement.x + movingElement.width,
      centerX: movingElement.x + movingElement.width / 2,
      top: movingElement.y,
      bottom: movingElement.y + movingElement.height,
      centerY: movingElement.y + movingElement.height / 2,
    };

    for (const element of elements) {
      if (element === movingElement) continue;

      const eBounds = {
        left: element.x,
        right: element.x + element.width,
        centerX: element.x + element.width / 2,
        top: element.y,
        bottom: element.y + element.height,
        centerY: element.y + element.height / 2,
      };

      // Check X axis
      for (const key of ['left', 'right', 'centerX']) {
        if (Math.abs(movingBounds[key] - eBounds[key]) < this.snapThreshold) {
          snap.x = eBounds[key] - (movingBounds[key] - movingElement.x);
        }
      }

      // Check Y axis
      for (const key of ['top', 'bottom', 'centerY']) {
        if (Math.abs(movingBounds[key] - eBounds[key]) < this.snapThreshold) {
          snap.y = eBounds[key] - (movingBounds[key] - movingElement.y);
        }
      }
    }

    return snap;
  }

  /**
   * Get grid data for rendering
   */
  getGridData(containerWidth, containerHeight) {
    const gridData = {
      size: this.size,
      lines: [],
    };

    // Vertical lines
    for (let x = 0; x < containerWidth; x += this.size) {
      gridData.lines.push({type: 'vertical', position: x});
    }

    // Horizontal lines
    for (let y = 0; y < containerHeight; y += this.size) {
      gridData.lines.push({type: 'horizontal', position: y});
    }

    return gridData;
  }

  /**
   * Export grid configuration
   */
  export() {
    return {
      size: this.size,
      mode: this.mode,
      visible: this.visible,
      guides: this.guides,
      snapThreshold: this.snapThreshold,
    };
  }
}

const globalGrid = new GridSystem();

/**
 * Get global grid system
 */
export function getGridSystem() {
  return globalGrid;
}

function generateId() {
  return `guide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
