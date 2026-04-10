/**
 * I.R.I.S. Positioning & Layout System
 * ====================================
 * Position elements with grid/absolute/flex layouts
 */

import {storage} from '../Storage/clientStorage.js';

export const LAYOUT_MODES = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative',
  FLEX: 'flex',
  GRID: 'grid',
};

export const ALIGNMENT_OPTIONS = {
  horizontal: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'],
  vertical: ['flex-start', 'center', 'flex-end', 'stretch'],
};

/**
 * Position element in absolute layout
 */
export function positionAbsolute(element, x, y) {
  return {
    ...element,
    position: {
      mode: LAYOUT_MODES.ABSOLUTE,
      x,
      y,
    },
    style: {
      ...element.style,
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
    },
  };
}

/**
 * Position element in flex container
 */
export function positionFlex(element, options = {}) {
  const {flex = 1, alignSelf = 'center', margin = '0'} = options;

  return {
    ...element,
    position: {
      mode: LAYOUT_MODES.FLEX,
      flex,
      alignSelf,
      margin,
    },
    style: {
      ...element.style,
      flex,
      alignSelf,
      margin,
    },
  };
}

/**
 * Position element in grid layout
 */
export function positionGrid(element, options = {}) {
  const {
    column = 1,
    row = 1,
    columnSpan = 1,
    rowSpan = 1,
  } = options;

  return {
    ...element,
    position: {
      mode: LAYOUT_MODES.GRID,
      column,
      row,
      columnSpan,
      rowSpan,
    },
    style: {
      ...element.style,
      gridColumn: `${column} / span ${columnSpan}`,
      gridRow: `${row} / span ${rowSpan}`,
    },
  };
}

/**
 * Create flex container
 */
export function createFlexContainer(options = {}) {
  const {
    direction = 'row',
    justify = 'flex-start',
    align = 'flex-start',
    gap = '8px',
  } = options;

  return {
    style: {
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      gap,
    },
  };
}

/**
 * Create grid container
 */
export function createGridContainer(options = {}) {
  const {
    columns = 1,
    rows = 1,
    gap = '8px',
    autoFlow = 'row',
  } = options;

  return {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, auto)`,
      gap,
      autoFlow,
    },
  };
}

/**
 * Calculate element bounds
 */
export function getElementBounds(element) {
  if (element.position?.mode === LAYOUT_MODES.ABSOLUTE) {
    return {
      x: element.position.x,
      y: element.position.y,
      width: element.size?.width || 100,
      height: element.size?.height || 100,
    };
  }

  return null;
}

/**
 * Check if two elements overlap
 */
export function elementsOverlap(elem1, elem2) {
  const bounds1 = getElementBounds(elem1);
  const bounds2 = getElementBounds(elem2);

  if (!bounds1 || !bounds2) return false;

  return !(
    bounds1.x + bounds1.width < bounds2.x ||
    bounds2.x + bounds2.width < bounds1.x ||
    bounds1.y + bounds1.height < bounds2.y ||
    bounds2.y + bounds2.height < bounds1.y
  );
}

/**
 * Snap element to grid
 */
export function snapToGrid(element, gridSize = 8) {
  if (element.position?.mode !== LAYOUT_MODES.ABSOLUTE) {
    return element;
  }

  const snappedX = Math.round(element.position.x / gridSize) * gridSize;
  const snappedY = Math.round(element.position.y / gridSize) * gridSize;

  return positionAbsolute(element, snappedX, snappedY);
}

/**
 * Align multiple elements
 */
export function alignElements(elements, alignment) {
  // alignment: 'left' | 'right' | 'top' | 'bottom' | 'center'

  if (elements.length < 2) return elements;

  const bounds = elements.map((e) => getElementBounds(e)).filter((b) => b);

  if (bounds.length < elements.length) {
    return elements; // Skip if not all elements have absolute positioning
  }

  let alignValue;

  switch (alignment) {
    case 'left':
      alignValue = Math.min(...bounds.map((b) => b.x));
      return elements.map((e) => {
        const b = getElementBounds(e);
        return positionAbsolute(e, alignValue, b.y);
      });

    case 'right':
      alignValue = Math.max(...bounds.map((b) => b.x + b.width));
      return elements.map((e) => {
        const b = getElementBounds(e);
        return positionAbsolute(e, alignValue - b.width, b.y);
      });

    case 'top':
      alignValue = Math.min(...bounds.map((b) => b.y));
      return elements.map((e) => {
        const b = getElementBounds(e);
        return positionAbsolute(e, b.x, alignValue);
      });

    case 'bottom':
      alignValue = Math.max(...bounds.map((b) => b.y + b.height));
      return elements.map((e) => {
        const b = getElementBounds(e);
        return positionAbsolute(e, b.x, alignValue - b.height);
      });

    case 'center':
      const centerX = (Math.min(...bounds.map((b) => b.x)) + 
                       Math.max(...bounds.map((b) => b.x + b.width))) / 2;
      const centerY = (Math.min(...bounds.map((b) => b.y)) + 
                       Math.max(...bounds.map((b) => b.y + b.height))) / 2;

      return elements.map((e) => {
        const b = getElementBounds(e);
        return positionAbsolute(
          e,
          centerX - b.width / 2,
          centerY - b.height / 2
        );
      });

    default:
      return elements;
  }
}

/**
 * Distribute elements evenly
 */
export function distributeElements(elements, direction = 'horizontal', spacing = 8) {
  const bounds = elements.map((e) => getElementBounds(e)).filter((b) => b);

  if (bounds.length < elements.length) return elements;

  if (direction === 'horizontal') {
    let x = bounds[0].x;

    return elements.map((e) => {
      const result = positionAbsolute(e, x, bounds[0].y);
      x += bounds[0].width + spacing;
      return result;
    });
  } else {
    let y = bounds[0].y;

    return elements.map((e) => {
      const result = positionAbsolute(e, bounds[0].x, y);
      y += bounds[0].height + spacing;
      return result;
    });
  }
}

/**
 * Save layout to settings
 */
export async function saveLayout(name, elements) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.layoutConfigs) {
      settings.layoutConfigs = {};
    }

    settings.layoutConfigs[name] = elements;
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving layout:', error);
    return {success: false, error: error.message};
  }
}
