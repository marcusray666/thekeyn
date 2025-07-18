import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  MoreHorizontal,
  UserPlus,
  Shield,
  Calendar,
  MapPin,
  Globe,
  ChevronLeft,
  Eye,
  Users,
  TrendingUp,
  Verified,
  Settings,
  User,
  Upload,
  Download,
  AlertTriangle,
  BarChart3,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { AnimatedShowcase } from "@/components/portfolio/animated-showcase";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PortfolioWork {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  createdAt: string;
  likes: number;
  views: number;
  tags: string[];
  certificateId: string;
  featured?: boolean;
}

interface CreatorProfile {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  profileImageUrl?: string;
  website?: string;
  location?: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  createdAt: string;
  isFollowing?: boolean;
}

export default function ProfileShowcase() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'carousel' | 'timeline'>('grid');
  const [autoplay, setAutoplay] = useState(false);
  const [activeTab, setActiveTab] = useState('works');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // If no username from URL, use current user's username (for authenticated home)
  const profileUsername = username || user?.username;
  const isOwnProfile = profileUsername === user?.username;

  // Debug: log the state
  console.log('ProfileShowcase - username param:', username, 'user:', user, 'profileUsername:', profileUsername, 'isAuthenticated:', isAuthenticated);

  // Don't render if we don't have a profile username
  if (!profileUsername) {
    console.log('ProfileShowcase - No profile username, showing loader');
    return <LiquidGlassLoader text="Loading your profile..." />;
  }

  // Mock data for demonstration - replace with actual API calls
  const profile: CreatorProfile = {
    id: 1,
    username: profileUsername || 'mark123',
    displayName: 'Mark Thompson',
    bio: 'Digital artist & blockchain enthusiast. Protecting creativity through technology. Creating the future of digital art ownership.',
    profileImageUrl: undefined,
    website: 'https://markthompson.art',
    location: 'San Francisco, CA',
    isVerified: true,
    followerCount: 12500,
    followingCount: 340,
    totalLikes: 45200,
    createdAt: '2023-01-15',
    isFollowing: false
  };

  const works: PortfolioWork[] = [
    {
      id: '1',
      title: 'Cosmic Dreams',
      description: 'A vibrant digital painting exploring the mysteries of space and time.',
      fileType: 'image',
      createdAt: '2025-07-10',
      likes: 234,
      views: 1520,
      tags: ['digital-art', 'space', 'surreal', 'cosmic'],
      certificateId: 'CERT-1752800000-ABC123',
      featured: true
    },
    {
      id: '2',
      title: 'Urban Symphony',
      description: 'An experimental audio piece capturing the rhythm of city life.',
      fileType: 'audio',
      createdAt: '2025-07-08',
      likes: 89,
      views: 456,
      tags: ['audio', 'experimental', 'urban', 'ambient'],
      certificateId: 'CERT-1752800001-DEF456'
    },
    {
      id: '3',
      title: 'Digital Renaissance',
      description: 'A modern take on classical art techniques using AI-assisted tools.',
      fileType: 'image',
      createdAt: '2025-07-05',
      likes: 567,
      views: 2340,
      tags: ['ai-art', 'renaissance', 'classical', 'modern'],
      certificateId: 'CERT-1752800002-GHI789',
      featured: true
    },
    {
      id: '4',
      title: 'Motion Studies',
      description: 'Experimental video exploring the beauty of movement and flow.',
      fileType: 'video',
      createdAt: '2025-07-02',
      likes: 123,
      views: 890,
      tags: ['video', 'motion', 'experimental', 'abstract'],
      certificateId: 'CERT-1752800003-JKL012'
    },
    {
      id: '5',
      title: 'Code Poetry',
      description: 'A collection of generative art pieces created through algorithmic poetry.',
      fileType: 'document',
      createdAt: '2025-06-28',
      likes: 78,
      views: 234,
      tags: ['generative', 'code', 'poetry', 'algorithm'],
      certificateId: 'CERT-1752800004-MNO345'
    }
  ];

  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, action };
    },
    onSuccess: (data) => {
      toast({
        title: data.action === 'follow' ? 'Following' : 'Unfollowed',
        description: `You are now ${data.action === 'follow' ? 'following' : 'no longer following'} ${profile.displayName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile', username] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFollow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to follow creators",
        variant: "destructive",
      });
      return;
    }
    followMutation.mutate(profile.isFollowing ? 'unfollow' : 'follow');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="mb-8 overflow-hidden">
            {/* Cover gradient */}
            <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            <div className="px-6 pb-6">
              {/* Profile info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 relative z-10">
                <Avatar className="w-32 h-32 border-4 border-white/20 mb-4 sm:mb-0">
                  <AvatarImage src={profile.profileImageUrl} alt={profile.displayName} />
                  <AvatarFallback className="bg-purple-600 text-white text-3xl font-bold">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="sm:ml-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                        {profile.isVerified && (
                          <Verified className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xl text-gray-300 mb-1">@{profile.username}</p>
                      {profile.location && (
                        <div className="flex items-center text-gray-400 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-3 mt-4 sm:mt-0">
                      {isOwnProfile ? (
                        <Button
                          onClick={() => setLocation('/settings')}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-white/10"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleFollow}
                            disabled={followMutation.isPending}
                            className={profile.isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'btn-glass'}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {followMutation.isPending 
                              ? 'Loading...' 
                              : profile.isFollowing 
                                ? 'Following' 
                                : 'Follow'
                            }
                          </Button>
                          <Button variant="outline" className="border-gray-600">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </>
                      )}
                      
                      <Button variant="outline" size="sm" className="border-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div className="mt-6">
                <p className="text-gray-300 text-lg leading-relaxed mb-4">{profile.bio}</p>
                
                {profile.website && (
                  <div className="flex items-center text-purple-400 hover:text-purple-300 mb-4">
                    <Globe className="h-4 w-4 mr-2" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {profile.website}
                    </a>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                )}
                
                <div className="flex items-center text-gray-400 mb-6">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(profile.followerCount)}</div>
                  <div className="text-gray-400 text-sm">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(profile.followingCount)}</div>
                  <div className="text-gray-400 text-sm">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(works.length)}</div>
                  <div className="text-gray-400 text-sm">Works</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatNumber(profile.totalLikes)}</div>
                  <div className="text-gray-400 text-sm">Total Likes</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
        
        {/* Portfolio Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-800/50 backdrop-blur-md border border-gray-700">
              <TabsTrigger value="works" className="text-gray-300 data-[state=active]:text-white">
                Works
              </TabsTrigger>
              <TabsTrigger value="collections" className="text-gray-300 data-[state=active]:text-white">
                Collections
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-gray-300 data-[state=active]:text-white">
                Activity
              </TabsTrigger>
              <TabsTrigger value="about" className="text-gray-300 data-[state=active]:text-white">
                About
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="works" className="space-y-6">
              <AnimatedShowcase
                works={works}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                autoplay={autoplay}
                interactive={true}
              />
            </TabsContent>
            
            <TabsContent value="collections" className="space-y-6">
              <GlassCard>
                <div className="p-8 text-center">
                  <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Collections</h3>
                  <p className="text-gray-400">Curated collections of works will appear here</p>
                </div>
              </GlassCard>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <GlassCard>
                <div className="p-8 text-center">
                  <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Activity Feed</h3>
                  <p className="text-gray-400">Recent activity and interactions will appear here</p>
                </div>
              </GlassCard>
            </TabsContent>
            
            <TabsContent value="about" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Creator Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Views</span>
                        <span className="text-white font-semibold">
                          {formatNumber(works.reduce((sum, work) => sum + work.views, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Likes</span>
                        <span className="text-white font-semibold">
                          {formatNumber(works.reduce((sum, work) => sum + work.likes, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Featured Works</span>
                        <span className="text-white font-semibold">
                          {works.filter(work => work.featured).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Age</span>
                        <span className="text-white font-semibold">
                          {Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
                
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Verified className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Verified Creator</p>
                          <p className="text-gray-400 text-sm">Account verified for authenticity</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Community Builder</p>
                          <p className="text-gray-400 text-sm">10K+ followers milestone</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Work Protector</p>
                          <p className="text-gray-400 text-sm">Protected 5+ works with certificates</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Actions Floating Button - Only for own profile */}
        {isOwnProfile && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="relative">
              {/* Quick Actions Menu */}
              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="absolute bottom-16 right-0 w-64"
                  >
                    <GlassCard className="p-4">
                      <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button
                          onClick={() => setLocation('/upload-work')}
                          className="w-full btn-glass justify-start"
                        >
                          <Upload className="mr-3 h-4 w-4" />
                          Upload New Work
                        </Button>

                        <Button
                          onClick={() => setLocation('/my-certificates')}
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5 justify-start"
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          Manage Certificates
                        </Button>

                        <Button
                          onClick={() => setLocation('/nft-studio')}
                          variant="outline"
                          className="w-full border-purple-600 text-purple-300 hover:bg-purple-900 hover:bg-opacity-20 justify-start"
                        >
                          <Sparkles className="mr-3 h-4 w-4" />
                          Mint NFTs
                        </Button>

                        <Button
                          onClick={() => setLocation('/analytics')}
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5 justify-start"
                        >
                          <BarChart3 className="mr-3 h-4 w-4" />
                          View Analytics
                        </Button>

                        <Button
                          onClick={() => setLocation('/report-theft')}
                          variant="outline"
                          className="w-full border-red-600 text-red-300 hover:bg-red-900 hover:bg-opacity-20 justify-start"
                        >
                          <AlertTriangle className="mr-3 h-4 w-4" />
                          Report Theft
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Action Button */}
              <Button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="w-14 h-14 rounded-full btn-glass shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}