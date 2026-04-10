import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageCircle, 
  Users, 
  Bell, 
  ExternalLink,
  Check,
  X as CloseIcon,
  Hash,
  Plus,
  Settings as SettingsIcon,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from 'utils';
import { useNavigateBack } from '../hooks/useNavigateBack.js';
import { session } from '../Components/Storage/clientStorage.js';
import AnimatedBackground from '../Components/UI/AnimatedBackground.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import ChatWindow from '../Components/Social/ChatWindow.js';
import { Channel } from '../entities/Message.js';

const SOCIAL_SERVICES = [
  { 
    id: 'nexus-discord', 
    name: 'Nexus Discord Server', 
    color: '#00f0ff',
    icon: '💎',
    description: 'Join the official Nexus community',
    url: 'https://discord.gg/qz4gdJttay',
    connected: true
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    color: '#5865f2',
    icon: '💬',
    description: 'Chat with friends & communities',
    url: 'https://discord.com/app',
    connected: true
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    color: '#e4405f',
    icon: '📸',
    description: 'Photo & video sharing',
    url: 'https://www.instagram.com',
    connected: false
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    color: '#1da1f2',
    icon: '🐦',
    description: 'Microblogging & news',
    url: 'https://twitter.com',
    connected: false
  },
  { 
    id: 'reddit', 
    name: 'Reddit', 
    color: '#ff4500',
    icon: '🔴',
    description: 'Forums & discussions',
    url: 'https://www.reddit.com',
    connected: false
  },
  { 
    id: 'snapchat', 
    name: 'Snapchat', 
    color: '#fffc00',
    icon: '👻',
    description: 'Photo & video messaging',
    url: 'https://www.snapchat.com',
    connected: false
  },
];

const DEFAULT_CHANNELS = [
  { id: 'general', name: 'general', description: 'General discussion', icon: '💬' },
  { id: 'study', name: 'study-help', description: 'Study and homework help', icon: '📚' },
  { id: 'games', name: 'games', description: 'Gaming discussion', icon: '🎮' },
  { id: 'random', name: 'random', description: 'Off-topic chat', icon: '🎲' },
];

const CHANNELS_KEY = 'nexus_channels';

export default function Social() {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [view, setView] = useState('chat'); // 'chat' or 'external'
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const accentColor = '#5865f2';

  useEffect(() => {
    loadChannels();
    loadCurrentUser();
    monitorOnlineUsers();

    const tick = () => {
      if (document.visibilityState === 'visible') {
        monitorOnlineUsers();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        monitorOnlineUsers();
      }
    };

    const interval = setInterval(tick, 3000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadChannels = () => {
    try {
      let saved = JSON.parse(localStorage.getItem(CHANNELS_KEY) || '[]');
      if (saved.length === 0) {
        saved = DEFAULT_CHANNELS;
        localStorage.setItem(CHANNELS_KEY, JSON.stringify(saved));
      }
      const channelObjects = saved.map(c => Channel.fromJSON(c));
      setChannels(channelObjects);
      setActiveChannel(channelObjects[0]);
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  };

  const loadCurrentUser = () => {
    // Get user info from localStorage (set during auth)
    const userName = localStorage.getItem('nexus_user_email') || sessionStorage.getItem('nexus_user_email');
    
    if (!userName) {
      // Create anonymous user
      const anonId = 'anon-' + Math.random().toString(36).substr(2, 9);
      const anonUser = {
        id: anonId,
        username: 'Anonymous#' + Math.floor(Math.random() * 9999),
        avatar: null,
        anonymous: true
      };
      setCurrentUser(anonUser);
      updatePresence(anonUser);
    } else {
      setCurrentUser({
        id: userName,
        username: userName,
        avatar: null
      });
      updatePresence({
        id: userName,
        username: userName
      });
    }
  };

  const updatePresence = (user) => {
    try {
      const presence = JSON.parse(localStorage.getItem('nexus_presence') || '[]');
      const filtered = presence.filter(p => p.id !== user.id);
      filtered.push({ ...user, lastSeen: Date.now() });
      localStorage.setItem('nexus_presence', JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  };

  const monitorOnlineUsers = () => {
    try {
      const presence = JSON.parse(localStorage.getItem('nexus_presence') || '[]');
      const now = Date.now();
      
      // Filter out stale entries (inactive for more than 15 minutes)
      const STALE_THRESHOLD = 15 * 60 * 1000; // 15 minutes
      const cleaned = presence.filter(p => {
        // Validate lastSeen is a valid number
        if (typeof p.lastSeen !== 'number' || isNaN(p.lastSeen)) {
          return false; // Remove corrupted entries
        }
        // Keep entries that were seen within last 15 minutes
        return now - p.lastSeen < STALE_THRESHOLD;
      });
      
      // Update localStorage only when cleanup changed the payload
      const originalSerialized = JSON.stringify(presence);
      const cleanedSerialized = JSON.stringify(cleaned);
      if (cleanedSerialized !== originalSerialized) {
        localStorage.setItem('nexus_presence', cleanedSerialized);
      }
      
      // Show only users who are currently online (within 10 seconds)
      const online = cleaned.filter(p => now - p.lastSeen < 10000);
      setOnlineUsers(online);
    } catch (err) {
      console.error('Failed to monitor users:', err);
    }
  };

  const createChannel = () => {
    const name = prompt('Channel name:');
    if (!name) return;
    
    const channel = new Channel({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      icon: '💬'
    });
    
    try {
      const saved = JSON.parse(localStorage.getItem(CHANNELS_KEY) || '[]');
      saved.push(channel.toJSON());
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(saved));
      loadChannels();
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatedBackground type="soft-particle-drift" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 bg-black/40 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button 
              onClick={goBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold" style={{ color: accentColor }}>
              Nexus Chat
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {onlineUsers.length} online
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Sidebar - Channels */}
          <div className="w-60 bg-black/40 backdrop-blur-sm border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xs font-semibold text-white/60 uppercase mb-3">Text Channels</h2>
              <div className="space-y-1">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors ${
                      activeChannel?.id === channel.id ? 'bg-white/10 text-white' : 'text-white/60'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="text-sm">{channel.name}</span>
                  </button>
                ))}
              </div>
              
              {session.isAdmin() && (
                <button
                  onClick={createChannel}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 transition-colors text-white/60 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create Channel</span>
                </button>
              )}
            </div>

            {/* Online users */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">
                Online — {onlineUsers.length}
              </h3>
              <div className="space-y-2">
                {onlineUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-semibold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80">{user.username}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User panel */}
            <div className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-semibold">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{currentUser.username}</div>
                <div className="text-xs text-white/50">Online</div>
              </div>
              <button className="text-white/60 hover:text-white">
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1">
            {activeChannel ? (
              <ChatWindow channel={activeChannel} currentUser={currentUser} />
            ) : (
              <div className="h-full flex items-center justify-center text-white/50">
                Select a channel to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}