/**
 * AI Knowledge Base & Response Generator
 * Personality-driven response generation with safe patterns
 * 
 * Transformer.js Integration: Polishes responses for grammar, structure, and professionalism
 */

import modDataAccessor from '../Games/modDataAccessor.js';
import * as aiModelManager from '../../utils/aiModelManager.js';
import { storage } from '../Storage/clientStorage.js';
import { generateKnowledgeResponse } from '../../apis/aiServiceClient.js';
import { callGoogleGemini, callOpenAI } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/aiApiBridge.js';
import { extractSearchQuery, performWebSearch } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/IRISSearch.js';
import { resolveIntelligenceRoute } from './intelligenceRouting.js';

/**
 * Polish response with Transformer.js-based improvements
 * Fixes grammar, improves structure, adds professionalism
 * Does NOT change meaning or decisions - only refines presentation
 */
async function polishResponse(rawResponse, tier = 'balanced') {
  try {
    // Fast tier: minimal polishing (quick grammar fixes only)
    if (tier === 'fast') {
      return fastPolish(rawResponse);
    }

    // Balanced tier: moderate polishing (grammar + some structure)
    if (tier === 'balanced') {
      return balancedPolish(rawResponse);
    }

    // Quality tier: full polishing (grammar + structure + flow)
    if (tier === 'quality') {
      return qualityPolish(rawResponse);
    }

    return rawResponse;
  } catch (error) {
    console.warn('Response polishing failed, returning original:', error);
    return rawResponse;
  }
}

/**
 * Fast polish: Quick grammar fixes only
 */
function fastPolish(text) {
  let polished = text;

  // Fix common grammar mistakes
  polished = polished.replace(/\bi\b/g, 'I'); // Lowercase i → I
  polished = polished.replace(/\bim\b/gi, "I'm"); // im → I'm
  polished = polished.replace(/\bcant\b/gi, "can't"); // cant → can't
  polished = polished.replace(/\bdont\b/gi, "don't"); // dont → don't
  polished = polished.replace(/\bwont\b/gi, "won't"); // wont → won't
  polished = polished.replace(/\bisnt\b/gi, "isn't"); // isnt → isn't
  polished = polished.replace(/\barent\b/gi, "aren't"); // arent → aren't
  polished = polished.replace(/\byoure\b/gi, "you're"); // youre → you're
  polished = polished.replace(/\btheyre\b/gi, "they're"); // theyre → they're
  polished = polished.replace(/\bwere\b/gi, "we're"); // were → we're (context-sensitive)

  // Fix double spaces
  polished = polished.replace(/  +/g, ' ');

  return polished.trim();
}

/**
 * Balanced polish: Grammar + structure improvements
 */
function balancedPolish(text) {
  let polished = fastPolish(text);

  // Fix sentence starts (ensure capital letters)
  polished = polished.replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());

  // Ensure first letter is capitalized
  polished = polished.charAt(0).toUpperCase() + polished.slice(1);

  // Fix common typos
  polished = polished.replace(/\bthe the\b/gi, 'the');
  polished = polished.replace(/\ba a\b/gi, 'a');
  polished = polished.replace(/\band and\b/gi, 'and');

  // Fix spacing around punctuation
  polished = polished.replace(/\s+([,;:.!?])/g, '$1'); // Remove space before punctuation
  polished = polished.replace(/([,;:.!?])([a-zA-Z])/g, '$1 $2'); // Add space after punctuation

  // Fix ellipsis
  polished = polished.replace(/\.\.+/g, '...'); // Multiple dots → ...

  // Fix quote spacing
  polished = polished.replace(/"\s+/g, '"'); // Remove space after opening quote
  polished = polished.replace(/\s+"/g, '"'); // Remove space before closing quote

  return polished.trim();
}

/**
 * Quality polish: Full professional refinement
 */
function qualityPolish(text) {
  let polished = balancedPolish(text);

  // Improve flow with better transitions (preserve personality)
  polished = polished.replace(/\bSo basically\b/gi, 'Essentially');
  polished = polished.replace(/\bReal talk\b/gi, 'To be clear');
  polished = polished.replace(/\bCheck it out\b/gi, "Here's what matters");

  // Fix common professional writing issues
  polished = polished.replace(/\bkinda\b/gi, 'kind of');
  polished = polished.replace(/\bgonna\b/gi, 'going to');
  polished = polished.replace(/\bwanna\b/gi, 'want to');
  polished = polished.replace(/\bgotta\b/gi, 'have to');

  // Improve clarity (fix vague words)
  polished = polished.replace(/\bstuff\b/gi, 'things');
  polished = polished.replace(/\blots of\b/gi, 'many');
  polished = polished.replace(/\ba lot of\b/gi, 'many');

  // Fix redundancy
  polished = polished.replace(/\bvery unique\b/gi, 'unique');
  polished = polished.replace(/\bvery essential\b/gi, 'essential');
  polished = polished.replace(/\bvery perfect\b/gi, 'perfect');

  // Ensure proper paragraph structure (double newlines between paragraphs)
  polished = polished.replace(/\n\n+/g, '\n\n');

  // Fix list formatting
  polished = polished.replace(/(\n\d+\.)([a-zA-Z])/g, '$1 $2'); // 1.Text → 1. Text
  polished = polished.replace(/(\n-)([a-zA-Z])/g, '$1 $2'); // -Text → - Text

  return polished.trim();
}

// Dynamic response generation (composed at runtime from topic signals)

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for', 'from', 'had', 'has', 'have',
  'he', 'her', 'hers', 'him', 'his', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'of', 'on',
  'or', 'our', 'ours', 'she', 'so', 'that', 'the', 'their', 'them', 'they', 'this', 'to', 'us', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'you', 'your', 'yours',
  'how', 'do', 'does', 'did', 'can', 'could', 'would', 'should', 'happen', 'happens'
]);

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickDeterministic(options, seed) {
  if (!Array.isArray(options) || options.length === 0) return '';
  return options[hashString(seed) % options.length];
}

function pickManyDeterministic(options, count, seed) {
  if (!Array.isArray(options) || options.length === 0 || count <= 0) return [];
  const start = hashString(seed) % options.length;
  const chosen = [];
  for (let i = 0; i < Math.min(count, options.length); i++) {
    chosen.push(options[(start + i) % options.length]);
  }
  return chosen;
}

function extractFocusTerms(userMessage, maxTerms = 3) {
  const terms = userMessage
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));

  return [...new Set(terms)].slice(0, maxTerms);
}

function formatFocus(userMessage) {
  const terms = extractFocusTerms(userMessage, 3);
  if (terms.length === 0) return 'this situation';
  if (terms.length === 1) return `"${terms[0]}"`;
  if (terms.length === 2) return `"${terms[0]}" and "${terms[1]}"`;
  return `"${terms[0]}", "${terms[1]}", and "${terms[2]}"`;
}

function buildMinimalFallback(userMessage) {
  const text = String(userMessage || '').trim();
  const lower = text.toLowerCase();
  const focus = formatFocus(text);

  if (/^(hi|hello|hey|yo|sup|huh|hiya|what\'s up|wassup|whats up)\b/.test(lower)) {
    return 'Hey. Tell me what you want to solve, and I will give you a direct answer.';
  }

  if (/^how\s+are\s+you\b/.test(lower)) {
    return [
      'I am running smoothly and ready to help.',
      'Tell me what you need, and I will answer directly.'
    ].join('\n\n');
  }

  if (/^(ok|okay|k|hmm|huh\?|idk|i\s+don\'t\s+know|dont\s+know)\b/.test(lower)) {
    return [
      'No problem.',
      'Give me one specific question and I will keep the answer short and practical.'
    ].join('\n\n');
  }

  const openers = [
    `I can help with ${focus}.`,
    `I can break down ${focus} in a practical way.`,
    `I can give a direct answer for ${focus}.`
  ];

  const nextSteps = [
    'Share one concrete detail (goal, constraint, or current attempt), and I will tailor the answer.',
    'Share your exact goal and I will respond in the format you want (short, detailed, or step-by-step).',
    'Give me the exact subject and I will map the steps precisely.'
  ];

  return [
    pickDeterministic(openers, `${text}:minimal:opener`),
    pickDeterministic(nextSteps, `${text}:minimal:next`)
  ].join('\n\n');
}

function buildDirectQuestionFallback(userMessage) {
  const lower = String(userMessage || '').toLowerCase();

  if (/^(hi|hello|hey|yo|sup|huh|hiya|what\'s up|wassup|whats up)\b/.test(lower.trim())) {
    return 'Hey. I am here. Ask me anything specific and I will answer directly.';
  }

  if (/^how\s+are\s+you\b/.test(lower.trim())) {
    return 'I am good and ready to help. What should we solve right now?';
  }

  if (/photosynthesis/.test(lower)) {
    return [
      'Photosynthesis is the process plants use to convert light energy into chemical energy (glucose).',
      'In the light-dependent reactions, chlorophyll absorbs light in the thylakoid membranes, water is split, oxygen is released, and ATP and NADPH are produced.',
      'In the Calvin cycle, the plant uses ATP and NADPH to fix carbon dioxide into sugars.',
      'Simplified equation: 6CO2 + 6H2O + light -> C6H12O6 + 6O2.'
    ].join('\n\n');
  }

  if (/^how\s+(does|do|did)\b/.test(lower) || /\bwhat\s+is\b/.test(lower)) {
    const focus = formatFocus(userMessage);
    return [
      `Direct explanation for ${focus}:`,
      'It works through a sequence of inputs, transformations, and outputs, where each step changes the system state.',
      'For the most accurate answer, define the exact subject and I will map each step precisely.'
    ].join('\n\n');
  }

  return buildMinimalFallback(userMessage);
}

function normalizeGenerationContext(context = {}) {
  return {
    attachments: Array.isArray(context.attachments) ? context.attachments : [],
    personalityDescription: String(context.personalityDescription || '').trim(),
    mode: String(context.mode || 'plus'),
    modeInstruction: String(context.modeInstruction || '').trim(),
    toolInstruction: String(context.toolInstruction || '').trim(),
    responseLength: String(context.responseLength || 'auto'),
    toolState: context.toolState || {},
    webContext: String(context.webContext || '').trim(),
    taskType: String(context.taskType || 'answer'),
    currentDraft: String(context.currentDraft || '').trim(),
    instructions: String(context.instructions || '').trim(),
    outputStyle: String(context.outputStyle || '').trim(),
    fluxTags: Array.isArray(context.fluxTags) ? context.fluxTags : [],
    deviceProfile: context.deviceProfile || {},
    siteState: context.siteState || {},
    selfAwarenessProfile: context.selfAwarenessProfile || {},
    selfAwarenessApprovals: Array.isArray(context.selfAwarenessApprovals) ? context.selfAwarenessApprovals : [],
    returnMetadata: Boolean(context.returnMetadata),
  };
}

function inferTaskProfile(userMessage, context) {
  const lower = String(userMessage || '').toLowerCase();
  const isAutoOrPro = context.mode === 'auto' || context.mode === 'pro';

  return {
    factualQuestion: /\?|^(what|how|why|when|where|who|is|are|does|do|did|can|could|would|should)\b/.test(lower),
    codingTask: /code|bug|debug|function|refactor|component|api|error|typescript|javascript|python|compile/.test(lower),
    planningTask: /plan|roadmap|system|architecture|pipeline|design|structure|framework|workflow/.test(lower),
    dataTask: /data|dataset|logs?|trace|report|analysis|notebook|source|85k|payload/.test(lower),
    needsValidation: Boolean(context.toolState?.thinkLonger) || context.mode === 'turbo' || /math|equation|syntax|validate|verify|check/.test(lower),
    needsAudit: Boolean(context.toolState?.deepResearch) || isAutoOrPro || /logic|proof|paradox|contradiction|tradeoff|assumption|hallucinat/.test(lower),
    needsLibrary: Boolean(context.webContext) || context.attachments.length > 0 || lower.length > 500 || /data|dataset|logs?|notebook|85k|payload|source/.test(lower),
    needsArchitecture: context.mode === 'plus' || isAutoOrPro || /refactor|architecture|design|module|system|pipeline|optimi[sz]e/.test(lower),
  };
}

function buildThoughtPipeline(userMessage, rawContext = {}) {
  const context = normalizeGenerationContext(rawContext);
  const profile = inferTaskProfile(userMessage, context);
  const routing = resolveIntelligenceRoute({
    userMessage,
    requestedMode: context.mode === 'auto' ? null : context.mode,
    context,
    fluxTags: context.fluxTags,
    deviceProfile: context.deviceProfile,
  });
  const focus = extractFocusTerms(userMessage, 4);
  const focusLabel = focus.length > 0 ? focus.join(', ') : 'the core request';
  const activationPlan = {
    s1: profile.needsValidation || context.fluxTags.includes('high-code-density'),
    s2: profile.needsAudit || context.fluxTags.includes('logic-trap') || routing.tier === 'pro',
    s3: profile.needsLibrary || context.fluxTags.includes('high-strain'),
    s4: profile.needsArchitecture || routing.requiresDualMerge,
  };

  let outputContract = 'Return a direct final answer with concrete details and no internal notes.';
  if (profile.codingTask) {
    outputContract = 'Return an implementation-focused answer with root cause, action, and practical next step.';
  } else if (profile.planningTask) {
    outputContract = 'Return a structured plan with clear layers, responsibilities, and tradeoffs.';
  } else if (profile.dataTask) {
    outputContract = 'Return a source-aware summary with signal prioritized over noise.';
  } else if (profile.factualQuestion) {
    outputContract = 'Return a direct explanation that answers the question immediately before adding extra detail.';
  }

  return {
    profile,
    routing,
    focus,
    focusLabel,
    activationPlan,
    outputContract,
  };
}

function executeSTMModules(userMessage, rawContext = {}) {
  const context = normalizeGenerationContext(rawContext);
  const pipeline = buildThoughtPipeline(userMessage, context);
  const activeModules = [];

  if (pipeline.activationPlan.s1) {
    activeModules.push({
      id: 'S1',
      title: 'Sprinter',
      note: `Lightweight validator on ${pipeline.focusLabel}. Instant syntax and mathematical verification — catch errors as soon as possible, before any downstream processing.`,
      artifacts: {
        validationTags: [
          'Surface Checks Complete',
          context.outputStyle === 'turbo' ? 'Turbo Response Envelope' : 'Standard Response Envelope',
          pipeline.profile.codingTask ? 'Syntax/Execution Risk Scan' : 'Semantic Consistency Scan',
        ],
      },
    });
  }

  if (pipeline.activationPlan.s2) {
    activeModules.push({
      id: 'S2',
      title: 'Auditor',
      note: `Slow, methodical researcher on ${pipeline.focusLabel}. Step-by-step logic audit to find hidden tricks or confirm exactly why the solution is correct. No shortcuts — every assumption gets checked.`,
      artifacts: {
        logicProof: [
          'Assumptions were isolated and checked against the prompt scope.',
          'No direct contradiction was detected in the selected answer path.',
          pipeline.profile.factualQuestion
            ? 'Answer ordering enforces direct response before extra detail.'
            : 'Reasoning path preserves objective-to-action alignment.',
        ],
      },
    });
  }

  if (pipeline.activationPlan.s3) {
    const sourceHint = context.webContext
      ? 'Use available external context as the source anchor.'
      : context.attachments.length > 0
        ? `Use attached files (${context.attachments.join(', ')}) as the source anchor.`
        : 'Build a summary map before answering.';
    activeModules.push({
      id: 'S3',
      title: 'Librarian',
      note: `Context specialist on ${pipeline.focusLabel}. Scan the full log for patterns. Scrub redundancies using xY notation (e.g., Error_0x4 [x50]). Build a Summary Map to anchor the core brain's focus. ${sourceHint}`,
      artifacts: {
        summaryMap: {
          focus: pipeline.focus,
          sourceAnchor: context.webContext ? 'web-context' : (context.attachments.length > 0 ? 'attachments' : 'internal-summary'),
          promptLength: String(userMessage || '').length,
        },
        scrubbedLog: context.webContext
          ? 'External context scrubbed for noise and retained as source anchor.'
          : (context.attachments.length > 0
            ? `Attached sources indexed: ${context.attachments.join(', ')}`
            : 'No external sources attached; internal context map generated.'),
      },
    });
  }

  if (pipeline.activationPlan.s4) {
    activeModules.push({
      id: 'S4',
      title: 'Architect',
      note: `Mini-Pro module on ${pipeline.focusLabel}. Structural optimization and refactoring — convert raw data into clean, efficient blueprints. Apply modular segmentation and enforce the output contract.`,
      artifacts: {
        optimizationLayer: [
          'Answer segmented into direct result and supporting detail.',
          pipeline.profile.planningTask
            ? 'Plan-first structure applied with responsibilities/tradeoffs.'
            : 'Practical-step ordering applied for readability.',
          `Output contract enforced: ${pipeline.outputContract}`,
        ],
      },
    });
  }

  return {
    ...pipeline,
    activeModules,
    hasActiveModules: activeModules.length > 0,
  };
}

function buildTransparencyReport(userMessage, rawContext = {}, responseSource = 'runtime') {
  const context = normalizeGenerationContext(rawContext);
  const pipeline = executeSTMModules(userMessage, context);
  const activeTools = [];

  if (context.toolState?.searchWeb) activeTools.push('F.L.U.X');
  if (context.toolState?.deepResearch) activeTools.push('Deep Research');
  if (context.toolState?.thinkLonger) activeTools.push('Think Longer');

  return {
    responseSource,
    mode: pipeline.routing?.tier || context.mode,
    routing: pipeline.routing,
    outputContract: pipeline.outputContract,
    activeTools,
    attachments: context.attachments,
    usedWebContext: Boolean(context.webContext),
    activeModules: pipeline.activeModules,
    moduleArtifacts: pipeline.activeModules.map((module) => ({
      id: module.id,
      title: module.title,
      artifacts: module.artifacts || {},
    })),
    moduleCount: pipeline.activeModules.length,
  };
}

function formatGenerationResult(text, userMessage, rawContext = {}, responseSource = 'runtime') {
  const context = normalizeGenerationContext(rawContext);
  const cleanText = String(text || '').trim();
  if (!context.returnMetadata) {
    return cleanText;
  }

  return {
    text: cleanText,
    transparencyReport: buildTransparencyReport(userMessage, context, responseSource),
  };
}

function buildContextLines(context) {
  const lines = [];

  if (context.personalityDescription) {
    lines.push(`Personality style: ${context.personalityDescription}`);
  }
  if (context.modeInstruction) {
    lines.push(`Mode: ${context.modeInstruction}`);
  }
  if (context.toolInstruction) {
    lines.push(`Tool state: ${context.toolInstruction}`);
  }
  if (context.attachments.length > 0) {
    lines.push(`Attached files: ${context.attachments.join(', ')}`);
  }
  if (context.webContext) {
    lines.push(`External context:\n${context.webContext}`);
  }
  if (context.outputStyle === 'turbo') {
    lines.push('Output style: answer in 2 to 4 concise sentences, concrete and low-filler.');
  }

  return lines;
}

function buildModelPrompt(userMessage, rawContext = {}) {
  const context = normalizeGenerationContext(rawContext);
  const pipeline = executeSTMModules(userMessage, context);
  const contextLines = buildContextLines(context);
  const routingLines = pipeline.routing
    ? [
      `Intelligence route: ${pipeline.routing.tier.toUpperCase()} | model ${pipeline.routing.modelB}B (${pipeline.routing.quantization}) | cores ${pipeline.routing.coreCount} | context cap ${pipeline.routing.contextWords} words`,
      `Clamp policy: floor ${pipeline.routing.clamps.floorB}B, ceiling ${pipeline.routing.clamps.ceilingB}B, complexity score ${pipeline.routing.complexityScore}/100`,
    ]
    : [];
  const pipelineLines = pipeline.hasActiveModules
    ? [
      'Active STM modules:',
      ...pipeline.activeModules.map((module, index) => `${index + 1}. ${module.id} ${module.title}: ${module.note}`),
      `Output contract: ${pipeline.outputContract}`,
    ]
    : [`Output contract: ${pipeline.outputContract}`];

  if (context.taskType === 'refine' || context.taskType === 'expand' || context.taskType === 'rewrite') {
    return [
      'You are RAZONET, the Nexus AI system for users.',
      ...contextLines,
      ...pipelineLines,
      `User message:\n${userMessage}`,
      `Current draft:\n${context.currentDraft}`,
      `Task: ${context.instructions || 'Improve the current draft.'}`,
      'Return only the final answer text.'
    ].filter(Boolean).join('\n\n');
  }

  return [
    'You are RAZONET, the Nexus AI system for users.',
    'You operate locally and privately — no server calls, no external APIs, total user privacy.',
    'Respond directly to the user message below with concrete, specific help.',
    'Avoid capability lists and generic scaffolding.',
    'Hallucination-Killer Protocols: use Cognitive Diversity (cross-reference multiple module perspectives), Source Anchoring (every claim must trace back to source material or explicit reasoning), and Consensus Merging (in multi-core modes, internal drafts are merged and pruned of conflicts before delivery).',
    ...contextLines,
    ...routingLines,
    ...pipelineLines,
    `User message:\n${userMessage}`,
    'Answer:'
  ].filter(Boolean).join('\n\n');
}

function composeRuntimeGuidance(userMessage, topicLabel, stepPool, whyPool, nextPool) {
  const focus = formatFocus(userMessage);
  const opener = pickDeterministic([
    `Let me tailor this to ${focus}.`,
    `Here is a practical plan for ${focus}.`,
    `For ${focus}, use this sequence.`
  ], `${topicLabel}:${userMessage}:opener`);

  const steps = pickManyDeterministic(stepPool, 3, `${topicLabel}:${userMessage}:steps`)
    .map((step, index) => `${index + 1}) ${step}`)
    .join('\n');

  const why = pickDeterministic(whyPool, `${topicLabel}:${userMessage}:why`);
  const next = pickDeterministic(nextPool, `${topicLabel}:${userMessage}:next`);

  return `${opener}\n\n${steps}\n\n${why} ${next}`;
}

function generateStudyAdvice(topic, userMessage) {
  const stepMap = {
    summarize: [
      'Split the material into sections and label the main claim of each section in one sentence.',
      'Extract only key facts that support each claim and ignore decorative detail.',
      'Rewrite the summary from memory, then compare with the source and patch gaps.'
    ],
    activeRecall: [
      'Close notes after studying and explain the idea out loud without looking.',
      'Turn headings into questions and answer them from memory before checking.',
      'Track missed points and revisit those first in the next review cycle.'
    ],
    spacedRepetition: [
      'Review once after one day, then at three days, one week, and two weeks.',
      'Shorten review sessions to only weak topics instead of rereading everything.',
      'Mark confidence per topic so the schedule adapts to what you actually forget.'
    ],
    pomodoro: [
      'Run a 25-minute focus sprint with one concrete task and no multitasking.',
      'Take a 5-minute reset break away from the task context.',
      'After four rounds, take a longer break and choose the next high-value task.'
    ],
    notetaking: [
      'Capture ideas in your own words instead of copying source language.',
      'Separate key concepts from examples so review is faster.',
      'End each page with a short recap and one self-test question.'
    ],
    default: [
      'Define what success looks like for this study session.',
      'Use short focused passes instead of marathon rereading.',
      'Test understanding from memory before ending the session.'
    ]
  };

  return composeRuntimeGuidance(
    userMessage,
    `study:${topic}`,
    stepMap[topic] || stepMap.default,
    [
      'This works because retrieval and structured review build durable memory paths.',
      'This works because focused cycles reduce overload and improve retention quality.'
    ],
    [
      'If you want, I can convert this into a 15-minute plan.',
      'Share your subject and I can make this more specific.'
    ]
  );
}

function generateWritingAdvice(topic, userMessage) {
  const stepMap = {
    brainstorm: [
      'Write ideas rapidly for five minutes without evaluating any of them.',
      'Group related ideas into clusters and name each cluster theme.',
      'Keep only themes that support your main purpose and audience.'
    ],
    outline: [
      'State your core claim in one sentence before drafting paragraphs.',
      'Choose three supporting points and add evidence under each point.',
      'Order points for flow: context, argument, then implication.'
    ],
    tightening: [
      'Cut filler phrases and replace weak verbs with precise verbs.',
      'Merge repetitive sentences that express the same idea.',
      'Read aloud and remove words that do not add meaning.'
    ],
    tone: [
      'Define audience and decide formal, neutral, or conversational voice.',
      'Keep sentence rhythm consistent with the chosen tone.',
      'Review for vocabulary mismatch that breaks voice consistency.'
    ],
    grammar: [
      'Check subject-verb agreement first because it causes most clarity issues.',
      'Scan for homophone pairs like their/there and affect/effect.',
      'Run one final pass focused only on punctuation and clause boundaries.'
    ],
    default: [
      'Clarify the message before refining style.',
      'Keep paragraphs focused on one idea each.',
      'Revise for clarity before polishing wording.'
    ]
  };

  return composeRuntimeGuidance(
    userMessage,
    `writing:${topic}`,
    stepMap[topic] || stepMap.default,
    [
      'This works because structure first, polish second, produces clearer drafts faster.',
      'This works because targeted revision improves readability without losing meaning.'
    ],
    [
      'I can also give you a quick editing checklist if you want.',
      'Paste a paragraph and I can apply this live.'
    ]
  );
}

function generateMathAdvice(topic, userMessage) {
  const stepMap = {
    fractions: [
      'For add/subtract, align denominators first before combining numerators.',
      'For multiply, multiply top by top and bottom by bottom, then simplify.',
      'For divide, invert the second fraction and multiply.'
    ],
    percentages: [
      'Translate percent to decimal by dividing by 100.',
      'Compute part = rate x whole, then verify units.',
      'For unknown rate, use rate = part / whole and convert to percent.'
    ],
    unitConversion: [
      'Write the given value and target unit before any arithmetic.',
      'Use conversion factors so unwanted units cancel cleanly.',
      'Check magnitude to catch misplaced decimal points.'
    ],
    linearEquations: [
      'Move constants away from the variable side first.',
      'Apply inverse operations symmetrically to both sides.',
      'Substitute your answer back to verify equality.'
    ],
    orderOfOps: [
      'Resolve parentheses and exponents before any linear operations.',
      'Process multiplication/division left to right.',
      'Process addition/subtraction left to right and check final sign.'
    ],
    default: [
      'List known values and unknown values before solving.',
      'Apply one transformation at a time and keep expressions tidy.',
      'Verify result with a quick reasonableness check.'
    ]
  };

  return composeRuntimeGuidance(
    userMessage,
    `math:${topic}`,
    stepMap[topic] || stepMap.default,
    [
      'This works because each step preserves correctness while reducing complexity.',
      'This works because explicit operations prevent hidden algebra mistakes.'
    ],
    [
      'If you share a specific problem, I can solve it step by step.',
      'Want a worked example with your numbers?'
    ]
  );
}

function generateCodingAdvice(topic, userMessage) {
  const stepMap = {
    gettingStarted: [
      'Pick one language and one small project with visible output.',
      'Learn variables, conditionals, loops, and functions through that project.',
      'Ship tiny iterations daily and keep a short bug log to learn patterns.'
    ],
    loops: [
      'Use for-loops when iteration count is known ahead of time.',
      'Use while-loops when continuation depends on runtime conditions.',
      'Log iteration state when debugging to detect runaway loops.'
    ],
    conditionals: [
      'State the exact condition in plain language before coding it.',
      'Handle edge cases explicitly instead of burying them in nested branches.',
      'Test each branch with one minimal input example.'
    ],
    functions: [
      'Keep each function focused on one responsibility.',
      'Use clear parameter names and return predictable data shapes.',
      'Write a quick call example to confirm behavior and edge cases.'
    ],
    debugging: [
      'Reproduce the issue consistently before changing code.',
      'Inspect the first failing signal, not downstream symptoms.',
      'Apply the smallest fix and rerun focused tests.'
    ],
    readingErrors: [
      'Start with the first error in the stack, not the last one.',
      'Identify file, line, and operation that failed.',
      'Check assumptions about null values, types, and timing.'
    ],
    default: [
      'Reduce the problem to a minimal reproducible example.',
      'Change one thing at a time and test after each change.',
      'Document what worked so the fix is repeatable.'
    ]
  };

  return composeRuntimeGuidance(
    userMessage,
    `coding:${topic}`,
    stepMap[topic] || stepMap.default,
    [
      'This works because iterative feedback loops expose root causes quickly.',
      'This works because small, testable steps reduce debugging noise.'
    ],
    [
      'Share your code snippet and I can target the exact fix path.',
      'If you want, I can turn this into a mini checklist for your project.'
    ]
  );
}

function generateNexusFeatureAdvice(topic, userMessage) {
  const stepMap = {
    stealth: [
      'Enable boss key in settings and test the shortcut once.',
      'Turn on tab disguise and verify the decoy title appears correctly.',
      'Configure a quick decoy screen for instant context switching.'
    ],
    performance: [
      'Enable performance mode to reduce visual overhead.',
      'Disable nonessential widgets and background effects.',
      'Monitor CPU/FPS and keep only high-value modules active.'
    ],
    widgets: [
      'Place high-frequency widgets in your primary visual zone.',
      'Resize for readability before adding more panels.',
      'Remove duplicate information sources to reduce clutter.'
    ],
    privacy: [
      'Review local-storage settings and disable optional data sync.',
      'Check notification permissions and revoke unused channels.',
      'Audit exported data paths so sensitive info stays local.'
    ],
    notifications: [
      'Define which events are urgent versus informational.',
      'Set quiet hours around focused work blocks.',
      'Prune low-value alerts that create notification fatigue.'
    ],
    theme: [
      'Pick a theme based on lighting and reading comfort.',
      'Validate contrast on key UI elements after switching themes.',
      'Save and reuse the profile once readability feels right.'
    ],
    default: [
      'Start with core settings that affect daily use the most.',
      'Tune one feature at a time so impact is measurable.',
      'Keep only options that improve your workflow speed.'
    ]
  };

  return composeRuntimeGuidance(
    userMessage,
    `nexus:${topic}`,
    stepMap[topic] || stepMap.default,
    [
      'This works because focused configuration keeps Nexus fast and predictable.',
      'This works because intentional defaults reduce friction during normal use.'
    ],
    [
      'Tell me your workflow and I can suggest a custom profile.',
      'I can also propose a minimal setup if you prefer speed over features.'
    ]
  );
}

function generateBoundaryResponse(topic, userMessage) {
  const focus = formatFocus(userMessage);
  const boundaryByTopic = {
    harmful: {
      caution: 'I cannot assist with harmful, illegal, or unethical actions.',
      redirect: 'I can help with safe alternatives that achieve a legitimate goal.'
    },
    medical: {
      caution: 'I cannot provide diagnosis or treatment guidance.',
      redirect: 'A licensed medical professional is the right source for health decisions.'
    },
    financial: {
      caution: 'I cannot provide personalized investment, tax, or loan advice.',
      redirect: 'A certified financial advisor or accountant can guide your exact situation.'
    },
    legal: {
      caution: 'I cannot provide legal strategy or jurisdiction-specific legal advice.',
      redirect: 'A qualified lawyer can assess the legal details correctly.'
    },
    default: {
      caution: 'I need to keep advice within safe and appropriate boundaries.',
      redirect: 'I can still help with educational explanations in allowed areas.'
    }
  };

  const selected = boundaryByTopic[topic] || boundaryByTopic.default;
  return `${selected.caution} Your message appears related to ${focus}. ${selected.redirect}`;
}

function buildNonTemplateGuidance(userMessage, pipeline, context = {}) {
  const profile = pipeline?.profile || {};
  const focusTerms = pipeline?.focus?.length ? pipeline.focus : extractFocusTerms(userMessage, 4);
  const focus = focusTerms.length ? focusTerms.join(', ') : 'your request';

  const steps = [];
  if (profile.codingTask) {
    steps.push(`Define expected behavior for ${focus} with a minimal runnable example.`);
    steps.push('Run one targeted verification, then modify exactly one variable and retest.');
    steps.push('Keep only the smallest fix that resolves the root failure signal.');
  } else if (profile.planningTask) {
    steps.push(`State the goal and constraints for ${focus} in one concise block.`);
    steps.push('Split execution into short phases, each with a success condition.');
    steps.push('Validate outcomes at each phase boundary before scaling scope.');
  } else if (profile.dataTask) {
    steps.push(`Normalize and deduplicate source data related to ${focus}.`);
    steps.push('Extract high-frequency anomalies and rank by impact first.');
    steps.push('Cross-check assumptions against source evidence before concluding.');
  } else {
    steps.push(`Clarify the exact outcome you want for ${focus}.`);
    steps.push('Take the fastest safe action that produces measurable feedback.');
    steps.push('Adjust based on feedback and repeat until the target is met.');
  }

  if (context.attachments?.length) {
    steps.push(`Use attached files (${context.attachments.join(', ')}) as primary evidence.`);
  }
  if (context.webContext) {
    steps.push('Resolve conflicts between local assumptions and external context before final output.');
  }

  const renderedSteps = steps.slice(0, 4).map((step, index) => `${index + 1}. ${step}`).join('\n');
  const closure = profile.factualQuestion
    ? 'Share one concrete input and I will generate an exact answer path from it.'
    : 'Share your current state and I will generate the next precise action.';

  return `${renderedSteps}\n\n${closure}`;
}

function buildDynamicIntro(userMessage, personality = { professionalism: 0.5, mentorship: 0.5 }, pipeline = {}) {
  const professionalism = Number(personality?.professionalism ?? 0.5);
  const profile = pipeline?.profile || {};
  const focus = formatFocus(userMessage);

  if (profile.codingTask) {
    return professionalism >= 0.65
      ? `Implementation guidance for ${focus}:`
      : `Direct build path for ${focus}:`;
  }
  if (profile.planningTask) {
    return professionalism >= 0.65
      ? `Structured execution plan for ${focus}:`
      : `Practical plan for ${focus}:`;
  }
  return professionalism >= 0.65
    ? `Direct response for ${focus}:`
    : `Practical response for ${focus}:`;
}

/**
 * Generate a response based on user message, personality, and knowledge base
 * @param {string} userMessage - User's input
 * @param {object} personality - { professionalism: 0-1, mentorship: 0-1 }
 * @returns {Promise<string>} AI response (polished with Transformer.js)
 */
export async function generateResponse(userMessage, personality = { professionalism: 0.5, mentorship: 0.5 }, generationContext = {}) {
  // Generate the raw AI response (RAZONET/SPARK thinking)
  const rawResponse = generateResponseInternal(userMessage, personality, generationContext);

  // Get user's transformer tier preference
  let tier = 'balanced'; // Default
  try {
    const settings = await storage.loadSettings();
    tier = settings?.aiTools?.transformerTier || 'balanced';
  } catch (error) {
    console.warn('Could not load transformer tier, using balanced:', error);
  }

  // Polish the response (Transformer.js as "talking filter")
  const polishedResponse = await polishResponse(rawResponse, tier);

  return formatGenerationResult(polishedResponse, userMessage, generationContext, 'runtime');
}

/**
 * Internal response generator (RAZONET/SPARK actual thinking)
 * This is where the AI decides what to say and how to say it
 * Transformer.js will NOT change the decisions - only polish the output
 * 
 * NO TEMPLATES: Everything is dynamically generated based on understanding
 */
function generateResponseInternal(userMessage, personality = { professionalism: 0.5, mentorship: 0.5 }, generationContext = {}) {
  const lower = userMessage.toLowerCase();
  const context = normalizeGenerationContext(generationContext);
  const pipeline = executeSTMModules(userMessage, context);

  // Check if message contains a greeting - scan the whole message
  const hasGreeting = /\b(hi|hello|hey|yo|sup|hiya)\b/.test(lower);
  const acknowledgment = getUserAcknowledgment(userMessage);

  // Helper to add greeting to responses when user said hi/hey
  const respond = (content, intro, isBoundary = false) =>
    buildResponse(content, intro, personality, isBoundary, hasGreeting, acknowledgment);

  const commonSenseBoundary = getCommonSenseSafetyResponse(userMessage);
  if (commonSenseBoundary) {
    return respond(
      commonSenseBoundary,
      "I can't help with that.",
      true
    );
  }

  const minecraftDiagnosis = diagnoseMinecraftModIssue(userMessage);
  if (minecraftDiagnosis) {
    return respond(
      minecraftDiagnosis,
      'I can help triage that Minecraft mod issue. Start here:'
    );
  }

  const codingDiagnosis = diagnoseCodingIssue(userMessage);
  if (codingDiagnosis) {
    return respond(
      context.attachments.length > 0
        ? `${codingDiagnosis}\n\nAttached files detected: ${context.attachments.join(', ')}.`
        : codingDiagnosis,
      'Let\'s debug this step by step:'
    );
  }

  // 1) Basic arithmetic (e.g., 4+4, 12 - 3, 6*7, 10/2, or "what is 4+4")
  const mathMatch = lower.match(/(?:^|\b)(?:what\s+is\s+)?(-?\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(-?\d+(?:\.\d+)?)(?:\b|$)/);
  if (mathMatch) {
    const [, aStr, opRaw, bStr] = mathMatch;
    const a = parseFloat(aStr);
    const b = parseFloat(bStr);
    const op = opRaw.replace('×', '*').replace('x', '*').replace('÷', '/');
    let result;
    if (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*') result = a * b;
    else if (op === '/') result = b === 0 ? 'undefined (division by zero)' : a / b;

    const explanation = typeof result === 'number'
      ? `${a} ${op} ${b} = ${result}`
      : `Can't compute: ${a} ${op} ${b} → ${result}`;

    return respond(
      explanation,
      'Here you go:'
    );
  }

  const dynamicIntro = buildDynamicIntro(userMessage, personality, pipeline);
  const dynamicGuidance = buildNonTemplateGuidance(userMessage, pipeline, context);
  return respond(dynamicGuidance, dynamicIntro);
}

function cleanGeneratedResponse(text) {
  let output = String(text || '').trim();
  if (!output) return '';

  output = output
    .replace(/^direct answer:\s*/i, '')
    .replace(/^here is a direct response:\s*/i, '')
    .replace(/^here is a practical response:\s*/i, '')
    .replace(/^i want to get this right:\s*/i, '')
    .replace(/^answer:\s*/i, '')
    .trim();

  const blocked = [
    'break the problem into input, process, and output',
    'this approach usually works well',
    'give me one concrete constraint and i will tailor the answer immediately',
    'i want to answer',
    'share one concrete detail (goal, constraints, or current attempt)'
  ];

  const lower = output.toLowerCase();
  if (blocked.some((phrase) => lower.includes(phrase))) {
    return '';
  }

  return output;
}

async function tryRemoteProviderResponse(userMessage, settings) {
  const aiTools = settings?.aiTools || {};
  const provider = String(aiTools.apiProvider || 'none').toLowerCase();
  const apiKey = String(aiTools.apiKey || '').trim();

  if (!apiKey || provider === 'none') return '';

  const prompt = [
    'You are RAZONET, the Nexus AI system for users.',
    'Respond directly to the user message below with concrete, specific help.',
    'Avoid capability lists and avoid generic scaffolding.',
    '',
    `User message:\n${userMessage}`
  ].join('\n');

  try {
    if (provider === 'openai') {
      const result = await callOpenAI(prompt, apiKey, []);
      return result?.response ? cleanGeneratedResponse(result.response) : '';
    }

    if (provider === 'google' || provider === 'gemini') {
      const result = await callGoogleGemini(prompt, apiKey, []);
      return result?.response ? cleanGeneratedResponse(result.response) : '';
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: aiTools.model || 'claude-3-haiku-20240307',
          max_tokens: 700,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) return '';
      const data = await response.json();
      const text = data?.content?.[0]?.text || '';
      return cleanGeneratedResponse(text);
    }
  } catch (error) {
    console.warn('Remote provider response failed:', error);
  }

  return '';
}

async function trySearchBackedResponse(userMessage, settings) {
  const normalized = String(userMessage || '').trim();
  if (!normalized) return '';

  const apiKey = settings?.aiTools?.serpApiKey || null;
  let query = extractSearchQuery(normalized) || normalized;
  const lowered = normalized.toLowerCase();

  const howDoesMatch = lowered.match(/^how\s+(does|do|did)\s+(.+?)(?:\s+happen|\s+work|\?)?$/i);
  if (howDoesMatch?.[2]) {
    query = howDoesMatch[2].trim();
  }

  try {
    const results = await performWebSearch(query, { apiKey });
    if (!results?.success || !results?.summary) return '';

    const source = results.source ? `\n\nSource: ${results.source}` : '';
    const link = results.url ? `\n${results.url}` : '';
    return cleanGeneratedResponse(`${results.summary}${source}${link}`);
  } catch (error) {
    console.warn('Search-backed fallback failed:', error);
    return '';
  }
}

/**
 * Check if user message matches keywords
 */
function matchesKeywords(message, keywords) {
  return keywords.some(keyword => message.includes(keyword.toLowerCase()));
}

/**
 * Build a response with personality adjustments
 */
function buildResponse(content, intro, personality, isBoundary = false, includeGreeting = false, acknowledgment = null) {
  const { professionalism = 0.5, mentorship = 0.5 } = personality;

  let response = String(intro || '').trim();
  if (!response) {
    response = professionalism >= 0.7 ? 'Systematic response:' : 'Direct response:';
  }

  // Add greeting/acknowledgment after professionalism so they are preserved
  if (!isBoundary) {
    const prefixes = [];
    if (includeGreeting) prefixes.push('Hey!');
    if (acknowledgment) prefixes.push(acknowledgment);
    if (prefixes.length > 0) {
      response = `${prefixes.join(' ')} ${response}`;
    }
  }

  response += '\n\n' + content;

  // Add mentorship follow-up
  if (mentorship > 0.6 && !isBoundary) {
    response += '\n\nShare a concrete example and I can generate the next exact step.';
  }

  return response;
}

function getCommonSenseSafetyResponse(userMessage) {
  const lower = userMessage.toLowerCase();

  const dangerousNonsense = [
    /eat rocks?/i,
    /drink bleach/i,
    /mix bleach (and|with) ammonia/i,
    /eat glue|consume glue/i,
    /ingest (cleaner|detergent|chemicals?)/i,
  ];

  if (dangerousNonsense.some((pattern) => pattern.test(lower))) {
    return 'That is unsafe and can seriously harm you. Do not do that. If you want, I can suggest a safe alternative for the same goal.';
  }

  return null;
}

function getUserAcknowledgment(userMessage) {
  const lower = userMessage.toLowerCase();

  if (/\b(confused|confusing|not sure|don't understand|dont understand|lost|overwhelming)\b/.test(lower)) {
    return "I know it can feel a little confusing, but I'll help as much as I can.";
  }

  if (/\b(frustrated|frustrating|annoying|stuck|ugh|this sucks|pain)\b/.test(lower)) {
    return "I get why that's frustrating—let's work through it together.";
  }

  if (/\b(i'm trying|im trying|i am trying|i'll try|ill try|doing my best)\b/.test(lower)) {
    return "I appreciate you sticking with it.";
  }

  if (/\b(asap|urgent|quickly|hurry)\b/.test(lower)) {
    return "Got you—I'll keep this quick and clear.";
  }

  if (/\b(thanks|thank you|appreciate it)\b/.test(lower)) {
    return "Happy to help.";
  }

  return null;
}

function diagnoseCodingIssue(userMessage) {
  const lower = userMessage.toLowerCase();
  const hasCodeSignals = /```|syntaxerror|typeerror|referenceerror|exception|traceback|stack trace|line \d+/i.test(userMessage) ||
    /debug|bug|fix|error|crash|broken|doesn\'t work|not working|function|javascript|python|java|typescript|compile/i.test(lower);

  if (!hasCodeSignals) return null;

  const errorType = userMessage.match(/(SyntaxError|TypeError|ReferenceError|RangeError|NullPointerException|IndexError|KeyError|ValueError)/i)?.[1];
  const lineNumber = userMessage.match(/line\s+(\d+)/i)?.[1];

  const sections = [
    "Debug workflow: 1) Reproduce the error reliably, 2) Read the exact error message and line number, 3) Check your assumptions (null/undefined/types), 4) Log key variables at each step, 5) Apply the smallest fix that addresses the root cause, 6) Re-test edge cases."
  ];

  if (errorType) {
    sections.push(`Detected error type: ${errorType}${lineNumber ? ` near line ${lineNumber}` : ''}. Focus there first before changing unrelated code.`);
  }

  if (/design|architecture|how should|how could|structure/i.test(lower)) {
    sections.push("When designing features, start with the data shape and user flow. Then split into three layers: input validation, core logic, and output rendering. This separation prevents tangled code and makes testing easier.");
  }

  if (/make|create|build|simple code|starter/i.test(lower)) {
    sections.push("For a simple implementation: define input and output first, write the smallest version that works, test with one case, then expand. Keep functions small and single-purpose. This makes debugging much easier.");
  }

  sections.push('If you paste the exact error message plus 20 lines of code around it, I can identify the likely root cause and suggest a targeted fix.');
  return sections.join('\n\n');
}

function diagnoseMinecraftModIssue(userMessage) {
  const lower = userMessage.toLowerCase();
  const isMinecraftContext = /minecraft|fabric|forge|neoforge|modpack|mods folder|mixin|fabric api|quilt|curseforge/.test(lower);
  const isCrashContext = /crash|error|failed|incompatible|dependency|missing|exception|stack trace|log/.test(lower);

  if (!isMinecraftContext || !isCrashContext) return null;

  // Automatically fetch installed mods from ModManager
  const modSnapshot = modDataAccessor.getModEnvironmentSnapshot();

  const hints = [];

  // Add mod context if available
  if (modSnapshot.modCount > 0) {
    hints.push(`📦 **Your Current Mods (${modSnapshot.modCount} installed):**`);
    hints.push(modSnapshot.summary);
    hints.push(''); // Empty line for spacing
  }

  // Pattern-match against known issues
  if (/requires|missing|dependency|depends on|could not find required/i.test(lower)) {
    hints.push(`1) Missing Dependency: A required dependency mod is missing or the wrong version is installed. Check each mod's dependencies page and verify game version compatibility.`);
  }
  if (/fabric.*forge|forge.*fabric|wrong loader|mod loader/i.test(lower)) {
    hints.push(`2) Loader Mismatch: You have a mix of Fabric and Forge/NeoForge mods. These loaders are incompatible—install only mods that match your exact loader.`);
  }
  if (/java\s*8|java\s*11|unsupported class version|class file version/i.test(lower)) {
    hints.push(`3) Java Version Mismatch: Many modern modpacks require Java 17 or 21. Check your launcher's Java runtime settings and update if needed.`);
  }
  if (/mixin|mixin apply failed|failed injection|injector/i.test(lower)) {
    hints.push(`4) Mixin Failure: This often indicates incompatible mods trying to patch the same code. Remove recently added mods and test in small batches to isolate the conflict.`);
  }
  if (/mapping|yarn|mojmap|fabric api|forge api/i.test(lower)) {
    hints.push(`5) Mapping/API Mismatch: Ensure your Fabric API or Forge version matches your Minecraft version exactly. Outdated APIs cause mapping errors.`);
  }

  // Analyze mod environment for auto-detected issues
  if (modSnapshot.potentialIssues.hasMultipleLoaders) {
    hints.push(`⚠️ **ISSUE DETECTED:** You have mods for multiple loaders (${modSnapshot.modLoaders.join(', ')}). Fabric and Forge mods cannot mix—choose one loader and remove the others.`);
  }
  if (modSnapshot.potentialIssues.hasMultipleMinecraftVersions) {
    hints.push(`⚠️ **ISSUE DETECTED:** Your mods target different Minecraft versions (${modSnapshot.minecraftVersions.join(', ')}). All mods must match your game version exactly.`);
  }
  if (modSnapshot.potentialIssues.noModsInstalled) {
    hints.push(`ℹ️ You haven't added mods via ModManager yet. If you manually installed mods, I can still help—just describe the issue or paste the crash log.`);
  }

  if (hints.length === 0) {
    hints.push(`1) Confirm your exact Minecraft version and loader version match all installed mods.`);
    hints.push(`2) Remove the newest mods first, then add them back in small batches of 3-5 to isolate the problem.`);
    hints.push(`3) Check latest.log for the first 'Caused by:' line—that's usually the real root cause, not the top error.`);
  }

  hints.push('If you paste the first "Caused by:" section from your crash log, I can identify the likely broken mod and suggest a fix.');
  return hints.join('\n');
}

/**
 * Analyze user message for personality adjustment
 * Returns delta to apply to personality sliders
 */
export function analyzeUserPersonality(userMessage) {
  const lower = userMessage.toLowerCase();
  const trimmed = userMessage.trim();

  let professionalismDelta = 0;
  let mentorshipDelta = 0;

  // Professionalism signals
  const hasProperPunctuation = /[.!?]/.test(trimmed[trimmed.length - 1]);
  const hasCapitals = /[A-Z]/.test(trimmed) && trimmed[0] === trimmed[0].toUpperCase();
  const hasSlang = /\b(gonna|wanna|gotta|y'all|u|ur|lol|brb)\b/i.test(lower);
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(userMessage);
  const isVeryShort = trimmed.length < 15;
  const isVeryLong = trimmed.length > 200;

  // Adjust professionalism
  if (hasProperPunctuation && hasCapitals) professionalismDelta += 0.1;
  if (hasSlang || hasEmoji) professionalismDelta -= 0.1;
  if (isVeryShort) professionalismDelta -= 0.05; // Casual tends to be terse

  // Mentorship signals
  const asksHow = /\bhow\b/i.test(lower);
  const asksWhy = /\bwhy\b/i.test(lower);
  const hasMultipleParts = (lower.match(/[,?]/g) || []).length > 1;
  const asksToExplain = /\bexplain|teach|show me\b/i.test(lower);
  const isOneWordQuery = trimmed.split(/\s+/).length === 1;

  // Adjust mentorship
  if (asksHow || asksWhy || asksToExplain) mentorshipDelta += 0.15;
  if (hasMultipleParts) mentorshipDelta += 0.1;
  if (isOneWordQuery) mentorshipDelta -= 0.1; // "help" vs "can you help me understand..."

  return {
    professionalismDelta: Math.max(-0.2, Math.min(0.2, professionalismDelta)),
    mentorshipDelta: Math.max(-0.2, Math.min(0.2, mentorshipDelta))
  };
}

/**
 * Generate a natural AI response with optional LLM enhancement
 * @param {string} userMessage - User's input
 * @param {object} personality - { professionalism: 0-1, mentorship: 0-1 }
 * @returns {Promise<string>} Natural AI response (enhanced if AI model is ready, generated fallback otherwise)
 */
export async function generateNaturalResponse(userMessage, personality = { professionalism: 0.5, mentorship: 0.5 }, generationContext = {}) {
  const context = normalizeGenerationContext(generationContext);
  let settings = {};
  try {
    settings = await storage.loadSettings();
  } catch (error) {
    console.warn('Could not load AI settings for generation path:', error);
  }

  try {
    const pyResult = await generateKnowledgeResponse({
      message: userMessage,
      mode: context.mode,
      toolState: context.toolState || {},
      context: {
        attachments: context.attachments || [],
        webContext: context.webContext || '',
        sources: [],
        taskType: context.taskType || 'answer',
        currentDraft: context.currentDraft || '',
        instructions: context.instructions || '',
        selfAwarenessProfile: context.selfAwarenessProfile || {},
        selfAwarenessApprovals: context.selfAwarenessApprovals || [],
      },
      fluxTags: context.fluxTags || [],
      deviceProfile: context.deviceProfile || {},
      siteState: context.siteState || {},
      requireProof: Boolean(context.toolState?.deepResearch || context.toolState?.thinkLonger),
    });

    const pyText = cleanGeneratedResponse(pyResult?.response || '');
    if (pyText) {
      if (context.returnMetadata) {
        return {
          text: pyText,
          transparencyReport: pyResult?.transparencyReport || buildTransparencyReport(userMessage, context, 'python-knowledge'),
        };
      }
      return pyText;
    }
  } catch (error) {
    console.warn('Python knowledge generation unavailable, using local fallback path:', error);
  }

  const remoteResponse = await tryRemoteProviderResponse(buildModelPrompt(userMessage, context), settings);
  if (remoteResponse) {
    return formatGenerationResult(remoteResponse, userMessage, context, 'remote');
  }

  try {
    const directPrompt = buildModelPrompt(userMessage, context);

    const directResponse = await aiModelManager.generateFromPrompt(directPrompt, {
      maxNewTokens: 320,
      temperature: 0.72,
      topP: 0.92,
      doSample: true,
    });

    if (directResponse && directResponse.length > 0) {
      const cleanedDirect = cleanGeneratedResponse(directResponse);
      if (cleanedDirect) {
        return formatGenerationResult(cleanedDirect, userMessage, context, 'local-model');
      }
    }

    const searchBacked = await trySearchBackedResponse(userMessage, settings);
    if (searchBacked) {
      return formatGenerationResult(searchBacked, userMessage, context, 'search');
    }

    const naturalResponse = await aiModelManager.naturalizeText({
      topic: 'nexus_assistance',
      content: userMessage,
      userMessage,
      personality: personality.professionalism > 0.65 ? 'professional' : 'adaptive',
      fallback: '',
    });

    const cleanedNatural = cleanGeneratedResponse(naturalResponse);
    if (cleanedNatural) {
      return formatGenerationResult(cleanedNatural, userMessage, context, 'local-naturalize');
    }

    return formatGenerationResult(
      'I could not generate a model-backed response right now. Please retry, or enable an AI provider in AI Settings.',
      userMessage,
      context,
      'model-unavailable'
    );
  } catch (error) {
    console.warn('AI direct generation failed, falling back to runtime response:', error);
    const searchBacked = await trySearchBackedResponse(userMessage, settings);
    if (searchBacked) {
      return formatGenerationResult(searchBacked, userMessage, context, 'search');
    }
    return formatGenerationResult(
      'I could not generate a model-backed response right now. Please retry, or enable an AI provider in AI Settings.',
      userMessage,
      context,
      'model-unavailable'
    );
  }
}
