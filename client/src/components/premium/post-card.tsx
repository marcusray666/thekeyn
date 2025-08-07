import { formatTimeAgo } from "@/lib/utils";
import { Shield, Share2, Heart, MessageCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { ShareModal } from "./share-modal";

interface PostCardProps {
  post: {
    id: number;
    title: string;
    filename: string;
    creatorName: string;
    creatorId?: number;
    createdAt: string;
    sha256Hash?: string;
    mimeType: string | null;
    thumbnailUrl?: string;
    isVerified: boolean;
    isProtected?: boolean;
    likesCount?: number;
    commentsCount?: number;
    description?: string;
  };
  onDetailsClick?: () => void;
}

export function PostCard({ post, onDetailsClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const getFileIcon = () => {
    if (post.mimeType?.startsWith('image/')) return '🎨';
    if (post.mimeType?.startsWith('audio/')) return '🎵';
    if (post.mimeType?.startsWith('video/')) return '🎬';
    return '📄';
  };

  return (
    <div 
      className="post-card bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 mb-4" 
      style={{
        background: 'rgba(255, 255, 255, 0.08) !important', 
        border: '2px solid rgba(255, 255, 255, 0.2) !important',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }} 
      onClick={onDetailsClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors -m-2"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to user profile using username (preferred) or userId as fallback
            const username = post.username || post.creatorName;
            if (username) {
              window.location.href = `/profile/${username}`;
            } else if (post.creatorId) {
              window.location.href = `/user/${post.creatorId}`;
            } else {
              console.warn('No username or creatorId available for navigation');
            }
          }}
        >
          <div className="creator-avatar">
            <div className="avatar-inner">
              {(post.creatorName || post.username || "U").charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold hover:text-[#FE3F5E] transition-colors">{post.creatorName || post.username || "Unknown User"}</h3>
            <p className="text-white/50 text-sm">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.isProtected && (
            <div className="bg-gradient-to-r from-[#FE3F5E] to-[#FF6B8A] px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">PROTECTED</span>
            </div>
          )}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 px-3 py-1 rounded-full">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-white" />
              <span className="text-white text-xs font-semibold">Verified by AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-4xl">{getFileIcon()}</div>
          <div className="flex-1">
            <h4 className="text-white font-medium truncate">{post.title || post.filename}</h4>
            {post.description && (
              <p className="text-white/70 text-sm mt-1">{post.description}</p>
            )}
            {post.sha256Hash && (
              <p className="text-white/50 text-sm font-mono truncate">
                {post.sha256Hash.substring(0, 16)}...
              </p>
            )}
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
          
          <button 
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowShareModal(true);
            }}
          >
            <Share2 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={{
            id: post.id,
            title: post.title,
            type: 'post',
            creatorName: post.creatorName,
            creatorId: post.creatorId || 0,
            thumbnailUrl: post.thumbnailUrl,
            isProtected: post.isProtected,
            filename: post.filename,
            description: post.description
          }}
        />
      )}
    </div>
  );
}