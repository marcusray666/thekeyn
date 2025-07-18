import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Calendar, Upload, Award, Settings, Heart, MessageCircle, Share2, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/useAuth";

interface Work {
  id: number;
  title: string;
  creatorName: string;
  createdAt: string | Date;
  certificateId: string;
  mimeType: string;
  filename: string;
}

interface Stats {
  protected: number;
  certificates: number;
  reports: number;
  totalViews?: number;
  thisMonth?: number;
}

interface SocialPost {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  work: {
    id: number;
    title: string;
    description: string;
    filename: string;
    mimeType: string;
    certificateId: string;
  };
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export default function DashboardRedesigned() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: recentWorks, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/works/recent"],
    select: (data: Work[]) => data.slice(0, 3),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: socialFeed, isLoading: feedLoading } = useQuery({
    queryKey: ["/api/social/feed"],
    select: (data: SocialPost[]) => data.slice(0, 5),
  });

  const formatDate = (date: string | Date) => {
    const now = new Date();
    const workDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - workDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return `${diffDays}d ago`;
    return workDate.toLocaleDateString();
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🎨';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  if (worksLoading || statsLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8">
          <div className="animate-pulse text-center">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400">Manage your creative portfolio and connect with the community</p>
        </div>

        {/* Stats Cards - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={() => setLocation('/certificates')}
            className="h-auto p-0 bg-transparent hover:bg-transparent"
          >
            <GlassCard className="w-full p-6 text-center hover:scale-105 transition-transform">
              <div className="text-3xl font-bold gradient-text mb-2">
                {stats?.protected || 0}
              </div>
              <div className="text-gray-300 font-medium">Works Protected</div>
              <Award className="h-6 w-6 text-purple-400 mx-auto mt-2" />
            </GlassCard>
          </Button>

          <Button
            onClick={() => setLocation('/analytics')}
            className="h-auto p-0 bg-transparent hover:bg-transparent"
          >
            <GlassCard className="w-full p-6 text-center hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {stats?.totalViews || 0}
              </div>
              <div className="text-gray-300 font-medium">Total Views</div>
              <Eye className="h-6 w-6 text-emerald-400 mx-auto mt-2" />
            </GlassCard>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Feed - Left Side */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Community Feed</h3>
                <Link href="/social">
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    <Users className="h-5 w-5 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-6">
                {socialFeed && socialFeed.length > 0 ? (
                  socialFeed.map((post) => (
                    <div key={post.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                      {/* User Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {post.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{post.user.username}</p>
                          <p className="text-gray-400 text-sm">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>

                      {/* Artwork Preview */}
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {getFileTypeIcon(post.work.mimeType)}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{post.work.title}</h4>
                            <p className="text-gray-400 text-sm">{post.work.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Caption */}
                      {post.caption && (
                        <p className="text-gray-300 mb-3">{post.caption}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-400 mb-2">No posts yet</h4>
                    <p className="text-gray-500 mb-4">Follow creators to see their posts here</p>
                    <Link href="/social">
                      <Button className="btn-glass">
                        <Users className="mr-2 h-4 w-4" />
                        Explore Community
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Works */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Works</h3>
                <Link href="/certificates">
                  <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentWorks && recentWorks.length > 0 ? (
                  recentWorks.map((work) => (
                    <div
                      key={work.id}
                      onClick={() => setLocation(`/certificate/${work.certificateId}`)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <div className="text-2xl">
                        {getFileTypeIcon(work.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{work.title}</p>
                        <p className="text-gray-400 text-sm">{formatDate(work.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Upload className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">No works yet</p>
                    <Link href="/authenticated-upload">
                      <Button size="sm" className="btn-glass">
                        <Plus className="mr-2 h-4 w-4" />
                        Upload First Work
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </GlassCard>
            
            {/* Quick Actions */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/authenticated-upload">
                  <Button className="w-full glass-purple rounded-xl py-3 px-4 text-white font-medium hover:bg-opacity-80 transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload New Work
                  </Button>
                </Link>
                <Link href="/nft-simple">
                  <Button className="w-full glass-blue rounded-xl py-3 px-4 text-white font-medium hover:bg-opacity-80 transition-all">
                    <Award className="mr-2 h-4 w-4" />
                    Create NFT
                  </Button>
                </Link>
                <Link href="/social">
                  <Button className="w-full glass-cyan rounded-xl py-3 px-4 text-white font-medium hover:bg-opacity-80 transition-all">
                    <Users className="mr-2 h-4 w-4" />
                    Explore Community
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}