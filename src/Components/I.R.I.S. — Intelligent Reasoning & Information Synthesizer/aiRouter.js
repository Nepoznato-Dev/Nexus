/**
 * AI Router - Intelligence & routing system
 * Complexity analysis, multi-model routing, rate-limit intelligence, quality scoring
 */

// Pattern matching: definitions, yes/no, explanations, problem-solving
const COMPLEXITY_PATTERNS = {
  definitions: /^(what is|define|what's|what are|meaning of|definition of)\s+/i,
  yesNo: /^(is|are|do|does|can|will|should|would|did|has|have)\s+.+\?$/i,
  simpleMath: /^(\d+[\+\-\*\/\^]\d+|calculate|compute|how much|how many)\s+/i,
  wordStuff: /^(how do you spell|spelling|synonym|antonym)\s+/i,
  simpleFacts: /^(when was|what year|what date|who invented)\s+/i,
  explanations: /^(explain|why|how does|describe|compare|contrast)\s+/i,
  helpUnderstand: /^(help me understand|what's the difference|pros and cons)/i,
  problemSolving: /^(solve|debug|help me code|implement|fix my)\s+/i,
  advanced: /^(advanced|complex|sophisticated|best way to|recommend|design)/i,
};

const SIMPLE_KEYWORDS = ['define', 'what is', 'spell', 'math', 'calculate', 'simple', 'quick', 'fast', 'basics'];
const MEDIUM_KEYWORDS = ['explain', 'understand', 'help', 'compare', 'describe', 'concept', 'example'];
const COMPLEX_KEYWORDS = ['algorithm', 'complex', 'deep', 'difficult', 'quantum', 'relativity', 'calculus', 'differential', 'architecture'];
const DOMAIN_BOOST = {
  code: /code|programming|function|loop|variable|algorithm|debug|api|data structure/i,
  math: /calculus|algebra|equation|integral|derivative|matrix|statistics/i,
  science: /physics|chemistry|quantum|relativity|biology|hypothesis/i,
};

/**
 * Complexity analysis algorithm
 * Outputs: complexity 0-10, SIMPLE|MEDIUM|COMPLEX, premium AI recommendation
 */
export const analyzeComplexity = (question) => {
  const q = question.trim();
  const lower = q.toLowerCase();
  let score = 0;
  let category = 'MEDIUM';

  // Pattern matching
  if (COMPLEXITY_PATTERNS.definitions.test(q) || COMPLEXITY_PATTERNS.yesNo.test(q) ||
      COMPLEXITY_PATTERNS.simpleMath.test(q) || COMPLEXITY_PATTERNS.wordStuff.test(q) ||
      COMPLEXITY_PATTERNS.simpleFacts.test(q)) {
    score += 0.5;
    if (category === 'MEDIUM') category = 'SIMPLE';
  }
  if (COMPLEXITY_PATTERNS.explanations.test(q) || COMPLEXITY_PATTERNS.helpUnderstand.test(q)) {
    score += 1.5;
    category = 'MEDIUM';
  }
  if (COMPLEXITY_PATTERNS.problemSolving.test(q) || COMPLEXITY_PATTERNS.advanced.test(q)) {
    score += 2.5;
    category = 'COMPLEX';
  }

  // Keyword density
  for (const k of SIMPLE_KEYWORDS) {
    if (lower.includes(k)) { score += 0.3; if (score <= 2) category = 'SIMPLE'; break; }
  }
  for (const k of MEDIUM_KEYWORDS) {
    if (lower.includes(k)) { score += 0.5; if (score <= 5) category = 'MEDIUM'; break; }
  }
  for (const k of COMPLEX_KEYWORDS) {
    if (lower.includes(k)) { score += 1.5; category = 'COMPLEX'; break; }
  }

  // Question length penalty: >200 chars = more complex
  if (q.length > 200) score += 1;

  // Domain-specific boosts (code/math/science)
  if (DOMAIN_BOOST.code.test(q)) score += 1.5;
  if (DOMAIN_BOOST.math.test(q)) score += 1;
  if (DOMAIN_BOOST.science.test(q)) score += 1.5;

  const complexity = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  if (complexity <= 2) category = 'SIMPLE';
  else if (complexity <= 5) category = 'MEDIUM';
  else category = 'COMPLEX';

  return {
    complexity,
    category,
    shouldUsePremium: complexity > 4,
  };
};

/**
 * Quality scoring (0-10)
 * Length checks, anti-patterns, structure rewards, keyword relevance,
 * logical indicators +2, examples/specificity +2, educational value +1
 */
export const scoreResponseQuality = (response, question) => {
  let score = 0;

  // Length: too short = bad, >100 chars = good
  if (response.length < 30) score -= 3;
  if (response.length > 10) score += 1;
  if (response.length > 100) score += 1;
  if (response.length > 300) score += 1;

  // Anti-patterns: penalties
  if (/i don't know|i can't|sorry,?\s+i/i.test(response)) score -= 5;
  if (/\bundefined\b|\bnull\b|\berror\b|\bfailed\b/i.test(response)) score -= 3;

  // Structure: paragraphs, numbered lists, bullet points
  if (/\n\n/.test(response)) score += 2;
  if (/\d+[\.\)]\s/.test(response)) score += 2;
  if (/^[\-\*•]\s/m.test(response)) score += 1;

  // Keyword relevance (response mentions question terms)
  const qWords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const rLower = response.toLowerCase();
  const matches = qWords.filter((w) => rLower.includes(w)).length;
  score += Math.min(matches, 5);

  // Logical indicators: because, therefore, however = +2
  if (/\b(because|therefore|however|thus|although)\b/i.test(response)) score += 2;

  // Examples/specificity: for instance, such as, step = +2
  if (/\b(for instance|such as|step|first|second|third|next)\b/i.test(response)) score += 2;

  // Educational value: based on, research shows = +1
  if (/\b(based on|according to|research shows)\b/i.test(response)) score += 1;

  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
};

/**
 * Multi-model routing logic
 * SIMPLE (≤2): LOCAL → Google → OpenAI
 * MEDIUM (3-5): Google primary → OpenAI fallback → LOCAL emergency
 * COMPLEX (6-10): OpenAI primary → Google fallback → LOCAL emergency
 * Selects fastest sufficient model; routes around rate-limited APIs.
 */
export const routeQuestion = (question, userSettings = {}) => {
  const analysis = analyzeComplexity(question);
  const comp = analysis.complexity;
  const cat = analysis.category;
  const openaiKey = userSettings.openaiKey ?? userSettings.openai;
  const googleKey = userSettings.googleKey ?? userSettings.google;
  const anthropicKey = userSettings.anthropicKey ?? userSettings.anthropic;
  const preferredProvider = userSettings.apiProvider;

  const openaiLimited = !!openaiKey && isRateLimited('OPENAI');
  const googleLimited = !!googleKey && isRateLimited('GOOGLE');
  const anthropicLimited = !!anthropicKey && isRateLimited('ANTHROPIC');
  const hasGoogle = !!googleKey && !googleLimited;
  const hasOpenAI = !!openaiKey && !openaiLimited;
  const hasAnthropic = !!anthropicKey && !anthropicLimited;

  const preferredModel = preferredProvider === 'openai'
    ? 'OPENAI'
    : preferredProvider === 'google'
      ? 'GOOGLE'
      : preferredProvider === 'anthropic'
        ? 'ANTHROPIC'
        : null;
  const hasPreferred = preferredModel === 'OPENAI'
    ? hasOpenAI
    : preferredModel === 'GOOGLE'
      ? hasGoogle
      : preferredModel === 'ANTHROPIC'
        ? hasAnthropic
        : false;

  const strategy = {
    complexity: comp,
    category: cat,
    route: [],
    fallbacks: [],
    expectedLatency: 0,
    rateLimitWarning: null,
  };

  if (comp <= 2) {
    strategy.route = ['LOCAL'];
    if (hasPreferred) strategy.fallbacks.push(preferredModel);
    if (hasGoogle && preferredModel !== 'GOOGLE') strategy.fallbacks.push('GOOGLE');
    if (hasOpenAI && preferredModel !== 'OPENAI') strategy.fallbacks.push('OPENAI');
    if (hasAnthropic && preferredModel !== 'ANTHROPIC') strategy.fallbacks.push('ANTHROPIC');
    strategy.expectedLatency = 100;
  } else if (comp <= 5) {
    if (hasPreferred) {
      strategy.route = [preferredModel];
      if (hasGoogle && preferredModel !== 'GOOGLE') strategy.fallbacks.push('GOOGLE');
      if (hasOpenAI && preferredModel !== 'OPENAI') strategy.fallbacks.push('OPENAI');
      if (hasAnthropic && preferredModel !== 'ANTHROPIC') strategy.fallbacks.push('ANTHROPIC');
      strategy.fallbacks.push('LOCAL');
    } else if (hasGoogle) {
      strategy.route = ['GOOGLE'];
      if (hasOpenAI) strategy.fallbacks.push('OPENAI');
      if (hasAnthropic) strategy.fallbacks.push('ANTHROPIC');
      strategy.fallbacks.push('LOCAL');
    } else if (hasOpenAI) {
      strategy.route = ['OPENAI'];
      if (hasGoogle) strategy.fallbacks.push('GOOGLE');
      if (hasAnthropic) strategy.fallbacks.push('ANTHROPIC');
      strategy.fallbacks.push('LOCAL');
    } else if (hasAnthropic) {
      strategy.route = ['ANTHROPIC'];
      if (hasGoogle) strategy.fallbacks.push('GOOGLE');
      if (hasOpenAI) strategy.fallbacks.push('OPENAI');
      strategy.fallbacks.push('LOCAL');
    } else {
      strategy.route = ['LOCAL'];
      if (openaiLimited || googleLimited || anthropicLimited) {
        strategy.rateLimitWarning = 'APIs temporarily unavailable due to rate limits. Using local templates.';
      }
    }
    strategy.expectedLatency = strategy.route[0] === 'LOCAL' ? 100 : 2000;
  } else {
    if (hasPreferred) {
      strategy.route = [preferredModel];
      if (hasOpenAI && preferredModel !== 'OPENAI') strategy.fallbacks.push('OPENAI');
      if (hasAnthropic && preferredModel !== 'ANTHROPIC') strategy.fallbacks.push('ANTHROPIC');
      if (hasGoogle && preferredModel !== 'GOOGLE') strategy.fallbacks.push('GOOGLE');
      strategy.fallbacks.push('LOCAL');
    } else if (hasOpenAI) {
      strategy.route = ['OPENAI'];
      if (hasAnthropic) strategy.fallbacks.push('ANTHROPIC');
      if (hasGoogle) strategy.fallbacks.push('GOOGLE');
      strategy.fallbacks.push('LOCAL');
    } else if (hasAnthropic) {
      strategy.route = ['ANTHROPIC'];
      if (hasOpenAI) strategy.fallbacks.push('OPENAI');
      if (hasGoogle) strategy.fallbacks.push('GOOGLE');
      strategy.fallbacks.push('LOCAL');
    } else if (hasGoogle) {
      strategy.route = ['GOOGLE'];
      strategy.rateLimitWarning = 'Primary models temporarily unavailable. Using Google Gemini.';
      if (hasOpenAI) strategy.fallbacks.push('OPENAI');
      if (hasAnthropic) strategy.fallbacks.push('ANTHROPIC');
      strategy.fallbacks.push('LOCAL');
    } else {
      strategy.route = ['LOCAL'];
      if (openaiLimited || googleLimited || anthropicLimited) {
        strategy.rateLimitWarning = 'APIs temporarily unavailable. Using local templates.';
      }
    }
    strategy.expectedLatency = strategy.route[0] === 'LOCAL' ? 100 : 3000;
  }

  return strategy;
};

/** Acceptability thresholds: LOCAL ≥3, Google ≥5, OpenAI ≥6 */
export const QUALITY_THRESHOLDS = {
  LOCAL: 3,
  GOOGLE: 5,
  OPENAI: 6,
  ANTHROPIC: 6.5,
};

/**
 * Returns true if response meets model-specific quality threshold
 */
export const isResponseQualityAcceptable = (response, question, model = 'LOCAL') => {
  const score = scoreResponseQuality(response, question);
  const threshold = QUALITY_THRESHOLDS[model] ?? 5;
  return score >= threshold;
};

/**
 * Rate limit intelligence: cooldown per provider (OpenAI, Google, Anthropic).
 * Detect 429/rate-limit → mark unavailable; auto-expire after retry-after.
 * Route around limited APIs; fallback to LOCAL if all blocked.
 */
const rateLimitTracker = {
  openai: { limitedUntil: null, retryAfter: 60000 },
  google: { limitedUntil: null, retryAfter: 60000 },
  anthropic: { limitedUntil: null, retryAfter: 60000 },
};

export const markRateLimited = (api, retryAfterSeconds = 60) => {
  const map = { OPENAI: 'openai', GOOGLE: 'google', ANTHROPIC: 'anthropic' };
  const slot = map[api] ?? api.toLowerCase();
  if (!rateLimitTracker[slot]) rateLimitTracker[slot] = { limitedUntil: null, retryAfter: 60000 };
  const sec = Math.max(1, Math.min(3600, retryAfterSeconds));
  const now = Date.now();
  rateLimitTracker[slot].limitedUntil = now + sec * 1000;
  rateLimitTracker[slot].retryAfter = sec * 1000;
};

export const isRateLimited = (api) => {
  const map = { OPENAI: 'openai', GOOGLE: 'google', ANTHROPIC: 'anthropic' };
  const slot = map[api] ?? api.toLowerCase();
  const t = rateLimitTracker[slot];
  if (!t || !t.limitedUntil) return false;
  if (Date.now() >= t.limitedUntil) {
    t.limitedUntil = null;
    return false;
  }
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
 * Quality report: question/response lengths, quality score, complexity,
 * hasExamples, hasSteps, hasLogic. Used for debugging and transparency.
 */
export const getQualityReport = (response, question) => {
  return {
    questionLength: question.length,
    responseLength: response.length,
    qualityScore: scoreResponseQuality(response, question),
    complexity: analyzeComplexity(question),
    hasExamples: /\b(example|for instance|such as)\b/i.test(response),
    hasSteps: /\b(step|first|second|third|next)\b/i.test(response),
    hasLogic: /\b(because|therefore|however|although|thus)\b/i.test(response),
  };
};

/**
 * Thinking process generator: question analysis, complexity score, model selection,
 * rate limit warnings, quality evaluation, fallback chain, estimated latency.
 */
const MODEL_NAMES = { OPENAI: 'OpenAI GPT', GOOGLE: 'Google Gemini', ANTHROPIC: 'Claude', LOCAL: 'Local Templates' };

export const generateThinkingProcess = (question, strategy, responseData = null) => {
  const steps = [];
  const { complexity, category, route, fallbacks, rateLimitWarning, expectedLatency } = strategy;
  const comp = typeof complexity === 'number' ? complexity : (complexity?.complexity ?? 0);
  const modelName = MODEL_NAMES[route[0]] ?? route[0];

  steps.push({
    step: 'Question analysis',
    detail: `Complexity: ${comp.toFixed(1)}/10 (${category})`,
    icon: '🔍',
  });

  let routingReason = '';
  if (comp <= 2) routingReason = 'Simple → LOCAL templates (instant)';
  else if (comp <= 5) routingReason = route[0] === 'GOOGLE' ? 'Medium → Google Gemini primary' : 'Medium → API primary';
  else routingReason = route[0] === 'OPENAI' ? 'Complex → OpenAI GPT primary' : route[0] === 'GOOGLE' ? 'Complex → Google (OpenAI unavailable)' : 'Complex → LOCAL emergency';

  steps.push({
    step: 'Model selection',
    detail: `${modelName} – ${routingReason}`,
    icon: '🤖',
  });

  if (rateLimitWarning) {
    steps.push({ step: 'Rate limit', detail: rateLimitWarning, icon: '⏳' });
  }

  if (responseData) {
    const qScore = scoreResponseQuality(responseData.response, question);
    const emoji = qScore >= 7 ? '✨' : qScore >= 5 ? '👍' : '⚠️';
    steps.push({ step: 'Quality evaluation', detail: `Score: ${qScore}/10 ${emoji}`, icon: '📊' });
    if (responseData.usedFallback) {
      steps.push({
        step: 'Fallback used',
        detail: `Upgraded to ${responseData.finalModel}`,
        icon: '⬆️',
      });
    }
  }

  if (fallbacks && fallbacks.length > 0) {
    steps.push({
      step: 'Fallback chain',
      detail: fallbacks.map((f) => MODEL_NAMES[f] ?? f).join(' → '),
      icon: '🔄',
    });
  }

  return {
    steps,
    summary: `${category} (${comp.toFixed(1)}/10) → ${modelName}`,
    estimatedTime: expectedLatency ?? strategy.expectedLatency ?? 0,
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
  } else {
    reasons.push('Question is complex; premium model preferred for quality.');
  }

  // Model-specific reasons
  if (chosenModel === 'GOOGLE') {
    reasons.push('Google Gemini offers excellent balance of speed and capability');
  } else if (chosenModel === 'OPENAI') {
    reasons.push('OpenAI GPT-3.5/4 provides highest quality for complex questions');
  } else if (chosenModel === 'LOCAL') {
    reasons.push('Local templates are fastest and sufficient for this query');
  }

  return reasons;
};

export default {
  analyzeComplexity,
  scoreResponseQuality,
  routeQuestion,
  isResponseQualityAcceptable,
  markRateLimited,
  isRateLimited,
  getModelPriority,
  getQualityReport,
  generateThinkingProcess,
  explainModelChoice,
  QUALITY_THRESHOLDS,
};
