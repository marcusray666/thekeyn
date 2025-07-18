import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  FileText, 
  Calendar, 
  Image, 
  Search,
  TrendingUp,
  Shield,
  AlertTriangle,
  Download,
  Share2,
  User,
  Settings,
  Upload,
  Eye,
  BarChart3,
  Edit,
  Trash2,
  Building2,
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { EditWorkDialog } from "@/components/ui/edit-work-dialog";
import { DeleteWorkDialog } from "@/components/ui/delete-work-dialog";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingTutorial } from "@/components/ui/onboarding-tutorial";
import { WelcomeModal } from "@/components/ui/welcome-modal";

interface Work {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  collaborators?: string[];
  originalName: string;
  createdAt: string | Date;
  certificateId: string;
  mimeType: string;
  fileSize: number;
}

interface Stats {
  protected: number;
  certificates: number;
  reports: number;
  totalViews: number;
  thisMonth: number;
  totalSize: string;
}

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [deletingWork, setDeletingWork] = useState<Work | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    showOnboarding, 
    showWelcome,
    completeOnboarding, 
    closeOnboarding,
    startOnboarding,
    closeWelcome,
    startTutorialFromWelcome
  } = useOnboarding();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentWorks, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-works"],
    enabled: isAuthenticated,
  });

  const { data: certificates, isLoading: certsLoading } = useQuery({
    queryKey: ["/api/certificates"],
    enabled: isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('/api/works', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-works'] });
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
    },
  });

  const filteredWorks = recentWorks?.filter((work: Work) =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (statsLoading || worksLoading || certsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LiquidGlassLoader size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  // Mock stats if not available
  const dashboardStats: Stats = stats || {
    protected: certificates?.length || 0,
    certificates: certificates?.length || 0,
    reports: 0,
    totalViews: Math.floor(Math.random() * 1000) + 100,
    thisMonth: certificates?.filter((cert: any) => 
      new Date(cert.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0,
    totalSize: certificates ? 
      formatFileSize(certificates.reduce((total: number, cert: any) => total + (cert.work?.fileSize || 0), 0)) :
      "0 MB"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 px-3 lg:px-6 py-3 lg:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.username || 'Creator'}!
              </h1>
              <p className="text-gray-400">
                Manage your protected works and track your creative portfolio
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <Button
                onClick={() => setLocation('/upload-work')}
                className="btn-glass px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-semibold text-white text-sm lg:text-base"
              >
                <Plus className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                <span className="hidden sm:inline">Protect New Work</span>
                <span className="sm:hidden">Upload</span>
              </Button>
              
              <Button
                onClick={() => setLocation('/certificates')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Eye className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">View</span>
              </Button>

              <Button
                onClick={() => setLocation('/copyright-registration')}
                variant="outline"
                className="border-blue-600 text-blue-300 hover:bg-blue-900 hover:bg-opacity-20 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Building2 className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                <span className="hidden lg:inline">Register Copyright</span>
                <span className="lg:hidden">Register</span>
              </Button>

              <Button
                onClick={() => setLocation('/nft-minting')}
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-900 hover:bg-opacity-20 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Sparkles className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                <span className="hidden lg:inline">Mint NFTs</span>
                <span className="lg:hidden">NFT</span>
              </Button>

              <Button
                onClick={() => setLocation('/social')}
                variant="outline"
                className="border-green-600 text-green-300 hover:bg-green-900 hover:bg-opacity-20 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Users className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                <span className="hidden lg:inline">Join Community</span>
                <span className="lg:hidden">Social</span>
              </Button>

              <Button
                onClick={startOnboarding}
                variant="outline"
                className="border-purple-600 text-purple-300 hover:bg-purple-900 hover:bg-opacity-20 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Settings className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                <span className="hidden sm:inline">Tutorial</span>
                <span className="sm:hidden">Help</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Account Section - Moved to top */}
        <GlassCard className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account
            </h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{user?.username || 'mark123'}</h3>
                <p className="text-gray-400">{user?.email || 'mark@icloud.ru'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400">Total Storage</p>
                <p className="text-white font-medium">{dashboardStats.totalSize}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Account Type</p>
                <p className="text-white font-medium">Creator</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setLocation('/settings')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                onClick={() => setLocation(`/showcase/${user?.username}`)}
                className="btn-glass"
              >
                <User className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Stats Overview - Removed "Certificates Issued" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="text-center py-6">
            <Shield className="mx-auto h-8 w-8 text-purple-400 mb-3" />
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {dashboardStats.protected}
            </div>
            <div className="text-gray-400 text-sm">Works Protected</div>
          </GlassCard>
          
          <GlassCard className="text-center py-6">
            <TrendingUp className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {dashboardStats.totalViews}
            </div>
            <div className="text-gray-400 text-sm">Total Views</div>
          </GlassCard>
          
          <GlassCard className="text-center py-6">
            <Calendar className="mx-auto h-8 w-8 text-orange-400 mb-3" />
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {dashboardStats.thisMonth}
            </div>
            <div className="text-gray-400 text-sm">This Month</div>
          </GlassCard>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Works */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Recent Works</h2>
                  <div className="flex gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search works..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 glass-morphism border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Button
                      onClick={() => setLocation('/bulk-operations')}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Bulk Actions
                    </Button>
                  </div>
                </div>

                {filteredWorks.length === 0 ? (
                  <div className="text-center py-12">
                    <Upload className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {searchTerm ? "No works found" : "No works yet"}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "Start protecting your creative work by uploading your first piece"}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setLocation('/upload-work')}
                        className="btn-glass px-6 py-3 rounded-2xl font-semibold text-white"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Upload Your First Work
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredWorks.slice(0, 5).map((work: Work) => (
                      <div 
                        key={work.id}
                        className="group flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/certificate/${work.certificateId}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            {work.mimeType.startsWith('image/') ? (
                              <Image className="h-6 w-6 text-gray-400" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-white">{work.title}</h3>
                            <div className="flex items-center text-sm text-gray-400 space-x-4">
                              <span>{formatDate(work.createdAt.toString())}</span>
                              <span>{formatFileSize(work.fileSize)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                            {work.certificateId.slice(-8)}
                          </div>
                          <Shield className="h-4 w-4 text-green-400" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWork(work);
                            }}
                            className="text-gray-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingWork(work);
                            }}
                            className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {filteredWorks.length > 5 && (
                      <Button
                        onClick={() => setLocation('/certificates')}
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                      >
                        View All {filteredWorks.length} Works
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions & Account */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => setLocation('/upload-work')}
                    className="w-full btn-glass py-3 rounded-2xl font-semibold text-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Work
                  </Button>
                  
                  <Button
                    onClick={() => setLocation('/certificates')}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Certificates
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // Generate and download portfolio as PDF
                      const portfolioData = {
                        user: user?.username,
                        works: filteredWorks.length,
                        certificates: dashboardStats.certificates,
                        totalSize: dashboardStats.totalSize
                      };
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `${user?.username}-portfolio.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                      
                      toast({
                        title: "Portfolio Downloaded",
                        description: "Your portfolio data has been exported successfully.",
                      });
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Portfolio
                  </Button>
                  
                  <Button
                    onClick={() => setLocation('/report-theft')}
                    variant="outline"
                    className="w-full border-red-600 text-red-400 hover:bg-red-900 hover:bg-opacity-20"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Theft
                  </Button>
                  
                  <Button
                    onClick={() => setLocation('/analytics')}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Account section removed - already at top */}

            {/* Recent Activity */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                
                <div className="space-y-3">
                  {certificates?.slice(0, 3).map((cert: any, index: number) => (
                    <div key={cert.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          Certificate generated for "{cert.work?.title}"
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(cert.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!certificates || certificates.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Edit and Delete Dialogs */}
      {editingWork && (
        <EditWorkDialog
          work={editingWork}
          open={!!editingWork}
          onOpenChange={(open) => !open && setEditingWork(null)}
        />
      )}

      {deletingWork && (
        <DeleteWorkDialog
          work={deletingWork}
          open={!!deletingWork}
          onOpenChange={(open) => !open && setDeletingWork(null)}
        />
      )}

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={closeWelcome}
        onStartTutorial={startTutorialFromWelcome}
        username={user?.username}
      />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  );
}