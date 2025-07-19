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
  ShoppingCart,
  X,
  Image,
  Video,
  FileText,
  Music,
  Paperclip
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
import { AudioPlayer } from "@/components/AudioPlayer";

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
    mutationFn: async (postData: { content: string; file?: File | null; tags?: string[] }) => {
      if (postData.file) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('content', postData.content);
        formData.append('file', postData.file);
        if (postData.tags) {
          formData.append('tags', JSON.stringify(postData.tags));
        }
        
        const response = await fetch('/api/social/posts', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create post');
        }
        
        return response.json();
      } else {
        // Regular JSON request for text-only posts
        return await apiRequest('/api/social/posts', {
          method: 'POST',
          body: JSON.stringify({ content: postData.content, tags: postData.tags }),
        });
      }
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
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
      console.log("Deleting post with ID:", postId);
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
    onError: (error: any) => {
      console.error("Delete post error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
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
      file: newPost.file,
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
                  
                  {/* File Upload Section */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.mov,.avi,.mkv,.webm,.flv,.wmv,.m4v,.3gp,.mp2,.m4a,.aac,.ogg,.wav,.wma,.flac"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewPost(prev => ({ ...prev, file }));
                          }
                        }}
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors cursor-pointer glass-card"
                      >
                        <div className="text-center">
                          <Paperclip className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-400">
                            {newPost.file ? newPost.file.name : "Attach your work (image, video, audio, document)"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Max 500MB • Images, Videos, Audio, Documents
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* File Preview */}
                    {newPost.file && (
                      <div className="relative p-3 bg-white/5 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {newPost.file.type.startsWith('image/') && <Image className="h-5 w-5 text-blue-400" />}
                            {newPost.file.type.startsWith('video/') && <Video className="h-5 w-5 text-red-400" />}
                            {newPost.file.type.startsWith('audio/') && <Music className="h-5 w-5 text-green-400" />}
                            {newPost.file.type.includes('pdf') && <FileText className="h-5 w-5 text-orange-400" />}
                            {!newPost.file.type.match(/^(image|video|audio)\//) && !newPost.file.type.includes('pdf') && <FileText className="h-5 w-5 text-gray-400" />}
                            <div>
                              <p className="text-sm text-white font-medium">{newPost.file.name}</p>
                              <p className="text-xs text-gray-400">{(newPost.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewPost(prev => ({ ...prev, file: null }))}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="btn-glass"
                      >
                        {createPostMutation.isPending ? "Posting..." : "Post Only"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setLocation('/upload-work')}
                        className="border-gray-600 text-gray-300 hover:bg-white/5"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Protect
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setShowCreatePost(false)}
                      className="w-full text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      Cancel
                    </Button>
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
                        {post.fileType === "image" ? (
                          <img 
                            src={`/api/files/${post.imageUrl}`}
                            alt="Post content"
                            className="w-full max-h-96 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : post.fileType === "video" ? (
                          <video 
                            src={`/api/files/${post.imageUrl}`}
                            controls
                            className="w-full max-h-96 rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : post.fileType === "audio" ? (
                          <AudioPlayer 
                            src={`/api/files/${post.imageUrl}`}
                            className="mb-0"
                          />
                        ) : (
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <FileText className="h-8 w-8 text-orange-400" />
                              <div className="flex-1">
                                <p className="text-sm text-white">Document attached</p>
                                <a 
                                  href={`/api/files/${post.imageUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 text-sm"
                                >
                                  Download file
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Fallback error display */}
                        <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                          <div className="text-center text-gray-400">
                            <FileText className="mx-auto h-8 w-8 mb-2" />
                            <p className="text-sm">File not available</p>
                          </div>
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