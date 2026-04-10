import React from 'react';
import { motion } from 'framer-motion';
import { X, Globe, RefreshCw, Volume2, VolumeX, Moon, Pin } from 'lucide-react';
import { cn } from '../../utils.js';

export default function BrowserTab({ 
  tab, 
  isActive, 
  onSelect, 
  onClose,
  onToggleMute,
  accentColor = '#3498db',
  vertical = false,
  groupColor = null,
}) {
  const groupBorder = groupColor ? `border-l-4` : '';

  if (vertical) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        onClick={onSelect}
        className={cn(
          "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group",
          isActive 
            ? "bg-white/10 border-r-2" 
            : "hover:bg-white/5",
          tab.hibernated && "opacity-50",
        )}
        style={{ 
          borderColor: isActive ? accentColor : 'transparent',
          borderLeft: groupColor ? `3px solid ${groupColor}` : undefined,
        }}
      >
        {tab.loading ? (
          <RefreshCw className="w-4 h-4 text-white/50 animate-spin flex-shrink-0" />
        ) : tab.hibernated ? (
          <Moon className="w-4 h-4 text-white/30 flex-shrink-0" />
        ) : tab.favicon ? (
          <img src={tab.favicon} alt="" className="w-4 h-4 flex-shrink-0" onError={e => e.target.style.display='none'} />
        ) : (
          <Globe className="w-4 h-4 text-white/50 flex-shrink-0" />
        )}
        <span className="text-sm text-white/80 truncate flex-1">
          {tab.pinned && <span className="mr-1">📌</span>}
          {tab.title || 'New Tab'}
        </span>
        {tab.muted !== undefined && (
          <button
            onClick={e => { e.stopPropagation(); onToggleMute?.(); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-white/40"
          >
            {tab.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors min-w-[120px] max-w-[200px] group relative",
        isActive 
          ? "bg-white/10 border-b-2" 
          : "bg-white/5 hover:bg-white/10",
        tab.hibernated && "opacity-60",
      )}
      style={{ 
        borderColor: isActive ? accentColor : 'transparent',
        borderTop: groupColor ? `2px solid ${groupColor}` : undefined,
      }}
    >
      {tab.incognito && <span className="text-xs mr-1">🕵</span>}
      {tab.loading ? (
        <RefreshCw className="w-4 h-4 text-white/50 animate-spin flex-shrink-0" />
      ) : tab.hibernated ? (
        <Moon className="w-4 h-4 text-white/30 flex-shrink-0" />
      ) : tab.favicon ? (
        <img src={tab.favicon} alt="" className="w-4 h-4 flex-shrink-0" onError={e => e.target.style.display='none'} />
      ) : (
        <Globe className="w-4 h-4 text-white/50 flex-shrink-0" />
      )}
      
      <span className="text-sm text-white/80 truncate flex-grow">
        {tab.pinned && <span className="mr-1 text-xs">📌</span>}
        {tab.title || 'New Tab'}
      </span>

      {tab.muted !== undefined && (
        <button
          onClick={e => { e.stopPropagation(); onToggleMute?.(); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-white/40"
        >
          {tab.muted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
        </button>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}