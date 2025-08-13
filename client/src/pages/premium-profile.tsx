import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Share2, Edit3, Grid3X3, List, MoreHorizontal, Heart, MessageCircle, X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/premium/post-card";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function PremiumProfile() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/profile/:username");
  const username = params?.username;

  // Fetch user profile - either specific username or current user
  const { data: profile, isLoading } = useQuery({
    queryKey: username ? ["/api/profile", username] : ["/api/user/profile"],
    queryFn: () => username 
      ? apiRequest(`/api/profile/${username}`) 
      : apiRequest("/api/user/profile"),
  });

  // Fetch posts for the profile user (either specific user or current user)
  const targetUserId = username ? profile?.id : user?.id;
  const { data: posts = [] } = useQuery({
    queryKey: ["/api/community/posts", "user", targetUserId],
    queryFn: () => apiRequest("/api/community/posts?userId=" + targetUserId),
    enabled: !!targetUserId,
  });

  // Fetch user stats for the profile user
  const { data: stats } = useQuery({
    queryKey: username ? ["/api/user/stats", username] : ["/api/user/stats"],
    queryFn: () => username 
      ? apiRequest(`/api/user/stats?username=${username}`)
      : apiRequest("/api/user/stats"),
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post liked!",
        description: "Your like has been added to this post.",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return await apiRequest(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        body: { content },
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
  });

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setShowMediaViewer(true);
  };

  const handleLike = () => {
    if (selectedPost) {
      likeMutation.mutate(selectedPost.id);
    }
  };

  const handleComment = () => {
    if (selectedPost && newComment.trim()) {
      commentMutation.mutate({
        postId: selectedPost.id,
        content: newComment.trim(),
      });
    }
  };

  const renderMediaContent = (post: any) => {
    if (post.imageUrl) {
      return (
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full max-h-[70vh] object-contain rounded-xl"
        />
      );
    }

    if (post.mimeType?.startsWith('video/')) {
      return (
        <div className="relative">
          <video 
            className="w-full max-h-[70vh] object-contain rounded-xl"
            controls
            autoPlay={isPlaying}
            muted={isMuted}
          >
            <source src={post.fileUrl} type={post.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (post.mimeType?.startsWith('audio/')) {
      return (
        <div className="w-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-12 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Volume2 className="h-12 w-12 text-white/70" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{post.title || post.filename}</h3>
            <p className="text-white/60">Audio File</p>
          </div>
          <audio 
            className="w-full"
            controls
            autoPlay={isPlaying}
            muted={isMuted}
          >
            <source src={post.fileUrl} type={post.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Default fallback for other file types
    return (
      <div className="w-full bg-white/5 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">
          {post.mimeType?.startsWith('image/') ? '🎨' :
           post.mimeType?.startsWith('audio/') ? '🎵' :
           post.mimeType?.startsWith('video/') ? '🎬' : '📄'}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{post.title || post.filename}</h3>
        <p className="text-white/60">Click to download or view</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/10 rounded-3xl"></div>
            <div className="h-20 bg-white/10 rounded-3xl"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle profile not found
  if (username && (!profile || profile.message === "User not found")) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/50 text-lg mb-4">Profile not found</div>
          <Link href="/">
            <Button className="glass-button">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-4xl mx-auto px-4 space-y-8 relative z-10">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="creator-avatar !w-24 !h-24">
              <div className="avatar-inner !text-2xl">
                {profile?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {profile?.displayName || profile?.username || "User"}
                  </h1>
                  <p className="text-white/70">@{profile?.username}</p>
                </div>
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  <Button className="glass-button">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <p className="text-white/70 mb-6 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.worksProtected || 0}</div>
                  <div className="text-white/50 text-sm">Protected Works</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.certificates || 0}</div>
                  <div className="text-white/50 text-sm">Certificates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.followers || 0}</div>
                  <div className="text-white/50 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.communityLikes || 0}</div>
                  <div className="text-white/50 text-sm">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex space-x-6">
              <button className="text-white font-medium border-b-2 border-[#FE3F5E] pb-2">
                My Works
              </button>
              <button className="text-white/70 hover:text-white transition-colors pb-2">
                Liked
              </button>
              <button className="text-white/70 hover:text-white transition-colors pb-2">
                Saved
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {posts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => handlePostClick(post)}
                      className="aspect-square bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-xl">
                          {post.imageUrl ? (
                            <img 
                              src={post.imageUrl} 
                              alt={post.title}
                              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                              {post.mimeType?.startsWith('image/') ? '🎨' :
                               post.mimeType?.startsWith('audio/') ? '🎵' :
                               post.mimeType?.startsWith('video/') ? '🎬' : '📄'}
                            </div>
                          )}
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                            <div className="text-white text-center">
                              <div className="text-sm font-medium">Click to view</div>
                              <div className="text-xs opacity-75">
                                {post.likes || 0} likes • {post.comments || 0} comments
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="text-white font-medium truncate">{post.title || post.filename}</h3>
                          <p className="text-white/50 text-sm truncate">{post.username}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        likesCount: post.likes || 0,
                        commentsCount: post.comments || 0
                      }}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Edit3 className="h-12 w-12 text-white/50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Posts Yet</h3>
                <p className="text-white/50 mb-6 max-w-sm mx-auto">
                  Share your first community post to start building your profile.
                </p>
                <Link href="/create-post">
                  <Button className="accent-button">
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      <Dialog open={showMediaViewer} onOpenChange={setShowMediaViewer}>
        <DialogContent className="max-w-4xl w-full bg-[#0F0F0F]/95 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              {selectedPost?.title || selectedPost?.filename}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6">
              {/* Media Content */}
              <div className="flex justify-center">
                {renderMediaContent(selectedPost)}
              </div>

              {/* Post Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedPost.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedPost.username}</p>
                      <p className="text-white/50 text-sm">
                        {new Date(selectedPost.created_at || selectedPost.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleLike}
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-[#FE3F5E] hover:bg-[#FE3F5E]/10"
                      disabled={likeMutation.isPending}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {selectedPost.likes || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {selectedPost.comments || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {selectedPost.content && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-white/80">{selectedPost.content}</p>
                  </div>
                )}

                {/* Comment Section */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="bg-white/10 border-white/20 text-white placeholder-white/50"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                      />
                      <Button
                        onClick={handleComment}
                        disabled={!newComment.trim() || commentMutation.isPending}
                        className="bg-[#FE3F5E] hover:bg-[#FE3F5E]/80"
                      >
                        Post
                      </Button>
                    </div>
                  </div>

                  {/* Existing Comments Display (if available) */}
                  {selectedPost.commentsData && selectedPost.commentsData.length > 0 && (
                    <div className="space-y-3">
                      {selectedPost.commentsData.map((comment: any, index: number) => (
                        <div key={index} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {comment.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm">{comment.content}</p>
                            <p className="text-white/50 text-xs mt-1">
                              @{comment.username} • {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}