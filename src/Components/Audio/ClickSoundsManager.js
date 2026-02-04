import React, { useEffect, useRef, useState } from 'react';

// Click Sounds Manager Component
// Plays sounds on UI interactions (buttons, links, etc.)

const ClickSoundsManager = ({ enabled = true, volume = 0.3 }) => {
  const audioRef = useRef(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(enabled);
  const [soundVolume, setSoundVolume] = useState(volume);

  // Initialize click sounds on mount
  useEffect(() => {
    if (!isSoundEnabled) return;

    const handleClick = (event) => {
      // Don't play sound for certain elements
      const target = event.target;
      
      if (
        target.matches('button, a, [role="button"], input[type="radio"], input[type="checkbox"]') &&
        !target.closest('[data-no-click-sound]') // Skip elements with data-no-click-sound
      ) {
        playClickSound();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isSoundEnabled]);

  // Play click sound
  const playClickSound = async () => {
    if (!audioRef.current || !isSoundEnabled) return;

    try {
      // Use simple sine wave click (Web Audio API) - no file needed
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Short beep sound
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(soundVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Click sound failed (user may need to interact first):', error);
    }
  };

  // Toggle click sounds
  const toggleClickSounds = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  // Update volume
  const handleVolumeChange = (newVolume) => {
    setSoundVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />
      
      {/* Optional: Click sound controls (can be moved to settings) */}
      {false && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 998,
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <span>🔊 Click Sounds</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isSoundEnabled}
              onChange={() => toggleClickSounds()}
              style={{ cursor: 'pointer' }}
            />
            {isSoundEnabled ? 'On' : 'Off'}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={soundVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            style={{ width: '50px', cursor: 'pointer' }}
            title={`Volume: ${Math.round(soundVolume * 100)}%`}
          />
        </div>
      )}
    </>
  );
};

export default ClickSoundsManager;
