/**
 * OllamaSettings.jsx - UI for Ollama text translation settings
 * Allows users to enable/disable translation and select translation quality tier
 * 
 * ⚠️ IMPORTANT: Ollama is ONLY for translation/reformatting text
 * NOT for AI response generation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Download, Zap, ExternalLink, Toggle2 } from 'lucide-react';
import { OLLAMA_MODELS } from './ollamaModels.js';
import { isOllamaAvailable, translateText } from './ollamaAPI.js';
import { storage } from '../Storage/clientStorage.js';

export default function OllamaSettings() {
    const [translationEnabled, setTranslationEnabled] = useState(false);
    const [selectedTier, setSelectedTier] = useState('balanced');
    const [ollamaAvailable, setOllamaAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Load translation settings from storage
            const settings = await storage.loadSettings() || {};
            const enabled = settings.aiTools?.ollamaTranslationEnabled || false;
            const tier = settings.aiTools?.ollamaTranslationTier || 'balanced';

            setTranslationEnabled(enabled);
            setSelectedTier(tier);

            // Check Ollama availability
            const available = await isOllamaAvailable();
            setOllamaAvailable(available);
        } catch (error) {
            console.error('Failed to load Ollama settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTranslation = async (enabled) => {
        try {
            setTranslationEnabled(enabled);
            const settings = await storage.loadSettings() || {};
            settings.aiTools = settings.aiTools || {};
            settings.aiTools.ollamaTranslationEnabled = enabled;
            await storage.saveSettings(settings);
        } catch (error) {
            console.error('Failed to save translation setting:', error);
        }
    };

    const saveTierSelection = async (tier) => {
        try {
            setSelectedTier(tier);
            const settings = await storage.loadSettings() || {};
            settings.aiTools = settings.aiTools || {};
            settings.aiTools.ollamaTranslationTier = tier;
            await storage.saveSettings(settings);
        } catch (error) {
            console.error('Failed to save translation tier:', error);
        }
    };

    const testTranslation = async () => {
        try {
            const testText = "This is a simple example text that will be improved by Ollama.";
            const result = await translateText(testText, selectedTier, 'simplify');
            setTestResult({
                original: testText,
                translated: result,
                success: result !== testText
            });
        } catch (error) {
            setTestResult({
                error: error.message,
                success: false
            });
        }
    };

    if (loading) {
        return <div className="text-white/60">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">🦙 Ollama Text Translation</h2>
                <p className="text-white/60">Ollama locally improves and translates our AI responses</p>
            </div>

            {/* Status Card */}
            <div className={`p-4 rounded-lg border ${ollamaAvailable ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                <div className="flex items-start gap-3">
                    {ollamaAvailable ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                        <h3 className={`font-semibold ${ollamaAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
                            {ollamaAvailable ? '✅ Ollama Connected' : '⚠️ Ollama Not Running'}
                        </h3>
                        <p className="text-sm text-white/70 mt-1">
                            {ollamaAvailable
                                ? `Ollama is ready for text translation`
                                : `Start Ollama with: ollama serve`
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Enable/Disable Translation Toggle */}
            <motion.div
                className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg">Enable Response Translation</h3>
                        <p className="text-white/60 text-sm mt-1">
                            {translationEnabled
                                ? "Ollama will improve our responses before you see them"
                                : "Translation is currently disabled"}
                        </p>
                    </div>
                    <motion.button
                        onClick={() => toggleTranslation(!translationEnabled)}
                        className={`relative w-14 h-8 rounded-full transition-all ${translationEnabled ? 'bg-cyan-500' : 'bg-white/10'
                            }`}
                        whileHover={{ scale: 1.05 }}
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                            animate={{ x: translationEnabled ? 24 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </motion.button>
                </div>
            </motion.div>

            {/* Translation Quality Tier Selection (only if enabled) */}
            {translationEnabled && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    <h3 className="text-lg font-semibold text-white">Translation Quality</h3>

                    {Object.entries(OLLAMA_MODELS).map(([key, tier]) => {
                        const isSelected = selectedTier === key;

                        return (
                            <motion.button
                                key={key}
                                onClick={() => saveTierSelection(key)}
                                whileHover={{ scale: 1.01 }}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'border-cyan-400 bg-cyan-400/10'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{tier.emoji}</span>
                                            <div>
                                                <h4 className="font-bold text-white">{tier.name}</h4>
                                                <p className="text-xs text-white/60">{tier.translationQuality}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-white/70 ml-10 mt-2">
                                            <div>
                                                <p className="text-white/50">Speed:</p>
                                                <p className="text-white/90">{tier.tokens_per_second}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/50">Model:</p>
                                                <p className="text-white/90 font-mono text-xs">{tier.recommended}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-white/50 ml-10 mt-2">
                                            <strong>Use cases:</strong> {tier.use_cases.join(', ')}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <Check className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            )}

            {/* How It Works */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-blue-400">How Text Translation Works</h3>
                <div className="text-sm text-white/70 space-y-2">
                    <p>
                        <span className="text-blue-300 font-semibold">1.</span> Nexus AI generates a response
                    </p>
                    <p>
                        <span className="text-blue-300 font-semibold">2.</span> If enabled, Ollama processes the text based on your selected tier
                    </p>
                    <p>
                        <span className="text-blue-300 font-semibold">3.</span> You see the improved response
                    </p>
                    <p className="text-white/50 text-xs mt-2">
                        💡 Ollama NEVER generates responses—it only improves, translates, or reformats text that Nexus creates.
                    </p>
                </div>
            </div>

            {/* Installation Guide */}
            {!ollamaAvailable && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-orange-400 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Need to install Ollama?
                    </h3>

                    <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                        <li>
                            Download from{' '}
                            <a
                                href="https://ollama.ai/download"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 hover:text-orange-300 underline"
                            >
                                ollama.ai
                            </a>
                        </li>
                        <li>Start the service: <code className="bg-black/50 px-2 py-1 rounded text-xs text-cyan-400">ollama serve</code></li>
                        <li>Pull a translation model: <code className="bg-black/50 px-2 py-1 rounded text-xs text-cyan-400">ollama pull llama2</code></li>
                        <li>Reload Nexus and translations will be ready!</li>
                    </ol>
                </div>
            )}

            {/* Current Selection Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Current Settings</h3>
                <div className="space-y-1 text-sm text-white/70">
                    <p>
                        <span className="text-white/50">Translation:</span>{' '}
                        <span className="text-white font-semibold">{translationEnabled ? '✅ Enabled' : '❌ Disabled'}</span>
                    </p>
                    {translationEnabled && (
                        <p>
                            <span className="text-white/50">Quality Tier:</span>{' '}
                            <span className="text-white font-semibold">{OLLAMA_MODELS[selectedTier].name}</span>
                        </p>
                    )}
                    <p className="text-white/50 text-xs mt-2">
                        Changes take effect immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}
