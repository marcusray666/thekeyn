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
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
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
            <div className="glass-morphism rounded-2xl p-2">
              <div className="grid grid-cols-4 gap-2">
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

            {/* Other tabs content simplified for now */}
            {activeTab === "notifications" && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
                  <p className="text-gray-400">Notification settings coming soon...</p>
                </div>
              </GlassCard>
            )}

            {activeTab === "privacy" && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>
                  <p className="text-gray-400">Privacy settings coming soon...</p>
                </div>
              </GlassCard>
            )}

            {activeTab === "security" && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Security Settings</h3>
                  <p className="text-gray-400">Security settings coming soon...</p>
                </div>
              </GlassCard>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}