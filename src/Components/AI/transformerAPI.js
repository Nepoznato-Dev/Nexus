/**
 * transformerAPI.js - Transformer.js Processing Layer for Nexus
 * 
 * Browser-based AI processing with 3 intelligent tiers:
 * - Fast: Quick, direct answers with no explanation
 * - Balanced: Dynamic routing (simple → fast, complex → explained)
 * - Quality: Full step-by-step explanations (Gemini-style AI overview)
 */

import { pipeline } from '@xenova/transformers';
import {
  enhanceWithCommonSense,
  formatCommonSenseInsight,
} from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/aiCommonSenseEngine.js';

// Model cache to avoid reloading the model for each request.
let modelCache = {
  instance: null,
  loadingPromise: null,
  error: null,
  modelId: 'Xenova/LaMini-Flan-T5-77M',
  task: 'text2text-generation',
};

function emitTransformerStatus(status) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus:transformer-status', { detail: status }));
  }
}

async function getPipeline() {
  if (modelCache.instance) return modelCache.instance;
  if (modelCache.loadingPromise) return modelCache.loadingPromise;

  modelCache.loadingPromise = (async () => {
    emitTransformerStatus({ state: 'loading', model: modelCache.modelId });
    const instance = await pipeline(modelCache.task, modelCache.modelId);
    modelCache.instance = instance;
    modelCache.error = null;
    emitTransformerStatus({ state: 'ready', model: modelCache.modelId });
    return instance;
  })()
    .catch((error) => {
      modelCache.error = error;
      emitTransformerStatus({ state: 'error', model: modelCache.modelId, message: error?.message || 'Model load failed' });
      throw error;
    })
    .finally(() => {
      modelCache.loadingPromise = null;
    });

  return modelCache.loadingPromise;
}

async function generateText(prompt, options = {}) {
  const pipe = await getPipeline();
  const {
    max_new_tokens = 192,
    temperature = 0.65,
    repetition_penalty = 1.6,
  } = options;

  const output = await pipe(prompt, {
    max_new_tokens,
    temperature,
    repetition_penalty,
  });

  const text = output?.[0]?.generated_text;
  if (!text || typeof text !== 'string') {
    throw new Error('Empty Transformer output');
  }

  return text.trim();
}

function buildCommonSenseGuidance(question, tier = 'balanced') {
  const enhancement = enhanceWithCommonSense(question, '');
  const thoughtLines = [];

  for (const thought of enhancement.thinkingProcess) {
    if (thought.type === 'false_dilemma_detected') {
      thoughtLines.push(`Potential false dilemma detected: ${thought.insight}`);
    }

    if (thought.type === 'assumption_questioned') {
      thoughtLines.push(`Question premise: ${thought.assumption}`);
      thoughtLines.push(`Preferred reframe: ${thought.reframe}`);
    }

    if (thought.type === 'lateral_solutions' && Array.isArray(thought.solutions)) {
      const options = thought.solutions.map((s) => s.idea).filter(Boolean).slice(0, tier === 'quality' ? 3 : 1);
      if (options.length > 0) {
        thoughtLines.push(`Mention alternatives: ${options.join(' | ')}`);
      }
    }

    if (tier !== 'fast' && thought.type === 'common_mistakes' && Array.isArray(thought.warnings)) {
      const warnings = thought.warnings.slice(0, 1).join(' ');
      if (warnings) thoughtLines.push(`Caution: ${warnings}`);
    }
  }

  const insight = tier === 'quality' ? formatCommonSenseInsight(enhancement) : null;

  return {
    thoughtGuidance: thoughtLines.join(' '),
    insight,
    enhancement,
  };
}

/**
 * Analyze question complexity
 * Returns: 'simple', 'moderate', 'complex'
 */
export function analyzeComplexity(question) {
  const text = question.toLowerCase().trim();

  // Simple patterns
  const simplePatterns = [
    /^\d+\s*[\+\-\*\/]\s*\d+$/,  // Basic math: 1+9, 50-20
    /^what is \d+\s*[\+\-\*\/]\s*\d+/, // What is 5+5
    /^(who|what|when|where)\s+is\s+\w+/i, // Who is X, What is Y
    /^define\s+\w+/i, // Define X
    /^(yes|no)$/i, // Yes/No
  ];

  for (const pattern of simplePatterns) {
    if (pattern.test(text)) {
      return 'simple';
    }
  }

  // Complex patterns
  const complexPatterns = [
    /rectangle|triangle|circle|perimeter|area|volume/i, // Geometry
    /if.*then/i, // Conditional logic
    /explain|analyze|compare|describe|discuss/i, // Analytical questions
    /why|how does|how can|reasoning/i, // Explanation required
    /step by step/i,
  ];

  for (const pattern of complexPatterns) {
    if (pattern.test(text)) {
      return 'complex';
    }
  }

  // Word count heuristic
  const wordCount = text.split(/\s+/).length;
  if (wordCount <= 5) return 'simple';
  if (wordCount <= 15) return 'moderate';
  return 'complex';
}

/**
 * Fast tier: concise direct answer, minimal explanation.
 */
export async function processFast(question) {
  const trimmed = String(question || '').trim();
  if (!trimmed) {
    return {
      answer: 'Please enter a question.',
      confidence: 0.0,
      tier: 'fast',
      explanation: null,
    };
  }

  try {
    const commonSense = buildCommonSenseGuidance(trimmed, 'fast');
    const prompt = [
      'Give a short, direct answer in 1-2 sentences.',
      commonSense.thoughtGuidance ? `Internal guidance: ${commonSense.thoughtGuidance}` : null,
      `Question: ${trimmed}`,
    ].filter(Boolean).join(' ');

    const answer = await generateText(prompt, {
      max_new_tokens: 80,
      temperature: 0.45,
      repetition_penalty: 1.4,
    });

    return {
      answer,
      confidence: 0.88,
      tier: 'fast',
      explanation: {
        summary: commonSense.thoughtGuidance
          ? 'Fast answer with lightweight common-sense guardrails.'
          : 'Fast direct response.',
      },
    };
  } catch (error) {
    console.warn('Fast tier fallback:', error?.message || error);
    return {
      answer: trimmed,
      confidence: 0.4,
      tier: 'fast',
      explanation: {
        summary: 'Transformer unavailable, returned input as fallback.',
      },
    };
  }
}

/**
 * Quality tier: thorough explanation with steps and clear teaching style.
 */
export async function processQuality(question) {
  const trimmed = String(question || '').trim();
  if (!trimmed) {
    return {
      answer: 'Please enter a question.',
      confidence: 0.0,
      tier: 'quality',
      explanation: {
        steps: [],
        summary: 'No question was provided.',
        relatedConcepts: [],
      },
    };
  }

  const complexity = analyzeComplexity(question);
  const commonSense = buildCommonSenseGuidance(trimmed, 'quality');

  try {
    const prompt = [
      'You are a clear teaching assistant.',
      'Answer thoroughly with numbered steps and a short summary at the end.',
      commonSense.thoughtGuidance ? `Internal reasoning guidance: ${commonSense.thoughtGuidance}` : null,
      `Question: ${trimmed}`,
    ].filter(Boolean).join(' ');

    const rawAnswer = await generateText(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      repetition_penalty: 2.0,
    });

    const answer = commonSense.insight
      ? `${commonSense.insight}\n---\n${rawAnswer}`
      : rawAnswer;

    return {
      answer,
      confidence: complexity === 'complex' ? 0.95 : 0.9,
      tier: 'quality',
      explanation: {
        steps: [],
        summary: 'Processed via local Transformer model with common-sense reasoning guidance.',
        relatedConcepts: [],
      },
    };
  } catch (error) {
    console.warn('Quality tier fallback:', error?.message || error);
    return {
      answer: trimmed,
      confidence: 0.45,
      tier: 'quality',
      explanation: {
        steps: [],
        summary: 'Transformer unavailable, returned input as fallback.',
        relatedConcepts: [],
      },
    };
  }
}

/**
 * Balanced tier: Smart routing based on complexity
 * Routes to fast or quality based on question complexity
 */
export async function processBalanced(question) {
  const complexity = analyzeComplexity(question);

  if (complexity === 'simple') {
    // Route to fast processing
    const result = await processFast(question);
    return { ...result, tier: 'balanced (routed to fast)' };
  }

  if (complexity === 'complex') {
    // Route to quality processing
    const result = await processQuality(question);
    return { ...result, tier: 'balanced (routed to quality)' };
  }

  // Moderate complexity: concise but still explanatory.
  try {
    const commonSense = buildCommonSenseGuidance(question, 'balanced');
    const prompt = [
      'Answer clearly in 2-4 sentences and include one practical tip.',
      commonSense.thoughtGuidance ? `Internal reasoning guidance: ${commonSense.thoughtGuidance}` : null,
      `Question: ${question}`,
    ].filter(Boolean).join(' ');

    const rawAnswer = await generateText(prompt, {
      max_new_tokens: 140,
      temperature: 0.6,
      repetition_penalty: 1.7,
    });

    const answer = commonSense.insight
      ? `${commonSense.insight}\n---\n${rawAnswer}`
      : rawAnswer;

    return {
      answer,
      confidence: 0.82,
      tier: 'balanced',
      explanation: {
        brief: commonSense.thoughtGuidance
          ? 'Generated locally with balanced settings and common-sense guidance.'
          : 'Generated locally with balanced settings.',
      },
    };
  } catch (error) {
    console.warn('Balanced tier fallback:', error?.message || error);
    return {
      answer: String(question || ''),
      confidence: 0.4,
      tier: 'balanced',
      explanation: {
        brief: 'Transformer unavailable, returned input as fallback.',
      },
    };
  }
}

/**
 * Main processing function
 * Routes to appropriate tier
 */
export async function processQuestion(question, tier = 'balanced') {
  try {
    switch (tier) {
      case 'fast':
        return await processFast(question);
      case 'balanced':
        return await processBalanced(question);
      case 'quality':
        return await processQuality(question);
      default:
        return await processBalanced(question);
    }
  } catch (error) {
    console.error('Processing error:', error);
    return {
      answer: 'Sorry, I encountered an error processing your question.',
      confidence: 0,
      tier: tier,
      error: error.message,
    };
  }
}

/**
 * Set processing tier preference
 */
export function setProcessingTier(tier) {
  if (['fast', 'balanced', 'quality'].includes(tier)) {
    return true;
  }
  return false;
}

/**
 * Check if Transformer.js is available (always true for browser)
 */
export function isTransformerAvailable() {
  return typeof pipeline === 'function';
}

export default {
  processQuestion,
  processFast,
  processBalanced,
  processQuality,
  analyzeComplexity,
  setProcessingTier,
  isTransformerAvailable,
};
