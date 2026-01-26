import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import './PersonalityControl.css';

/**
 * 2D Personality Control
 * X-axis: Professional (left) ↔ Moody (right)
 * Y-axis: Chill (bottom) ↔ Mentor (top)
 */
export default function PersonalityControl({
  professionalism = 0.5,
  mentorship = 0.5,
  isLocked = false,
  onPersonalityChange,
  onLockToggle
}) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = () => {
    if (isLocked) return;
    setIsDragging(true);
    onLockToggle?.(true); // Lock when user starts dragging
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || isLocked) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0-1
    const y = 1 - (e.clientY - rect.top) / rect.height; // 0-1 (inverted for top=mentor)
    
    onPersonalityChange?.({
      professionalism: Math.max(0, Math.min(1, x)),
      mentorship: Math.max(0, Math.min(1, y))
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Preset buttons
  const presets = [
    { name: 'Friendly', prof: 0.3, ment: 0.7 },
    { name: 'Neutral', prof: 0.5, ment: 0.5 },
    { name: 'Professional', prof: 0.8, ment: 0.4 },
    { name: 'Mentor', prof: 0.6, ment: 0.9 }
  ];
  
  const applyPreset = (prof, ment) => {
    onPersonalityChange?.({ professionalism: prof, mentorship: ment });
    onLockToggle?.(true); // Lock when preset applied
  };
  
  const resetToAuto = () => {
    onLockToggle?.(false); // Unlock to enable auto-adapt
  };
  
  return (
    <div className="personality-control">
      <div className="personality-header">
        <h3>AI Personality</h3>
        <button
          className={`lock-btn ${isLocked ? 'locked' : 'unlocked'}`}
          onClick={() => onLockToggle?.(!isLocked)}
          title={isLocked ? 'Unlock to auto-adapt' : 'Lock to keep manual'}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>
      
      {!isLocked && (
        <p className="auto-adapt-hint">Adapting to your style...</p>
      )}
      
      {/* 2D Control Grid */}
      <div
        className="personality-grid"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Crosshair cursor */}
        <div
          className="personality-crosshair"
          style={{
            left: `${professionalism * 100}%`,
            top: `${(1 - mentorship) * 100}%`
          }}
        />
        
        {/* Axis labels */}
        <div className="axis-label left-label">Professional</div>
        <div className="axis-label right-label">Moody</div>
        <div className="axis-label top-label">Mentor</div>
        <div className="axis-label bottom-label">Chill</div>
      </div>
      
      {/* Preset buttons */}
      <div className="preset-buttons">
        {presets.map(preset => (
          <button
            key={preset.name}
            className={`preset-btn ${
              Math.abs(professionalism - preset.prof) < 0.15 &&
              Math.abs(mentorship - preset.ment) < 0.15
                ? 'active'
                : ''
            }`}
            onClick={() => applyPreset(preset.prof, preset.ment)}
          >
            {preset.name}
          </button>
        ))}
      </div>
      
      {/* Reset button */}
      {isLocked && (
        <button className="reset-btn" onClick={resetToAuto}>
          Reset to Auto-Adapt
        </button>
      )}
    </div>
  );
}
