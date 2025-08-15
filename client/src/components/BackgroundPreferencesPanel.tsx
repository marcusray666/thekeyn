import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Sparkles, Settings, Heart, X, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface BackgroundPreference {
  id: number;
  gradientType: string;
  colorScheme: string;
  primaryColors: string[];
  intensity: number;
  animationSpeed: string;
  moodTag?: string;
  usageCount: number;
  userRating?: number;
  lastUsed: string;
}

interface BackgroundPreferencesPanelProps {
  trigger?: React.ReactNode;
}

export function BackgroundPreferencesPanel({ trigger }: BackgroundPreferencesPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPreference, setSelectedPreference] = useState<BackgroundPreference | null>(null);

  // Fetch user preferences
  const { data: preferences = [], isLoading } = useQuery({
    queryKey: [`/api/background/preferences/${user?.id}`],
    enabled: !!user,
  });

  // Fetch analytics
  const { data: analytics = [] } = useQuery({
    queryKey: [`/api/background/recommendations/${user?.id}`],
    enabled: !!user,
  });

  // Create preference mutation
  const createPreferenceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/background/preferences', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/background/preferences/${user?.id}`] });
      toast({
        title: 'Preference saved',
        description: 'Your background preference has been saved successfully',
      });
    },
    onError: (error) => {
      console.error('Error saving preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to save background preference',
        variant: 'destructive',
      });
    },
  });

  // Update preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/background-preferences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/background-preferences'] });
      toast({
        title: 'Preference updated',
        description: 'Your background preference has been updated',
      });
    },
  });

  // Delete preference mutation
  const deletePreferenceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/background/preferences/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/background/preferences/${user?.id}`] });
      toast({
        title: 'Preference deleted',
        description: 'Background preference has been removed',
      });
    },
  });

  // Generate new gradient mutation
  const generateGradientMutation = useMutation({
    mutationFn: async () => {
      // Generate a random gradient based on user preferences
      const gradientTypes = ['linear', 'radial', 'conic'];
      const schemes = colorSchemeOptions;
      
      const randomType = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
      const randomScheme = schemes[Math.floor(Math.random() * schemes.length)];
      
      const newGradient = {
        gradientType: randomType,
        colorScheme: randomScheme.value,
        primaryColors: randomScheme.colors,
        intensity: 0.7 + Math.random() * 0.3, // 0.7 to 1.0
        animationSpeed: ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)],
        direction: Math.floor(Math.random() * 360) + 'deg',
        moodTag: 'generated',
      };

      return await apiRequest('/api/background/preferences', {
        method: 'POST',
        body: JSON.stringify(newGradient),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (newGradient) => {
      queryClient.invalidateQueries({ queryKey: [`/api/background/preferences/${user?.id}`] });
      toast({
        title: 'New gradient generated',
        description: 'A personalized gradient has been created and saved to your preferences',
      });
      
      // Trigger background refresh instead of page reload
      window.dispatchEvent(new CustomEvent('backgroundUpdate', { detail: newGradient }));
    },
    onError: (error) => {
      console.error('Error generating gradient:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new gradient',
        variant: 'destructive',
      });
    },
  });

  const colorSchemeOptions = [
    { value: 'warm', label: 'Warm', colors: ['#FE3F5E', '#FFD200'] },
    { value: 'cool', label: 'Cool', colors: ['#667eea', '#764ba2'] },
    { value: 'vibrant', label: 'Vibrant', colors: ['#fa709a', '#fee140'] },
    { value: 'pastel', label: 'Pastel', colors: ['#a8edea', '#fed6e3'] },
    { value: 'monochrome', label: 'Monochrome', colors: ['#2d3748', '#4a5568'] },
    { value: 'professional', label: 'Professional', colors: ['#4facfe', '#00f2fe'] },
  ];

  const gradientTypeOptions = [
    { value: 'linear', label: 'Linear', icon: '↗️' },
    { value: 'radial', label: 'Radial', icon: '⭕' },
    { value: 'conic', label: 'Conic', icon: '🌀' },
    { value: 'mesh', label: 'Mesh', icon: '🕸️' },
  ];

  const moodOptions = [
    { value: 'energetic', label: 'Energetic', icon: '⚡' },
    { value: 'calm', label: 'Calm', icon: '🧘' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'focused', label: 'Focused', icon: '🎯' },
    { value: 'relaxed', label: 'Relaxed', icon: '😌' },
  ];

  // Select preference function
  const selectPreference = async (preference: BackgroundPreference) => {
    console.log('BackgroundPreferencesPanel: Selecting preference', preference);
    
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
      className="bg-white/80 backdrop-blur-xl border-gray-200/50 hover:bg-white/90 transition-all duration-200 cursor-pointer hover:shadow-lg"
      onClick={() => selectPreference(preference)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-lg border-2 border-gray-200"
              style={{
                background: `linear-gradient(45deg, ${preference.primaryColors.slice(0, 2).join(', ')})`
              }}
            />
            <div>
              <CardTitle className="text-sm text-gray-800 capitalize">
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
            className="text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-xs">
            {preference.moodTag}
          </Badge>
          <Badge variant="outline" className="text-xs">
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
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-gray-200/50">
        <DialogHeader>
          <DialogTitle className="flex items-center text-gray-800">
            <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
            Personalized Background Engine
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Customize your background preferences and let AI learn from your choices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => generateGradientMutation.mutate()}
              disabled={generateGradientMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateGradientMutation.isPending ? 'animate-spin' : ''}`} />
              Generate New Gradient
            </Button>
            <Button variant="outline" className="bg-white/80">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {analytics.filter(a => a.interactionType === 'like').length}
                    </div>
                    <div className="text-sm text-gray-600">Liked Gradients</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {Math.round(analytics.reduce((acc, a) => acc + (a.timeSpent || 0), 0) / 60)}
                    </div>
                    <div className="text-sm text-gray-600">Minutes Viewing</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {new Set(analytics.map(a => a.pageContext)).size}
                    </div>
                    <div className="text-sm text-gray-600">Pages Visited</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {analytics.filter(a => a.timeOfDay === 'evening').length > analytics.length / 2 ? '🌙' : '☀️'}
                    </div>
                    <div className="text-sm text-gray-600">Preferred Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Saved Preferences</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preferences.map((preference: BackgroundPreference) => (
                  <PreferenceCard key={preference.id} preference={preference} />
                ))}
              </div>
            )}
          </div>

          {/* Manual Preference Creator */}
          <Card className="bg-white/80 backdrop-blur-xl border-gray-200/50">
            <CardHeader>
              <CardTitle className="text-gray-800">Create Custom Preference</CardTitle>
              <CardDescription>
                Manually create a background preference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Gradient Type
                  </label>
                  <Select defaultValue="linear">
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Color Scheme
                  </label>
                  <Select defaultValue="warm">
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorSchemeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded mr-2"
                              style={{
                                background: `linear-gradient(45deg, ${option.colors.join(', ')})`
                              }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Intensity: 50%
                </label>
                <Slider
                  defaultValue={[50]}
                  max={200}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Mood
                </label>
                <Select defaultValue="professional">
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500"
                disabled={createPreferenceMutation.isPending}
              >
                Save Custom Preference
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}