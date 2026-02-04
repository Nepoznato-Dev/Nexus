import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import PersonalityControl from './PersonalityControl.js';
import { generateResponse, analyzeUserPersonality } from './aiKnowledgeBase.js';
import './AIChat.css';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Hey there! I'm Nexus AI. I can help with studying, writing, coding, math, and Nexus features. What's on your mind?",
      timestamp: Date.now()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [professionalism, setProfessionalism] = useState(0.5);
  const [mentorship, setMentorship] = useState(0.5);
  const [isPersonalityLocked, setIsPersonalityLocked] = useState(false);
  
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
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    
    // Auto-adapt personality if unlocked
    if (!isPersonalityLocked) {
      const delta = analyzeUserPersonality(userMessage);
      setProfessionalism(prev => Math.max(0, Math.min(1, prev + delta.professionalismDelta)));
      setMentorship(prev => Math.max(0, Math.min(1, prev + delta.mentorshipDelta)));
    }
    
    // Simulate AI thinking
    setIsLoading(true);
    
    // Set tab title to "Thinking"
    if (window.nexusPageStatus) {
      window.nexusPageStatus('Thinking');
    }
    
    // Simulate delay for realism
    setTimeout(() => {
      const aiResponse = generateResponse(userMessage, {
        professionalism,
        mentorship
      });
      
      const aiMsg = {
        id: messageIdRef.current++,
        role: 'ai',
        text: aiResponse,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
      
      // Clear thinking status
      if (window.nexusPageStatus) {
        window.nexusPageStatus(null);
      }
    }, 500 + Math.random() * 1000); // 500-1500ms delay
  };
  
  const clearChat = () => {
    if (window.confirm('Clear all messages? This can\'t be undone.')) {
      setMessages([
        {
          id: messageIdRef.current++,
          role: 'ai',
          text: "Chat cleared. What can I help you with?",
          timestamp: Date.now()
        }
      ]);
      setProfessionalism(0.5);
      setMentorship(0.5);
      setIsPersonalityLocked(false);
    }
  };
  
  return (
    <div className="ai-chat-container">
      <div className="ai-chat-main">
        {/* Messages area */}
        <div className="messages-area">
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
        
        {/* Input area */}
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
      
      {/* Sidebar with personality control */}
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
