import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, User, Bell, Lock, Save, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SimpleBackgroundEngine } from "@/components/SimpleBackgroundEngine";

export default function PremiumSettings() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [profileSettings, setProfileSettings] = useState({
    username: user?.username || "",
    email: user?.email || "",
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    website: "",
    location: "",
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    const { currentPassword, newPassword, confirmPassword, ...profileData } = profileSettings;
    
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      ...profileData,
      ...(newPassword && { currentPassword, newPassword })
    };

    updateProfileMutation.mutate(updateData);
  };

  return (
    <SimpleBackgroundEngine className="min-h-screen pt-20 pb-32 px-4 relative overflow-hidden light-theme">
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation('/profile')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          
          <div className="w-20" />
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-3xl overflow-hidden shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200/50 px-0">
              <div className="grid w-full grid-cols-4 bg-transparent py-0">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center justify-center space-x-2 px-4 py-4 border-b-2 transition-all ${
                    activeTab === 'profile' 
                      ? 'border-[#FE3F5E] text-[#FE3F5E] bg-[#FE3F5E]/5' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-200/30'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center justify-center space-x-2 px-4 py-4 border-b-2 transition-all ${
                    activeTab === 'notifications' 
                      ? 'border-[#FE3F5E] text-[#FE3F5E] bg-[#FE3F5E]/5' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-200/30'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  <span className="font-medium">Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`flex items-center justify-center space-x-2 px-4 py-4 border-b-2 transition-all ${
                    activeTab === 'privacy' 
                      ? 'border-[#FE3F5E] text-[#FE3F5E] bg-[#FE3F5E]/5' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-200/30'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Privacy</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center justify-center space-x-2 px-4 py-4 border-b-2 transition-all ${
                    activeTab === 'security' 
                      ? 'border-[#FE3F5E] text-[#FE3F5E] bg-[#FE3F5E]/5' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-200/30'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Security</span>
                </button>
              </div>
            </div>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                    <Input
                      id="username"
                      value={profileSettings.username}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                      className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName" className="text-gray-700 font-medium">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileSettings.displayName}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, displayName: e.target.value }))}
                      className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-gray-700 font-medium">Website</Label>
                    <Input
                      id="website"
                      value={profileSettings.website}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
                      className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileSettings.bio}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Password Change */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-700 font-medium">Current Password</Label>
                    <div className="relative mt-2">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={profileSettings.currentPassword}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={profileSettings.newPassword}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={profileSettings.confirmPassword}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-2 bg-white/50 border-gray-200/50 text-gray-800 placeholder-gray-500 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={updateProfileMutation.isPending}
                className="accent-button"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="p-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Email Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-gray-700 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="p-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Privacy Settings</h3>
                <div className="space-y-4">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-gray-700 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="p-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Security & Access</h3>
                <div className="space-y-6">
                  <div className="bg-white/30 rounded-2xl p-6 border border-gray-200/30">
                    <h4 className="text-gray-800 font-medium mb-2">Two-Factor Authentication</h4>
                    <p className="text-gray-600 text-sm mb-4">Add an extra layer of security to your account</p>
                    <Button className="glass-button">
                      Enable 2FA
                    </Button>
                  </div>
                  
                  <div className="bg-white/30 rounded-2xl p-6 border border-gray-200/30">
                    <h4 className="text-gray-800 font-medium mb-2">Active Sessions</h4>
                    <p className="text-gray-600 text-sm mb-4">Manage devices that are signed into your account</p>
                    <Button className="glass-button">
                      View Sessions
                    </Button>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h4 className="text-white font-medium mb-2">Download Your Data</h4>
                    <p className="text-white/70 text-sm mb-4">Get a copy of your protected works and account data</p>
                    <Button className="glass-button">
                      Request Export
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SimpleBackgroundEngine>
  );
}