import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Calendar, MapPin, Globe, Settings, Save, X, Camera, Upload, Eye, Heart, MessageCircle, Share2, ExternalLink, MoreHorizontal, UserPlus, Shield, Users, TrendingUp, Verified, BarChart3, Sparkles, ChevronLeft, Download, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'carousel' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showProfileActions, setShowProfileActions] = useState(false);

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

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['/api/profile', profileUsername] });
      setIsUploadingAvatar(false);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "Failed to update your avatar. Please try again.",
        variant: "destructive",
      });
      setIsUploadingAvatar(false);
    },
  });

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploadingAvatar(true);
      uploadAvatarMutation.mutate(file);
    }
  };

  // Portfolio helper functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  const renderWork = (work: any) => (
    <motion.div
      key={work.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="group relative bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
    >
      <div className="aspect-square relative overflow-hidden">
        {work.filename && work.mimeType.startsWith('image/') ? (
          <img
            src={`/api/files/${work.filename}`}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <div className="text-center">
              <div className="text-4xl mb-2">{getFileIcon(work.mimeType)}</div>
              <div className="text-sm text-gray-400 capitalize">{work.mimeType.split('/')[0]}</div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Certificate Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Shield className="h-3 w-3 mr-1" />
            Protected
          </Badge>
        </div>
      </div>

      {/* Work Info */}
      <div className="p-4">
        <h3 className="text-white font-medium truncate">{work.title}</h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{work.description}</p>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>{new Date(work.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(work.viewCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(work.likeCount || 0)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-500/30 via-purple-500/20 to-transparent blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism p-8">
              <div className="flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative group">
                  <div 
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ring-purple-500/20 cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-purple-500/40"
                    onClick={handleAvatarClick}
                  >
                    {profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={profile.displayName || profile.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile.username.charAt(0).toUpperCase()
                    )}
                    
                    {/* Upload Overlay */}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isUploadingAvatar ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Camera className="h-5 w-5 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  
                  {/* Upload hint for own profile */}
                  {isOwnProfile && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                        Click to change avatar
                      </div>
                    </div>
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

            {/* Portfolio Section */}
            <Card className="glass-morphism p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Portfolio</h2>
                  {works.length > 0 && (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                      {works.length} {works.length === 1 ? 'work' : 'works'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-auto">
                    <TabsList className="glass-input h-9">
                      <TabsTrigger value="grid" className="data-[state=active]:bg-purple-500/20">Grid</TabsTrigger>
                      <TabsTrigger value="masonry" className="data-[state=active]:bg-purple-500/20">Masonry</TabsTrigger>
                      <TabsTrigger value="carousel" className="data-[state=active]:bg-purple-500/20">Carousel</TabsTrigger>
                      <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-500/20">Timeline</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input text-sm px-3 py-2 rounded-md h-9 bg-gray-800/50 border-gray-700 text-white"
                  >
                    <option value="recent">Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="liked">Most Liked</option>
                    <option value="viewed">Most Viewed</option>
                  </select>
                </div>
              </div>

              {/* Portfolio Content */}
              <AnimatePresence mode="wait">
                {works.length > 0 ? (
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {works.map(renderWork)}
                      </div>
                    )}
                    
                    {viewMode === 'masonry' && (
                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {works.map((work: any, index: number) => (
                          <div key={work.id} className="break-inside-avoid mb-6">
                            {renderWork(work)}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {viewMode === 'carousel' && (
                      <div className="relative">
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                          {works.map((work: any) => (
                            <div key={work.id} className="flex-none w-80">
                              {renderWork(work)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {viewMode === 'timeline' && (
                      <div className="space-y-8">
                        {works.map((work: any, index: number) => (
                          <div key={work.id} className="flex gap-6 items-start">
                            <div className="flex-none w-24 text-center">
                              <div className="text-sm text-gray-400">
                                {new Date(work.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="w-px h-16 bg-gradient-to-b from-purple-500 to-blue-500 mx-auto mt-2"></div>
                            </div>
                            <div className="flex-1">
                              {renderWork(work)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-muted-foreground mb-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">
                      {isOwnProfile ? "Build Your Creative Portfolio" : "No Works Yet"}
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      {isOwnProfile 
                        ? "Start showcasing your creative works and building your digital presence. Upload your first piece to get started!"
                        : "This creator hasn't shared any works yet. Check back later for amazing content!"
                      }
                    </p>
                    {isOwnProfile && (
                      <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Your First Work
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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