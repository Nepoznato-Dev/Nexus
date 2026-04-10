import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, AlertCircle, Shield, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils.js';
import { storage, session } from '../Components/Storage/clientStorage.js';
import { moderateContent, getViolationMessage } from '../utils/contentModeration.js';
import NeonButton from '../Components/UI/NeonButton.js';
import { Input } from '../Components/UI/input.js';

export default function Auth() {
  const [accessCode, setAccessCode] = useState('');
  const [username, setUsername] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('nexus_consent_accepted')) {
      navigate(createPageUrl('Landing'));
    }
  }, [navigate]);

  const isUsernameAppropriate = (name) => {
    const result = moderateContent(name);

    // If high severity violations found, record it
    if (result.hasHighSeverity && session.getAccessCode()) {
      const violationResult = storage.recordViolation(session.getAccessCode(), 'inappropriate_username');

      // Auto-ban if 3 strikes
      if (violationResult.shouldBan) {
        storage.banUser(session.getAccessCode(), 1440); // 24 hour ban
        alert(getViolationMessage(violationResult.warnings));
        return false;
      }
    }

    return result.isClean;
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await storage.init();
      const guestCode = `GUEST_${Date.now()}`;

      // Create guest session and mark as approved
      session.set(guestCode, false, 'guest');
      await storage.saveUserRole(guestCode, { role: 'guest', verified: false, approved: true });

      await storage.saveSettings({
        theme: { background: '#0a0a0f', accent: '#00f0ff', text: '#ffffff' },
        background: { type: 'soft-particle-drift', particleCount: 50, speed: 0.5, opacity: 0.4, blur: 2 },
        performance: { targetFPS: 60, fpsCapEnabled: true, vsyncEnabled: true, ramLimit: 1024, pageRAMSoftLimit: 750, pageRAMHardLimit: 1250, gamesRAMSoftLimit: 1024, gamesRAMHardLimit: 4096, animationScale: 1, widgetLimit: 3, adaptivePerf: true, showFPS: false },
        games: { fullscreenOnLaunch: true, escToClose: true, lazyLoadStrength: 'medium' },
        widgets: { enabled: false, spotify: false, youtube: false, tiktok: false, autoDisable: true },
        aiTools: { enabled: false, autoSuggest: true },
        lowEndMode: false
      });

      // Show success message before navigating
      setSuccess('✓ Guest mode activated! Loading your dashboard...');
      setLoading(false);

      // Wait 1 second then navigate (loading screen will take over on Dashboard)
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1000);
    } catch (err) {
      setError('Failed to start guest mode');
      setLoading(false);
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const code = accessCode.trim();

      if (!code) {
        setError('Please enter an access code');
        setLoading(false);
        return;
      }

      if (code.length < 5 || code.length > 20) {
        setError('Access code must be 5-20 characters');
        setLoading(false);
        return;
      }

      await storage.init();

      // Check role
      const roleData = storage.getUserRole(code);

      // Check if banned with expiration check
      if (storage.isBanned(code)) {
        const banInfo = storage.getBanInfo(code);
        if (banInfo) {
          if (banInfo.isPermanent) {
            setError('This account has been permanently banned. Contact the administrator.');
          } else {
            const minutesLeft = Math.ceil(banInfo.timeRemaining / 60000);
            setError(`This account is temporarily banned. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`);
          }
        } else {
          setError('This account has been banned. Contact the administrator.');
        }
        setLoading(false);
        return;
      }

      // Owner login - works like regular account
      if (roleData.role === 'owner') {
        const existingUser = await storage.loadUser(code);
        if (!existingUser) {
          if (!username.trim()) {
            setError('Please enter a username');
            setLoading(false);
            return;
          }
          if (!isUsernameAppropriate(username.trim())) {
            setError('Sorry, this name is unavailable');
            setLoading(false);
            return;
          }
          await storage.saveUser(username.trim(), code);
        }
        const userEmail = existingUser?.username || username.trim();
        localStorage.setItem('nexus_user_email', userEmail);
        sessionStorage.setItem('nexus_user_email', userEmail);
        session.set(code, remember, 'owner');

        // Show success message before navigating
        setSuccess('✓ Login successful! Preparing your dashboard...');
        setLoading(false);

        // Wait 1 second then navigate (loading screen will take over on Dashboard)
        setTimeout(() => {
          navigate(createPageUrl('Dashboard'));
        }, 1000);
        return;
      }

      // Admin login
      if (roleData.role === 'admin') {
        const existingUser = await storage.loadUser(code);
        if (!existingUser) {
          if (!username.trim()) {
            setError('Please enter a username');
            setLoading(false);
            return;
          }
          if (!isUsernameAppropriate(username.trim())) {
            setError('Sorry, this name is unavailable');
            setLoading(false);
            return;
          }
          await storage.saveUser(username.trim(), code);
        }
        const userEmail = existingUser?.username || username.trim();
        localStorage.setItem('nexus_user_email', userEmail);
        sessionStorage.setItem('nexus_user_email', userEmail);
        session.set(code, remember, 'admin');

        // Show success message before navigating
        setSuccess('✓ Login successful! Preparing your dashboard...');
        setLoading(false);

        // Wait 1 second then navigate (loading screen will take over on Dashboard)
        setTimeout(() => {
          navigate(createPageUrl('Dashboard'));
        }, 1000);
        return;
      }

      // Check existing user
      const existingUser = await storage.loadUser(code);

      if (existingUser) {
        // Check if account is approved
        if (!storage.isApproved(code)) {
          setError('Your account is pending approval. Please wait for an administrator to approve your access.');
          setLoading(false);
          return;
        }

        // Returning verified user
        session.set(code, remember, roleData.verified ? 'verified' : 'guest');
        // Store user identifier for admin tracking
        const userEmail = existingUser.username || 'User';
        localStorage.setItem('nexus_user_email', userEmail);
        sessionStorage.setItem('nexus_user_email', userEmail);

        // Show success message before navigating
        setSuccess('✓ Login successful! Preparing your dashboard...');
        setLoading(false);

        // Wait 1 second then navigate (loading screen will take over on Dashboard)
        setTimeout(() => {
          navigate(createPageUrl('Dashboard'));
        }, 1000);
      } else {
        // New user - check invite code
        const currentInviteCode = storage.getInviteCode();

        if (code !== currentInviteCode) {
          setError('Invalid access code. Please ask the admin for the current code or try Guest mode.');
          setLoading(false);
          return;
        }

        // Valid invite code - create unverified account
        if (!username.trim()) {
          setError('Please enter a username');
          setLoading(false);
          return;
        }
        if (!isUsernameAppropriate(username.trim())) {
          setError('Sorry, this name is unavailable');
          setLoading(false);
          return;
        }
        await storage.saveUser(username.trim(), code);

        await storage.saveSettings({
          theme: { background: '#0a0a0f', accent: '#00f0ff', text: '#ffffff' },
          background: { type: 'soft-particle-drift', particleCount: 50, speed: 0.5, opacity: 0.4, blur: 2 },
          performance: { targetFPS: 60, fpsCapEnabled: true, vsyncEnabled: true, ramLimit: 1024, pageRAMSoftLimit: 750, pageRAMHardLimit: 1250, gamesRAMSoftLimit: 1024, gamesRAMHardLimit: 4096, animationScale: 1, widgetLimit: 3, adaptivePerf: true, showFPS: false },
          games: { fullscreenOnLaunch: true, escToClose: true, lazyLoadStrength: 'medium' },
          widgets: { enabled: false, spotify: false, youtube: false, tiktok: false, autoDisable: true },
          aiTools: { enabled: false, autoSuggest: true },
          lowEndMode: false
        });

        // Save as unverified user - requires approval
        storage.saveUserRole(code, { role: 'guest', verified: false, approved: false });

        // Regenerate invite code
        storage.regenerateInviteCode();

        // Store user identifier for admin tracking
        localStorage.setItem('nexus_user_email', username);
        sessionStorage.setItem('nexus_user_email', username);

        session.set(code, remember, 'guest');

        // Show error message for pending approval (not success)
        setError('Account created! Please wait for admin approval before accessing Nexus.');
        setLoading(false);
        return;
      }
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <h1 className="text-5xl font-bold text-white mb-2">Nexus</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
            </motion.div>
            <p className="text-white/60 text-sm">Privacy-first student hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2 text-center">
                Choose your username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-center text-lg"
                disabled={loading}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2 text-center">
                Enter your Nexus access code
              </label>
              <Input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Access code (5-20 characters)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-center text-lg"
                required
                disabled={loading}
              />
              <p className="text-xs text-white/40 mt-2 text-center">
                New? Ask the admin for the current invite code.
              </p>
            </div>

            <label className="flex items-center justify-center gap-2 text-sm text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded"
                disabled={loading}
              />
              Remember me on this device
            </label>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-4 h-4 flex-shrink-0"
                >
                  ✓
                </motion.div>
                <span>{success}</span>
              </motion.div>
            )}

            <NeonButton
              type="submit"
              variant="primary"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full mr-2"
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2" />
                  Enter Nexus
                </>
              )}
            </NeonButton>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Try Nexus in Guest Mode
            </button>
            <p className="text-xs text-white/40 mt-2 text-center">
              Limited features • Verify on Discord for full access
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-white/30">
            All data stored locally. No account required.
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a
            href={createPageUrl('Privacy')}
            className="text-white/40 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-2"
          >
            <Shield className="w-3 h-3" />
            Privacy & Security
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}