import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Brain, AlertCircle, RotateCw } from 'lucide-react';
import PersonalityControl from './PersonalityControl.js';
import ThinkingProcess from './ThinkingProcess.js';
import { generateResponse, analyzeUserPersonality } from './aiKnowledgeBase.js';
import { routeQuestion, generateThinkingProcess, scoreResponseQuality } from './aiRouter.js';
import { autoDetectLanguage, translate, translateResponse, getCurrentLanguage } from './aiLanguageManager.js';
import { isSettingsCommand, processSettingsCommand } from './aiCommandParser.js';
import { runFallbackChain, getApiKeys } from './aiApiBridge.js';
import { getSetting } from './aiSettingsManager.js';
import './AIChat.css';

/**
 * AIChat - Template + API chat with personality, thinking transparency, routing, quality control
 * Enhanced with: env variable support, response caching, conversation context, error handling, quality warnings, retry button
 */
export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: translate('greetings', getCurrentLanguage()),
      timestamp: Date.now(),
      quality: null,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [professionalism, setProfessionalism] = useState(0.5);
  const [mentorship, setMentorship] = useState(0.5);
  const [isPersonalityLocked, setIsPersonalityLocked] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [currentThinking, setCurrentThinking] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [retryableMessageId, setRetryableMessageId] = useState(null);
  const [stats, setStats] = useState({
    totalMessages: 1,
    avgQuality: 0,
    lastModel: 'LOCAL',
  });

  const messagesEndRef = useRef(null);
  const messageIdRef = useRef(2);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setLastError(null);
    setRetryableMessageId(null);

    // Add user message
    const userMsg = {
      id: messageIdRef.current++,
      role: 'user',
      text: userMessage,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Auto-adapt personality if unlocked
    if (!isPersonalityLocked) {
      const delta = analyzeUserPersonality(userMessage);
      setProfessionalism((prev) => Math.max(0, Math.min(1, prev + delta.professionalismDelta)));
      setMentorship((prev) => Math.max(0, Math.min(1, prev + delta.mentorshipDelta)));
    }

    // Process settings commands locally
    const settingsCommand = isSettingsCommand(userMessage);
    if (settingsCommand) {
      const result = processSettingsCommand(userMessage, { language: getCurrentLanguage() });
      const aiMsg = {
        id: messageIdRef.current++,
        role: 'ai',
        text: result?.message ?? result?.error ?? 'Updated settings.',
        timestamp: Date.now(),
        quality: 7,
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    setIsLoading(true);
    if (window.nexusPageStatus) window.nexusPageStatus('Thinking');

    const languageInfo = autoDetectLanguage(userMessage);
    const lang = languageInfo.detected;

    // Get API keys from environment or fallback to settings/localStorage
    const envKeys = getApiKeys();
    const openaiKey = getSetting('ai', 'openaiKey') || envKeys.openai || '';
    const googleKey = getSetting('ai', 'googleKey') || envKeys.google || '';
    const apiKeys = { openaiKey, googleKey };

    const strategy = routeQuestion(userMessage, { openaiKey, googleKey });
    const initialThinking = generateThinkingProcess(userMessage, strategy);
    setCurrentThinking(initialThinking);

    const personality = { professionalism, mentorship, language: lang };
    const generateLocal = () => generateResponse(userMessage, personality);

    // Get conversation context (last 3 messages for API calls)
    const conversationContext = messages.slice(-3).filter(m => m.role !== undefined);

    const runResponse = async () => {
      let response;
      let model = strategy.route[0] || 'LOCAL';
      let quality = 0;
      let usedFallback = false;
      let qualityWarning = false;
      let apiError = null;

      if (openaiKey || googleKey) {
        try {
          const result = await runFallbackChain(userMessage, strategy, {
            generateLocal,
            apiKeys,
            conversationContext,
          });
          response = result.response;
          model = result.model;
          quality = result.quality ?? scoreResponseQuality(response, userMessage);
          usedFallback = result.usedFallback ?? false;
          qualityWarning = result.qualityWarning ?? false;
        } catch (err) {
          apiError = err.message || 'API call failed';
          response = generateLocal();
          quality = scoreResponseQuality(response, userMessage);
          model = 'LOCAL';
          usedFallback = true;
        }
      } else {
        response = generateLocal();
        quality = scoreResponseQuality(response, userMessage);
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
      }

      const responseData = { response, usedFallback, finalModel: model };
      const thinkingWithQuality = generateThinkingProcess(userMessage, strategy, responseData);
      setCurrentThinking(thinkingWithQuality);

      const translated = translateResponse(response, lang);
      const aiMsg = {
        id: messageIdRef.current++,
        role: 'ai',
        text: translated,
        timestamp: Date.now(),
        quality,
        model,
        qualityWarning,
        apiError,
        retryable: qualityWarning || apiError ? true : false,
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (aiMsg.retryable) {
        setRetryableMessageId(aiMsg.id);
      }
      
      setStats((prev) => ({
        totalMessages: prev.totalMessages + 1,
        avgQuality:
          prev.totalMessages === 0
            ? quality
            : (prev.avgQuality * prev.totalMessages + quality) / (prev.totalMessages + 1),
        lastModel: model,
      }));
      setIsLoading(false);
      setCurrentThinking(null);
      if (window.nexusPageStatus) window.nexusPageStatus(null);
    };

    runResponse().catch((err) => {
      const fallback = generateLocal();
      const aiMsg = {
        id: messageIdRef.current++,
        role: 'ai',
        text: translateResponse(fallback, lang),
        timestamp: Date.now(),
        quality: scoreResponseQuality(fallback, userMessage),
        model: 'LOCAL',
        apiError: err.message || 'Unexpected error',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLastError(err.message || 'Failed to generate response');
      setIsLoading(false);
      setCurrentThinking(null);
      if (window.nexusPageStatus) window.nexusPageStatus(null);
    });
  };

  const handleRetry = async (messageId) => {
    // Find the message index
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    
    // Find the corresponding user message (previous message)
    let userMessage = null;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i].text;
        break;
      }
    }
    
    if (!userMessage) return;
    
    // Set input and trigger send
    setInput(userMessage);
    // Remove the failed AI message
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setRetryableMessageId(null);
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages? This can't be undone.")) {
      setMessages([
        {
          id: messageIdRef.current++,
          role: 'ai',
          text: translate('greetings', getCurrentLanguage()),
          timestamp: Date.now(),
          quality: null,
        },
      ]);
      setProfessionalism(0.5);
      setMentorship(0.5);
      setIsPersonalityLocked(false);
      setStats({ totalMessages: 1, avgQuality: 0, lastModel: 'LOCAL' });
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-main">
        {/* Messages area */}
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">{msg.role === 'ai' ? '🤖' : '👤'}</div>
              <div className="message-content">
                <p>{msg.text}</p>
                
                {/* Quality warning banner */}
                {msg.qualityWarning && (
                  <div className="quality-warning">
                    <AlertCircle className="w-3 h-3" />
                    <span>Lower quality due to rate limit or API unavailable</span>
                  </div>
                )}
                
                {/* API error banner */}
                {msg.apiError && (
                  <div className="api-error">
                    <AlertCircle className="w-3 h-3" />
                    <span>{msg.apiError}</span>
                  </div>
                )}
                
                <div className="message-footer">
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.quality !== null && (
                    <span className={`message-quality ${msg.qualityWarning ? 'warning' : ''}`}>
                      Quality: {msg.quality}/10
                    </span>
                  )}
                  {msg.model && <span className="message-quality">Model: {msg.model}</span>}
                  
                  {/* Retry button */}
                  {msg.retryable && (
                    <button
                      className="retry-btn"
                      onClick={() => handleRetry(msg.id)}
                      title="Retry with different model"
                    >
                      <RotateCw className="w-3 h-3" />
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {showThinking && <ThinkingProcess thinkingData={currentThinking} show={showThinking} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="send-btn"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sidebar with personality control */}
      <div className="ai-sidebar">
        <button
          className={`thinking-toggle ${showThinking ? 'active' : ''}`}
          onClick={() => setShowThinking((prev) => !prev)}
          title="Show AI thinking process"
        >
          <Brain className="w-4 h-4" />
          {showThinking ? 'Hide thinking' : 'Show thinking'}
        </button>

        <PersonalityControl
          professionalism={professionalism}
          mentorship={mentorship}
          isLocked={isPersonalityLocked}
          onPersonalityChange={({ professionalism: prof, mentorship: ment }) => {
            setProfessionalism(prof);
            setMentorship(ment);
          }}
          onLockToggle={setIsPersonalityLocked}
        />

        {/* Quick stats */}
        <div className="ai-stats">
          <h4>Stats</h4>
          <div className="stat">
            <span>Messages</span>
            <strong>{messages.length}</strong>
          </div>
          <div className="stat">
            <span>Professionalism</span>
            <strong>{Math.round(professionalism * 100)}%</strong>
          </div>
          <div className="stat">
            <span>Mentorship</span>
            <strong>{Math.round(mentorship * 100)}%</strong>
          </div>
          <div className="stat">
            <span>Avg Quality</span>
            <strong>{stats.avgQuality.toFixed(1)}</strong>
          </div>
          <div className="stat">
            <span>Last Model</span>
            <strong>{stats.lastModel}</strong>
          </div>
        </div>

        {/* Clear button */}
        <button onClick={clearChat} className="clear-btn" title="Clear chat">
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </button>
      </div>
    </div>
  );
}
