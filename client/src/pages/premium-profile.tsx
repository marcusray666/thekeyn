import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Share2, Edit3, Grid3X3, List, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/premium/post-card";

export default function PremiumProfile() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: () => apiRequest("/api/user/profile"),
  });

  // Fetch user's works
  const { data: works = [] } = useQuery({
    queryKey: ["/api/works"],
    queryFn: () => apiRequest("/api/works"),
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: () => apiRequest("/api/user/stats"),
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

  return (
    <div className="min-h-screen bg-[#0F0F0F] pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="creator-avatar !w-24 !h-24">
              <div className="avatar-inner !text-2xl">
                {profile?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {profile?.displayName || profile?.username || "User"}
                  </h1>
                  <p className="text-white/70">@{profile?.username}</p>
                </div>
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  <Link href="/settings">
                    <Button className="glass-button">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button className="glass-button">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <p className="text-white/70 mb-6 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.worksProtected || 0}</div>
                  <div className="text-white/50 text-sm">Protected Works</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.certificates || 0}</div>
                  <div className="text-white/50 text-sm">Certificates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.followers || 0}</div>
                  <div className="text-white/50 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.communityLikes || 0}</div>
                  <div className="text-white/50 text-sm">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex space-x-6">
              <button className="text-white font-medium border-b-2 border-[#FE3F5E] pb-2">
                My Works
              </button>
              <button className="text-white/70 hover:text-white transition-colors pb-2">
                Liked
              </button>
              <button className="text-white/70 hover:text-white transition-colors pb-2">
                Saved
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {works.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {works.map((work) => (
                    <div key={work.id} className="aspect-square bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-4xl mb-2">
                            {work.mimeType?.startsWith('image/') ? '🎨' :
                             work.mimeType?.startsWith('audio/') ? '🎵' :
                             work.mimeType?.startsWith('video/') ? '🎬' : '📄'}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium truncate">{work.title || work.filename}</h3>
                          <p className="text-white/50 text-sm truncate">{work.creatorName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {works.map((work) => (
                    <PostCard
                      key={work.id}
                      post={{
                        ...work,
                        likesCount: Math.floor(Math.random() * 100),
                        commentsCount: Math.floor(Math.random() * 20)
                      }}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Edit3 className="h-12 w-12 text-white/50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Protected Works Yet</h3>
                <p className="text-white/50 mb-6 max-w-sm mx-auto">
                  Start protecting your digital creations to build your portfolio.
                </p>
                <Link href="/upload">
                  <Button className="accent-button">
                    Protect Your First Work
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}