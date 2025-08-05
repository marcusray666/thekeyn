import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, Shield, Image, Video, FileText, MoreHorizontal } from "lucide-react";

interface Post {
  id: string;
  username: string;
  content: string;
  image?: string;
  protected_work?: {
    title: string;
    type: string;
    certificate_id: string;
  };
  likes: number;
  comments: number;
  created_at: string;
  is_liked: boolean;
}

export default function FeedClean() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/social/feed"],
    queryFn: () => apiRequest("/api/social/feed"),
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      setNewPost("");
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      toast({
        title: "Post created",
        description: "Your post has been shared with the community",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/social/posts/${postId}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    },
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      createPostMutation.mutate(newPost.trim());
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "now";
  };

  const getProtectedWorkIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">Loading community feed...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground">Share your protected works and connect with creators</p>
        </div>

        {/* Create Post */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-sm text-muted-foreground">Share your latest work</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What are you creating today? Share your latest protected work or creative insights..."
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Image className="h-4 w-4 mr-2" />
                    Image
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    Protected Work
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!newPost.trim() || createPostMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your protected work with the community!
                </p>
                <Button onClick={() => document.querySelector('textarea')?.focus()}>
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post: Post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{post.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(post.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  {/* Post Content */}
                  <p className="text-foreground leading-relaxed">{post.content}</p>
                  
                  {/* Protected Work Preview */}
                  {post.protected_work && (
                    <div className="bg-muted rounded-lg p-4 border border-border">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          {getProtectedWorkIcon(post.protected_work.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{post.protected_work.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Protected Work • Certificate: {post.protected_work.certificate_id}
                          </p>
                        </div>
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  {/* Post Image */}
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePostMutation.mutate(post.id)}
                        className={`${
                          post.is_liked ? "text-red-500" : "text-muted-foreground"
                        } hover:text-red-500`}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? "fill-current" : ""}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}