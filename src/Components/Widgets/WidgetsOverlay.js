import React, { useMemo, useState } from 'react';
import WidgetContainer from './WidgetContainer.js';
import SpotifyWidget from './SpotifyWidget.js';
import YouTubeWidget from './YouTubeWidget.js';
import { useSettings } from '../../hooks/useSettings.js';

export default function WidgetsOverlay() {
  const { settings } = useSettings();
  const [hidden, setHidden] = useState({ spotify: false, youtube: false });
  const [refreshTick, setRefreshTick] = useState(0);

  React.useEffect(() => {
    const handleComponentRefresh = (event) => {
      const target = event?.detail?.target;
      if (target !== 'widgets-overlay') return;
      setRefreshTick((prev) => prev + 1);
    };

    window.addEventListener('nexus:refresh-component', handleComponentRefresh);
    return () => {
      window.removeEventListener('nexus:refresh-component', handleComponentRefresh);
    };
  }, []);

  const enabledWidgets = useMemo(() => {
    if (!settings.widgets?.enabled) return [];
    const list = [];
    if (settings.widgets.spotify && !hidden.spotify) list.push('spotify');
    if (settings.widgets.youtube && !hidden.youtube) list.push('youtube');
    // Future: add TikTok when implemented
    const limit = settings.performance?.widgetLimit || 3;
    return list.slice(0, limit);
  }, [settings, hidden, refreshTick]);

  if (enabledWidgets.length === 0) return null;

  const positions = {
    spotify: { x: 20, y: 100 },
    youtube: { x: 320, y: 100 },
  };

  return (
    <div className="pointer-events-none">
      {enabledWidgets.includes('spotify') && (
        <WidgetContainer
          id="spotify"
          title="Spotify"
          defaultPosition={positions.spotify}
          onClose={() => setHidden(prev => ({ ...prev, spotify: true }))}
        >
          <div className="pointer-events-auto">
            <SpotifyWidget />
          </div>
        </WidgetContainer>
      )}

      {enabledWidgets.includes('youtube') && (
        <WidgetContainer
          id="youtube"
          title="YouTube"
          defaultPosition={positions.youtube}
          onClose={() => setHidden(prev => ({ ...prev, youtube: true }))}
        >
          <div className="pointer-events-auto">
            <YouTubeWidget />
          </div>
        </WidgetContainer>
      )}
    </div>
  );
}
