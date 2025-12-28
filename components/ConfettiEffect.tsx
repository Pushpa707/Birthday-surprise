
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';

export interface ConfettiRef {
  fire: () => void;
}

const ConfettiEffect = forwardRef<ConfettiRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const colors = ['#ec4899', '#a855f7', '#6366f1', '#fbbf24', '#ffffff'];

  useImperativeHandle(ref, () => ({
    fire: () => {
      createBurst();
    }
  }));

  const createBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < 150; i++) {
      particles.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.8) * 25
        },
        gravity: 0.5,
        friction: 0.98,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, index) => {
        p.velocity.y += p.gravity;
        p.velocity.x *= p.friction;
        p.velocity.y *= p.friction;
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.opacity -= 0.01;
        p.rotation += p.rotationSpeed;

        if (p.opacity <= 0) {
          particles.current.splice(index, 1);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          
          // Draw random shapes
          if (index % 2 === 0) {
            ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });
    };

    gsap.ticker.add(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] select-none"
    />
  );
});

export default ConfettiEffect;
