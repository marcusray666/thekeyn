import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PostCard } from "@/components/enhanced/PostCard";
import { FeedSkeleton } from "@/components/skeletons/PostSkeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { Link } from "wouter";

interface Post {
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
}

const POSTS_PER_PAGE = 10;

export default function EnhancedFeed() {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<"following" | "trending">("following");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["/api/community-posts", feedType],
    queryFn: async ({ pageParam = 0 }) => {
      const endpoint = feedType === "trending" 
        ? `/api/community-posts/trending?offset=${pageParam}&limit=${POSTS_PER_PAGE}`
        : `/api/community-posts?offset=${pageParam}&limit=${POSTS_PER_PAGE}`;
      return apiRequest(endpoint);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.posts || lastPage.posts.length < POSTS_PER_PAGE) {
        return undefined;
      }
      return allPages.length * POSTS_PER_PAGE;
    },
    initialPageParam: 0,
  });

  const triggerRef = useInfiniteScroll({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: hasNextPage,
  });

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  // If user has no follows, automatically switch to trending
  const shouldShowTrending = feedType === "following" && allPosts.length === 0 && !isLoading;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Failed to load feed</h2>
          <p className="text-muted-foreground">Something went wrong. Please try again.</p>
          <Button onClick={() => refetch()} className="bg-primary hover:bg-primary/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            {feedType === "trending" ? "Trending" : "Following"}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant={feedType === "following" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedType("following")}
              className="rounded-full"
            >
              Following
            </Button>
            <Button
              variant={feedType === "trending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedType("trending")}
              className="rounded-full"
            >
              Trending
            </Button>
          </div>
        </div>

        {/* Create Post Button */}
        <Link href="/create-post">
          <Button className="bg-primary hover:bg-primary/90 rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </Link>
      </div>

      {/* Refresh Button */}
      <Button
        variant="outline"
        onClick={() => refetch()}
        disabled={isRefetching}
        className="w-full rounded-full"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
        {isRefetching ? "Refreshing..." : "Refresh Feed"}
      </Button>

      {/* Feed Content */}
      {isLoading ? (
        <FeedSkeleton count={3} />
      ) : shouldShowTrending ? (
        <div className="text-center space-y-6 py-12">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No posts from people you follow</h3>
            <p className="text-muted-foreground">Discover trending content while you build your network</p>
          </div>
          <Button
            onClick={() => setFeedType("trending")}
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            Explore Trending
          </Button>
        </div>
      ) : allPosts.length === 0 ? (
        <div className="text-center space-y-6 py-12">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No posts yet</h3>
            <p className="text-muted-foreground">
              {feedType === "trending" 
                ? "Be the first to share something amazing!" 
                : "Follow creators to see their posts here"
              }
            </p>
          </div>
          <Link href="/create-post">
            <Button className="bg-primary hover:bg-primary/90 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {allPosts.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onComment={() => {
                // TODO: Implement comment modal
                console.log("Open comment modal for post", post.id);
              }}
            />
          ))}

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div ref={triggerRef} className="py-4">
              {isFetchingNextPage ? (
                <FeedSkeleton count={2} />
              ) : (
                <div className="text-center">
                  <div className="h-8 w-8 mx-auto bg-muted animate-pulse rounded-full" />
                </div>
              )}
            </div>
          )}

          {/* End of Feed */}
          {!hasNextPage && allPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You're all caught up! 🎉</p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-4 rounded-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for New Posts
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}