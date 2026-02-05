import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Palette, 
  Monitor, 
  Cpu,
  Layers,
  Gamepad2,
  Boxes,
  Brain,
  Key,
  Shield,
  LogOut,
  Save,
  Download,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  Globe,
  Zap,
  Accessibility,
  Layout,
  MousePointer,
  Sparkles,
  Wand2,
  Search as SearchIcon,
  Clock,
  Plus,
  Trash2 as TrashIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils.js';
import NeonButton from '../Components/UI/NeonButton.js';
import { Input } from '../Components/UI/input.js';
import { storage, session } from '../Components/Storage/clientStorage.js';
import { settingsEmitter } from '../utils/settingsEmitter.js';
import SoftParticleDrift from '../Components/Backgrounds/SoftParticleDrift.js';
import SettingsSection from '../Components/Settings/SettingsSection.js';
import SettingControl from '../Components/Settings/SettingControl.js';
import APISetupWizard from '../Components/Setup/APISetupWizard.js';
import DeviceProfileManager from '../Components/Settings/DeviceProfileManager.js';
import DiscordVerification from '../Components/Settings/DiscordVerification.js';

const BUILD_VERSION = 'v0.10.0-beta';

// Validation utility functions
const validateTimeFormat = (time) => {
  // Validates HH:MM format (24-hour)
  const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
  return timeRegex.test(time);
};

const parseTimeToMinutes = (timeStr) => {
  // Converts "HH:MM" to minutes since midnight
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const checkPeriodsOverlap = (periods) => {
  // Returns array of overlap messages, empty if no overlaps
  const overlaps = [];
  
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const period1 = periods[i];
      const period2 = periods[j];
      
      if (!period1.enabled || !period2.enabled) continue;
      
      const start1 = parseTimeToMinutes(period1.startTime);
      const end1 = parseTimeToMinutes(period1.endTime);
      const start2 = parseTimeToMinutes(period2.startTime);
      const end2 = parseTimeToMinutes(period2.endTime);
      
      // Check if periods overlap
      if ((start1 < end2 && end1 > start2)) {
        overlaps.push(
          `"${period1.name}" (${period1.startTime}-${period1.endTime}) overlaps with "${period2.name}" (${period2.startTime}-${period2.endTime})`
        );
      }
    }
  }
  
  return overlaps;
};

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: { 
      mode: 'dark', // light, dark, amoled
      background: '#0a0a0f', 
      accent: '#00f0ff', 
      text: '#ffffff',
      contrast: 'normal', // normal, high
      blur: true,
      transparency: true
    },
    background: { type: 'soft-particle-drift', particleCount: 50, speed: 0.5, opacity: 0.4, blur: 2 },
    layout: {
      density: 'default', // compact, default, comfortable
    },
    motion: {
      animations: 'full', // full, reduced, none
    },
    input: {
      holdToConfirm: false,
      contextMenus: true,
      scrollSpeed: 1,
    },
    accessibility: {
      // Vision
      grayscale: false,
      colorblindMode: 'none',
      cursorSize: 'normal',
      cursorHighlight: false,
      linkUnderlines: false,
      iconLabels: false,
      textSelectionColor: '#00f0ff',
      // Reading
      dyslexiaFont: false,
      readingRuler: false,
      lineHeight: 'normal',
      focusMode: false,
      bionicReading: false,
      readingGuide: false,
      largeText: false,
      // Audio
      soundEffects: false,
      screenReaderAnnouncements: true,
      alertTones: true,
      reducedSound: false,
      // Timing
      extendedTimeout: false,
      breakReminders: false,
      breakInterval: 25,
      timeLimitWarnings: true,
      globalPause: false,
      // Input
      stickyKeys: false,
      clickAssist: false,
      clickDelay: 1000,
      oneHandedMode: false,
      // Cognitive
      simplifiedUI: false,
      plainLanguage: false,
      extraConfirmations: true,
      undoBuffer: true,
      // Safety & Panic
      photosensitiveMode: false,
      autoplayControl: true,
      panicButton: true,
      panicSite: 'classroom',
      panicReturnTimeout: 60,
      fakeTabName: 'IXL | Math, Language Arts, Science, Social Studies, and Spanish',
      // General
      focusIndicators: true,
      reducedTransparency: false,
      screenReaderOptimized: false
    },
    performance: { targetFPS: 60, ramLimit: 1024, animationScale: 1, widgetLimit: 3, adaptivePerf: true, showFPS: false },
    games: { fullscreenOnLaunch: true, escToClose: true, lazyLoadStrength: 'medium' },
    widgets: { enabled: true, spotify: true, youtube: true, tiktok: false, autoDisable: true, dockInSidebar: true },
    aiTools: { 
      enabled: false, 
      autoSuggest: true, 
      personality: 'adaptive',
      apiProvider: 'none',
      apiKey: '',
      model: 'gpt-3.5-turbo'
    },
    browser: { openLinksIn: 'nexus', searchEngine: 'startpage' },
    schedule: {
      enabled: false,
      showInTopBar: true,
      notifyBeforeEnd: 5,
      periods: []
    },
    stealth: {
      idleDecoyEnabled: false,
      idleDecoyTimeout: 3,
      bossKeyEnabled: true,
      bossKey: '`'
    },
    lowEndMode: false
  });
  
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([
    { id: 'default', name: 'Default', device: 'Standard' }
  ]);
  const [activeProfile, setActiveProfile] = useState('default');
  const [accessCode, setAccessCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [regenerateCooldown, setRegenerateCooldown] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState('guest');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [showUpdatesHover, setShowUpdatesHover] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editPassword, setEditPassword] = useState(false);
  const [showAPIWizard, setShowAPIWizard] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveNotification, setSaveNotification] = useState('');
  const [periodValidationWarnings, setPeriodValidationWarnings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
    const interval = setInterval(() => {
      if (regenerateCooldown > 0) setRegenerateCooldown(prev => prev - 1);
    }, 1000);
    
    // ESC key handler
    const handleEscape = (e) => {
      if (e.key === 'Escape' && window.location.pathname.includes('updates')) {
        navigate(createPageUrl('Settings'));
      }
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [regenerateCooldown]);

  const loadSettings = async () => {
    try {
      const accountCode = session.get();
      if (!accountCode) {
        navigate(createPageUrl('Landing'));
        return;
      }

      const role = session.getRole();
      setUserRole(role);
      setIsAdmin(session.isAdmin());
      setAccessCode(accountCode);
      
      // Load invite code if admin or owner
      if (session.isAdmin()) {
        const code = storage.getInviteCode();
        setInviteCode(code);
      }

      await storage.init();
      const userData = await storage.loadUser(accountCode);
      const userSettings = await storage.loadSettings();

      setUser(userData);
      if (userSettings) {
        setSettings(prev => ({ ...prev, ...userSettings }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      // Auto-save to IndexedDB immediately
      storage.saveSettings(updated).catch(err => console.error('Failed to save settings:', err));
      
      // Emit settings change event to notify other components
      settingsEmitter.emit(updated);
      
      // Show brief save notification
      setSaveNotification('Saved');
      setTimeout(() => setSaveNotification(''), 1500);
      
      return updated;
    });
  };

  const saveSettings = async () => {
    try {
      await storage.saveSettings(settings);
      alert('Settings saved!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const exportData = async () => {
    const data = await storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSettings = async () => {
    try {
      const currentSettings = await storage.loadSettings();
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        settings: currentSettings
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-settings-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Settings exported successfully!');
    } catch (err) {
      console.error('Failed to export settings:', err);
      alert('Failed to export settings. Please try again.');
    }
  };

  const importSettings = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importData = JSON.parse(event.target.result);
            
            if (!importData.settings) {
              alert('Invalid settings file format.');
              return;
            }

            // Merge imported settings with defaults to ensure all fields exist
            const mergedSettings = {
              theme: { ...settings.theme, ...importData.settings.theme },
              background: { ...settings.background, ...importData.settings.background },
              performance: { ...settings.performance, ...importData.settings.performance },
              games: { ...settings.games, ...importData.settings.games },
              widgets: { ...settings.widgets, ...importData.settings.widgets },
              aiTools: { ...settings.aiTools, ...importData.settings.aiTools },
              browser: { ...settings.browser, ...importData.settings.browser },
              lowEndMode: importData.settings.lowEndMode ?? settings.lowEndMode
            };

            await storage.saveSettings(mergedSettings);
            setSettings(mergedSettings);
            settingsEmitter.emit(mergedSettings);
            
            alert('Settings imported successfully! Page will reload to apply changes.');
            setTimeout(() => window.location.reload(), 1000);
          } catch (err) {
            console.error('Failed to parse settings file:', err);
            alert('Invalid settings file. Please check the file and try again.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    } catch (err) {
      console.error('Failed to import settings:', err);
      alert('Failed to import settings. Please try again.');
    }
  };

  const deleteAllData = async () => {
    if (!confirm('Delete ALL data? This cannot be undone.')) return;
    await storage.deleteAllData();
    session.clear();
    navigate(createPageUrl('Landing'));
  };

  const handleLogout = () => {
    session.clear();
    navigate(createPageUrl('Landing'));
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      alert('Username cannot be empty');
      return;
    }
    
    try {
      const updatedUser = { ...user, username: newUsername };
      await storage.saveUser(newUsername, accessCode);
      setUser(updatedUser);
      setEditUsername(false);
      setNewUsername('');
      alert('Username updated successfully!');
    } catch (err) {
      console.error('Failed to update username:', err);
      alert('Failed to update username');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 5) {
      alert('Password must be at least 5 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      // Update access code (password)
      const newCode = newPassword;
      await storage.saveUser(user.username, newCode);
      session.set(newCode, true, userRole);
      setAccessCode(newCode);
      setEditPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully! Please use your new password to log in next time.');
    } catch (err) {
      console.error('Failed to update password:', err);
      alert('Failed to update password');
    }
  };

  const regenerateInviteCode = () => {
    if (regenerateCooldown > 0) return;
    
    if (!confirm('Generate a new invite code? The old one will no longer work for new users!')) return;
    
    const newCode = storage.regenerateInviteCode();
    setInviteCode(newCode);
    setRegenerateCooldown(10);
    
    alert(`New invite code: ${newCode}\n\nShare this with new users. It will auto-regenerate after someone uses it.`);
  };

  const createProfile = (name) => {
    const newProfile = {
      id: Date.now().toString(),
      name,
      device: 'Custom',
      settings: { ...settings }
    };
    setProfiles(prev => [...prev, newProfile]);
  };

  const switchProfile = (id) => {
    setActiveProfile(id);
    const profile = profiles.find(p => p.id === id);
    if (profile?.settings) {
      setSettings(profile.settings);
    }
  };

  const deleteProfile = (id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfile === id) setActiveProfile('default');
  };

  const sections = useMemo(() => {
    const allSections = [
      {
        id: 'account',
        title: 'Account & Verification',
        icon: Key,
        keywords: ['account', 'access', 'code', 'login', 'regenerate', 'discord', 'verify'],
        custom: (
          <div className="space-y-4">
            {/* Discord Verification */}
            <DiscordVerification role={userRole} />

            {/* Role Upgrade Options */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
              <h4 className="text-white font-medium mb-3">Upgrade Your Account</h4>
              
              {userRole === 'guest' && (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm mb-3">
                    Ready to unlock premium features?
                  </p>
                  <a
                    href="https://discord.gg/nexushub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <NeonButton className="w-full">
                      ✨ Ready to Verify? Join Discord
                    </NeonButton>
                  </a>
                  <p className="text-xs text-white/40 mt-2">
                    Verify your Discord membership to become a Verified user with full access!
                  </p>
                </div>
              )}
              
              {userRole === 'verified' && (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm mb-3">
                    Enjoying Nexus? You already have full access to all features!
                  </p>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <strong>Verified User</strong> - Complete access unlocked
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      You have access to all games, features, and tools. Thanks for being part of Nexus!
                    </p>
                  </div>
                </div>
              )}
              
              {(userRole === 'admin' || userRole === 'owner') && (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <p className="text-sm">You have {userRole === 'owner' ? 'Owner' : 'Admin'} privileges - highest access level!</p>
                </div>
              )}
            </div>

            {/* Admin Invite Code Management */}
            {isAdmin && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="text-cyan-400 font-medium mb-2">Admin Invite Code</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 rounded-lg bg-black/30 font-mono text-cyan-400 text-xl text-center tracking-wider font-bold">
                      {showInviteCode ? inviteCode : '••••••••'}
                    </div>
                    <button
                      onClick={() => setShowInviteCode(!showInviteCode)}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors"
                      title={showInviteCode ? 'Hide code' : 'Show code'}
                    >
                      {showInviteCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteCode);
                        alert('Invite code copied!');
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    Share this code with new users. It will auto-regenerate after someone uses it.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Manual Regenerate</h4>
                  <p className="text-white/60 text-sm mb-3">
                    Generate a new invite code (old one will no longer work).
                  </p>
                  <NeonButton
                    onClick={regenerateInviteCode}
                    disabled={regenerateCooldown > 0}
                    className="w-full"
                  >
                    {regenerateCooldown > 0 ? `Wait ${regenerateCooldown}s` : 'Regenerate Invite Code'}
                  </NeonButton>
                </div>
              </div>
            )}

            {/* User Access Code */}
            {!isAdmin && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-2">Your Access Code</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-black/30 font-mono text-cyan-400 text-lg text-center tracking-wider">
                    {showAccessCode ? accessCode : '•'.repeat(accessCode.length || 8)}
                  </div>
                  <button
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title={showAccessCode ? 'Hide code' : 'Show code'}
                  >
                    {showAccessCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(accessCode)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  This is your login code. Save it somewhere safe!
                </p>
              </div>
            )}
          </div>
        )
      },
      {
        id: 'theme',
        title: 'Theme & Colors',
        icon: Palette,
        keywords: ['color', 'theme', 'accent', 'background', 'appearance', 'dark', 'light', 'amoled', 'contrast'],
        controls: [
          { path: 'theme.mode', title: 'Theme Mode', description: 'Overall color scheme', type: 'dropdown', value: settings.theme.mode, options: [
            { value: 'light', label: '☀️ Light - Bright & airy' },
            { value: 'dark', label: '🌙 Dark - Easy on eyes' },
            { value: 'amoled', label: '⚫ AMOLED - Pure black' }
          ]},
          { path: 'theme.accent', title: 'Accent Color', description: 'Buttons, links & highlights', type: 'dropdown', value: settings.theme.accent, options: [
            { value: '#00f0ff', label: '🔵 Cyan (Default)' },
            { value: '#a55eea', label: '🟣 Purple' },
            { value: '#26de81', label: '🟢 Green' },
            { value: '#fc5c65', label: '🔴 Red' },
            { value: '#fd9644', label: '🟠 Orange' },
            { value: '#fed330', label: '🟡 Yellow' },
            { value: '#45aaf2', label: '🔵 Blue' },
            { value: '#f368e0', label: '🟣 Pink' }
          ]},
          { path: 'theme.contrast', title: 'Contrast Level', description: 'Text & UI contrast', type: 'dropdown', value: settings.theme.contrast, options: [
            { value: 'normal', label: 'Normal - Balanced' },
            { value: 'high', label: 'High - Maximum readability' }
          ]},
          { path: 'theme.blur', title: 'Blur Effects', description: 'Glassmorphism blur', type: 'toggle', value: settings.theme.blur },
          { path: 'theme.transparency', title: 'Transparency', description: 'Semi-transparent UI', type: 'toggle', value: settings.theme.transparency }
        ]
      },
      {
        id: 'layout',
        title: 'Layout & Density',
        icon: Layout,
        keywords: ['layout', 'density', 'spacing', 'compact', 'comfortable', 'padding'],
        controls: [
          { path: 'layout.density', title: 'Layout Density', description: 'Spacing & element size', type: 'dropdown', value: settings.layout.density, options: [
            { value: 'compact', label: 'Compact - Tight spacing, more content' },
            { value: 'default', label: 'Default - Balanced' },
            { value: 'comfortable', label: 'Comfortable - Touch-friendly, spacious' }
          ]}
        ]
      },
      {
        id: 'motion',
        title: 'Motion & Animations',
        icon: Sparkles,
        keywords: ['animation', 'motion', 'transition', 'reduced', 'accessibility'],
        controls: [
          { path: 'motion.animations', title: 'Animation Level', description: 'UI motion & transitions', type: 'dropdown', value: settings.motion.animations, options: [
            { value: 'full', label: 'Full - Smooth animations' },
            { value: 'reduced', label: 'Reduced - Minimal motion' },
            { value: 'none', label: 'None - Instant transitions' }
          ]}
        ]
      },
      {
        id: 'input',
        title: 'Input & Interaction',
        icon: MousePointer,
        keywords: ['input', 'mouse', 'keyboard', 'interaction', 'scroll', 'confirm'],
        controls: [
          { path: 'input.holdToConfirm', title: 'Hold to Confirm', description: 'Require holding for destructive actions', type: 'toggle', value: settings.input.holdToConfirm },
          { path: 'input.contextMenus', title: 'Context Menus', description: 'Enable right-click menus', type: 'toggle', value: settings.input.contextMenus },
          { path: 'input.scrollSpeed', title: 'Scroll Speed', description: 'Scrolling sensitivity', type: 'slider', value: settings.input.scrollSpeed, min: 0.5, max: 2, step: 0.1 }
        ]
      },
      {
        id: 'accessibility',
        title: 'Accessibility',
        icon: Accessibility,
        keywords: ['accessibility', 'a11y', 'disability', 'dyslexia', 'grayscale', 'screen reader', 'focus', 'inclusive', 'colorblind', 'reading', 'audio', 'cognitive'],
        controls: [
          // Visual Assistance
          { path: 'accessibility.grayscale', title: '🎨 Grayscale Mode', description: 'Remove all colors (focus aid)', type: 'toggle', value: settings.accessibility?.grayscale },
          { path: 'accessibility.colorblindMode', title: '🌈 Colorblind Filter', description: 'Adjust colors for color vision deficiency', type: 'dropdown', value: settings.accessibility?.colorblindMode || 'none', options: [
            { value: 'none', label: 'None - Standard colors' },
            { value: 'deuteranopia', label: 'Deuteranopia (Red-Green)' },
            { value: 'protanopia', label: 'Protanopia (Red-Weak)' },
            { value: 'tritanopia', label: 'Tritanopia (Blue-Yellow)' },
            { value: 'achromatopsia', label: 'Achromatopsia (Complete)' }
          ]},
          { path: 'accessibility.cursorSize', title: '🖱️ Cursor Size', description: 'Make cursor easier to see', type: 'dropdown', value: settings.accessibility?.cursorSize || 'normal', options: [
            { value: 'normal', label: 'Normal' },
            { value: 'large', label: 'Large (1.5x)' },
            { value: 'xlarge', label: 'Extra Large (2x)' }
          ]},
          { path: 'accessibility.cursorHighlight', title: '⭕ Cursor Highlight', description: 'Circle around cursor for visibility', type: 'toggle', value: settings.accessibility?.cursorHighlight },
          { path: 'accessibility.linkUnderlines', title: '🔗 Always Underline Links', description: 'Show underlines on all links', type: 'toggle', value: settings.accessibility?.linkUnderlines },
          { path: 'accessibility.iconLabels', title: '🏷️ Always Show Labels', description: 'Text labels on icon buttons', type: 'toggle', value: settings.accessibility?.iconLabels },
          
          // Reading Support
          { path: 'accessibility.dyslexiaFont', title: '📖 Dyslexia-Friendly Font', description: 'OpenDyslexic for easier reading', type: 'toggle', value: settings.accessibility?.dyslexiaFont },
          { path: 'accessibility.readingRuler', title: '📏 Reading Ruler', description: 'Highlight current line', type: 'toggle', value: settings.accessibility?.readingRuler },
          { path: 'accessibility.lineHeight', title: '📐 Line Spacing', description: 'Space between text lines', type: 'dropdown', value: settings.accessibility?.lineHeight || 'normal', options: [
            { value: 'compact', label: 'Compact (1.4)' },
            { value: 'normal', label: 'Normal (1.6)' },
            { value: 'relaxed', label: 'Relaxed (1.8)' },
            { value: 'loose', label: 'Loose (2.0)' }
          ]},
          { path: 'accessibility.focusMode', title: '🎯 Focus Mode', description: 'Hide distractions, show current content', type: 'toggle', value: settings.accessibility?.focusMode },
          { path: 'accessibility.bionicReading', title: '⚡ Bionic Reading', description: 'Bold first letters for faster scanning', type: 'toggle', value: settings.accessibility?.bionicReading },
          { path: 'accessibility.readingGuide', title: '📍 Reading Guide', description: 'Vertical line following cursor', type: 'toggle', value: settings.accessibility?.readingGuide },
          { path: 'accessibility.largeText', title: '🔤 Large Text', description: 'Increase all text sizes (125%)', type: 'toggle', value: settings.accessibility?.largeText },
          
          // Audio & Feedback
          { path: 'accessibility.soundEffects', title: '🔊 Sound Effects', description: 'Audio feedback for actions', type: 'toggle', value: settings.accessibility?.soundEffects },
          { path: 'accessibility.screenReaderAnnouncements', title: '📢 Live Announcements', description: 'Announce dynamic content changes', type: 'toggle', value: settings.accessibility?.screenReaderAnnouncements },
          { path: 'accessibility.alertTones', title: '🔔 Alert Tones', description: 'Different sounds for notifications', type: 'toggle', value: settings.accessibility?.alertTones },
          { path: 'accessibility.reducedSound', title: '🔉 Reduce Sound', description: 'Lower volume for UI sounds', type: 'toggle', value: settings.accessibility?.reducedSound },
          
          // Timing & Breaks
          { path: 'accessibility.extendedTimeout', title: '⏱️ Extended Timeout', description: 'Disable auto-logout timeouts', type: 'toggle', value: settings.accessibility?.extendedTimeout },
          { path: 'accessibility.breakReminders', title: '☕ Break Reminders', description: 'Pomodoro-style rest notifications', type: 'toggle', value: settings.accessibility?.breakReminders },
          { path: 'accessibility.breakInterval', title: '⏲️ Break Interval', description: 'Minutes between break reminders', type: 'slider', value: settings.accessibility?.breakInterval || 25, min: 15, max: 90, step: 5, suffix: ' min' },
          { path: 'accessibility.timeLimitWarnings', title: '⚠️ Timeout Warnings', description: 'Alert before auto-logout', type: 'toggle', value: settings.accessibility?.timeLimitWarnings },
          
          // Input Alternatives
          { path: 'accessibility.stickyKeys', title: '🔐 Sticky Keys', description: 'Hold modifiers without holding', type: 'toggle', value: settings.accessibility?.stickyKeys },
          { path: 'accessibility.clickAssist', title: '👆 Click Assist', description: 'Auto-click on hover after delay', type: 'toggle', value: settings.accessibility?.clickAssist },
          { path: 'accessibility.clickDelay', title: '⏳ Click Delay', description: 'Hover time before auto-click', type: 'slider', value: settings.accessibility?.clickDelay || 1000, min: 500, max: 3000, step: 100, suffix: ' ms' },
          { path: 'accessibility.oneHandedMode', title: '🤚 One-Handed Mode', description: 'Optimized for single-hand use', type: 'toggle', value: settings.accessibility?.oneHandedMode },
          
          // Cognitive Support
          { path: 'accessibility.simplifiedUI', title: '🎪 Simplified UI', description: 'Essential features only', type: 'toggle', value: settings.accessibility?.simplifiedUI },
          { path: 'accessibility.plainLanguage', title: '💬 Plain Language', description: 'Simpler explanations', type: 'toggle', value: settings.accessibility?.plainLanguage },
          { path: 'accessibility.extraConfirmations', title: '✅ Extra Confirmations', description: 'Confirm important actions', type: 'toggle', value: settings.accessibility?.extraConfirmations },
          { path: 'accessibility.undoBuffer', title: '↩️ Undo Actions', description: 'Ability to undo recent changes', type: 'toggle', value: settings.accessibility?.undoBuffer },
          
          // Safety & Warnings
          { path: 'accessibility.photosensitiveMode', title: '⚡ Photosensitive Protection', description: 'Reduce flashing & strobing', type: 'toggle', value: settings.accessibility?.photosensitiveMode },
          { path: 'accessibility.autoplayControl', title: '▶️ Prevent Autoplay', description: 'Stop auto-playing media', type: 'toggle', value: settings.accessibility?.autoplayControl },
          { path: 'accessibility.panicButton', title: '🚨 Panic Button (ESC)', description: 'Quick switch to innocent site', type: 'toggle', value: settings.accessibility?.panicButton },
          { path: 'accessibility.panicSite', title: '🎯 Panic Redirect', description: 'Site to open when ESC pressed', type: 'dropdown', value: settings.accessibility?.panicSite || 'classroom', options: [
            { value: 'classroom', label: '📚 Google Classroom' },
            { value: 'ixl', label: '📊 IXL Learning' },
            { value: 'canva', label: '🎨 Canva' },
            { value: 'docs', label: '📝 Google Docs' },
            { value: 'drive', label: '💾 Google Drive' },
            { value: 'gmail', label: '📧 Gmail' },
            { value: 'newtab', label: '🌐 New Tab (Google)' },
            { value: 'blank', label: '⚪ Blank Page' }
          ]},
          { 
            path: 'accessibility.panicReturnTimeout',
            title: '⏱️ Return Link Expires',
            description: 'Auto-clear local return data after inactivity (applies to panic return + general leave)',
            type: 'slider',
            value: settings.accessibility?.panicReturnTimeout ?? 60,
            min: 0,
            max: 485,
            step: 5,
            formatValue: (val) => {
              if (val <= 0 || val >= 485) return 'Data erased disabled';
              const hours = Math.floor(val / 60);
              const minutes = val % 60;
              if (hours >= 1) return `${hours}:${minutes.toString().padStart(2, '0')}`;
              return `${val} min`;
            }
          },
          { 
            path: 'accessibility.fakeTabName',
            title: '📑 Tab Name Disguise',
            description: 'Tab name shown when you switch away (makes it look like you\'re studying)',
            type: 'dropdown',
            value: settings.accessibility?.fakeTabName ?? 'IXL | Math, Language Arts, Science, Social Studies, and Spanish',
            options: [
              { value: 'Google Classroom', label: '📚 Google Classroom' },
              { value: 'IXL | Math, Language Arts, Science, Social Studies, and Spanish', label: '📊 IXL (Full Title)' },
              { value: 'IXL - Math Practice', label: '🔢 IXL - Math Practice' },
              { value: 'Google Docs', label: '📄 Google Docs' },
              { value: 'Google Drive', label: '💾 Google Drive' },
              { value: 'Canvas', label: '🎨 Canvas' },
              { value: 'Quizlet', label: '📇 Quizlet' },
              { value: 'Assignments - Google Classroom', label: '✏️ Assignments' },
              { value: 'Untitled document - Google Docs', label: '📝 Untitled Doc' },
              { value: 'My Drive - Google Drive', label: '🗂️ My Drive' }
            ]
          },
          
          // General
          { path: 'accessibility.focusIndicators', title: '🔍 Enhanced Focus', description: 'Stronger keyboard focus outlines', type: 'toggle', value: settings.accessibility?.focusIndicators },
          { path: 'accessibility.reducedTransparency', title: '🪟 Reduce Transparency', description: 'Solid backgrounds for clarity', type: 'toggle', value: settings.accessibility?.reducedTransparency },
          { path: 'accessibility.screenReaderOptimized', title: '♿ Screen Reader Mode', description: 'Optimize for assistive tech', type: 'toggle', value: settings.accessibility?.screenReaderOptimized }
        ]
      },
      {
        id: 'backgrounds',
        title: 'Backgrounds & Animations',
        icon: Monitor,
        keywords: ['background', 'particle', 'animation', 'blur', 'motion'],
        controls: [
          { path: 'background.particleCount', title: 'Particle Count', description: 'Number of animated particles', type: 'slider', value: settings.background.particleCount, min: 20, max: 100 },
          { path: 'background.speed', title: 'Motion Speed', description: 'Particle movement speed', type: 'slider', value: settings.background.speed, min: 0.1, max: 2, step: 0.1 },
          { path: 'background.opacity', title: 'Opacity', description: 'Particle visibility', type: 'slider', value: settings.background.opacity, min: 0.1, max: 1, step: 0.1 },
          { path: 'background.blur', title: 'Blur Intensity', description: 'Glow effect strength', type: 'slider', value: settings.background.blur, min: 0, max: 5 }
        ]
      },
      {
        id: 'performance',
        title: 'Performance Behavior',
        icon: Cpu,
        keywords: ['fps', 'performance', 'ram', 'animation', 'adaptive', 'optimize'],
        controls: [
          { path: 'performance.showFPS', title: 'FPS Counter', description: 'Show FPS monitor', type: 'toggle', value: settings.performance.showFPS },
          { path: 'performance.targetFPS', title: 'Target FPS', description: 'Preferred frame rate', type: 'slider', value: settings.performance.targetFPS, min: 15, max: 60, suffix: ' FPS' },
          { path: 'performance.ramLimit', title: 'RAM Soft Limit', description: 'Memory threshold (MB)', type: 'slider', value: settings.performance.ramLimit, min: 512, max: 4096, suffix: ' MB' },
          { path: 'performance.animationScale', title: 'Animation Scaling', description: 'Detail reduction strength', type: 'slider', value: settings.performance.animationScale, min: 0.5, max: 1, step: 0.1 },
          { path: 'performance.widgetLimit', title: 'Widget Limit', description: 'Max concurrent widgets', type: 'slider', value: settings.performance.widgetLimit, min: 1, max: 5 },
          { path: 'performance.adaptivePerf', title: 'Adaptive Performance', description: 'Auto-adjust quality', type: 'toggle', value: settings.performance.adaptivePerf }
        ]
      },
      {
        id: 'devices',
        title: 'Device Profiles',
        icon: Layers,
        keywords: ['device', 'profile', 'chromebook', 'pc', 'switch'],
        custom: <DeviceProfileManager profiles={profiles} activeProfile={activeProfile} onSwitch={switchProfile} onCreate={createProfile} onDelete={deleteProfile} />
      },
      {
        id: 'games',
        title: 'Games & Iframes',
        icon: Gamepad2,
        keywords: ['game', 'iframe', 'fullscreen', 'esc', 'lazy'],
        controls: [
          { path: 'games.fullscreenOnLaunch', title: 'Fullscreen on Launch', description: 'Auto-fullscreen games', type: 'toggle', value: settings.games.fullscreenOnLaunch },
          { path: 'games.escToClose', title: 'ESC to Close', description: 'Press ESC to exit games', type: 'toggle', value: settings.games.escToClose },
          { path: 'games.lazyLoadStrength', title: 'Lazy Load Strength', description: 'Resource loading strategy', type: 'dropdown', value: settings.games.lazyLoadStrength, options: [
            { value: 'low', label: 'Low (load all)' },
            { value: 'medium', label: 'Medium (smart)' },
            { value: 'high', label: 'High (minimal)' }
          ]}
        ]
      },
      {
        id: 'schedule',
        title: 'Class Schedule',
        icon: Clock,
        keywords: ['schedule', 'class', 'period', 'bell', 'time', 'reminder'],
        controls: [
          { path: 'schedule.enabled', title: '📅 Enable Schedule Tracking', description: 'Track your class periods and get notifications', type: 'toggle', value: settings.schedule?.enabled ?? false },
          { path: 'schedule.showInTopBar', title: '📊 Show in Top Bar', description: 'Display current class and time remaining', type: 'toggle', value: settings.schedule?.showInTopBar ?? true },
          { path: 'schedule.notifyBeforeEnd', title: '⏰ Notify Before Class Ends', description: 'Minutes before class ends to remind you to pack up', type: 'slider', value: settings.schedule?.notifyBeforeEnd ?? 5, min: 1, max: 15, suffix: ' min' }
        ],
        customUI: 'schedule'
      },
      {
        id: 'stealth',
        title: 'Stealth & Cover',
        icon: Eye,
        keywords: ['stealth', 'cover', 'boss', 'idle', 'decoy', 'hide'],
        controls: [
          { path: 'stealth.idleDecoyEnabled', title: '🕵️ Idle Decoy Mode', description: 'Show fake homework screen after inactivity', type: 'toggle', value: settings.stealth?.idleDecoyEnabled ?? false },
          { path: 'stealth.idleDecoyTimeout', title: '⏱️ Idle Timeout', description: 'Minutes of inactivity before decoy appears', type: 'slider', value: settings.stealth?.idleDecoyTimeout ?? 3, min: 1, max: 10, suffix: ' min' },
          { path: 'stealth.bossKeyEnabled', title: '⚡ Boss Key', description: 'Quick-cover hotkey (backtick key)', type: 'toggle', value: settings.stealth?.bossKeyEnabled ?? true }
        ]
      },
      {
        id: 'browser',
        title: 'Browser Settings',
        icon: Globe,
        keywords: ['browser', 'links', 'open', 'external', 'nexus', 'search', 'engine'],
        controls: [
          { path: 'browser.openLinksIn', title: 'Open Links In', description: 'Where to open game & video links', type: 'dropdown', value: settings.browser?.openLinksIn || 'nexus', options: [
            { value: 'nexus', label: 'Nexus Browser (Built-in)' },
            { value: 'external', label: 'External Browser' }
          ]},
          { path: 'browser.searchEngine', title: 'Search Engine', description: 'Default search engine for queries (iframe-friendly)', type: 'dropdown', value: settings.browser?.searchEngine || 'startpage', options: [
            { value: 'startpage', label: 'Startpage' },
            { value: 'searx', label: 'SearX' },
            { value: 'metager', label: 'MetaGer' },
            { value: 'mojeek', label: 'Mojeek' },
            { value: 'qwant', label: 'Qwant' },
            { value: 'swisscows', label: 'Swisscows' }
          ]}
        ]
      },
      {
        id: 'widgets',
        title: 'Widgets',
        icon: Boxes,
        keywords: ['widget', 'spotify', 'youtube', 'tiktok'],
        controls: [
          { path: 'widgets.enabled', title: 'Enable Widgets', description: 'Show draggable widgets on screen', type: 'toggle', value: settings.widgets.enabled },
          { path: 'widgets.spotify', title: 'Spotify Widget', description: 'Music player widget', type: 'toggle', value: settings.widgets.spotify },
          { path: 'widgets.youtube', title: 'YouTube Widget', description: 'Video feed widget', type: 'toggle', value: settings.widgets.youtube },
          { path: 'widgets.tiktok', title: 'TikTok Widget', description: 'Short video widget', type: 'toggle', value: settings.widgets.tiktok },
          { path: 'widgets.autoDisable', title: 'Auto-Disable Low Perf', description: 'Disable on low FPS', type: 'toggle', value: settings.widgets.autoDisable }
        ]
      },
      {
        id: 'ai',
        title: 'AI Tools',
        icon: Brain,
        keywords: ['ai', 'assistant', 'suggest', 'chat', 'personality'],
        controls: [
          { path: 'aiTools.enabled', title: 'AI Assistant', description: 'Enable AI features', type: 'toggle', value: settings.aiTools.enabled },
          { path: 'aiTools.autoSuggest', title: 'Auto Suggestions', description: 'AI-powered hints', type: 'toggle', value: settings.aiTools.autoSuggest },
          { path: 'aiTools.personality', title: 'AI Personality Mode', description: 'How your AI assistant communicates', type: 'dropdown', value: settings.aiTools?.personality || 'adaptive', options: [
            { value: 'adaptive', label: '🔄 Adaptive - Mirrors your style' },
            { value: 'kind', label: '💚 Kind - Always encouraging' },
            { value: 'moody', label: '😏 Moody - Witty and sarcastic' },
            { value: 'professional', label: '💼 Professional - Direct and efficient' },
            { value: 'mentor', label: '🎓 Mentor - Educational & detailed' },
            { value: 'chill', label: '😎 Chill - Relaxed and friendly' }
          ]},
          { path: 'aiTools.apiProvider', title: 'AI Provider', description: 'Choose AI service (requires API key)', type: 'dropdown', value: settings.aiTools?.apiProvider || 'none', options: [
            { value: 'none', label: '❌ None - Template responses only' },
            { value: 'openai', label: '🤖 OpenAI (GPT-3.5/GPT-4)' },
            { value: 'anthropic', label: '🧠 Anthropic (Claude)' },
            { value: 'google', label: '📊 Google (Gemini)' }
          ]},
          { path: 'aiTools.apiKey', title: 'API Key', description: settings.aiTools?.apiProvider === 'openai' ? 'Get from platform.openai.com/api-keys' : settings.aiTools?.apiProvider === 'anthropic' ? 'Get from console.anthropic.com' : settings.aiTools?.apiProvider === 'google' ? 'Get from makersuite.google.com' : 'Your API key (stored locally)', type: 'password', value: settings.aiTools?.apiKey || '', placeholder: 'sk-...' },
          { path: 'aiTools.serpApiKey', title: 'SerpAPI Key (Optional)', description: 'For I.R.I.S autonomous web search - Get from serpapi.com (free tier available)', type: 'password', value: settings.aiTools?.serpApiKey || '', placeholder: 'Your SerpAPI key...' },
          { path: 'aiTools.model', title: 'Model', description: 'AI model to use', type: 'dropdown', value: settings.aiTools?.model || 'gpt-3.5-turbo', options: [
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Cheap)' },
            { value: 'gpt-4', label: 'GPT-4 (Smarter)' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Best)' },
            { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
            { value: 'claude-3-opus', label: 'Claude 3 Opus' },
            { value: 'gemini-pro', label: 'Gemini Pro' }
          ]},
          { 
            type: 'custom', 
            component: (
              <div className="space-y-3">
                {/* I.R.I.S Info Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <SearchIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">I.R.I.S Autonomous Search</h4>
                      <p className="text-white/70 text-sm leading-relaxed">
                        I.R.I.S (Intelligent Research & Information System) automatically searches the web 
                        for real-time information when needed - no configuration required!
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Wikipedia Search</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>DuckDuckGo API</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Weather Data</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Smart Caching</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-cyan-500/20">
                    <p className="text-white/50 text-xs">
                      💡 <strong>Optional:</strong> Add SerpAPI key below for enhanced Google search results
                    </p>
                  </div>
                </div>

                {/* API Setup Wizard Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        Need help setting up AI?
                      </h4>
                      <p className="text-white/60 text-sm mt-1">
                        Our setup wizard will guide you through getting an API key
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAPIWizard(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Launch API Setup Wizard
                  </button>
                </div>
              </div>
            )
          }
        ]
      },
      {
        id: 'account',
        title: 'Account & Access',
        icon: Key,
        keywords: ['account', 'access', 'code', 'login', 'logout'],
        custom: (
          <div className="space-y-4">
            {/* Username Section */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Username</h4>
                {!editUsername && (
                  <NeonButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditUsername(true);
                      setNewUsername(user?.username || '');
                    }}
                  >
                    Edit
                  </NeonButton>
                )}
              </div>
              {editUsername ? (
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <div className="flex gap-2">
                    <NeonButton variant="primary" size="sm" onClick={handleUpdateUsername}>
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </NeonButton>
                    <NeonButton variant="ghost" size="sm" onClick={() => {
                      setEditUsername(false);
                      setNewUsername('');
                    }}>
                      Cancel
                    </NeonButton>
                  </div>
                </div>
              ) : (
                <p className="text-white/70">{user?.username}</p>
              )}
            </div>

            {/* Password Section */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Password / Access Code</h4>
                {!editPassword && (
                  <NeonButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditPassword(true)}
                  >
                    Change
                  </NeonButton>
                )}
              </div>
              {editPassword ? (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (5-20 chars)"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <div className="flex gap-2">
                    <NeonButton variant="primary" size="sm" onClick={handleUpdatePassword}>
                      <Check className="w-3 h-3 mr-1" />
                      Update
                    </NeonButton>
                    <NeonButton variant="ghost" size="sm" onClick={() => {
                      setEditPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}>
                      Cancel
                    </NeonButton>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-white/70 font-mono text-sm">{'•'.repeat(accessCode.length)}</p>
                  <p className="text-white/40 text-xs mt-2">Click "Change" to update your password</p>
                </>
              )}
            </div>

            {/* Settings Import/Export */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <h4 className="text-cyan-400 font-medium mb-2">⚙️ Settings Backup</h4>
              <p className="text-white/60 text-sm mb-3">
                Export your settings as a safety backup or import from a previous export.
              </p>
              <div className="flex gap-2">
                <NeonButton variant="ghost" onClick={exportSettings} className="flex-1">
                  <Download className="w-3 h-3 mr-1" />
                  Export Settings
                </NeonButton>
                <NeonButton variant="primary" onClick={importSettings} className="flex-1">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Import Settings
                </NeonButton>
              </div>
            </div>

            <div className="flex gap-2">
              <NeonButton variant="ghost" onClick={exportData} className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Export All Data
              </NeonButton>
              <NeonButton variant="danger" onClick={deleteAllData} className="flex-1">
                <Trash2 className="w-3 h-3 mr-1" />
                Delete All
              </NeonButton>
            </div>
            <NeonButton variant="ghost" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </NeonButton>
          </div>
        )
      }
    ];

    if (isAdmin) {
      allSections.push({
        id: 'admin',
        title: 'Admin Dashboard',
        icon: Shield,
        keywords: ['admin', 'manage', 'users', 'diagnostics'],
        custom: (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h4 className="text-red-400 font-medium mb-2">Admin Access Active</h4>
              <p className="text-white/60 text-sm">You have elevated privileges. Use responsibly.</p>
            </div>
            <Link to={createPageUrl('AdminDashboard')}>
              <NeonButton variant="primary" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Open Admin Console
              </NeonButton>
            </Link>
          </div>
        )
      });
    }

    return allSections;
  }, [settings, user, profiles, activeProfile, accessCode, regenerateCooldown, isAdmin]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    return sections.filter(section => {
      const titleMatch = section.title.toLowerCase().includes(query);
      const keywordMatch = section.keywords?.some(k => k.includes(query));
      const controlMatch = section.controls?.some(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query)
      );
      return titleMatch || keywordMatch || controlMatch;
    });
  }, [sections, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const expanded = {};
      filteredSections.forEach(section => {
        expanded[section.id] = true;
      });
      setExpandedSections(expanded);
    }
  }, [searchQuery, filteredSections]);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: settings.theme.background, color: settings.theme.text }}>
      <SoftParticleDrift 
        accentColor={settings.theme.accent}
        particleCount={settings.background.particleCount}
        speed={settings.background.speed}
        opacity={settings.background.opacity}
        blur={settings.background.blur}
        lowEndMode={settings.lowEndMode}
      />

      {/* Save Notification */}
      {saveNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          {saveNotification}
        </motion.div>
      )}
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <motion.header 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <NeonButton variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </NeonButton>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-white/50">Customize your Nexus experience</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Updates Link with Hover */}
              <div className="relative">
                <motion.div
                  onMouseEnter={() => setShowUpdatesHover(true)}
                  onMouseLeave={() => setShowUpdatesHover(false)}
                  onClick={() => navigate(createPageUrl('Updates'))}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white/70">Updates</span>
                </motion.div>
                {showUpdatesHover && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 right-0 bg-black/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 whitespace-nowrap z-50"
                  >
                    Click to view updates • ESC to return
                  </motion.div>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-xs text-white/40">Build Version</p>
                <p className="text-sm text-white/70 font-mono">{BUILD_VERSION}</p>
              </div>
              <NeonButton variant="primary" onClick={saveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Save All
              </NeonButton>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings... (try 'fps', 'color', 'widget')"
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
            />
          </div>
        </motion.header>

        {/* Settings Sections */}
        <div className="space-y-4">
          {filteredSections.length === 0 && (
            <div className="text-center py-12 text-white/50">
              No settings found matching "{searchQuery}"
            </div>
          )}
          {filteredSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <SettingsSection
                title={section.title}
                icon={section.icon}
                expanded={expandedSections[section.id] || false}
                onToggle={() => toggleSection(section.id)}
                highlighted={searchQuery.trim() && filteredSections.includes(section)}
              >
                {section.custom ? section.custom : section.customUI === 'schedule' ? (
                  <div className="space-y-3">
                    {section.controls?.map((control) => (
                      <SettingControl
                        key={control.path}
                        {...control}
                        onChange={(value) => updateSetting(control.path, value)}
                      />
                    ))}
                    
                    {/* Custom Schedule Editor */}
                    {settings.schedule?.enabled && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">Class Periods</h4>
                          <button
                            onClick={() => {
                              const newPeriod = {
                                id: Date.now(),
                                name: 'New Class',
                                startTime: '08:00',
                                endTime: '09:00',
                                enabled: true
                              };
                              const newPeriods = [...(settings.schedule?.periods || []), newPeriod];
                              updateSetting('schedule.periods', newPeriods);
                              
                              // Check for overlaps
                              const overlaps = checkPeriodsOverlap(newPeriods);
                              setPeriodValidationWarnings(overlaps);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Period
                          </button>
                        </div>

                        {/* Validation Warnings */}
                        {periodValidationWarnings.length > 0 && (
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 space-y-1">
                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                              <AlertCircle className="w-4 h-4" />
                              Period Overlaps Detected
                            </div>
                            {periodValidationWarnings.map((warning, idx) => (
                              <div key={idx} className="text-yellow-400/80 text-xs pl-6">
                                • {warning}
                              </div>
                            ))}
                          </div>
                        )}

                        {(settings.schedule?.periods || []).map((period, idx) => (
                          <div key={period.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={period.name}
                                onChange={(e) => {
                                  const newPeriods = [...settings.schedule.periods];
                                  newPeriods[idx].name = e.target.value;
                                  updateSetting('schedule.periods', newPeriods);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors flex-1 mr-2"
                                placeholder="Class name"
                              />
                              <button
                                onClick={() => {
                                  const newPeriods = settings.schedule.periods.filter((_, i) => i !== idx);
                                  updateSetting('schedule.periods', newPeriods);
                                  // Check for overlaps after deletion
                                  const overlaps = checkPeriodsOverlap(newPeriods);
                                  setPeriodValidationWarnings(overlaps);
                                }}
                                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/60 text-sm mb-1 block">Start Time</label>
                                <input
                                  type="time"
                                  value={period.startTime}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Validate time format
                                    if (value && validateTimeFormat(value)) {
                                      const newPeriods = [...settings.schedule.periods];
                                      newPeriods[idx].startTime = value;
                                      updateSetting('schedule.periods', newPeriods);
                                      // Check for overlaps
                                      const overlaps = checkPeriodsOverlap(newPeriods);
                                      setPeriodValidationWarnings(overlaps);
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-white/60 text-sm mb-1 block">End Time</label>
                                <input
                                  type="time"
                                  value={period.endTime}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Validate time format
                                    if (value && validateTimeFormat(value)) {
                                      const newPeriods = [...settings.schedule.periods];
                                      newPeriods[idx].endTime = value;
                                      updateSetting('schedule.periods', newPeriods);
                                      // Check for overlaps
                                      const overlaps = checkPeriodsOverlap(newPeriods);
                                      setPeriodValidationWarnings(overlaps);
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                              </div>
                            </div>

                            <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={period.enabled}
                                onChange={(e) => {
                                  const newPeriods = [...settings.schedule.periods];
                                  newPeriods[idx].enabled = e.target.checked;
                                  updateSetting('schedule.periods', newPeriods);
                                }}
                                className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                              />
                              Enabled
                            </label>
                          </div>
                        ))}

                        {(settings.schedule?.periods || []).length === 0 && (
                          <div className="text-center py-8 text-white/40">
                            No class periods added yet. Click "Add Period" to get started.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {section.controls?.map((control) => (
                      <SettingControl
                        key={control.path}
                        {...control}
                        onChange={(value) => updateSetting(control.path, value)}
                      />
                    ))}
                  </div>
                )}
              </SettingsSection>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to={createPageUrl('Privacy')} className="text-white/40 hover:text-white/60 text-sm transition-colors">
            Privacy & Security Policy
          </Link>
        </motion.div>
      </div>

      {/* API Setup Wizard */}
      <APISetupWizard
        isOpen={showAPIWizard}
        onClose={() => setShowAPIWizard(false)}
        onComplete={() => {
          setShowAPIWizard(false);
          loadSettings(); // Reload settings after wizard completes
        }}
      />
    </div>
  );
}