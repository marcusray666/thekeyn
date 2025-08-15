import { useQuery } from "@tanstack/react-query";
import { Plus, Share2, Download, Flag, Tag, Upload } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { RecommendationSidebar } from '@/components/RecommendationSidebar';

interface Work {
  id: number;
  title: string;
  creatorName: string;
  createdAt: string | Date;
  certificateId: string;
  mimeType: string;
}

interface Stats {
  protected: number;
  certificates: number;
  reports: number;
}

export default function Dashboard() {
  const { data: recentWorks, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/works/recent"],
    select: (data: Work[]) => data.slice(0, 3),
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const formatDate = (date: string | Date) => {
    const now = new Date();
    const workDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - workDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Registered today";
    if (diffDays === 2) return "Registered 1 day ago";
    if (diffDays <= 7) return `Registered ${diffDays - 1} days ago`;
    return `Registered ${workDate.toLocaleDateString()}`;
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🎨';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  const getGlassVariant = (index: number) => {
    const variants = ['purple', 'blue', 'cyan', 'emerald'] as const;
    return variants[index % variants.length];
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
    <div className="min-h-screen bg-white/95 relative overflow-hidden light-theme">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 pt-24">
        <GlassCard className="p-8 md:p-12 bg-white/80 backdrop-blur-xl border-gray-200/50">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            Your Creative Dashboard
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Works */}
            <div className="lg:col-span-2">
              <GlassCard className="bg-white/60 backdrop-blur-xl border-gray-200/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Recent Works</h3>
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="bg-gray-100/70 backdrop-blur-sm border border-gray-200/50 text-gray-600 hover:text-gray-800 hover:bg-gray-200/70">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentWorks && recentWorks.length > 0 ? (
                    recentWorks.map((work, index) => (
                      <GlassCard
                        key={work.id}
                        variant={getGlassVariant(index)}
                        className="p-4 flex items-center space-x-4"
                      >
                        <div className="text-4xl">
                          {getFileTypeIcon(work.mimeType)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{work.title}</h4>
                          <p className="text-sm text-gray-600">{formatDate(work.createdAt)}</p>
                          <p className="text-xs text-purple-600">ID: #{work.certificateId}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="bg-gray-100/70 backdrop-blur-sm border border-gray-200/50 text-cyan-600 hover:text-gray-800 hover:bg-gray-200/70">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="bg-gray-100/70 backdrop-blur-sm border border-gray-200/50 text-emerald-600 hover:text-gray-800 hover:bg-gray-200/70">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </GlassCard>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-700 mb-2">No works yet</h4>
                      <p className="text-gray-600 mb-4">Upload your first creative work to get started</p>
                      <Link href="/">
                        <Button className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Work
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
            
            {/* Stats & Actions */}
            <div className="space-y-6">
              {/* Stats */}
              <GlassCard className="bg-white/60 backdrop-blur-xl border-gray-200/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Works Protected</span>
                    <span className="text-2xl font-bold text-gray-800">
                      {stats?.protected || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Certificates Generated</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats?.certificates || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reports Sent</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {stats?.reports || 0}
                    </span>
                  </div>
                </div>
              </GlassCard>
              
              {/* Quick Actions */}
              <GlassCard className="bg-white/60 backdrop-blur-xl border-gray-200/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/upload-work">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500 rounded-xl py-3 px-4 font-medium transition-all">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Work
                    </Button>
                  </Link>
                  <Link href="/certificates">
                    <Button className="w-full bg-white/70 border border-gray-200/50 text-gray-700 hover:bg-gray-50 rounded-xl py-3 px-4 font-medium transition-all">
                      <Tag className="mr-2 h-4 w-4" />
                      View Certificates
                    </Button>
                  </Link>
                  <Button className="w-full bg-white/70 border border-gray-200/50 text-gray-700 hover:bg-gray-50 rounded-xl py-3 px-4 font-medium transition-all">
                    <Flag className="mr-2 h-4 w-4" />
                    File Report
                  </Button>
                </div>
              </GlassCard>
              
              {/* Blockchain Status */}
              <GlassCard className="bg-emerald-50/80 backdrop-blur-xl border-emerald-200/50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Blockchain Status</h3>
                </div>
                <p className="text-sm text-gray-700">
                  All works are securely anchored to the blockchain
                </p>
                <p className="text-xs text-gray-600 mt-2">Last sync: 2 minutes ago</p>
              </GlassCard>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* AI Recommendations Sidebar */}
      <div className="fixed right-4 top-24 hidden xl:block z-10">
        <RecommendationSidebar 
          userId="31" 
          currentPage="dashboard"
        />
      </div>
    </div>
  );
}
