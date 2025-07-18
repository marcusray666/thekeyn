import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus,
  Search,
  Filter,
  User,
  Users,
  Calendar,
  Eye,
  MoreHorizontal,
  Upload,
  Edit,
  Trash2,
  BookmarkPlus,
  Flag,
  TrendingUp,
  Bell,
  ShoppingCart
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommentsSection from "@/components/CommentsSection";
import SearchBar from "@/components/SearchBar";
import NotificationCenter from "@/components/NotificationCenter";
import TrendingSection from "@/components/TrendingSection";
import MarketplaceSection from "@/components/MarketplaceSection";
import FollowButton from "@/components/FollowButton";
import PostCard from "@/components/PostCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Post {
  id: string;
  userId: number;
  username: string;
  userImage?: string;
  content: string;
  imageUrl?: string;
  fileType?: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  tags?: string[];
}

export default function Social() {
  const [, setLocation] = useLocation();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState({
    content: "",
    file: null as File | null,
    tags: [] as string[],
  });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real data from API
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/social/posts"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: userFollowStats } = useQuery({
    queryKey: [`/api/social/users/${user?.id}/follow-stats`],
    enabled: !!user?.id,
  });

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const response = await apiRequest(`/api/social/posts/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response);
      setShowSearchResults(true);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search posts",
        variant: "destructive",
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleTrendingClick = () => {
    setActiveTab("trending");
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; tags?: string[] }) => {
      return await apiRequest('/api/social/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      setShowCreatePost(false);
      setNewPost({ content: "", file: null, tags: [] });
      toast({
        title: "Post shared!",
        description: "Your artwork has been shared with the community.",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/social/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, content, tags }: { postId: string; content: string; tags: string[] }) => {
      return await apiRequest(`/api/social/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ content, tags }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      setShowEditDialog(false);
      setEditingPost(null);
      toast({
        title: "Post updated!",
        description: "Your post has been updated successfully.",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/social/posts/${postId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      toast({
        title: "Post deleted!",
        description: "Your post has been deleted successfully.",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      content: newPost.content,
      tags: newPost.tags,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditDialog(true);
  };

  const handleUpdatePost = () => {
    if (!editingPost || !editingPost.content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    updatePostMutation.mutate({
      postId: editingPost.id,
      content: editingPost.content,
      tags: editingPost.tags || [],
    });
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };





  const filteredPosts = (posts || []).filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "images" && post.fileType === "image") ||
                         (selectedFilter === "audio" && post.fileType === "audio") ||
                         (selectedFilter === "following" && false); // Mock following filter

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 gradient-text">
              Community
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Share your protected works with fellow creators
            </p>
            
            <Button
              onClick={() => setShowCreatePost(true)}
              className="btn-glass px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Plus className="mr-3 h-5 w-5" />
              Share Art
            </Button>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <SearchBar 
                onSearch={handleSearch}
                onClear={handleClearSearch}
                onTrendingClick={handleTrendingClick}
                currentQuery={searchQuery}
                placeholder="Search posts, creators, content, and marketplace..."
              />
              <div className="flex items-center gap-2 ml-4">
                <NotificationCenter />
                {user && userFollowStats && (
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{userFollowStats.followingCount} Following</span>
                    <span>{userFollowStats.followersCount} Followers</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Tabs Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 backdrop-blur-xl bg-white/5 border-white/10">
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Following
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="mt-6">
                {showSearchResults ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Search Results for "{searchQuery}"
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearSearch}
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        Clear Search
                      </Button>
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="space-y-6">
                        {searchResults.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-400">No posts found matching your search.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts && posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <GlassCard className="p-12">
                          <Users className="mx-auto h-16 w-16 text-purple-400 mb-6" />
                          <h3 className="text-xl font-semibold text-white mb-2">Welcome to the Community</h3>
                          <p className="text-gray-400 mb-4">
                            Share your protected artwork and connect with fellow creators
                          </p>
                          <Button
                            onClick={() => setShowCreatePost(true)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Post
                          </Button>
                        </GlassCard>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="trending" className="mt-6">
                <TrendingSection />
              </TabsContent>
              
              <TabsContent value="marketplace" className="mt-6">
                <MarketplaceSection />
              </TabsContent>
              
              <TabsContent value="following" className="mt-6">
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <GlassCard className="p-12">
                      <Users className="mx-auto h-16 w-16 text-green-400 mb-6" />
                      <h3 className="text-xl font-semibold text-white mb-2">Follow Creators</h3>
                      <p className="text-gray-400 mb-4">
                        Discover and follow talented creators to see their latest work
                      </p>
                      <Button
                        onClick={() => setActiveTab("feed")}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Explore Community
                      </Button>
                    </GlassCard>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>



        {/* Create Post Modal */}
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreatePost(false)}
          >
            <GlassCard className="w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Share Your Art</h3>
                
                <div className="space-y-4">
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Tell the community about your work..."
                    className="glass-input"
                    rows={4}
                  />
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/upload-work')}
                      className="w-full border-gray-600 text-gray-300 hover:bg-white/5 justify-start"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Protect First
                    </Button>
                    
                    <div className="flex gap-3 w-full">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCreatePost(false)}
                        className="flex-1 text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="flex-1 btn-glass"
                      >
                        {createPostMutation.isPending ? "Sharing..." : "Share"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

          {/* Posts Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  <div className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{post.username}</h4>
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatTimeAgo(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {post.userId === user?.id && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BookmarkPlus className="w-4 h-4 mr-2" />
                            Save
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-300 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Post Media */}
                    {post.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Eye className="mx-auto h-8 w-8 mb-2" />
                            <p className="text-sm">Protected Artwork Preview</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {post.fileType === "audio" && (
                      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-center text-gray-400">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <p className="text-sm">Protected Audio Track</p>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-purple-900/30 text-purple-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePostMutation.mutate(post.id)}
                          className={`flex items-center space-x-2 ${
                            post.isLiked ? "text-red-400" : "text-gray-400"
                          } hover:text-red-300`}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                          <span>{post.likes}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-400 hover:text-blue-300">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-400 hover:text-green-300">
                          <Share2 className="h-4 w-4" />
                          <span>{post.shares}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Empty State */}
            {filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12"
              >
                <GlassCard className="p-12">
                  <div className="text-gray-400">
                    <User className="mx-auto h-16 w-16 mb-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                    <p className="text-gray-400">
                      {searchQuery 
                        ? "Try adjusting your search or filters" 
                        : "Be the first to share your protected artwork with the community!"
                      }
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={editingPost?.content || ""}
              onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowEditDialog(false)}
                className="text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePost}
                disabled={updatePostMutation.isPending}
                className="btn-glass"
              >
                {updatePostMutation.isPending ? "Updating..." : "Update Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}