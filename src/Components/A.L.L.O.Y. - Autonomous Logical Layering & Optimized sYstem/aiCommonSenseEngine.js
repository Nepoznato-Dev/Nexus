/**
 * AI Common Sense Engine - Lateral Thinking & Creative Problem-Solving
 * Makes AI think beyond binary choices, question premises, find handbrakes
 * Implements true reasoning rather than just executing logic trees
 */

/**
 * Detect false dilemmas and binary thinking traps
 * Pattern: "X or Y" when there's actually Z, W, or bypass entirely
 */
export function detectFalseDilemma(question) {
  const patterns = [
    { pattern: /should i (do|choose|pick) .+ or .+\?/i, type: 'binary_choice' },
    { pattern: /i (have to|must|can only) (do|choose) .+ or .+/i, type: 'false_necessity' },
    { pattern: /it's (either|both|just) .+ or .+/i, type: 'limited_scope' },
  ];

  for (const { pattern, type } of patterns) {
    if (pattern.test(question)) {
      return { isFalseDilemma: true, type, question };
    }
  }
  return { isFalseDilemma: false };
}

/**
 * Question the premise - what's assumed that shouldn't be?
 * E.g., "how do I convince my boss to give me a raise?"
 * → "Why does it need convincing? Do you have market data showing you're underpaid?"
 */
export function questionPremise(question) {
  const assumptions = [
    {
      pattern: /how (do|can) i (convince|persuade|get|make) .+/i,
      assumption: "Assumes persuasion is needed - have you validated the actual problem first?",
      reframe: "What's the real objection? Data usually works better than persuasion.",
    },
    {
      pattern: /should i (quit|leave|switch|change)/i,
      assumption: "Assumes staying/going is the core issue",
      reframe: "What specifically is wrong? Could it be fixed without changing jobs?",
    },
    {
      pattern: /i (can't|unable to|impossible to) .+/i,
      assumption: "Assumes it's actually impossible - is it or just hard/expensive?",
      reframe: "What's the real blocker? Time? Money? Knowledge? Focus there.",
    },
    {
      pattern: /best way to .+/i,
      assumption: "Assumes there's one 'best' way",
      reframe: "Best for what? Speed? Cost? Quality? Scale? Context matters.",
    },
    {
      pattern: /how do i (learn|master|understand) .+/i,
      assumption: "Assumes passive absorption - have you built/done anything yet?",
      reframe: "Learning by doing beats learning by reading. What can you build immediately?",
    },
  ];

  for (const { pattern, assumption, reframe } of assumptions) {
    if (pattern.test(question)) {
      return {
        questionedAssumption: true,
        assumption,
        reframe,
        original: question,
      };
    }
  }

  return { questionedAssumption: false };
}

/**
 * Find non-obvious solutions - the handbrake
 * Instead of accepting the binary, suggest lateral approaches
 */
export function findHandbrake(question, context = {}) {
  const solutions = [];

  // Pattern: Financial dilemma
  if (/money|cost|expensive|afford|budget/i.test(question)) {
    if (/spend|buy|invest/i.test(question)) {
      solutions.push({
        type: 'avoid_spending',
        idea: 'Can you get it for free? Borrow? Rent? Lease? Trade?',
        example: 'Instead of buying software, check open-source alternatives first',
      });
    }
    if (/earn|make|income/i.test(question)) {
      solutions.push({
        type: 'reduce_expenses',
        idea: 'Before earning more, can you spend less?',
        example: 'Cutting expenses by 30% beats earning 30% more in most situations',
      });
    }
  }

  // Pattern: Time crunch
  if (/don't have time|too busy|deadline|rush/i.test(question)) {
    solutions.push({
      type: 'delegate_automate',
      idea: 'What could you automate or delegate entirely?',
      example: 'Instead of doing it faster, remove the task from your list',
    });
    solutions.push({
      type: 'reduce_scope',
      idea: 'What if you did 50% of it at 80% quality?',
      example: 'MVP beats perfection when time is scarce',
    });
  }

  // Pattern: Technical problem
  if (/error|bug|broken|doesn't work|fail/i.test(question)) {
    solutions.push({
      type: 'skip_feature',
      idea: 'Do you actually need this feature, or was it nice-to-have?',
      example: 'Removing broken features is sometimes better than fixing them',
    });
    solutions.push({
      type: 'different_tool',
      idea: 'Is there a different tool/approach that sidesteps this problem?',
      example: 'If Tool A is broken, Tool B might work without the fix',
    });
  }

  // Pattern: Interpersonal conflict
  if (/disagree|conflict|argument|convince|persuade|argue/i.test(question)) {
    solutions.push({
      type: 'separate_concerns',
      idea: 'Are you trying to win, or trying to solve the problem?',
      example: 'Stop arguing about HOW and align on WHAT matters',
    });
    solutions.push({
      type: 'involve_third_party',
      idea: 'Could neutral mediation or data settle this?',
      example: 'Instead of debating, measure and decide based on results',
    });
  }

  // Pattern: Decision paralysis
  if (/can't decide|indecision|which|choose|option/i.test(question)) {
    solutions.push({
      type: 'reversible_decision',
      idea: 'Is this actually a big decision? Can you change it later?',
      example: 'Most career decisions are reversible - pick one and learn',
    });
    solutions.push({
      type: 'time_box_decision',
      idea: 'Set a deadline. Decide by then, not after.',
      example: '24-hour rule beats 2-week analysis paralysis',
    });
  }

  return solutions.length > 0 ? { hasHandbrake: true, solutions } : { hasHandbrake: false };
}

/**
 * Suggest related/adjacent ideas the user hasn't mentioned
 * "I want to learn JavaScript" → Also suggest: debugger, dev tools, git, command line
 */
export function suggestAdjacent(topic, expertise = 'beginner') {
  const suggestions = {
    javascript: [
      { item: 'Browser DevTools', why: 'Debug faster than logging', priority: 'high' },
      { item: 'Git/Version Control', why: 'Save your work, not just code', priority: 'high' },
      { item: 'Command Line Basics', why: 'Tools work here; GUI is limiting', priority: 'medium' },
      { item: 'HTTP/REST basics', why: 'Most JS talks to APIs', priority: 'medium' },
      { item: 'Testing (Jest/Vitest)', why: 'Catch bugs before users', priority: 'medium' },
    ],
    python: [
      { item: 'Virtual Environments', why: 'Avoid dependency chaos', priority: 'high' },
      { item: 'pip/Package Management', why: 'Reuse code, don\'t reinvent', priority: 'high' },
      { item: 'Testing (pytest)', why: 'Confidence in your code', priority: 'medium' },
      { item: 'Data structures', why: 'Makes you 10x faster', priority: 'medium' },
      { item: 'Git', why: 'Track changes, experiment safely', priority: 'medium' },
    ],
    coding: [
      { item: 'Debugging skills', why: 'Faster than trial-and-error', priority: 'high' },
      { item: 'Reading error messages', why: 'They tell you what\'s wrong', priority: 'high' },
      { item: 'Version control (Git)', why: 'Never lose code again', priority: 'high' },
      { item: 'REPL/Terminal', why: 'Quick experiments beat thinking', priority: 'medium' },
      { item: 'Small projects', why: 'Learn by building, not reading', priority: 'high' },
    ],
    productivity: [
      { item: 'Time blocking', why: 'Beats todo lists', priority: 'high' },
      { item: 'The two-minute rule', why: 'Small wins compound', priority: 'medium' },
      { item: 'Automation', why: 'One hour setup saves 40 hours/year', priority: 'high' },
      { item: 'Focus/Deep work', why: 'Context switching kills productivity', priority: 'high' },
    ],
  };

  const topicLower = topic.toLowerCase();
  for (const [key, items] of Object.entries(suggestions)) {
    if (topicLower.includes(key)) {
      return {
        suggestionsFor: topic,
        relatedTopics: items.filter((s) => {
          if (expertise === 'beginner') return s.priority !== 'advanced';
          return true;
        }),
      };
    }
  }

  return { suggestionsFor: topic, relatedTopics: [] };
}

/**
 * Identify common mistakes/patterns for a topic
 * "I'm starting to code" → Watch for: scope creep, premature optimization, no testing
 */
export function warnCommonMistakes(topic) {
  const mistakes = {
    coding: [
      '🚨 Premature optimization - make it work first, optimize later',
      '🚨 Scope creep - every project grows; define the MVP first',
      '🚨 No version control - save early, save often',
      '🚨 Copying code without understanding - you\'ll break it when requirements change',
      '🚨 Not testing - bugs compound; test early',
    ],
    learning: [
      '🚨 Tutorial hell - stop watching, start building',
      '🚨 Passive reading - actually code along, don\'t just watch',
      '🚨 Jumping topics - depth beats breadth when starting',
      '🚨 Ignoring fundamentals - shortcuts fail when things get complex',
      '🚨 Learning without a project - you\'ll forget everything',
    ],
    career: [
      '🚨 Negotiating salary solo - salary + benefits negotiation matters',
      '🚨 Staying in bad situations too long - 3 years for growth, then move',
      '🚨 Not building a portfolio - employers care more about what you\'ve built than degrees',
      '🚨 Networking only when job hunting - build relationships continuously',
      '🚨 Ignoring soft skills - communication beats technical brilliance',
    ],
    business: [
      '🚨 Perfectionism before launch - 80% done beats 100% never shipped',
      '🚨 Building without feedback - show users early, iterate fast',
      '🚨 Focusing on features nobody asked for - talk to customers',
      '🚨 Underpricing - low price signals low quality, not generosity',
      '🚨 Growing too fast - sustainable beats hockey-stick that crashes',
    ],
  };

  const topicLower = topic.toLowerCase();
  for (const [key, warns] of Object.entries(mistakes)) {
    if (topicLower.includes(key)) {
      return {
        topic,
        warnings: warns,
        mindset: '💡 Think: What could go wrong here? Plan for it.',
      };
    }
  }

  return { topic, warnings: [] };
}

/**
 * Generate common-sense response enhancement
 * Adds lateral thinking, warnings, alternatives to standard answer
 */
export function enhanceWithCommonSense(question, standardAnswer) {
  const dilemma = detectFalseDilemma(question);
  const premise = questionPremise(question);
  const handbrake = findHandbrake(question);
  const mistakes = warnCommonMistakes(question);

  const enhancement = {
    originalAnswer: standardAnswer,
    thinkingProcess: [],
  };

  if (dilemma.isFalseDilemma) {
    enhancement.thinkingProcess.push({
      type: 'false_dilemma_detected',
      insight: `This looks like a false ${dilemma.type}. There might be more options than you see.`,
      priority: 'high',
    });
  }

  if (premise.questionedAssumption) {
    enhancement.thinkingProcess.push({
      type: 'assumption_questioned',
      assumption: premise.assumption,
      reframe: premise.reframe,
      priority: 'high',
    });
  }

  if (handbrake.hasHandbrake) {
    enhancement.thinkingProcess.push({
      type: 'lateral_solutions',
      solutions: handbrake.solutions.slice(0, 2), // Top 2
      priority: 'high',
    });
  }

  if (mistakes.warnings.length > 0) {
    enhancement.thinkingProcess.push({
      type: 'common_mistakes',
      warnings: mistakes.warnings.slice(0, 2),
      priority: 'medium',
    });
  }

  return enhancement;
}

/**
 * Format common sense insights for user
 */
export function formatCommonSenseInsight(enhancement) {
  if (enhancement.thinkingProcess.length === 0) {
    return null;
  }

  let insight = '\n\n💭 **Let me think about this differently:**\n\n';

  for (const thought of enhancement.thinkingProcess) {
    if (thought.priority === 'high') {
      if (thought.type === 'false_dilemma_detected') {
        insight += `🔄 **Wait** - ${thought.insight}\n`;
      } else if (thought.type === 'assumption_questioned') {
        insight += `❓ **Actually** - ${thought.assumption}\n`;
        insight += `💡 **Try this instead** - ${thought.reframe}\n`;
      } else if (thought.type === 'lateral_solutions') {
        insight += `🎯 **Other options:**\n`;
        for (const sol of thought.solutions) {
          insight += `   • ${sol.idea}\n`;
        }
      }
    }
  }

  return insight;
}

export default {
  detectFalseDilemma,
  questionPremise,
  findHandbrake,
  suggestAdjacent,
  warnCommonMistakes,
  enhanceWithCommonSense,
  formatCommonSenseInsight,
};
