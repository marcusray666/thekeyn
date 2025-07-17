import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
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
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Grid3X3,
  Layout,
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  Filter,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Verified
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PortfolioWork {
  id: number;
  title: string;
  description: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  certificateId: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: string;
  isLiked?: boolean;
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
  workCount?: number;
}

const showcaseVariants = {
  grid: "grid",
  masonry: "masonry", 
  carousel: "carousel",
  timeline: "timeline"
};

export default function ProfileShowcase() {
  const { username } = useParams<{ username: string }>();
  const [viewMode, setViewMode] = useState<keyof typeof showcaseVariants>("grid");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "liked">("recent");
  const [selectedWork, setSelectedWork] = useState<PortfolioWork | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout>();

  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch creator profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/social/profile", username],
    enabled: !!username
  });

  // Fetch creator's works
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/social/profile", username, "works", sortBy],
    enabled: !!username,
    queryFn: async () => {
      const response = await fetch(`/api/social/profile/${username}/works?sort=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch works');
      return response.json();
    }
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      return await apiRequest(`/api/social/users/${profile.id}/${action}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/profile"] });
      toast({
        title: "Success",
        description: "Follow status updated",
      });
    }
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ workId, action }: { workId: number; action: 'like' | 'unlike' }) => {
      return await apiRequest(`/api/social/works/${workId}/${action}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/profile"] });
    }
  });

  // Autoplay carousel
  useEffect(() => {
    if (autoplay && viewMode === "carousel" && works?.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % works.length);
      }, 4000);
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, viewMode, works?.length]);

  const handleLike = (work: PortfolioWork) => {
    likeMutation.mutate({
      workId: work.id,
      action: work.isLiked ? 'unlike' : 'like'
    });
  };

  const nextWork = () => {
    if (works && works.length > 0) {
      setCurrentIndex(prev => (prev + 1) % works.length);
    }
  };

  const prevWork = () => {
    if (works && works.length > 0) {
      setCurrentIndex(prev => (prev - 1 + works.length) % works.length);
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Eye className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Play className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (profileLoading || worksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <LiquidGlassLoader />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-white mb-4">Creator Not Found</h1>
          <p className="text-gray-400">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      {/* Hero Profile Section */}
      <div className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-center lg:items-start gap-8"
          >
            {/* Profile Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-40 w-40 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={profile.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl">
                  {profile.displayName?.charAt(0) || profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <h1 className="text-4xl font-bold text-white">
                  {profile.displayName || profile.username}
                </h1>
                {profile.isVerified && (
                  <Verified className="h-8 w-8 text-blue-400" />
                )}
              </div>

              <p className="text-xl text-gray-300 mb-2">@{profile.username}</p>

              {profile.bio && (
                <p className="text-gray-400 mb-6 max-w-2xl">{profile.bio}</p>
              )}

              {/* Profile Meta */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6 text-gray-300">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="hover:text-purple-400 transition-colors">
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{works?.length || 0}</div>
                  <div className="text-sm text-gray-400">Works</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.followerCount}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.followingCount}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.totalLikes}</div>
                  <div className="text-sm text-gray-400">Total Likes</div>
                </div>
              </div>

              {/* Actions */}
              {currentUser?.id !== profile.id && (
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <Button
                    onClick={() => followMutation.mutate(profile.isFollowing ? 'unfollow' : 'follow')}
                    disabled={followMutation.isPending}
                    className={profile.isFollowing 
                      ? "bg-gray-700 hover:bg-red-700 text-white"
                      : "btn-glass bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    }
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    {profile.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Message
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Portfolio Controls */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-full sm:w-auto">
            <TabsList className="glass-input grid w-full grid-cols-4 sm:w-auto">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="masonry" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Masonry
              </TabsTrigger>
              <TabsTrigger value="carousel" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Carousel
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="glass-input w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="liked">Most Liked</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "carousel" && (
              <Button
                onClick={() => setAutoplay(!autoplay)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
              >
                {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoplay ? 'Pause' : 'Play'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {viewMode === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {works?.map((work: PortfolioWork, index: number) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <GlassCard className="overflow-hidden group cursor-pointer h-full">
                    <div className="aspect-square bg-gray-800 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getFileTypeIcon(work.mimeType)}
                        <span className="ml-2 text-gray-400">{work.mimeType.split('/')[0]}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                          <Shield className="mr-1 h-3 w-3" />
                          Protected
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 truncate">{work.title}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{work.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(work)}
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${work.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                            {work.likeCount}
                          </button>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {work.viewCount}
                          </div>
                        </div>
                        <div className="text-xs">{formatDate(work.createdAt)}</div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === "carousel" && works && works.length > 0 && (
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-4">
                  <Button onClick={prevWork} variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-white">
                    {currentIndex + 1} of {works.length}
                  </div>
                  <Button onClick={nextWork} variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="max-w-4xl mx-auto"
                >
                  <GlassCard className="overflow-hidden">
                    <div className="aspect-video bg-gray-800 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getFileTypeIcon(works[currentIndex].mimeType)}
                        <span className="ml-2 text-gray-400 text-xl">
                          {works[currentIndex].mimeType.split('/')[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {works[currentIndex].title}
                          </h2>
                          <p className="text-gray-400 mb-4">{works[currentIndex].description}</p>
                        </div>
                        <Badge variant="outline" className="border-green-600 text-green-400">
                          <Shield className="mr-1 h-4 w-4" />
                          Protected
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleLike(works[currentIndex])}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Heart className={`h-5 w-5 ${works[currentIndex].isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                            {works[currentIndex].likeCount}
                          </button>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MessageCircle className="h-5 w-5" />
                            {works[currentIndex].commentCount}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="h-5 w-5" />
                            {works[currentIndex].viewCount}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => window.open(`/certificate/${works[currentIndex].certificateId}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="border-purple-600 text-purple-300"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Certificate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {viewMode === "masonry" && (
            <motion.div
              key="masonry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            >
              {works?.map((work: PortfolioWork, index: number) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="break-inside-avoid mb-6"
                >
                  <GlassCard className="overflow-hidden group cursor-pointer">
                    <div className={`bg-gray-800 relative overflow-hidden ${
                      index % 3 === 0 ? 'aspect-square' : 
                      index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getFileTypeIcon(work.mimeType)}
                        <span className="ml-2 text-gray-400">{work.mimeType.split('/')[0]}</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">{work.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{work.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <button
                          onClick={() => handleLike(work)}
                          className="flex items-center gap-1 hover:text-red-400 transition-colors"
                        >
                          <Heart className={`h-4 w-4 ${work.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                          {work.likeCount}
                        </button>
                        <div className="text-xs">{formatDate(work.createdAt)}</div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-blue-600 to-green-600"></div>
                
                {works?.map((work: PortfolioWork, index: number) => (
                  <motion.div
                    key={work.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative flex items-start gap-8 mb-12"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-gray-900"></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-2">{formatDate(work.createdAt)}</div>
                      <GlassCard className="overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="aspect-square bg-gray-800 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {getFileTypeIcon(work.mimeType)}
                              <span className="ml-2 text-gray-400">{work.mimeType.split('/')[0]}</span>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-3">{work.title}</h3>
                            <p className="text-gray-400 mb-4">{work.description}</p>
                            
                            <div className="flex items-center gap-6 mb-4">
                              <button
                                onClick={() => handleLike(work)}
                                className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Heart className={`h-4 w-4 ${work.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                                {work.likeCount}
                              </button>
                              <div className="flex items-center gap-2 text-gray-400">
                                <Eye className="h-4 w-4" />
                                {work.viewCount}
                              </div>
                            </div>

                            <Button
                              onClick={() => window.open(`/certificate/${work.certificateId}`, '_blank')}
                              variant="outline"
                              size="sm"
                              className="border-purple-600 text-purple-300"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Certificate
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(!works || works.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No works yet</h3>
            <p className="text-gray-400">
              {currentUser?.id === profile.id 
                ? "Start building your portfolio by uploading your first work!"
                : `${profile.displayName || profile.username} hasn't shared any works yet.`}
            </p>
            {currentUser?.id === profile.id && (
              <Button
                onClick={() => window.location.href = '/upload-work'}
                className="btn-glass bg-gradient-to-r from-purple-600 to-blue-600 text-white mt-4"
              >
                Upload Your First Work
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}