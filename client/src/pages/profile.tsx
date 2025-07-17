import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Calendar, MapPin, Globe, Settings, Save, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SettingsPanel } from "@/components/settings-panel";

interface ProfileData {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  createdAt: string;
}

export default function Profile() {
  const [, params] = useRoute("/profile/:username");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: "",
    bio: "",
    website: "",
    location: "",
  });

  const profileUsername = params?.username || currentUser?.username;
  const isOwnProfile = currentUser?.username === profileUsername;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile', profileUsername],
    enabled: !!profileUsername,
  });

  const { data: works = [] } = useQuery({
    queryKey: ['/api/profile', profileUsername, 'works'],
    enabled: !!profileUsername,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ProfileData>) => {
      console.log('Sending profile update:', updates);
      const response = await apiRequest('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      console.log('Profile update response:', response);
      return response;
    },
    onSuccess: (updatedUser) => {
      console.log('Profile update successful:', updatedUser);
      
      // Update local state immediately
      setEditedProfile(prev => ({
        ...prev,
        displayName: updatedUser.displayName || prev.displayName,
        bio: updatedUser.bio || prev.bio,
        website: updatedUser.website || prev.website,
        location: updatedUser.location || prev.location,
      }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Force refresh of profile data
      queryClient.invalidateQueries({ queryKey: ['/api/profile', profileUsername] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.refetchQueries({ queryKey: ['/api/profile', profileUsername] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      
      setIsEditingProfile(false);
      setIsEditingDisplayName(false);
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        website: profile.website || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handleSaveDisplayName = () => {
    updateProfileMutation.mutate({ displayName: editedProfile.displayName });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Profile not found</h1>
          <p className="text-gray-400 mt-2">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism p-8">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    {profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={profile.displayName || profile.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 glass-input"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  {/* Display Name Section */}
                  <div className="flex items-center gap-2 mb-2">
                    {isEditingDisplayName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedProfile.displayName}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                          className="glass-input text-2xl font-bold h-auto py-1"
                          placeholder="Display name"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveDisplayName}
                          disabled={updateProfileMutation.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingDisplayName(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-white">
                          {profile.displayName || profile.username}
                        </h1>
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingDisplayName(true)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        {profile.isVerified && (
                          <Badge variant="default" className="ml-2">Verified</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 mb-4">@{profile.username}</p>

                  {/* Bio Section */}
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="glass-input"
                        rows={3}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={editedProfile.website}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="Website"
                          className="glass-input"
                        />
                        <Input
                          value={editedProfile.location}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Location"
                          className="glass-input"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {profile.bio && (
                        <p className="text-white mb-4">{profile.bio}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        {profile.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                              {profile.website}
                            </a>
                          </div>
                        )}
                        {profile.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {isOwnProfile && (
                        <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-6 mt-6 pt-6 border-t border-border">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{works.length}</div>
                      <div className="text-sm text-gray-400">Works</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.followerCount}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.followingCount}</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">{profile.totalLikes}</div>
                      <div className="text-sm text-gray-400">Total Likes</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Portfolio View Options */}
            <Card className="glass-morphism p-6 mt-6">
              <Tabs defaultValue="grid" className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="glass-input">
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="masonry">Masonry</TabsTrigger>
                    <TabsTrigger value="carousel">Carousel</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                  
                  <select className="glass-input text-sm px-3 py-2 rounded-md">
                    <option value="recent">Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="liked">Most Liked</option>
                  </select>
                </div>

                <TabsContent value="grid">
                  {works.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {works.map((work: any) => (
                        <div key={work.id} className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                          <span className="text-sm">{work.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {isOwnProfile ? "Start building your portfolio" : "No works yet"}
                      </h3>
                      <p className="text-gray-400">
                        {isOwnProfile 
                          ? "Start building your portfolio by uploading your first work!"
                          : "This user hasn't uploaded any works yet."
                        }
                      </p>
                      {isOwnProfile && (
                        <Button className="mt-4">
                          Upload Your First Work
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="masonry">
                  <div className="text-center py-8 text-gray-400">
                    Masonry view coming soon
                  </div>
                </TabsContent>

                <TabsContent value="carousel">
                  <div className="text-center py-8 text-gray-400">
                    Carousel view coming soon
                  </div>
                </TabsContent>

                <TabsContent value="timeline">
                  <div className="text-center py-8 text-gray-400">
                    Timeline view coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Settings Panel - Only show for own profile */}
          {isOwnProfile && (
            <div className="lg:col-span-1">
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}