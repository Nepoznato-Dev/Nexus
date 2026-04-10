import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Circle, Hexagon, Bug, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from 'utils';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import { Slider } from '../Components/UI/slider';
import { Label } from '../Components/UI/label';
import SoftParticleDrift from '../Components/Backgrounds/SoftParticleDrift.js';
import GeometricPatterns from '../Components/Backgrounds/GeometricPatterns.js';
import Fireflies from '../Components/Backgrounds/Fireflies.js';
import NetworkNodes from '../Components/Backgrounds/NetworkNodes.js';

const BACKGROUNDS = [
  {
    id: 'soft-particle-drift',
    name: 'Soft Particle Drift',
    description: 'Calm, minimal particles',
    icon: Circle,
    component: SoftParticleDrift,
    settings: [
      { key: 'particleCount', label: 'Particle Count', min: 20, max: 100, default: 50 },
      { key: 'speed', label: 'Speed', min: 0.1, max: 2, default: 0.5, step: 0.1 },
      { key: 'opacity', label: 'Opacity', min: 0.1, max: 1, default: 0.4, step: 0.1 },
      { key: 'blur', label: 'Blur', min: 0, max: 5, default: 2 }
    ]
  },
  {
    id: 'geometric',
    name: 'Geometric Patterns',
    description: 'Rotating shapes',
    icon: Hexagon,
    component: GeometricPatterns,
    settings: [
      { key: 'pattern', label: 'Pattern', type: 'select', options: ['hexagons', 'triangles', 'circles'], default: 'hexagons' },
      { key: 'density', label: 'Density', min: 20, max: 60, default: 30 },
      { key: 'speed', label: 'Rotation Speed', min: 0.1, max: 2, default: 0.5, step: 0.1 },
      { key: 'opacity', label: 'Opacity', min: 0.2, max: 1, default: 0.4, step: 0.1 }
    ]
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    description: 'Glowing particles',
    icon: Bug,
    component: Fireflies,
    settings: [
      { key: 'count', label: 'Firefly Count', min: 10, max: 80, default: 30 },
      { key: 'speed', label: 'Movement Speed', min: 0.1, max: 2, default: 0.5, step: 0.1 },
      { key: 'glowSize', label: 'Glow Size', min: 10, max: 40, default: 20 },
      { key: 'opacity', label: 'Opacity', min: 0.4, max: 1, default: 0.8, step: 0.1 }
    ]
  },
  {
    id: 'network',
    name: 'Network Nodes',
    description: 'Connected network visualization',
    icon: Share2,
    component: NetworkNodes,
    settings: [
      { key: 'nodeCount', label: 'Node Count', min: 20, max: 100, default: 50 },
      { key: 'connectionDistance', label: 'Connection Range', min: 80, max: 250, default: 150 },
      { key: 'speed', label: 'Movement Speed', min: 0.1, max: 2, default: 0.5, step: 0.1 },
      { key: 'opacity', label: 'Opacity', min: 0.3, max: 1, default: 0.6, step: 0.1 }
    ]
  }
];

export default function Backgrounds() {
  const [selectedBg, setSelectedBg] = useState('soft-particle-drift');
  const [expandedBg, setExpandedBg] = useState(null);
  const [bgSettings, setBgSettings] = useState({
    'soft-particle-drift': { particleCount: 50, speed: 0.5, opacity: 0.4, blur: 2 },
    'geometric': { pattern: 'hexagons', density: 30, speed: 0.5, opacity: 0.4 },
    'fireflies': { count: 30, speed: 0.5, glowSize: 20, opacity: 0.8 },
    'network': { nodeCount: 50, connectionDistance: 150, speed: 0.5, opacity: 0.6 }
  });

  const accentColor = '#00f0ff';
  const ActiveBackground = BACKGROUNDS.find(bg => bg.id === selectedBg)?.component || SoftParticleDrift;

  const updateSetting = (bgId, key, value) => {
    setBgSettings(prev => ({
      ...prev,
      [bgId]: {
        ...prev[bgId],
        [key]: value
      }
    }));
  };

  const handleSelectBackground = (bgId) => {
    setSelectedBg(bgId);
    setExpandedBg(expandedBg === bgId ? null : bgId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ActiveBackground 
        {...bgSettings[selectedBg]}
        accentColor={accentColor}
      />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Settings')}>
              <NeonButton variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </NeonButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Backgrounds</h1>
              <p className="text-white/50">Choose and customize your background</p>
            </div>
          </div>
        </motion.header>

        <div className="space-y-4">
          {BACKGROUNDS.map((bg, index) => (
            <motion.div
              key={bg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <GlassCard 
                className={`p-4 cursor-pointer transition-all ${
                  selectedBg === bg.id ? 'ring-2' : ''
                }`}
                style={{ ringColor: selectedBg === bg.id ? accentColor : 'transparent' }}
                onClick={() => handleSelectBackground(bg.id)}
                hover={true}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center"
                    style={{ backgroundColor: selectedBg === bg.id ? accentColor + '20' : undefined }}
                  >
                    <bg.icon className="w-8 h-8 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{bg.name}</h3>
                    <p className="text-sm text-white/50">{bg.description}</p>
                  </div>
                  {selectedBg === bg.id && (
                    <div className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                      Active
                    </div>
                  )}
                </div>
              </GlassCard>

              <AnimatePresence>
                {expandedBg === bg.id && bg.settings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <GlassCard className="p-6 mt-2" hover={false}>
                      <h4 className="text-white font-medium mb-4">Customize Settings</h4>
                      <div className="space-y-6">
                        {bg.settings.map((setting) => (
                          <div key={setting.key}>
                            <Label className="text-white text-sm mb-2 block">
                              {setting.label}: {bgSettings[bg.id]?.[setting.key] ?? setting.default}
                            </Label>
                            {setting.type === 'boolean' ? (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bgSettings[bg.id]?.[setting.key] ?? setting.default}
                                  onChange={(e) => updateSetting(bg.id, setting.key, e.target.checked)}
                                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                                />
                                <span className="text-white/70 text-sm">Enable</span>
                              </label>
                            ) : setting.type === 'select' ? (
                              <select
                                value={bgSettings[bg.id]?.[setting.key] ?? setting.default}
                                onChange={(e) => updateSetting(bg.id, setting.key, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                              >
                                {setting.options.map(opt => (
                                  <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <Slider
                                value={[bgSettings[bg.id]?.[setting.key] ?? setting.default]}
                                onValueChange={([val]) => updateSetting(bg.id, setting.key, val)}
                                min={setting.min}
                                max={setting.max}
                                step={setting.step || 1}
                                className="w-full"
                              />
                            )}
                          </div>
                        ))}

                        {/* Live Preview */}
                        <div className="mt-6">
                          <Label className="text-white text-sm mb-2 block">Live Preview</Label>
                          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                            {React.createElement(bg.component, {
                              ...bgSettings[bg.id],
                              accentColor
                            })}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}