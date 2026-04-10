import React, { useState } from 'react';
import { X, ExternalLink, Clock, Bookmark, Trash2, Tag, Search, Plus, Globe, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { autoTagUrl } from './browserFilters.js';

// ─── History Panel ────────────────────────────────────────────────────
export function HistoryPanel({ history, onNavigate, onClose, onClear }) {
  const [search, setSearch] = useState('');
  
  const filtered = history.filter(h =>
    !search || h.url?.toLowerCase().includes(search.toLowerCase()) || h.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by date
  const groups = {};
  filtered.forEach(item => {
    const date = new Date(item.timestamp);
    const key = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white">History</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onClear} className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded">Clear</button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 text-white text-xs pl-7 pr-2 py-1.5 rounded outline-none placeholder-white/30"
            placeholder="Search history..."
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groups).length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">No history yet</div>
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <div key={date}>
              <div className="px-3 py-1.5 text-xs text-white/40 bg-white/3 sticky top-0 bg-[#1a1a2e]">{date}</div>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer group"
                  onClick={() => onNavigate(item.url)}
                >
                  {item.favicon ? (
                    <img src={item.favicon} alt="" className="w-4 h-4 flex-shrink-0" onError={e => e.target.style.display='none'} />
                  ) : (
                    <Globe className="w-4 h-4 text-white/20 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate">{item.title || item.url}</p>
                    <p className="text-xs text-white/30 truncate">{item.url}</p>
                  </div>
                  <span className="text-xs text-white/20 flex-shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Bookmarks Panel ────────────────────────────────────────────────
export function BookmarksPanel({ bookmarks, onNavigate, onClose, onDelete, onAdd, currentUrl, currentTitle }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = [...new Set(bookmarks.flatMap(b => b.tags || []))];

  const filtered = bookmarks.filter(b => {
    const matchesSearch = !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.url?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || b.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-yellow-400/70" />
          <span className="text-sm font-medium text-white">Bookmarks</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40">
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentUrl && (
        <button
          onClick={() => onAdd(currentUrl, currentTitle)}
          className="mx-2 mt-2 flex items-center gap-2 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg text-xs text-yellow-400 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Bookmark this page
        </button>
      )}

      <div className="p-2 space-y-1.5 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 text-white text-xs pl-7 pr-2 py-1.5 rounded outline-none placeholder-white/30"
            placeholder="Search bookmarks..."
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-2 py-0.5 text-xs rounded-full ${!selectedTag ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-2 py-0.5 text-xs rounded-full ${selectedTag === tag ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">No bookmarks</div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 group">
              {b.favicon ? (
                <img src={b.favicon} alt="" className="w-4 h-4 flex-shrink-0" onError={e => e.target.style.display='none'} />
              ) : (
                <Globe className="w-4 h-4 text-white/20 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate(b.url)}>
                <p className="text-xs text-white/80 truncate">{b.title}</p>
                <p className="text-xs text-white/30 truncate">{b.url}</p>
                {b.tags?.length > 0 && (
                  <div className="flex gap-1 mt-0.5">
                    {b.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-xs text-blue-400/50">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDelete(b.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400/60"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Reading List Panel ───────────────────────────────────────────────
export function ReadingListPanel({ items, onNavigate, onClose, onDelete, onToggleRead, onAdd, currentUrl, currentTitle }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-400/70" />
          <span className="text-sm font-medium text-white">Reading List</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40">
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentUrl && (
        <button
          onClick={() => onAdd(currentUrl, currentTitle)}
          className="mx-2 mt-2 flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs text-green-400 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Save for later
        </button>
      )}

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">Reading list is empty</div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`flex items-start gap-2 px-3 py-2 hover:bg-white/5 group ${item.read ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate(item.url)}>
                <p className="text-xs text-white/80 truncate">{item.title}</p>
                <p className="text-xs text-white/30 truncate">{item.url}</p>
                <p className="text-xs text-white/20 mt-0.5">
                  {new Date(item.savedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => onToggleRead(item.id)}
                  className="px-1.5 py-0.5 text-xs bg-white/5 hover:bg-white/10 rounded"
                  title={item.read ? 'Mark unread' : 'Mark read'}
                >
                  {item.read ? '↩' : '✓'}
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-0.5 hover:bg-red-500/20 rounded text-red-400/60"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Notes Panel (global list of notes) ─────────────────────────────
export function NotesListPanel({ notes, onClose, onNavigate }) {
  const allNotes = Object.entries(notes).flatMap(([domain, domainNotes]) =>
    domainNotes.map(n => ({ ...n, domain }))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <span className="text-sm font-medium text-white">📌 Pinned Notes</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {allNotes.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm">No notes yet. Visit a page and click 📌 to add a note.</div>
        ) : (
          allNotes.map(n => (
            <div key={n.id} className="rounded-lg p-2 text-xs" style={{ background: n.color + '22', border: '1px solid ' + n.color + '44' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/60 truncate">{n.domain}</span>
                <button onClick={() => onNavigate?.('https://' + n.domain)} className="text-white/30 hover:text-white">↗</button>
              </div>
              <p className="text-white/80 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Session Manager Panel ───────────────────────────────────────────
export function SessionPanel({ sessions, tabs, onClose, onSave, onRestore, onDelete }) {
  const [sessionName, setSessionName] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <span className="text-sm font-medium text-white">🗂 Sessions</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-2 border-b border-white/10 space-y-1.5">
        <p className="text-xs text-white/40">Save {tabs.length} open tab{tabs.length !== 1 ? 's' : ''} as a session</p>
        <input
          value={sessionName}
          onChange={e => setSessionName(e.target.value)}
          className="w-full bg-white/5 text-white text-xs px-2 py-1.5 rounded outline-none placeholder-white/30"
          placeholder="Session name..."
        />
        <button
          onClick={() => { if (sessionName) { onSave(sessionName); setSessionName(''); } }}
          disabled={!sessionName}
          className="w-full py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded disabled:opacity-40"
        >
          Save Current Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sessions.length === 0 ? (
          <p className="text-center text-white/30 text-xs py-4">No saved sessions</p>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80 font-medium">{s.name}</p>
                <p className="text-xs text-white/40">{s.tabs?.length || 0} tabs · {new Date(s.savedAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => onRestore(s)} className="px-2 py-0.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded">
                Restore
              </button>
              <button onClick={() => onDelete(s.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400/60">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
