
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const FloatingHearts: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const createHeart = () => {
      const heart = document.createElement('div');
      heart.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: rgba(236, 72, 153, 0.4);">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>`;
      heart.style.position = 'absolute';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.top = '110vh';
      heart.style.filter = 'blur(1px)';
      
      containerRef.current?.appendChild(heart);

      const duration = 10 + Math.random() * 15;
      const xOffset = (Math.random() - 0.5) * 400;

      gsap.to(heart, {
        y: '-120vh',
        x: `+=${xOffset}`,
        rotation: Math.random() * 360,
        opacity: 0,
        duration: duration,
        ease: 'power1.out',
        onComplete: () => {
          heart.remove();
        }
      });
    };

    const interval = setInterval(createHeart, 800);
    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
};

export default FloatingHearts;
