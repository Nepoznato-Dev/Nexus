import { generateNaturalResponse } from './aiKnowledgeBase.js';
import { generateSearchEnhancedResponse } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/IRISSearch.js';
import {
  applyLearnedPersonalization,
  deriveAdaptivePersonality,
} from './userLearning.js';
import {
  createAlloyPassWatchdog,
  DEFAULT_MAX_RETRIES,
} from './alloyPassWatchdog.js';

function normalizeGenerationResult(result) {
  if (typeof result === 'string') {
    return { text: result, transparencyReport: null };
  }

  return {
    text: String(result?.text || '').trim(),
    transparencyReport: result?.transparencyReport || null,
  };
}

export function analyzePromptComplexity(prompt, options = {}) {
  const text = String(prompt || '').trim();
  const lower = text.toLowerCase();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const lineCount = text ? text.split(/\n/).length : 0;
  const hasCode = /```|function\s|class\s|const\s|let\s|var\s|import\s|def\s|traceback|exception|stack\s?trace/i.test(text);
  const hasReasoning = /prove|proof|derive|deduce|analy[sz]e|reason|logic|contradiction|assumption/i.test(lower);
  const hasResearch = /research|compare|sources|citations?|reference|verify|fact-check|evidence/i.test(lower);
  const hasMath = /\d\s*[+\-*/=]\s*\d|integral|matrix|equation|theorem|probability|statistics/i.test(lower);
  const hasLargeData = /logs?|dataset|85k|100k|massive|huge|long file|many files/i.test(lower);

  let score = 8;
  score += Math.min(26, Math.floor(wordCount / 14));
  score += Math.min(10, Math.max(0, lineCount - 1));
  if (hasCode) score += 18;
  if (hasReasoning) score += 16;
  if (hasResearch) score += 14;
  if (hasMath) score += 10;
  if (hasLargeData) score += 12;
  if (options.isSearchWeb) score += 6;
  if (options.isDeepResearch) score += 18;
  if (options.isThinkLonger) score += 12;
  if (options.responseLength === 'longer') score += 8;

  const normalizedScore = Math.max(0, Math.min(100, score));
  const tags = [];
  if (hasCode) tags.push('high-code-density');
  if (hasResearch) tags.push('research-heavy');
  if (hasReasoning || hasMath) tags.push('logic-trap');
  if (hasLargeData) tags.push('high-strain');
  if (normalizedScore < 25) tags.push('quick-turn');

  return {
    score: normalizedScore,
    wordCount,
    tags,
  };
}

export function routeToIntelligenceTier(selectedMode, complexity, options = {}) {
  if (selectedMode !== 'auto') {
    return {
      tier: selectedMode,
      reason: 'manual-mode',
    };
  }

  if (options.isDeepResearch || complexity.score >= 72) {
    return { tier: 'pro', reason: 'high-complexity' };
  }

  if (complexity.score >= 48 || options.isThinkLonger || options.responseLength === 'longer') {
    return { tier: 'plus', reason: 'multi-pass-needed' };
  }

  if (complexity.score >= 26 || options.isSearchWeb) {
    return { tier: 'lite', reason: 'moderate-context' };
  }

  return { tier: 'turbo', reason: 'fast-path' };
}

export function getTierPolicy(tier) {
  if (tier === 'turbo') {
    return {
      modelB: 8,
      quantization: 'q4',
      coreCount: 1,
      initialTaskType: 'answer',
      outputStyle: 'turbo',
      runRefinePass: false,
      runVerifyPass: false,
    };
  }

  if (tier === 'lite') {
    return {
      modelB: 24,
      quantization: 'q4',
      coreCount: 2,
      initialTaskType: 'answer',
      outputStyle: 'balanced',
      runRefinePass: false,
      runVerifyPass: false,
    };
  }

  if (tier === 'plus') {
    return {
      modelB: 45,
      quantization: 'q5',
      coreCount: 2,
      initialTaskType: 'answer',
      outputStyle: 'balanced',
      runRefinePass: true,
      runVerifyPass: false,
    };
  }

  return {
    modelB: 70,
    quantization: 'q5',
    coreCount: 4,
    initialTaskType: 'answer',
    outputStyle: 'deep',
    runRefinePass: true,
    runVerifyPass: true,
  };
}

export async function executeAlloyFlow(options) {
  const {
    displayPrompt,
    generationContext = {},
    mode,
    responseLength,
    toolState = {},
    learningProfile,
    personalityVector,
    helperFns = {},
  } = options;

  const {
    deriveFluxTags,
    isGenericTemplateResponse,
    isSearchFailureResponse,
    enforceLengthMode,
    estimateTokens,
    buildTiming,
  } = helperFns;

  const startedAt = performance.now();
  const watchdog = createAlloyPassWatchdog({ maxRetries: DEFAULT_MAX_RETRIES });

  for (let attemptIndex = 0; attemptIndex <= DEFAULT_MAX_RETRIES; attemptIndex += 1) {
    const attemptPrompt = attemptIndex === 0
      ? displayPrompt
      : watchdog.buildRetryPrompt(displayPrompt);
    const attemptState = watchdog.beginAttempt({ attemptIndex, prompt: attemptPrompt });

    try {
      const adaptivePersonality = deriveAdaptivePersonality(personalityVector, learningProfile);
      let webContext = '';

      if (toolState.isSearchWeb) {
        try {
          const webResult = await watchdog.runPass(attemptState, 'web-search', () => (
            generateSearchEnhancedResponse(attemptPrompt, 'professional')
          ));
          if (webResult && typeof webResult === 'string' && !isSearchFailureResponse(webResult)) {
            webContext = webResult;
          }
        } catch (webError) {
          console.warn('Search Web tool failed, continuing without web context:', webError);
        }
      }

      const complexity = analyzePromptComplexity(attemptPrompt, {
        isSearchWeb: toolState.isSearchWeb,
        isDeepResearch: toolState.isDeepResearch,
        isThinkLonger: toolState.isThinkLonger,
        responseLength,
      });
      const route = routeToIntelligenceTier(mode, complexity, {
        isSearchWeb: toolState.isSearchWeb,
        isDeepResearch: toolState.isDeepResearch,
        isThinkLonger: toolState.isThinkLonger,
        responseLength,
      });
      const tierPolicy = getTierPolicy(route.tier);

      const effectiveContext = {
        ...generationContext,
        webContext,
        retryAttempt: attemptIndex,
        fluxTags: Array.from(new Set([
          ...deriveFluxTags(attemptPrompt, webContext),
          ...(complexity.tags || []),
        ])),
        routingPlan: {
          tier: route.tier,
          reason: route.reason,
          complexityScore: complexity.score,
          complexityWordCount: complexity.wordCount,
          policy: tierPolicy,
        },
      };

      let aiResponse;
      let transparencyReport = null;

      const initialResult = normalizeGenerationResult(await watchdog.runPass(attemptState, 'initial-answer', () => (
        generateNaturalResponse(attemptPrompt, adaptivePersonality, {
          ...effectiveContext,
          outputStyle: tierPolicy.outputStyle,
          taskType: tierPolicy.initialTaskType,
          returnMetadata: true,
        })
      )));
      aiResponse = initialResult.text;
      transparencyReport = initialResult.transparencyReport;

      if (toolState.isThinkLonger || toolState.isDeepResearch || tierPolicy.runRefinePass) {
        const improvedResult = normalizeGenerationResult(await watchdog.runPass(attemptState, 'refine', () => (
          generateNaturalResponse(attemptPrompt, adaptivePersonality, {
            ...effectiveContext,
            taskType: 'refine',
            currentDraft: aiResponse,
            instructions: 'Re-think the draft and improve correctness. Keep the tone direct, practical, and specific. Do not output analysis notes. Output only the improved final answer.',
            returnMetadata: true,
          })
        )));
        if (improvedResult.text) {
          aiResponse = improvedResult.text;
          transparencyReport = improvedResult.transparencyReport || transparencyReport;
        }
      }

      if (tierPolicy.runVerifyPass) {
        const verifiedResult = normalizeGenerationResult(await watchdog.runPass(attemptState, 'verify', () => (
          generateNaturalResponse(attemptPrompt, adaptivePersonality, {
            ...effectiveContext,
            taskType: 'refine',
            currentDraft: aiResponse,
            instructions: 'Run a strict verification pass. Correct any uncertain or unsupported claims, preserve what is solid, and output only the final corrected answer.',
            returnMetadata: true,
          })
        )));
        if (verifiedResult.text) {
          aiResponse = verifiedResult.text;
          transparencyReport = verifiedResult.transparencyReport || transparencyReport;
        }
      }

      if (responseLength === 'longer') {
        const expandedResult = normalizeGenerationResult(await watchdog.runPass(attemptState, 'expand', () => (
          generateNaturalResponse(attemptPrompt, adaptivePersonality, {
            ...effectiveContext,
            taskType: 'expand',
            currentDraft: aiResponse,
            instructions: 'Expand this answer with more detail, alternatives, and practical steps while staying accurate. Keep it useful and avoid filler.',
            returnMetadata: true,
          })
        )));
        if (expandedResult.text) {
          aiResponse = expandedResult.text;
          transparencyReport = expandedResult.transparencyReport || transparencyReport;
        }
      }

      if (isGenericTemplateResponse(aiResponse)) {
        const rewrittenResult = normalizeGenerationResult(await watchdog.runPass(attemptState, 'rewrite', () => (
          generateNaturalResponse(attemptPrompt, adaptivePersonality, {
            ...effectiveContext,
            taskType: 'rewrite',
            currentDraft: aiResponse,
            instructions: 'Do not use generic capability templates or canned category lists. Answer directly with concrete help, and if unsure ask one targeted clarification question only.',
            returnMetadata: true,
          })
        )));
        if (rewrittenResult.text && !isGenericTemplateResponse(rewrittenResult.text)) {
          aiResponse = rewrittenResult.text;
          transparencyReport = rewrittenResult.transparencyReport || transparencyReport;
        } else {
          const forcedSearch = await watchdog.runPass(attemptState, 'forced-search', () => (
            generateSearchEnhancedResponse(`search for ${attemptPrompt}`, 'professional')
          ));
          if (forcedSearch && typeof forcedSearch === 'string' && !isSearchFailureResponse(forcedSearch)) {
            aiResponse = forcedSearch;
          }
        }
      }

      if (isSearchFailureResponse(aiResponse)) {
        const regeneratedResult = normalizeGenerationResult(await watchdog.runPass(attemptState, 'regenerate', () => (
          generateNaturalResponse(attemptPrompt, adaptivePersonality, {
            ...effectiveContext,
            returnMetadata: true,
          })
        )));
        if (regeneratedResult.text && !isSearchFailureResponse(regeneratedResult.text)) {
          aiResponse = regeneratedResult.text;
          transparencyReport = regeneratedResult.transparencyReport || transparencyReport;
        }
      }

      aiResponse = enforceLengthMode(aiResponse, responseLength);
      if (webContext) {
        aiResponse = `${aiResponse}\n\nSources:\n${webContext}`;
      }
      aiResponse = applyLearnedPersonalization(aiResponse, learningProfile);

      const routeTrace = {
        tier: route.tier,
        tierReason: route.reason,
        mode,
        complexityScore: complexity.score,
        modelB: tierPolicy.modelB,
        quantization: tierPolicy.quantization,
        coreCount: tierPolicy.coreCount,
      };

      const normalizedReport = transparencyReport && typeof transparencyReport === 'object'
        ? { ...transparencyReport }
        : {};
      normalizedReport.routing = {
        ...(normalizedReport.routing || {}),
        tier: routeTrace.tier,
        modelB: routeTrace.modelB,
        quantization: routeTrace.quantization,
        coreCount: routeTrace.coreCount,
      };

      const thoughtTrace = Array.isArray(normalizedReport.thoughtTrace) ? [...normalizedReport.thoughtTrace] : [];
      thoughtTrace.push(
        `Complexity score: ${routeTrace.complexityScore}`,
        `Route: ${String(routeTrace.tier).toUpperCase()} (${routeTrace.tierReason})`,
        `Policy: ${routeTrace.modelB}B ${String(routeTrace.quantization).toUpperCase()}, ${routeTrace.coreCount} cores`,
        `Watchdog pass count: ${watchdog.getAttemptSummary(attemptState).passCount}`
      );
      normalizedReport.thoughtTrace = thoughtTrace;

      const elapsedMs = Math.max(1, Math.round(performance.now() - startedAt));
      const responseTokens = estimateTokens(aiResponse);

      return {
        text: aiResponse,
        generationContext: effectiveContext,
        transparencyReport: normalizedReport,
        metrics: buildTiming(elapsedMs, responseTokens),
      };
    } catch (error) {
      console.error('AI response generation attempt failed:', {
        error,
        attemptIndex,
        summary: watchdog.getAttemptSummary(attemptState),
      });
      if (watchdog.canRetry(attemptIndex)) {
        continue;
      }
    }
  }

  const elapsedMs = Math.max(1, Math.round(performance.now() - startedAt));
  const failureMessage = watchdog.getFinalFailureMessage();
  return {
    text: failureMessage,
    generationContext,
    transparencyReport: {
      responseSource: 'watchdog',
      mode,
      thoughtTrace: [
        'Watchdog detected an incomplete ALLOY pass.',
        'Automatic retry issued with @Agent Try again.',
        'Final state: ALLOY refused to connect.'
      ],
    },
    metrics: buildTiming(elapsedMs, estimateTokens(failureMessage)),
  };
}