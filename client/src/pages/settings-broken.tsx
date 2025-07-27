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


// Theme functionality completely removed - using single liquid glass theme only

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
      // Theme removed - using single liquid glass theme only
    }
  }, [user]);

  // Theme functionality removed - using single liquid glass theme only

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

  // Theme mutation removed - using single liquid glass theme only

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

  // Theme functionality removed - using single liquid glass theme only

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

  // Theme handling removed - using single liquid glass theme only

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
            <TabsList className="glass-input grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
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

            {/* Appearance tab removed - only liquid glass theme */}

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