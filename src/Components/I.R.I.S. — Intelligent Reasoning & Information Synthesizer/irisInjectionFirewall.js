/**
 * I.R.I.S. Injection Firewall
 * ===========================
 * Prevent code injection and malicious inputs
 */

import {storage} from '../Storage/clientStorage.js';

export const INJECTION_TYPES = {
  XSS: 'xss',
  SQL: 'sql',
  COMMAND: 'command',
  PATH: 'path',
};

/**
 * Sanitize input string
 */
export function sanitizeInput(input, options = {}) {
  const {type = 'text', maxLength = 1000} = options;

  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Enforce length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  switch (type) {
    case 'text':
      sanitized = sanitizeText(sanitized);
      break;
    case 'html':
      sanitized = sanitizeHTML(sanitized);
      break;
    case 'url':
      sanitized = sanitizeURL(sanitized);
      break;
    case 'json':
      sanitized = sanitizeJSON(sanitized);
      break;
  }

  return sanitized;
}

/**
 * Sanitize plain text
 */
function sanitizeText(text) {
  return text
    .replace(/[<>\"'\`]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitize HTML (strip dangerous tags)
 */
function sanitizeHTML(html) {
  const element = document.createElement('div');
  element.textContent = html;
  return element.innerHTML;
}

/**
 * Sanitize URL
 */
function sanitizeURL(url) {
  try {
    const parsed = new URL(url);

    // Allow only safe protocols
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return '';
    }

    // No javascript: protocol
    if (url.toLowerCase().includes('javascript:')) {
      return '';
    }

    return url;
  } catch {
    return '';
  }
}

/**
 * Sanitize JSON
 */
function sanitizeJSON(json) {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}

/**
 * Detect potential injection attack
 */
export function detectInjection(input) {
  const suspiciousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /union\s+select/gi,
    /'[\s\S]*?or[\s\S]*?'/gi,
    /--/g,
    /;[\s\S]*?drop/gi,
  ];

  const detected = {
    isSuspicious: false,
    type: null,
    patterns: [],
    severity: 'low',
  };

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      detected.isSuspicious = true;
      detected.patterns.push(pattern.source);
    }
  }

  if (detected.patterns.includes('/<script') || detected.patterns.includes('javascript:')) {
    detected.type = INJECTION_TYPES.XSS;
    detected.severity = 'high';
  } else if (detected.patterns.includes('union') || detected.patterns.includes('select')) {
    detected.type = INJECTION_TYPES.SQL;
    detected.severity = 'critical';
  }

  return detected;
}

/**
 * Validate input against rules
 */
export function validateInput(input, rules = {}) {
  const {
    maxLength = Infinity,
    allowedChars = null,
    minLength = 0,
    pattern = null,
  } = rules;

  const validation = {
    valid: true,
    errors: [],
  };

  // Length checks
  if (input.length > maxLength) {
    validation.valid = false;
    validation.errors.push(`Input exceeds max length of ${maxLength}`);
  }

  if (input.length < minLength) {
    validation.valid = false;
    validation.errors.push(`Input less than min length of ${minLength}`);
  }

  // Allowed characters check
  if (allowedChars) {
    const regex = new RegExp(`[^${allowedChars}]`);
    if (regex.test(input)) {
      validation.valid = false;
      validation.errors.push('Input contains disallowed characters');
    }
  }

  // Pattern check
  if (pattern && !pattern.test(input)) {
    validation.valid = false;
    validation.errors.push('Input does not match required pattern');
  }

  return validation;
}

/**
 * Create input filter rule
 */
export async function createFilterRule(field, rules) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.inputFilters) {
      settings.inputFilters = {};
    }

    settings.inputFilters[field] = rules;
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error creating filter rule:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get input filter rules
 */
export async function getFilterRules() {
  try {
    const settings = await storage.loadSettings();
    return settings?.inputFilters || {};
  } catch (error) {
    console.error('Error getting filter rules:', error);
    return {};
  }
}

/**
 * Log injection attempt
 */
export async function logInjectionAttempt(attempt) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.injectionLog) {
      settings.injectionLog = [];
    }

    settings.injectionLog.push({
      timestamp: Date.now(),
      ...attempt,
    });

    // Keep last 1000 attempts
    if (settings.injectionLog.length > 1000) {
      settings.injectionLog = settings.injectionLog.slice(-1000);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging injection attempt:', error);
  }
}

/**
 * Get injection attempt history
 */
export async function getInjectionAttempts(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const log = settings?.injectionLog || [];
    return log.slice(-limit);
  } catch (error) {
    console.error('Error getting injection attempts:', error);
    return [];
  }
}
