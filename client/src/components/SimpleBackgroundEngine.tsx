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
  const [currentGradient, setCurrentGradient] = useState(() => {
    // Initialize with persisted preference from localStorage
    try {
      const savedPreference = localStorage.getItem('selectedBackgroundPreference');
      if (savedPreference) {
        const preference = JSON.parse(savedPreference);
        if (preference.primaryColors && preference.primaryColors.length >= 2) {
          const [color1, color2] = preference.primaryColors;
          return `linear-gradient(135deg, ${color1}20 0%, ${color2}20 100%)`;
        }
      }
    } catch (error) {
      console.log('Failed to load persisted background preference:', error);
    }
    return GRADIENTS[0]; // Default fallback
  });

  // Initialize with user preference from database if not in localStorage
  useEffect(() => {
    if (user) {
      // Check if we already have a persisted preference
      const savedPreference = localStorage.getItem('selectedBackgroundPreference');
      if (savedPreference) {
        return; // Use the persisted preference, don't override
      }

      // Fetch user preference from database
      fetch(`/api/background/preferences/${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(preferences => {
          if (preferences.length > 0) {
            const latest = preferences[0];
            if (latest.primaryColors && latest.primaryColors.length >= 2) {
              const [color1, color2] = latest.primaryColors;
              const gradient = `linear-gradient(135deg, ${color1}20 0%, ${color2}20 100%)`;
              setCurrentGradient(gradient);
              // Also save to localStorage for persistence
              localStorage.setItem('selectedBackgroundPreference', JSON.stringify(latest));
            }
          }
        })
        .catch(() => {
          console.log('Failed to fetch background preferences from database');
        });
    }
  }, [user]);

  // Listen for background update events from BackgroundPreferencesPanel
  useEffect(() => {
    const handleBackgroundUpdate = (event: CustomEvent) => {
      console.log('SimpleBackgroundEngine received backgroundUpdate event:', event.detail);
      const preference = event.detail;
      if (preference && preference.primaryColors && preference.primaryColors.length >= 2) {
        const [color1, color2] = preference.primaryColors;
        const gradient = `linear-gradient(135deg, ${color1}20 0%, ${color2}20 100%)`;
        setCurrentGradient(gradient);
        console.log('SimpleBackgroundEngine updated background to:', gradient);
        
        // Immediately dispatch event for navigation to adapt
        window.dispatchEvent(new CustomEvent('navigationBackgroundUpdate', { 
          detail: { gradient, colors: preference.primaryColors }
        }));
        console.log('SimpleBackgroundEngine dispatched navigationBackgroundUpdate with colors:', preference.primaryColors);
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