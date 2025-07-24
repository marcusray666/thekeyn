import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MoreHorizontal, Reply, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: number;
  postId: string;
  userId: number;
  parentId?: number;
  content: string;
  mentionedUsers: string[];
  likes: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  userImage?: string;
}

interface CommentsSectionProps {
  postId: string;
  currentUserId?: number;
}

export default function CommentsSection({ postId, currentUserId }: CommentsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: [`/api/social/posts/${postId}/comments`],
    enabled: !!postId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string; parentId?: number }) => {
      return await apiRequest(`/api/social/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify(commentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
      setNewComment("");
      setReplyingTo(null);
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      return await apiRequest(`/api/social/comments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
      setEditingComment(null);
      setEditContent("");
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await apiRequest(`/api/social/comments/${commentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await apiRequest(`/api/social/comments/${commentId}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/posts/${postId}/comments`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (parentId?: number) => {
    const content = parentId ? newComment : newComment;
    if (!content.trim()) return;

    createCommentMutation.mutate({
      content: content.trim(),
      parentId,
    });
  };

  const handleUpdateComment = (commentId: number) => {
    if (!editContent.trim()) return;

    updateCommentMutation.mutate({
      id: commentId,
      content: editContent.trim(),
    });
  };

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleLikeComment = (commentId: number) => {
    likeCommentMutation.mutate(commentId);
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`backdrop-blur-xl bg-white/5 border-white/10 ${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.userImage} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                {comment.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{comment.username}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {currentUserId === comment.userId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-xl bg-black/80 border-white/10">
                <DropdownMenuItem onClick={() => startEditing(comment)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400 resize-none"
              placeholder="Edit your comment..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleUpdateComment(comment.id)}
                disabled={updateCommentMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent("");
                }}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed">
            {comment.content}
          </p>
        )}
        
        {comment.mentionedUsers && comment.mentionedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {comment.mentionedUsers.map((user, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                @{user}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLikeComment(comment.id)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-2"
          >
            <Heart className="h-4 w-4 mr-1" />
            {comment.likes || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-2"
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
        </div>
      </CardFooter>
      
      {replyingTo === comment.id && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400 resize-none"
              placeholder="Write a reply..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitComment(comment.id)}
                disabled={createCommentMutation.isPending || !newComment.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyingTo(null)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="backdrop-blur-xl bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                <div className="space-y-1">
                  <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
                  <div className="w-16 h-2 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-3 bg-white/10 rounded animate-pulse" />
                <div className="w-3/4 h-3 bg-white/10 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentUserId && (
        <Card className="backdrop-blur-xl bg-white/5 border-white/10">
          <CardHeader>
            <h3 className="font-semibold text-white">Add a comment</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-gray-400 resize-none"
              placeholder="Share your thoughts..."
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => handleSubmitComment()}
                disabled={createCommentMutation.isPending || !newComment.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: Comment) => renderComment(comment))}
        </div>
      ) : (
        <Card className="backdrop-blur-xl bg-white/5 border-white/10">
          <CardContent className="py-8 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}