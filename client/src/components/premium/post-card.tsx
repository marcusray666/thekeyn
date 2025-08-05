import { formatTimeAgo } from "@/lib/utils";
import { Shield, Download, Share2, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    filename: string;
    creatorName: string;
    createdAt: string;
    sha256Hash: string;
    mimeType: string;
    thumbnailUrl?: string;
    isVerified: boolean;
    likesCount?: number;
    commentsCount?: number;
  };
  onDetailsClick?: () => void;
}

export function PostCard({ post, onDetailsClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const getFileIcon = () => {
    if (post.mimeType.startsWith('image/')) return '🎨';
    if (post.mimeType.startsWith('audio/')) return '🎵';
    if (post.mimeType.startsWith('video/')) return '🎬';
    return '📄';
  };

  return (
    <div className="post-card" onClick={onDetailsClick}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="creator-avatar">
            <div className="avatar-inner">
              {post.creatorName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold">{post.creatorName}</h3>
            <p className="text-white/50 text-sm">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        {post.isVerified && (
          <div className="verification-badge">
            <Shield className="h-3 w-3" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-4xl">{getFileIcon()}</div>
          <div className="flex-1">
            <h4 className="text-white font-medium truncate">{post.title || post.filename}</h4>
            <p className="text-white/50 text-sm font-mono truncate">
              {post.sha256Hash.substring(0, 16)}...
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 group"
          >
            <Heart 
              className={`h-6 w-6 transition-all duration-200 group-hover:scale-110 ${
                isLiked ? 'fill-[#FE3F5E] text-[#FE3F5E]' : 'text-white/70 hover:text-[#FE3F5E]'
              }`}
            />
            <span className="text-white/70 text-sm">{likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm">{post.commentsCount || 0}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
            <Share2 className="h-6 w-6" />
          </button>
        </div>

        <button className="glass-button !px-4 !py-2 !text-sm">
          <Download className="h-4 w-4 mr-2" />
          Certificate
        </button>
      </div>
    </div>
  );
}