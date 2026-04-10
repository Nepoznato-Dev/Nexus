import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, BookOpen, Calculator, FileText, Code, AlertCircle, Search, Users, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import GlassCard from '../UI/GlassCard.js';
import { Input } from '../UI/input.js';
import { storage } from '../Storage/clientStorage.js';
import { generateSearchEnhancedResponse } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/IRISSearch.js';
import { isHandoffValid } from '../F.L.U.X. - Fast Logic & URL eXtraction/sparkQueryEngine.js';
import { runParallelDiagnostics } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/collaborativeDiagnostics.js';

const RAZONET_HANDOFF_EVENT = 'nexus:razonet-handoff-ready';
const LEGACY_IRIS_HANDOFF_EVENT = 'nexus:iris-handoff-ready';
const RAZONET_HANDOFF_SESSION_KEY = 'nexus_razonet_handoff';
const LEGACY_IRIS_HANDOFF_SESSION_KEY = 'nexus_iris_handoff';

export default function AIHelper({ accentColor = '#a55eea' }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState('explain'); // explain, solve, summarize, code
  const [aiSettings, setAiSettings] = useState(null);
  const [error, setError] = useState('');
  const [handoffContext, setHandoffContext] = useState(null);
  const [contextApplied, setContextApplied] = useState(false);
  const [collaborativeReport, setCollaborativeReport] = useState(null);
  const [isCollaborativeMode, setIsCollaborativeMode] = useState(false);
  const [showThinkingProcess, setShowThinkingProcess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await storage.loadSettings();
      setAiSettings(settings?.aiTools);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const inferModeFromText = (text) => {
      if (!text) return 'explain';
      const lower = text.toLowerCase();
      if (/code|function|javascript|python|debug|api|algorithm/.test(lower)) return 'code';
      if (/solve|equation|algebra|math|calculate|integral|derivative/.test(lower)) return 'solve';
      if (/summary|summarize|overview|tl;dr/.test(lower)) return 'summarize';
      return 'explain';
    };

    const consumeHandoff = (payload) => {
      if (!payload || !isHandoffValid(payload)) return;

      setHandoffContext(payload);
      setContextApplied(false);
      setMode(inferModeFromText(payload.originalUserQuery));

      if (payload.originalUserQuery) {
        setQuery(payload.originalUserQuery);
      }

      if (payload.sparkResponse) {
        setResponse(payload.sparkResponse);
      }

      setError('');
      sessionStorage.removeItem(RAZONET_HANDOFF_SESSION_KEY);
      sessionStorage.removeItem(LEGACY_IRIS_HANDOFF_SESSION_KEY);
    };

    try {
      const raw = sessionStorage.getItem(RAZONET_HANDOFF_SESSION_KEY) || sessionStorage.getItem(LEGACY_IRIS_HANDOFF_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        consumeHandoff(parsed);
      }
    } catch {
      sessionStorage.removeItem(RAZONET_HANDOFF_SESSION_KEY);
      sessionStorage.removeItem(LEGACY_IRIS_HANDOFF_SESSION_KEY);
    }

    const handleHandoffEvent = (event) => {
      consumeHandoff(event?.detail);
    };

    window.addEventListener(RAZONET_HANDOFF_EVENT, handleHandoffEvent);
    window.addEventListener(LEGACY_IRIS_HANDOFF_EVENT, handleHandoffEvent);
    return () => {
      window.removeEventListener(RAZONET_HANDOFF_EVENT, handleHandoffEvent);
      window.removeEventListener(LEGACY_IRIS_HANDOFF_EVENT, handleHandoffEvent);
    };
  }, []);

  const modes = [
    { id: 'explain', label: 'Explain', icon: BookOpen },
    { id: 'solve', label: 'Solve', icon: Calculator },
    { id: 'summarize', label: 'Summarize', icon: FileText },
    { id: 'code', label: 'Code Help', icon: Code },
  ];

  const generateResponse = (query, mode) => {
    const variations = {
      explain: [
        `Great question about "${query}"! Let me break this down for you:\n\n1. **Key Concept**: This topic involves understanding the fundamental principles.\n\n2. **Step-by-Step Breakdown**:\n   - Start by identifying what we know\n   - Consider how the parts relate to each other\n   - Apply the core principle\n\n3. **Example**: Think of it in a real-world context to see how it applies.\n\nDoes this help clarify the concept? Would you like me to explain any part in more detail?`,
        `Understanding "${query}" is essential! Here's the breakdown:\n\n**The Basics**: At its core, this concept means...\n\n**Why It Matters**: This is important because:\n- It helps you understand related topics\n- It has real-world applications\n- It builds your foundational knowledge\n\n**Visual Way to Think About It**: Imagine...\n\n**Key Takeaway**: Remember that the main idea is... Does that make sense?`,
        `Let me explain "${query}" in a way that clicks!\n\n**Simple Definition**: In plain terms, it's...\n\n**The Process**: Here's how it works:\n1. First, understand...\n2. Then, consider...\n3. Finally, apply...\n\n**Common Misconception**: People often think... but actually...\n\n**Practice It**: Try applying this concept to... What do you notice?`
      ],
      solve: [
        `I'd like to help you solve "${query}"! Here's how to think about it:\n\n1. **Understand the Problem**: What information are you given? What are you trying to find?\n\n2. **Choose a Strategy**: \n   - Identify what methods might apply\n   - Think about what you've learned that relates to this\n\n3. **Work Through It**:\n   - Set up your approach\n   - Take it step-by-step\n   - Check your work\n\n4. **Verify**: Does your answer make sense in context?\n\nWhat part are you finding tricky? I'm here to guide you!`,
        `Let's tackle "${query}" together! Here's a winning strategy:\n\n**Step 1 - Analyze**: What do you know? What do you need to find?\n\n**Step 2 - Plan**: Which method works best?\n\n**Step 3 - Execute**: \n- Work carefully\n- Show each step\n- Double-check your logic\n\n**Step 4 - Reflect**: Is your answer reasonable?\n\nTry starting with Step 1 - tell me what you have and what you need!`,
        `Ready to solve "${query}"?\n\n**The Key Strategy**:\n- Break it into smaller parts\n- Solve each part\n- Combine your results\n\n**Common Tools**:\n- Look for patterns\n- Use what you know\n- Test your answer\n\n**A Helpful Tip**: Start by...\n\nGive it a try and tell me where you get stuck!`
      ],
      summarize: [
        `Here's a summary of "${query}":\n\n**Main Points**:\n• Key idea #1: This is important because...\n• Key idea #2: This connects to...\n• Key idea #3: Remember that...\n\n**Why This Matters**: Understanding these points helps you grasp the bigger picture.\n\n**Questions to Consider**: What role does each point play? How do they connect?\n\nFocus on remembering these key points, and the details will follow!`,
        `Quick summary of "${query}":\n\n**The Essentials**:\n✓ Main concept: ...\n✓ Key supporting idea: ...\n✓ Important detail: ...\n\n**Connection to Other Topics**: This relates to... because...\n\n**Remember**: The most critical point is...\n\n**Test Your Understanding**: Can you explain why each point matters?`,
        `Summary breakdown for "${query}":\n\n**Overview**: In essence...\n\n**The Three Big Ideas**:\n1. **First**: ...\n2. **Second**: ...\n3. **Third**: ...\n\n**How They Fit Together**: Each builds on the previous one to create...\n\n**Real-World Link**: You can see this in...\n\nWhich part would you like to dive deeper into?`
      ],
      code: [
        `Let me help you understand "${query}":\n\n**Concept Explanation**:\nThis is a fundamental programming concept that helps with code organization and clarity.\n\n**How It Works**:\n1. The basic structure involves...\n2. This approach benefits your code by...\n3. Common patterns include...\n\n**Best Practices**:\n- Write clear, readable code\n- Test your logic before running\n- Learn from errors\n\n**Try This**: Modify your code step-by-step and observe how it behaves. That's the best way to learn!\n\nNeed help with a specific part?`,
        `Helping with "${query}" - here's what you need to know:\n\n**The Principle**: Code is about...\n\n**Common Approaches**:\n- Method A: Good for...\n- Method B: Better when...\n- Method C: Most efficient when...\n\n**Code Quality Tips**:\n✓ Keep it simple\n✓ Make it readable\n✓ Test thoroughly\n\n**Challenge**: Try building... and see what happens!\n\nWhat specific aspect are you working on?`,
        `Let's tackle "${query}" in code!\n\n**What You Need to Know**:\n- This pattern helps with...\n- It makes code more...\n- It prevents...\n\n**Structure**:\nStart by... then... finally...\n\n**Example Scenario**: Use this approach when...\n\n**Pro Tip**: Watch out for... and remember to...\n\nWant to try implementing it? I'll help if you get stuck!`
      ]
    };

    const modeResponses = variations[mode] || variations.explain;
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  };

  const callRealAI = async (query, mode) => {
    if (!aiSettings || aiSettings.apiProvider === 'none' || !aiSettings.apiKey) {
      return {
        success: false,
        useTemplate: true,
        message: '💡 Tip: For better AI responses, configure an API key in Settings > AI Tools. Google Gemini is free!'
      };
    }

    const modePrompts = {
      explain: `Explain the following concept in a clear, educational way for a student: ${query}`,
      solve: `Help a student solve this problem by providing step-by-step guidance (don't give the answer directly): ${query}`,
      summarize: `Provide a concise summary of: ${query}`,
      code: `Explain this programming concept or help with this code question: ${query}`
    };

    const systemPrompt = `You are a helpful study assistant. Be encouraging, educational, and never do homework for students - guide them instead.`;

    try {
      let apiUrl, headers, body;

      if (aiSettings.apiProvider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.apiKey}`
        };
        body = JSON.stringify({
          model: aiSettings.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: modePrompts[mode] }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
      } else if (aiSettings.apiProvider === 'anthropic') {
        apiUrl = 'https://api.anthropic.com/v1/messages';
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': aiSettings.apiKey,
          'anthropic-version': '2023-06-01'
        };
        body = JSON.stringify({
          model: aiSettings.model || 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${modePrompts[mode]}` }
          ]
        });
      } else if (aiSettings.apiProvider === 'google') {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiSettings.model || 'gemini-pro'}:generateContent?key=${aiSettings.apiKey}`;
        headers = {
          'Content-Type': 'application/json'
        };
        body = JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${modePrompts[mode]}` }]
          }]
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI API Error:', errorData);
        return { success: false, error: `API Error: ${response.status}` };
      }

      const data = await response.json();

      let content;
      if (aiSettings.apiProvider === 'openai') {
        content = data.choices[0]?.message?.content;
      } else if (aiSettings.apiProvider === 'anthropic') {
        content = data.content[0]?.text;
      } else if (aiSettings.apiProvider === 'google') {
        content = data.candidates[0]?.content?.parts[0]?.text;
      }

      return { success: true, content };
    } catch (err) {
      console.error('AI API Call Failed:', err);
      return { success: false, error: err.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query.trim();

    // Build query with handoff context and mod environment if present
    let effectiveQuery = handoffContext && !contextApplied
      ? `[COLLABORATIVE DIAGNOSTIC MODE]
S.P.A.R.K's Initial Analysis:
Original question: ${handoffContext.originalUserQuery || ''}
S.P.A.R.K's findings: ${handoffContext.sparkResponse || ''}

${handoffContext.modEnvironment && handoffContext.modEnvironment.modCount > 0
        ? `\n[Mod Environment Data]:\n${handoffContext.modEnvironment.summary}\n`
        : ''}

Your task as RAZONET: Review S.P.A.R.K's diagnosis above. Then:
1. Identify what S.P.A.R.K got right (confirm findings)
2. Point out anything S.P.A.R.K missed or skipped
3. Provide additional insights from a different analytical angle
4. If you disagree with any conclusion, explain why

User's follow-up question: ${userQuery}

Approach this as a "second opinion" - complement S.P.A.R.K's work, don't just repeat it.`
      : userQuery;

    setIsLoading(true);
    setResponse('');
    setError('');

    // First, try RAZONET autonomous search for real-time info
    setIsSearching(true);
    const searchResult = await generateSearchEnhancedResponse(
      effectiveQuery,
      aiSettings?.personality || 'adaptive',
      aiSettings?.serpApiKey
    );
    setIsSearching(false);

    if (searchResult) {
      // RAZONET found relevant real-time information
      setResponse(searchResult);
      setIsLoading(false);
      return;
    }

    // Try to call real AI first if configured
    const aiResult = await callRealAI(effectiveQuery, mode);

    if (aiResult.success) {
      setResponse(aiResult.content);
      setContextApplied(true);
      setIsLoading(false);
    } else if (aiResult.useTemplate) {
      // No API configured, use template responses and show setup tip
      if (aiResult.message) {
        setError(aiResult.message);
        setTimeout(() => setError(''), 5000);
      }
      setTimeout(() => {
        const result = generateResponse(userQuery, mode);
        setResponse(result);
        setContextApplied(true);
        setIsLoading(false);
      }, 1500);
    } else {
      // API call failed, show error and fall back to template
      setError(`AI unavailable: ${aiResult.error || 'Unknown error'}`);
      setTimeout(() => {
        const result = generateResponse(userQuery, mode);
        setResponse(result);
        setContextApplied(true);
        setIsLoading(false);
        setTimeout(() => setError(''), 3000); // Clear error after 3s
      }, 1500);
    }
  };

  const handleCollaborativeDiagnostic = async () => {
    if (!query.trim()) return;

    const userQuery = query.trim();
    setIsLoading(true);
    setIsCollaborativeMode(true);
    setResponse('');
    setError('');
    setCollaborativeReport(null);

    try {
      const report = await runParallelDiagnostics(userQuery, {
        userName: 'User',
        apiKeys: {
          openai: aiSettings?.openaiApiKey,
          google: aiSettings?.googleApiKey,
        },
        generateLocal: null, // Could wire to local model if available
      });

      setCollaborativeReport(report);
      setResponse(report.unifiedReport);
      setContextApplied(true);
    } catch (error) {
      console.error('[Collaborative Diagnostic] Error:', error);
      setError(`Collaborative diagnostic failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "What's the Pythagorean theorem?",
    "Explain photosynthesis",
    "How do I solve quadratic equations?",
    "What caused World War I?"
  ];

  return (
    <GlassCard className="p-6" accentColor={accentColor} hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
        <h3 className="font-semibold text-white">AI Study Helper</h3>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {modes.map((m) => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === m.id
              ? 'text-white'
              : 'bg-white/5 text-white/50 hover:text-white/70'
              }`}
            style={{ backgroundColor: mode === m.id ? accentColor : undefined }}
          >
            <m.icon className="w-3 h-3" />
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-300">{error}</span>
        </div>
      )}

      {handoffContext && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-200">🤝 Collaborative Mode</span>
              <span className="text-xs text-purple-300/70">S.P.A.R.K + RAZONET</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setHandoffContext(null);
                setContextApplied(false);
              }}
              className="text-xs text-purple-200/70 hover:text-purple-200 transition-colors"
            >
              Clear context
            </button>
          </div>
          <p className="text-xs text-purple-100/80 line-clamp-2 mb-2">
            {handoffContext.originalUserQuery}
          </p>

          {/* Collaborative explanation */}
          <div className="text-xs text-purple-200/60 bg-purple-500/5 rounded px-2 py-1.5 mb-2">
            <span className="font-medium text-purple-200">How this works:</span> S.P.A.R.K provided initial analysis.
            RAZONET will now review it, confirm what's correct, catch missed details, and add different perspectives.
          </div>

          {/* 🔥 NEW: Display mod environment if present */}
          {handoffContext.modEnvironment && handoffContext.modEnvironment.modCount > 0 && (
            <div className="mt-2 pt-2 border-t border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-purple-200">
                  📦 {handoffContext.modEnvironment.modCount} Minecraft Mods Detected
                </span>
              </div>
              <p className="text-xs text-purple-100/70">
                {handoffContext.modEnvironment.minecraftVersions.join(', ')} • {handoffContext.modEnvironment.modLoaders.join(', ')}
              </p>
              {(handoffContext.modEnvironment.potentialIssues.hasMultipleLoaders ||
                handoffContext.modEnvironment.potentialIssues.hasMultipleMinecraftVersions) && (
                  <p className="text-xs text-orange-300 mt-1">
                    ⚠️ {handoffContext.modEnvironment.potentialIssues.hasMultipleLoaders && 'Multiple loaders detected! '}
                    {handoffContext.modEnvironment.potentialIssues.hasMultipleMinecraftVersions && 'Version mismatch detected!'}
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      {!response && !isLoading && (
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setQuery(prompt)}
                className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Response Area */}
      {(response || isLoading) && (
        <div className="mb-4 p-4 rounded-xl bg-white/5 min-h-[120px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-white/50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isCollaborativeMode ? 'Running parallel diagnostics...' : 'Thinking...'}</span>
              {isCollaborativeMode && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span>S.P.A.R.K analyzing...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    <span>RAZONET analyzing...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {collaborativeReport && (
                <div className="mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-purple-200">Collaborative Diagnostic Results</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
                      <div className="text-green-300 font-medium">✅ Confirmed</div>
                      <div className="text-white/60">{collaborativeReport.confirmedByBoth?.length || 0} issues</div>
                    </div>
                    <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                      <div className="text-blue-300 font-medium">🔵 S.P.A.R.K</div>
                      <div className="text-white/60">{collaborativeReport.sparkOnly?.length || 0} unique</div>
                    </div>
                    <div className="bg-purple-500/10 rounded p-2 border border-purple-500/20">
                      <div className="text-purple-300 font-medium">🟣 RAZONET</div>
                      <div className="text-white/60">{collaborativeReport.irisOnly?.length || 0} unique</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-white/40">
                    Total: {collaborativeReport.totalIssuesFound || 0} issues found •
                    Analyzed in {((collaborativeReport.metadata?.totalTime || 0) / 1000).toFixed(1)}s
                  </div>

                  {/* Thinking Process Dialogue */}
                  {collaborativeReport.dialogue && collaborativeReport.dialogue.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setShowThinkingProcess(!showThinkingProcess)}
                        className="flex items-center gap-2 text-xs text-purple-200 hover:text-purple-100 transition-colors w-full"
                      >
                        {showThinkingProcess ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">View Thinking Process</span>
                        <span className="text-white/40">({collaborativeReport.dialogue.length} exchanges)</span>
                      </button>

                      <AnimatePresence>
                        {showThinkingProcess && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 space-y-2 overflow-hidden"
                          >
                            {collaborativeReport.dialogue.map((exchange, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg text-xs ${exchange.agent === 'SPARK'
                                  ? 'bg-blue-500/10 border border-blue-500/20'
                                  : 'bg-purple-500/10 border border-purple-500/20'
                                  }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-bold ${exchange.agent === 'SPARK' ? 'text-blue-300' : 'text-purple-300'
                                    }`}>
                                    {exchange.agent === 'SPARK' ? '🔵 S.P.A.R.K' : '🟣 RAZONET'}
                                  </span>
                                  <span className="text-white/40">•</span>
                                  <span className={`text-white/50 text-[10px] px-1.5 py-0.5 rounded ${exchange.action === 'critique' ? 'bg-orange-500/20 text-orange-300' :
                                    exchange.action === 'acknowledge' ? 'bg-green-500/20 text-green-300' :
                                      exchange.action === 'agreement' ? 'bg-green-500/20 text-green-300' :
                                        'bg-white/10'
                                    }`}>
                                    {exchange.action.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-white/80 leading-relaxed">
                                  {exchange.content}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
              <div className="text-sm text-white/80 whitespace-pre-wrap">
                {response}
              </div>
            </>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask me to ${mode} something...`}
          className="bg-white/5 border-white/10 text-white"
          disabled={isLoading}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading || !query.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
          title="Ask one AI"
        >
          <Send className="w-4 h-4" />
        </motion.button>
        <motion.button
          type="button"
          onClick={handleCollaborativeDiagnostic}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading || !query.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-50 bg-gradient-to-br from-purple-500 to-blue-500"
          title="Run collaborative diagnostic (S.P.A.R.K + RAZONET)"
        >
          <Users className="w-4 h-4" />
        </motion.button>
      </form>

      <p className="text-xs text-white/30 mt-3 text-center">
        💡 <strong className="text-white/50">New:</strong> Click <Users className="inline w-3 h-3" /> for S.P.A.R.K + RAZONET collaborative diagnostics!
      </p>

      <p className="text-xs text-white/30 mt-1 text-center">
        I help you learn, not do your homework for you!
      </p>
    </GlassCard>
  );
}