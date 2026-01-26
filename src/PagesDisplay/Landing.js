import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download, ArrowRight, MessageCircle, Bug } from 'lucide-react';
import NeonButton from '../Components/UI/NeonButton.js';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils.js';
import { useSettings } from '../hooks/useSettings.js';
import { usePageReady } from '../hooks/usePageReady.js';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [showReturnNotice, setShowReturnNotice] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  // Signal page is ready after settings load
  usePageReady(!settings.loading);

  React.useEffect(() => {
    // Check if user used panic button and wants to return
    const panicDataStr = localStorage.getItem('nexus-panic-return');
    if (!panicDataStr) return;

    try {
      // Support both legacy string and new JSON format
      const parsed = JSON.parse(panicDataStr);
      const panicData = typeof parsed === 'string' ? { url: parsed, timestamp: null } : parsed;

      if (panicData.url) {
        // Validate URL is from same origin (not substring match!)
        try {
          const panicUrl = new URL(panicData.url);
          const currentUrl = new URL(window.location);
          
          // Only allow redirects to same origin
          if (panicUrl.origin !== currentUrl.origin) {
            // Invalid origin, clear it
            localStorage.removeItem('nexus-panic-return');
            return;
          }
        } catch (err) {
          // Invalid URL format, clear it
          localStorage.removeItem('nexus-panic-return');
          return;
        }

        const timeoutMinutes = settings.accessibility?.panicReturnTimeout ?? 60;
        const disabled = timeoutMinutes <= 0 || timeoutMinutes >= 485;

        if (disabled) {
          setShowReturnNotice(true);
          return;
        }

        const timeoutMs = timeoutMinutes * 60 * 1000;
        const elapsed = Date.now() - (panicData.timestamp || 0);

        if (elapsed < timeoutMs) {
          // Not expired yet, show return button
          setShowReturnNotice(true);
        } else {
          // Expired, clear it
          localStorage.removeItem('nexus-panic-return');
        }
      } else {
        // Invalid data, clear it
        localStorage.removeItem('nexus-panic-return');
      }
    } catch (err) {
      // Corrupted data, clear it
      localStorage.removeItem('nexus-panic-return');
    }
  }, [settings.accessibility?.panicReturnTimeout]);

  const handleQuickReturn = () => {
    const panicDataStr = localStorage.getItem('nexus-panic-return');
    if (panicDataStr) {
      try {
        const panicData = JSON.parse(panicDataStr);
        const url = typeof panicData === 'string' ? panicData : panicData.url;
        
        if (url) {
          // Validate origin before redirecting
          try {
            const panicUrl = new URL(url);
            const currentUrl = new URL(window.location);
            
            if (panicUrl.origin === currentUrl.origin) {
              localStorage.removeItem('nexus-panic-return');
              window.location.href = url;
            } else {
              // Invalid origin, don't redirect
              localStorage.removeItem('nexus-panic-return');
            }
          } catch (err) {
            // Invalid URL, clear it
            localStorage.removeItem('nexus-panic-return');
          }
        }
      } catch (err) {
        localStorage.removeItem('nexus-panic-return');
      }
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    // Clear panic return URL
    localStorage.removeItem('nexus-panic-return');
    // Store access verified and navigate to consent
    sessionStorage.setItem('nexus_access_verified', 'true');
    navigate(createPageUrl('Consent'));
  };

  const handleInstallPWA = () => {
    // PWA install prompt
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choice) => {
        window.deferredPrompt = null;
      });
    } else {
      alert('To install Nexus, use your browser\'s "Add to Home Screen" or "Install" option.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <h1 className="text-6xl font-bold text-white mb-2">
              Nexus
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mx-auto rounded-full" />
          </motion.div>
          <p className="text-white/60 text-sm">
            Privacy-first student hub
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-4">
                Welcome to Nexus, your privacy-first student hub. All data stays local on your device.
              </p>
            </div>

            {showReturnNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
              >
                <p className="text-cyan-400 text-sm text-center mb-3">
                  🔄 Quick Return Available
                </p>
                <NeonButton
                  onClick={handleQuickReturn}
                  variant="primary"
                  className="w-full"
                >
                  Return to Previous Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </NeonButton>
                <p className="text-white/40 text-xs text-center mt-2">
                  Coast is clear? Click to go back where you left off
                </p>
              </motion.div>
            )}

            <NeonButton
              onClick={handleContinue}
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : showReturnNotice ? 'Start Fresh' : 'Enter Nexus'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </NeonButton>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleInstallPWA}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Install Nexus App
            </button>
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
          <div className="mt-4 flex items-center justify-center gap-4">
            <a
              href="https://discord.gg/nexushub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-cyan-400 text-xs transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-3 h-3" />
              Need help?
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://discord.gg/nexushub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-cyan-400 text-xs transition-colors inline-flex items-center gap-2"
            >
              <Bug className="w-3 h-3" />
              Report a bug
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}