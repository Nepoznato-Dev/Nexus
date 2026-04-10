import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Key, Sparkles, Loader2 } from 'lucide-react';
import GlassCard from '../UI/GlassCard.js';
import { Input } from '../UI/input.js';
import { Button } from '../UI/button.js';
import { storage } from '../Storage/clientStorage.js';

/**
 * API Setup Wizard - Helps users configure AI API keys with validation
 */
export default function APISetupWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      description: 'GPT-3.5 / GPT-4',
      keyFormat: 'sk-...',
      getKeyUrl: 'https://platform.openai.com/api-keys',
      defaultModel: 'gpt-3.5-turbo',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      cost: 'Very cheap (~$0.002/1K tokens)',
    },
    {
      id: 'google',
      name: 'Google',
      icon: '📊',
      description: 'Gemini Pro (Free!)',
      keyFormat: 'AIza...',
      getKeyUrl: 'https://makersuite.google.com/app/apikey',
      defaultModel: 'gemini-pro',
      models: ['gemini-pro', 'gemini-pro-vision'],
      cost: 'Free tier available!',
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🧠',
      description: 'Claude 3',
      keyFormat: 'sk-ant-...',
      getKeyUrl: 'https://console.anthropic.com',
      defaultModel: 'claude-3-sonnet-20240229',
      models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
      cost: 'Mid-range pricing',
    },
  ];

  const selectedProvider = providers.find(p => p.id === provider);

  const validateAPIKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const testPrompt = 'Say "Hello!" in one word.';
      let response;

      if (provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: testPrompt }],
            max_tokens: 10
          })
        });
      } else if (provider === 'anthropic') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model || 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: testPrompt }]
          })
        });
      } else if (provider === 'google') {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: testPrompt }] }]
            })
          }
        );
      }

      if (response.ok) {
        setValidationResult({ success: true, message: '✅ API key is valid and working!' });
        setTimeout(() => setStep(3), 1500);
      } else {
        const error = await response.json();
        setValidationResult({
          success: false,
          message: `❌ Error: ${error.error?.message || response.statusText}`
        });
      }
    } catch (err) {
      setValidationResult({
        success: false,
        message: `❌ Connection failed: ${err.message}`
      });
    } finally {
      setIsValidating(false);
    }
  };

  const saveAndComplete = async () => {
    const settings = await storage.loadSettings() || {};
    settings.aiTools = {
      ...settings.aiTools,
      enabled: true,
      apiProvider: provider,
      apiKey: apiKey,
      model: model || selectedProvider.defaultModel,
    };
    await storage.saveSettings(settings);
    
    if (onComplete) onComplete();
    onClose();
  };

  const skipSetup = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl"
        >
          <GlassCard className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Setup Wizard</h2>
                <p className="text-white/50 text-sm">Step {step} of 3</p>
              </div>
            </div>

            {/* Step 1: Choose Provider */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Choose an AI Provider</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Select a provider to power your AI assistant. You can change this later in Settings.
                  </p>
                </div>

                <div className="grid gap-3">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProvider(p.id);
                        setModel(p.defaultModel);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        provider === p.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{p.icon}</span>
                          <div>
                            <h4 className="font-semibold text-white">{p.name}</h4>
                            <p className="text-white/60 text-sm">{p.description}</p>
                            <p className="text-white/40 text-xs mt-1">{p.cost}</p>
                          </div>
                        </div>
                        {provider === p.id && <Check className="w-5 h-5 text-purple-400" />}
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setProvider('none');
                      setStep(3);
                    }}
                    className="p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">❌</span>
                      <div>
                        <h4 className="font-semibold text-white">Skip for now</h4>
                        <p className="text-white/60 text-sm">Use template responses (no API needed)</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="secondary" onClick={skipSetup}>
                    Skip Setup
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!provider || provider === 'none'}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Enter API Key */}
            {step === 2 && selectedProvider && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Enter Your API Key</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Get your API key from{' '}
                    <a
                      href={selectedProvider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      {selectedProvider.name}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={selectedProvider.keyFormat}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Your key is stored locally in your browser only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    {selectedProvider.models.map((m) => (
                      <option key={m} value={m} className="bg-gray-900">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {validationResult && (
                  <div
                    className={`p-3 rounded-lg flex items-start gap-2 ${
                      validationResult.success
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    {validationResult.success ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p
                      className={`text-sm ${
                        validationResult.success ? 'text-green-200' : 'text-red-200'
                      }`}
                    >
                      {validationResult.message}
                    </p>
                  </div>
                )}

                <div className="flex justify-between gap-2 mt-6">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={skipSetup}>
                      Skip
                    </Button>
                    <Button onClick={validateAPIKey} disabled={isValidating || !apiKey.trim()}>
                      {isValidating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Validating...
                        </>
                      ) : (
                        'Validate & Continue'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {step === 3 && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">All Set!</h3>
                <p className="text-white/60">
                  {provider === 'none'
                    ? 'You can enable AI later in Settings > AI Tools'
                    : 'Your AI assistant is ready to use in Study Tools'}
                </p>
                <div className="flex justify-center gap-2 mt-6">
                  <Button onClick={saveAndComplete}>
                    Get Started
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
