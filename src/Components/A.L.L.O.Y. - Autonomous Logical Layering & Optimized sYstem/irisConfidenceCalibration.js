/**
 * I.R.I.S. Confidence Calibration System
 * ======================================
 * Calibrate AI confidence scores based on accuracy
 */

import {storage} from '../Storage/clientStorage.js');

export class ConfidenceCalibrator {
  constructor() {
    this.calibrations = new Map(); // actionName -> CalibrationData
    this.history = [];
  }

  /**
   * Record prediction and outcome
   */
  recordPrediction(actionName, predictedConfidence, actualOutcome) {
    const calibration = this.getOrCreateCalibration(actionName);

    calibration.predictions.push({
      predicted: predictedConfidence,
      actual: actualOutcome ? 1 : 0,
      timestamp: Date.now(),
    });

    // Keep last 100 predictions per action
    if (calibration.predictions.length > 100) {
      calibration.predictions.shift();
    }

    this.updateCalibration(actionName);
  }

  /**
   * Get or create calibration data
   */
  getOrCreateCalibration(actionName) {
    if (!this.calibrations.has(actionName)) {
      this.calibrations.set(actionName, {
        predictions: [],
        accuracy: 0,
        averageConfidence: 0,
        calibrationError: 0,
      });
    }

    return this.calibrations.get(actionName);
  }

  /**
   * Update calibration metrics
   */
  updateCalibration(actionName) {
    const calibration = this.calibrations.get(actionName);

    if (calibration.predictions.length === 0) return;

    // Calculate accuracy
    const correct = calibration.predictions.filter((p) => p.actual === 1).length;
    calibration.accuracy = correct / calibration.predictions.length;

    // Calculate average predicted confidence
    const sum = calibration.predictions.reduce((total, p) => total + p.predicted, 0);
    calibration.averageConfidence = sum / calibration.predictions.length;

    // Calculate calibration error (Expected Calibration Error)
    calibration.calibrationError = Math.abs(calibration.averageConfidence - calibration.accuracy);
  }

  /**
   * Adjust confidence based on calibration
   */
  adjustConfidence(actionName, originalConfidence) {
    const calibration = this.calibrations.get(actionName);

    if (!calibration) {
      return originalConfidence; // No calibration data
    }

    // If model is overconfident, reduce it
    if (calibration.averageConfidence > calibration.accuracy) {
      const reduction = calibration.calibrationError * 0.5;
      return Math.max(0, Math.min(1, originalConfidence - reduction));
    }

    // If model is underconfident, increase it
    if (calibration.averageConfidence < calibration.accuracy) {
      const increase = calibration.calibrationError * 0.5;
      return Math.max(0, Math.min(1, originalConfidence + increase));
    }

    return originalConfidence;
  }

  /**
   * Get calibration status
   */
  getCalibrationStatus(actionName) {
    const calibration = this.calibrations.get(actionName);

    if (!calibration) {
      return {status: 'no-data'};
    }

    const status = 'well-calibrated';
    let recommendation = 'Confidence predictions are well-calibrated';

    if (calibration.calibrationError > 0.15) {
      if (calibration.averageConfidence > calibration.accuracy) {
        recommendation = 'Model is overconfident. Reduce confidence scores.';
      } else {
        recommendation = 'Model is underconfident. Increase confidence scores.';
      }
    }

    return {
      status,
      accuracy: Math.round(calibration.accuracy * 100),
      averageConfidence: Math.round(calibration.averageConfidence * 100),
      calibrationError: Math.round(calibration.calibrationError * 100),
      recommendation,
    };
  }

  /**
   * Get all calibration statuses
   */
  getAllCalibrationStatuses() {
    const statuses = {};

    for (const [actionName] of this.calibrations) {
      statuses[actionName] = this.getCalibrationStatus(actionName);
    }

    return statuses;
  }

  /**
   * Export for analysis
   */
  export() {
    const data = {};

    for (const [actionName, calibration] of this.calibrations) {
      data[actionName] = {
        predictions: calibration.predictions,
        accuracy: calibration.accuracy,
        averageConfidence: calibration.averageConfidence,
        calibrationError: calibration.calibrationError,
      };
    }

    return data;
  }
}

const globalCalibrator = new ConfidenceCalibrator();

/**
 * Get global calibrator
 */
export function getConfidenceCalibrator() {
  return globalCalibrator;
}

/**
 * Save calibration data
 */
export async function saveCalibrationData() {
  try {
    const settings = await storage.loadSettings();
    settings.confidenceCalibration = globalCalibrator.export();
    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error saving calibration:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Load calibration data
 */
export async function loadCalibrationData() {
  try {
    const settings = await storage.loadSettings();
    const data = settings?.confidenceCalibration || {};

    for (const [actionName, calibration] of Object.entries(data)) {
      globalCalibrator.calibrations.set(actionName, calibration);
    }

    return {success: true, loaded: Object.keys(data).length};
  } catch (error) {
    console.error('Error loading calibration:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get calibration recommendations
 */
export function getCalibrationRecommendations() {
  const statuses = globalCalibrator.getAllCalibrationStatuses();
  const recommendations = [];

  for (const [actionName, status] of Object.entries(statuses)) {
    if (status.status === 'well-calibrated') {
      continue;
    }

    recommendations.push({
      action: actionName,
      issue: status.recommendation,
      priority: Math.abs(status.calibrationError) > 0.2 ? 'high' : 'medium',
    });
  }

  return recommendations;
}
