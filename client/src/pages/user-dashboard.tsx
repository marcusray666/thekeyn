import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { SimpleBackgroundEngine } from '@/components/SimpleBackgroundEngine';
import { 
  Upload, Plus, Users, Settings, Sparkles, 
  BarChart3, Shield, Image, 
  FileText, Search,
  Download, AlertTriangle
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

interface Work {
  id: string;
  title: string;
  description: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  certificateId: string;
  creator: string;
  createdAt: Date;
  views: number;
}



export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with real API calls
  const { data: works = [] } = useQuery<Work[]>({
    queryKey: ['/api/works'],
  });

  const filteredWorks = works.filter(work =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white/95 relative light-theme">
      <SimpleBackgroundEngine>
        <div></div>
      </SimpleBackgroundEngine>
      <div className="max-w-7xl mx-auto p-4 lg:p-8 relative z-10 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Creator Dashboard
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl max-w-3xl">
            Manage your protected works, track analytics, and grow your creative presence.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 lg:gap-4">
            <Button
              onClick={() => setLocation('/upload-work')}
              className="btn-glass px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium rounded-2xl"
            >
              <Upload className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
              <span className="hidden lg:inline">Upload New Work</span>
              <span className="lg:hidden">Upload</span>
            </Button>

            <Button
              onClick={() => setLocation('/nft-studio')}
              variant="outline"
              className="border-purple-500/30 text-gray-700 hover:bg-purple-50 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-white/80 backdrop-blur-xl"
            >
              <Sparkles className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
              <span className="hidden lg:inline">Mint NFTs</span>
              <span className="lg:hidden">NFT</span>
            </Button>

            <Button
              onClick={() => setLocation('/social')}
              variant="outline"
              className="border-green-500/30 text-gray-700 hover:bg-green-50 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-white/80 backdrop-blur-xl"
            >
              <Users className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
              <span className="hidden lg:inline">Join Community</span>
              <span className="lg:hidden">Social</span>
            </Button>

            <Button
              onClick={() => setLocation('/settings')}
              variant="outline"
              className="border-purple-500/30 text-gray-700 hover:bg-purple-50 px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base bg-white/80 backdrop-blur-xl"
            >
              <Settings className="mr-1 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Works - Smaller and above Quick Actions */}
          <div>
            <GlassCard className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Works</h2>
                  <div className="flex gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search works..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/70 border-gray-200/50 text-gray-800 placeholder-gray-400"
                      />
                    </div>
                    <Button
                      onClick={() => setLocation('/bulk-operations')}
                      variant="outline"
                      className="border-gray-300/50 text-gray-600 hover:bg-gray-50 bg-white/70"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Bulk Actions
                    </Button>
                  </div>
                </div>

                {filteredWorks.length === 0 ? (
                  <div className="text-center py-12">
                    <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {searchTerm ? "No works found" : "No works yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "Start protecting your creative work by uploading your first piece"}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setLocation('/upload-work')}
                        className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500 px-6 py-3 rounded-2xl font-semibold"
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
                        className="group flex items-center justify-between p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-colors cursor-pointer border border-gray-200/30"
                        onClick={() => setLocation(`/certificate/${work.certificateId}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {work.mimeType.startsWith('image/') ? (
                              <Image className="h-6 w-6 text-gray-600" />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-800">{work.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span>{formatDate(work.createdAt.toString())}</span>
                              <span>{formatFileSize(work.fileSize)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-xs font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                            {work.certificateId.slice(-8)}
                          </div>
                          <Shield className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    ))}

                    {filteredWorks.length > 5 && (
                      <Button
                        onClick={() => setLocation('/my-certificates')}
                        variant="outline"
                        className="w-full border-gray-300/50 text-gray-600 hover:bg-gray-50 bg-white/70 mt-4"
                      >
                        View All {filteredWorks.length} Works
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div>
            <GlassCard className="bg-white/80 backdrop-blur-xl border-gray-200/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <Button
                    onClick={() => setLocation('/upload-work')}
                    className="w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:from-pink-600 hover:to-yellow-500 justify-start py-4 text-lg"
                  >
                    <Upload className="mr-3 h-5 w-5" />
                    Upload New Work
                  </Button>

                  <Button
                    onClick={() => setLocation('/my-certificates')}
                    variant="outline"
                    className="w-full border-gray-300/50 text-gray-600 hover:bg-gray-50 bg-white/70 justify-start py-4 text-lg"
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    Manage Certificates
                  </Button>

                  <Button
                    onClick={() => setLocation('/export-portfolio')}
                    variant="outline"
                    className="w-full border-gray-300/50 text-gray-600 hover:bg-gray-50 bg-white/70 justify-start py-4 text-lg"
                  >
                    <Download className="mr-3 h-5 w-5" />
                    Export Portfolio
                  </Button>

                  <Button
                    onClick={() => setLocation('/report-theft')}
                    variant="outline"
                    className="w-full border-red-300/50 text-red-600 hover:bg-red-50 bg-white/70 justify-start py-4 text-lg"
                  >
                    <AlertTriangle className="mr-3 h-5 w-5" />
                    Report Theft
                  </Button>

                  <Button
                    onClick={() => setLocation('/analytics')}
                    variant="outline"
                    className="w-full border-gray-300/50 text-gray-600 hover:bg-gray-50 bg-white/70 justify-start py-4 text-lg"
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}