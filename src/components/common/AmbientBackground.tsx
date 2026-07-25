import React, { useEffect, useRef } from 'react';

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = 45;
    const particles: {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedX: number;
      speedY: number;
      pulseSpeed: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2 - 0.05,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Render subtle radial lights
      const mainGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.15,
        0,
        width * 0.5,
        height * 0.15,
        width * 0.6
      );
      mainGlow.addColorStop(0, 'rgba(124, 58, 237, 0.08)');
      mainGlow.addColorStop(0.5, 'rgba(124, 58, 237, 0.02)');
      mainGlow.addColorStop(1, 'rgba(9, 9, 11, 0)');

      ctx.fillStyle = mainGlow;
      ctx.fillRect(0, 0, width, height);

      // Render ambient float particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(time * p.pulseSpeed * 10) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.02, Math.min(0.6, currentAlpha))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(124, 58, 237, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-noise">
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />
    </div>
  );
};
