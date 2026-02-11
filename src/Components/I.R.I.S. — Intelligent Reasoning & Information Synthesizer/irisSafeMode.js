/**
 * I.R.I.S. Safe Mode Boot System
 * ==============================
 * Start Nexus with minimal UI for diagnostics
 */

import {storage} from '../Storage/clientStorage.js';

export const SAFE_MODE_CONFIG = {
  disabledFeatures: [
    'CUSTOM_OVERLAYS_ENABLED',
    'PERSONALITY_ENHANCER_ENABLED',
    'REAL_TIME_ANALYSIS_ENABLED',
    'COMMAND_PALETTE_ENABLED',
    'DARK_MODE_ENABLED',
    'EXPERIMENTAL_FEATURES_ENABLED',
  ],
  theme: 'light',
  maxConsoleLines: 1000,
  collectDiagnostics: true,
};

/**
 * Check if currently in safe mode
 */
export function isSafeModeActive() {
  const params = new URLSearchParams(window.location.search);
  return params.get('safeMode') === 'true' || sessionStorage.getItem('safeMode') === 'true';
}

/**
 * Detect safe mode query parameter or keyboard shortcut
 */
export function detectSafeMode() {
  const params = new URLSearchParams(window.location.search);

  // URL parameter
  if (params.get('safeMode') === 'true') {
    return 'url';
  }

  // Shift held (detected externally, we just check)
  // This would be detected in main app initialization

  // Otherwise not in safe mode
  return null;
}

/**
 * Initialize safe mode
 */
export async function initializeSafeMode() {
  try {
    console.log('🛡️ Entering Safe Mode...');

    sessionStorage.setItem('safeMode', 'true');

    // Disable features
    const featureFlags = await import('./irisFeatureFlags.js');
    for (const flag of SAFE_MODE_CONFIG.disabledFeatures) {
      await featureFlags.setFeatureFlag(flag, false);
    }

    // Force light theme
    document.documentElement.setAttribute('data-theme', 'light');

    // Clear console history
    window.irisConsoleHistory = [];

    // Start diagnostics
    const diagnostics = await collectDiagnostics();

    console.log('✅ Safe Mode initialized', diagnostics);

    return {
      success: true,
      diagnostics,
      activationMethod: detectSafeMode(),
    };
  } catch (error) {
    console.error('❌ Error initializing safe mode:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Exit safe mode
 */
export async function exitSafeMode() {
  try {
    console.log('🚀 Exiting Safe Mode...');

    sessionStorage.removeItem('safeMode');

    // Re-enable features
    const featureFlags = await import('./irisFeatureFlags.js');
    const defaults = featureFlags.DEFAULT_FEATURE_FLAGS;
    for (const flag of SAFE_MODE_CONFIG.disabledFeatures) {
      if (defaults[flag] !== false) {
        await featureFlags.setFeatureFlag(flag, defaults[flag]);
      }
    }

    // Restore user theme
    const settings = await storage.loadSettings();
    const theme = settings?.appearance?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    console.log('✅ Safe Mode exited');

    return {success: true};
  } catch (error) {
    console.error('❌ Error exiting safe mode:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Collect diagnostic information
 */
export async function collectDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
    },
    storage: {
      indexedDBAvailable: 'indexedDB' in window,
      localStorageAvailable: 'localStorage' in window,
      sessionStorageAvailable: 'sessionStorage' in window,
    },
    performance: {
      memory: performance.memory
        ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          }
        : null,
      timing: performance.timing
        ? {
            navigationStart: performance.timing.navigationStart,
            loadEventEnd: performance.timing.loadEventEnd,
          }
        : null,
    },
    errors: checkForErrors(),
    features: await getFeatureStatus(),
    checks: await runHealthChecks(),
  };

  // Save diagnostics
  const settings = await storage.loadSettings();
  if (!settings.diagnostics) {
    settings.diagnostics = [];
  }
  settings.diagnostics.push(diagnostics);

  // Keep last 10 diagnostic runs
  if (settings.diagnostics.length > 10) {
    settings.diagnostics = settings.diagnostics.slice(-10);
  }

  await storage.saveSettings(settings);

  return diagnostics;
}

/**
 * Check for JavaScript errors
 */
function checkForErrors() {
  const errors = [];

  // This would be populated by error event listeners
  if (window.irisErrors) {
    errors.push(...window.irisErrors);
  }

  return errors;
}

/**
 * Get feature status
 */
async function getFeatureStatus() {
  try {
    const featureFlags = await import('./irisFeatureFlags.js');
    const flags = await featureFlags.getAllFeatureFlags();
    return flags;
  } catch (error) {
    console.error('Error getting feature status:', error);
    return {};
  }
}

/**
 * Run health checks
 */
async function runHealthChecks() {
  const checks = {
    indexedDB: await checkIndexedDB(),
    storage: await checkStorage(),
    memory: checkMemory(),
    cpuUsage: checkCPU(),
  };

  return checks;
}

/**
 * Check IndexedDB availability
 */
async function checkIndexedDB() {
  try {
    // Attempt to open database
    const req = indexedDB.open('test');
    return new Promise((resolve) => {
      req.onsuccess = () => {
        indexedDB.deleteDatabase('test');
        resolve({available: true, writable: true});
      };
      req.onerror = () => resolve({available: false, writable: false});
    });
  } catch (error) {
    return {available: false, writable: false, error: error.message};
  }
}

/**
 * Check storage space
 */
async function checkStorage() {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: Math.round((estimate.usage / estimate.quota) * 100),
      };
    }
    return {unavailable: true};
  } catch (error) {
    return {error: error.message};
  }
}

/**
 * Check memory usage
 */
function checkMemory() {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      percentageUsed: Math.round(
        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) *
          100
      ),
    };
  }
  return {unavailable: true};
}

/**
 * Check CPU usage (simple heuristic)
 */
function checkCPU() {
  const start = performance.now();
  let iterations = 0;
  while (performance.now() - start < 10) iterations++;
  return {iterations, status: iterations > 100000 ? 'normal' : 'slow'};
}

/**
 * Get diagnostics history
 */
export async function getDiagnosticsHistory(limit = 10) {
  try {
    const settings = await storage.loadSettings();
    const diagnostics = settings?.diagnostics || [];
    return diagnostics.slice(-limit);
  } catch (error) {
    console.error('Error getting diagnostics:', error);
    return [];
  }
}

/**
 * Export diagnostics report
 */
export async function exportDiagnosticsReport() {
  try {
    const latestDiags = await getDiagnosticsHistory(1);
    return {
      success: true,
      data: latestDiags[0] || null,
      filename: `diagnostics_${Date.now()}.json`,
    };
  } catch (error) {
    console.error('Error exporting diagnostics:', error);
    return {success: false, error: error.message};
  }
}
