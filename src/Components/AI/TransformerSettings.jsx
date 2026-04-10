/**
 * TransformerSettings.jsx - UI for Transformer.js configuration
 * Allows users to select Fast/Balanced/Quality processing tier
 * 
 * Browser-based AI with intelligent routing - no installation needed
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Brain, Sparkles, Info } from 'lucide-react';
import { TRANSFORMER_TIERS } from './ollamaModels.js';
import { processQuestion, analyzeComplexity } from './transformerAPI.js';
import { storage } from '../Storage/clientStorage.js';

export default function TransformerSettings() {
    const [selectedTier, setSelectedTier] = useState('balanced');
    const [testQuestion, setTestQuestion] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Load selected tier from storage
            const settings = await storage.loadSettings() || {};
            const tier = settings.aiTools?.transformerTier || 'balanced';
            setSelectedTier(tier);
        } catch (error) {
            console.error('Failed to load Transformer settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveTierSelection = async (tier) => {
        try {
            setSelectedTier(tier);
            const settings = await storage.loadSettings() || {};
            settings.aiTools = settings.aiTools || {};
            settings.aiTools.transformerTier = tier;
            await storage.saveSettings(settings);
        } catch (error) {
            console.error('Failed to save Transformer tier:', error);
        }
    };

    const handleTest = async () => {
        if (!testQuestion.trim()) return;
        
        setTesting(true);
        setTestResult(null);
        
        try {
            const result = await processQuestion(testQuestion, selectedTier);
            const complexity = analyzeComplexity(testQuestion);
            
            setTestResult({
                ...result,
                complexity,
            });
        } catch (error) {
            setTestResult({
                error: error.message,
                success: false,
            });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return <div className="text-white/60">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">🤖 AI Response Style</h2>
                <p className="text-white/60">Browser-based AI processing with intelligent routing</p>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/30">
                <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-green-400">✅ Always Ready</h3>
                        <p className="text-sm text-white/70 mt-1">
                            Transformer.js runs in your browser—no installation or setup needed!
                        </p>
                    </div>
                </div>
            </div>

            {/* Tier Selection */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Processing Mode</h3>

                {Object.entries(TRANSFORMER_TIERS).map(([key, tier]) => {
                    const isSelected = selectedTier === key;

                    return (
                        <motion.button
                            key={key}
                            onClick={() => saveTierSelection(key)}
                            whileHover={{ scale: 1.01 }}
                            className={`w-full p-5 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'border-cyan-400 bg-cyan-400/10'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{tier.emoji}</span>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{tier.name}</h4>
                                            <p className="text-xs text-white/60">{tier.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs text-white/70 ml-11 mt-3">
                                        <div>
                                            <p className="text-white/50">Speed:</p>
                                            <p className="text-white/90 font-semibold">{tier.speed}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/50">Processing:</p>
                                            <p className="text-white/90">{tier.processing}</p>
                                        </div>
                                    </div>

                                    <div className="ml-11 mt-3">
                                        <p className="text-xs text-white/50 mb-1">Best for:</p>
                                        <p className="text-xs text-white/70">{tier.use_cases.join(', ')}</p>
                                    </div>

                                    {tier.examples && (
                                        <div className="ml-11 mt-3 p-2 bg-black/30 rounded text-xs">
                                            <p className="text-white/50 mb-1">Example:</p>
                                            <p className="text-cyan-300">
                                                "{tier.examples[0].question}" → {tier.examples[0].answer}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {isSelected && (
                                    <Check className="w-6 h-6 text-cyan-400 flex-shrink-0 ml-3" />
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Test Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Test Your Tier
                </h3>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={testQuestion}
                        onChange={(e) => setTestQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTest()}
                        placeholder="Ask a question to test..."
                        className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                    />
                    <button
                        onClick={handleTest}
                        disabled={testing || !testQuestion.trim()}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded text-sm font-semibold transition-colors"
                    >
                        {testing ? 'Testing...' : 'Test'}
                    </button>
                </div>

                {testResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-black/40 rounded border border-cyan-500/30"
                    >
                        <div className="text-xs text-white/50 mb-2">
                            Complexity: <span className="text-cyan-300 font-semibold">{testResult.complexity}</span> • 
                            Tier: <span className="text-cyan-300 font-semibold">{testResult.tier}</span>
                        </div>
                        <p className="text-white text-sm font-semibold mb-2">Answer:</p>
                        <p className="text-white/90 text-sm">{testResult.answer}</p>
                        
                        {testResult.explanation && testResult.explanation.steps && (
                            <div className="mt-3 space-y-2">
                                <p className="text-white/70 text-xs font-semibold">Step-by-step:</p>
                                {testResult.explanation.steps.map((step, i) => (
                                    <div key={i} className="text-xs text-white/60 pl-3 border-l-2 border-cyan-500/30">
                                        <p className="text-cyan-300 font-semibold">Step {step.step}: {step.title}</p>
                                        <p className="text-white/70">{step.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* How It Works */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    How It Works
                </h3>

                <div className="text-sm text-white/70 space-y-2">
                    <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p><strong className="text-yellow-300">Fast:</strong> Direct answers for simple questions (5+5 → 10)</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p><strong className="text-cyan-300">Balanced:</strong> Smart routing—simple questions get fast answers, complex ones get explanations</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <p><strong className="text-purple-300">Quality:</strong> Always provides step-by-step explanations like Google Gemini</p>
                    </div>
                </div>
            </div>

            {/* Current Selection Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Current Selection</h3>
                <div className="space-y-1 text-sm text-white/70">
                    <p>
                        <span className="text-white/50">Mode:</span>{' '}
                        <span className="text-white font-semibold">{TRANSFORMER_TIERS[selectedTier].name}</span>
                    </p>
                    <p>
                        <span className="text-white/50">Speed:</span>{' '}
                        <span className="text-white/90">{TRANSFORMER_TIERS[selectedTier].speed}</span>
                    </p>
                    <p className="text-white/50 text-xs mt-2">
                        Changes take effect immediately. No installation or downloads required!
                    </p>
                </div>
            </div>
        </div>
    );
}
