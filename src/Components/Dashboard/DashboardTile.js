import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../UI/GlassCard.js';
import { cn } from '../../utils';

export default function DashboardTile({
  title,
  icon: Icon,
  description,
  accentColor = '#00f0ff',
  onClick,
  stats,
  className,
  animationScale = 1
}) {
  return (
    <GlassCard
      onClick={onClick}
      accentColor={accentColor}
      glow
      className={cn("p-6 h-full", className)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="p-3 rounded-xl"
            style={{ backgroundColor: accentColor + '20' }}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 * animationScale }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: accentColor }}
            />
          </motion.div>
          {stats && (
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: accentColor + '20', color: accentColor }}
            >
              {stats}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50 flex-grow">{description}</p>

        <motion.div
          className="mt-4 flex items-center gap-2 text-sm font-medium"
          style={{ color: accentColor }}
          whileHover={{ x: 5 }}
        >
          <span>Open</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </GlassCard>
  );
}
