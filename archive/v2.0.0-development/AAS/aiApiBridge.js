/**
 * AI API Bridge - Google Gemini & OpenAI with 429/rate-limit handling
 * Detects 429, marks provider unavailable, auto-expires cooldown per retry-after.
 * Routes around limited APIs; fallback to LOCAL when all blocked.
 * Includes: response caching, conversation context, environment variable support.
 */

import { markRateLimited, scoreResponseQuality, isRateLimited, QUALITY_THRESHOLDS } from './aiRouter.js';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
function getApiKeys() {
  return {
    openai: process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('nexus_openai_key') || '',
    google: process.env.REACT_APP_GOOGLE_API_KEY || localStorage.getItem('nexus_google_key') || '',
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
export async function callOpenAI(prompt, apiKey, conversationContext = []) {
  if (!apiKey || !prompt) {
    return { error: 'Missing API key or prompt' };
  }

  // Check cache first
  const cached = getCachedResponse(prompt, 'OPENAI');
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
        model: 'gpt-3.5-turbo',
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
    cacheResponse(prompt, 'OPENAI', text);
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
export async function callGoogleGemini(prompt, apiKey, conversationContext = []) {
  if (!apiKey || !prompt) {
    return { error: 'Missing API key or prompt' };
  }

  // Check cache first
  const cached = getCachedResponse(prompt, 'GOOGLE');
  if (cached) return { response: cached, model: 'GOOGLE', cached: true };

  const url = `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`;
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
    cacheResponse(prompt, 'GOOGLE', text);
    return { response: text, model: 'GOOGLE' };
  } catch (e) {
    return { error: e.message || 'Gemini request failed' };
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
  const envKeys = getApiKeys();
  const openaiKey = apiKeys.openaiKey ?? apiKeys.openai ?? envKeys.openai;
  const googleKey = apiKeys.googleKey ?? apiKeys.google ?? envKeys.google;
  const route = strategy.route || ['LOCAL'];
  const fallbacks = strategy.fallbacks || [];
  const seen = new Set();
  const chain = [];
  for (const m of [...route, ...fallbacks]) {
    if (!seen.has(m)) { seen.add(m); chain.push(m); }
  }
  let best = { response: '', model: 'LOCAL', quality: 0 };

  for (const model of chain) {
    if (model === 'LOCAL' && typeof generateLocal === 'function') {
      const local = generateLocal(question);
      const q = scoreResponseQuality(local, question);
      const th = (QUALITY_THRESHOLDS && QUALITY_THRESHOLDS.LOCAL) ?? 3;
      if (q >= th) return { response: local, model: 'LOCAL', quality: q, usedFallback: false };
      if (q > best.quality) best = { response: local, model: 'LOCAL', quality: q };
      continue;
    }
    if (model === 'OPENAI' && openaiKey && !isRateLimited('OPENAI')) {
      const out = await callOpenAI(question, openaiKey, conversationContext);
      if (out.rateLimited) continue;
      if (out.error) continue;
      const q = scoreResponseQuality(out.response, question);
      const th = (QUALITY_THRESHOLDS && QUALITY_THRESHOLDS.OPENAI) ?? 6;
      if (q >= th) return { response: out.response, model: 'OPENAI', quality: q, usedFallback: best.model !== 'LOCAL' };
      if (q > best.quality) best = { response: out.response, model: 'OPENAI', quality: q };
      continue;
    }
    if (model === 'GOOGLE' && googleKey && !isRateLimited('GOOGLE')) {
      const out = await callGoogleGemini(question, googleKey, conversationContext);
      if (out.rateLimited) continue;
      if (out.error) continue;
      const q = scoreResponseQuality(out.response, question);
      const th = (QUALITY_THRESHOLDS && QUALITY_THRESHOLDS.GOOGLE) ?? 5;
      if (q >= th) return { response: out.response, model: 'GOOGLE', quality: q, usedFallback: best.model !== 'LOCAL' };
      if (q > best.quality) best = { response: out.response, model: 'GOOGLE', quality: q };
    }
  }

  const th = (QUALITY_THRESHOLDS && QUALITY_THRESHOLDS[best.model]) ?? 5;
  const qualityWarning = best.quality > 0 && best.quality < th;
  const fallback = typeof generateLocal === 'function' ? generateLocal(question) : "I'm best with studying, writing, coding, and Nexus features. Try asking about those!";
  return {
    response: best.response || fallback,
    model: best.model,
    quality: best.quality,
    usedFallback: true,
    qualityWarning,
    canRetry: true,
  };
}

/**
 * Clear response cache (optional - for testing or manual cache reset)
 */
export function clearCache() {
  for (const key in responseCache) {
    delete responseCache[key];
  }
}

export default { callOpenAI, callGoogleGemini, runFallbackChain, clearCache, getApiKeys };
