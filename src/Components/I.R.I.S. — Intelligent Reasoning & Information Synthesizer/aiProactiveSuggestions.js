/**
 * AI Proactive Suggestions - Think Ahead & Suggest What Users Haven't Asked
 * Makes AI feel less reactive, more like a thinking partner
 * Anticipates needs, suggests adjacent context, catches edge cases
 */

/**
 * Context from user behavior - what have they been asking about?
 * Used to anticipate next questions and proactively help
 */
export function analyzeUserContext(conversationHistory = []) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { topics: [], expertise: 'unknown', pace: 'unknown' };
  }

  const recentMessages = conversationHistory.slice(-10);
  const allText = recentMessages.map((m) => m.text || '').join(' ').toLowerCase();

  // Detect topics
  const topicPatterns = {
    coding: /code|javascript|python|function|loop|variable|debug|api/i,
    learning: /learn|study|understand|explain|tutorial|course|practice/i,
    career: /job|career|interview|resume|salary|promotion|hire/i,
    business: /startup|business|product|market|customer|revenue/i,
    writing: /write|essay|article|blog|content|draft|edit/i,
    math: /calculate|equation|algebra|geometry|math|number/i,
    design: /design|ui|ux|layout|color|font|sketch/i,
  };

  const detectedTopics = [];
  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(allText)) {
      detectedTopics.push(topic);
    }
  }

  // Detect expertise level
  let expertise = 'intermediate';
  if (/beginner|new to|just started|how do i start/i.test(allText)) expertise = 'beginner';
  if (/advanced|complex|optimize|architecture|algorithm/i.test(allText)) expertise = 'advanced';

  // Detect pace
  let pace = 'normal';
  if (/deadline|rush|urgent|quick|fast|asap/i.test(allText)) pace = 'fast';
  if (/long term|gradually|step by step|careful/i.test(allText)) pace = 'deliberate';

  return {
    topics: detectedTopics,
    expertise,
    pace,
    messageCount: conversationHistory.length,
  };
}

/**
 * Suggest next logical step or question they should ask
 * After "I'm learning JavaScript", suggest: "What about debugging?"
 */
export function suggestNextStep(lastQuestion, context = {}) {
  const suggestions = [];

  // Learning path progression
  if (/how do i (start|learn) .+/i.test(lastQuestion)) {
    suggestions.push({
      type: 'deepen',
      question: 'Want to dive deeper into the fundamentals?',
      why: 'Strong foundations avoid years of confusion later',
    });
    suggestions.push({
      type: 'practice',
      question: 'Ready to build something with what you\'ve learned?',
      why: 'Building beats reading - you\'ll actually remember it',
    });
  }

  // Problem-solving progression
  if (/how do i (fix|solve|debug) .+/i.test(lastQuestion)) {
    suggestions.push({
      type: 'prevent',
      question: 'How can you prevent this from happening again?',
      why: 'Fix the symptom once, prevent the cause forever',
    });
    suggestions.push({
      type: 'document',
      question: 'Should you document this for future reference?',
      why: 'You\'ll forget this solution in 3 months without docs',
    });
  }

  // Decision-making progression
  if (/should i|best way|which|option/i.test(lastQuestion)) {
    suggestions.push({
      type: 'tradeoffs',
      question: 'What are the tradeoffs you care about? (Speed vs quality? Cost vs features?)',
      why: 'Context changes the answer',
    });
    suggestions.push({
      type: 'reversibility',
      question: 'Can you change this decision later if you\'re wrong?',
      why: 'Reversible decisions should be made faster',
    });
  }

  // Learning edge cases
  if (context.expertise === 'beginner' && suggestions.length === 0) {
    suggestions.push({
      type: 'fundamentals',
      question: 'Want to understand the "why" behind this, not just the "how"?',
      why: 'Why beats How when you\'re starting out',
    });
  }

  return suggestions;
}

/**
 * Identify gaps or unasked questions in conversation
 * If user asks about "X" but not "Y", they might need Y
 */
export function identifyUnaskedQuestions(conversationHistory = [], currentTopic) {
  const implied = {
    coding: [
      { question: 'How do you test your code?', gap: 'testing' },
      { question: 'How do you version control this?', gap: 'git' },
      { question: 'How do you debug when it breaks?', gap: 'debugging' },
      { question: 'How do you handle errors?', gap: 'error_handling' },
    ],
    learning: [
      { question: 'Are you building projects while learning?', gap: 'applied_learning' },
      { question: 'How will you know if you actually understand this?', gap: 'assessment' },
      { question: 'What will you build with this?', gap: 'application' },
    ],
    career: [
      { question: 'Have you considered the non-technical skills needed?', gap: 'soft_skills' },
      { question: 'What\'s your 5-year plan?', gap: 'long_term_vision' },
      { question: 'Are you building a network while you\'re here?', gap: 'networking' },
    ],
  };

  const topicLower = currentTopic.toLowerCase();
  for (const [key, gaps] of Object.entries(implied)) {
    if (topicLower.includes(key)) {
      // Filter out gaps already covered
      const covered = conversationHistory
        .map((m) => m.text.toLowerCase())
        .join(' ');

      return gaps.filter((g) => !covered.includes(g.gap));
    }
  }

  return [];
}

/**
 * Proactive warnings - catch mistakes before they happen
 * "I'm deploying to production" → "Wait, did you test this?"
 */
export function proactiveWarnings(userMessage, context = {}) {
  const warnings = [];

  // Production without testing
  if (/deploy|production|go live|release|ship/i.test(userMessage)) {
    if (!context.recentTopics?.includes('testing')) {
      warnings.push({
        severity: 'high',
        message: '⚠️ Wait - have you tested this thoroughly?',
        why: 'Production bugs = real users losing trust',
        suggestion: 'Run through testing checklist first',
      });
    }
  }

  // Major decision made quickly
  if (/decided|going to|going with|picked|chose/i.test(userMessage)) {
    if (context.pace === 'fast') {
      warnings.push({
        severity: 'medium',
        message: '🤔 Pause - is this decision reversible?',
        why: 'Fast decisions on non-reversible choices often get regretted',
        suggestion: 'Sleep on it, or set a review date',
      });
    }
  }

  // Overcommitting
  if (/will (do|complete|finish) .+ by .+/i.test(userMessage)) {
    if (/tomorrow|this week|next week/i.test(userMessage) && /and also|plus|also need/i.test(userMessage)) {
      warnings.push({
        severity: 'medium',
        message: '📊 That\'s a lot. Does this estimate account for unknowns?',
        why: 'Most people underestimate by 2-3x',
        suggestion: 'Add 50% buffer to time estimates',
      });
    }
  }

  // Reinventing the wheel
  if (/write|build|create.*from scratch/i.test(userMessage)) {
    warnings.push({
      severity: 'low',
      message: '🔍 Quick check - does this already exist?',
      why: 'Existing solutions usually work better than homebrew',
      suggestion: 'Search for existing libraries/tools first',
    });
  }

  // Not backing up work
  if (/lost.*work|forgot to save|hard drive failed/i.test(userMessage)) {
    warnings.push({
      severity: 'high',
      message: '💾 Protect yourself going forward',
      why: 'This is preventable',
      suggestion: 'Set up automated backups today',
    });
  }

  return warnings;
}

/**
 * Suggest micro-habits that compound
 * Instead of "learn machine learning", suggest: "30 min coding daily"
 */
export function suggestCompoundingHabits(goal) {
  const habits = {
    coding: [
      { habit: 'Code 30 minutes daily', why: 'Consistency beats marathon sessions', result: 'In 6 months: solid portfolio' },
      { habit: 'Review 1 PR/commit daily', why: 'Learn from others\' code', result: 'In 3 months: read like experienced dev' },
      { habit: 'Debug 1 problem weekly', why: 'Debugging skill = rare + valuable', result: 'In 1 year: debugging expert' },
    ],
    learning: [
      { habit: 'Teach 1 concept weekly', why: 'Teaching = deepest learning', result: 'In 6 months: expert-level understanding' },
      { habit: 'Build 1 project monthly', why: 'Real projects > tutorials', result: 'In 1 year: portfolio worth showing' },
      { habit: 'Read 1 chapter daily', why: 'Knowledge accumulates', result: 'In 1 year: read 250+ books worth' },
    ],
    productivity: [
      { habit: 'Plan day before bed', why: 'Tomorrow feels less overwhelming', result: 'In 1 week: 20% more productive' },
      { habit: 'Time block 2-hour chunks', why: 'Deep work beats context switching', result: 'In 2 weeks: noticeably sharper work' },
      { habit: '1 hour admin/email daily', why: 'Prevents chaos later', result: 'In 1 month: manageable inbox' },
    ],
  };

  const goalLower = goal.toLowerCase();
  for (const [key, habitList] of Object.entries(habits)) {
    if (goalLower.includes(key)) {
      return {
        goal,
        habits: habitList,
        insight: '💡 Small daily habits beat sporadic effort every time',
      };
    }
  }

  return { goal, habits: [] };
}

/**
 * Suggest related resources/people who might help
 * If stuck on JavaScript → suggest: browser DevTools, stack overflow, etc.
 */
export function suggestResources(topic) {
  const resources = {
    javascript: [
      { resource: 'MDN Web Docs', type: 'reference', why: 'Most accurate JavaScript docs' },
      { resource: 'Browser DevTools', type: 'tool', why: 'Debug anything in 5 minutes' },
      { resource: 'JavaScript.info', type: 'learning', why: 'Deep explanations of JS concepts' },
    ],
    debugging: [
      { resource: 'Debugger', type: 'tool', why: 'Step through code, see exactly what\'s happening' },
      { resource: 'Console logging strategy', type: 'technique', why: 'Log the right things at the right time' },
      { resource: 'Rubber duck debugging', type: 'technique', why: 'Explaining code finds bugs 70% of the time' },
    ],
    learning: [
      { resource: 'Build a project', type: 'action', why: 'The fastest way to learn' },
      { resource: 'Find a mentor', type: 'person', why: 'Saves you years of mistakes' },
      { resource: 'Join a community', type: 'community', why: 'Learn from others\' questions' },
    ],
  };

  const topicLower = topic.toLowerCase();
  for (const [key, resourceList] of Object.entries(resources)) {
    if (topicLower.includes(key)) {
      return {
        topic,
        resources: resourceList,
      };
    }
  }

  return { topic, resources: [] };
}

/**
 * Format proactive suggestions for user
 * Makes them feel like AI is anticipating needs
 */
export function formatProactiveSuggestion(suggestion) {
  const { type, question, why } = suggestion;

  return `\n💡 **Before we go further...**\n${question}\n*${why}*`;
}

export default {
  analyzeUserContext,
  suggestNextStep,
  identifyUnaskedQuestions,
  proactiveWarnings,
  suggestCompoundingHabits,
  suggestResources,
  formatProactiveSuggestion,
};
