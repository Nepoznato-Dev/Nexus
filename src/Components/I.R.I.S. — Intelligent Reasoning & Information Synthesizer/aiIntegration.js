/**
 * AAS Integration Layer - Orchestrates all AI thinking systems
 * Combines: Memory, Search, Personality, Common Sense, Proactivity, Self-Awareness
 * Creates a truly thinking AI that feels human
 */

import { enhanceWithCommonSense, findHandbrake, questionPremise } from './aiCommonSenseEngine.js';
import { suggestNextStep, proactiveWarnings, analyzeUserContext } from './aiProactiveSuggestions.js';
import { formatWithSelfAwareness, scoreConfidence, detectGuessing } from './aiSelfAwareness.js';
import { enhanceWithPersonality } from './aiPersonalityEnhancer.js';
import { saveMessage, getConversation, getUserProfile } from './aiMemorySystem.js';
import { runFallbackChain, callGoogleGemini } from './aiApiBridge.js';
import { routeQuestion } from './aiRouter.js';

/**
 * Main AAS response generation pipeline
 * Takes user input and generates thoughtful, self-aware, proactive response
 */
export async function generateAASResponse(userMessage, options = {}) {
  const {
    conversationId,
    conversationHistory = [],
    userSettings = {},
    userProfile = {},
    generateLocal = null,
    apiKeys = {},
  } = options;

  try {
    // Step 1: Analyze user and context
    const userContext = analyzeUserContext(conversationHistory);
    const userProf = await getUserProfile(userProfile.id || 'default');

    // Step 2: Route the question (LOCAL vs API)
    const strategy = routeQuestion(userMessage, userSettings);

    // Step 3: Generate base response
    let response;
    if (strategy.route[0] === 'LOCAL' && generateLocal) {
      response = await generateLocal(userMessage, conversationHistory);
    } else {
      const result = await runFallbackChain(userMessage, strategy, {
        generateLocal,
        apiKeys,
        conversationContext: conversationHistory.slice(-5),
      });
      response = result.response || result.error || 'I encountered an error. Can you rephrase that?';
    }

    // Step 4: Apply common sense thinking
    const commonSenseEnhanced = enhanceWithCommonSense(userMessage, response);
    const commonSenseInsight = formatCommonSenseInsight(commonSenseEnhanced);

    // Step 5: Add personality and emojis
    const personalityEnhanced = enhanceWithPersonality(response, userMessage, {
      professionalism: userProf?.preferences?.professionalism || 0.5,
      mentorship: userProf?.preferences?.mentorship || 0.5,
    });

    // Step 6: Score confidence and add self-awareness
    const confidence = scoreConfidence(userMessage, personalityEnhanced, userContext);
    const selfAwareResponse = formatWithSelfAwareness(personalityEnhanced, userMessage, confidence.confidence);

    // Step 7: Add proactive suggestions
    const nextSteps = suggestNextStep(userMessage, userContext);
    const warnings = proactiveWarnings(userMessage, userContext);

    // Step 8: Combine everything
    let finalResponse = selfAwareResponse;

    // Add common sense insights if high priority
    if (commonSenseInsight) {
      finalResponse += commonSenseInsight;
    }

    // Add warnings if critical
    if (warnings.length > 0) {
      for (const warning of warnings.filter((w) => w.severity === 'high').slice(0, 1)) {
        finalResponse += `\n\n⚠️ ${warning.message}\n*${warning.why}*\n💡 ${warning.suggestion}`;
      }
    }

    // Add proactive next steps
    if (nextSteps.length > 0) {
      finalResponse += `\n\n💭 **Before we continue...**\n${nextSteps[0].question}\n*${nextSteps[0].why}*`;
    }

    // Step 9: Save to memory
    if (conversationId) {
      await saveMessage(
        {
          role: 'user',
          text: userMessage,
          timestamp: new Date(),
          confidence: confidence.confidence,
        },
        conversationId,
      );

      await saveMessage(
        {
          role: 'assistant',
          text: finalResponse,
          timestamp: new Date(),
          model: strategy.route[0],
          quality: confidence.confidence,
        },
        conversationId,
      );
    }

    return {
      response: finalResponse,
      thinking: {
        strategy,
        confidence: confidence.confidence,
        commonSense: commonSenseEnhanced,
        isUncertain: confidence.isUncertain,
        warnings: warnings.length,
        suggestions: nextSteps.length,
      },
      metadata: {
        model: strategy.route[0],
        latency: strategy.expectedLatency,
        userContext,
      },
    };
  } catch (error) {
    console.error('AAS generation error:', error);
    return {
      response: `I encountered an error: ${error.message || 'Unknown error'}. Can you try again?`,
      thinking: { error: error.message },
      metadata: { model: 'ERROR' },
    };
  }
}

/**
 * Format thinking process for display
 * Shows user how AI arrived at the answer (transparency)
 */
export function formatThinkingProcess(thinking, detail = false) {
  if (!detail) {
    return null; // Hide thinking by default
  }

  let display = '🧠 **How I thought about this:**\n\n';

  if (thinking.strategy) {
    const { complexity, category, route } = thinking.strategy;
    display += `**Problem Type:** ${category} (complexity ${complexity}/10)\n`;
    display += `**Model Used:** ${route[0]}\n\n`;
  }

  if (thinking.commonSense?.thinkingProcess) {
    display += '**Reasoning:**\n';
    for (const thought of thinking.commonSense.thinkingProcess) {
      if (thought.type === 'false_dilemma_detected') {
        display += `• Detected possible false dilemma\n`;
      } else if (thought.type === 'assumption_questioned') {
        display += `• Questioned assumption: "${thought.assumption}"\n`;
      } else if (thought.type === 'lateral_solutions') {
        display += `• Found ${thought.solutions.length} alternative approaches\n`;
      }
    }
  }

  if (thinking.confidence !== undefined) {
    const emoji = thinking.confidence >= 80 ? '✅' : thinking.confidence >= 60 ? '⚠️' : '❓';
    display += `\n**Confidence:** ${emoji} ${thinking.confidence}/100\n`;
  }

  return display;
}

/**
 * Format common sense insights for display
 */
function formatCommonSenseInsight(enhancement) {
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
        insight += `💡 **Try this instead:** ${thought.reframe}\n`;
      } else if (thought.type === 'lateral_solutions') {
        insight += `🎯 **Other options to consider:**\n`;
        for (const sol of thought.solutions) {
          insight += `   • ${sol.idea}\n`;
        }
      }
    }
  }

  return insight;
}

/**
 * Create conversation session - initializes AAS for new chat
 */
export async function initializeAASSession(userId, preferences = {}) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  return {
    sessionId,
    userId,
    startTime: new Date(),
    preferences: {
      showThinking: preferences.showThinking || false,
      personality: preferences.personality || 'helpful', // helpful, analytical, creative, mentor
      professionalism: preferences.professionalism || 0.5,
      mentorship: preferences.mentorship || 0.5,
    },
    conversationHistory: [],
  };
}

/**
 * Process user message through full AAS pipeline
 */
export async function processMessage(userMessage, session, options = {}) {
  const { generateLocal, apiKeys = {} } = options;

  // Generate response
  const aasResponse = await generateAASResponse(userMessage, {
    conversationId: session.sessionId,
    conversationHistory: session.conversationHistory,
    userSettings: { openaiKey: apiKeys.openai, googleKey: apiKeys.google },
    userProfile: { id: session.userId, preferences: session.preferences },
    generateLocal,
    apiKeys,
  });

  // Update session history
  session.conversationHistory.push({
    role: 'user',
    text: userMessage,
    timestamp: new Date(),
  });

  session.conversationHistory.push({
    role: 'assistant',
    text: aasResponse.response,
    timestamp: new Date(),
    thinking: aasResponse.thinking,
  });

  return {
    response: aasResponse.response,
    thinking: session.preferences.showThinking ? formatThinkingProcess(aasResponse.thinking, true) : null,
    metadata: aasResponse.metadata,
  };
}

/**
 * Get conversation summary for context
 */
export async function getConversationSummary(conversationId, limit = 5) {
  const conversation = await getConversation(conversationId);
  if (!conversation || !conversation.messages) {
    return null;
  }

  const recent = conversation.messages.slice(-limit);
  const topics = new Set();
  const questions = [];

  for (const msg of recent) {
    if (msg.role === 'user') {
      // Extract main topic
      const text = msg.text.toLowerCase();
      if (/code|javascript|python|function|debug/i.test(text)) topics.add('coding');
      if (/help|understand|explain/i.test(text)) topics.add('learning');
      if (/how|what|why/i.test(text)) questions.push(msg.text.slice(0, 50));
    }
  }

  return {
    conversationId,
    messageCount: conversation.messages.length,
    topics: Array.from(topics),
    recentQuestions: questions.slice(-3),
  };
}

export default {
  generateAASResponse,
  initializeAASSession,
  processMessage,
  getConversationSummary,
  formatThinkingProcess,
};
