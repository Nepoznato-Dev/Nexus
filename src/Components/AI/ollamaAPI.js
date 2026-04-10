/**
 * transformerAPI.js - Transformer.js Processing Layer for Nexus
 * 
 * Browser-based AI processing with 3 intelligent tiers:
 * - Fast: Quick, direct answers with no explanation
 * - Balanced: Dynamic routing (simple → fast, complex → explained)
 * - Quality: Full step-by-step explanations (Gemini-style AI overview)
 */

import { pipeline } from '@xenova/transformers';

// Model cache to avoid reloading
let modelCache = {
  sentiment: null,
  qa: null,
  text2text: null,
};

// Processing tier preferences
let currentTier = 'balanced'; // 'fast', 'balanced', 'quality'

/**
 * Translate/process text using Ollama (local processing only)
 * 
 * @param {string} text - The text to translate
 * @param {string} tier - Translation tier: 'fast', 'balanced', 'quality'
 * @param {string} mode - Translation mode: 'simplify', 'formal', 'casual', 'summarize', etc.
 * @returns {string} Translated text or original if failed
 */
export async function translateText(text, tier = 'balanced', mode = 'simplify') {
  try {
    if (!text || text.length === 0) {
      return text;
    }

    // Build prompt based on translation tier and mode
    let prompt = '';
    let temperature = 0.3;
    let maxTokens = 300;

    // Set tier parameters
    if (tier === 'fast') {
      temperature = 0.1;
      maxTokens = 150;
      mode = 'simplify'; // Force fast mode to use simplify
    } else if (tier === 'balanced') {
      temperature = 0.3;
      maxTokens = 300;
    } else if (tier === 'quality') {
      temperature = 0.5;
      maxTokens = 500;
    }

    // Build mode-specific prompt
    switch (mode.toLowerCase()) {
      case 'simplify':
      case 'simple':
        prompt = `Simplify this text for a general audience while keeping the meaning:\n\n${text}\n\nSimplified:`;
        break;

      case 'formal':
        prompt = `Rewrite this in formal language:\n\n${text}\n\nFormal:`;
        break;

      case 'casual':
        prompt = `Rewrite this in casual language:\n\n${text}\n\nCasual:`;
        break;

      case 'summarize':
      case 'summary':
        prompt = `Summarize this in 2-3 sentences:\n\n${text}\n\nSummary:`;
        break;

      case 'expand':
        prompt = `Expand this with more detail:\n\n${text}\n\nExpanded:`;
        break;

      case 'spanish':
      case 'es':
        prompt = `Translate this to Spanish:\n\n${text}\n\nSpanish:`;
        break;

      case 'french':
      case 'fr':
        prompt = `Translate this to French:\n\n${text}\n\nFrench:`;
        break;

      case 'german':
      case 'de':
        prompt = `Translate this to German:\n\n${text}\n\nGerman:`;
        break;

      case 'markdown':
        prompt = `Format this as markdown:\n\n${text}\n\nMarkdown:`;
        break;

      case 'bullet':
      case 'bullets':
        prompt = `Convert this to bullet points:\n\n${text}\n\nBullet points:`;
        break;

      default:
        // Custom translation prompt
        prompt = `${mode}:\n\n${text}\n\nResult:`;
    }

    const response = await fetch(API_ENDPOINTS.TRANSLATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2', // Use fast/lightweight model for translation
        prompt: prompt,
        stream: false,
        temperature: temperature,
        num_predict: maxTokens,
      }),
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    if (!response.ok) {
      console.error('Ollama translation failed:', response.statusText);
      return text; // Return original on error
    }

    const data = await response.json();
    return data.response?.trim() || text;

  } catch (error) {
    console.warn('Ollama translation unavailable:', error.message);
    return text; // Graceful fallback - return original text
  }
}

/**
 * Format response text (client-side, no Ollama needed)
 * Use this for quick text formatting that doesn't require Ollama
 */
export function formatTextLocally(text, format = 'markdown') {
  if (!text) return text;

  switch (format.toLowerCase()) {
    case 'bullet':
    case 'bullets':
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `• ${line}`)
        .join('\n');

    case 'numbered':
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, i) => `${i + 1}. ${line}`)
        .join('\n');

    case 'markdown':
    default:
      return text;
  }
}

export default {
  isOllamaAvailable,
  translateText,
  formatTextLocally,
};
