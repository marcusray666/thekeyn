import { formatTimeAgo } from "@/lib/utils";
import { Heart, MessageCircle, Share2, MapPin, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CommunityPost {
  id: string;
  userId: number;
  title: string;
  description?: string;
  content: string;
  imageUrl?: string;
  filename?: string;
  fileType?: string;
  mimeType?: string;
  fileSize?: number;
  hashtags?: string[];
  location?: string;
  mentionedUsers?: string[];
  isProtected: boolean;
  protectedWorkId?: number;
  tags?: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  isLiked?: boolean;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUserId?: number;
}

export function CommunityPostCard({ post, currentUserId }: CommunityPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes);
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
        {post.hashtags.map((hashtag, index) => (
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
    if (!post.mentionedUsers || post.mentionedUsers.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        <span className="text-white/50 text-sm">Mentioned:</span>
        {post.mentionedUsers.map((username, index) => (
          <Link key={index} href={`/user/${username}`}>
            <span className="text-[#FFD200] hover:text-[#FFF200] text-sm cursor-pointer">
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
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto max-h-96 object-contain"
              loading="lazy"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
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
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-4">
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
                <p className="text-white font-medium">{post.title}</p>
                <p className="text-white/50 text-sm">Audio Track</p>
              </div>
              <button
                onClick={handleMuteToggle}
                className="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white transition-colors"
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
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-lg">
                <span className="text-white font-bold text-lg">📄</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{post.title}</p>
                <p className="text-white/50 text-sm">PDF Document</p>
              </div>
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#FE3F5E] hover:bg-[#FF6B8A] text-white rounded-lg transition-colors"
              >
                View PDF
              </a>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg">
                <span className="text-white font-bold text-lg">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{post.title}</p>
                <p className="text-white/50 text-sm">Text Document</p>
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 mb-4 hover:bg-white/8 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link href={`/user/${post.userId}`}>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors -m-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold hover:text-[#FE3F5E] transition-colors">
                  {displayName}
                </h3>
                <p className="text-white/50 text-sm">@{post.username} • {formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>
          </Link>
        </div>
        {post.isProtected && (
          <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] px-3 py-1 rounded-full">
            <span className="text-white text-xs font-semibold">PROTECTED</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-white font-bold text-lg mb-2">{post.title}</h2>
        {post.description && (
          <p className="text-white/80 mb-3 leading-relaxed">{post.description}</p>
        )}
        
        {/* Location */}
        {post.location && (
          <div className="flex items-center space-x-1 text-white/60 text-sm mb-2 cursor-pointer hover:text-[#FFD200] transition-colors"
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
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-green-500/20 border border-green-500/30 px-2 py-1 rounded-full">
          <span className="text-green-400 text-xs font-medium">✓ Verified by AI</span>
        </div>
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
                : 'text-white/60 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-white/60 hover:text-[#FFD200] transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-white/60 hover:text-[#FE3F5E] transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{post.shares}</span>
          </button>
        </div>
        
        <div className="text-white/40 text-sm">
          {post.views} views
        </div>
      </div>
    </div>
  );
}