import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface GradientConfig {
  id: string;
  type: 'linear' | 'radial' | 'conic' | 'mesh';
  colors: string[];
  direction?: string;
  intensity: number;
  animationSpeed: 'slow' | 'medium' | 'fast' | 'none';
  moodTag?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface BackgroundEngineProps {
  pageContext: string;
  children: React.ReactNode;
  className?: string;
}

// Sophisticated gradient patterns
const GRADIENT_PATTERNS = {
  linear: [
    // Warm schemes
    { colors: ['#FE3F5E', '#FFD200'], direction: 'to-br', scheme: 'warm' },
    { colors: ['#FF6B6B', '#FFE66D'], direction: 'to-r', scheme: 'warm' },
    { colors: ['#FF9068', '#FD746C'], direction: 'to-bl', scheme: 'warm' },
    
    // Cool schemes
    { colors: ['#667eea', '#764ba2'], direction: 'to-br', scheme: 'cool' },
    { colors: ['#4facfe', '#00f2fe'], direction: 'to-r', scheme: 'cool' },
    { colors: ['#43e97b', '#38f9d7'], direction: 'to-bl', scheme: 'cool' },
    
    // Vibrant schemes
    { colors: ['#fa709a', '#fee140'], direction: 'to-br', scheme: 'vibrant' },
    { colors: ['#a8edea', '#fed6e3'], direction: 'to-r', scheme: 'vibrant' },
    { colors: ['#ff9a9e', '#fecfef'], direction: 'to-bl', scheme: 'vibrant' },
    
    // Professional schemes
    { colors: ['#667eea', '#764ba2'], direction: 'to-br', scheme: 'professional' },
    { colors: ['#f093fb', '#f5576c'], direction: 'to-r', scheme: 'professional' },
    { colors: ['#4facfe', '#00f2fe'], direction: 'to-bl', scheme: 'professional' },
  ],
  
  radial: [
    { colors: ['#FE3F5E', '#FFD200', 'transparent'], scheme: 'warm' },
    { colors: ['#667eea', '#764ba2', 'transparent'], scheme: 'cool' },
    { colors: ['#fa709a', '#fee140', 'transparent'], scheme: 'vibrant' },
  ],
  
  conic: [
    { colors: ['#FE3F5E', '#FFD200', '#FE3F5E'], scheme: 'warm' },
    { colors: ['#667eea', '#764ba2', '#667eea'], scheme: 'cool' },
    { colors: ['#fa709a', '#fee140', '#fa709a'], scheme: 'vibrant' },
  ],
  
  mesh: [
    { colors: ['#FE3F5E', '#FFD200', '#FF6B6B', '#FFE66D'], scheme: 'warm' },
    { colors: ['#667eea', '#764ba2', '#4facfe', '#00f2fe'], scheme: 'cool' },
    { colors: ['#fa709a', '#fee140', '#a8edea', '#fed6e3'], scheme: 'vibrant' },
  ]
};

// Time-based mood suggestions
const TIME_BASED_SUGGESTIONS = {
  morning: { mood: 'energetic', schemes: ['warm', 'vibrant'], intensity: 1.2 },
  afternoon: { mood: 'professional', schemes: ['cool', 'professional'], intensity: 1.0 },
  evening: { mood: 'calm', schemes: ['cool', 'pastel'], intensity: 0.8 },
  night: { mood: 'calm', schemes: ['cool', 'monochrome'], intensity: 0.6 },
};

export function BackgroundEngine({ pageContext, children, className = '' }: BackgroundEngineProps) {
  const { user } = useAuth();
  const [currentGradient, setCurrentGradient] = useState<GradientConfig | null>(null);
  const [sessionStartTime] = useState(Date.now());
  const [pageViewTime, setPageViewTime] = useState(Date.now());

  // Fetch user preferences
  const { data: preferences = [] } = useQuery({
    queryKey: ['/api/background/preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/background/preferences/${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Record interaction mutation
  const recordInteractionMutation = useMutation({
    mutationFn: async (interaction: any) => {
      return await apiRequest('/api/background/interactions', {
        method: 'POST',
        body: JSON.stringify(interaction),
      });
    },
  });

  // Get current time of day
  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // AI-powered gradient selection based on user preferences and context
  const selectOptimalGradient = useCallback((): GradientConfig => {
    const timeOfDay = getCurrentTimeOfDay();
    const timeSuggestion = TIME_BASED_SUGGESTIONS[timeOfDay];
    
    // If user has preferences, use learning algorithm
    if (preferences && Array.isArray(preferences) && preferences.length > 0) {
      const recentPrefs = preferences.slice(0, 5); // Get most recent preferences
      
      // Weight preferences based on usage and rating
      const schemeWeights: Record<string, number> = {};
      const typeWeights: Record<string, number> = {};
      
      recentPrefs.forEach((pref: any) => {
        const weight = (pref.usageCount || 1) * (pref.userRating || 3) / 3;
        schemeWeights[pref.colorScheme] = (schemeWeights[pref.colorScheme] || 0) + weight;
        typeWeights[pref.gradientType] = (typeWeights[pref.gradientType] || 0) + weight;
      });
      
      // Select most preferred scheme and type
      const preferredScheme = Object.keys(schemeWeights).reduce((a, b) => 
        schemeWeights[a] > schemeWeights[b] ? a : b
      );
      const preferredType = Object.keys(typeWeights).reduce((a, b) => 
        typeWeights[a] > typeWeights[b] ? a : b
      ) as keyof typeof GRADIENT_PATTERNS;
      
      // Find matching pattern
      const patterns = GRADIENT_PATTERNS[preferredType] || GRADIENT_PATTERNS.linear;
      const matchingPatterns = patterns.filter((p: any) => 
        p.scheme === preferredScheme || timeSuggestion.schemes.includes(p.scheme)
      );
      
      if (matchingPatterns.length > 0) {
        const pattern = matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)];
        return {
          id: `${preferredType}-${Date.now()}`,
          type: preferredType,
          colors: pattern.colors,
          direction: pattern.direction,
          intensity: timeSuggestion.intensity,
          animationSpeed: 'medium',
          moodTag: timeSuggestion.mood,
          timeOfDay,
        };
      }
    }
    
    // Fallback to time-based selection for new users
    const availableSchemes = timeSuggestion.schemes;
    const selectedScheme = availableSchemes[Math.floor(Math.random() * availableSchemes.length)];
    
    const types = Object.keys(GRADIENT_PATTERNS) as Array<keyof typeof GRADIENT_PATTERNS>;
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    const patterns = GRADIENT_PATTERNS[selectedType];
    const matchingPatterns = patterns.filter((p: any) => p.scheme === selectedScheme);
    const pattern = matchingPatterns.length > 0 
      ? matchingPatterns[Math.floor(Math.random() * matchingPatterns.length)]
      : patterns[Math.floor(Math.random() * patterns.length)];
    
    return {
      id: `${selectedType}-${Date.now()}`,
      type: selectedType,
      colors: pattern.colors,
      direction: pattern.direction,
      intensity: timeSuggestion.intensity,
      animationSpeed: 'medium',
      moodTag: timeSuggestion.mood,
      timeOfDay,
    };
  }, [preferences]);

  // Generate CSS for gradient
  const generateGradientCSS = (gradient: GradientConfig): string => {
    const opacity = Math.min(gradient.intensity, 1) * 0.1; // Keep it subtle
    
    switch (gradient.type) {
      case 'linear':
        return `linear-gradient(${gradient.direction || 'to-br'}, ${gradient.colors.map(color => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`).join(', ')})`;
        
      case 'radial':
        return `radial-gradient(circle at center, ${gradient.colors.map(color => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`).join(', ')})`;
        
      case 'conic':
        return `conic-gradient(from 0deg, ${gradient.colors.map(color => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`).join(', ')})`;
        
      case 'mesh':
        // Create a complex mesh pattern
        return `
          linear-gradient(45deg, ${gradient.colors[0]}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 25%, transparent 25%),
          linear-gradient(-45deg, ${gradient.colors[1]}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${gradient.colors[2]}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 75%),
          linear-gradient(-45deg, transparent 75%, ${gradient.colors[3]}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 75%)
        `;
        
      default:
        return `linear-gradient(to-br, ${gradient.colors.join(', ')})`;
    }
  };

  // Initialize gradient on mount and page context change
  useEffect(() => {
    const gradient = selectOptimalGradient();
    setCurrentGradient(gradient);
    setPageViewTime(Date.now());

    // Record page view
    if (user) {
      recordInteractionMutation.mutate({
        gradientId: gradient.id,
        interactionType: 'view',
        pageContext,
        deviceType: window.innerWidth > 768 ? 'desktop' : 'mobile',
        timeOfDay: gradient.timeOfDay,
        sessionDuration: Date.now() - sessionStartTime,
      });
    }
  }, [pageContext, selectOptimalGradient, user]);

  // Record time spent on page when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentGradient && user) {
        const timeSpent = Math.round((Date.now() - pageViewTime) / 1000);
        
        // Record interaction with time spent
        recordInteractionMutation.mutate({
          gradientId: currentGradient.id,
          interactionType: 'view',
          timeSpent,
          pageContext,
          deviceType: window.innerWidth > 768 ? 'desktop' : 'mobile',
          timeOfDay: currentGradient.timeOfDay,
          sessionDuration: Date.now() - sessionStartTime,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentGradient, pageViewTime, pageContext, user, sessionStartTime]);

  if (!currentGradient) {
    return <div className={className}>{children}</div>;
  }

  const backgroundStyle = {
    background: generateGradientCSS(currentGradient),
    backgroundSize: currentGradient.type === 'mesh' ? '20px 20px' : 'cover',
    backgroundAttachment: 'fixed',
  };

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={backgroundStyle}
    >
      {children}
    </div>
  );
}

// Background preference learning hook
export function useBackgroundLearning() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const likeBackground = useMutation({
    mutationFn: async (gradientId: string) => {
      return await apiRequest('/api/background/interactions', {
        method: 'POST',
        body: JSON.stringify({
          gradientId,
          interactionType: 'like',
          pageContext: window.location.pathname,
          deviceType: window.innerWidth > 768 ? 'desktop' : 'mobile',
          timeOfDay: new Date().getHours() >= 5 && new Date().getHours() < 12 ? 'morning' : 
                    new Date().getHours() >= 12 && new Date().getHours() < 17 ? 'afternoon' :
                    new Date().getHours() >= 17 && new Date().getHours() < 21 ? 'evening' : 'night',
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background/preferences', user?.id] });
    },
  });

  const dislikeBackground = useMutation({
    mutationFn: async (gradientId: string) => {
      return await apiRequest('/api/background/interactions', {
        method: 'POST',
        body: JSON.stringify({
          gradientId,
          interactionType: 'dislike',
          pageContext: window.location.pathname,
          deviceType: window.innerWidth > 768 ? 'desktop' : 'mobile',
          timeOfDay: new Date().getHours() >= 5 && new Date().getHours() < 12 ? 'morning' : 
                    new Date().getHours() >= 12 && new Date().getHours() < 17 ? 'afternoon' :
                    new Date().getHours() >= 17 && new Date().getHours() < 21 ? 'evening' : 'night',
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background/preferences', user?.id] });
    },
  });

  return {
    likeBackground: likeBackground.mutate,
    dislikeBackground: dislikeBackground.mutate,
    isLoading: likeBackground.isPending || dislikeBackground.isPending,
  };
}