import React, { useEffect, useRef } from 'react';

export default function NetworkNodes({
  accentColor = '#00f0ff',
  nodeCount = 50,
  connectionDistance = 150,
  speed = 0.5,
  opacity = 0.6,
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

    // Create network nodes
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      radius: Math.random() * 3 + 2
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Draw connections to nearby nodes
        nodes.forEach((otherNode, j) => {
          if (i < j) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              const alpha = 1 - distance / connectionDistance;

              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.4})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.stroke();

              // Thicker glow line
              ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.15})`;
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          }
        });

        // Draw node with glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.3)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw node center
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
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
  }, [accentColor, nodeCount, connectionDistance, speed, lowEndMode, targetFPS, maxFPS, inactiveFPS, vsyncEnabled]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-[#0a0a0f]"
      style={{ opacity }}
    />
  );
}
