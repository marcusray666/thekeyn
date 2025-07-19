import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft,
  User,
  Bell,
  Lock,
  Save,
  Eye,
  EyeOff,
  Shield,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();
  
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
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    workViews: false,
    weeklyDigest: true,
    newFeatures: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showStatistics: true,
    allowIndexing: false,
    showFollowers: true,
    showFollowing: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
    showLastSeen: false,
    allowTagging: true,
    allowMentions: true,
    requireApprovalForTags: false,
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
    }
  }, [user]);

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

  const handleSaveSettings = (settingsType: string, settings: any) => {
    updateSettingsMutation.mutate({
      type: settingsType,
      settings
    });
  };

  return (
    <div className="min-h-screen cosmic-bg pt-20 px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black/40 to-blue-900/20"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-600/10 via-transparent to-purple-600/10 blur-3xl"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-8"
        >
          <Button 
            variant="ghost"
            onClick={() => setLocation(`/profile/${user?.username}`)}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Profile
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
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              <div className="grid grid-cols-5 gap-2">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-2 justify-center py-3 rounded-xl transition-all ${
                    activeTab === "profile" 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-2 justify-center py-3 rounded-xl transition-all ${
                    activeTab === "notifications" 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant={activeTab === "privacy" ? "default" : "ghost"}
                  onClick={() => setActiveTab("privacy")}
                  className={`flex items-center gap-2 justify-center py-3 rounded-xl transition-all ${
                    activeTab === "privacy" 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Privacy
                </Button>
                <Button
                  variant={activeTab === "security" ? "default" : "ghost"}
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-2 justify-center py-3 rounded-xl transition-all ${
                    activeTab === "security" 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Security
                </Button>
                <Button
                  variant={activeTab === "appearance" ? "default" : "ghost"}
                  onClick={() => setActiveTab("appearance")}
                  className={`flex items-center gap-2 justify-center py-3 rounded-xl transition-all ${
                    activeTab === "appearance" 
                      ? "bg-purple-600 text-white shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Appearance
                </Button>
              </div>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <GlassCard>
                <div className="p-6 space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <Input
                        id="username"
                        value={profileSettings.username}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                        className="glass-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileSettings.bio}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                      className="glass-input"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} className="btn-glass">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <GlassCard>
                <div className="p-6 space-y-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                  
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Likes on your posts</Label>
                          <p className="text-sm text-gray-500">Get notified when someone likes your work</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.likes}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, likes: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Comments</Label>
                          <p className="text-sm text-gray-500">Get notified when someone comments on your work</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.comments}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, comments: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">New followers</Label>
                          <p className="text-sm text-gray-500">Get notified when someone follows you</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.follows}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, follows: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Mentions</Label>
                          <p className="text-sm text-gray-500">Get notified when someone mentions you</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.mentions}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, mentions: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">System & Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Certificate alerts</Label>
                          <p className="text-sm text-gray-500">Security alerts for your protected works</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.certificateAlerts}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, certificateAlerts: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Weekly digest</Label>
                          <p className="text-sm text-gray-500">Weekly summary of your activity</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.weeklyDigest}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings('notifications', notificationSettings)} className="btn-glass">
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <GlassCard>
                <div className="p-6 space-y-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Privacy & Visibility</h3>
                  
                  {/* Profile Visibility */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Profile Visibility</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Public Profile</Label>
                          <p className="text-sm text-gray-500">Make your profile visible to everyone</p>
                        </div>
                        <Switch 
                          checked={privacySettings.publicProfile}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, publicProfile: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Show statistics</Label>
                          <p className="text-sm text-gray-500">Display follower count, likes, etc.</p>
                        </div>
                        <Switch 
                          checked={privacySettings.showStatistics}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showStatistics: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Show followers</Label>
                          <p className="text-sm text-gray-500">Let others see who follows you</p>
                        </div>
                        <Switch 
                          checked={privacySettings.showFollowers}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showFollowers: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Show following</Label>
                          <p className="text-sm text-gray-500">Let others see who you follow</p>
                        </div>
                        <Switch 
                          checked={privacySettings.showFollowing}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showFollowing: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interaction Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Interactions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Allow direct messages</Label>
                          <p className="text-sm text-gray-500">Let others send you private messages</p>
                        </div>
                        <Switch 
                          checked={privacySettings.allowDirectMessages}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDirectMessages: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Allow tagging</Label>
                          <p className="text-sm text-gray-500">Let others tag you in posts</p>
                        </div>
                        <Switch 
                          checked={privacySettings.allowTagging}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowTagging: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Show online status</Label>
                          <p className="text-sm text-gray-500">Let others see when you're online</p>
                        </div>
                        <Switch 
                          checked={privacySettings.showOnlineStatus}
                          onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings('privacy', privacySettings)} className="btn-glass">
                      <Save className="mr-2 h-4 w-4" />
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <GlassCard>
                <div className="p-6 space-y-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Security & Password</h3>
                  
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Change Password</h4>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={profileSettings.currentPassword}
                            onChange={(e) => setProfileSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="glass-input pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={profileSettings.newPassword}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="glass-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={profileSettings.confirmPassword}
                          onChange={(e) => setProfileSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="glass-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Security Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Two-factor authentication</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Switch 
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-gray-300">Login notifications</Label>
                          <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                        </div>
                        <Switch 
                          checked={securitySettings.loginNotifications}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleChangePassword} className="btn-glass">
                      <Save className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button onClick={() => handleSaveSettings('security', securitySettings)} variant="outline" className="glass-input">
                      Save Security Settings
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <GlassCard>
                <div className="p-6 space-y-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Appearance</h3>
                  
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Theme</h4>
                    <p className="text-gray-400 text-sm">Choose how Loggin' looks to you. Select a single theme, or sync with your system and automatically switch between day and night themes.</p>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                      {/* Light Theme Option */}
                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          theme === "light" 
                            ? "border-purple-500 bg-purple-500/10" 
                            : "border-white/20 hover:border-white/40"
                        }`}
                        onClick={() => setTheme("light")}
                      >
                        <div className="w-full h-16 rounded-lg bg-gradient-to-br from-gray-50 to-gray-200 mb-3 border border-gray-300 relative overflow-hidden">
                          {/* Light theme preview */}
                          <div className="absolute top-2 left-2 w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="absolute top-2 right-2 w-8 h-1 bg-gray-400 rounded"></div>
                          <div className="absolute bottom-2 left-2 w-12 h-1 bg-gray-600 rounded"></div>
                          <div className="absolute bottom-2 right-2 w-6 h-1 bg-gray-400 rounded"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium text-sm">Light</p>
                          <p className="text-gray-400 text-xs">Clean and bright</p>
                        </div>
                      </div>

                      {/* Dark Theme Option */}
                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          theme === "dark" 
                            ? "border-purple-500 bg-purple-500/10" 
                            : "border-white/20 hover:border-white/40"
                        }`}
                        onClick={() => setTheme("dark")}
                      >
                        <div className="w-full h-16 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 mb-3 border border-gray-700 relative overflow-hidden">
                          {/* Dark theme preview */}
                          <div className="absolute top-2 left-2 w-3 h-3 bg-purple-400 rounded-full"></div>
                          <div className="absolute top-2 right-2 w-8 h-1 bg-gray-300 rounded"></div>
                          <div className="absolute bottom-2 left-2 w-12 h-1 bg-gray-200 rounded"></div>
                          <div className="absolute bottom-2 right-2 w-6 h-1 bg-gray-400 rounded"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium text-sm">Dark</p>
                          <p className="text-gray-400 text-xs">Easy on the eyes</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <p className="text-blue-300 text-sm">
                          Your theme preference is saved locally and will be remembered across sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}