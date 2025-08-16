import { useState, useEffect } from 'react';

export function NeonSign() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fade out as user scrolls down, completely invisible after 100px
      const newOpacity = Math.max(0, 1 - (scrollY / 100));
      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (opacity <= 0) return null;

  return (
    <div 
      className="fixed pointer-events-none select-none neon-text-pure"
      style={{
        position: 'fixed',
        zIndex: 0,
        top: '1.5rem',
        left: '1.5rem',
        opacity,
        fontFamily: 'Inter, sans-serif',
        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: '#FF1744',
        textShadow: `
          0 0 5px rgba(255, 23, 68, 0.8),
          0 0 10px rgba(255, 23, 68, 0.6),
          0 0 15px rgba(255, 23, 68, 0.4),
          0 0 20px rgba(255, 23, 68, 0.3),
          0 0 35px rgba(255, 23, 68, 0.2),
          0 0 40px rgba(255, 23, 68, 0.1)
        `,
        animation: 'neon-flicker 3s ease-in-out infinite',
        display: 'inline-block',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        isolation: 'isolate',
        mixBlendMode: 'normal'
      }}
    >
      TheKeyn
    </div>
  );
}