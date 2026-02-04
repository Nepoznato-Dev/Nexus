import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl, openInAboutBlank } from 'utils';
import { useSettings } from '../../hooks/useSettings.js';
import { Home, Globe, Gamepad2, Brain, Settings as Cog, ChevronsLeft, ChevronsRight, Activity, ExternalLink } from 'lucide-react';

export default function Sidebar({ onWidthChange, onTogglePerformance, performanceOpen }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [expanded, setExpanded] = useState(false);

  const width = expanded ? 260 : 72;

  useEffect(() => {
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  const navItems = useMemo(() => ([
    { key: 'dashboard', label: 'Dashboard', icon: Home, to: 'Dashboard' },
    { key: 'browser', label: 'Browser', icon: Globe, to: 'Browser' },
    { key: 'games', label: 'Games', icon: Gamepad2, to: 'Games' },
    { key: 'study', label: 'Study Tools', icon: Brain, to: 'StudyTools' },
    { key: 'settings', label: 'Settings', icon: Cog, to: 'Settings' },
  ]), []);

  return (
    <aside
      className="h-full border-r border-white/10 backdrop-blur-sm"
      style={{ width }}
    >
      <div className="h-full flex flex-col">
        {/* Header / Toggle */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10" />
            {expanded && <span className="text-white/70 text-sm">Nexus</span>}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-white/10 text-white/70"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronsLeft className="w-5 h-5"/> : <ChevronsRight className="w-5 h-5"/>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-2">
          {navItems.map(({ key, label, icon: Icon, to }) => (
            <button
              key={key}
              onClick={() => navigate(createPageUrl(to))}
              className={`w-full flex items-center ${expanded ? 'gap-3 px-3' : 'justify-center'} py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors`}
            >
              <Icon className="w-5 h-5" />
              {expanded && <span className="text-sm">{label}</span>}
            </button>
          ))}

          <button
            onClick={() => onTogglePerformance?.()}
            className={`w-full flex items-center ${expanded ? 'gap-3 px-3' : 'justify-center'} py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors ${performanceOpen ? 'bg-white/10 text-white' : ''}`}
          >
            <Activity className="w-5 h-5" />
            {expanded && <span className="text-sm">Performance</span>}
          </button>
        </nav>

        <div className="mt-auto p-3 text-white/40 text-xs">
          <button
            onClick={() => openInAboutBlank(window.location.href, 'Nexus')}
            className={`w-full flex items-center ${expanded ? 'gap-3 px-2' : 'justify-center'} py-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors`}
            title="Open in about:blank"
          >
            <ExternalLink className="w-4 h-4" />
            {expanded && <span className="text-xs">Open in about:blank</span>}
          </button>
          {expanded ? 'Quick Navigation' : 'Nav'}
        </div>
      </div>
    </aside>
  );
}
