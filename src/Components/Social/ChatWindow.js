import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Smile, Plus, Image as ImageIcon, Trash2, Edit2, Reply, MoreVertical, Bell, BellOff } from 'lucide-react';
import { session } from '../Storage/clientStorage.js';
import { Message } from '../../entities/Message.js';

const STORAGE_KEY = 'nexus_messages';
const CHANNELS_KEY = 'nexus_channels';
const TYPING_KEY = 'nexus_typing';

export default function ChatWindow({ channel, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    // Notifications enabled by default
    setNotificationsEnabled(true);
  }, []);

  useEffect(() => {
    loadMessages();
    // Reduced polling from 1s to 5s for better performance
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [channel.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Monitor typing indicators
    const interval = setInterval(() => {
      try {
        const typingData = JSON.parse(localStorage.getItem(TYPING_KEY) || '{}');
        const channelTyping = typingData[channel.id] || [];
        const now = Date.now();
        const activeTyping = channelTyping
          .filter(t => {
            // Validate timestamp is a number
            if (typeof t.timestamp !== 'number' || isNaN(t.timestamp)) {
              return false;
            }
            return now - t.timestamp < 3000 && t.userId !== currentUser.id;
          })
          .map(t => t.username);
        setTyping(activeTyping);
      } catch (err) {
        console.error('Failed to load typing indicators:', err);
        setTyping([]);
      }
    }, 2000); // Reduced from 500ms to 2s for better performance
    return () => clearInterval(interval);
  }, [channel.id, currentUser.id]);

  const loadMessages = () => {
    try {
      const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const channelMessages = allMessages
        .filter(m => m.channelId === channel.id && !m.deleted)
        .map(m => Message.fromJSON(m))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Show notification for new messages (not from current user)
      if (notificationsEnabled && channelMessages.length > lastMessageCountRef.current) {
        const newMessages = channelMessages.slice(lastMessageCountRef.current);
        newMessages.forEach(msg => {
          if (msg.userId !== currentUser.id && document.hidden && window.nexusNotifications) {
            window.nexusNotifications.show({
              type: 'message',
              title: `${msg.username} in #${channel.name}`,
              body: msg.content
            });
          }
        });
      }
      
      lastMessageCountRef.current = channelMessages.length;
      setMessages(channelMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const message = new Message({
      channelId: channel.id,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      content: input.trim(),
      replyTo: replyTo?.id
    });

    try {
      const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      allMessages.push(message.toJSON());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
      setInput('');
      setReplyTo(null);
      stopTyping();
      loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const deleteMessage = (messageId) => {
    try {
      const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = allMessages.map(m => 
        m.id === messageId ? { ...m, deleted: true, content: '[deleted]' } : m
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      loadMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const addReaction = (messageId, emoji) => {
    try {
      const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = allMessages.map(m => {
        if (m.id === messageId) {
          const reactions = { ...m.reactions };
          if (!reactions[emoji]) reactions[emoji] = [];
          if (reactions[emoji].includes(currentUser.id)) {
            reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji].push(currentUser.id);
          }
          return { ...m, reactions };
        }
        return m;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      loadMessages();
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const updateTyping = () => {
    try {
      const typingData = JSON.parse(localStorage.getItem(TYPING_KEY) || '{}');
      const channelTyping = typingData[channel.id] || [];
      const filtered = channelTyping.filter(t => t.userId !== currentUser.id);
      filtered.push({
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: Date.now()
      });
      typingData[channel.id] = filtered;
      localStorage.setItem(TYPING_KEY, JSON.stringify(typingData));
    } catch (err) {
      console.error('Failed to update typing:', err);
    }
  };

  const stopTyping = () => {
    try {
      const typingData = JSON.parse(localStorage.getItem(TYPING_KEY) || '{}');
      const channelTyping = (typingData[channel.id] || []).filter(t => t.userId !== currentUser.id);
      typingData[channel.id] = channelTyping;
      localStorage.setItem(TYPING_KEY, JSON.stringify(typingData));
    } catch (err) {
      console.error('Failed to stop typing:', err);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    updateTyping();
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Channel header */}
      <div className="flex items-center gap-3 p-4 bg-white/5 border-b border-white/10">
        <Hash className="w-5 h-5 text-white/60" />
        <div className="flex-1">
          <h3 className="text-white font-semibold">{channel.name}</h3>
          {channel.description && (
            <p className="text-white/50 text-sm">{channel.description}</p>
          )}
        </div>
        <button
          onClick={() => {
            if (notificationsEnabled) {
              setNotificationsEnabled(false);
            } else if (Notification.permission === 'granted') {
              setNotificationsEnabled(true);
            } else {
              Notification.requestPermission().then(permission => {
                setNotificationsEnabled(permission === 'granted');
              });
            }
          }}
          className={`p-2 rounded-lg transition-colors ${
            notificationsEnabled 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
          title={notificationsEnabled ? 'Notifications on' : 'Notifications off'}
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => {
            const showAvatar = idx === 0 || messages[idx - 1].userId !== msg.userId;
            const replyMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex gap-3 group ${!showAvatar && 'mt-1'}`}
              >
                <div className="w-10 flex-shrink-0">
                  {showAvatar && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {msg.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-white font-semibold">{msg.username}</span>
                      <span className="text-white/40 text-xs">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  
                  {replyMsg && (
                    <div className="pl-3 border-l-2 border-white/30 mb-1 text-white/60 text-sm">
                      <span className="font-medium">{replyMsg.username}</span>: {replyMsg.content.substring(0, 50)}
                    </div>
                  )}
                  
                  <div className="text-white/90 break-words">{msg.content}</div>
                  
                  {/* Reactions */}
                  {Object.keys(msg.reactions).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className={`px-2 py-0.5 rounded text-xs ${
                            userIds.includes(currentUser.id)
                              ? 'bg-cyan-500/30 border border-cyan-500/50'
                              : 'bg-white/5 border border-white/10'
                          } hover:bg-white/10 transition-colors`}
                        >
                          {emoji} {userIds.length}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Hover actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 -mt-6 flex gap-1 bg-black/80 rounded-lg p-1">
                    <button
                      onClick={() => addReaction(msg.id, '👍')}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Add reaction"
                    >
                      <Smile className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Reply"
                    >
                      <Reply className="w-4 h-4 text-white/60" />
                    </button>
                    {msg.userId === currentUser.id && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 hover:bg-red-500/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {typing.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/50 text-sm italic pl-13"
          >
            {typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 p-2 bg-white/5 rounded">
            <div className="text-sm">
              <span className="text-white/60">Replying to </span>
              <span className="text-white font-medium">{replyTo.username}</span>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-white/60 hover:text-white">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
