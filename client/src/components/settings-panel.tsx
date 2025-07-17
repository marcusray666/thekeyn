import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Palette, Bell, Shield, Lock, Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const themes = {
  'liquid-glass': {
    name: 'Liquid Glass',
    description: 'Dark cosmic theme with purple and blue gradients',
    preview: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
  },
  'ethereal-ivory': {
    name: 'Ethereal Ivory',
    description: 'Light elegant theme with warm tones',
    preview: 'linear-gradient(135deg, #F59E0B, #F3F4F6)',
  },
  'sage-moss': {
    name: 'Sage & Moss',
    description: 'Nature-inspired green theme',
    preview: 'linear-gradient(135deg, #10B981, #6B7280)',
  },
  'pastel-rose': {
    name: 'Pastel Rose',
    description: 'Soft pink and gray theme',
    preview: 'linear-gradient(135deg, #F472B6, #E5E7EB)',
  },
};

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showStats: true,
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme: string) => {
      return await apiRequest('/api/user/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Theme updated",
        description: "Your theme preference has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update theme.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ type, settings }: { type: string, settings: any }) => {
      return await apiRequest('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, settings }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    updateThemeMutation.mutate(newTheme);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    updateSettingsMutation.mutate({ type: 'notifications', settings: updated });
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    updateSettingsMutation.mutate({ type: 'privacy', settings: updated });
  };

  return (
    <Card className="glass-morphism p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="glass-input grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="appearance" className="text-xs">
            <Palette className="h-4 w-4 mr-1" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            <Bell className="h-4 w-4 mr-1" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs">
            <Shield className="h-4 w-4 mr-1" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Color Theme
            </Label>
            <div className="space-y-2">
              {Object.entries(themes).map(([key, themeData]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    theme === key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 glass-input'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ background: themeData.preview }}
                    />
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {themeData.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {themeData.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="text-sm text-foreground capitalize">
                  {key === 'mentions' ? 'Mentions & Tags' : key}
                </Label>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileVisible" className="text-sm text-foreground">
                Public Profile
              </Label>
              <Switch
                id="profileVisible"
                checked={privacy.profileVisible}
                onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showEmail" className="text-sm text-foreground">
                Show Email
              </Label>
              <Switch
                id="showEmail"
                checked={privacy.showEmail}
                onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showStats" className="text-sm text-foreground">
                Show Statistics
              </Label>
              <Switch
                id="showStats"
                checked={privacy.showStats}
                onCheckedChange={(checked) => handlePrivacyChange('showStats', checked)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}