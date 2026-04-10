/**
 * AI Self-Awareness & Validation System
 * Makes AI honest about uncertainty, validates own decisions, catches edge cases
 * A truly thinking AI doesn't pretend to know what it doesn't know
 */

/**
 * Uncertainty scoring - does this answer actually make sense?
 * Returns confidence 0-100% and flags if unsure
 */
export function scoreConfidence(question, answer, context = {}) {
  let confidence = 75; // Start at baseline

  // Length check - very short answers are often incomplete
  if (answer.length < 50) {
    confidence -= 25;
  } else if (answer.length > 50 && answer.length < 200) {
    confidence -= 5;
  }

  // Structure check - well-structured answers are usually better
  if (/\n\n/.test(answer)) confidence += 5; // Paragraphs
  if (/\d+[\.\)]\s|^[\-\*•]\s/m.test(answer)) confidence += 5; // Lists
  if (/(because|therefore|thus|since|as a result)/i.test(answer)) confidence += 5; // Logic

  // Question-answer alignment
  const qWords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const aWords = answer.toLowerCase();
  const matches = qWords.filter((w) => aWords.includes(w)).length;
  if (matches < qWords.length / 2) {
    confidence -= 15; // Doesn't fully address question
  }

  // Domain-specific signals
  if (/uncertain|might|could|possibly|unclear|ambiguous/i.test(answer)) {
    confidence -= 10; // Answer already hedges
  }

  // Time-sensitive content (dates, versions, current events)
  if (/2024|2025|2026|current|latest|now|recently|just|released/i.test(question)) {
    confidence -= 20; // Might be outdated
  }

  // Opinion vs fact
  if (/i think|in my opinion|i believe|seems like/i.test(answer)) {
    if (!/fact|research shows|study found|evidence/i.test(answer)) {
      confidence -= 15; // Opinion without backing
    }
  }

  // Edge case detection
  if (context.isEdgeCase) {
    confidence -= 10; // Edge cases are inherently uncertain
  }

  // Cap at 0-100
  confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  return {
    confidence,
    isUncertain: confidence < 60,
    shouldQualify: confidence < 70,
  };
}

/**
 * Detect when AI is guessing vs. actually sure
 * Flags: vague language, contradiction, topic outside typical domain
 */
export function detectGuessing(answer) {
  const guessPatterns = [
    { pattern: /i (don't know|can't say|'m not sure)/i, type: 'admitted_uncertainty', severity: 'high' },
    { pattern: /might|could|possibly|perhaps|maybe|sort of|kind of|somewhat/i, type: 'hedging', severity: 'medium' },
    { pattern: /depends on|varies|it's complicated|not always/i, type: 'context_dependent', severity: 'low' },
    { pattern: /i think|in my opinion|seems like/i, type: 'opinion', severity: 'medium' },
    { pattern: /generally|usually|often|sometimes/i, type: 'generalization', severity: 'low' },
  ];

  const detectedPatterns = [];
  for (const { pattern, type, severity } of guessPatterns) {
    if (pattern.test(answer)) {
      detectedPatterns.push({ type, severity });
    }
  }

  return {
    isGuessing: detectedPatterns.length > 0,
    patterns: detectedPatterns,
    hasContradictions: /but|however|on the other hand|contrary|actually|wait/i.test(answer),
  };
}

/**
 * Suggest answer improvements - is there a better way to respond?
 * Instead of "I don't know", surface: what we do know, where to look, how to verify
 */
export function suggestAnswerImprovement(question, answer) {
  const improvements = [];

  // If too vague
  if (/i'm not sure|i don't know|unclear/i.test(answer)) {
    improvements.push({
      category: 'too_vague',
      suggestion: 'Instead of "I don\'t know", try: what part is unclear? Search for it. Verify the answer.',
      improved: 'I don\'t have direct info on [X], but here\'s how you could find it:',
    });
  }

  // If missing examples
  if (!/example|for instance|such as|like|e\.g\./i.test(answer) && answer.length > 100) {
    improvements.push({
      category: 'missing_examples',
      suggestion: 'Add concrete examples - makes abstract concepts stick',
      improved: 'Add: "For example, ..."',
    });
  }

  // If contradictory
  if (/but|however|on the other hand/.test(answer)) {
    const parts = answer.split(/but|however|on the other hand/i);
    if (parts[0].length > parts[1]?.length) {
      improvements.push({
        category: 'buried_caveat',
        suggestion: 'Lead with the caveat if it\'s important',
        improved: 'Put the "however" earlier to set proper context',
      });
    }
  }

  // If not actionable
  if (!/step|how to|try|check|verify|test|experiment/i.test(answer) && /should|could|might/i.test(question)) {
    improvements.push({
      category: 'not_actionable',
      suggestion: 'Turn insights into actionable steps',
      improved: 'Add: "Here\'s what to try: 1. ... 2. ... 3. ..."',
    });
  }

  // If overconfident
  if (/this is the best|always works|never fails|100%|guaranteed/i.test(answer)) {
    improvements.push({
      category: 'overconfident',
      suggestion: 'Absolute statements are usually wrong - add context',
      improved: 'Soften to: "This usually works when [condition], but not if [exception]"',
    });
  }

  return improvements;
}

/**
 * Validate assumptions in the answer
 * "The best way to learn is X" - what assumption is that based on?
 */
export function validateAssumptions(answer) {
  const assumptionPatterns = [
    { pattern: /best (way|approach|method)/i, assumption: 'There\'s one "best" - actually depends on goals' },
    { pattern: /always|never|everyone|nobody/i, assumption: 'Absolute claims usually have exceptions' },
    { pattern: /should|must|have to/i, assumption: 'Strong obligation - is it actually required?' },
    { pattern: /obviously|clearly|definitely/i, assumption: 'What\'s obvious to expert isn\'t to beginner' },
    { pattern: /it\'s (just|only|simply)/i, assumption: 'Minimizing complexity - usually more nuanced' },
  ];

  const assumptions = [];
  for (const { pattern, assumption } of assumptionPatterns) {
    if (pattern.test(answer)) {
      assumptions.push({
        pattern: pattern.source,
        assumption,
        caution: 'Verify this assumption in your context',
      });
    }
  }

  return assumptions;
}

/**
 * Generate honesty statement - when to qualify answer
 */
export function generateHonestQualifier(confidence, question) {
  if (confidence >= 85) {
    return null; // No qualifier needed
  }

  if (confidence >= 70) {
    return '💡 **I\'m fairly confident about this**, but your specific situation might differ - verify if critical.';
  }

  if (confidence >= 60) {
    return '⚠️ **I\'m moderately confident here.** This is my best guess based on common patterns, but I could be wrong. Consider [verifying/testing/asking a specialist].';
  }

  return '🤔 **I\'m uncertain about this.** The real answer probably depends on your specific context. Better approaches: [search], [test it], [ask specialist], [look at examples].';
}

/**
 * Surface when you don't have enough context
 * "You're asking about X, but I need to know Y to answer properly"
 */
export function requestContextualInfo(question) {
  const contextNeeds = {
    career: [
      'What\'s your current experience level?',
      'What are you optimizing for? (salary, growth, flexibility, impact?)',
      'What\'s your timeline? (urgent or 5-year plan?)',
    ],
    technical: [
      'What constraints matter most? (speed, cost, simplicity, scalability?)',
      'What\'s the deployment environment?',
      'What\'s your team size and expertise?',
    ],
    learning: [
      'What\'s your current knowledge level?',
      'How much time can you invest?',
      'What\'s your learning style? (visual, hands-on, reading?)',
    ],
    business: [
      'What\'s your stage? (idea, MVP, growing, scaling?)',
      'What\'s your budget?',
      'Who\'s your user?',
    ],
  };

  const qLower = question.toLowerCase();
  for (const [category, questions] of Object.entries(contextNeeds)) {
    if (qLower.includes(category) || qLower.split(' ').some((word) => questions[0]?.includes(word))) {
      return {
        needsContext: true,
        questions: questions,
        message: 'To give you the best answer, I need to know:',
      };
    }
  }

  return { needsContext: false };
}

/**
 * Suggest verification methods
 * "How can you verify this answer is actually correct?"
 */
export function suggestVerification(question, answer) {
  const verifications = [];

  // Technical claims
  if (/code|program|technical|algorithm|function|method/i.test(question)) {
    verifications.push({
      type: 'test_it',
      suggestion: 'Write a small test or example to verify this works',
      why: 'Code doesn\'t lie - it either works or it doesn\'t',
    });
  }

  // Factual claims
  if (/fact|true|false|is it|does it|does/i.test(question)) {
    verifications.push({
      type: 'primary_source',
      suggestion: 'Check the original source, not secondhand info',
      why: 'Facts can get distorted through retellings',
    });
  }

  // Performance claims
  if (/faster|slower|better|worse|more efficient|less efficient/i.test(question)) {
    verifications.push({
      type: 'benchmark',
      suggestion: 'Measure it in your specific context',
      why: 'Performance varies based on constraints and environment',
    });
  }

  // General advice
  verifications.push({
    type: 'small_scale',
    suggestion: 'Try this on a small scale before committing',
    why: 'Real-world results often differ from theory',
  });

  return verifications;
}

/**
 * Format self-aware response - includes confidence and caveats
 */
export function formatWithSelfAwareness(answer, question, confidence = 75) {
  const qualifier = generateHonestQualifier(confidence, question);
  const context = requestContextualInfo(question);
  const improvements = suggestAnswerImprovement(question, answer);
  const assumptions = validateAssumptions(answer);
  const verifications = suggestVerification(question, answer);

  let formatted = answer;

  // Add confidence qualifier if needed
  if (qualifier) {
    formatted += `\n\n${qualifier}`;
  }

  // Add context needs
  if (context.needsContext) {
    formatted += `\n\n❓ **${context.message}**\n`;
    for (const q of context.questions) {
      formatted += `• ${q}\n`;
    }
  }

  // Highlight major assumptions if any
  if (assumptions.length > 0) {
    formatted += `\n\n📌 **Key assumptions I'm making:**\n`;
    for (const assumption of assumptions.slice(0, 2)) {
      formatted += `• ${assumption.assumption}\n`;
    }
  }

  // Suggest how to verify
  if (verifications.length > 0) {
    formatted += `\n\n✅ **How to verify this is right:**\n`;
    for (const v of verifications.slice(0, 2)) {
      formatted += `• ${v.suggestion}\n`;
    }
  }

  return formatted;
}

export default {
  scoreConfidence,
  detectGuessing,
  suggestAnswerImprovement,
  validateAssumptions,
  generateHonestQualifier,
  requestContextualInfo,
  suggestVerification,
  formatWithSelfAwareness,
};
