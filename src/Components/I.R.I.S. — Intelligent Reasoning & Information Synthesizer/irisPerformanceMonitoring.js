/**
 * I.R.I.S. Performance Monitoring & Degradation Ladder
 * ====================================================
 * Monitor performance and degrade features gracefully under load
 */

import {storage} from '../Storage/clientStorage.js';

export const PERFORMANCE_LEVELS = {
  EXCELLENT: 'excellent', // 60+ FPS
  GOOD: 'good', // 45-59 FPS
  FAIR: 'fair', // 30-44 FPS
  POOR: 'poor', // 15-29 FPS
  CRITICAL: 'critical', // <15 FPS
};

export const DEGRADATION_LADDER = {
  excellent: {
    level: 'excellent',
    featuresToDisable: [],
    renderQuality: 100,
    updateFrequency: 'high',
  },
  good: {
    level: 'good',
    featuresToDisable: [],
    renderQuality: 100,
    updateFrequency: 'high',
  },
  fair: {
    level: 'fair',
    featuresToDisable: ['REAL_TIME_ANALYSIS_ENABLED', 'CUSTOM_OVERLAYS_ENABLED'],
    renderQuality: 75,
    updateFrequency: 'medium',
  },
  poor: {
    level: 'poor',
    featuresToDisable: [
      'REAL_TIME_ANALYSIS_ENABLED',
      'CUSTOM_OVERLAYS_ENABLED',
      'PERSONALITY_ENHANCER_ENABLED',
      'THINKING_DISPLAY_ENABLED',
    ],
    renderQuality: 50,
    updateFrequency: 'low',
  },
  critical: {
    level: 'critical',
    featuresToDisable: [
      'REAL_TIME_ANALYSIS_ENABLED',
      'CUSTOM_OVERLAYS_ENABLED',
      'PERSONALITY_ENHANCER_ENABLED',
      'THINKING_DISPLAY_ENABLED',
      'DARK_MODE_ENABLED',
      'COMMAND_PALETTE_ENABLED',
    ],
    renderQuality: 25,
    updateFrequency: 'minimal',
  },
};

export class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.frameTime = 0;
    this.currentFPS = 60;
    this.averageFPS = 60;
    this.memoryUsage = 0;
    this.currentLevel = PERFORMANCE_LEVELS.EXCELLENT;
    this.lastCheck = Date.now();
    this.metrics = [];
  }

  /**
   * Record frame
   */
  recordFrame(deltaTime) {
    this.frameCount++;
    this.frameTime = deltaTime;

    // Calculate FPS
    if (deltaTime > 0) {
      this.currentFPS = 1000 / deltaTime;
    }

    // Update 60-frame moving average
    this.metrics.push(this.currentFPS);
    if (this.metrics.length > 60) {
      this.metrics.shift();
    }

    this.averageFPS =
      this.metrics.reduce((a, b) => a + b, 0) / this.metrics.length;

    // Check for level change every 1 second
    const now = Date.now();
    if (now - this.lastCheck > 1000) {
      this.updatePerformanceLevel();
      this.lastCheck = now;
    }
  }

  /**
   * Update performance level based on FPS
   */
  updatePerformanceLevel() {
    const fps = this.averageFPS;
    let newLevel;

    if (fps >= 60) {
      newLevel = PERFORMANCE_LEVELS.EXCELLENT;
    } else if (fps >= 45) {
      newLevel = PERFORMANCE_LEVELS.GOOD;
    } else if (fps >= 30) {
      newLevel = PERFORMANCE_LEVELS.FAIR;
    } else if (fps >= 15) {
      newLevel = PERFORMANCE_LEVELS.POOR;
    } else {
      newLevel = PERFORMANCE_LEVELS.CRITICAL;
    }

    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      this.onPerformanceLevelChange(newLevel);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    if (performance.memory) {
      const memory = performance.memory;
      this.memoryUsage = memory.usedJSHeapSize / 1048576; // MB
    }

    return {
      fps: Math.round(this.currentFPS),
      averageFps: Math.round(this.averageFPS),
      level: this.currentLevel,
      frameTime: Math.round(this.frameTime * 100) / 100,
      memoryUsageMb: Math.round(this.memoryUsage),
      frameCount: this.frameCount,
    };
  }

  /**
   * Handler for performance level changes
   */
  onPerformanceLevelChange(newLevel) {
    console.log(`⚡ Performance level changed to: ${newLevel}`);

    // Apply degradation
    applyDegradation(newLevel).catch((e) => {
      console.error('Error applying degradation:', e);
    });
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = [];
    this.frameCount = 0;
    this.currentFPS = 60;
    this.averageFPS = 60;
  }
}

// Global instance
let globalMonitor = null;

/**
 * Get or create global performance monitor
 */
export function getPerformanceMonitor() {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring() {
  globalMonitor = new PerformanceMonitor();

  // Setup animation frame monitoring
  let lastTime = performance.now();

  const monitorFrame = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    globalMonitor.recordFrame(deltaTime);
    requestAnimationFrame(monitorFrame);
  };

  requestAnimationFrame(monitorFrame);

  return globalMonitor;
}

/**
 * Apply degradation based on performance level
 */
export async function applyDegradation(level) {
  try {
    const config = DEGRADATION_LADDER[level];
    if (!config) return {success: false, error: 'Unknown level'};

    const featureFlags = await import('./irisFeatureFlags.js');

    // Disable problematic features
    for (const flag of config.featuresToDisable) {
      await featureFlags.setFeatureFlag(flag, false);
    }

    // Update render quality
    const settings = await storage.loadSettings();
    settings.renderQuality = config.renderQuality;
    settings.updateFrequency = config.updateFrequency;
    await storage.saveSettings(settings);

    // Log degradation event
    await logDegradationEvent(level, config);

    return {success: true, level, config};
  } catch (error) {
    console.error('Error applying degradation:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get performance stats over time window
 */
export function getPerformanceStats(timeWindowMs = 60000) {
  const monitor = getPerformanceMonitor();

  return {
    currentLevel: monitor.currentLevel,
    currentFps: Math.round(monitor.currentFPS),
    averageFps: Math.round(monitor.averageFPS),
    memoryMb: Math.round(monitor.memoryUsage),
    timeWindow: `${timeWindowMs}ms`,
    frameCount: monitor.frameCount,
  };
}

/**
 * Get performance history
 */
export async function getPerformanceHistory(limit = 100) {
  try {
    const settings = await storage.loadSettings();
    const history = settings?.performanceHistory || [];
    return history.slice(-limit);
  } catch (error) {
    console.error('Error getting performance history:', error);
    return [];
  }
}

/**
 * Check if performance is degraded
 */
export function isPerformanceDegraded() {
  const monitor = getPerformanceMonitor();
  return monitor.currentLevel !== PERFORMANCE_LEVELS.EXCELLENT &&
    monitor.currentLevel !== PERFORMANCE_LEVELS.GOOD;
}

/**
 * Get degradation status
 */
export async function getDegradationStatus() {
  const monitor = getPerformanceMonitor();
  const config = DEGRADATION_LADDER[monitor.currentLevel];

  return {
    isDegraded: isPerformanceDegraded(),
    currentLevel: monitor.currentLevel,
    disabledFeatures: config?.featuresToDisable || [],
    renderQuality: config?.renderQuality || 100,
    metrics: monitor.getMetrics(),
  };
}

/**
 * Manually set performance level (for testing)
 */
export async function setPerformanceLevel(level) {
  const monitor = getPerformanceMonitor();
  monitor.currentLevel = level;
  return await applyDegradation(level);
}

/**
 * Get all performance levels info
 */
export function getPerformanceLevelsInfo() {
  const info = {};

  for (const [key, value] of Object.entries(DEGRADATION_LADDER)) {
    info[key] = {
      ...value,
      recommendation:
        {
          excellent: 'All features enabled, optimal experience',
          good: 'All features enabled, smooth experience',
          fair: 'Some features disabled, stable experience',
          poor: 'Multiple features disabled, minimal experience',
          critical: 'Most features disabled, emergency mode',
        }[key] || '',
    };
  }

  return info;
}

/**
 * Internal: Log degradation event
 */
async function logDegradationEvent(level, config) {
  try {
    const settings = await storage.loadSettings();
    if (!settings.performanceHistory) {
      settings.performanceHistory = [];
    }

    settings.performanceHistory.push({
      timestamp: Date.now(),
      level,
      disabledFeatures: config.featuresToDisable,
      renderQuality: config.renderQuality,
    });

    // Keep last 500 events
    if (settings.performanceHistory.length > 500) {
      settings.performanceHistory = settings.performanceHistory.slice(-500);
    }

    await storage.saveSettings(settings);
  } catch (error) {
    console.error('Error logging degradation:', error);
  }
}
