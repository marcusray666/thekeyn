import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft,
  User,
  Bell,
  Lock,
  Palette,
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile settings
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    certificateAlerts: true,
    theftReports: true,
    
    // Privacy settings
    publicProfile: false,
    showStatistics: true,
    allowIndexing: false,
    
    // Display settings
    theme: "dark",
    language: "en",
    timezone: "UTC",
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: "7d",
    downloadHistory: true,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      return await apiRequest('/api/user/settings', {
        method: 'PATCH',
        body: JSON.stringify(updatedSettings),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
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

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/user/delete', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      setLocation('/');
    },
  });

  const handleSave = () => {
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate(settings);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      deleteAccountMutation.mutate();
    }
  };

  const exportData = () => {
    const userData = {
      username: user?.username,
      email: user?.email,
      settings: settings,
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `prooff-user-data-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    toast({
      title: "Data exported",
      description: "Your user data has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
              <p className="text-gray-400">Manage your account preferences and security</p>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="btn-glass px-6 py-3 rounded-2xl font-semibold text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Profile</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={settings.username || user?.username}
                    onChange={(e) => setSettings({...settings, username: e.target.value})}
                    className="glass-morphism border-gray-600 text-white"
                    placeholder={user?.username}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || user?.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="glass-morphism border-gray-600 text-white"
                    placeholder={user?.email}
                  />
                </div>
                
                <div>
                  <Label htmlFor="current-password" className="text-white">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={settings.currentPassword}
                      onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                      className="glass-morphism border-gray-600 text-white pr-10"
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-password" className="text-white">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                    className="glass-morphism border-gray-600 text-white"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
                    className="glass-morphism border-gray-600 text-white"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notification Settings */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="h-6 w-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-400">Browser notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Certificate Alerts</p>
                    <p className="text-sm text-gray-400">New certificates and updates</p>
                  </div>
                  <Switch
                    checked={settings.certificateAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, certificateAlerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Theft Reports</p>
                    <p className="text-sm text-gray-400">Suspicious activity alerts</p>
                  </div>
                  <Switch
                    checked={settings.theftReports}
                    onCheckedChange={(checked) => setSettings({...settings, theftReports: checked})}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-semibold text-white">Privacy</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Public Profile</p>
                    <p className="text-sm text-gray-400">Make your profile visible to others</p>
                  </div>
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => setSettings({...settings, publicProfile: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Show Statistics</p>
                    <p className="text-sm text-gray-400">Display work counts publicly</p>
                  </div>
                  <Switch
                    checked={settings.showStatistics}
                    onCheckedChange={(checked) => setSettings({...settings, showStatistics: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Search Engine Indexing</p>
                    <p className="text-sm text-gray-400">Allow search engines to find your work</p>
                  </div>
                  <Switch
                    checked={settings.allowIndexing}
                    onCheckedChange={(checked) => setSettings({...settings, allowIndexing: checked})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="session-timeout" className="text-white">Session Timeout</Label>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => setSettings({...settings, sessionTimeout: value})}>
                    <SelectTrigger className="glass-morphism border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Display Settings */}
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="h-6 w-6 text-orange-400" />
                <h3 className="text-xl font-semibold text-white">Display</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme" className="text-white">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                    <SelectTrigger className="glass-morphism border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language" className="text-white">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                    <SelectTrigger className="glass-morphism border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone" className="text-white">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                    <SelectTrigger className="glass-morphism border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Data Export & Account Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Download className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Data Export</h3>
              </div>
              
              <p className="text-gray-400 mb-4">
                Download a copy of all your data including works, certificates, and settings.
              </p>
              
              <Button
                onClick={exportData}
                className="w-full btn-glass py-3 rounded-2xl font-semibold text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Trash2 className="h-6 w-6 text-red-400" />
                <h3 className="text-xl font-semibold text-white">Danger Zone</h3>
              </div>
              
              <p className="text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                variant="outline"
                className="w-full border-red-600 text-red-400 hover:bg-red-900 hover:bg-opacity-20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}