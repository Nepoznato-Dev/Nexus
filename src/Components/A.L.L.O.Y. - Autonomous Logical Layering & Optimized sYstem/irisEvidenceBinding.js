/**
 * I.R.I.S. Evidence Binding System
 * ================================
 * Link AI responses to evidence sources
 */

import {storage} from '../Storage/clientStorage.js';

export class EvidenceBinding {
  constructor(responseId) {
    this.id = generateId();
    this.responseId = responseId;
    this.sources = [];
    this.timestamp = Date.now();
    this.confidence = 0;
  }

  /**
   * Add evidence source
   */
  addSource(source) {
    const evidence = {
      id: generateId(),
      type: source.type, // 'web', 'document', 'conversation', 'internal'
      title: source.title,
      url: source.url,
      excerpt: source.excerpt,
      confidence: source.confidence || 0.8,
      timestamp: Date.now(),
    };

    this.sources.push(evidence);
    this.updateConfidence();

    return evidence;
  }

  /**
   * Get all sources
   */
  getSources() {
    return this.sources;
  }

  /**
   * Get sources by type
   */
  getSourcesByType(type) {
    return this.sources.filter((s) => s.type === type);
  }

  /**
   * Update overall confidence
   */
  updateConfidence() {
    if (this.sources.length === 0) {
      this.confidence = 0;
      return;
    }

    const sum = this.sources.reduce((total, s) => total + s.confidence, 0);
    this.confidence = sum / this.sources.length;
  }

  /**
   * Export binding
   */
  export() {
    return {
      id: this.id,
      responseId: this.responseId,
      sources: this.sources,
      confidence: this.confidence,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Create evidence binding
 */
export async function createEvidenceBinding(responseId) {
  try {
    const binding = new EvidenceBinding(responseId);

    const settings = await storage.loadSettings();
    if (!settings.evidenceBindings) {
      settings.evidenceBindings = [];
    }

    settings.evidenceBindings.push(binding.export());
    await storage.saveSettings(settings);

    return {success: true, bindingId: binding.id};
  } catch (error) {
    console.error('Error creating evidence binding:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Add source to binding
 */
export async function addSourceToBinding(bindingId, source) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.evidenceBindings || [];

    const binding = bindings.find((b) => b.id === bindingId);
    if (!binding) {
      return {success: false, error: 'Binding not found'};
    }

    binding.sources.push({
      id: generateId(),
      type: source.type,
      title: source.title,
      url: source.url,
      excerpt: source.excerpt,
      confidence: source.confidence || 0.8,
      timestamp: Date.now(),
    });

    // Recalculate confidence
    const sum = binding.sources.reduce((total, s) => total + s.confidence, 0);
    binding.confidence = sum / binding.sources.length;

    await storage.saveSettings(settings);

    return {success: true};
  } catch (error) {
    console.error('Error adding source:', error);
    return {success: false, error: error.message};
  }
}

/**
 * Get evidence binding
 */
export async function getEvidenceBinding(bindingId) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.evidenceBindings || [];

    return bindings.find((b) => b.id === bindingId) || null;
  } catch (error) {
    console.error('Error getting evidence binding:', error);
    return null;
  }
}

/**
 * Get bindings by response
 */
export async function getBindingsByResponse(responseId) {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.evidenceBindings || [];

    return bindings.filter((b) => b.responseId === responseId);
  } catch (error) {
    console.error('Error getting response bindings:', error);
    return [];
  }
}

/**
 * Get average confidence
 */
export async function getAverageConfidence() {
  try {
    const settings = await storage.loadSettings();
    const bindings = settings?.evidenceBindings || [];

    if (bindings.length === 0) return 0;

    const sum = bindings.reduce((total, b) => total + b.confidence, 0);
    return sum / bindings.length;
  } catch (error) {
    console.error('Error getting average confidence:', error);
    return 0;
  }
}

/**
 * Delete binding
 */
export async function deleteEvidenceBinding(bindingId) {
  try {
    const settings = await storage.loadSettings();
    settings.evidenceBindings = (settings.evidenceBindings || []).filter(
      (b) => b.id !== bindingId
    );
    await storage.saveSettings(settings);

    return {success: true, deleted: bindingId};
  } catch (error) {
    console.error('Error deleting binding:', error);
    return {success: false, error: error.message};
  }
}

function generateId() {
  return `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
