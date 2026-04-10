import React, { useState } from 'react';
import { X, Shield, Palette, Keyboard, User, Zap, Globe, Eye } from 'lucide-react';
import { DEFAULT_SETTINGS } from './browserState.js';
import { SEARCH_ENGINES } from './browserFilters.js';

const SECTIONS = [
  { id: 'privacy', icon: Shield, label: 'Privacy' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'search', icon: Globe, label: 'Search' },
  { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts' },
  { id: 'performance', icon: Zap, label: 'Performance' },
  { id: 'profiles', icon: User, label: 'Profiles' },
  { id: 'advanced', icon: Eye, label: 'Advanced' },
];

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1 pr-4">
        <p className="text-sm text-white/80">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-blue-500' : 'bg-white/20'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function Slider({ value, onChange, min, max, step = 1, label, suffix = '' }) {
  return (
    <div className="py-2">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-sm text-blue-400">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

export default function BrowserSettings({ settings, onUpdate, profiles, currentProfile, onSwitchProfile, onClose }) {
  const [activeSection, setActiveSection] = useState('privacy');
  const [newProfileName, setNewProfileName] = useState('');
  const [editingShortcut, setEditingShortcut] = useState(null);

  const update = (key, value) => onUpdate({ ...settings, [key]: value });
  const updateNested = (key, subKey, value) => onUpdate({ ...settings, [key]: { ...(settings[key] || {}), [subKey]: value } });

  const captureShortcut = (e, actionKey) => {
    e.preventDefault();
    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    if (e.metaKey) parts.push('meta');
    if (e.key && !['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      parts.push(e.key.toLowerCase());
    }
    if (parts.length >= 2) {
      updateNested('shortcuts', actionKey, parts.join('+'));
      setEditingShortcut(null);
    }
  };

  return (
    <div className="flex h-full bg-[#0f0f1a] text-white">
      {/* Sidebar */}
      <div className="w-44 border-r border-white/10 p-2 space-y-0.5 flex-shrink-0">
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <span className="text-sm font-semibold text-white">Settings</span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40">
            <X className="w-4 h-4" />
          </button>
        </div>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === s.id ? 'bg-blue-500/20 text-blue-300' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Privacy Section */}
        {activeSection === 'privacy' && (
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white mb-4">Privacy & Security</h2>

            <Toggle
              value={settings.adBlocker}
              onChange={v => update('adBlocker', v)}
              label="Ad Blocker"
              description="Block ads using EasyList-style filter rules"
            />
            <Toggle
              value={settings.trackerBlocking}
              onChange={v => update('trackerBlocking', v)}
              label="Tracker Blocking"
              description="Block cross-site trackers and fingerprinting scripts"
            />
            <Toggle
              value={settings.httpsEnforcer}
              onChange={v => update('httpsEnforcer', v)}
              label="HTTPS Enforcer"
              description="Automatically upgrade HTTP connections to HTTPS"
            />
            <Toggle
              value={settings.cookieAutoDecline}
              onChange={v => update('cookieAutoDecline', v)}
              label="Auto-Decline Cookies"
              description="Automatically click decline on cookie consent banners"
            />
            <Toggle
              value={settings.incognitoMode}
              onChange={v => update('incognitoMode', v)}
              label="Incognito+ Mode"
              description="Enhanced private mode: blocks canvas fingerprinting, masks user-agent, no history saved"
            />

            <div className="mt-4">
              <p className="text-sm text-white/80 mb-2">Ad Blocker Allowlist</p>
              <p className="text-xs text-white/40 mb-2">Sites that are allowed to show ads</p>
              <AllowlistEditor
                items={settings.adBlockerAllowlist || []}
                onChange={items => update('adBlockerAllowlist', items)}
                placeholder="example.com"
              />
            </div>

            <div className="mt-4 p-3 bg-white/3 rounded-lg">
              <p className="text-sm text-white/80 mb-2">Focus Mode</p>
              <Toggle
                value={settings.focusModeActive}
                onChange={v => update('focusModeActive', v)}
                label="Focus Mode Active"
                description="Block distracting sites"
              />
              <p className="text-xs text-white/40 mt-2 mb-1">Blocked sites (one per line)</p>
              <textarea
                value={(settings.focusBlocklist || []).join('\n')}
                onChange={e => update('focusBlocklist', e.target.value.split('\n').filter(Boolean))}
                className="w-full bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none placeholder-white/30 font-mono h-20 resize-none"
                placeholder={"facebook.com\ntwitter.com\nreddit.com"}
              />
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-1">Pomodoro work (min)</p>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.pomodoroWork || 25}
                    onChange={e => update('pomodoroWork', Number(e.target.value))}
                    className="w-full bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-1">Break (min)</p>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.pomodoroBreak || 5}
                    onChange={e => update('pomodoroBreak', Number(e.target.value))}
                    className="w-full bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Section */}
        {activeSection === 'appearance' && (
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white mb-4">Appearance</h2>

            <div className="py-2">
              <p className="text-sm text-white/80 mb-2">Theme</p>
              <div className="flex gap-2">
                {['dark', 'light', 'auto'].map(t => (
                  <button
                    key={t}
                    onClick={() => update('theme', t)}
                    className={`px-4 py-1.5 text-sm rounded-lg capitalize transition-colors ${settings.theme === t ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {t === 'auto' ? '⚙ Auto' : t === 'dark' ? '🌙 Dark' : '☀ Light'}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-white/80 mb-2">Custom Colors</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'toolbar', label: 'Toolbar' },
                  { key: 'tabs', label: 'Tabs' },
                  { key: 'sidebar', label: 'Sidebar' },
                  { key: 'accent', label: 'Accent' },
                ].map(c => (
                  <div key={c.key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.themeColors?.[c.key] || '#1a1a2e'}
                      onChange={e => updateNested('themeColors', c.key, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm text-white/60">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-white/80 mb-2">Tab Layout</p>
              <div className="flex gap-2">
                {[
                  { value: 'top', label: '▬ Top' },
                  { value: 'vertical', label: '| Vertical' },
                  { value: 'sidebar', label: '⊞ Sidebar' },
                ].map(l => (
                  <button
                    key={l.value}
                    onClick={() => update('layout', l.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${settings.layout === l.value ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-white/80 mb-2">Density</p>
              <div className="flex gap-2">
                {['compact', 'normal', 'spacious'].map(d => (
                  <button
                    key={d}
                    onClick={() => update('density', d)}
                    className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${settings.density === d ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              value={settings.globalZoom || 100}
              onChange={v => update('globalZoom', v)}
              min={50}
              max={200}
              step={10}
              label="Default Zoom"
              suffix="%"
            />

            <Slider
              value={settings.globalFontSize || 16}
              onChange={v => update('globalFontSize', v)}
              min={10}
              max={32}
              label="Minimum Font Size"
              suffix="px"
            />
          </div>
        )}

        {/* Search Section */}
        {activeSection === 'search' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Search</h2>
            <p className="text-sm text-white/80 mb-2">Default Search Engine</p>
            <div className="space-y-1.5">
              {Object.entries(SEARCH_ENGINES).map(([key, se]) => (
                <button
                  key={key}
                  onClick={() => update('searchEngine', key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${settings.searchEngine === key || (!settings.searchEngine && key === 'duckduckgo') ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'bg-white/3 hover:bg-white/8 text-white/70'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${settings.searchEngine === key || (!settings.searchEngine && key === 'duckduckgo') ? 'bg-blue-400' : 'bg-white/20'}`} />
                  {se.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts Section */}
        {activeSection === 'shortcuts' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Keyboard Shortcuts</h2>
            <p className="text-xs text-white/40 mb-4">Click a shortcut to remap it, then press the new key combination</p>
            <div className="space-y-1.5">
              {Object.entries(settings.shortcuts || DEFAULT_SETTINGS.shortcuts).map(([action, shortcut]) => (
                <div key={action} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-white/70 capitalize">{action.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button
                    onKeyDown={editingShortcut === action ? (e) => captureShortcut(e, action) : undefined}
                    onClick={() => setEditingShortcut(editingShortcut === action ? null : action)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${editingShortcut === action ? 'bg-blue-500 text-white ring-2 ring-blue-400' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    {editingShortcut === action ? 'Press keys...' : shortcut}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => onUpdate({ ...settings, shortcuts: DEFAULT_SETTINGS.shortcuts })}
              className="mt-3 text-xs text-white/40 hover:text-white"
            >
              Reset to defaults
            </button>
          </div>
        )}

        {/* Performance Section */}
        {activeSection === 'performance' && (
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white mb-4">Performance</h2>
            <Toggle
              value={settings.preloading}
              onChange={v => update('preloading', v)}
              label="Link Preloading"
              description="Pre-fetch links on hover for faster navigation"
            />
            <Toggle
              value={settings.dataSaver}
              onChange={v => update('dataSaver', v)}
              label="Data Saver Mode"
              description="Compress images, block auto-play videos, lazy-load images"
            />
            <div className="py-2">
              <p className="text-sm text-white/80 mb-1">Tab Hibernation</p>
              <p className="text-xs text-white/40 mb-2">Auto-sleep inactive tabs after this many minutes (0 = disabled)</p>
              <input
                type="number"
                min="0"
                max="120"
                value={settings.hibernationTimeout || 30}
                onChange={e => update('hibernationTimeout', Number(e.target.value))}
                className="w-24 bg-white/5 text-white text-sm px-3 py-1.5 rounded outline-none"
              />
            </div>
          </div>
        )}

        {/* Profiles Section */}
        {activeSection === 'profiles' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Profiles</h2>
            <div className="space-y-2 mb-4">
              {Object.entries(profiles || {}).map(([id, profile]) => (
                <div
                  key={id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${currentProfile === id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/3 hover:bg-white/8 border border-white/5'}`}
                  onClick={() => onSwitchProfile(id)}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: profile.color }}>
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{profile.name}</p>
                    {currentProfile === id && <p className="text-xs text-blue-400">Active</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Section */}
        {activeSection === 'advanced' && (
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white mb-4">Advanced</h2>
            <Toggle
              value={settings.dataSaver}
              onChange={v => update('dataSaver', v)}
              label="Data Saver"
              description="Reduce data usage by optimizing images and blocking autoplay"
            />
            <div className="py-2">
              <p className="text-sm text-white/80 mb-1">Custom CSS per Domain</p>
              <p className="text-xs text-white/40 mb-2">Applied automatically when visiting matching domains</p>
              <CSSEditor
                customCSS={settings.customCSS || {}}
                onChange={css => update('customCSS', css)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AllowlistEditor({ items, onChange, placeholder }) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none placeholder-white/30"
          placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter' && input) { onChange([...items, input]); setInput(''); } }}
        />
        <button
          onClick={() => { if (input) { onChange([...items, input]); setInput(''); } }}
          className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
        >
          Add
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-1 bg-white/3 rounded text-xs">
            <span className="text-white/70">{item}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400/60 hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CSSEditor({ customCSS, onChange }) {
  const [domain, setDomain] = useState('');
  const [css, setCss] = useState('');
  const [selected, setSelected] = useState('');

  const save = () => {
    if (!domain) return;
    onChange({ ...customCSS, [domain]: css });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setDomain(e.target.value); setCss(customCSS[e.target.value] || ''); }}
          className="flex-1 bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none"
        >
          <option value="">— New domain —</option>
          {Object.keys(customCSS).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {selected && (
          <button
            onClick={() => { const n = { ...customCSS }; delete n[selected]; onChange(n); setSelected(''); setDomain(''); setCss(''); }}
            className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded"
          >
            Delete
          </button>
        )}
      </div>
      <input
        value={domain}
        onChange={e => setDomain(e.target.value)}
        className="w-full bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none placeholder-white/30"
        placeholder="Domain (e.g., github.com)"
      />
      <textarea
        value={css}
        onChange={e => setCss(e.target.value)}
        className="w-full bg-[#0a0a12] text-green-400 text-xs font-mono px-2 py-1.5 rounded outline-none h-24 resize-y border border-white/10"
        placeholder={"/* Custom CSS for this domain */\nbody { background: #000 !important; }"}
        spellCheck={false}
      />
      <button onClick={save} disabled={!domain} className="w-full py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded disabled:opacity-40">
        Save CSS
      </button>
    </div>
  );
}
