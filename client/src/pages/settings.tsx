import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft,
  User,
  Bell,
  Lock,
  Palette,
  Save,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";

// Theme definitions
const themes = {
  'liquid-glass': {
    name: 'Liquid Glass',
    description: 'Dark theme with glass morphism effects',
    primary: '#8B5CF6',
    background: 'from-gray-900 via-gray-800 to-gray-900',
    card: 'rgba(17, 24, 39, 0.7)',
    preview: ['#1F2937', '#374151', '#8B5CF6', '#6366F1']
  },
  'ethereal-ivory': {
    name: 'Ethereal Ivory',
    description: 'Light and tranquil with sophisticated tones',
    primary: '#595F39',
    background: 'from-stone-100 via-stone-50 to-neutral-100',
    card: 'rgba(228, 228, 222, 0.8)',
    preview: ['#E4E4DE', '#C4C5BA', '#1B1B1B', '#595F39']
  },
  'sage-moss': {
    name: 'Sage & Moss',
    description: 'Earthy green tones with clean undertones',
    primary: '#283618',
    background: 'from-gray-100 via-stone-50 to-gray-50',
    card: 'rgba(183, 183, 164, 0.6)',
    preview: ['#283618', '#B7B7A4', '#D4D4D4', '#F0EFEB']
  },
  'pastel-rose': {
    name: 'Pastel Rose',
    description: 'Soft greys with gentle pink accents',
    primary: '#E91E63',
    background: 'from-rose-50 via-gray-50 to-pink-50',
    card: 'rgba(244, 244, 245, 0.8)',
    preview: ['#F8FAFC', '#E2E8F0', '#F1F5F9', '#FDF2F8']
  }
};

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedTheme, setSelectedTheme] = useState('liquid-glass');
  
  const [profileSettings, setProfileSettings] = useState({
    username: "",
    email: "",
    displayName: "",
    bio: "",
    website: "",
    location: "",
    profileImageUrl: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    certificateAlerts: true,
    theftReports: true,
    socialInteractions: true,
    marketingEmails: false,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: false,
    showStatistics: true,
    allowIndexing: false,
    showFollowers: true,
    showFollowing: true,
    allowDirectMessages: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "7d",
    loginNotifications: true,
    deviceTracking: true,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Load user settings
  const { data: userSettings } = useQuery({
    queryKey: ['/api/user/settings'],
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      setProfileSettings(prev => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        profileImageUrl: user.profileImageUrl || "",
      }));
      const userTheme = user.themePreference || localStorage.getItem('theme-preference') || 'liquid-glass';
      setSelectedTheme(userTheme);
      applyTheme(userTheme);
    }
  }, [user]);

  // Apply theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference') || 'liquid-glass';
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Synchronize with theme context
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      return await apiRequest('/api/user/password', {
        method: 'PATCH',
        body: JSON.stringify(passwordData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: string) => {
      return await apiRequest('/api/user/theme', {
        method: 'PATCH',
        body: JSON.stringify({ theme }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Theme updated",
        description: "Your theme preference has been saved.",
      });
      // Apply theme immediately
      applyTheme(selectedTheme);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return await apiRequest('/api/user/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Settings update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    const themeConfig = themes[theme as keyof typeof themes];
    
    if (themeConfig) {
      // Remove existing theme classes
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      
      // Apply new theme class
      document.body.classList.add(`theme-${theme}`);
      
      // Apply CSS custom properties for the selected theme
      root.style.setProperty('--theme-primary', themeConfig.primary);
      root.style.setProperty('--theme-background', themeConfig.background);
      root.style.setProperty('--theme-card', themeConfig.card);
      
      // Store theme preference in localStorage for immediate application
      localStorage.setItem('theme-preference', theme);
    }
  };

  const handleSaveProfile = () => {
    const updates = {
      username: profileSettings.username,
      email: profileSettings.email,
      displayName: profileSettings.displayName,
      bio: profileSettings.bio,
      website: profileSettings.website,
      location: profileSettings.location,
    };
    updateProfileMutation.mutate(updates);
  };

  const handleChangePassword = () => {
    if (profileSettings.newPassword !== profileSettings.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }
    
    if (profileSettings.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: profileSettings.currentPassword,
      newPassword: profileSettings.newPassword,
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme as any); // Apply theme immediately via context
    updateThemeMutation.mutate(newTheme); // Save to database
  };

  const handleSaveSettings = (settingsType: string, settings: any) => {
    updateSettingsMutation.mutate({
      type: settingsType,
      settings
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-8"
        >
          <Button 
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="glass-input grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <User className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      value={profileSettings.username}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                      className="glass-input"
                      placeholder="Enter username"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="glass-input"
                      placeholder="Enter email"
                    />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileSettings.displayName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, displayName: e.target.value }))}
                      className="glass-input"
                      placeholder="Enter display name"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input
                      id="location"
                      value={profileSettings.location}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, location: e.target.value }))}
                      className="glass-input"
                      placeholder="Enter location"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website" className="text-gray-300">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileSettings.website}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
                      className="glass-input"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileSettings.bio}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                      className="glass-input min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="btn-glass bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </GlassCard>

              {/* Password Change */}
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Lock className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Change Password</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={profileSettings.currentPassword}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="glass-input pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={profileSettings.newPassword}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="glass-input"
                      placeholder="Enter new password"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={profileSettings.confirmPassword}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="glass-input"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleChangePassword}
                    disabled={updatePasswordMutation.isPending || !profileSettings.currentPassword || !profileSettings.newPassword}
                    className="btn-glass bg-gradient-to-r from-red-600 to-pink-600 text-white"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {updatePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Palette className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Theme Selection</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(themes).map(([key, theme]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative cursor-pointer rounded-lg p-4 border-2 transition-all ${
                        selectedTheme === key
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleThemeChange(key)}
                    >
                      {selectedTheme === key && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-purple-500 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <h3 className="font-semibold text-white mb-1">{theme.name}</h3>
                        <p className="text-sm text-gray-400">{theme.description}</p>
                      </div>

                      {/* Theme Preview */}
                      <div className="flex gap-1 mb-3">
                        {theme.preview.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <Badge variant="outline" className={`text-xs ${
                        selectedTheme === key ? 'border-purple-400 text-purple-300' : 'border-gray-600'
                      }`}>
                        {selectedTheme === key ? 'Active' : 'Select'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-300 mb-1">Theme Preview</h4>
                      <p className="text-sm text-gray-400">
                        Changes will be applied immediately. You can switch between themes anytime in your settings.
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Bell className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                </div>

                <div className="space-y-6">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="space-y-1">
                        <Label className="text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-sm text-gray-400">
                          {key === 'emailNotifications' && 'Receive email updates for important events'}
                          {key === 'pushNotifications' && 'Get browser notifications when available'}
                          {key === 'certificateAlerts' && 'Alerts for certificate generation and updates'}
                          {key === 'theftReports' && 'Notifications about potential theft reports'}
                          {key === 'socialInteractions' && 'Likes, comments, and follows from other users'}
                          {key === 'marketingEmails' && 'Updates about new features and platform news'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => handleSaveSettings('notifications', notificationSettings)}
                    disabled={updateSettingsMutation.isPending}
                    className="btn-glass bg-gradient-to-r from-green-600 to-teal-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Notifications'}
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Privacy & Visibility</h2>
                </div>

                <div className="space-y-6">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="space-y-1">
                        <Label className="text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-sm text-gray-400">
                          {key === 'publicProfile' && 'Make your profile visible to search engines'}
                          {key === 'showStatistics' && 'Display follower counts and work statistics'}
                          {key === 'allowIndexing' && 'Allow search engines to index your works'}
                          {key === 'showFollowers' && 'Display your follower list publicly'}
                          {key === 'showFollowing' && 'Display who you follow publicly'}
                          {key === 'allowDirectMessages' && 'Allow other users to send you messages'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => handleSaveSettings('privacy', privacySettings)}
                    disabled={updateSettingsMutation.isPending}
                    className="btn-glass bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Privacy'}
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Lock className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Security & Authentication</h2>
                </div>

                <div className="space-y-6">
                  {Object.entries(securitySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="space-y-1">
                        <Label className="text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-sm text-gray-400">
                          {key === 'twoFactorAuth' && 'Require two-factor authentication for login'}
                          {key === 'sessionTimeout' && 'Automatically log out after period of inactivity'}
                          {key === 'loginNotifications' && 'Get notified of new login attempts'}
                          {key === 'deviceTracking' && 'Track and manage devices that access your account'}
                        </p>
                      </div>
                      {key === 'sessionTimeout' ? (
                        <Select value="7d" onValueChange={() => {}}>
                          <SelectTrigger className="glass-input w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="24h">24 Hours</SelectItem>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Switch
                          checked={typeof value === 'boolean' ? value : false}
                          onCheckedChange={(checked) => 
                            setSecuritySettings(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => handleSaveSettings('security', securitySettings)}
                    disabled={updateSettingsMutation.isPending}
                    className="btn-glass bg-gradient-to-r from-red-600 to-orange-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Security'}
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}