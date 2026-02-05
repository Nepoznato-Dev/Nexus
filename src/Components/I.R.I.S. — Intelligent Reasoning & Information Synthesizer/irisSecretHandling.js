/**
 * I.R.I.S. Secret Handling System
 * ===============================
 * Encrypt and manage sensitive data (API keys, passwords, etc.)
 */

import {storage} from '../Storage/clientStorage.js';

/**
 * Simple encryption (base64 + obfuscation)
 * Note: For production, use proper encryption libraries like libsodium
 */
export function encryptSecret(secret, key = 'default') {
  try {
    const combined = `${secret}:${key}`;
    const encoded = btoa(combined);
    const reversed = encoded.split('').reverse().join('');
    return `encrypted_${reversed}`;
  } catch (error) {
    console.error('Error encrypting secret:', error);
    return null;
  }
}

/**
 * Decrypt secret
 */
export function decryptSecret(encrypted, key = 'default') {
  try {
    if (!encrypted.startsWith('encrypted_')) {
      throw new Error('Invalid encrypted format');
    }

    const reversed = encrypted.replace('encrypted_', '').split('').reverse().join('');
    const combined = atob(reversed);
    const [secret, storedKey] = combined.split(':');

    if (storedKey !== key) {
      throw new Error('Invalid decryption key');
    }

    return secret;
  } catch (error) {
    console.error('Error decrypting secret:', error);
    return null;
  }
}

/**
 * Store a secret securely
 */
export async function storeSecret(name, value, category = 'general') {
  try {
    const settings = await storage.loadSettings();

    if (!settings.secrets) {
      settings.secrets = {};
    }

    if (!settings.secrets[category]) {
      settings.secrets[category] = [];
    }

    const secret = {
      id: generateId(),
      name,
      value: encryptSecret(value),
      category,
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0,
    };

    settings.secrets[category].push(secret);

    // Log secret storage
    await logSecretActivity({
      action: 'store',
      secretName: name,
      category,
      timestamp: Date.now(),
    });

    await storage.saveSettings(settings);

    return {success: true, secretId: secret.id};
  } catch (error) {
    console.error('Error storing secret:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Retrieve a secret
 */
export async function retrieveSecret(secretId, category = 'general') {
  try {
    const settings = await storage.loadSettings();
    const secrets = settings.secrets?.[category] || [];
    const secret = secrets.find((s) => s.id === secretId);

    if (!secret) {
      return {success: false, error: 'Secret not found'};
    }

    // Update access tracking
    secret.accessed = Date.now();
    secret.accessCount = (secret.accessCount || 0) + 1;
    await storage.saveSettings(settings);

    // Log access
    await logSecretActivity({
      action: 'retrieve',
      secretId,
      category,
      timestamp: Date.now(),
    });

    return {
      success: true,
      value: decryptSecret(secret.value),
      metadata: {
        created: secret.created,
        accessCount: secret.accessCount,
        lastAccessed: secret.accessed,
      },
    };
  } catch (error) {
    console.error('Error retrieving secret:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Delete a secret
 */
export async function deleteSecret(secretId, category = 'general') {
  try {
    const settings = await storage.loadSettings();
    const secrets = settings.secrets?.[category] || [];

    settings.secrets[category] = secrets.filter((s) => s.id !== secretId);

    await logSecretActivity({
      action: 'delete',
      secretId,
      category,
      timestamp: Date.now(),
    });

    await storage.saveSettings(settings);

    return {success: true, deleted: secretId};
  } catch (error) {
    console.error('Error deleting secret:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Update a secret
 */
export async function updateSecret(secretId, newValue, category = 'general') {
  try {
    const settings = await storage.loadSettings();
    const secrets = settings.secrets?.[category] || [];
    const secret = secrets.find((s) => s.id === secretId);

    if (!secret) {
      return {success: false, error: 'Secret not found'};
    }

    secret.value = encryptSecret(newValue);
    secret.updated = Date.now();

    await logSecretActivity({
      action: 'update',
      secretId,
      category,
      timestamp: Date.now(),
    });

    await storage.saveSettings(settings);

    return {success: true, updated: secretId};
  } catch (error) {
    console.error('Error updating secret:', error);
    return {success: false, error: error.message};
  }
}

/**
 * List secrets (metadata only, no values)
 */
export async function listSecrets(category = 'general') {
  try {
    const settings = await storage.loadSettings();
    const secrets = settings.secrets?.[category] || [];

    return secrets.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      created: s.created,
      accessed: s.accessed,
      accessCount: s.accessCount,
    }));
  } catch (error) {
    console.error('Error listing secrets:', error);
    return [];
  }
}

/**
 * Get all secret categories
 */
export async function getSecretCategories() {
  try {
    const settings = await storage.loadSettings();
    return Object.keys(settings.secrets || {});
  } catch (error) {
    console.error('Error getting secret categories:', error);
    return [];
  }
}

/**
 * Export secrets (encrypted)
 */
export async function exportSecrets(category = null) {
  try {
    const settings = await storage.loadSettings();
    const secrets = settings.secrets || {};

    const toExport = category ? {[category]: secrets[category] || []} : secrets;

    return {
      success: true,
      data: toExport,
      filename: `secrets_${Date.now()}.json`,
      warning: 'These secrets are encrypted but should be handled carefully',
    };
  } catch (error) {
    console.error('Error exporting secrets:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Import secrets (encrypted)
 */
export async function importSecrets(data, category = 'general') {
  try {
    const settings = await storage.loadSettings();

    if (!settings.secrets) {
      settings.secrets = {};
    }

    if (!settings.secrets[category]) {
      settings.secrets[category] = [];
    }

    let imported = 0;

    for (const secret of data[category] || []) {
      // Check for duplicates
      if (!settings.secrets[category].find((s) => s.id === secret.id)) {
        settings.secrets[category].push(secret);
        imported++;
      }
    }

    await storage.saveSettings(settings);

    return {success: true, imported};
  } catch (error) {
    console.error('Error importing secrets:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Clear all secrets in category
 */
export async function clearSecrets(category = 'general') {
  try {
    const settings = await storage.loadSettings();

    if (settings.secrets) {
      settings.secrets[category] = [];
    }

    await logSecretActivity({
      action: 'clear',
      category,
      timestamp: Date.now(),
    });

    await storage.saveSettings(settings);

    return {success: true, cleared: category};
  } catch (error) {
    console.error('Error clearing secrets:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get secret activity log
 */
export async function getSecretActivityLog(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const log = settings.secretActivityLog || [];
    return log.slice(-limit);
  } catch (error) {
    console.error('Error getting activity log:', error);
    return [];
  }
}

/**
 * Internal: Log secret activities
 */
async function logSecretActivity(activity) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.secretActivityLog) {
      settings.secretActivityLog = [];
    }

    settings.secretActivityLog.push(activity);

    // Keep last 500 activities
    if (settings.secretActivityLog.length > 500) {
      settings.secretActivityLog = settings.secretActivityLog.slice(-500);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging secret activity:', error);
  }
}

function generateId() {
  return `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
