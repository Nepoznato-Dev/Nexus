<!-- F.L.U.X -> RAZONET Core Architecture -->

# F.L.U.X & RAZONET Layered Intelligence System

## Core System Architecture — Full Specification

---

## Executive Summary

**RAZONET (Reasoning, Analysis, and Zero-latency Orchestrated Nexus Execution Toolkit):**  
The primary internal heavy-lifter and structural core. Operates **locally without servers or APIs**, ensuring total privacy and adapting entirely to the user's workflow.

**F.L.U.X. (Fast Logic & URL eXtraction):**  
The high-speed external gateway and "Scout". Functions like a Brave-style browser - scrubbing ads, bypassing noise, and extracting raw logical data from URLs before passing it to RAZONET for processing.

**High-Density Context (NotebookLM Method):**  
Manages 70,000–85,000 words of context without hallucinations by searching source material for relevant facts rather than guessing.

**Local Mastery & Adaptive Growth:**  
Handles its own performance monitoring and can cull itself — letting a simpler process monitor the site until resources stabilize before waking back up.

---

## Architecture Layers

### Layer 1: F.L.U.X. (External Gateway & Scout)

**Role:** High-speed URL handling, web scrubbing, and Complexity Tag generation  
**UI Placement:** Quick Ask / browser-facing entry layer  

- Functions like a Brave-style browser — scrubs ads, bypasses "crap", extracts raw logical content
- Extracts clean logical data from URLs and passes it to RAZONET.
- Generates **Complexity Tags** used by Auto Mode to pre-allocate core resources
- Acts as the fast gatekeeper - no noise reaches RAZONET's reasoning core

### Layer 2: RAZONET (Central Intelligence Core)

**Role:** Primary reasoning engine; local-first, private-first, adaptive  
**Architecture principle:** Cognitive Diversity — different module temperaments cross-reference perspectives to drop hallucinations

#### The RAZONET Tiered Hierarchy (Material Grades)

| Grade | Cores | Identity | Operation |
|-------|-------|----------|-----------|
| **TURBO** | 1 Core | The Sprinter | Straight-line execution: instant syntax checks, quick math, rapid code fixes |
| **LITE** | 1.5 Cores | The Assistant | Reviewer shadow-processor for quick common-sense checks + high fluidity |
| **PLUS** | 2 Cores | Stable Workhorse | Dual-Perspective Layering — two internal drafts generated and merged before delivery |
| **PRO** | 3–5 Cores Dynamic | The Council / The Assembly | Assesses complexity; 3 cores for standard complex tasks, up to 5 for Brain Teasers, advanced engineering, or collegiate math |

### Layer 3: S-Squad STMs (Secondary Thinking Modules)

Global, stateless worker modules recruited as a "Brain Trust" when RAZONET encounters logic traps or massive data drops. **Activate conditionally - only when the task demands it.**

| Module | Identity | Speciality |
|--------|----------|------------|
| **S1** | The Sprinter | Lightweight validator — instant syntax and mathematical verification to catch errors ASAP |
| **S2** | The Auditor | Slow, methodical researcher — step-by-step logic audits to find hidden tricks or confirm exactly why a solution is correct |
| **S3** | The Librarian | Context specialist — scans the 85k-word log for patterns, scrubs redundancies using xY notation (e.g., `Error_0x4 [x50]`), creates Summary Maps to anchor core brain focus |
| **S4** | The Architect | Mini-Pro module — structural optimization and refactoring raw data into clean, efficient blueprints |

---

## Specialized Operating Modes

### Data Computer Mode

Designed to handle NotebookLM-style 85k-word payloads. Uses the full S-Squad to convert massive, messy logs into persistent Sources for the main cores to reference rather than re-read raw.

### Coding Mode

Includes specialized features like **checkpointing** and **steering** to manage complex multi-file refactoring. Tracks state across edits to avoid context drift.

### Auto Mode *(Proposed)*

Intelligent master controller that gives the system 1–5 cores of freedom. Proactively allocates resources and recruits STMs based on Complexity Tags provided by F.L.U.X. during data intake. Self-monitors and culls load to maintain stability.

---

## Hallucination-Killer Protocols

### 1. Cognitive Diversity

Modules with different "temperaments" (fast Sprinter / methodical Auditor / holistic Librarian) cross-reference multiple perspectives. No single path produces the final answer unchallenged.

### 2. Source Anchoring

Secondary modules verify every claim by asking: *"Which line in the source data proves this?"*  
S3 Librarian anchors the core brain's focus using Summary Maps built from scrubbed logs.

### 3. Consensus Merging

In multi-core modes (Plus and Pro), internal drafts must be **merged and pruned** of redundant or conflicting information before a response is solidified. No draft reaches the user unverified.

---

## Query Flow

```text
User Types Question
  │
  ├─→ [F.L.U.X. Scout]
  │     ├─→ If external URL/web request: scrub, extract logic, attach Complexity Tag
  │     └─→ Pass clean input to RAZONET.
  │
  ├─→ [RAZONET Core]
  │     ├─→ inferTaskProfile() — classify: factual / coding / planning / data
  │     ├─→ buildThoughtPipeline() — set activation plan + output contract
  │     ├─→ executeSTMModules() — recruit S1/S2/S3/S4 only if needed
  │     │     ├─→ S1 Sprinter: syntax + math scan
  │     │     ├─→ S2 Auditor: logic audit + assumption check
  │     │     ├─→ S3 Librarian: log scrub + summary map
  │     │     └─→ S4 Architect: structure + blueprint refactor
  │     ├─→ buildModelPrompt() — inject STM notes + output contract
  │     └─→ generateResponse() — apply mode grade execution rules
  │
  └─→ [User sees final answer]
      ├─→ Transparency Panel: source, mode, active tools, module notes + artifacts
      └─→ If wants to continue: full RAZONET chat with history
          └─→ [Handoff Payload Created]
              ├─→ Original question
              ├─→ Quick Ask response
              ├─→ Source (F.L.U.X or RAZONET)
              ├─→ Confidence score
              └─→ [RAZONET Chat App Opens with Context]
                  └─→ Now conversation IS saved to IndexedDB
                  └─→ User can ask follow-ups
                  └─→ RAZONET maintains history and adjusts based on context
```

---

## Silent Escalation (No User Visibility)

### S.P.A.R.K -> RAZONET Flow

**When S.P.A.R.K calls `queryDirect()`:**

1. S.P.A.R.K recognizes it's stuck or complexity is too high
2. Internally calls: `await queryDirect(userMessage, userName, {generateLocal, apiKeys, conversationHistory})`
3. RAZONET processes the query (routing, reasoning, confidence scoring)
4. **CRITICAL: Response is NOT saved to memory**
5. User sees only the final answer in Quick Ask UI

**What the user sees:**

- Quick Ask popup appears with answer
- No indication of escalation
- No history entry created
- Just a direct, helpful response

**S.P.A.R.K Escalation Triggers:**

```javascript
// Immediate escalation (before attempting answer)
- Advanced math: "integral", "differential", "calculus", "fourier"
- Quantum physics: "superposition", "entanglement", "schrödinger"
- Deep architecture: "consensus algorithms", "distributed systems"
- Advanced code: "compiler design", "bytecode", "memory management"

// Post-attempt escalation (low confidence)
- Response confidence < 60%
- Response contains: "I don't know", "I can't", errors
- Response length anomalies (< 10 words or > 150 words)
```

---

## Explicit Handoff (With History)

### When User Clicks "Continue in RAZONET Chat"

**Handoff Payload Structure:**

```javascript
{
  handoffId: "handoff_1709123456789_a1b2c3d4",
  timestamp: 1709123456789,
  sourceAgent: "SPARK",                        // Always SPARK from Quick Ask
  originalUserQuery: "Solve x³ + y³ + z³ = 42",
  sparkSource: "RAZONET",                      // Was escalated to RAZONET
  sparkResponse: "Hi {username}, I see your..." // The answer from Quick Ask
  sparkConfidence: 87,                         // Confidence of S.P.A.R.K's chosen answer
  routeReason: "S.P.A.R.K escalated due to complexity",
  metadata: {
    complexity: 7.5,
    category: "COMPLEX",
    model: "OPENAI",
    timestamp: 1709123456789
  }
}
```

**Handoff Validation:**

- Payload expires after 10 minutes (prevents stale context)
- Checked via `isHandoffValid(payload)`

**In RAZONET Chat App:**

1. Context chip shown: displays original query + Quick Ask answer
2. User can edit-before-send (optional, for power users)
3. Conversation thread starts with:
   - Original: "Solve x³ + y³ + z³ = 42"
   - Quick Ask answer (for context)
   - User's follow-up: "Can you show more steps?"
4. **Now conversation IS saved to IndexedDB** (permanent history)
5. RAZONET maintains conversation context for follow-ups

---

## Personalization in Responses

### S.P.A.R.K Quick Answers

S.P.A.R.K keeps responses brief and direct:

```text
"To solve x³ + y³ + z³ = 42:
These are Diophantine equations... [algebra steps]"
```

### RAZONET queryDirect Responses (Escalated)

RAZONET personalizes with adaptive greeting:

```text
"Hi {username}, I see your math problem and I'll help by breaking this down step-by-step.

[Detailed reasoning]"
```

**Personalization Rules in `queryDirect()`:**

```javascript
// Detects issue type from message
- "error|bug|debug" → "I see your problem"
- "explain|how|why" → "I see your question"  
- "code|function|implement" → "I see your coding challenge"
- "math|solve|equation" → "I see your math problem"

// Confidence-aware tone
- confidence ≥ 70%: "Hi {user}! I see your issue and I'll help by explaining clearly."
- confidence < 70%: "Hi {user}, I see your issue. Let me work through this with you:"
```

### Critical: No Premade Templates

- RAZONET detects the specific problem type from content
- Generates fresh, adaptive responses (not "Here are 5 ways to...")
- Each response feels contextual and personal
- Never "canned" or templated greetings

---

## Code Integration Map

### Files Modified/Created

**1. `aiIntegration.js` (Modified)**

- Added `queryDirect(userMessage, userName, options)` method
- Runs full RAZONET pipeline but **skips `saveMessage()`**
- Returns response without thinking/metadata (streamlined for Quick Ask)
- Added `detectIssueFromMessage()` for personalized greetings

**2. `sparkQueryEngine.js` (New)**

- Main entry point: `processQuickAsk(userMessage, userName, options)`
- Exports: `createHandoffPayload()`, `isHandoffValid()`
- Implements escalation logic:
  - `shouldEscalateImmediately()`: Pre-checks complexity
  - `sparkAttemptAnswer()`: S.P.A.R.K tries to answer
  - `evaluateSparkResponse()`: Quality check
  - `escalateToIRIS()`: Calls `queryDirect()` if needed

**3. `aiRouter.js` (No changes needed)**

- Already has complexity analysis and routing logic
- Used by both S.P.A.R.K and RAZONET

**4. `aiMemorySystem.js` (No changes needed)**

- Existing memory persistence
- Used only when `saveMessage()` is called (skipped in `queryDirect()`)

---

## Quick Ask UI Component (To Be Built)

**Location:** Start popup / quick search  
**Entry Point:** Input field with instant suggestions

```jsx
<QuickAskComponent>
  <input 
    placeholder="Ask S.P.A.R.K anything..." 
    onInput={handleQuickAsk} 
  />
  
  {result && (
    <div className="quick-ask-result">
      <div className="answer">{result.response}</div>
      
      <div className="source-badge">
        {result.source === 'SPARK' ? '⚡ S.P.A.R.K' : '🧠 RAZONET'}
        Confidence: {result.confidence}%
      </div>
      
      <button 
        onClick={() => openIRISChat(result)}
      >
        Continue in RAZONET Chat ->
      </button>
    </div>
  )}
</QuickAskComponent>
```

**Behavior:**

- Shows which agent answered (S.P.A.R.K or RAZONET)
- Displays confidence level
- "Continue in RAZONET Chat" button creates handoff payload
- No history visible in Quick Ask (lightweight UI)

---

## RAZONET Chat App (To Be Built)

**Location:** New desktop app  
**Entry Points:**

1. "Continue in RAZONET Chat" from Quick Ask
2. Direct app launch = empty session or resume previous
3. Import conversation from other apps

**Architecture:**

```text
IrisChatApp
├─ ConversationList (sidebar)
│  ├─ Create new
│  ├─ Resume existing
│  └─ Search/filter
├─ ChatThread (main area)
│  ├─ ContextChip (shows Quick Ask context when opened from Quick Ask)
│  ├─ MessageList
│  │  ├─ User messages
│  │  └─ RAZONET responses with thinking (optional)
│  └─ InputBox + Send
├─ Settings
│  ├─ Toggle thinking display
│  ├─ Personality settings
│  └─ Memory management
```

**When opened from Quick Ask with handoff:**

1. Show context chip: "Quick Ask via S.P.A.R.K | [Original Q] | [Answer]"
2. Load handoff in chat input (optional edit-before-send)
3. User sends → conversation saved to IndexedDB
4. Follow-ups maintain context

**When opened directly:**

1. Show conversation list
2. User picks existing OR create new
3. Fresh RAZONET Chat session (no Quick Ask context)

---

## Performance Considerations

### Silent Escalation (S.P.A.R.K -> RAZONET queryDirect)

- **No history save** = no IndexedDB write latency
- Response appears fast in Quick Ask UI
- Minimal context passed to RAZONET (conversationHistory.slice(-3))
- No multi-step reasoning display (just the answer)

### Handoff to RAZONET Chat

- Payload size capped at ~4KB
- Stripped of verbose logs/metadata
- Expires after 10 minutes (garbage collection)
- Chat only loads on demand (not in Quick Ask)

### Memory Discipline

- Quick Ask = stateless (no conversation stored)
- RAZONET Chat = persistent (full history in IndexedDB)
- Performance manager monitors and applies feature flags if RAM low

---

## Summary: Two Truths About The System

1. **S.P.A.R.K is not a scared gatekeeper.** It's genuinely capable (ChatGPT 3.5 Turbo and lower level). It only escalates when it actually determines the answer is inadequate or the problem requires RAZONET's deeper reasoning (ChatGPT 5-mini to 4.1).

2. **Silent escalation is invisible to the user.** When S.P.A.R.K calls RAZONET internally, the user just sees a good answer. No history created. Only when the user explicitly clicks "Continue in RAZONET Chat" does the conversation become permanent.

---

## Next Implementation Steps

1. **Quick Ask UI Component** — Input field in Start popup, calls `sparkQueryEngine.processQuickAsk()`
2. **Quick Ask Result Display** — Show answer with source badge + continue button
3. **Handoff Modal** - "Continue in RAZONET Chat" flow with context chip
4. **RAZONET Chat App** - Conversation list + thread UI with memory persistence
5. **Feature Flag Integration** — Wire `irisFeatureFlags.js` to disable chat under load
