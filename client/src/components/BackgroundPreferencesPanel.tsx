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
  X,
  Heart,
} from 'lucide-react';

// Simple background preference interface
interface BackgroundPreference {
  id: number;
  userId: number;
  gradientType: 'linear' | 'radial';
  colorScheme: 'warm' | 'cool' | 'vibrant' | 'pastel';
  primaryColors: string[];
  intensity: number;
  usageCount: number;
  createdAt: Date;
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
        title: 'Background deleted',
        description: 'Background preference has been removed',
      });
    },
  });

  // Generate new gradient mutation
  const generateGradientMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate simple gradient
      const gradientTypes = ['linear', 'radial'] as const;
      const colorSchemes = ['warm', 'cool', 'vibrant', 'pastel'] as const;
      const colorPalettes = {
        warm: ['#FF6B6B', '#FFE066', '#FF8E53', '#FF6B9D'],
        cool: ['#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
        vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        pastel: ['#FFB6C1', '#E6E6FA', '#B0E0E6', '#F0E68C']
      };

      const randomGradientType = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
      const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      
      const newGradient = {
        gradientType: randomGradientType,
        colorScheme: randomColorScheme,
        primaryColors: colorPalettes[randomColorScheme],
        intensity: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        usageCount: 1,
      };

      return apiRequest('/api/background/preferences', {
        method: 'POST',
        body: newGradient,
      });
    },
    onSuccess: (newGradient: BackgroundPreference) => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/background/preferences/${user.id}`] });
      }
      toast({
        title: 'New background generated',
        description: 'A personalized background has been created and saved',
      });
      
      // Apply the new gradient
      if (newGradient) {
        selectPreference(newGradient);
      }
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: 'Unable to create a new background. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Select preference function
  const selectPreference = async (preference: BackgroundPreference) => {
    // Save to localStorage for persistence across sessions
    localStorage.setItem('selectedBackgroundPreference', JSON.stringify(preference));
    
    // Apply the background immediately
    window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: preference }));
    
    setSelectedPreference(preference);
    toast({
      title: 'Background applied',
      description: `${preference.gradientType} ${preference.colorScheme} background is now active`,
    });
  };

  const PreferenceCard = ({ preference }: { preference: BackgroundPreference }) => (
    <Card 
      className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90 transition-all duration-200 cursor-pointer hover:shadow-lg min-h-[120px]"
      onClick={() => selectPreference(preference)}
    >
      <CardHeader className="pb-2 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div 
              className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0"
              style={{
                background: `linear-gradient(45deg, ${preference.primaryColors.slice(0, 2).join(', ')})`
              }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm text-gray-800 capitalize truncate">
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
            className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Intensity: {Math.round(preference.intensity * 100)}%</span>
          <Badge variant="outline" className="text-xs">
            {preference.colorScheme}
          </Badge>
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
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-gray-200/50">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-gray-800">
            <Palette className="h-5 w-5 mr-2 text-pink-500" />
            Background Preferences
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Customize your background preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generate Button */}
          <div className="flex">
            <Button
              onClick={() => generateGradientMutation.mutate()}
              disabled={generateGradientMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500 w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateGradientMutation.isPending ? 'animate-spin' : ''}`} />
              Generate New Background
            </Button>
          </div>

          {/* Saved Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Saved Backgrounds</h3>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading preferences...</div>
            ) : preferences.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
                <CardContent className="text-center py-8">
                  <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No saved backgrounds yet</h4>
                  <p className="text-gray-500 mb-4">
                    Use the app and interact with backgrounds to build your personal preference profile
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preferences.map((preference) => (
                  <PreferenceCard key={preference.id} preference={preference} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}