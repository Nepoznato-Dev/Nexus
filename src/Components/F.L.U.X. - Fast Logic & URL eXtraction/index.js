/**
 * S.P.A.R.K Module Index
 * 
 * Central export point for all S.P.A.R.K modules and utilities
 */

export { sparkPersonality } from './sparkPersonality.js';
export { sparkKnowledge } from './sparkKnowledgeBank.js';
export { sparkPerformanceMonitor as performanceMonitor } from './sparkPerformanceMonitor.js';
export { sparkIRISChannel, irisSignalReceiver } from './sparkIRISChannel.js';

// Re-export query engine if it's S.P.A.R.K specific
export { default as queryEngine } from './sparkQueryEngine.js';

console.log('S.P.A.R.K modules initialized');
