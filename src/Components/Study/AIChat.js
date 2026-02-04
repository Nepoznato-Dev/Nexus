import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import GlassCard from '../UI/GlassCard.js';
import { Input } from '../UI/input.js';
import NeonButton from '../UI/NeonButton.js';
import { storage } from '../Storage/clientStorage.js';

export default function AIChat({ accentColor, initialQuery }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [personality, setPersonality] = useState('adaptive');
  const [professionalism, setProfessionalism] = useState(0.5);
  const [mentorship, setMentorship] = useState(0.5);
  const [isThinking, setIsThinking] = useState(false);

  const personalityPresets = {
    adaptive: { professionalism: 0.55, mentorship: 0.55 },
    kind: { professionalism: 0.45, mentorship: 0.7 },
    moody: { professionalism: 0.25, mentorship: 0.35 },
    professional: { professionalism: 0.75, mentorship: 0.5 },
    mentor: { professionalism: 0.65, mentorship: 0.8 },
    chill: { professionalism: 0.4, mentorship: 0.45 },
  };

  useEffect(() => {
    // Load personality from settings
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

  const handleSend = (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    const userInput = textToSend;
    setInput('');
    setIsThinking(true);
    const deltas = analyzeUserPersonality(userInput);
    const updatedProfessionalism = clamp01(professionalism + deltas.professionalismDelta);
    const updatedMentorship = clamp01(mentorship + deltas.mentorshipDelta);
    setProfessionalism(updatedProfessionalism);
    setMentorship(updatedMentorship);
    
    // Generate AI response
    setTimeout(() => {
      const response = generateKnowledgeResponse(userInput, {
        professionalism: updatedProfessionalism,
        mentorship: updatedMentorship,
      });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response
      }]);
      setIsThinking(false);
    }, 800);
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
              className={`max-w-[70%] p-3 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-white/10 text-white ml-auto'
                  : 'bg-white/5 text-white/90'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl bg-white/5 text-white/70">
              Thinking...
            </div>
          </div>
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