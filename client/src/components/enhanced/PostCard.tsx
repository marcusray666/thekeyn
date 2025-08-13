import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { buildMediaUrl, handleImageError } from "@/utils/media";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface PostCardProps {
  post: {
    id: number;
    title?: string;
    description?: string;
    content?: string;
    mediaUrl?: string;
    createdAt: string;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
    isLiked?: boolean;
    user: {
      id: number;
      username: string;
      displayName?: string;
      avatar?: string;
    };
    protectedWork?: {
      id: number;
      title: string;
      type: string;
    };
  };
  currentUserId?: number;
  onComment?: () => void;
}

export function PostCard({ post, currentUserId, onComment }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Optimistic like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        return apiRequest(`/api/posts/${post.id}/unlike`, { method: "DELETE" });
      } else {
        return apiRequest(`/api/posts/${post.id}/like`, { method: "POST" });
      }
    },
    onMutate: async () => {
      // Optimistic update
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);
    },
    onError: () => {
      // Revert optimistic update on error
      setLiked(liked);
      setLikesCount(post.likesCount || 0);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      return url;
    },
    onSuccess: () => {
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <motion.div 
      className="bg-card rounded-2xl p-6 space-y-4 hover:shadow-lg transition-all duration-300 border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={post.user.avatar ? buildMediaUrl(post.user.avatar) : undefined}
              alt={post.user.displayName || post.user.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {(post.user.displayName || post.user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-foreground">
              {post.user.displayName || post.user.username}
            </h4>
            <p className="text-sm text-muted-foreground">
              @{post.user.username} • {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Share Post</DropdownMenuItem>
            <DropdownMenuItem>Copy Link</DropdownMenuItem>
            {currentUserId === post.user.id && (
              <DropdownMenuItem className="text-destructive">Delete Post</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {post.title && (
          <h3 className="text-xl font-bold text-foreground">{post.title}</h3>
        )}
        {(post.description || post.content) && (
          <p className="text-foreground/80 leading-relaxed">
            {post.description || post.content}
          </p>
        )}
        
        {/* Protected Work Badge */}
        {post.protectedWork && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
            <Eye className="h-4 w-4" />
            <span>PROTECTED: {post.protectedWork.title}</span>
          </div>
        )}
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
          <img
            src={buildMediaUrl(post.mediaUrl)}
            alt={post.title || "Post media"}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <motion.button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ 
                scale: liked ? [1, 1.2, 1] : 1,
                color: liked ? "#FE3F5E" : undefined 
              }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-primary text-primary" : ""}`} />
            </motion.div>
            <span className="text-sm font-medium">{likesCount}</span>
          </motion.button>

          {/* Comment Button */}
          <button
            onClick={onComment}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.commentsCount || 0}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => shareMutation.mutate()}
            disabled={shareMutation.isPending}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Share className="h-5 w-5" />
            <span className="text-sm font-medium">{post.sharesCount || 0}</span>
          </button>
        </div>

        {/* AI Verified Badge */}
        <div className="text-xs text-muted-foreground bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
          ✓ Verified by AI
        </div>
      </div>
    </motion.div>
  );
}