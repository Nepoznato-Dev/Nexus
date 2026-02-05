/**
 * AI API Bridge - Google Gemini & OpenAI with 429/rate-limit handling
 * Detects 429, marks provider unavailable, auto-expires cooldown per retry-after.
 * Routes around limited APIs; fallback to LOCAL when all blocked.
 * Includes: response caching, conversation context, environment variable support.
 */

import { markRateLimited, scoreResponseQuality, isRateLimited, QUALITY_THRESHOLDS } from './aiRouter.js';
import { storage } from '../Storage/clientStorage.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_DEFAULT_MODEL = 'gemini-2.0-flash';
const GEMINI_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Response cache - stores recent responses to avoid duplicate API calls
 * Format: { "question|model": { response, timestamp } }
 */
const responseCache = {};
const CACHE_TTL = 3600000; // 1 hour

/**
 * Get cached response if available and fresh
 */
function getCachedResponse(question, model) {
  const key = `${question}|${model}`;
  const cached = responseCache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  if (cached) delete responseCache[key];
  return null;
}

/**
 * Cache response for future use
 */
function cacheResponse(question, model, response) {
  const key = `${question}|${model}`;
  responseCache[key] = { response, timestamp: Date.now() };
}

/**
 * Get API keys from environment or localStorage
 */
function getEnvKeys() {
  return {
    openai: process.env.REACT_APP_OPENAI_API_KEY || '',
    google: process.env.REACT_APP_GOOGLE_API_KEY || '',
    anthropic: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
  };
}

async function getAiToolsSettings() {
  try {
    const settings = await storage.loadSettings();
    return settings?.aiTools || {};
  } catch (err) {
    return {};
  }
}

export async function resolveApiKeys(apiKeys = {}) {
  const aiTools = await getAiToolsSettings();
  const provider = apiKeys.apiProvider ?? aiTools.apiProvider ?? 'none';
  const providerKey = apiKeys.apiKey ?? aiTools.apiKey ?? '';
  const model = apiKeys.model ?? aiTools.model ?? '';
  const serpApiKey = apiKeys.serpApiKey ?? aiTools.serpApiKey ?? '';

  const envKeys = getEnvKeys();
  const legacyOpenai = localStorage.getItem('nexus_openai_key') || '';
  const legacyGoogle = localStorage.getItem('nexus_google_key') || '';
  const legacyAnthropic = localStorage.getItem('nexus_anthropic_key') || '';

  const openaiKey = apiKeys.openaiKey ?? apiKeys.openai ?? (provider === 'openai' ? providerKey : '') || envKeys.openai || legacyOpenai;
  const googleKey = apiKeys.googleKey ?? apiKeys.google ?? (provider === 'google' ? providerKey : '') || envKeys.google || legacyGoogle;
  const anthropicKey = apiKeys.anthropicKey ?? apiKeys.anthropic ?? (provider === 'anthropic' ? providerKey : '') || envKeys.anthropic || legacyAnthropic;

  return {
    openaiKey,
    googleKey,
    anthropicKey,
    serpApiKey,
    model,
    apiProvider: provider,
  };
}

/**
 * Parse Retry-After header (seconds or HTTP-date). Returns number of seconds.
 */
function parseRetryAfter(header) {
  if (!header) return 60;
  const v = String(header).trim();
  const n = parseInt(v, 10);
  if (!isNaN(n)) return Math.max(1, Math.min(3600, n));
  const d = new Date(v);
  if (!isNaN(d.getTime())) {
    const sec = Math.ceil((d.getTime() - Date.now()) / 1000);
    return Math.max(1, Math.min(3600, sec));
  }
  return 60;
}

/**
 * Call OpenAI Chat Completions. On 429, mark rate-limited and return error.
 * Includes conversation context for better follow-ups.
 * @returns {{ response: string, model: string, cached?: boolean } | { error: string, rateLimited?: boolean }}
 */
export async function callOpenAI(prompt, apiKey, conversationContext = [], options = {}) {
  if (!apiKey || !prompt) {
    return { error: 'Missing API key or prompt' };
  }

  const model = options.model || 'gpt-3.5-turbo';

  // Check cache first
  const cacheKey = `OPENAI:${model}`;
  const cached = getCachedResponse(prompt, cacheKey);
  if (cached) return { response: cached, model: 'OPENAI', cached: true };

  try {
    // Include last 3 messages for context
    const messages = [
      ...conversationContext.slice(-3).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: prompt }
    ];

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1024,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const retry = parseRetryAfter(res.headers.get('Retry-After'));
      markRateLimited('OPENAI', retry);
      return { error: 'OpenAI rate limited', rateLimited: true };
    }
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `OpenAI error ${res.status}`;
      if (res.status >= 500 && /rate|limit|429/i.test(msg)) {
        markRateLimited('OPENAI', 60);
        return { error: msg, rateLimited: true };
      }
      return { error: msg };
    }
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return { error: 'Empty OpenAI response' };
    cacheResponse(prompt, cacheKey, text);
    return { response: text, model: 'OPENAI' };
  } catch (e) {
    return { error: e.message || 'OpenAI request failed' };
  }
}

/**
 * Call Google Gemini generateContent. On 429, mark rate-limited and return error.
 * Includes conversation context for better follow-ups.
 * @returns {{ response: string, model: string, cached?: boolean } | { error: string, rateLimited?: boolean }}
 */
export async function callGoogleGemini(prompt, apiKey, conversationContext = [], options = {}) {
  if (!apiKey || !prompt) {
    return { error: 'Missing API key or prompt' };
  }

  const model = options.model || GEMINI_DEFAULT_MODEL;

  // Check cache first
  const cacheKey = `GOOGLE:${model}`;
  const cached = getCachedResponse(prompt, cacheKey);
  if (cached) return { response: cached, model: 'GOOGLE', cached: true };

  const url = `${GEMINI_URL_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    // Include last 3 messages for context
    const contents = [
      ...conversationContext.slice(-3).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ];
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const retry = parseRetryAfter(res.headers.get('Retry-After'));
      markRateLimited('GOOGLE', retry);
      return { error: 'Google Gemini rate limited', rateLimited: true };
    }
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `Gemini error ${res.status}`;
      if (res.status >= 500 || /rate|quota|429/i.test(msg)) {
        markRateLimited('GOOGLE', 60);
        return { error: msg, rateLimited: true };
      }
      return { error: msg };
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return { error: 'Empty Gemini response' };
    cacheResponse(prompt, cacheKey, text);
    return { response: text, model: 'GOOGLE' };
  } catch (e) {
    return { error: e.message || 'Gemini request failed' };
  }
}

/**
 * Call Anthropic Messages API. On 429, mark rate-limited and return error.
 * @returns {{ response: string, model: string, cached?: boolean } | { error: string, rateLimited?: boolean }}
 */
export async function callAnthropic(prompt, apiKey, conversationContext = [], options = {}) {
  if (!apiKey || !prompt) {
    return { error: 'Missing API key or prompt' };
  }

  const model = options.model || 'claude-3-sonnet-20240229';

  const cacheKey = `ANTHROPIC:${model}`;
  const cached = getCachedResponse(prompt, cacheKey);
  if (cached) return { response: cached, model: 'ANTHROPIC', cached: true };

  try {
    const messages = [
      ...conversationContext.slice(-3).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: prompt }
    ];

    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: messages
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) {
      const retry = parseRetryAfter(res.headers.get('Retry-After'));
      markRateLimited('ANTHROPIC', retry);
      return { error: 'Anthropic rate limited', rateLimited: true };
    }
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `Anthropic error ${res.status}`;
      if (res.status >= 500 && /rate|limit|429/i.test(msg)) {
        markRateLimited('ANTHROPIC', 60);
        return { error: msg, rateLimited: true };
      }
      return { error: msg };
    }
    const text = data?.content?.[0]?.text?.trim();
    if (!text) return { error: 'Empty Anthropic response' };
    cacheResponse(prompt, cacheKey, text);
    return { response: text, model: 'ANTHROPIC' };
  } catch (e) {
    return { error: e.message || 'Anthropic request failed' };
  }
}

/**
 * Run fallback chain: try primary, score quality, if below threshold try next;
 * if all fail, return best attempt with quality warning.
 * Uses LOCAL (generateLocal) when no API or all rate-limited.
 * Passes conversation context to API calls for better follow-ups.
 */
export async function runFallbackChain(question, strategy, options = {}) {
  const { generateLocal, apiKeys = {}, conversationContext = [] } = options;
  const resolvedKeys = await resolveApiKeys(apiKeys);
  const openaiKey = resolvedKeys.openaiKey;
  const googleKey = resolvedKeys.googleKey;
  const anthropicKey = resolvedKeys.anthropicKey;
  const modelOverride = resolvedKeys.model;
  const route = strategy.route || ['LOCAL'];
  const fallbacks = strategy.fallbacks || [];
  const seen = new Set();
  const chain = [];
  for (const m of [...route, ...fallbacks]) {
    if (!seen.has(m)) { seen.add(m); chain.push(m); }
  }
  let best = { response: '', model: 'LOCAL', quality: 0 };

  for (const model of chain) {
    let result;
    if (model === 'LOCAL') {
      if (!generateLocal) {
        result = { error: 'No local generation function provided' };
      } else {
        const resp = await generateLocal(question, conversationContext);
        result = { response: resp, model: 'LOCAL' };
      }
    } else if (model === 'GOOGLE') {
      if (!googleKey) {
        result = { error: 'Missing Google API key' };
      } else {
        result = await callGoogleGemini(question, googleKey, conversationContext, { model: modelOverride });
      }
    } else if (model === 'OPENAI') {
      if (!openaiKey) {
        result = { error: 'Missing OpenAI API key' };
      } else {
        result = await callOpenAI(question, openaiKey, conversationContext, { model: modelOverride });
      }
    } else if (model === 'ANTHROPIC') {
      if (!anthropicKey) {
        result = { error: 'Missing Anthropic API key' };
      } else {
        result = await callAnthropic(question, anthropicKey, conversationContext, { model: modelOverride });
      }
    } else {
      result = { error: `Unknown model ${model}` };
    }

    if (result.error) {
      if (result.rateLimited) continue;
      continue;
    }

    const quality = scoreResponseQuality(result.response, question);
    if (quality > best.quality) best = { ...result, quality };

    const threshold = QUALITY_THRESHOLDS[model] || 5;
    if (quality >= threshold) {
      return { ...result, quality };
    }
  }

  if (best.response) {
    return { ...best, qualityWarning: `Response quality (${best.quality}/10) is below recommended threshold` };
  }

  return { error: 'All models failed or were rate limited', model: 'NONE' };
}

export default {
  callOpenAI,
  callGoogleGemini,
  callAnthropic,
  runFallbackChain,
  resolveApiKeys,
};
