import React, { useEffect, useRef, useState } from 'react';

// Page Background Music Manager Component
// Handles background music playback with smooth transitions

const PageBackgroundMusic = ({ pageId, config = {} }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const volumeFadeRef = useRef(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Fade audio volume smoothly
  const fadeAudio = (targetVolume, duration) => {
    if (volumeFadeRef.current) {
      clearTimeout(volumeFadeRef.current);
    }

    const startVolume = currentVolume;
    const startTime = Date.now();

    const updateVolume = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newVolume = startVolume + (targetVolume - startVolume) * progress;

      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
      setCurrentVolume(newVolume);

      if (progress < 1) {
        volumeFadeRef.current = setTimeout(updateVolume, 16); // ~60fps
      }
    };

    updateVolume();
  };

  // Play background music
  const playBackgroundMusic = async () => {
    if (!audioRef.current || !pageId || !config[pageId]) {
      return;
    }

    const soundConfig = config[pageId];
    if (!soundConfig.url) {
      return;
    }

    try {
      // Stop current audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Set up new audio
      audioRef.current.src = soundConfig.url;
      audioRef.current.loop = soundConfig.loop !== false;
      audioRef.current.volume = 0; // Start silent for fade-in

      // Attempt to play (may be blocked by browser)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // Fade in music
            if (soundConfig.fadeIn) {
              fadeAudio(soundConfig.volume, soundConfig.fadeIn);
            } else {
              audioRef.current.volume = soundConfig.volume;
              setCurrentVolume(soundConfig.volume);
            }
          })
          .catch(err => {
            console.log('Audio playback failed (browser may require user interaction):', err);
            setIsPlaying(false);
          });
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  };

  // Stop background music with fade out
  const stopBackgroundMusic = () => {
    if (!audioRef.current) {
      return;
    }

    const pageConfig = config[pageId];
    const fadeOutDuration = pageConfig?.fadeOut || 500;

    fadeAudio(0, fadeOutDuration);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentVolume(0);
    }, fadeOutDuration);
  };

  // Handle page changes
  useEffect(() => {
    // Require user interaction first for autoplay policies
    if (!hasUserInteracted) {
      const handleInteraction = () => {
        setHasUserInteracted(true);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('keydown', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    }

    if (pageId && hasUserInteracted) {
      playBackgroundMusic();
    }

    return () => {
      // Don't stop music on unmount - let it continue
      // This is intentional for smooth transitions between pages
    };
  }, [pageId, hasUserInteracted, config]);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      {/* Optional: Add visual indicator that music is playing */}
      {isPlaying && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            fontSize: '24px',
            opacity: 0.7,
            cursor: 'pointer',
            zIndex: 999,
            animation: 'pulse 2s infinite'
          }}
          title={`Playing: ${config[pageId]?.description || 'Music'}`}
          onClick={() => {
            if (isPlaying) {
              stopBackgroundMusic();
            } else {
              playBackgroundMusic();
            }
          }}
        >
          🎵
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default PageBackgroundMusic;
