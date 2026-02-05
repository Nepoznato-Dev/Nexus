/**
 * I.R.I.S. Element Types System
 * =============================
 * Define and manage custom element types for overlays
 */

export const ELEMENT_TYPES = {
  TEXT: 'text',
  BUTTON: 'button',
  INPUT: 'input',
  PANEL: 'panel',
  BADGE: 'badge',
  TOOLTIP: 'tooltip',
  CHART: 'chart',
  IMAGE: 'image',
  VIDEO: 'video',
  CODE: 'code',
  DIVIDER: 'divider',
  GRID: 'grid',
};

/**
 * Element type definitions with validators
 */
export const ELEMENT_SCHEMAS = {
  [ELEMENT_TYPES.TEXT]: {
    name: 'Text',
    properties: {
      content: {type: 'string', required: true},
      fontSize: {type: 'number', default: 14},
      color: {type: 'string', default: '#000000'},
      fontWeight: {type: 'string', default: 'normal'},
      textAlign: {type: 'string', enum: ['left', 'center', 'right'], default: 'left'},
    },
  },

  [ELEMENT_TYPES.BUTTON]: {
    name: 'Button',
    properties: {
      label: {type: 'string', required: true},
      onClick: {type: 'function'},
      backgroundColor: {type: 'string', default: '#007bff'},
      textColor: {type: 'string', default: '#ffffff'},
      borderRadius: {type: 'number', default: 4},
      padding: {type: 'string', default: '8px 12px'},
      disabled: {type: 'boolean', default: false},
    },
  },

  [ELEMENT_TYPES.INPUT]: {
    name: 'Input',
    properties: {
      placeholder: {type: 'string'},
      value: {type: 'string', default: ''},
      onChange: {type: 'function'},
      type: {type: 'string', enum: ['text', 'number', 'email', 'password'], default: 'text'},
      borderColor: {type: 'string', default: '#cccccc'},
      backgroundColor: {type: 'string', default: '#ffffff'},
    },
  },

  [ELEMENT_TYPES.PANEL]: {
    name: 'Panel',
    properties: {
      title: {type: 'string'},
      backgroundColor: {type: 'string', default: '#ffffff'},
      borderColor: {type: 'string', default: '#cccccc'},
      borderWidth: {type: 'number', default: 1},
      borderRadius: {type: 'number', default: 4},
      padding: {type: 'string', default: '16px'},
      boxShadow: {type: 'string', default: 'none'},
      children: {type: 'array'},
    },
  },

  [ELEMENT_TYPES.BADGE]: {
    name: 'Badge',
    properties: {
      label: {type: 'string', required: true},
      variant: {
        type: 'string',
        enum: ['primary', 'success', 'warning', 'error', 'info'],
        default: 'primary',
      },
      size: {type: 'string', enum: ['small', 'medium', 'large'], default: 'medium'},
    },
  },

  [ELEMENT_TYPES.TOOLTIP]: {
    name: 'Tooltip',
    properties: {
      content: {type: 'string', required: true},
      placement: {
        type: 'string',
        enum: ['top', 'bottom', 'left', 'right'],
        default: 'top',
      },
      delay: {type: 'number', default: 200},
      backgroundColor: {type: 'string', default: '#000000'},
      textColor: {type: 'string', default: '#ffffff'},
    },
  },

  [ELEMENT_TYPES.CHART]: {
    name: 'Chart',
    properties: {
      chartType: {
        type: 'string',
        enum: ['line', 'bar', 'pie', 'area', 'scatter'],
        required: true,
      },
      data: {type: 'object', required: true},
      xAxis: {type: 'object'},
      yAxis: {type: 'object'},
      legend: {type: 'boolean', default: true},
    },
  },

  [ELEMENT_TYPES.IMAGE]: {
    name: 'Image',
    properties: {
      src: {type: 'string', required: true},
      alt: {type: 'string', default: ''},
      width: {type: 'number'},
      height: {type: 'number'},
      borderRadius: {type: 'number', default: 0},
      objectFit: {type: 'string', enum: ['cover', 'contain', 'fill'], default: 'cover'},
    },
  },

  [ELEMENT_TYPES.CODE]: {
    name: 'Code',
    properties: {
      code: {type: 'string', required: true},
      language: {type: 'string', default: 'javascript'},
      lineNumbers: {type: 'boolean', default: true},
      highlightLines: {type: 'array', default: []},
      theme: {type: 'string', default: 'dark'},
    },
  },

  [ELEMENT_TYPES.DIVIDER]: {
    name: 'Divider',
    properties: {
      color: {type: 'string', default: '#cccccc'},
      thickness: {type: 'number', default: 1},
      margin: {type: 'string', default: '12px 0'},
      style: {type: 'string', enum: ['solid', 'dashed', 'dotted'], default: 'solid'},
    },
  },

  [ELEMENT_TYPES.GRID]: {
    name: 'Grid',
    properties: {
      columns: {type: 'number', required: true},
      gap: {type: 'string', default: '8px'},
      children: {type: 'array'},
    },
  },
};

/**
 * Validate element against schema
 */
export function validateElement(type, properties) {
  const schema = ELEMENT_SCHEMAS[type];

  if (!schema) {
    return {valid: false, errors: [`Unknown element type: ${type}`]};
  }

  const errors = [];

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    // Check required
    if (propSchema.required && !(propName in properties)) {
      errors.push(`Missing required property: ${propName}`);
      continue;
    }

    // Check type
    if (propName in properties) {
      const value = properties[propName];
      const valueType = typeof value;

      if (propSchema.type !== valueType && propSchema.type !== 'array') {
        errors.push(
          `Property ${propName}: expected ${propSchema.type}, got ${valueType}`
        );
      }

      // Check enum
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(
          `Property ${propName}: value must be one of ${propSchema.enum.join(', ')}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default properties for element type
 */
export function getDefaultProperties(type) {
  const schema = ELEMENT_SCHEMAS[type];

  if (!schema) return {};

  const defaults = {};

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    if ('default' in propSchema) {
      defaults[propName] = propSchema.default;
    }
  }

  return defaults;
}

/**
 * Get schema for element type
 */
export function getElementSchema(type) {
  return ELEMENT_SCHEMAS[type] || null;
}

/**
 * Create element from type
 */
export function createElement(type, properties = {}) {
  // Validate
  const validation = validateElement(type, properties);

  if (!validation.valid) {
    throw new Error(`Invalid element: ${validation.errors.join(', ')}`);
  }

  // Get defaults
  const defaults = getDefaultProperties(type);

  // Merge
  return {
    type,
    properties: {...defaults, ...properties},
  };
}

/**
 * List all available element types
 */
export function getAvailableElementTypes() {
  return Object.entries(ELEMENT_SCHEMAS).map(([type, schema]) => ({
    type,
    name: schema.name,
    properties: Object.keys(schema.properties),
  }));
}

/**
 * Get properties for element type
 */
export function getElementProperties(type) {
  const schema = ELEMENT_SCHEMAS[type];

  if (!schema) return {};

  return schema.properties;
}
