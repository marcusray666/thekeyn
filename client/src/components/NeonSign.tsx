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
    <span 
      className="fixed pointer-events-none select-none font-black neon-sign-clean"
      style={{
        position: 'fixed',
        zIndex: 0,
        top: '1.5rem',
        left: '1.5rem',
        opacity,
        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
        lineHeight: '1.2',
        paddingBottom: '0.25rem',
        filter: 'drop-shadow(0 0 8px rgba(254, 63, 94, 0.4)) drop-shadow(0 0 15px rgba(254, 63, 94, 0.2))',
        textShadow: '0 0 10px rgba(254, 63, 94, 0.3), 0 0 20px rgba(254, 63, 94, 0.2)'
      }}
    >
      TheKeyn
    </span>
  );
}