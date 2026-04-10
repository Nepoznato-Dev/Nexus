/**
 * I.R.I.S. Auto-Save System
 * =========================
 * Automatic saving with configurable intervals
 */

import {storage} from '../Storage/clientStorage.js';

export class AutoSaveManager {
  constructor() {
    this.enabled = true;
    this.interval = 30000; // 30 seconds
    this.lastSaveTime = null;
    this.pendingChanges = new Set();
    this.intervalId = null;
    this.stats = {
      totalSaves: 0,
      lastSaveSize: 0,
      errors: 0,
    };
  }

  /**
   * Start auto-save
   */
  start() {
    if (this.intervalId) return; // Already running

    this.enabled = true;
    this.intervalId = setInterval(() => {
      this.performAutoSave();
    }, this.interval);
  }

  /**
   * Stop auto-save
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.enabled = false;
  }

  /**
   * Mark change pending
   */
  markPending(category) {
    this.pendingChanges.add(category);
  }

  /**
   * Clear pending
   */
  clearPending(category) {
    this.pendingChanges.delete(category);
  }

  /**
   * Check if there are pending changes
   */
  hasPendingChanges() {
    return this.pendingChanges.size > 0;
  }

  /**
   * Perform auto-save
   */
  async performAutoSave() {
    if (!this.hasPendingChanges()) {
      return;
    }

    try {
      const settings = await storage.loadSettings();

      // Save entire settings object
      const dataSize = JSON.stringify(settings).length;

      await storage.saveSettings(settings);

      this.lastSaveTime = Date.now();
      this.stats.totalSaves++;
      this.stats.lastSaveSize = dataSize;
      this.stats.errors = 0;

      this.clearPending('all');
    } catch (error) {
      console.error('Auto-save error:', error);
      this.stats.errors++;
    }
  }

  /**
   * Set auto-save interval
   */
  setInterval(ms) {
    if (ms < 5000) {
      console.warn('Auto-save interval too short, setting to 5 seconds');
      ms = 5000;
    }

    this.interval = ms;

    // Restart with new interval
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get auto-save status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      interval: this.interval,
      lastSaveTime: this.lastSaveTime,
      pendingChanges: Array.from(this.pendingChanges),
      hasPendingChanges: this.hasPendingChanges(),
      totalSaves: this.stats.totalSaves,
      lastSaveSize: this.stats.lastSaveSize,
      errors: this.stats.errors,
    };
  }

  /**
   * Force save now
   */
  async forceSave() {
    return await this.performAutoSave();
  }
}

const globalAutoSaveManager = new AutoSaveManager();

/**
 * Get global auto-save manager
 */
export function getAutoSaveManager() {
  return globalAutoSaveManager;
}

/**
 * Initialize auto-save
 */
export async function initializeAutoSave(intervalMs = 30000) {
  try {
    const settings = await storage.loadSettings();

    globalAutoSaveManager.setInterval(intervalMs);
    globalAutoSaveManager.start();

    return {
      success: true,
      message: 'Auto-save initialized',
      interval: intervalMs,
    };
  } catch (error) {
    console.error('Error initializing auto-save:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Disable auto-save
 */
export function disableAutoSave() {
  globalAutoSaveManager.stop();
  return {success: true};
}

/**
 * Enable auto-save
 */
export function enableAutoSave() {
  globalAutoSaveManager.start();
  return {success: true};
}

/**
 * Save auto-save configuration
 */
export async function saveAutoSaveConfig(config) {
  try {
    const settings = await storage.loadSettings();

    if (!settings.autoSaveConfig) {
      settings.autoSaveConfig = {};
    }

    settings.autoSaveConfig = {
      enabled: config.enabled !== false,
      interval: config.interval || 30000,
    };

    await storage.saveSettings(settings);

    if (config.enabled === false) {
      globalAutoSaveManager.stop();
    } else {
      globalAutoSaveManager.setInterval(config.interval);
      globalAutoSaveManager.start();
    }

    return {success: true};
  } catch (error) {
    console.error('Error saving auto-save config:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Load auto-save configuration
 */
export async function loadAutoSaveConfig() {
  try {
    const settings = await storage.loadSettings();
    const config = settings?.autoSaveConfig || {enabled: true, interval: 30000};

    if (config.enabled) {
      globalAutoSaveManager.setInterval(config.interval);
      globalAutoSaveManager.start();
    }

    return {success: true, config};
  } catch (error) {
    console.error('Error loading auto-save config:', error);
    return {success: false, error: error.message};
  }
}
