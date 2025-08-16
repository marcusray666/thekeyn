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
      className="fixed pointer-events-none select-none font-black"
      style={{
        position: 'fixed',
        zIndex: 0,
        top: '1.5rem',
        left: '1.5rem',
        opacity,
        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
        lineHeight: '0.9'
      }}
    >
      <span 
        className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] bg-clip-text text-transparent"
        style={{
          backgroundImage: 'linear-gradient(to right, #FE3F5E, #FF6B8A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        TheKeyn
      </span>
    </div>
  );
}