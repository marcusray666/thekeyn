import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Share2, Edit3, Grid3X3, List, MoreHorizontal, MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/premium/post-card";
import { useAuth } from "@/hooks/useAuth";

export default function UserProfile() {
  const [, params] = useRoute("/user/:userId");
  const userId = parseInt(params?.userId || "0");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user: currentUser } = useAuth();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: () => apiRequest(`/api/users/${userId}`),
    enabled: !!userId,
  });

  // Fetch user's community posts
  const { data: posts = [] } = useQuery({
    queryKey: ["/api/community/posts", "user", userId],
    queryFn: () => apiRequest(`/api/community/posts?userId=${userId}`),
    enabled: !!userId,
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats", userId],
    queryFn: () => apiRequest(`/api/user/stats?userId=${userId}`),
    enabled: !!userId,
  });

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/50 text-lg mb-4">User not found</div>
          <Link href="/">
            <Button className="glass-button">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="glass-panel p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FE3F5E] to-[#FFD200] rounded-full flex items-center justify-center relative">
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt={profile.username} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {profile.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {profile.displayName || profile.username}
                </h1>
                {profile.isVerified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-white/70 text-lg mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-white/80 mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-white/60">
                <span>{stats?.followersCount || 0} followers</span>
                <span>{stats?.followingCount || 0} following</span>
                <span>{posts.length} posts</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isOwnProfile && (
                <>
                  <Button className="glass-button">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                  <Link href={`/messages/new?user=${userId}`}>
                    <Button className="glass-button">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                </>
              )}
              
              {isOwnProfile && (
                <Link href="/profile/edit">
                  <Button className="glass-button">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              )}

              <Button className="glass-button p-3">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isOwnProfile ? 'My Works' : `${profile.displayName || profile.username}'s Works`}
            </h2>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <Grid3X3 className="h-4 w-4 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <List className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Posts Grid/List */}
          {posts.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid3X3 className="h-8 w-8 text-white/50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isOwnProfile ? 'No posts yet' : 'No posts to show'}
              </h3>
              <p className="text-white/60 mb-6">
                {isOwnProfile 
                  ? 'Start sharing your creative works with the community' 
                  : 'This user hasn\'t shared any posts yet'
                }
              </p>
              {isOwnProfile && (
                <Link href="/create-post">
                  <Button className="glass-button">Create Your First Post</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}