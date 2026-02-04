# AAS Module Map & Function Reference

## 🧠 Core Thinking Modules

### aiCommonSenseEngine.js (348 lines)
**Purpose:** Lateral thinking, non-obvious solutions, handbrakes

**Key Functions:**
- `detectFalseDilemma(question)` → {isFalseDilemma, type}
  - Finds binary traps where user thinks they have only 2 options
  
- `questionPremise(question)` → {questionedAssumption, assumption, reframe}
  - Challenges underlying assumptions
  
- `findHandbrake(question, context)` → {hasHandbrake, solutions[]}
  - Non-obvious solutions to stated problem
  
- `detectContext(message)` → "category" 
  - Detects topic: greetings, coding, math, learning, etc.
  
- `enhanceWithCommonSense(response, userMessage, personality)` → enhanced response

**Example Usage:**
```javascript
import { findHandbrake } from './aiCommonSenseEngine.js';

const solutions = findHandbrake("How do I make money fast?");
// Returns: avoid spending, automate, delegate, MVP approach, etc.
```

---

### aiProactiveSuggestions.js (326 lines)
**Purpose:** Anticipate needs, suggest next steps, warn about common mistakes

**Key Functions:**
- `analyzeUserContext(conversationHistory)` → {topics[], expertise, pace}
  - Learns from conversation what user is doing
  
- `suggestNextStep(lastQuestion, context)` → [{type, question, why}]
  - What should they ask next?
  
- `identifyUnaskedQuestions(history, currentTopic)` → [{question, gap}]
  - Critical questions they haven't asked yet
  
- `proactiveWarnings(userMessage, context)` → [{severity, message, why, suggestion}]
  - Catch mistakes before they happen
  
- `suggestCompoundingHabits(goal)` → {habits[], insight}
  - Small daily habits that compound (not big goals)
  
- `suggestResources(topic)` → {resources[]}
  - What tools, people, communities might help

**Example Usage:**
```javascript
import { proactiveWarnings } from './aiProactiveSuggestions.js';

const warns = proactiveWarnings("Deploying to production tomorrow", {pace: 'fast'});
// Returns: Testing warnings, estimation warnings, prevention suggestions
```

---

### aiSelfAwareness.js (372 lines)
**Purpose:** Honest uncertainty, validation, meta-reasoning about own answers

**Key Functions:**
- `scoreConfidence(question, answer, context)` → {confidence: 0-100, isUncertain, shouldQualify}
  - How sure is AI about this answer?
  
- `detectGuessing(answer)` → {isGuessing, patterns[], hasContradictions}
  - When is the AI just guessing vs actually sure?
  
- `suggestAnswerImprovement(question, answer)` → [{category, suggestion, improved}]
  - How could this answer be better?
  
- `validateAssumptions(answer)` → [{pattern, assumption, caution}]
  - What's assumed that shouldn't be?
  
- `generateHonestQualifier(confidence, question)` → "qualifier string"
  - Appropriate disclaimer based on confidence
  
- `requestContextualInfo(question)` → {needsContext, questions[]}
  - What info does AI need to answer properly?
  
- `suggestVerification(question, answer)` → [{type, suggestion, why}]
  - How can user verify this answer is correct?
  
- `formatWithSelfAwareness(answer, question, confidence)` → enhanced answer
  - Combine all above into final response

**Example Usage:**
```javascript
import { scoreConfidence } from './aiSelfAwareness.js';

const conf = scoreConfidence("What is X?", myAnswer, {});
if (conf.confidence < 60) {
  console.log("This answer might be wrong, verify it");
}
```

---

## 🔧 Core System Modules

### aiMemorySystem.js (374 lines)
**Purpose:** Conversation history, user profiles, persistent storage

**Key Functions:**
- `saveMessage(message, conversationId)` → {success}
  - Store user/AI message with metadata
  
- `getAllConversations()` → [conversations]
  - List all past conversations
  
- `getConversation(id)` → {messages[], metadata}
  - Load full conversation
  
- `getRecentMessages(count, conversationId)` → [messages]
  - Last N messages for context
  
- `saveUserProfile(key, value)` → {success}
  - Store user data (preferences, topics, etc.)
  
- `getUserProfile(userId)` → {profile}
  - Get stored user data
  
- `getFullUserProfile()` → {full profile with analysis}
  - Complete user understanding
  
- `analyzeUserBehavior()` → {topics, tone, activity_times}
  - Extract patterns from conversations
  
- `getPersonalizedGreeting()` → "greeting with context"
  - Time-aware, personalized greeting

**Storage:** IndexedDB with stores:
- conversations (messages with timestamps)
- userProfile (preferences, learned data)
- memories (facts about user)

---

### aiSearchSolver.js (267 lines)
**Purpose:** Internet search, problem solving, information lookup

**Key Functions:**
- `searchInternet(query, apiKey)` → {results[], sources[]}
  - Search web via Google Gemini
  
- `solveSimpleMath(expression)` → {result, steps}
  - Local arithmetic: 2+2, 5*3, etc. (no API needed)
  
- `solveComplexMath(problem, apiKey)` → {result, steps, explanation}
  - Gemini for: calculus, algebra, advanced math
  
- `lookupInformation(topic, apiKey)` → {answer, sources}
  - Topic research via Gemini
  
- `getSourcesAndLinks(topic, apiKey)` → [{url, title, relevance}]
  - Fetch relevant URLs for verification
  
- `solveProblem(message, apiKey)` → {solution, type, method}
  - Smart router: detects problem type, routes appropriately
  
- `isMathProblem(text)` → boolean
  - Is this a math question?

---

### aiDashboardIntegration.js (290 lines)
**Purpose:** Read/modify dashboard state, settings, widgets via AI

**Key Functions:**
- `getDashboardState()` → {theme, widgets, layout, performance, accent}
  - Current dashboard configuration
  
- `describeDashboard()` → "natural language summary"
  - Describe dashboard in words
  
- `changeDashboardSetting(setting, value)` → {success, newValue}
  - Modify setting (theme, background, layout, etc.)
  
- `manageWidget(action, name)` → {success, widget}
  - Add/remove widgets
  
- `parseDashboardCommand(message)` → {action, setting, value}
  - Parse NLP: "make dark mode" → {action: 'set', setting: 'theme', value: 'dark'}
  
- `executeDashboardCommand(command)` → {success, result}
  - Execute parsed command
  
- `suggestDashboardImprovements()` → [suggestions]
  - AI-driven optimization based on usage

---

### aiPersonalityEnhancer.js (258 lines)
**Purpose:** Emojis, kaomojis, natural language, tone adaptation

**Key Functions:**
- `randomEmoji(category)` → "emoji"
  - Get random emoji from category (positive, thinking, coding, etc.)
  
- `randomKaomoji(category)` → "kaomoji"
  - Get kaomoji: ¯\_(ツ)_/¯, (´｡• ᵕ •｡`), etc.
  
- `detectContext(message)` → "context"
  - What's this message about? (happy, confused, coding, etc.)
  
- `addEmojis(response, context, personality)` → enhanced response
  - Add contextual emojis based on content
  
- `addKaomoji(response, context, personality)` → enhanced response
  - Add kaomoji for personality (casual mode only)
  
- `makeNatural(response, personality)` → more natural response
  - Replace formal language with casual (if low professionalism)
  
- `addEncouragement(response, personality)` → encouraged response
  - Add supportive language (if high mentorship)
  
- `getPersonalizedGreeting(userName, personality)` → greeting
  - Context-aware greeting based on time of day

**Emoji Library:** 100+ emojis organized by context
**Kaomoji Library:** 14 emotion categories

---

### aiApiBridge.js (254 lines)
**Purpose:** API calls with caching, rate-limit handling, fallback

**Key Functions:**
- `callOpenAI(prompt, apiKey, conversationContext)` → {response, model}
  - Call OpenAI with context
  
- `callGoogleGemini(prompt, apiKey, conversationContext)` → {response, model}
  - Call Google Gemini with context
  
- `runFallbackChain(question, strategy, options)` → {response, model, quality}
  - Try multiple models, use best result

**Features:**
- Response caching (1-hour TTL)
- 429 rate-limit detection and recovery
- Conversation context passed to APIs
- Fallback chain management
- Quality scoring per response

---

### aiRouter.js (367 lines)
**Purpose:** Question complexity analysis, model routing, quality scoring

**Key Functions:**
- `analyzeComplexity(question)` → {complexity: 0-10, category, shouldUsePremium}
  - SIMPLE: definitions, facts, spelling
  - MEDIUM: explanations, comparisons, how-to
  - COMPLEX: problem-solving, architecture
  
- `routeQuestion(question, userSettings)` → strategy
  - SIMPLE→LOCAL, MEDIUM→Google, COMPLEX→OpenAI
  
- `scoreResponseQuality(response, question)` → 0-10 score
  - Quality evaluation of any response
  
- `isResponseQualityAcceptable(response, question, model)` → boolean
  - Does this response meet the threshold?
  
- `markRateLimited(api, retrySeconds)` → void
  - Mark API as rate-limited with cooldown
  
- `isRateLimited(api)` → boolean
  - Is this API currently unavailable?
  
- `getModelPriority(availableModels)` → [models]
  - Best-first ordering, skip rate-limited
  
- `generateThinkingProcess(question, strategy, responseData)` → thinking object
  - Human-readable explanation of reasoning

---

### aiIntegration.js (300 lines)
**Purpose:** Orchestrates all systems, full request→response pipeline

**Key Functions:**
- `generateAASResponse(userMessage, options)` → {response, thinking, metadata}
  - Main entry point - full AI thinking pipeline
  - Combines all systems:
    1. Analyze context
    2. Route question
    3. Generate response
    4. Apply common sense
    5. Add personality
    6. Self-awareness check
    7. Add proactive suggestions
    8. Save to memory
  
- `initializeAASSession(userId, preferences)` → session object
  - Start new conversation session
  
- `processMessage(userMessage, session, options)` → {response, thinking}
  - Process message, update session, return result
  
- `getConversationSummary(conversationId, limit)` → summary
  - Summarize recent conversation
  
- `formatThinkingProcess(thinking, detail)` → display string
  - Human-readable thinking explanation

---

## 🔄 Integration Example

```javascript
// 1. Import everything
import { initializeAASSession, processMessage } from './aiIntegration.js';

// 2. Create session
const session = await initializeAASSession('user1', {
  personality: 'mentor',
  professionalism: 0.4,
  mentorship: 0.8,
  showThinking: true
});

// 3. Process message
const result = await processMessage('How do I learn React?', session, {
  generateLocal: yourLocalFunction,
  apiKeys: { google: key1, openai: key2 }
});

// 4. Use result
console.log(result.response);  // Full AI response with all enhancements
console.log(result.thinking);   // (Optional) Thinking process
```

---

## 🎯 Which Module to Use

| Need | Module | Function |
|------|--------|----------|
| Common sense/handbrakes | aiCommonSenseEngine | findHandbrake, questionPremise |
| Next step suggestions | aiProactiveSuggestions | suggestNextStep, proactiveWarnings |
| Confidence scoring | aiSelfAwareness | scoreConfidence, formatWithSelfAwareness |
| Memory/history | aiMemorySystem | saveMessage, getConversation |
| Internet search | aiSearchSolver | searchInternet, solveProblem |
| Dashboard control | aiDashboardIntegration | getDashboardState, changeSetting |
| Emojis/personality | aiPersonalityEnhancer | enhanceWithPersonality, randomEmoji |
| API calls | aiApiBridge | runFallbackChain, callGoogleGemini |
| Routing | aiRouter | routeQuestion, analyzeComplexity |
| Everything | aiIntegration | generateAASResponse, processMessage |

---

## 📊 Data Flow

```
User Message
    ↓
aiIntegration.generateAASResponse()
    ├─ analyzeUserContext() [aiProactiveSuggestions]
    ├─ routeQuestion() [aiRouter]
    ├─ runFallbackChain() [aiApiBridge]
    ├─ enhanceWithCommonSense() [aiCommonSenseEngine]
    ├─ enhanceWithPersonality() [aiPersonalityEnhancer]
    ├─ formatWithSelfAwareness() [aiSelfAwareness]
    ├─ suggestNextStep() [aiProactiveSuggestions]
    ├─ proactiveWarnings() [aiProactiveSuggestions]
    ├─ saveMessage() [aiMemorySystem]
    └─ Return Enhanced Response
         ↓
User sees: Response + Thinking + Suggestions + Warnings
```

---

**All 11 modules working together = A truly thinking AI 🧠**
