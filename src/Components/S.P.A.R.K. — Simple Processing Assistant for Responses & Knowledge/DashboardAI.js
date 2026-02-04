import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  Lightbulb, 
  TrendingUp, 
  HelpCircle,
  Zap,
  ChevronDown,
  X,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../UI/GlassCard.js';
import { Input } from '../UI/input.js';
import NeonButton from '../UI/NeonButton.js';
import { storage } from '../Storage/clientStorage.js';
import { getPersonalityResponse, getTimedTip, formatMessageByPersonality, PERSONALITY_MODES } from '../../utils/personalities.js';

const QUICK_ACTIONS = [
  { text: 'Study Math', icon: '📐', category: 'study' },
  { text: 'Practice Coding', icon: '💻', category: 'study' },
  { text: 'Define Word', icon: '📚', action: 'define' },
  { text: 'Search Info', icon: '🔍', action: 'search' },
  { text: 'Quick Tip', icon: '💡', action: 'tip' },
  { text: 'Latest Games', icon: '🎮', category: 'games' },
];

const AI_TIPS = [
  'Did you know? You can use Ctrl+Shift+Delete to clear your browser cache!',
  'Tip: Keyboard shortcuts can save you lots of time. Try Alt+Tab!',
  'Pro tip: Use the Whiteboard for brainstorming ideas.',
  'Hint: The Settings panel has performance optimizations.',
  'Feature: You can bookmark your favorite sites in the browser!',
  'Tip: Flashcards are great for memorizing vocab.',
  'Did you know? Pomodoro timers improve focus and productivity.',
];

export default function DashboardAI({ accentColor = '#a55eea' }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tabStats, setTabStats] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [settings, setSettings] = useState({ browser: { openLinksIn: 'nexus' }, aiTools: { personality: 'adaptive' } });
  const [personality, setPersonality] = useState('adaptive');

  useEffect(() => {
    loadSettings();
    loadTabStats();
    generateSuggestions();

    // Add initial welcome message with personality
    const welcomeMsg = getPersonalityResponse(personality, 'greeting');
    setMessages([{
      role: 'assistant',
      content: welcomeMsg,
      type: 'welcome'
    }]);
  }, []);

  const loadSettings = async () => {
    try {
      await storage.init();
      const saved = await storage.loadSettings();
      if (saved) {
        setSettings(saved);
        setPersonality(saved.aiTools?.personality || 'adaptive');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadTabStats = async () => {
    try {
      await storage.init();
      const stats = await storage.db.get('tabStats') || {};
      setTabStats(stats);
    } catch (err) {
      console.error('Failed to load tab stats:', err);
    }
  };

  const generateSuggestions = async () => {
    try {
      await storage.init();
      const stats = await storage.db.get('tabStats') || {};
      
      const suggestions = [];
      
      // Find most clicked tabs
      const sorted = Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (sorted.length > 0) {
        const topTab = sorted[0][0];
        const trendingMessage = getPersonalityResponse(personality, 'suggestion')
          .replace('{suggestion}', topTab);
        suggestions.push({
          icon: TrendingUp,
          text: trendingMessage,
          type: 'trending'
        });
      }

      // Add timed tip based on time of day and personality
      const timedTip = getTimedTip(personality);
      suggestions.push({
        icon: Lightbulb,
        text: timedTip,
        type: 'tip'
      });

      setSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    }
  };

  const recordTabClick = async (tabName) => {
    try {
      await storage.init();
      const stats = (await storage.db.get('tabStats')) || {};
      stats[tabName] = (stats[tabName] || 0) + 1;
      await storage.db.put('tabStats', stats);
      setTabStats(stats);
    } catch (err) {
      console.error('Failed to record tab click:', err);
    }
  };

  const handleSearch = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      type: 'search'
    }]);

    // Determine action
    const lowerInput = userMessage.toLowerCase();
    
    if (lowerInput.includes('search') || lowerInput.includes('find') || lowerInput.includes('look up')) {
      // Open browser with search
      const searchTerm = userMessage
        .replace(/search for |find |look up |search |look |find for /gi, '')
        .trim();
      
      const openLinksIn = settings.browser?.openLinksIn || 'nexus';
      
      if (openLinksIn === 'external') {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigate('/browser', { state: { url: searchTerm } });
      }

      const searchResponse = getPersonalityResponse(personality, 'search').replace('{search}', searchTerm);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🔍 ${searchResponse}`,
        type: 'action'
      }]);
    } else if (lowerInput.includes('define') || lowerInput.includes('what is') || lowerInput.includes('meaning')) {
      const word = userMessage
        .replace(/define |what is |what's the meaning of |meaning of |tell me about /gi, '')
        .trim();

      const defineResponse = getPersonalityResponse(personality, 'definition').replace('{word}', word);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `📖 ${defineResponse}`,
        type: 'action'
      }]);

      recordTabClick('Dictionary');
    } else if (lowerInput.includes('help') || lowerInput.includes('how do i') || lowerInput.includes('guide')) {
      const helpResponse = formatMessageByPersonality(
        '📚 Check out the Quick Actions at the bottom or explore the Features section. Visit the Updates page to see all available tools!',
        personality
      );
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: helpResponse,
        type: 'help'
      }]);
    } else {
      // General AI response
      const responses = {
        adaptive: [
          '💡 That\'s an interesting point! Need me to search for more info, or would you like a definition?',
          '🤔 I see where you\'re going. Want me to search or define something for you?',
          '✨ Good thinking! I can help you search for details or look up specific terms.',
          '🎯 Got it! Try asking me to search, define words, or show you guides.',
        ],
        kind: [
          '💡 What a wonderful question! Would you like me to search for more info? 🌟',
          '🤔 You\'re so thoughtful to ask! I\'d love to help you find the answer!',
          '✨ That\'s great curiosity! Let me search that for you! 💪',
          '🎯 You\'re amazing! Ask me to search, define, or guide you through anything!',
        ],
        moody: [
          '💡 Okay, okay... that\'s not a bad question. Search for more info?',
          '🤔 Look, if you want the real answer, I can search it for you.',
          '✨ Alright, fine. Want me to find something or look that up?',
          '🎯 Fair enough. Ask me to search, define stuff, or get a guide.',
        ],
        professional: [
          '💡 Noted. I can search for relevant information or provide definitions.',
          '🤔 Requesting additional action. Search? Define? Guide?',
          '✨ Processing. I can assist with searches, definitions, or guides.',
          '🎯 Understood. Available actions: search, define, guide.',
        ],
        mentor: [
          '💡 Excellent inquiry! This is a learning opportunity. Would you like me to search and explain further?',
          '🤔 That demonstrates critical thinking! Let me search for comprehensive information to help your understanding.',
          '✨ Great question! This shows you\'re engaged. I can search and provide detailed explanations.',
          '🎯 Wonderful! I\'m here to guide you. Ask me to search, define, or provide comprehensive guidance.',
        ],
        chill: [
          '💡 Yo, that\'s a legit question! Want me to search it up? 😎',
          '🤔 Ngl, I got you. Let me find that info for you.',
          '✨ For sure! I can search, define, or show you the way.',
          '🎯 Yo, no problem. Search, define, or guide—whatever you need! ✌️',
        ],
      };
      
      const personalityResponses = responses[personality] || responses.adaptive;
      const randomResponse = personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: randomResponse,
        type: 'general'
      }]);
    }

    setIsLoading(false);
  };

  const handleQuickAction = async (action) => {
    const userMessage = action.text;
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      type: 'quick'
    }]);

    setIsLoading(true);

    if (action.action === 'search') {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔍 Opened browser. What would you like to search for?',
        type: 'action'
      }]);
      navigate('/browser');
      recordTabClick('Browser');
    } else if (action.action === 'define') {
      navigate('/studytools');
      recordTabClick('Study Tools');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '📖 Opened Dictionary! Look for words in the search box.',
        type: 'action'
      }]);
    } else if (action.action === 'tip') {
      const randomTip = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `💡 ${randomTip}`,
        type: 'tip'
      }]);
    } else if (action.category === 'games') {
      navigate('/games');
      recordTabClick('Games');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🎮 Opened Games! Find something fun to play.',
        type: 'action'
      }]);
    } else if (action.category === 'study') {
      navigate('/studytools');
      recordTabClick('Study Tools');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '📚 Opened Study Tools! Time to focus!',
        type: 'action'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 w-96 max-h-[600px] shadow-2xl"
          >
            <GlassCard className="p-4 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: accentColor }} />
                  <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/90'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center text-white/60 text-sm">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce delay-200" />
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length === 1 && suggestions.length > 0 && (
                <div className="mb-4 space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-white/50 font-medium">SUGGESTIONS</p>
                  {suggestions.map((sugg, i) => (
                    <div key={i} className="flex gap-2 text-xs text-white/70">
                      {/* <sugg.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} /> */}
                      <span>{sugg.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-white/50 font-medium">QUICK ACTIONS</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(action)}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition border border-white/10 hover:border-white/20"
                      >
                        {action.icon} {action.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm"
                />
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={handleSearch}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}99)`,
          border: `2px solid ${accentColor}`,
        }}
      >
        {isExpanded ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <Zap className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </motion.div>
  );
}
