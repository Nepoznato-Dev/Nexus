/**
 * AI Router - Intelligent routing to best AI model for each question
 * Quality-first approach: uses fast free models only when safe, falls back to premium for quality
 */

// Question complexity scoring
const COMPLEXITY_INDICATORS = {
  SIMPLE: {
    patterns: [
      /^(what is|define|what's|what are)\s+/i, // definitions
      /^(is|are|do|does|can|will|should|would)\s+/i, // yes/no questions
      /^(\d+[\+\-\*\/]\d+|solve|calculate|how much|how many)/i, // basic math
      /^(how do you spell|spelling of|synonym for|antonym for)/i, // word stuff
      /^(when was|what year|what date)/i, // simple facts
    ],
    keywords: ['define', 'what is', 'spell', 'math', 'calculate', 'simple', 'quick', 'fast'],
    maxComplexity: 2, // low complexity
  },
  MEDIUM: {
    patterns: [
      /^(explain|why|how does|how does)\s+/i,
      /^(describe|compare|contrast)/i,
      /^(help me understand)/i,
      /^(what's the difference|pros and cons)/i,
    ],
    keywords: ['explain', 'understand', 'help', 'compare', 'describe', 'concept'],
    maxComplexity: 5,
  },
  COMPLEX: {
    patterns: [
      /^(solve this problem|debug|help me code)/i,
      /^(advanced|complex|sophisticated)/i,
      /^(how would you|what would you recommend|best way to)/i,
    ],
    keywords: ['advanced', 'complex', 'deep', 'difficult', 'challenging', 'quantum', 'algorithm'],
    maxComplexity: 10,
  },
};

export const analyzeComplexity = (question) => {
  let complexity = 0;
  let category = 'MEDIUM';

  // Check patterns
  for (const [cat, data] of Object.entries(COMPLEXITY_INDICATORS)) {
    for (const pattern of data.patterns) {
      if (pattern.test(question)) {
        complexity += 1;
        category = cat;
        break;
      }
    }
  }

  // Count keywords
  const lowerQuestion = question.toLowerCase();
  for (const [cat, data] of Object.entries(COMPLEXITY_INDICATORS)) {
    for (const keyword of data.keywords) {
      if (lowerQuestion.includes(keyword)) {
        complexity += 0.5;
        if (complexity <= data.maxComplexity) {
          category = cat;
        }
      }
    }
  }

  // Penalize complex signals
  if (question.length > 200) complexity += 1; // long questions tend to be complex
  if (/why|how|when|what|where/.test(question)) complexity += 0.3;
  if (/code|programming|algorithm|data structure/i.test(question)) complexity += 3;
  if (/calculus|quantum|relativity|differential/i.test(question)) complexity += 2;

  return {
    complexity: Math.min(complexity, 10),
    category,
    shouldUsePremium: complexity > 4,
  };
};

/**
 * Quality scoring for responses
 * Higher score = better response quality
 */
export const scoreResponseQuality = (response, question) => {
  let score = 0;

  // Length check (too short = probably bad)
  if (response.length < 30) score -= 3;
  if (response.length > 10) score += 1; // at least has content
  if (response.length > 100) score += 1;
  if (response.length > 300) score += 1;

  // Structure check
  if (/^(sorry|i can't|i don't know)/i.test(response)) score -= 5;
  if (/undefined|null|error|failed/i.test(response)) score -= 3;
  if (/\n\n/.test(response)) score += 2; // has paragraphs
  if (/\d+[\.\)]\s/.test(response)) score += 2; // has numbered list

  // Content specificity
  const questionKeywords = question.toLowerCase().split(/\s+/);
  const responseWords = response.toLowerCase().split(/\s+/);
  const keywordMatches = questionKeywords.filter(
    (kw) => responseWords.includes(kw) && kw.length > 3
  ).length;
  score += Math.min(keywordMatches, 5); // reward addressing the actual question

  // Helpful signals
  if (/because|reason|therefore|thus|however|although/i.test(response)) score += 2; // logical flow
  if (/example|for instance|such as/i.test(response)) score += 2; // has examples
  if (/note that|important|key point/i.test(response)) score += 1; // highlights importance

  // Educational quality
  if (/step|first|second|third|next/i.test(response)) score += 2; // step-by-step
  if (/based on|according to|research shows/i.test(response)) score += 1; // credible
  if (/you|your|student|learner/i.test(response)) score += 1; // personalized

  return Math.max(0, Math.min(10, score)); // clamp 0-10
};

/**
 * Determine which AI model(s) to use
 * Returns routing strategy for the question
 * Automatically avoids rate-limited APIs
 */
export const routeQuestion = (question, userSettings = {}) => {
  const complexity = analyzeComplexity(question);
  const { openaiKey, googleKey, localMode } = userSettings;

  // Build list of available models
  const availableModels = [];
  if (openaiKey && !isRateLimited('OPENAI')) availableModels.push('OPENAI');
  if (googleKey && !isRateLimited('GOOGLE')) availableModels.push('GOOGLE');
  availableModels.push('LOCAL'); // Always available

  // Quality-first routing logic
  const strategy = {
    complexity: complexity.complexity,
    category: complexity.category,
    route: [],
    fallbacks: [],
    expectedLatency: 0,
    rateLimitWarning: null,
  };

  // Check if preferred model is rate-limited
  const openaiLimited = openaiKey && isRateLimited('OPENAI');
  const googleLimited = googleKey && isRateLimited('GOOGLE');

  // SIMPLE questions: try fast free model first, fallback to Google, then OpenAI
  if (complexity.complexity <= 2) {
    strategy.route = ['LOCAL']; // Local template responses (instant)
    strategy.fallbacks = [];
    
    if (googleKey && !googleLimited) strategy.fallbacks.push('GOOGLE');
    if (openaiKey && !openaiLimited) strategy.fallbacks.push('OPENAI');
    
    strategy.expectedLatency = 100; // ms
  }
  // MEDIUM questions: Google free tier, fallback to OpenAI if quality is low
  else if (complexity.complexity <= 5) {
    if (googleKey && !googleLimited) {
      strategy.route = ['GOOGLE'];
      if (openaiKey && !openaiLimited) strategy.fallbacks = ['OPENAI'];
    } else if (openaiKey && !openaiLimited) {
      strategy.route = ['OPENAI'];
      if (googleKey && !googleLimited) strategy.fallbacks = ['GOOGLE'];
    } else {
      strategy.route = ['LOCAL'];
      if (googleLimited || openaiLimited) {
        strategy.rateLimitWarning = 'APIs temporarily unavailable due to rate limits';
      }
    }
    strategy.expectedLatency = 2000; // ms
  }
  // COMPLEX questions: prefer OpenAI, but use Google if OpenAI is rate-limited
  else {
    if (openaiKey && !openaiLimited) {
      strategy.route = ['OPENAI'];
      if (googleKey && !googleLimited) strategy.fallbacks = ['GOOGLE'];
    } else if (googleKey && !googleLimited) {
      // OpenAI preferred but rate-limited, use Google
      strategy.route = ['GOOGLE'];
      strategy.rateLimitWarning = 'Using Google Gemini (OpenAI temporarily unavailable)';
    } else {
      strategy.route = ['LOCAL']; // fallback to template if no APIs available
      if (openaiLimited || googleLimited) {
        strategy.rateLimitWarning = 'APIs temporarily unavailable due to rate limits';
      }
    }
    strategy.expectedLatency = 3000; // ms
  }

  return strategy;
};

/**
 * Evaluate if response quality is acceptable
 * Returns true if response is good enough to show user
 * Returns false if we should try a better AI model
 */
export const isResponseQualityAcceptable = (response, question, model = 'LOCAL') => {
  const score = scoreResponseQuality(response, question);

  // Different quality thresholds per model
  const QUALITY_THRESHOLDS = {
    LOCAL: 3, // templates are basic, lower bar
    GOOGLE: 5, // Google Gemini should be pretty good
    OPENAI: 6, // OpenAI should be excellent
    ANTHROPIC: 6.5, // Claude is very good
  };

  const threshold = QUALITY_THRESHOLDS[model] || 5;
  return score >= threshold;
};

/**
 * Rate limit tracker - remembers when APIs hit limits
 */
const rateLimitTracker = {
  openai: { limitedUntil: null, retryAfter: 60000 }, // 1 min default
  google: { limitedUntil: null, retryAfter: 60000 },
  anthropic: { limitedUntil: null, retryAfter: 60000 },
};

/**
 * Mark API as rate-limited
 */
export const markRateLimited = (api, retryAfterSeconds = 60) => {
  const now = Date.now();
  rateLimitTracker[api.toLowerCase()] = {
    limitedUntil: now + retryAfterSeconds * 1000,
    retryAfter: retryAfterSeconds * 1000,
  };
  console.log(`⏳ ${api} rate limited. Retrying in ${retryAfterSeconds}s`);
};

/**
 * Check if API is currently rate-limited
 */
export const isRateLimited = (api) => {
  const tracker = rateLimitTracker[api.toLowerCase()];
  if (!tracker || !tracker.limitedUntil) return false;
  
  const now = Date.now();
  if (now >= tracker.limitedUntil) {
    // Cooldown expired
    tracker.limitedUntil = null;
    console.log(`✅ ${api} rate limit expired. Available again.`);
    return false;
  }
  
  const remainingSeconds = Math.ceil((tracker.limitedUntil - now) / 1000);
  console.log(`⏳ ${api} still rate limited for ${remainingSeconds}s`);
  return true;
};

/**
 * Get model ranking for fallback priority
 * Higher priority = try first when previous model fails
 * Skips rate-limited APIs
 */
export const getModelPriority = (availableModels) => {
  const basePriority = ['OPENAI', 'ANTHROPIC', 'GOOGLE', 'LOCAL'];
  
  // Filter out rate-limited models
  const availableNow = availableModels.filter(
    (model) => !isRateLimited(model)
  );
  
  // If all are rate-limited, return LOCAL as last resort
  if (availableNow.length === 0) {
    console.warn('⚠️ All APIs rate limited, falling back to LOCAL');
    return ['LOCAL'];
  }
  
  return availableNow.sort(
    (a, b) => basePriority.indexOf(a) - basePriority.indexOf(b)
  );
};

/**
 * Format quality report for debugging
 */
export const getQualityReport = (response, question) => {
  return {
    questionLength: question.length,
    responseLength: response.length,
    qualityScore: scoreResponseQuality(response, question),
    complexity: analyzeComplexity(question),
    hasExamples: /example|instance|such as/i.test(response),
    hasSteps: /step|first|second|next/i.test(response),
    hasLogicalFlow: /because|therefore|however|although/i.test(response),
  };
};

/**
 * Generate thinking process explanation for transparency
 * Shows user what the AI is analyzing and why it made routing decisions
 */
export const generateThinkingProcess = (question, strategy, responseData = null) => {
  const steps = [];
  const { complexity, category, route, fallbacks, rateLimitWarning } = strategy;

  // Step 1: Question analysis
  steps.push({
    step: 'Analyzing question',
    detail: `Complexity: ${complexity.toFixed(1)}/10 (${category})`,
    icon: '🔍',
  });

  // Step 2: Routing decision
  const modelName = {
    'OPENAI': 'OpenAI GPT',
    'GOOGLE': 'Google Gemini',
    'ANTHROPIC': 'Claude',
    'LOCAL': 'Local Templates',
  }[route[0]] || route[0];

  let routingReason = '';
  if (complexity.complexity <= 2) {
    routingReason = 'Simple question → Using fast local responses';
  } else if (complexity.complexity <= 5) {
    routingReason = route[0] === 'GOOGLE' 
      ? 'Medium complexity → Using Google Gemini (free tier)'
      : 'Medium complexity → Using premium AI';
  } else {
    routingReason = route[0] === 'OPENAI'
      ? 'Complex question → Using best available model (OpenAI)'
      : route[0] === 'GOOGLE'
      ? 'Complex question → Using Google Gemini (OpenAI unavailable)'
      : 'Complex question → No API available, using templates';
  }

  steps.push({
    step: 'Selecting AI model',
    detail: `${modelName} - ${routingReason}`,
    icon: '🤖',
  });

  // Step 3: Rate limit warnings
  if (rateLimitWarning) {
    steps.push({
      step: 'Rate limit detected',
      detail: rateLimitWarning,
      icon: '⏳',
    });
  }

  // Step 4: Quality evaluation (if response exists)
  if (responseData) {
    const qualityScore = scoreResponseQuality(responseData.response, question);
    const qualityEmoji = qualityScore >= 7 ? '✨' : qualityScore >= 5 ? '👍' : '⚠️';
    
    steps.push({
      step: 'Quality check',
      detail: `Score: ${qualityScore}/10 ${qualityEmoji}`,
      icon: '📊',
    });

    // Show if fallback was used
    if (responseData.usedFallback) {
      steps.push({
        step: 'Quality too low',
        detail: `Upgraded to ${responseData.finalModel} for better response`,
        icon: '⬆️',
      });
    }
  }

  // Step 5: Available fallbacks
  if (fallbacks.length > 0) {
    steps.push({
      step: 'Backup models ready',
      detail: `Fallback: ${fallbacks.map(f => modelName[f] || f).join(' → ')}`,
      icon: '🔄',
    });
  }

  return {
    steps,
    summary: `${category} question (${complexity.toFixed(1)}/10) → ${modelName}`,
    estimatedTime: strategy.expectedLatency,
  };
};

/**
 * Generate readable explanation of why a specific model was chosen
 */
export const explainModelChoice = (question, chosenModel, complexity) => {
  const reasons = [];

  // Complexity-based reasons
  if (complexity.complexity <= 2) {
    reasons.push('Question is straightforward (definitions, simple facts, basic math)');
    if (chosenModel === 'LOCAL') {
      reasons.push('Local templates are instant and sufficient for simple queries');
    }
  } else if (complexity.complexity <= 5) {
    reasons.push('Question requires moderate explanation or problem-solving');
