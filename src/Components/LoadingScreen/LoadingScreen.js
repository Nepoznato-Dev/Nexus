import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings.js';
import './LoadingScreen.css';

export default function LoadingScreen({ isLoading = true, showDuration = 2000 }) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [isFading, setIsFading] = useState(false);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const { settings } = useSettings();

  const spinnerChars = ['|', '/', '⏤', '\\'];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const performanceMode = settings?.performance?.performanceMode ?? false;

  // Spinner animation
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setSpinnerIndex(prev => (prev + 1) % spinnerChars.length);
    }, 250);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      // Page finished loading; start countdown to fade
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, showDuration);

      return () => clearTimeout(fadeTimer);
    }
  }, [isLoading, showDuration]);

  useEffect(() => {
    if (isFading) {
      // After fade completes (~600ms), stop rendering
      const hideTimer = setTimeout(() => {
        setShouldRender(false);
      }, 600);

      return () => clearTimeout(hideTimer);
    }
  }, [isFading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`loading-screen ${isFading ? 'fade-out' : 'fade-in'} ${
        prefersReducedMotion ? 'reduced-motion' : ''
      } ${performanceMode ? 'performance-mode' : ''}`}
    >
      <div className="loading-container">
        {/* SVG Circuit Board with N */}
        <svg
          className="circuit-board"
          viewBox="0 0 200 240"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#0080ff" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="nGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#0080ff" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>
          </defs>

          {/* Animated circuit lines flowing in */}
          <g className="circuit-lines">
            <line
              x1="100"
              y1="10"
              x2="100"
              y2="50"
              className="wire wire-1"
              strokeLinecap="round"
            />
            <line
              x1="100"
              y1="50"
              x2="60"
              y2="50"
              className="wire wire-2"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="50"
              x2="60"
              y2="120"
              className="wire wire-3"
              strokeLinecap="round"
            />
            <line
              x1="100"
              y1="50"
              x2="140"
              y2="50"
              className="wire wire-4"
              strokeLinecap="round"
            />
            <line
              x1="140"
              y1="50"
              x2="140"
              y2="120"
              className="wire wire-5"
              strokeLinecap="round"
            />
          </g>

          {/* Large N in center */}
          <text
            x="100"
            y="160"
            className="nexus-n"
            textAnchor="middle"
            fontSize="80"
            fontWeight="bold"
          >
            N
          </text>

          {/* Glow effect behind N */}
          <circle
            cx="100"
            cy="140"
            r="55"
            className="n-glow"
            fill="none"
          />
        </svg>

        {/* Spinner under N */}
        <div className="loading-text">
          <span className="spinner">{spinnerChars[spinnerIndex]}</span>
        </div>
      </div>
    </div>
  );
}
