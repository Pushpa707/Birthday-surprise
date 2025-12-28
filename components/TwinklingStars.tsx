
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  driftX: number;
  driftY: number;
  color: string;
}

const TwinklingStars: React.FC<{ count?: number; speed?: number }> = ({ count = 120, speed = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const colors = ['#ffffff', '#ffe4e1', '#f0f8ff', '#fff0f5'];

    const createStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < count; i++) {
        newStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.2,
          opacity: Math.random(),
          twinkleSpeed: (0.005 + Math.random() * 0.01) * speed,
          driftX: (Math.random() - 0.5) * 0.1 * speed,
          driftY: (Math.random() - 0.5) * 0.1 * speed,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      starsRef.current = newStars;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createStars();
    };

    createStars();
    window.addEventListener('resize', handleResize);

    const update = () => {
      ctx.clearRect(0, 0, width, height);
      
      starsRef.current.forEach((star) => {
        // Twinkle logic
        star.opacity += star.twinkleSpeed;
        if (star.opacity >= 1 || star.opacity <= 0.1) {
          star.twinkleSpeed *= -1;
        }

        // Drift logic
        star.x += star.driftX;
        star.y += star.driftY;

        // Boundary wrapping
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Drawing
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
        ctx.fill();
      });
    };

    // Use GSAP Ticker for smooth, performant updates synced with refresh rate
    gsap.ticker.add(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(update);
    };
  }, [count, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default TwinklingStars;
