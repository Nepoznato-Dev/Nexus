import React, { useState, useEffect } from 'react';
import { Send, Brain, Search, Users, Sparkles, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../UI/GlassCard.js';
import { Input } from '../UI/input.js';
import NeonButton from '../UI/NeonButton.js';
import { storage } from '../Storage/clientStorage.js';
import { generateSearchEnhancedResponse } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/IRISSearch.js';
import { runParallelDiagnostics } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/collaborativeDiagnostics.js';
import { queryDirect } from '../A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/aiIntegration.js';

export default function AIChat({ accentColor, initialQuery }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [personality, setPersonality] = useState('adaptive');
  const [professionalism, setProfessionalism] = useState(0.5);
  const [mentorship, setMentorship] = useState(0.5);
  const [isThinking, setIsThinking] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(null); // null, 'think', 'search', 'collaborative'
  const [aiSettings, setAiSettings] = useState(null);
  const [expandedDialogue, setExpandedDialogue] = useState({});

  const personalityPresets = {
    adaptive: { professionalism: 0.55, mentorship: 0.55 },
    kind: { professionalism: 0.45, mentorship: 0.7 },
    moody: { professionalism: 0.25, mentorship: 0.35 },
    professional: { professionalism: 0.75, mentorship: 0.5 },
    mentor: { professionalism: 0.65, mentorship: 0.8 },
    chill: { professionalism: 0.4, mentorship: 0.45 },
  };

  useEffect(() => {
    // Load personality and AI settings
    const loadPersonality = async () => {
      try {
        await storage.init();
        const settings = await storage.loadSettings();
        const savedPersonality = settings?.aiPersonality;
        if (savedPersonality) {
          setPersonality(savedPersonality);
          const preset = personalityPresets[savedPersonality];
          if (preset) {
            setProfessionalism(preset.professionalism);
            setMentorship(preset.mentorship);
          }
        }
        setAiSettings(settings?.aiTools);
      } catch (err) {
        console.error('Failed to load AI personality:', err);
      }
    };
    loadPersonality();
  }, []);

  useEffect(() => {
    const preset = personalityPresets[personality];
    if (preset) {
      setProfessionalism(preset.professionalism);
      setMentorship(preset.mentorship);
    }
  }, [personality]);

  // Handle initial query from universal search bar
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const modeLabel = advancedMode === 'think' ? ' [Extended Thinking]'
      : advancedMode === 'search' ? ' [Deep Search]'
        : advancedMode === 'collaborative' ? ' [S.P.A.R.K + RAZONET]'
          : '';

    setMessages(prev => [...prev, {
      role: 'user',
      content: textToSend,
      mode: advancedMode
    }]);
    const userInput = textToSend;
    setInput('');
    setIsThinking(true);

    const deltas = analyzeUserPersonality(userInput);
    const updatedProfessionalism = clamp01(professionalism + deltas.professionalismDelta);
    const updatedMentorship = clamp01(mentorship + deltas.mentorshipDelta);
    setProfessionalism(updatedProfessionalism);
    setMentorship(updatedMentorship);

    try {
      let response;
      let dialogue = null;
      const currentMode = advancedMode;

      // Execute based on selected mode
      if (currentMode === 'search') {
        // Deep Search mode
        response = await generateSearchEnhancedResponse(
          userInput,
          personality || 'adaptive',
          aiSettings?.serpApiKey
        );
        if (!response) {
          response = 'Deep search unavailable. Please configure your SERP API key in Settings.';
        }
      } else if (currentMode === 'collaborative') {
        // S.P.A.R.K + RAZONET collaborative mode
        const report = await runParallelDiagnostics(userInput, {
          userName: 'User',
          apiKeys: {
            openai: aiSettings?.openaiApiKey,
            google: aiSettings?.googleApiKey,
          },
        });
        response = report.unifiedReport;
        dialogue = report.dialogue; // Capture the thinking process
      } else if (currentMode === 'think') {
        // Extended Thinking mode
        const thinkPrompt = `${userInput}\n\n[EXTENDED REASONING MODE]: Take your time. Think step-by-step, show your reasoning process, consider multiple angles, and provide a comprehensive answer with examples.`;
        const result = await queryDirect(
          thinkPrompt,
          aiSettings?.openaiApiKey || aiSettings?.googleApiKey || '',
          { temperature: 0.7, maxTokens: 1500 }
        );
        response = result.response || result || 'Extended thinking unavailable. Please configure your API key in Settings.';
      } else {
        // Standard mode - use local knowledge
        response = generateKnowledgeResponse(userInput, {
          professionalism: updatedProfessionalism,
          mentorship: updatedMentorship,
        });
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        mode: currentMode,
        dialogue: dialogue // Store dialogue if available
      }]);

      // Reset mode after use (so it's intentional each time)
      setAdvancedMode(null);
    } catch (error) {
      console.error('[AIChat] Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Falling back to standard response.`,
        mode: null
      }]);
      // Fallback to standard
      const fallbackResponse = generateKnowledgeResponse(userInput, {
        professionalism: updatedProfessionalism,
        mentorship: updatedMentorship,
      });
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fallbackResponse
        }]);
      }, 500);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <GlassCard className="p-6 max-w-4xl mx-auto h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-white/50 mt-20">
            <p>Ask me anything about your studies!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-xl ${msg.role === 'user'
                ? 'bg-white/10 text-white ml-auto'
                : 'bg-white/5 text-white/90'
                }`}
            >
              {msg.mode && (
                <div className={`px-3 pt-2 pb-1 text-xs font-medium ${msg.mode === 'think' ? 'text-blue-300' :
                  msg.mode === 'search' ? 'text-green-300' :
                    msg.mode === 'collaborative' ? 'text-purple-300' : ''
                  }`}>
                  {msg.mode === 'think' && '🧠 Extended Thinking'}
                  {msg.mode === 'search' && '🔍 Deep Search'}
                  {msg.mode === 'collaborative' && '🤝 S.P.A.R.K + RAZONET'}
                </div>
              )}
              <div className="p-3">
                {msg.content}
              </div>

              {/* Show thinking process dialogue if available */}
              {msg.dialogue && msg.dialogue.length > 0 && (
                <div className="px-3 pb-3">
                  <button
                    onClick={() => setExpandedDialogue(prev => ({
                      ...prev,
                      [i]: !prev[i]
                    }))}
                    className="flex items-center gap-2 text-xs text-purple-200 hover:text-purple-100 transition-colors mt-2"
                  >
                    {expandedDialogue[i] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Thinking Process ({msg.dialogue.length} exchanges)</span>
                  </button>

                  <AnimatePresence>
                    {expandedDialogue[i] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 space-y-1.5 overflow-hidden"
                      >
                        {msg.dialogue.map((exchange, dIdx) => (
                          <div
                            key={dIdx}
                            className={`p-2 rounded text-xs ${exchange.agent === 'SPARK'
                              ? 'bg-blue-500/10 border-l-2 border-blue-400'
                              : 'bg-purple-500/10 border-l-2 border-purple-400'
                              }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`font-bold text-[10px] ${exchange.agent === 'SPARK' ? 'text-blue-300' : 'text-purple-300'
                                }`}>
                                {exchange.agent === 'SPARK' ? 'S.P.A.R.K' : 'RAZONET'}
                              </span>
                              <span className={`text-[9px] px-1 py-0.5 rounded ${exchange.action === 'critique' ? 'bg-orange-500/20 text-orange-300' :
                                exchange.action === 'acknowledge' ? 'bg-green-500/20 text-green-300' :
                                  exchange.action === 'agreement' ? 'bg-green-500/20 text-green-300' :
                                    'bg-white/10 text-white/50'
                                }`}>
                                {exchange.action.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-white/75 text-[11px] leading-relaxed">
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
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl bg-white/5 text-white/70 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              {advancedMode === 'think' && 'Thinking deeply...'}
              {advancedMode === 'search' && 'Searching the web...'}
              {advancedMode === 'collaborative' && 'S.P.A.R.K & RAZONET analyzing...'}
              {!advancedMode && 'Thinking...'}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Mode Buttons */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40">Advanced modes:</span>
        <button
          onClick={() => setAdvancedMode(advancedMode === 'think' ? null : 'think')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${advancedMode === 'think'
            ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          title="Extended reasoning with step-by-step thinking"
        >
          <Brain className="w-3.5 h-3.5" />
          Think More
        </button>
        <button
          onClick={() => setAdvancedMode(advancedMode === 'search' ? null : 'search')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${advancedMode === 'search'
            ? 'bg-green-500/20 text-green-200 border border-green-500/40'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          title="Search the web for real-time information"
        >
          <Search className="w-3.5 h-3.5" />
          Deep Search
        </button>
        <button
          onClick={() => setAdvancedMode(advancedMode === 'collaborative' ? null : 'collaborative')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${advancedMode === 'collaborative'
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 border border-purple-500/40'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          title="Both S.P.A.R.K and RAZONET analyze together"
        >
          <Users className="w-3.5 h-3.5" />
          S.P.A.R.K + RAZONET
        </button>
        {advancedMode && (
          <span className="text-xs text-white/50 italic">
            ({advancedMode === 'collaborative' ? 'Parallel diagnostics' : 'Single-use per message'})
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your question..."
          className="bg-white/5 border-white/10 text-white"
        />
        <NeonButton onClick={handleSend}>
          <Send className="w-4 h-4" />
        </NeonButton>
      </div>
    </GlassCard>
  );
}