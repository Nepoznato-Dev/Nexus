import React, { useEffect, useRef } from 'react';

export default function GeometricPatterns({
  accentColor = '#00f0ff',
  pattern = 'hexagons', // hexagons, triangles, circles
  speed = 0.5,
  opacity = 0.4,
  density = 30,
  lowEndMode = false,
  targetFPS = 60,
  maxFPS = 60,
  inactiveFPS = 10,
  vsyncEnabled = true,
  refreshRate = 60
}) {
  const canvasRef = useRef(null);
  const lastFrameTime = useRef(Date.now());
  const inactiveRef = useRef(document.hidden);

  useEffect(() => {
    const handleVisibility = () => {
      inactiveRef.current = document.hidden || !document.hasFocus();
    };

    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let rotation = 0;

    const drawHexagon = (x, y, size, angle) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = angle + (Math.PI / 3) * i;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const drawTriangle = (x, y, size, angle) => {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = angle + (Math.PI * 2 / 3) * i;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;

      const spacing = density;
      const cols = Math.ceil(canvas.width / spacing) + 2;
      const rows = Math.ceil(canvas.height / spacing) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing - spacing;
          const y = j * spacing - spacing;
          const size = spacing * 0.4;
          const angle = rotation + (i + j) * 0.1;

          // Fade based on distance from center
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          const maxDistance = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2;
          const alpha = 1 - (distance / maxDistance) * 0.5;

          ctx.globalAlpha = alpha * 0.6;

          if (pattern === 'hexagons') {
            drawHexagon(x, y, size, angle);
          } else if (pattern === 'triangles') {
            drawTriangle(x, y, size, angle);
          } else if (pattern === 'circles') {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.closePath();
          }

          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      rotation += 0.005 * speed;
    };

    const animate = () => {
      const now = Date.now();
      const delta = now - lastFrameTime.current;
      const isInactive = inactiveRef.current;
      // Cap at vsync refresh rate when enabled, 1200 when disabled
      let effectiveFPS = Math.min(targetFPS, vsyncEnabled ? refreshRate : 1200);

      if (lowEndMode && (!effectiveFPS || effectiveFPS > 30)) {
        effectiveFPS = 30;
      }

      if (isInactive) {
        effectiveFPS = inactiveFPS;
      }

      const frameInterval = effectiveFPS ? (1000 / effectiveFPS) : 0;

      if (!effectiveFPS || delta >= frameInterval) {
        lastFrameTime.current = effectiveFPS ? (now - (delta % frameInterval)) : now;
        draw();
      }

      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [accentColor, pattern, speed, density, lowEndMode, targetFPS, maxFPS, inactiveFPS, vsyncEnabled]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ opacity }}
    />
  );
}
