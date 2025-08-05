import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft,
  CheckSquare,
  Square,
  Download,
  Share2,
  Trash2,
  Tag,
  FolderOpen,
  Filter,
  SortAsc,
  Search,
  Eye,
  Copy,
  Archive,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Work {
  id: number;
  title: string;
  creatorName: string;
  createdAt: string;
  certificateId: string;
  mimeType: string;
  fileSize: number;
  selected?: boolean;
}

export default function BulkOperations() {
  const [, setLocation] = useLocation();
  const [selectedWorks, setSelectedWorks] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");
  const [selectAll, setSelectAll] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: works, isLoading } = useQuery({
    queryKey: ["/api/works"],
    enabled: isAuthenticated,
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, workIds }: { action: string; workIds: number[] }) => {
      // Simulate bulk action - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, action, count: workIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/works'] });
      setSelectedWorks(new Set());
      setSelectAll(false);
      
      toast({
        title: "Bulk operation completed",
        description: `Successfully ${data.action}ed ${data.count} works.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock works data for demonstration
  const mockWorks: Work[] = [
    { id: 1, title: "Digital Landscape #1", creatorName: user?.username || "Creator", createdAt: "2025-07-15", certificateId: "PRF-2025-ABC123", mimeType: "image/jpeg", fileSize: 2048000 },
    { id: 2, title: "Abstract Portrait Series", creatorName: user?.username || "Creator", createdAt: "2025-07-14", certificateId: "PRF-2025-DEF456", mimeType: "image/png", fileSize: 1536000 },
    { id: 3, title: "Urban Photography Collection", creatorName: user?.username || "Creator", createdAt: "2025-07-13", certificateId: "PRF-2025-GHI789", mimeType: "image/jpeg", fileSize: 3072000 },
    { id: 4, title: "Minimalist Design Pack", creatorName: user?.username || "Creator", createdAt: "2025-07-12", certificateId: "PRF-2025-JKL012", mimeType: "application/pdf", fileSize: 1024000 },
    { id: 5, title: "Nature Concept Art", creatorName: user?.username || "Creator", createdAt: "2025-07-11", certificateId: "PRF-2025-MNO345", mimeType: "image/jpeg", fileSize: 2560000 },
  ];

  const worksList = works || mockWorks;

  const filteredWorks = worksList.filter((work: Work) => {
    const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         work.certificateId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "images") return matchesSearch && work.mimeType.startsWith("image/");
    if (filterType === "documents") return matchesSearch && work.mimeType.includes("pdf");
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "size") return b.fileSize - a.fileSize;
    return 0;
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectWork = (workId: number) => {
    const newSelected = new Set(selectedWorks);
    if (newSelected.has(workId)) {
      newSelected.delete(workId);
    } else {
      newSelected.add(workId);
    }
    setSelectedWorks(newSelected);
    setSelectAll(newSelected.size === filteredWorks.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWorks(new Set());
    } else {
      setSelectedWorks(new Set(filteredWorks.map(work => work.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkAction = async (action: string) => {
    const workIds = Array.from(selectedWorks);
    if (workIds.length === 0) {
      toast({
        title: "No works selected",
        description: "Please select at least one work to perform this action.",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkActionMutation.mutateAsync({ action, workIds });
      toast({
        title: "Action completed",
        description: `Successfully performed ${action} on ${workIds.length} works.`,
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: `Failed to ${action} selected works.`,
        variant: "destructive",
      });
    }
  };

  const exportSelected = () => {
    const selectedWorksData = filteredWorks.filter(work => selectedWorks.has(work.id));
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalWorks: selectedWorksData.length,
      works: selectedWorksData.map(work => ({
        title: work.title,
        certificateId: work.certificateId,
        createdAt: work.createdAt,
        fileSize: work.fileSize,
        mimeType: work.mimeType
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `selected-works-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    toast({
      title: "Export completed",
      description: `Exported ${selectedWorksData.length} works successfully.`,
    });
  };

  if (isLoading) {
    return <LiquidGlassLoader size="xl" text="Loading works..." />;
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/5 via-transparent to-[#FFD200]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/10 rounded-full blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Bulk Operations</h1>
              <p className="text-gray-400">Manage multiple works efficiently</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {selectedWorks.size} of {filteredWorks.length} works selected
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search & Filter</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or certificate ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-morphism border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="glass-morphism border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="glass-morphism border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="size">File Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Bulk Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleBulkAction('download')}
                  disabled={selectedWorks.size === 0 || bulkActionMutation.isPending}
                  className="btn-glass text-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                
                <Button
                  onClick={() => handleBulkAction('share')}
                  disabled={selectedWorks.size === 0 || bulkActionMutation.isPending}
                  variant="outline"
                  className="border-gray-600 text-gray-300 text-sm"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                
                <Button
                  onClick={exportSelected}
                  disabled={selectedWorks.size === 0}
                  variant="outline"
                  className="border-gray-600 text-gray-300 text-sm"
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Export
                </Button>
                
                <Button
                  onClick={() => handleBulkAction('archive')}
                  disabled={selectedWorks.size === 0 || bulkActionMutation.isPending}
                  variant="outline"
                  className="border-gray-600 text-gray-300 text-sm"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Works List */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-600"
                />
                <h3 className="text-lg font-semibold text-white">
                  All Works ({filteredWorks.length})
                </h3>
              </div>
              
              <div className="text-sm text-gray-400">
                Total size: {formatFileSize(filteredWorks.reduce((total, work) => total + work.fileSize, 0))}
              </div>
            </div>

            {filteredWorks.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No works found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorks.map((work) => (
                  <div 
                    key={work.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                      selectedWorks.has(work.id) 
                        ? 'bg-purple-900/20 border-purple-600' 
                        : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedWorks.has(work.id)}
                      onCheckedChange={() => handleSelectWork(work.id)}
                      className="border-gray-600"
                    />
                    
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {work.mimeType.startsWith('image/') ? (
                        <Eye className="h-6 w-6 text-gray-400" />
                      ) : (
                        <FolderOpen className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{work.title}</h4>
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <span>{formatDate(work.createdAt)}</span>
                        <span>{formatFileSize(work.fileSize)}</span>
                        <span className="font-mono text-purple-400">{work.certificateId.slice(-8)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      <Button
                        onClick={() => setLocation(`/certificate/${work.certificateId}`)}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}