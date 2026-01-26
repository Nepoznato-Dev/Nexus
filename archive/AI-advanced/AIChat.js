import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Brain } from 'lucide-react';
import PersonalityControl from './PersonalityControl.js';
import ThinkingProcess from './ThinkingProcess.js';
import { generateResponse, analyzeUserPersonality } from './aiKnowledgeBase.js';
import { routeQuestion, generateThinkingProcess, scoreResponseQuality } from './aiRouter.js';
import { autoDetectLanguage, translate, translateResponse, getCurrentLanguage } from './aiLanguageManager.js';
import { isSettingsCommand, processSettingsCommand } from './aiCommandParser.js';
import './AIChat.css';

/**
 * AIChat - Fully featured AI chat with personality controls, thinking transparency, and settings commands
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
        text: result?.message || 'Updated settings.',
        timestamp: Date.now(),
        quality: 7,
      };

      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    // Simulate AI thinking
    setIsLoading(true);
    setCurrentThinking({
      steps: [
        'Analyzing message...',
        'Determining complexity...',
        'Selecting best model...',
      ],
      summary: 'Preparing response',
      estimatedTime: 1200,
    });

    // Set tab title to "Thinking"
    if (window.nexusPageStatus) {
      window.nexusPageStatus('Thinking');
    }

    // Auto-detect language
    const languageInfo = autoDetectLanguage(userMessage);
    const lang = languageInfo.detected;

    // Determine routing strategy
    const strategy = routeQuestion(userMessage, { provider: 'local' });
    const thinking = generateThinkingProcess(userMessage, strategy);
    setCurrentThinking(thinking);

    // Simulate delay for realism
    setTimeout(() => {
      const aiResponse = generateResponse(userMessage, {
        professionalism,
        mentorship,
        language: lang,
      });

      const quality = scoreResponseQuality(aiResponse, userMessage, 'LOCAL');
      const translatedResponse = translateResponse(aiResponse, lang);

      const aiMsg = {
        id: messageIdRef.current++,
        role: 'ai',
        text: translatedResponse,
        timestamp: Date.now(),
        quality,
        model: strategy.route[0] || 'LOCAL',
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
      setCurrentThinking(null);
      setStats((prev) => ({
        totalMessages: prev.totalMessages + 1,
        avgQuality: prev.totalMessages === 0 ? quality : (prev.avgQuality * prev.totalMessages + quality) / (prev.totalMessages + 1),
        lastModel: aiMsg.model,
      }));

      // Clear thinking status
      if (window.nexusPageStatus) {
        window.nexusPageStatus(null);
      }
    }, 500 + Math.random() * 1000); // 500-1500ms delay
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
                <div className="message-footer">
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.quality !== null && (
                    <span className="message-quality">Quality: {msg.quality}/10</span>
                  )}
                  {msg.model && <span className="message-quality">Model: {msg.model}</span>}
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
