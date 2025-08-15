import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SimpleBackgroundEngineProps {
  children: React.ReactNode;
  className?: string;
}

// Simple gradient patterns that work
const GRADIENTS = [
  // Default pink/yellow theme
  'linear-gradient(135deg, rgba(254, 63, 94, 0.1) 0%, rgba(255, 210, 0, 0.1) 100%)',
  // Cool blues
  'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  // Warm sunset
  'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 230, 109, 0.1) 100%)',
  // Ocean vibes
  'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)',
  // Purple dream
  'linear-gradient(135deg, rgba(250, 112, 154, 0.1) 0%, rgba(254, 225, 64, 0.1) 100%)',
];

export function SimpleBackgroundEngine({ children, className = '' }: SimpleBackgroundEngineProps) {
  const { user } = useAuth();
  const [currentGradient, setCurrentGradient] = useState(GRADIENTS[0]);

  // Rotate gradients every 30 seconds for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * GRADIENTS.length);
      setCurrentGradient(GRADIENTS[randomIndex]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Initialize with user preference or random gradient
  useEffect(() => {
    if (user) {
      // Fetch user preference and set gradient
      fetch(`/api/background/preferences/${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(preferences => {
          if (preferences.length > 0) {
            const latest = preferences[0];
            if (latest.primaryColors && latest.primaryColors.length >= 2) {
              const [color1, color2] = latest.primaryColors;
              const gradient = `linear-gradient(135deg, ${color1}20 0%, ${color2}20 100%)`;
              setCurrentGradient(gradient);
            }
          }
        })
        .catch(() => {
          // Fallback to random gradient
          const randomIndex = Math.floor(Math.random() * GRADIENTS.length);
          setCurrentGradient(GRADIENTS[randomIndex]);
        });
    }
  }, [user]);

  // Listen for background update events from BackgroundPreferencesPanel
  useEffect(() => {
    const handleBackgroundUpdate = (event: CustomEvent) => {
      const preference = event.detail;
      if (preference && preference.primaryColors && preference.primaryColors.length >= 2) {
        const [color1, color2] = preference.primaryColors;
        const gradient = `linear-gradient(135deg, ${color1}20 0%, ${color2}20 100%)`;
        setCurrentGradient(gradient);
        
        // Dispatch event for navigation to adapt
        window.dispatchEvent(new CustomEvent('navigationBackgroundUpdate', { 
          detail: { gradient, colors: preference.primaryColors }
        }));
      }
    };

    window.addEventListener('backgroundUpdate', handleBackgroundUpdate);
    return () => window.removeEventListener('backgroundUpdate', handleBackgroundUpdate);
  }, []);

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        background: currentGradient,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      {children}
    </div>
  );
}