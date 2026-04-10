import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Star, Brain } from 'lucide-react';
import PersonalityControl from './PersonalityControl.js';
import { generateNaturalResponse, analyzeUserPersonality } from './aiKnowledgeBase.js';
import {
  applyLearnedPersonalization,
  applyPreferenceFromMessage,
  deriveAdaptivePersonality,
  getLearningSummary,
  loadLearningProfile,
  recordFeedback,
  removeMemory
} from './userLearning.js';
import './AIChat.css';

export default function AIChatBasic() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Hey there! I'm S.P.A.R.K. (Simple Processing Assistant for Responses & Knowledge). I can help with studying, writing, coding, math, and Nexus features. What's on your mind?",
      timestamp: Date.now()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [professionalism, setProfessionalism] = useState(0.5);
  const [mentorship, setMentorship] = useState(0.5);
  const [isPersonalityLocked, setIsPersonalityLocked] = useState(false);
  const [learningProfile, setLearningProfile] = useState(null);
  const [learnedTabOpen, setLearnedTabOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messageIdRef = useRef(2);
  const learningProfileRef = useRef(null);
  const readEngagementRef = useRef({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await loadLearningProfile();
        learningProfileRef.current = profile;
        setLearningProfile(profile);
      } catch (error) {
        console.warn('Failed to load learning profile:', error);
      }
    };

    loadProfile();
  }, []);

  const refreshLearningProfile = async () => {
    const profile = await loadLearningProfile();
    learningProfileRef.current = profile;
    setLearningProfile(profile);
    return profile;
  };

  const getLatestAiMessageId = () => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'ai') return messages[i].id;
    }
    return null;
  };

  const noteReadingActivity = () => {
    if (document.visibilityState !== 'visible') return;
    const latestAiId = getLatestAiMessageId();
    if (!latestAiId) return;

    const now = Date.now();
    const tracker = readEngagementRef.current[latestAiId] || {
      startedAt: now,
      lastActiveAt: null,
      interactions: 0
    };

    tracker.interactions += 1;
    tracker.lastActiveAt = now;
    readEngagementRef.current[latestAiId] = tracker;
  };

  const getEngagedReadTimeMs = (messageId) => {
    const tracker = readEngagementRef.current[messageId];
    if (!tracker || tracker.interactions === 0 || !tracker.lastActiveAt) return 0;
    return Math.max(0, tracker.lastActiveAt - tracker.startedAt);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const userMsg = {
      id: messageIdRef.current++,
      role: 'user',
      text: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const maybeUpdated = await applyPreferenceFromMessage(userMessage);
      if (maybeUpdated) {
        learningProfileRef.current = maybeUpdated;
        setLearningProfile(maybeUpdated);
      }
    } catch (error) {
      console.warn('Failed to apply preference from message:', error);
    }

    if (!isPersonalityLocked) {
      const delta = analyzeUserPersonality(userMessage);
      setProfessionalism(prev => Math.max(0, Math.min(1, prev + delta.professionalismDelta)));
      setMentorship(prev => Math.max(0, Math.min(1, prev + delta.mentorshipDelta)));
    }

    setIsLoading(true);

    if (window.nexusPageStatus) {
      window.nexusPageStatus('Thinking');
    }

    setTimeout(async () => {
      try {
        const adaptivePersonality = deriveAdaptivePersonality(
          { professionalism, mentorship },
          learningProfileRef.current
        );

        const generationResult = await generateNaturalResponse(userMessage, adaptivePersonality, {
          mode: 'lite',
          taskType: 'answer',
          fluxTags: [],
          deviceProfile: {
            deviceClass: (navigator?.hardwareConcurrency || 4) <= 4 ? 'low' : (navigator?.hardwareConcurrency || 4) >= 12 ? 'high' : 'medium',
            vramFreeGB: Number(navigator?.deviceMemory || 0),
            cpuLoad: 0,
          },
        });
        let aiResponse = typeof generationResult === 'string'
          ? generationResult
          : String(generationResult?.text || '').trim();
        aiResponse = applyLearnedPersonalization(aiResponse, learningProfileRef.current);

        const aiMessageId = messageIdRef.current++;
        const now = Date.now();
        readEngagementRef.current[aiMessageId] = {
          startedAt: now,
          lastActiveAt: null,
          interactions: 0
        };

        const aiMsg = {
          id: aiMessageId,
          role: 'ai',
          text: aiResponse,
          prompt: userMessage,
          rating: 0,
          forgotten: false,
          timestamp: now
        };

        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        console.error('AI response generation failed:', error);
      } finally {
        setIsLoading(false);

        if (window.nexusPageStatus) {
          window.nexusPageStatus(null);
        }
      }
    }, 500 + Math.random() * 1000);
  };

  const handleRateMessage = async (messageId, rating) => {
    const target = messages.find(msg => msg.id === messageId && msg.role === 'ai');
    if (!target) return;

    try {
      await recordFeedback({
        messageId,
        prompt: target.prompt || '',
        response: target.text,
        rating,
        readTimeMs: getEngagedReadTimeMs(messageId),
        deletedForLearning: false
      });

      setMessages(prev => prev.map(msg => (
        msg.id === messageId ? { ...msg, rating } : msg
      )));

      await refreshLearningProfile();
    } catch (error) {
      console.error('Failed to save message rating:', error);
    }
  };

  const handleForgetMessage = async (messageId) => {
    const target = messages.find(msg => msg.id === messageId && msg.role === 'ai');
    if (!target) return;

    try {
      await recordFeedback({
        messageId,
        prompt: target.prompt || '',
        response: target.text,
        rating: target.rating || 0,
        readTimeMs: getEngagedReadTimeMs(messageId),
        deletedForLearning: true
      });

      setMessages(prev => prev.map(msg => (
        msg.id === messageId ? { ...msg, forgotten: true } : msg
      )));

      await refreshLearningProfile();
    } catch (error) {
      console.error('Failed to forget message from learning:', error);
    }
  };

  const handleRemoveMemory = async (memoryId) => {
    try {
      await removeMemory(memoryId);
      await refreshLearningProfile();
    } catch (error) {
      console.error('Failed to remove learned memory:', error);
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages? This can\'t be undone.')) {
      setMessages([
        {
          id: messageIdRef.current++,
          role: 'ai',
          text: 'Chat cleared. What can I help you with?',
          timestamp: Date.now()
        }
      ]);
      setProfessionalism(0.5);
      setMentorship(0.5);
      setIsPersonalityLocked(false);
      readEngagementRef.current = {};
    }
  };

  const learningSummary = getLearningSummary(learningProfile);

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-main">
        <div
          className="messages-area"
          onScroll={noteReadingActivity}
          onMouseMove={noteReadingActivity}
          onTouchMove={noteReadingActivity}
          onKeyDown={noteReadingActivity}
          tabIndex={0}
        >
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>

                {msg.role === 'ai' && (
                  <div className="message-feedback" role="group" aria-label="Rate this response">
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${msg.rating >= star ? 'active' : ''}`}
                          onClick={() => handleRateMessage(msg.id, star)}
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`forget-btn ${msg.forgotten ? 'active' : ''}`}
                      onClick={() => handleForgetMessage(msg.id)}
                      title="Do not learn from this response"
                    >
                      {msg.forgotten ? 'Not learned' : 'Forget'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="input-area">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
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

      <div className="ai-sidebar">
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
            <span>Avg Rating</span>
            <strong>{learningSummary.averageRating || 0}/5</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLearnedTabOpen(prev => !prev)}
          className="learned-tab-btn"
          title="Open learned profile"
        >
          <Brain className="w-4 h-4" />
          {learnedTabOpen ? 'Hide Learned Tab' : 'Learned Tab'}
        </button>

        {learnedTabOpen && (
          <div className="learned-tab-panel">
            <h4>What I Learned</h4>

            <div className="learned-item">
              <span>Preferred Name</span>
              <strong>{learningSummary.preferredName || 'Not set yet'}</strong>
            </div>

            <div className="learned-item">
              <span>Style</span>
              <strong>{learningSummary.communicationStyle}</strong>
            </div>

            <div className="learned-item">
              <span>Verbosity</span>
              <strong>{learningSummary.verbosity}</strong>
            </div>

            <div className="learned-item">
              <span>Total Ratings</span>
              <strong>{learningSummary.totalRatings}</strong>
            </div>

            <div className="learned-item">
              <span>Read Time</span>
              <strong>{learningSummary.totalReadTimeMinutes} min</strong>
            </div>

            <div className="learned-memory-list">
              <p className="learned-subtitle">Recent Memories</p>
              {learningSummary.recentMemories.length === 0 && (
                <p className="learned-empty">No saved memories yet.</p>
              )}

              {learningSummary.recentMemories.map(memory => (
                <div key={memory.id} className="learned-memory-row">
                  <div className="learned-memory-text">
                    <span className="memory-type">{memory.type}</span>
                    <span>{memory.key}: {String(memory.value || '(empty)')}</span>
                  </div>
                  <button
                    type="button"
                    className="memory-remove-btn"
                    onClick={() => handleRemoveMemory(memory.id)}
                    title="Remove this learned memory"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={clearChat} className="clear-btn" title="Clear chat">
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </button>
      </div>
    </div>
  );
}
