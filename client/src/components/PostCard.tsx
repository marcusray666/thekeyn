import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  Clock,
  Users,
  BookmarkPlus,
  Flag,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CommentsSection from "./CommentsSection";
import FollowButton from "./FollowButton";
import { AudioPlayer } from "./AudioPlayer";
import { Link } from "wouter";

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
  isBookmarked?: boolean;
  tags?: string[];
  certificateId?: string;
  isProtected?: boolean;
}

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwner = user?.id === post.userId;

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Toggle like/unlike based on current state
      const method = post.isLiked ? 'DELETE' : 'POST';
      return await apiRequest(`/api/social/posts/${postId}/like`, {
        method: method,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      toast({
        title: post.isLiked ? "Unliked" : "Liked!",
        description: post.isLiked ? "Removed from your likes" : "Added to your likes",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const bookmarkPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/social/posts/${postId}/bookmark`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      toast({
        title: post.isBookmarked ? "Bookmark removed" : "Bookmarked!",
        description: post.isBookmarked ? "Removed from your bookmarks" : "Added to your bookmarks",
      });
    },
  });

  const sharePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/social/posts/${postId}/share`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts'] });
      toast({
        title: "Shared!",
        description: "Post shared with your followers",
      });
    },
  });

  const handleLike = () => {
    likePostMutation.mutate(post.id);
  };

  const handleBookmark = () => {
    bookmarkPostMutation.mutate(post.id);
  };

  const handleShare = () => {
    sharePostMutation.mutate(post.id);
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "We'll review this content and take appropriate action",
    });
  };

  const formatContent = (content: string) => {
    if (content.length <= 200 || isExpanded) {
      return content;
    }
    return content.substring(0, 200) + "...";
  };

  const needsExpansion = post.content.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href={`/profile/${post.username}`}>
                <Avatar className="w-12 h-12 border-2 border-purple-500/20 hover:scale-105 transition-transform cursor-pointer">
                  <AvatarImage src={post.userImage} alt={post.username} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {post.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${post.username}`}>
                    <h4 className="font-semibold text-white hover:text-purple-300 transition-colors cursor-pointer">
                      {post.username}
                    </h4>
                  </Link>
                  {post.isProtected && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      Protected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span className="ml-2 text-xs">(edited)</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isOwner && <FollowButton userId={post.userId} />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 !bg-gray-900 !text-white !border-gray-600 shadow-2xl"
                  style={{
                    backgroundColor: 'rgb(17, 24, 39)',
                    color: 'white',
                    borderColor: 'rgb(75, 85, 99)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  {isOwner ? (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onEdit?.(post)} 
                        className="!text-gray-200 hover:!bg-purple-600/30 hover:!text-white focus:!bg-purple-600/30 focus:!text-white"
                        style={{ color: 'rgb(229, 231, 235)' }}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(post.id)} 
                        className="!text-red-400 hover:!bg-red-500/20 hover:!text-red-300 focus:!bg-red-500/20 focus:!text-red-300"
                        style={{ color: 'rgb(248, 113, 113)' }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Post
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem 
                        onClick={handleBookmark} 
                        className="!text-gray-200 hover:!bg-purple-600/30 hover:!text-white focus:!bg-purple-600/30 focus:!text-white"
                        style={{ color: 'rgb(229, 231, 235)' }}
                      >
                        <BookmarkPlus className="mr-2 h-4 w-4" />
                        {post.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleReport} 
                        className="!text-yellow-400 hover:!bg-yellow-500/20 hover:!text-yellow-300 focus:!bg-yellow-500/20 focus:!text-yellow-300"
                        style={{ color: 'rgb(251, 191, 36)' }}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report Content
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {formatContent(post.content)}
            </p>
            {needsExpansion && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-purple-400 hover:text-purple-300 p-0 h-auto mt-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Media Content */}
          {post.imageUrl && post.fileType === "image" && (
            <div className="mb-4">
              <img 
                src={`/api/files/${post.imageUrl}`} 
                alt="Post content"
                className="w-full max-h-96 object-cover rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors"
                onError={(e) => {
                  console.error("Image failed to load:", post.imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {post.fileType === "audio" && post.imageUrl && (
            <div className="mb-4">
              <AudioPlayer 
                src={`/api/files/${post.imageUrl}`}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20"
              />
            </div>
          )}

          {post.fileType === "video" && post.imageUrl && (
            <div className="mb-4">
              <video 
                src={`/api/files/${post.imageUrl}`}
                controls
                className="w-full max-h-96 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors bg-gradient-to-r from-blue-500/10 to-green-500/10"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {post.fileType === "document" && post.imageUrl && (
            <div className="mb-4">
              <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-colors">
                <div className="flex items-center space-x-4">
                  <FileText className="h-12 w-12 text-orange-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">Document attached</p>
                    <p className="text-gray-400 text-sm mb-2">
                      {post.imageUrl.endsWith('.pdf') ? 'PDF Document' : 'Document'}
                    </p>
                    <div className="flex gap-2">
                      <a 
                        href={`/api/files/${post.imageUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 hover:text-orange-200 rounded text-sm transition-colors"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </a>
                      {post.imageUrl.endsWith('.pdf') && (
                        <a 
                          href={`/api/files/${post.imageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200 rounded text-sm transition-colors"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Open PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Badge */}
          {post.certificateId && (
            <div className="mb-4">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Certificate: {post.certificateId}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-900/30 text-purple-300 hover:bg-purple-900/50 transition-colors cursor-pointer">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likePostMutation.isPending}
                className={`flex items-center space-x-2 ${
                  post.isLiked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-red-300"
                } transition-colors`}
              >
                <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-300 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                disabled={sharePostMutation.isPending}
                className="flex items-center space-x-2 text-gray-400 hover:text-green-300 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>{post.shares}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                disabled={bookmarkPostMutation.isPending}
                className={`${
                  post.isBookmarked ? "text-yellow-400 hover:text-yellow-300" : "text-gray-400 hover:text-yellow-300"
                } transition-colors`}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <CommentsSection postId={post.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}