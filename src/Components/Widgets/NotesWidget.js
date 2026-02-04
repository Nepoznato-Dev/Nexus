/**
 * NotesWidget.js - Quick note-taking for students
 * Auto-saves to localStorage with timestamps
 */

import React, { useState, useEffect, useRef } from 'react';
import { Save, FileText, Clock, Trash2, Plus, Check } from 'lucide-react';

export default function NotesWidget() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus_notes');
    if (saved) {
      try {
        const loadedNotes = JSON.parse(saved);
        setNotes(loadedNotes);
        // Auto-load most recent note
        if (loadedNotes.length > 0) {
          const latest = loadedNotes[0];
          setCurrentNote(latest.id);
          setNoteTitle(latest.title);
          setNoteContent(latest.content);
        }
      } catch (err) {
        console.error('Failed to load notes:', err);
      }
    }
  }, []);

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (currentNote && (noteContent || noteTitle)) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        saveNote();
        setIsSaving(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [noteContent, noteTitle]);

  const saveNote = () => {
    if (!currentNote) return;

    const updatedNotes = notes.map(note =>
      note.id === currentNote
        ? {
            ...note,
            title: noteTitle || 'Untitled Note',
            content: noteContent,
            updatedAt: new Date().toISOString()
          }
        : note
    );

    setNotes(updatedNotes);
    localStorage.setItem('nexus_notes', JSON.stringify(updatedNotes));
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setCurrentNote(newNote.id);
    setNoteTitle(newNote.title);
    setNoteContent(newNote.content);
    localStorage.setItem('nexus_notes', JSON.stringify(updatedNotes));
  };

  const selectNote = (note) => {
    // Save current note before switching
    if (currentNote) {
      saveNote();
    }

    setCurrentNote(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const deleteNote = (id) => {
    if (!confirm('Delete this note?')) return;

    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('nexus_notes', JSON.stringify(updatedNotes));

    // If deleting current note, switch to first available or create new
    if (currentNote === id) {
      if (updatedNotes.length > 0) {
        selectNote(updatedNotes[0]);
      } else {
        setCurrentNote(null);
        setNoteTitle('');
        setNoteContent('');
      }
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notes-widget h-full flex">
      {/* Sidebar - Note list */}
      <div className="w-40 border-r border-white/10 p-2 flex flex-col bg-black/20">
        <button
          onClick={createNewNote}
          className="w-full mb-2 px-3 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2 text-white text-sm"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => selectNote(note)}
              className={`group relative p-2 rounded-lg cursor-pointer transition-colors ${
                currentNote === note.id
                  ? 'bg-white/20'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {note.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center text-white/40 text-xs mt-4">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              No notes yet
            </div>
          )}
        </div>
      </div>

      {/* Main editor */}
      <div className="flex-1 flex flex-col p-4">
        {currentNote ? (
          <>
            {/* Title */}
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-lg font-semibold text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 mb-3"
            />

            {/* Content */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your notes here..."
              className="flex-1 w-full bg-transparent text-white placeholder-white/40 resize-none focus:outline-none text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            />

            {/* Status bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                <span>
                  Last saved: {formatDate(notes.find(n => n.id === currentNote)?.updatedAt)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {isSaving && (
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Save className="w-3 h-3 animate-pulse" />
                    Saving...
                  </div>
                )}
                {showSaved && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <Check className="w-3 h-3" />
                    Saved
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40">
            <FileText className="w-16 h-16 mb-3" />
            <p className="text-sm mb-4">No note selected</p>
            <button
              onClick={createNewNote}
              className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors text-white text-sm"
            >
              Create Your First Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
