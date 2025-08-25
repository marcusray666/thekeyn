import { formatTimeAgo } from "@/lib/utils";
import { Heart, MessageCircle, Share2, MapPin, Volume2, VolumeX, Play, Pause, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CommentsSection from "@/components/CommentsSection";

import type { Post } from "@shared/schema";

// Use Post type directly - it already includes all needed fields
type CommunityPost = Post;

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUserId?: number;
  isAdmin?: boolean;
}

export function CommunityPostCard({ post, currentUserId, isAdmin = false }: CommunityPostCardProps) {
  const [isLiked, setIsLiked] = useState(false); // isLiked not in schema
  const [likes, setLikes] = useState(post.likes || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/community/posts/${post.id}/like`, { method: "POST" }),
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => apiRequest(`/api/community/posts/${post.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.fileType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (post.fileType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const renderHashtags = () => {
    if (!post.hashtags || post.hashtags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {post.hashtags.map((hashtag: string, index: number) => (
          <Link key={index} href={`/hashtag/${hashtag}`}>
            <span className="text-[#FE3F5E] hover:text-[#FF6B8A] text-sm cursor-pointer">
              #{hashtag}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  const renderMentions = () => {
    // mentionedUsers field exists in schema
    if (!post.mentionedUsers || post.mentionedUsers.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        <span className="text-gray-500 text-sm">Mentioned:</span>
        {post.mentionedUsers.map((username: string, index: number) => (
          <Link key={index} href={`/user/${username}`}>
            <span className="text-[#FE3F5E] hover:text-[#FF6B8A] text-sm cursor-pointer">
              @{username}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  const renderMediaContent = () => {
    if (!post.imageUrl || !post.fileType) return null;

    switch (post.fileType) {
      case 'image':
        return (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={post.imageUrl}
              alt={post.content}
              className="w-full h-auto max-h-96 object-contain"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', post.imageUrl);
                // Try to reload with cache-busting
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('?reload=')) {
                  target.src = `${post.imageUrl}?reload=${Date.now()}`;
                }
              }}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <video
              ref={videoRef}
              src={post.imageUrl}
              className="w-full h-auto max-h-96 object-contain"
              controls
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-12 h-12 bg-[#FE3F5E] hover:bg-[#FF6B8A] rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-1" />
                )}
              </button>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{post.title}</p>
                <p className="text-gray-500 text-sm">Audio Track</p>
              </div>
              <button
                onClick={handleMuteToggle}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
            <audio
              ref={audioRef}
              src={post.imageUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 overflow-hidden">
            {/* PDF Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-lg">
                  <span className="text-white font-bold text-sm">📄</span>
                </div>
                <div>
                  <p className="text-white font-medium">{post.filename || post.title}</p>
                  <p className="text-white/50 text-sm">PDF Document</p>
                </div>
              </div>
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#FE3F5E] hover:bg-[#FF6B8A] text-white text-sm rounded-lg transition-colors"
              >
                View PDF
              </a>
            </div>
            
            {/* PDF Inline Preview */}
            <div className="relative">
              <iframe
                src={`${post.imageUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-96 border-0"
                title={`PDF Preview: ${post.title}`}
                loading="lazy"
                style={{
                  background: 'white',
                  filter: 'none'
                }}
                onError={(e) => {
                  // Fallback if iframe fails
                  console.log('PDF iframe failed to load:', e);
                }}
              />
              
              {/* PDF Overlay for click handling */}
              <div className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors cursor-pointer"
                   onClick={() => window.open(post.imageUrl, '_blank')}>
                <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Click to open full PDF
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg">
                <span className="text-white font-bold text-lg">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{post.title}</p>
                <p className="text-gray-500 text-sm">Text Document</p>
              </div>
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#FE3F5E] hover:bg-[#FF6B8A] text-white rounded-lg transition-colors"
              >
                Read
              </a>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const displayName = post.displayName || post.username;
  const profileImage = post.profileImageUrl;

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-4 md:p-6 mb-4 hover:bg-white/80 transition-all duration-300 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1 pr-4">
          <Link href={`/user/${post.userId}`}>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100/60 p-2 rounded-lg transition-colors -m-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center flex-shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-gray-800 font-semibold hover:text-[#FE3F5E] transition-colors truncate">
                  {displayName}
                </h3>
                <p className="text-gray-500 text-sm truncate">@{post.username} • {formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Delete Menu - Show for post owner or admin */}
          {(currentUserId === post.userId || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 flex-shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-xl border-gray-200/50 text-gray-800 shadow-xl">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-800">Delete Post</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        Are you sure you want to delete this post? This action cannot be undone.
                        {isAdmin && currentUserId !== post.userId && (
                          <div className="mt-2 text-red-600 text-sm">
                            You are deleting another user's post as an administrator.
                          </div>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePostMutation.mutate()}
                        disabled={deletePostMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deletePostMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-gray-800 font-bold text-lg mb-2">{post.title}</h2>
        {post.description && (
          <p className="text-gray-600 mb-3 leading-relaxed">{post.description}</p>
        )}
        
        {/* Location */}
        {post.location && (
          <div className="flex items-center space-x-1 text-gray-500 text-sm mb-2 cursor-pointer hover:text-[#FE3F5E] transition-colors"
               onClick={(e) => {
                 e.stopPropagation();
                 // Open location search (could link to maps or location-based posts)
                 if (post.location) {
                   window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(post.location)}`, '_blank');
                 }
               }}>
            <MapPin className="h-4 w-4" />
            <span>{post.location}</span>
          </div>
        )}

        {/* Media Content */}
        {renderMediaContent()}
        
        {/* Hashtags */}
        {renderHashtags()}
        
        {/* Mentions */}
        {renderMentions()}
      </div>

      {/* AI Verification Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-green-100 border border-green-200 px-2 py-1 rounded-full">
          <span className="text-green-700 text-xs font-medium">✓ Verified by AI</span>
        </div>
        {post.isProtected && (
          <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] px-3 py-1 rounded-full">
            <span className="text-white text-xs font-semibold">PROTECTED</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked 
                ? 'text-red-500 hover:text-red-400' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-[#FE3F5E] transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-gray-200/50 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-800">Comments on "{post.title}"</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <CommentsSection 
                  postId={post.id} 
                  currentUserId={currentUserId} 
                  postType="community"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-[#FE3F5E] transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{post.shares}</span>
          </button>
        </div>
        
        <div className="text-gray-400 text-sm">
          {post.views} views
        </div>
      </div>
    </div>
  );
}