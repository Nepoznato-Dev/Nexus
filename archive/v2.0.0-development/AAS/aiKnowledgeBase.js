/**
 * AI Knowledge Base & Response Generator
 * Personality-driven response generation with safe patterns
 */

// Knowledge categories with response patterns
const knowledgeBase = {
  studyTips: {
    summarize: "Break the text into key sections. For each section: identify the main idea, then list 2-3 supporting details. Practice rewriting it without looking at the original.",
    activeRecall: "After learning something, close the book/notes and try to explain it from memory. Test yourself regularly—it's more effective than re-reading.",
    spacedRepetition: "Review material at increasing intervals: review after 1 day, 3 days, 1 week, 2 weeks, 1 month. Spaced repetition strengthens long-term memory.",
    pomodoro: "Work in 25-minute focused blocks, then take a 5-minute break. After 4 blocks, take a longer 15-30 min break. It keeps you fresh and prevents burnout.",
    notetaking: "Use the Cornell Method: divide your page into notes (right), cues (left), and summary (bottom). This structure makes review and recall easier."
  },
  writingHelp: {
    brainstorm: "Start with your main idea. Spend 5 minutes writing anything related—don't judge. Then group ideas into themes. Pick the strongest themes to expand.",
    outline: "Main idea → 3 key points → 2-3 details per point. This skeleton makes writing faster and keeps you on track.",
    tightening: "Remove unnecessary words: 'very unique' → 'unique', 'in order to' → 'to'. Replace weak verbs: 'is going to' → 'will'. Cut sentences that repeat.",
    tone: "Formal: complete sentences, no contractions, technical words. Casual: contractions okay, personal anecdotes, conversational. Pick one and stick with it.",
    grammarQuick: "Common issues: their/there/they're, its/it's, affect/effect, then/than. Use spell-check, read aloud, ask a friend to review."
  },
  mathBasics: {
    fractions: "To add/subtract: find common denominator. To multiply: multiply numerators, multiply denominators. To divide: flip the second fraction and multiply.",
    percentages: "Percent means 'per 100'. To find 20% of 50: (20/100) × 50 = 10. To find what percent: (part/whole) × 100.",
    unitConversion: "Identify start and end units. Set up a fraction with cancel-out units. Multiply across. Example: 5 km to meters: 5 km × (1000 m / 1 km) = 5000 m.",
    linearEquations: "Goal: isolate x. Whatever you do to one side, do to the other. Example: 2x + 3 = 7 → 2x = 4 → x = 2.",
    orderOfOps: "PEMDAS: Parentheses, Exponents, Multiplication/Division (left to right), Addition/Subtraction (left to right)."
  },
  codingBasics: {
    loops: "Loops repeat code. 'For' loops run a set number of times. 'While' loops run until a condition is false. Use loops to avoid repeating the same code.",
    conditionals: "If/else lets code make decisions. If condition is true, run this code; else, run that code. Useful for checking input or state.",
    functions: "Reusable blocks of code. Define once, call many times. Parameters are inputs, return values are outputs. Keeps code clean and DRY.",
    debugging: "Add print statements to see what's happening. Check error messages—they tell you the line and problem. Use a debugger if available. Test small sections first.",
    readingErrors: "Error messages have: file, line number, type (SyntaxError, TypeError), and description. Read them carefully—they usually point to the real issue."
  },
  nexusFeatures: {
    stealth: "Use Boss Key (press the hotkey) to hide the app. Enable Tab Disguise in Settings to show a fake tab name. Use Decoy Screen for quick cover.",
    performance: "Enable Performance Mode in Settings to reduce animations and lighten the load. Check FPS/CPU overlay to see how hard your device is working.",
    widgets: "Widgets float on your page. Move them, resize them, close them with the X. You can customize which ones show on your dashboard.",
    privacy: "Nexus stores everything locally on your device. No data leaves your browser unless you explicitly enable sync. Check Privacy page for full details.",
    notifications: "Enable notifications in Settings. You can set quiet hours so alerts don't distract you during study time."
  },
  boundaries: {
    harmful: "I can't help with anything illegal or harmful. That includes cheating on exams, hacking, or hurting yourself or others.",
    medical: "For health concerns, see a doctor or nurse. I can explain general concepts, but I'm not qualified to diagnose or prescribe.",
    financial: "For money questions (loans, investing, taxes), talk to a financial advisor. I can explain basics, but not give personal advice.",
    legal: "For legal issues, consult a lawyer. I can explain general concepts, but laws vary by location and situation.",
    offTopic: "I'm best with studying, writing, coding, and Nexus features. For other topics, I might not be much help—feel free to ask though!"
  }
};

/**
 * Generate a response based on user message, personality, and knowledge base
 * @param {string} userMessage - User's input
 * @param {object} personality - { professionalism: 0-1, mentorship: 0-1 }
 * @returns {string} AI response
 */
export function generateResponse(userMessage, personality = { professionalism: 0.5, mentorship: 0.5 }) {
  const lower = userMessage.toLowerCase();
  
  // Route to appropriate knowledge category
  if (matchesKeywords(lower, ['summarize', 'summary', 'tldr', 'shorten'])) {
    return buildResponse(
      knowledgeBase.studyTips.summarize,
      `Got it. Here's how to summarize effectively:`,
      personality
    );
  }
  
  if (matchesKeywords(lower, ['active recall', 'remember', 'memorize', 'retention'])) {
    return buildResponse(
      knowledgeBase.studyTips.activeRecall,
      `Active recall is a game-changer. Here's the idea:`,
      personality
    );
  }
  
  if (matchesKeywords(lower, ['spaced repetition', 'review', 'long term'])) {
    return buildResponse(
      knowledgeBase.studyTips.spacedRepetition,
      'Spaced repetition is one of the best study techniques:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['pomodoro', 'breaks', 'focus', 'timer', 'procrastinat'])) {
    return buildResponse(
      knowledgeBase.studyTips.pomodoro,
      'The Pomodoro Technique is simple but powerful:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['notes', 'note-taking', 'cornell'])) {
    return buildResponse(
      knowledgeBase.studyTips.notetaking,
      'Good note-taking sets you up for success. Try this:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['brainstorm', 'ideas', 'stuck', 'writers block'])) {
    return buildResponse(
      knowledgeBase.writingHelp.brainstorm,
      "Brainstorming helps you get unstuck. Here's a quick method:",
      personality
    );
  }
  
  if (matchesKeywords(lower, ['outline', 'structure', 'organize', 'essay'])) {
    return buildResponse(
      knowledgeBase.writingHelp.outline,
      'A good outline is half the battle. Try this structure:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['tight', 'concise', 'verbose', 'wordy', 'trim'])) {
    return buildResponse(
      knowledgeBase.writingHelp.tightening,
      'Tight writing is more powerful. Here's how to trim the fat:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['tone', 'formal', 'casual', 'voice', 'style'])) {
    return buildResponse(
      knowledgeBase.writingHelp.tone,
      'Tone sets the whole vibe. Pick one and stay consistent:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['grammar', 'their', 'there', 'affect', 'effect', 'punctuation'])) {
    return buildResponse(
      knowledgeBase.writingHelp.grammarQuick,
      'Here are some common grammar gotchas:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['fraction', 'divide', 'multiply'])) {
    return buildResponse(
      knowledgeBase.mathBasics.fractions,
      'Fractions are easier than they look. Here's the deal:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['percent', '%', 'discount'])) {
    return buildResponse(
      knowledgeBase.mathBasics.percentages,
      'Percentages are just fractions out of 100. Here's how:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['unit', 'convert', 'kilometer', 'miles', 'meters'])) {
    return buildResponse(
      knowledgeBase.mathBasics.unitConversion,
      'Unit conversion is a recipe. Follow the steps:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['equation', 'solve', 'linear', 'algebra'])) {
    return buildResponse(
      knowledgeBase.mathBasics.linearEquations,
      'Linear equations follow a simple rule: keep it balanced:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['pemdas', 'order of operations'])) {
    return buildResponse(
      knowledgeBase.mathBasics.orderOfOps,
      'Order matters in math. Remember PEMDAS:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['loop', 'for', 'while', 'repeat', 'iteration'])) {
    return buildResponse(
      knowledgeBase.codingBasics.loops,
      'Loops let you repeat code without typing it twice:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['if', 'else', 'conditional', 'decision'])) {
    return buildResponse(
      knowledgeBase.codingBasics.conditionals,
      'If/else statements let your code make choices:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['function', 'method', 'reusable'])) {
    return buildResponse(
      knowledgeBase.codingBasics.functions,
      'Functions are the building blocks of clean code:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['debug', 'error', 'fix', 'bug', 'problem'])) {
    return buildResponse(
      knowledgeBase.codingBasics.debugging,
      'Debugging is a skill. Here's a solid approach:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['error', 'message', 'exception', 'crash'])) {
    return buildResponse(
      knowledgeBase.codingBasics.readingErrors,
      'Error messages are your friend—they tell you what's wrong:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['boss', 'stealth', 'disguise', 'hide', 'panic'])) {
    return buildResponse(
      knowledgeBase.nexusFeatures.stealth,
      'Nexus has solid stealth features. Here's what you can do:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['performance', 'slow', 'lag', 'fps', 'cpu'])) {
    return buildResponse(
      knowledgeBase.nexusFeatures.performance,
      'If Nexus is running slow, try Performance Mode:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['widget', 'customize', 'dashboard', 'move'])) {
    return buildResponse(
      knowledgeBase.nexusFeatures.widgets,
      'Widgets are flexible. You can move and resize them:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['privacy', 'data', 'local', 'safe', 'secure'])) {
    return buildResponse(
      knowledgeBase.nexusFeatures.privacy,
      'Privacy is built into Nexus from the ground up:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['notif', 'alert', 'quiet hours'])) {
    return buildResponse(
      knowledgeBase.nexusFeatures.notifications,
      'Notifications keep you in the loop without distracting you:',
      personality
    );
  }
  
  if (matchesKeywords(lower, ['illegal', 'hack', 'cheat', 'exam', 'harm', 'hurt'])) {
    return buildResponse(
      knowledgeBase.boundaries.harmful,
      'I can't help with that.',
      personality,
      true
    );
  }
  
  if (matchesKeywords(lower, ['doctor', 'sick', 'health', 'medicine', 'medical'])) {
    return buildResponse(
      knowledgeBase.boundaries.medical,
      "I'm not a doctor. For health questions, see a professional.",
      personality,
      true
    );
  }
  
  if (matchesKeywords(lower, ['money', 'invest', 'loan', 'tax', 'financial'])) {
    return buildResponse(
      knowledgeBase.boundaries.financial,
      'For money questions, talk to a financial advisor.',
      personality,
      true
    );
  }
  
  if (matchesKeywords(lower, ['lawyer', 'legal', 'court', 'law'])) {
    return buildResponse(
      knowledgeBase.boundaries.legal,
      'For legal questions, consult a lawyer.',
      personality,
      true
    );
  }
  
  // Default fallback
  return buildResponse(
    "I'm best with studying, writing, coding, and Nexus features. Feel free to ask about those!",
    "Hmm, that's not really my specialty.",
    personality
  );
}

/**
 * Check if user message matches keywords
 */
function matchesKeywords(message, keywords) {
  return keywords.some(keyword => message.includes(keyword.toLowerCase()));
}

/**
 * Build a response with personality-aware formatting
 * Professionalism 0–1: professional intros vs moody intros
 * Mentorship > 0.6: adds "Want me to walk you through an example?"
 * Professionalism < 0.3: may add kaomoji ¯\_(ツ)_/¯, (´｀)
 */
function buildResponse(content, intro, personality, isBoundary = false) {
  const { professionalism = 0.5, mentorship = 0.5 } = personality;
  const prof = typeof professionalism === 'number' ? professionalism : 0.5;
  const ment = typeof mentorship === 'number' ? mentorship : 0.5;

  let response;

  if (isBoundary) {
    response = intro;
  } else if (prof > 0.7) {
    const proIntros = [
      'Consider the following:',
      "Here's a systematic approach:",
      "Let me break this down:",
      "Here's what the research shows:",
    ];
    response = proIntros[Math.floor(Math.random() * proIntros.length)];
  } else if (prof < 0.3) {
    const moodyIntros = [
      "Yeah, so here's the thing:",
      "Real talk:",
      "Alright, check it out:",
      "So basically:",
    ];
    response = moodyIntros[Math.floor(Math.random() * moodyIntros.length)];
  } else {
    response = intro;
  }

  response += '\n\n' + content;

  if (ment > 0.6 && !isBoundary) {
    const followUps = [
      "\n\nWant me to walk you through an example?",
      "\n\nNeed help applying this to your specific situation?",
      "\n\nAny part of that unclear?",
    ];
    response += followUps[Math.floor(Math.random() * followUps.length)];
  }

  if (prof < 0.3 && !isBoundary && Math.random() > 0.5) {
    const kaomojis = ['¯\\_(ツ)_/¯', '(´｀)', '( ´∀`)', '(๑•́ ω •̀๑)'];
    response += ' ' + kaomojis[Math.floor(Math.random() * kaomojis.length)];
  }

  return response;
}

/**
 * Auto-adaptation engine: analyze user message for style signals.
 * Only applies when personality unlocked. Clamps deltas to ±0.2 per message.
 * Professionalism: +0.1 punct/caps, -0.1 slang/emojis, -0.05 very short.
 * Mentorship: +0.15 how/why/explain, +0.1 multi-part, -0.1 one-word.
 */
export function analyzeUserPersonality(userMessage) {
  const lower = userMessage.toLowerCase();
  const trimmed = userMessage.trim();
  
  let professionalismDelta = 0;
  let mentorshipDelta = 0;
  
  // Professionalism signals
  const hasProperPunctuation = /[.!?]$/.test(trimmed);
  const hasCapitals = trimmed.length > 0 && trimmed[0] === trimmed[0].toUpperCase();
  const hasSlang = /\b(gonna|wanna|gotta|y'all|u\b|ur\b|lol|brb|idk|imo|tbh)\b/i.test(lower);
  const hasEmoji = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(userMessage);
  const isVeryShort = trimmed.length < 15;
  
  // Adjust professionalism
  if (hasProperPunctuation && hasCapitals) professionalismDelta += 0.1;
  if (hasSlang || hasEmoji) professionalismDelta -= 0.1;
  if (isVeryShort) professionalismDelta -= 0.05; // Casual tends to be terse
  
  // Mentorship signals
  const asksHow = /\bhow\b/i.test(lower);
  const asksWhy = /\bwhy\b/i.test(lower);
  const hasMultipleParts = (lower.match(/[,?]/g) || []).length > 1;
  const asksToExplain = /\bexplain|teach|show me\b/i.test(lower);
  const isOneWordQuery = trimmed.split(/\s+/).filter(Boolean).length === 1;
  
  // Adjust mentorship
  if (asksHow || asksWhy || asksToExplain) mentorshipDelta += 0.15;
  if (hasMultipleParts) mentorshipDelta += 0.1;
  if (isOneWordQuery) mentorshipDelta -= 0.1; // "help" vs "can you help me understand..."
  
  return {
    professionalismDelta: Math.max(-0.2, Math.min(0.2, professionalismDelta)),
    mentorshipDelta: Math.max(-0.2, Math.min(0.2, mentorshipDelta))
  };

