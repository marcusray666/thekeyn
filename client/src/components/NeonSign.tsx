import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";

export function NeonSign() {
  const [opacity, setOpacity] = useState(1);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000
  });

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

  const getRoleLabel = () => {
    if (!user) return null;
    if (user.role === 'admin') return 'Admin';
    if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'starter') return 'Premium';
    return null;
  };

  const roleLabel = getRoleLabel();

  return (
    <div 
      className="fixed pointer-events-none select-none font-black flex items-center gap-2"
      style={{
        position: 'fixed',
        zIndex: 0,
        top: '5.5rem',
        left: '1.5rem',
        opacity,
        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
        lineHeight: '1.2'
      }}
    >
      <span className="neon-sign-clean">
        TheKeyn
      </span>
      {roleLabel && (
        <span 
          className="text-xs font-normal px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
          style={{
            fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
            color: user?.role === 'admin' ? '#FFD700' : '#FE3F5E'
          }}
        >
          {roleLabel}
        </span>
      )}
    </div>
  );
}