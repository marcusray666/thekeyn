import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  UserPlus,
  Shield,
  Eye,
  Calendar,
  Tag,
  Verified,
  Search,
  Filter,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Play,
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkPost {
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
  isPublic: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
  isLiked?: boolean;
  hasUserFollowed?: boolean;
}

export default function SocialFeed() {
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [shareText, setShareText] = useState('');
  const [selectedWork, setSelectedWork] = useState<WorkPost | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch public works feed
  const { data: feed, isLoading } = useQuery({
    queryKey: ["/api/social/feed", filter, searchQuery, selectedTags],
    queryParams: { filter, search: searchQuery, tags: selectedTags.join(',') }
  });

  // Fetch trending tags
  const { data: trendingTags } = useQuery({
    queryKey: ["/api/social/trending-tags"]
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ workId, action }: { workId: number; action: 'like' | 'unlike' }) => {
      return await apiRequest(`/api/social/works/${workId}/${action}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    }
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: 'follow' | 'unfollow' }) => {
      return await apiRequest(`/api/social/users/${userId}/${action}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      toast({
        title: "Success",
        description: "Follow status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ workId, shareText }: { workId: number; shareText: string }) => {
      return await apiRequest(`/api/social/works/${workId}/share`, {
        method: 'POST',
        body: JSON.stringify({ shareText })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      setShareText('');
      setSelectedWork(null);
      toast({
        title: "Shared Successfully",
        description: "Work has been shared to your followers",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Share Failed",
        description: error.message || "Failed to share work",
        variant: "destructive",
      });
    }
  });

  const handleLike = (workId: number, isLiked: boolean) => {
    likeMutation.mutate({ 
      workId, 
      action: isLiked ? 'unlike' : 'like' 
    });
  };

  const handleFollow = (userId: number, isFollowing: boolean) => {
    followMutation.mutate({ 
      userId, 
      action: isFollowing ? 'unfollow' : 'follow' 
    });
  };

  const handleShare = (work: WorkPost) => {
    setSelectedWork(work);
  };

  const submitShare = () => {
    if (selectedWork) {
      shareMutation.mutate({ 
        workId: selectedWork.id, 
        shareText 
      });
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Play className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
        <div className="max-w-4xl mx-auto">
          <LiquidGlassLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Creator Community
              </h1>
              <p className="text-gray-400">
                Discover and connect with amazing creators worldwide
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => window.location.href = '/authenticated-upload'}
                className="btn-glass bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Share Your Art
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artworks, creators, tags..."
                  className="glass-input pl-10"
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Filter posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="following">Following</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Trending Tags */}
          {trendingTags && trendingTags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`cursor-pointer transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-gray-600 text-gray-300 hover:bg-purple-900 hover:bg-opacity-30'
                    }`}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            {feed && feed.length > 0 ? feed.map((work: WorkPost) => (
              <GlassCard key={work.id} className="overflow-hidden">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={work.user.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                          {work.user.displayName?.charAt(0) || work.user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">
                            {work.user.displayName || work.user.username}
                          </h3>
                          {work.user.isVerified && (
                            <Verified className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          @{work.user.username} • {new Date(work.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {user?.id !== work.user.id && (
                        <Button
                          onClick={() => handleFollow(work.user.id, work.hasUserFollowed || false)}
                          disabled={followMutation.isPending}
                          size="sm"
                          variant={work.hasUserFollowed ? "outline" : "default"}
                          className={work.hasUserFollowed 
                            ? "border-gray-600 text-gray-300 hover:bg-red-900 hover:bg-opacity-20" 
                            : "btn-glass bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          }
                        >
                          <UserPlus className="mr-1 h-4 w-4" />
                          {work.hasUserFollowed ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-white">{work.title}</h2>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400">Protected</span>
                      </div>
                    </div>
                    
                    {work.description && (
                      <p className="text-gray-300 mb-3">{work.description}</p>
                    )}

                    {/* File Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        {getFileTypeIcon(work.mimeType)}
                        <span>{work.mimeType.split('/')[0]}</span>
                      </div>
                      <span>{formatFileSize(work.fileSize)}</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{work.viewCount} views</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {work.tags && work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {work.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview Area */}
                  <div className="mb-4 p-4 bg-gray-800 bg-opacity-30 rounded-xl border border-gray-600">
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      {getFileTypeIcon(work.mimeType)}
                      <span className="ml-2">Preview Protected - View Certificate</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-6">
                      <Button
                        onClick={() => handleLike(work.id, work.isLiked || false)}
                        disabled={likeMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className={`hover:bg-red-900 hover:bg-opacity-20 ${
                          work.isLiked ? 'text-red-400' : 'text-gray-400'
                        }`}
                      >
                        <Heart className={`mr-2 h-4 w-4 ${work.isLiked ? 'fill-current' : ''}`} />
                        {work.likeCount}
                      </Button>

                      <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-blue-900 hover:bg-opacity-20">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {work.commentCount}
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:bg-green-900 hover:bg-opacity-20"
                            onClick={() => handleShare(work)}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            {work.shareCount}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-modal">
                          <DialogHeader>
                            <DialogTitle className="text-white">Share "{work.title}"</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={shareText}
                              onChange={(e) => setShareText(e.target.value)}
                              placeholder="Add a message with your share..."
                              className="glass-input"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setSelectedWork(null)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={submitShare}
                                disabled={shareMutation.isPending}
                                className="btn-glass bg-gradient-to-r from-green-600 to-blue-600 text-white"
                              >
                                {shareMutation.isPending ? 'Sharing...' : 'Share'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Button
                      onClick={() => window.open(`/certificate/${work.certificateId}`, '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                <p className="text-gray-400 mb-4">
                  {filter === 'following' 
                    ? "Follow some creators to see their posts here" 
                    : "Be the first to share your creative work!"}
                </p>
                <Button
                  onClick={() => window.location.href = '/authenticated-upload'}
                  className="btn-glass bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  Share Your First Work
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            {user && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Followers</span>
                      <span className="text-white font-semibold">{user.followerCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Following</span>
                      <span className="text-white font-semibold">{user.followingCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Likes</span>
                      <span className="text-white font-semibold">{user.totalLikes || 0}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Suggested Creators */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Suggested Creators</h3>
                <div className="space-y-3">
                  <div className="text-center py-4 text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Discovering amazing creators...</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Popular Tags */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Popular This Week</h3>
                <div className="space-y-2">
                  {['digital-art', 'photography', 'design', 'nft', 'blockchain'].map(tag => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-gray-300">#{tag}</span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {Math.floor(Math.random() * 100) + 10}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}