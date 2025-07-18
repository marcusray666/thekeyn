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
  Calendar,
  Eye,
  MoreHorizontal,
  Upload
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

interface Post {
  id: string;
  userId: string;
  username: string;
  userImage?: string;
  content: string;
  imageUrl?: string;
  fileType?: string;
  createdAt: string;
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
  const [newPost, setNewPost] = useState({
    content: "",
    file: null as File | null,
    tags: [] as string[],
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for the social feed
  const mockPosts: Post[] = [
    {
      id: "1",
      userId: "user1",
      username: "artisan_creator",
      userImage: undefined,
      content: "Just finished this digital artwork! Inspired by the cosmic energy of liquid glass. What do you think? 🎨✨",
      imageUrl: "/api/placeholder/600/400",
      fileType: "image",
      createdAt: "2024-07-18T10:30:00Z",
      likes: 42,
      comments: 8,
      shares: 3,
      isLiked: false,
      tags: ["digital-art", "cosmic", "liquid-glass"]
    },
    {
      id: "2", 
      userId: "user2",
      username: "visual_poet",
      userImage: undefined,
      content: "Protecting my latest photography series with Loggin! Each image tells a story of urban landscapes and human connection.",
      imageUrl: "/api/placeholder/600/600",
      fileType: "image",
      createdAt: "2024-07-18T08:15:00Z",
      likes: 67,
      comments: 12,
      shares: 5,
      isLiked: true,
      tags: ["photography", "urban", "series"]
    },
    {
      id: "3",
      userId: "user3", 
      username: "sound_architect",
      userImage: undefined,
      content: "New ambient track now protected and ready to share! This piece explores the intersection of technology and nature.",
      fileType: "audio",
      createdAt: "2024-07-18T06:45:00Z",
      likes: 28,
      comments: 4,
      shares: 7,
      isLiked: false,
      tags: ["music", "ambient", "electronic"]
    }
  ];

  const { data: posts = mockPosts } = useQuery({
    queryKey: ['/api/social/posts'],
    // Using mock data for now
    queryFn: () => Promise.resolve(mockPosts),
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      // Mock API call
      return Promise.resolve({ id: Date.now().toString(), ...postData });
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
      // Mock API call
      return Promise.resolve({ postId, liked: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
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
      userId: user?.id,
      username: user?.username,
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

  const filteredPosts = posts.filter(post => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-28 px-3 lg:px-6 py-3 lg:py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Community</h1>
              <p className="text-gray-400">Share your protected works with fellow creators</p>
            </div>
            
            <Button
              onClick={() => setShowCreatePost(true)}
              className="btn-glass px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Share Art
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, creators, or tags..."
                className="glass-input pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {["all", "images", "audio", "following"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={`capitalize ${
                    selectedFilter === filter 
                      ? "bg-purple-600 text-white" 
                      : "border-gray-600 text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
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
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/upload-work')}
                      className="border-gray-600 text-gray-300 hover:bg-white/5"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Protect First
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCreatePost(false)}
                        className="text-gray-300 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="btn-glass"
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
        <div className="space-y-6">
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
                    
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <User className="mx-auto h-12 w-12 mb-4" />
              <p>No posts found</p>
              {searchQuery && <p className="text-sm">Try adjusting your search or filters</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}