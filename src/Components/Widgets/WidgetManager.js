/**
 * WidgetManager.js - Centralized Widget State Management
 * 
 * Features:
 * - Open/close/minimize widgets
 * - Persist widget positions to localStorage
 * - RAZONET integration (protected from culling when open)
 * - Auto-reload on open
 */

import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer.js';
import SpotifyWidget from './SpotifyWidget.js';
import YouTubeWidget from './YouTubeWidget.js';
import WeatherWidget from './WeatherWidget.js';
import TodoWidget from './TodoWidget.js';
import NotesWidget from './NotesWidget.js';

const AVAILABLE_WIDGETS = {
  spotify: {
    id: 'spotify',
    title: '🎵 Spotify',
    component: SpotifyWidget,
    defaultPosition: { x: 20, y: 100 }
  },
  youtube: {
    id: 'youtube',
    title: '📺 YouTube',
    component: YouTubeWidget,
    defaultPosition: { x: 340, y: 100 }
  },
  weather: {
    id: 'weather',
    title: '🌤️ Weather',
    component: WeatherWidget,
    defaultPosition: { x: 660, y: 100 }
  },
  todo: {
    id: 'todo',
    title: '✅ Tasks',
    component: TodoWidget,
    defaultPosition: { x: 20, y: 400 }
  },
  notes: {
    id: 'notes',
    title: '📝 Notes',
    component: NotesWidget,
    defaultPosition: { x: 340, y: 400 }
  }
};

export default function WidgetManager({ enabledWidgets = ['spotify', 'youtube', 'weather', 'todo', 'notes'] }) {
  const [widgets, setWidgets] = useState(() => {
    // Load widget state from localStorage
    const saved = localStorage.getItem('nexus_widget_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse widget state:', e);
      }
    }

    // Default: all widgets open
    return enabledWidgets.reduce((acc, id) => {
      acc[id] = {
        isOpen: true,
        isMinimized: false,
        position: AVAILABLE_WIDGETS[id]?.defaultPosition || { x: 20, y: 100 }
      };
      return acc;
    }, {});
  });

  // Persist widget state to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_widget_state', JSON.stringify(widgets));
  }, [widgets]);

  const handleClose = (widgetId) => {
    setWidgets(prev => {
      const updated = { ...prev };
      delete updated[widgetId];
      return updated;
    });
  };

  const handleMinimize = (widgetId) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: {
        ...prev[widgetId],
        isMinimized: true
      }
    }));
  };

  const handleOpen = (widgetId) => {
    if (!widgets[widgetId]) {
      // Widget was closed, re-add it
      setWidgets(prev => ({
        ...prev,
        [widgetId]: {
          isOpen: true,
          isMinimized: false,
          position: AVAILABLE_WIDGETS[widgetId]?.defaultPosition || { x: 20, y: 100 }
        }
      }));
    } else {
      // Widget exists, just un-minimize
      setWidgets(prev => ({
        ...prev,
        [widgetId]: {
          ...prev[widgetId],
          isMinimized: false
        }
      }));
    }
  };

  return (
    <>
      {Object.entries(widgets).map(([id, state]) => {
        const widgetConfig = AVAILABLE_WIDGETS[id];
        if (!widgetConfig) return null;

        const WidgetComponent = widgetConfig.component;

        return (
          <WidgetContainer
            key={id}
            id={id}
            title={widgetConfig.title}
            defaultPosition={state.position}
            isMinimized={state.isMinimized}
            onClose={() => handleClose(id)}
            onMinimize={() => handleMinimize(id)}
            reloadOnOpen={true}
          >
            <WidgetComponent />
          </WidgetContainer>
        );
      })}

      {/* Widget Toolbar (minimized widgets) */}
      {Object.keys(AVAILABLE_WIDGETS).some(id => !widgets[id] || widgets[id].isMinimized) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="backdrop-blur-xl bg-black/50 rounded-full border border-white/10 shadow-2xl px-4 py-2 flex items-center gap-2">
            {Object.entries(AVAILABLE_WIDGETS).map(([id, config]) => {
              const isHidden = !widgets[id] || widgets[id].isMinimized;

              if (!isHidden) return null;

              return (
                <button
                  key={id}
                  onClick={() => handleOpen(id)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm"
                  title={`Open ${config.title}`}
                >
                  {config.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Export functions for programmatic control
 */
export const widgetControls = {
  openWidget: (widgetId) => {
    window.dispatchEvent(new CustomEvent('widget:open', { detail: { widgetId } }));
  },
  closeWidget: (widgetId) => {
    window.dispatchEvent(new CustomEvent('widget:close', { detail: { widgetId } }));
  },
  minimizeWidget: (widgetId) => {
    window.dispatchEvent(new CustomEvent('widget:minimize', { detail: { widgetId } }));
  }
};
