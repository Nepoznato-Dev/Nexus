import React, { useEffect, useRef } from 'react';

export default function SoftParticleDrift({
  particleCount = 50,
  particleSize = 3,
  speed = 0.5,
  accentColor = '#00f0ff',
  opacity = 0.4,
  blur = 2,
  lowEndMode = false,
  targetFPS = 60,
  maxFPS = 60,
  inactiveFPS = 10,
  vsyncEnabled = true,
  refreshRate = 60
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
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
    let mounted = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const count = lowEndMode ? Math.floor(particleCount * 0.6) : particleCount;
      particlesRef.current = [];

      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * particleSize + 1,
          opacity: Math.random() * opacity + 0.2
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!mounted) return;

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

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

          if (blur > 0 && !lowEndMode) {
            ctx.shadowBlur = blur;
            ctx.shadowColor = accentColor;
          }

          ctx.fillStyle = accentColor + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
          ctx.fill();

          if (blur > 0 && !lowEndMode) {
            ctx.shadowBlur = 0;
          }
        });

        if (!lowEndMode) {
          particlesRef.current.forEach((p1, i) => {
            particlesRef.current.slice(i + 1, i + 6).forEach(p2 => {
              const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
              if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = accentColor + Math.floor((1 - dist / 120) * 30).toString(16).padStart(2, '0');
                ctx.stroke();
              }
            });
          });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [particleCount, particleSize, speed, accentColor, opacity, blur, lowEndMode, targetFPS, maxFPS, inactiveFPS, vsyncEnabled]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)' }}
    />
  );
}
