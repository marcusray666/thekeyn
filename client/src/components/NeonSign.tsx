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

  return (
    <span 
      className="fixed font-inter text-2xl md:text-xl sm:text-lg font-bold tracking-wider text-[#FF1744] pointer-events-none"
      style={{
        position: 'fixed',
        zIndex: 0,
        top: '1.5rem',
        left: '1.5rem',
        opacity,
        textShadow: `
          0 0 5px #FF1744,
          0 0 10px #FF1744,
          0 0 15px #FF1744,
          0 0 20px #FF1744,
          0 0 35px #FF1744,
          0 0 40px #FF1744
        `,
        animation: 'neon-flicker 3s ease-in-out infinite',
        background: 'none',
        border: 'none',
        boxShadow: 'none',
        margin: 0,
        padding: 0
      }}
    >
      TheKeyn
    </span>
  );
}