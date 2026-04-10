import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Wrench, 
  Calculator as CalcIcon, 
  ArrowLeftRight, 
  PenTool,
  Ruler,
  Hash,
  Clock,
  Calendar,
  Brain,
  BookOpen,
  Lightbulb,
  Timer,
  Gamepad2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { createPageUrl } from 'utils';
import AnimatedBackground from '../Components/UI/AnimatedBackground.js';
import GlassCard from '../Components/UI/GlassCard.js';
import NeonButton from '../Components/UI/NeonButton.js';
import Calculator from '../Components/Utilities/Calculator.js';
import UnitConverter from '../Components/Utilities/UnitConverter.js';
import Whiteboard from '../Components/Utilities/Whiteboard.js';
import AIHelper from '../Components/Study/AIHelper.js';
import FlashcardDeck from '../Components/Study/FlashcardDeck.js';
import NotesPanel from '../Components/Study/NotesPanel.js';
import PomodoroTimer from '../Components/Study/PomodoroTimer.js';
import ScientificCalculator from '../Components/Study/ScientificCalculator.js';
import FormulaSheet from '../Components/Study/FormulaSheet.js';
import Dictionary from '../Components/Study/Dictionary.js';
import ModManager from '../Components/Games/ModManager.js';

export default function Utilities() {
  const [activeTab, setActiveTab] = useState('all');
  const accentColor = '#f368e0';
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromIrisHandoff) {
      setActiveTab('ai');
    }
  }, [location.state]);

  const tabs = [
    { id: 'all', label: 'All Tools', icon: Wrench },
    { id: 'ai', label: 'AI & Study', icon: Brain },
    { id: 'calculator', label: 'Calculator', icon: CalcIcon },
    { id: 'converter', label: 'Converter', icon: ArrowLeftRight },
    { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
    { id: 'minecraft', label: 'Minecraft Mods', icon: Gamepad2 },
  ];

  const quickTools = [
    { id: 'ruler', name: 'Ruler', icon: Ruler, color: '#ff6b6b' },
    { id: 'counter', name: 'Counter', icon: Hash, color: '#ffd93d' },
    { id: 'stopwatch', name: 'Stopwatch', icon: Clock, color: '#6bcb77' },
    { id: 'countdown', name: 'Countdown', icon: Calendar, color: '#4d96ff' },
  ];

  const aiTools = [
    { id: 'ai-helper', name: 'AI Helper', icon: Brain, color: '#a55eea', component: AIHelper },
    { id: 'flashcards', name: 'Flashcards', icon: BookOpen, color: '#ff6b6b', component: FlashcardDeck },
    { id: 'notes', name: 'Notes', icon: PenTool, color: '#ffd93d', component: NotesPanel },
    { id: 'pomodoro', name: 'Pomodoro', icon: Timer, color: '#6bcb77', component: PomodoroTimer },
    { id: 'sci-calc', name: 'Scientific Calc', icon: CalcIcon, color: '#4d96ff', component: ScientificCalculator },
    { id: 'formulas', name: 'Formulas', icon: Lightbulb, color: '#ff9f43', component: FormulaSheet },
    { id: 'dictionary', name: 'Dictionary', icon: BookOpen, color: '#1dd1a1', component: Dictionary },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground type="gradient" accentColor={accentColor} />
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl('Dashboard')}>
              <NeonButton variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </NeonButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Utilities & AI Tools</h1>
              <p className="text-white/50">Helpful tools, calculators & AI study helpers</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'bg-white/5 text-white/50 hover:text-white/70'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? accentColor : undefined
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.header>

        {/* Main Tools */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* AI & Study Tools */}
          {(activeTab === 'all' || activeTab === 'ai') && aiTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="flex justify-center"
            >
              <tool.component accentColor={tool.color} />
            </motion.div>
          ))}

          {(activeTab === 'all' || activeTab === 'calculator') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center"
            >
              <Calculator accentColor={accentColor} />
            </motion.div>
          )}

          {(activeTab === 'all' || activeTab === 'converter') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <UnitConverter accentColor={accentColor} />
            </motion.div>
          )}

          {activeTab === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-4 h-full" accentColor={accentColor} hover={false}>
                <h3 className="font-semibold text-white mb-4">Quick Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickTools.map((tool, index) => (
                    <motion.button
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                    >
                      <div 
                        className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2"
                        style={{ backgroundColor: tool.color + '30' }}
                      >
                        <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                      </div>
                      <span className="text-sm text-white/70">{tool.name}</span>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>

        {/* Whiteboard */}
        {(activeTab === 'all' || activeTab === 'whiteboard') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Whiteboard accentColor={accentColor} />
          </motion.div>
        )}

        {/* Minecraft Mod Manager */}
        {(activeTab === 'all' || activeTab === 'minecraft') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ModManager />
          </motion.div>
        )}
      </div>
    </div>
  );
}