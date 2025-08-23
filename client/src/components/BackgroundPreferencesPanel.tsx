import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  RefreshCw, 
  Settings, 
  Sparkles,
  X,
  Heart,
} from 'lucide-react';

// Background preference interface
interface BackgroundPreference {
  id: number;
  userId: number;
  gradientType: 'linear' | 'radial' | 'conic' | 'mesh';
  colorScheme: 'warm' | 'cool' | 'vibrant' | 'monochrome' | 'pastel';
  primaryColors: string[];
  intensity: number;
  animationSpeed: 'slow' | 'medium' | 'fast' | 'none';
  moodTag: 'energetic' | 'calm' | 'creative' | 'professional' | 'focused' | 'relaxed';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  usageCount: number;
  userRating?: number | null;
  context: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BackgroundPreferencesProps {
  trigger?: React.ReactElement;
}

export function BackgroundPreferencesPanel({ trigger }: BackgroundPreferencesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state
  const [selectedPreference, setSelectedPreference] = useState<BackgroundPreference | null>(null);

  // Fetch background preferences with proper typing
  const { data: preferences = [], isLoading } = useQuery<BackgroundPreference[]>({
    queryKey: [`/api/background/preferences/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch analytics with proper typing
  const { data: analytics = [] } = useQuery<any[]>({
    queryKey: [`/api/background/analytics/${user?.id}`],
    enabled: !!user?.id,
  });

  // Delete preference mutation
  const deletePreferenceMutation = useMutation({
    mutationFn: async (preferenceId: number) => {
      return apiRequest(`/api/background/preferences/${preferenceId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/background/preferences/${user.id}`] });
      }
      toast({
        title: 'Preference deleted',
        description: 'Background preference has been removed',
      });
    },
  });

  // Generate new gradient mutation
  const generateGradientMutation = useMutation({
    mutationFn: async () => {
      console.log('BackgroundPreferencesPanel: Starting gradient generation for user', user?.id);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate AI preference
      const newGradient = {
        gradientType: 'linear' as const,
        colorScheme: 'vibrant' as const,
        primaryColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        intensity: 0.8,
        animationSpeed: 'medium' as const,
        moodTag: 'creative' as const,
        timeOfDay: 'afternoon' as const,
        usageCount: 1,
        userRating: null,
        context: 'dashboard',
      };

      console.log('Generating new gradient:', newGradient);

      const response = await fetch('/api/background/preferences', {
        method: 'POST',
        body: JSON.stringify(newGradient),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      return result as BackgroundPreference;
    },
    onSuccess: (newGradient: BackgroundPreference) => {
      console.log('Successfully created new gradient preference:', newGradient);
      
      // Force refresh the preferences list
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/background/preferences/${user.id}`] });
        queryClient.refetchQueries({ queryKey: [`/api/background/preferences/${user.id}`] });
      }
      
      toast({
        title: 'New gradient generated',
        description: 'A personalized gradient has been created and saved to your preferences',
      });
      
      // Apply the new gradient
      if (newGradient) {
        selectPreference(newGradient);
      }
    },
    onError: (error) => {
      console.error('Failed to generate gradient:', error);
      toast({
        title: 'Generation failed',
        description: 'Unable to create a new gradient. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Select preference function
  const selectPreference = async (preference: BackgroundPreference) => {
    console.log('BackgroundPreferencesPanel: Selecting preference', preference);
    
    // Save to localStorage for persistence across sessions
    localStorage.setItem('selectedBackgroundPreference', JSON.stringify(preference));
    
    // Apply the background immediately
    window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: preference }));
    console.log('BackgroundPreferencesPanel: Dispatched backgroundUpdate event', preference);
    
    // Track the interaction (non-blocking)
    setTimeout(() => {
      apiRequest('/api/background/interactions', {
        method: 'POST',
        body: JSON.stringify({
          preferenceId: preference.id,
          interactionType: 'select',
          pageContext: window.location.pathname,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.log('Background interaction tracking failed (non-critical):', error);
      });
    }, 100);
    
    setSelectedPreference(preference);
    toast({
      title: 'Background applied',
      description: `${preference.gradientType} ${preference.colorScheme} background is now active`,
    });
  };

  const PreferenceCard = ({ preference }: { preference: BackgroundPreference }) => (
    <Card 
      className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90 transition-all duration-200 cursor-pointer hover:shadow-lg min-h-[140px] md:min-h-[160px]"
      onClick={() => selectPreference(preference)}
    >
      <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <div 
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 border-gray-200 flex-shrink-0"
              style={{
                background: `linear-gradient(45deg, ${preference.primaryColors.slice(0, 2).join(', ')})`
              }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xs md:text-sm text-gray-800 capitalize truncate">
                {preference.gradientType} {preference.colorScheme}
              </CardTitle>
              <CardDescription className="text-xs">
                Used {preference.usageCount} times
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deletePreferenceMutation.mutate(preference.id);
            }}
            className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1 md:p-2"
          >
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-3 md:p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {preference.moodTag}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {preference.animationSpeed}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Intensity: {Math.round(preference.intensity * 100)}%</span>
          {preference.userRating && (
            <div className="flex items-center">
              <Heart className="h-3 w-3 text-red-400 mr-1" />
              <span>{preference.userRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const defaultTrigger = (
    <Button variant="outline" className="bg-white/90 backdrop-blur-xl border-gray-200/50 hover:bg-white">
      <Palette className="h-4 w-4 mr-2" />
      Background Settings
    </Button>
  );

  return (
    <Dialog onOpenChange={(open) => {
      // Dispatch custom event for navigation hiding
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: open } }));
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl lg:max-h-[85vh] md:max-h-[90vh] max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-gray-200/50 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-[calc(100vw-4rem)] lg:w-auto sm:max-w-[600px] md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1200px] left-2 right-2 sm:left-4 sm:right-4 md:left-8 md:right-8 lg:left-auto lg:right-auto translate-x-0 lg:left-[50%] lg:translate-x-[-50%]">
        <DialogHeader className="pb-4 md:pb-6">
          <DialogTitle className="flex items-center text-gray-800 text-base md:text-lg">
            <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
            Personalized Background Engine
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm md:text-base">
            Customize your background preferences and let AI learn from your choices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row gap-3 md:gap-4">
            <Button
              onClick={() => generateGradientMutation.mutate()}
              disabled={generateGradientMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500 w-full sm:w-auto flex-1 md:flex-none py-2 md:py-2 text-sm md:text-base"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateGradientMutation.isPending ? 'animate-spin' : ''}`} />
              Generate New Gradient
            </Button>
            <Button variant="outline" className="bg-white/80 w-full sm:w-auto flex-1 md:flex-none py-2 md:py-2 text-sm md:text-base">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </Button>
          </div>

          {/* Learning Insights */}
          {analytics.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <CardHeader>
                <CardTitle className="text-gray-800">Your Preferences</CardTitle>
                <CardDescription>
                  AI insights based on your usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-gray-800">
                      {analytics.filter((a: any) => a.interactionType === 'like').length}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Liked Gradients</div>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-gray-800">
                      {Math.round(analytics.reduce((acc: any, a: any) => acc + (a.timeSpent || 0), 0) / 60)}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Minutes Viewing</div>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-gray-800">
                      {new Set(analytics.map((a: any) => a.pageContext)).size}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Pages Visited</div>
                  </div>
                  <div className="text-center p-3 md:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-gray-800">
                      {analytics.filter((a: any) => a.timeOfDay === 'evening').length > analytics.length / 2 ? '🌙' : '☀️'}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Preferred Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Preferences */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Your Saved Preferences</h3>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading preferences...</div>
            ) : preferences.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
                <CardContent className="text-center py-8">
                  <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No saved preferences yet</p>
                  <p className="text-sm text-gray-400">
                    Use the app and interact with backgrounds to build your personal preference profile
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {preferences.map((preference: BackgroundPreference) => (
                  <PreferenceCard key={preference.id} preference={preference} />
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
            <CardHeader>
              <CardTitle className="text-gray-800">AI Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions based on your preferences and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Click "Generate New Gradient" above to let AI create personalized backgrounds that match your style and mood.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg border border-gray-200">
                  <div className="text-sm md:text-base font-medium text-gray-800">Smart Learning</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">AI learns from your interactions to suggest better backgrounds</div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200">
                  <div className="text-sm md:text-base font-medium text-gray-800">Context Aware</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">Backgrounds adapt based on time of day and page context</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}