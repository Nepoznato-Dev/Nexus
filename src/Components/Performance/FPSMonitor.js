import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function FPSMonitor({
  visible = true,
  position = 'top-right',
  onPerformanceChange
}) {
  const [fps, setFps] = useState(60);
  const [status, setStatus] = useState('stable');
  const frameTimesRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());
  const animationRef = useRef(null);
  const lowFPSCountRef = useRef(0);

  useEffect(() => {
    if (!visible) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      if (frameTimesRef.current.length >= 10) {
        const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        let currentFPS = Math.round(1000 / avgDelta);

        // Use FPS throttler if available
        if (window.fpsThrottler) {
          currentFPS = window.fpsThrottler.getCurrentFPS();
        }

        setFps(currentFPS);

        // Expose FPS globally for other components
        if (!window.fpsMonitor) {
          window.fpsMonitor = {};
        }
        window.fpsMonitor.getCurrentFPS = () => currentFPS;

        if (currentFPS < 30) {
          lowFPSCountRef.current++;
          if (lowFPSCountRef.current > 120) {
            setStatus('throttled');
            onPerformanceChange?.('low');
          } else if (lowFPSCountRef.current > 60) {
            setStatus('adjusting');
            onPerformanceChange?.('adjusting');
          }
        } else if (currentFPS < 45) {
          lowFPSCountRef.current++;
          if (lowFPSCountRef.current > 60) {
            setStatus('adjusting');
            onPerformanceChange?.('adjusting');
          }
        } else {
          if (lowFPSCountRef.current > 0) {
            lowFPSCountRef.current = Math.max(0, lowFPSCountRef.current - 2);
          }
          if (lowFPSCountRef.current === 0) {
            setStatus('stable');
            onPerformanceChange?.('stable');
          }
        }
      }

      animationRef.current = requestAnimationFrame(measureFPS);
    };

    animationRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible, onPerformanceChange]);

  if (!visible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const statusColors = {
    stable: 'text-green-400 border-green-400/30',
    adjusting: 'text-yellow-400 border-yellow-400/30',
    throttled: 'text-red-400 border-red-400/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}
    >
      <div className={`px-3 py-1.5 rounded-lg backdrop-blur-xl bg-black/50 border ${statusColors[status]} font-mono text-sm`}>
        {fps} FPS
      </div>
    </motion.div>
  );
}
