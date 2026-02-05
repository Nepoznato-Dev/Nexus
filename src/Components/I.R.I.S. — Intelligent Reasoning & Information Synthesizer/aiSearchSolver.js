/**
 * AI Internet Search & Problem Solver
 * Uses Google Gemini for internet searches, complex math, and information lookup
 */

import { callGoogleGemini, resolveApiKeys } from './aiApiBridge.js';

/**
 * Search the internet using Google Gemini
 * Returns search results with links, summaries, and sources
 */
export async function searchInternet(query, apiKey) {
  const resolvedKeys = await resolveApiKeys({ googleKey: apiKey, apiProvider: 'google' });
  const googleKey = resolvedKeys.googleKey;

  if (!googleKey) {
    return {
      error: 'Google API key required for internet search',
      suggestion: 'Add your Google Gemini API key in Settings > AI Tools',
    };
  }

  const searchPrompt = `Search the internet for: "${query}"

Please provide:
1. A brief summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Relevant links/sources (if available)
4. Additional context or related topics

Format your response clearly with emojis and make it easy to read.`;

  try {
    const result = await callGoogleGemini(searchPrompt, googleKey, [], {
      enableSearch: true,
      searchQuery: query,
      model: resolvedKeys.model,
    });

    if (result.error) {
      return {
        error: result.error,
        fallback: `I couldn't search for "${query}" right now. Try asking me to explain it instead!`,
      };
    }

    return {
      response: result.response,
      model: 'GEMINI_SEARCH',
      searchQuery: query,
      links: extractLinks(result.response),
    };
  } catch (err) {
    return {
      error: err.message,
      fallback: `Search failed. But I can still try to answer: what specifically about "${query}" would you like to know?`,
    };
  }
}

/**
 * Extract URLs from text response
 */
function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map((url) => url.replace(/[.,;!?)]+$/, '')); // Remove trailing punctuation
}

/**
 * Solve simple math problems locally
 */
export function solveSimpleMath(expression) {
  try {
    // Remove spaces and validate safe math expression
    const clean = expression.replace(/\s/g, '');

    // Only allow numbers, operators, parentheses, decimal points
    if (!/^[\d+\-*/.()^%\s]+$/.test(clean)) {
      return null; // Not a simple math expression
    }

    // Safely evaluate using Function constructor (better than eval)
    const result = Function(`'use strict'; return (${clean})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      return null;
    }

    return {
      expression: expression,
      result: result,
      steps: `${expression} = ${result}`,
    };
  } catch (err) {
    return null; // Not solvable locally
  }
}

/**
 * Detect if question is a math problem
 */
export function isMathProblem(text) {
  const mathIndicators = [
    /what is \d+/i,
    /calculate/i,
    /solve/i,
    /\d+\s*[\+\-\*\/\^]\s*\d+/,
    /equation/i,
    /algebra/i,
    /derivative/i,
    /integral/i,
    /solve for x/i,
  ];

  return mathIndicators.some((regex) => regex.test(text));
}

/**
 * Solve complex math using Google Gemini
 */
export async function solveComplexMath(problem, apiKey) {
  const resolvedKeys = await resolveApiKeys({ googleKey: apiKey, apiProvider: 'google' });
  const googleKey = resolvedKeys.googleKey;

  if (!googleKey) {
    return {
      error: 'Google API key required for complex math',
      suggestion: 'I can solve simple arithmetic, but for complex equations, add your Google API key in Settings',
    };
  }

  const mathPrompt = `Solve this math problem step-by-step: "${problem}"

Please provide:
1. The final answer
2. Step-by-step solution
3. Any relevant formulas or concepts used
4. A brief explanation

Use emojis to make it engaging! Format clearly with proper math notation.`;

  try {
    const result = await callGoogleGemini(mathPrompt, googleKey, [], { model: resolvedKeys.model });

    if (result.error) {
      return {
        error: result.error,
        fallback: 'I had trouble solving that. Can you break it down or rephrase the problem?',
      };
    }

    return {
      response: result.response,
      model: 'GEMINI_MATH',
      problem: problem,
    };
  } catch (err) {
    return {
      error: err.message,
      fallback: 'Math solver unavailable. Try simplifying the problem or ask me to explain the concept instead.',
    };
  }
}

/**
 * Get information about a topic using Gemini
 */
export async function lookupInformation(topic, apiKey) {
  const resolvedKeys = await resolveApiKeys({ googleKey: apiKey, apiProvider: 'google' });
  const googleKey = resolvedKeys.googleKey;

  if (!googleKey) {
    return {
      error: 'Google API key required for information lookup',
      suggestion: 'Add your Google Gemini API key to access the latest information',
    };
  }

  const infoPrompt = `Provide comprehensive information about: "${topic}"

Include:
1. Overview/definition (2-3 sentences)
2. Key facts (4-5 bullet points)
3. Why it matters or how it's used
4. Related topics or areas
5. Fun fact or interesting detail

Make it engaging with emojis and clear formatting!`;

  try {
    const result = await callGoogleGemini(infoPrompt, googleKey, [], { model: resolvedKeys.model });

    if (result.error) {
      return {
        error: result.error,
        fallback: `I don't have current info on "${topic}". Ask me something I can answer from my knowledge base!`,
      };
    }

    return {
      response: result.response,
      model: 'GEMINI_INFO',
      topic: topic,
    };
  } catch (err) {
    return {
      error: err.message,
      fallback: 'Information lookup failed. Try asking in a different way!',
    };
  }
}

/**
 * Provide links and sources for a topic
 */
export async function getSourcesAndLinks(topic, apiKey) {
  const resolvedKeys = await resolveApiKeys({ googleKey: apiKey, apiProvider: 'google' });
  const googleKey = resolvedKeys.googleKey;

  if (!googleKey) {
    return {
      error: 'Google API key required to fetch links and sources',
      links: [],
    };
  }

  const linksPrompt = `For the topic "${topic}", provide:
1. Top 5 reliable sources/websites to learn more
2. Format each as: [Title/Description] - URL
3. Brief note on why each source is helpful

Focus on educational, official, or well-known sources.`;

  try {
    const result = await callGoogleGemini(linksPrompt, googleKey, [], { model: resolvedKeys.model });

    if (result.error) {
      return {
        error: result.error,
        links: [],
      };
    }

    const links = extractLinks(result.response);
    return {
      response: result.response,
      links: links,
      topic: topic,
    };
  } catch (err) {
    return {
      error: err.message,
      links: [],
    };
  }
}

/**
 * Smart router for problem solving
 * Decides: simple math (local) vs complex (Gemini) vs search (Gemini)
 */
export async function solveProblem(userMessage, apiKey) {
  const lowerMsg = userMessage.toLowerCase();

  // Check if it's a search request
  const searchIndicators = ['search for', 'look up', 'find information', 'google', 'what is', 'who is'];
  if (searchIndicators.some((ind) => lowerMsg.includes(ind))) {
    return await searchInternet(userMessage.replace(/search for|look up|find information about|google/gi, '').trim(), apiKey);
  }

  // Check if it's a math problem
  if (isMathProblem(userMessage)) {
    // Try simple math first
    const simpleSolution = solveSimpleMath(userMessage);
    if (simpleSolution) {
      return {
        response: `📊 ${simpleSolution.steps}\n\nThat's ${simpleSolution.result}! ✨`,
        model: 'LOCAL_MATH',
        simple: true,
      };
    }

    // Fall back to complex math
    return await solveComplexMath(userMessage, apiKey);
  }

  // Information lookup
  const infoIndicators = ['tell me about', 'explain', 'what are', 'information about'];
  if (infoIndicators.some((ind) => lowerMsg.includes(ind))) {
    return await lookupInformation(userMessage.replace(/tell me about|explain|information about/gi, '').trim(), apiKey);
  }

  // Default: not a search/math/info request
  return null;
}

export default {
  searchInternet,
  solveSimpleMath,
  solveComplexMath,
  lookupInformation,
  getSourcesAndLinks,
  solveProblem,
  isMathProblem,
};
