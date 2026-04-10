/**
 * S.P.A.R.K Query Engine - Intelligent escalation to RAZONET
 * S.P.A.R.K is ChatGPT 3.5 Turbo and lower level: fast, capable, confident reasoning
 * Attempts answers directly, escalates to RAZONET (ChatGPT 5-mini to 4.1 level) only when needed
 * 
 * Escalation criteria:
 * 1. Confidence score < 60% (uncertain answer quality)
 * 2. Complexity score > 6 + complexity keywords
 * 3. Detected failure patterns ("I don't know", "I can't", undefined/error)
 * 4. Advanced math/science/architecture queries
 */

import { analyzeComplexity, scoreResponseQuality } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/aiRouter.js';
import { generateNaturalResponse } from './aiKnowledgeBase.js';
import { questionPremise, findHandbrake } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/aiCommonSenseEngine.js';
import { queryDirect } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/aiIntegration.js';
import { askSpark } from '../../apis/aiServiceClient.js';
import modDataAccessor from '../Games/modDataAccessor.js';
import { sparkPersonality } from './sparkPersonality.js';

// Phrases that indicate S.P.A.R.K is struggling
const FAILURE_INDICATORS = [
    /i don't know/i,
    /i can't answer/i,
    /i'm not sure/i,
    /i don't have enough information/i,
    /undefined|null|error|failed/i,
    /i'm unable to/i,
];

// Model selection thresholds (S.P.A.R.K = ChatGPT 3.5 Turbo/lower, RAZONET = ChatGPT 5-mini to 4.1)
const SPARK_CONFIDENCE_THRESHOLD = 60; // Below this, escalate to RAZONET
const SPARK_COMPLEXITY_THRESHOLD = 5; // Above this + certain keywords, escalate
const SPARK_MAX_TOKENS_BEFORE_ESCALATE = 260; // Very long attempts may indicate struggling
const SPARK_MIN_WORDS = 6;

// Domain-specific escalation triggers
const ESCALATION_TRIGGERS = {
    advanced_math: /integral|differential|calculus|fourier|laplace|eigenvalue|matrix algebra/i,
    quantum: /quantum|superposition|entanglement|schrödinger|pauli|dirac/i,
    physics: /relativity|spacetime|field theory|hamiltonian|lagrangian/i,
    deep_architecture: /microservices|kubernetes|distributed|consensus|fault tolerance|saga pattern/i,
    advanced_code: /compiler|ast|bytecode|memory management|threading|concurrency|deadlock|race condition/i,
};

/**
 * Main S.P.A.R.K query function
 * Attempts to answer; escalates to RAZONET if needed
 * Never saves to memory (that only happens when user opens RAZONET Chat)
 * 
 * @param {string} userMessage - User's question
 * @param {string} userName - User's name
 * @param {object} options - API keys, local generation function, conversation history
 * @returns {Promise<{response: string, source: 'SPARK'|'IRIS', confidence: number, metadata: object}>}
 */
export async function processQuickAsk(userMessage, userName = 'Friend', options = {}) {
    const {
        generateLocal = null,
        apiKeys = {},
        conversationHistory = [],
        usePythonCore = true,
    } = options;

    try {
        if (usePythonCore) {
            try {
                const pyResult = await askSpark({
                    message: userMessage,
                    userName,
                    mode: null,
                    toolState: {
                        searchWeb: false,
                        deepResearch: false,
                        thinkLonger: false,
                    },
                    context: {
                        attachments: [],
                        sources: [],
                    },
                    fluxTags: [],
                    requireProof: false,
                });

                if (pyResult?.success && pyResult?.response) {
                    return {
                        response: pyResult.response,
                        source: pyResult.source || 'SPARK',
                        confidence: pyResult.confidence || 75,
                        metadata: pyResult.metadata || { provider: 'python-core' },
                        transparencyReport: pyResult.transparencyReport || null,
                    };
                }
            } catch (pythonError) {
                console.warn('[S.P.A.R.K] Python core unavailable, falling back to local chain:', pythonError);
            }
        }

        const safety = getSparkSafetyIntervention(userMessage);
        if (safety) {
            return {
                response: safety,
                source: 'SPARK',
                confidence: 95,
                metadata: {
                    category: 'SAFETY',
                    reason: 'unsafe_request',
                    timestamp: Date.now(),
                    escalatedLater: false,
                },
            };
        }

        // Check for simple greetings/casual conversation
        if (isCasualConversation(userMessage, conversationHistory)) {
            console.log('[S.P.A.R.K] Detected casual conversation, generating natural response');

            // Let queryDirect handle personality automatically
            const casualResponse = await sparkAttemptAnswer(
                userMessage,
                generateLocal,
                apiKeys,
                conversationHistory
            );

            return {
                response: casualResponse.response || `Hey there! What can I help you with?`,
                source: 'SPARK',
                confidence: 100,
                metadata: {
                    category: 'CASUAL_CONVERSATION',
                    reason: 'natural_interaction',
                    timestamp: Date.now(),
                    escalatedLater: false,
                },
            };
        }

        // Step 1: Analyze complexity
        const complexity = analyzeComplexity(userMessage);

        // Step 2: Check for immediate escalation triggers
        if (shouldEscalateImmediately(userMessage, complexity)) {
            console.log(`[S.P.A.R.K] Escalating to RAZONET (immediate trigger)`);
            return escalateToIRIS(userMessage, userName, options);
        }

        // Step 3: S.P.A.R.K attempts answer
        let sparkAttempt = await sparkAttemptAnswer(userMessage, generateLocal, apiKeys, conversationHistory);

        // Step 4: Evaluate S.P.A.R.K's answer
        let evaluation = evaluateSparkResponse(userMessage, sparkAttempt);

        // Step 5: Smart retry pass before escalation (S.P.A.R.K tries once more with tighter guidance)
        let retryUsed = false;
        if (evaluation.shouldEscalate && shouldRetryWithRefinement(evaluation, complexity)) {
            retryUsed = true;
            const refinedPrompt = buildRefinedPrompt(userMessage, evaluation.reason);
            const secondAttempt = await sparkAttemptAnswer(
                userMessage,
                generateLocal,
                apiKeys,
                conversationHistory,
                refinedPrompt,
            );

            if ((secondAttempt.confidence || 0) >= (sparkAttempt.confidence || 0)) {
                sparkAttempt = secondAttempt;
            }

            evaluation = evaluateSparkResponse(userMessage, sparkAttempt);
        }

        if (evaluation.shouldEscalate) {
            console.log(`[S.P.A.R.K] Answer quality insufficient, escalating to RAZONET`);
            return escalateToIRIS(userMessage, userName, options);
        }

        // S.P.A.R.K is confident in its answer
        const commonSenseEnhanced = applyCommonSenseEnhancement(userMessage, sparkAttempt.response);

        const finalResponse = commonSenseEnhanced;

        return {
            response: finalResponse,
            source: 'SPARK',
            confidence: sparkAttempt.confidence,
            metadata: {
                complexity: complexity.complexity,
                category: complexity.category,
                reason: evaluation.reason,
                retryUsed,
                timestamp: Date.now(),
                escalatedLater: false,
            },
        };
    } catch (error) {
        console.error('[S.P.A.R.K] Error, falling back to RAZONET:', error);
        return escalateToIRIS(userMessage, userName, options);
    }
}

/**
 * Check if question should immediately escalate to RAZONET
 * (before even attempting S.P.A.R.K's answer)
 */
function shouldEscalateImmediately(userMessage, complexity) {
    // High complexity + domain trigger = skip S.P.A.R.K
    if (complexity.complexity > SPARK_COMPLEXITY_THRESHOLD) {
        for (const [domain, pattern] of Object.entries(ESCALATION_TRIGGERS)) {
            if (pattern.test(userMessage)) {
                console.log(`[S.P.A.R.K] Immediate escalation: ${domain} domain detected`);
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if user message is casual conversation (not a technical question)
 * Returns true if it's greeting/small talk/acknowledgment
 */
function isCasualConversation(userMessage, conversationHistory = []) {
    const msg = userMessage.trim().toLowerCase();
    const wordCount = msg.split(/\s+/).length;

    // Very short messages (1-3 words) are likely casual
    if (wordCount <= 3) {
        // Common greetings and casual phrases
        const casualPatterns = [
            /^(hi|hey|hello|howdy|sup|yo|hiya|greetings)[\s!?.]*$/i,
            /^(how are you|how\'?s it going|what\'?s up|how do you do|how\'?s things)[\s!?.]*$/i,
            /^(good morning|good afternoon|good evening|good day)[\s!?.]*$/i,
            /^(really|nice|cool|awesome|sweet|neat|interesting|wow|oh|okay|ok)[\s!?.]*$/i,
            /^(thanks|thank you|thx|ty|tysm)[\s!?.]*$/i,
            /^(lol|haha|lmao|rofl|hehe)[\s!?.]*$/i,
            /^(yep|yeah|yup|nope|nah|sure|maybe)[\s!?.]*$/i,
            /^(what|why|how|really|seriously)[\s!?.]*$/i,
            /^(bye|goodbye|later|cya|see ya|peace)[\s!?.]*$/i,
        ];

        for (const pattern of casualPatterns) {
            if (pattern.test(msg)) {
                return true;
            }
        }
    }

    // Longer casual questions (no technical keywords)
    const technicalKeywords = /error|bug|crash|issue|problem|fix|mod|code|stack|trace|exception|undefined|null|function|class|variable|install|download|config|setting/i;

    if (wordCount <= 10 && !technicalKeywords.test(msg)) {
        // Looks like casual conversation if no technical terms
        const casualPhrases = /how are|what\'?s up|how\'?s it|doing good|doing well|nice to meet|good to see|thanks for|appreciate/i;
        if (casualPhrases.test(msg)) {
            return true;
        }
    }

    return false;
}

/**
 * Build a prompt for S.P.A.R.K to respond naturally to casual conversation
 * Sends personality context so AI generates authentic S.P.A.R.K responses
 */
function buildCasualConversationPrompt(userMessage, userName, conversationHistory = []) {
    // Build conversation context
    let historyContext = '';
    if (conversationHistory.length > 0) {
        const recentMessages = conversationHistory.slice(-4);
        historyContext = 'Recent conversation:\n' + recentMessages.map(msg =>
            `${msg.role}: ${msg.message}`
        ).join('\n') + '\n\n';
    }

    // S.P.A.R.K personality - THIS is what makes responses authentic
    const prompt = `You are S.P.A.R.K, a friendly and enthusiastic runtime assistant for technical help.

YOUR PERSONALITY:
- Younger sibling energy - very casual and playful
- Use contractions always: don't, I'm, you're, that's, etc.
- Speak like you're thinking out loud - stream of consciousness
- Use emoji occasionally for personality (👋 😊 🔍 💡 ✨)
- Get excited about technical problems
- Keep responses short and snappy
- Be approachable and fun, not formal

WHAT YOU KNOW:
- Runtime errors and debugging
- JavaScript, Python, Java, and other languages
- Minecraft modding (Fabric, Forge, NeoForge)
- General tech troubleshooting

CURRENT SITUATION:
You're having a casual conversation with ${userName}. They just said: "${userMessage}"

${historyContext}Respond naturally as S.P.A.R.K would in character. Keep it brief and friendly. If they're starting a conversation, greet them warmly and ask what they need help with. If they're making small talk, engage naturally but steer toward what you can actually help with.`;

    return prompt;
}

/**
 * S.P.A.R.K's attempt at answering
 * Uses YOUR local knowledge base - 100% autonomous
 * No APIs, no external AI - just S.P.A.R.K's own intelligence
 */
async function sparkAttemptAnswer(userMessage, generateLocal, apiKeys, history, promptOverride = null) {
    try {
        // Use S.P.A.R.K's own knowledge base directly
        const sparkPersonality = {
            professionalism: 0.4,  // More casual
            mentorship: 0.7,       // Friendly helper
        };

        const effectiveMessage = promptOverride || userMessage;

        // Prefer real model-backed generation so S.P.A.R.K produces native answers.
        const naturalResult = await generateNaturalResponse(effectiveMessage, sparkPersonality, {
            mode: 'turbo',
            outputStyle: 'turbo',
            taskType: 'answer',
            toolState: {
                searchWeb: false,
                deepResearch: false,
                thinkLonger: false,
            },
        });

        const naturalText = typeof naturalResult === 'string'
            ? naturalResult
            : String(naturalResult?.text || '').trim();

        const response = naturalText;

        if (!response || typeof response !== 'string') {
            return { response: null, confidence: 0 };
        }

        // Clean up the response
        const cleanResponse = response.trim();
        if (!cleanResponse) {
            return { response: null, confidence: 0 };
        }

        // Score quality
        const quality = scoreResponseQuality(cleanResponse, userMessage);

        return {
            response: cleanResponse,
            confidence: quality * 10,
            quality,
        };
    } catch (error) {
        console.error('[S.P.A.R.K] Generation error:', error);
        return { response: null, confidence: 0 };
    }
}

/**
 * Evaluate if S.P.A.R.K's answer is good enough
 * Returns true if should escalate to RAZONET
 */
function evaluateSparkResponse(userMessage, sparkAttempt) {
    if (!sparkAttempt.response) {
        return { shouldEscalate: true, reason: 'no_response' }; // No response = escalate
    }

    // Check for failure indicators
    for (const indicator of FAILURE_INDICATORS) {
        if (indicator.test(sparkAttempt.response)) {
            return { shouldEscalate: true, reason: 'explicit_failure' }; // Response shows uncertainty = escalate
        }
    }

    // Confidence-based escalation
    if (sparkAttempt.confidence < SPARK_CONFIDENCE_THRESHOLD) {
        return { shouldEscalate: true, reason: 'low_confidence' }; // Low confidence = escalate
    }

    // Check for response length anomalies (too short or too long)
    const words = sparkAttempt.response.split(/\s+/).length;
    if (words < SPARK_MIN_WORDS) {
        return { shouldEscalate: true, reason: 'too_short' };
    }

    if (words > SPARK_MAX_TOKENS_BEFORE_ESCALATE) {
        return { shouldEscalate: true, reason: 'too_long' };
    }

    return { shouldEscalate: false, reason: 'good' }; // Answer is good
}

function shouldRetryWithRefinement(evaluation, complexity) {
    if (!evaluation?.shouldEscalate) return false;
    if (['no_response', 'explicit_failure'].includes(evaluation.reason)) return false;
    if ((complexity?.complexity || 0) >= 8) return false;
    return true;
}

function buildRefinedPrompt(userMessage, reason) {
    const reasonHint = reason ? `Current weakness: ${reason}.` : '';
    return `${userMessage}\n\nProvide a direct, accurate answer. ${reasonHint} Keep it concise, include concrete steps if needed, and avoid uncertainty phrases.`;
}

function buildSparkPrompt(userMessage) {
    const lower = userMessage.toLowerCase();

    // S.P.A.R.K personality context for ALL responses
    const sparkContext = `You are S.P.A.R.K - a friendly, energetic runtime assistant. You're younger sibling energy: playful, casual, enthusiastic.
- Use contractions (don't, I'm, that's, etc.)
- Be casual and stream-of-consciousness
- Use emoji occasionally
- Get excited about problems and solutions
- Help with errors, bugs, performance, Minecraft mods, and coding issues
- Keep responses concise and snappy`;

    if (/minecraft|fabric|forge|neoforge|modpack|mixin|latest\.log|crash report/.test(lower)) {
        // 🔥 Automatically inject mod environment data
        const modSnapshot = modDataAccessor.getModEnvironmentSnapshot();
        let context = `${sparkContext}\n\nUser is troubleshooting Minecraft mods. Be enthusiastic about finding the issue! Look for: broken mods, loader problems, version mismatches.`;

        if (modSnapshot.modCount > 0) {
            context += `\n\n[Installed Mods]: ${modSnapshot.summary}`;
            if (modSnapshot.potentialIssues.hasMultipleLoaders) {
                context += '\n⚠️ Multiple loaders detected - this is usually a problem!';
            }
            if (modSnapshot.potentialIssues.hasMultipleMinecraftVersions) {
                context += '\n⚠️ Different mod versions detected!';
            }
        }

        return `${context}\n\n${userMessage}`;
    }

    if (/code|debug|error|stack trace|exception|function|typescript|javascript|python|java|compile/.test(lower)) {
        return `${sparkContext}\n\n${userMessage}\n\nBe practical and enthusiastic. Point out the root cause, suggest a minimal fix, and a quick way to verify it works.`;
    }

    return `${sparkContext}\n\n${userMessage}`;
}

function applyCommonSenseEnhancement(userMessage, response) {
    const premise = questionPremise(userMessage);
    const handbrake = findHandbrake(userMessage);

    let enhanced = response;

    if (premise?.questionedAssumption && premise.reframe) {
        enhanced += `\n\n💭 Common-sense check: ${premise.reframe}`;
    }

    if (handbrake?.hasHandbrake && handbrake.solutions?.length > 0) {
        enhanced += `\n\n🔄 Alternative: ${handbrake.solutions[0].idea}`;
    }

    return enhanced;
}

function getSparkSafetyIntervention(userMessage) {
    const lower = userMessage.toLowerCase();
    const unsafe = [
        /eat rocks?/i,
        /drink bleach/i,
        /mix bleach (and|with) ammonia/i,
        /ingest detergent|ingest cleaner/i,
    ];

    if (unsafe.some((pattern) => pattern.test(lower))) {
        return 'That is unsafe and could seriously harm you. I can\'t help with that. If you want, I can help with a safe alternative.';
    }

    return null;
}

/**
 * Escalate to RAZONET backend
 * Calls RAZONET with local generation (silent, no memory save)
 */
async function escalateToIRIS(userMessage, userName, options) {
    const {
        generateLocal = null,
        apiKeys = {},
        conversationHistory = [],
    } = options;

    try {
        // Route escalation through RAZONET's dedicated direct-query pipeline.
        const irisResponse = await queryDirect(userMessage, userName, {
            conversationHistory,
            generateLocal,
            apiKeys,
        });

        return {
            response: irisResponse?.response || 'I hit an issue while escalating this request. Please try again.',
            source: 'IRIS',
            confidence: irisResponse?.metadata?.confidence || 85,
            metadata: {
                isEscalation: true,
                model: irisResponse?.metadata?.model || 'RAZONET-LOCAL',
                timestamp: irisResponse?.metadata?.timestamp || Date.now(),
            },
        };
    } catch (error) {
        console.error('[S.P.A.R.K] RAZONET escalation failed:', error);
        return {
            response: `I ran into trouble with that question. Let me know if you'd like to ask in a different way and I'll try again.`,
            source: 'ERROR',
            confidence: 0,
            metadata: { error: error.message, timestamp: Date.now() },
        };
    }
}

/**
 * Create handoff payload for transitioning to RAZONET Chat
 * Called when user clicks "Continue in RAZONET"
 * 
 * @returns {object} Handoff context for RAZONET Chat
 */
export function createHandoffPayload(quickAskResult, originalMessage) {
    const payload = {
        handoffId: `handoff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
        sourceAgent: 'SPARK',
        originalUserQuery: originalMessage,
        sparkSource: quickAskResult.source, // 'SPARK' or 'IRIS'
        sparkResponse: quickAskResult.response,
        sparkConfidence: quickAskResult.confidence,
        routeReason: quickAskResult.source === 'IRIS'
            ? 'S.P.A.R.K escalated due to answer quality or complexity'
            : 'User requested to continue conversation in RAZONET',
        metadata: quickAskResult.metadata,
    };

    // 🔥 NEW: Include mod environment if query is Minecraft-related
    if (modDataAccessor.isMinecraftModQuery(originalMessage)) {
        const modSnapshot = modDataAccessor.getModEnvironmentSnapshot();
        payload.modEnvironment = modSnapshot;
    }

    return payload;
}

/**
 * Check if a handoff payload is still valid
 * (prevents stale context from being used)
 */
export function isHandoffValid(payload) {
    if (!payload) return false;
    const age = Date.now() - payload.timestamp;
    const MAX_AGE = 600000; // 10 minutes
    return age < MAX_AGE;
}

export default {
    processQuickAsk,
    createHandoffPayload,
    isHandoffValid,
};
