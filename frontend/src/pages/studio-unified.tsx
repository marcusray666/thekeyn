import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  Upload, 
  FileText, 
  Shield,
  Sparkles,
  CheckCircle,
  Clock,
  Loader2,
  Award,
  ExternalLink,
  Download,
  Share2,
  AlertCircle,
  Plus,
  ArrowRight,
  Zap,
  Crown,
  Search,
  Grid,
  List,
  Calendar,
  Image,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  X,
  Copy,
  Share
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { WorkImage } from "@/components/work-image";
import { BlockchainVerificationGuide } from "@/components/blockchain-verification-guide";

interface Work {
  id: number;
  title: string;
  description: string;
  filename: string;
  mimeType: string;
  certificateId: string;
  createdAt: string;
  blockchainHash?: string;
}

interface Certificate {
  id: number;
  workId: number;
  certificateId: string;
  shareableLink: string;
  qrCode: string;
  verificationProof?: string;
  verificationLevel?: string;
  createdAt: string;
  work: {
    id: number;
    title: string;
    description: string;
    creatorName: string;
    originalName: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    fileHash: string;
    blockchainHash: string;
    createdAt: string;
  };
}

type WorkflowStep = 'upload' | 'certificate' | 'nft' | 'complete';

export default function StudioUnified() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Tab state
  const [activeTab, setActiveTab] = useState('upload');
  
  // Upload workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workData, setWorkData] = useState({
    title: "",
    description: "",
    collaborators: [] as string[],
  });
  const [createdWork, setCreatedWork] = useState<Work | null>(null);
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [verificationProof, setVerificationProof] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Certificates view state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; certificate: Certificate | null }>({ show: false, certificate: null });
  const [showPreview, setShowPreview] = useState<{ show: boolean; certificate: Certificate | null }>({ show: false, certificate: null });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch subscription data
  const { data: subscriptionData, refetch: refetchSubscription } = useQuery({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
  });

  // Force subscription refresh when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Force refetching subscription data...');
      refetchSubscription();
      // Also invalidate cache
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  }, [isAuthenticated, refetchSubscription, queryClient]);

  // Fetch certificates
  const { data: certificates, isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/certificates"],
    enabled: isAuthenticated,
  });

  // Filter certificates for search
  const filteredCertificates = certificates?.filter((cert: Certificate) =>
    cert.work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.work.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      const { generateCertificatePDF } = await import('@/lib/certificateGenerator');
      await generateCertificatePDF({
        certificateId: certificate.certificateId,
        title: certificate.work.title,
        description: certificate.work.description || '',
        creatorName: certificate.work.creatorName,
        originalName: certificate.work.originalName,
        filename: certificate.work.filename,
        mimeType: certificate.work.mimeType,
        fileSize: certificate.work.fileSize,
        fileHash: certificate.work.fileHash,
        blockchainHash: certificate.work.blockchainHash,
        shareableLink: certificate.shareableLink,
        qrCode: certificate.qrCode,
        createdAt: certificate.createdAt
      });
      
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate PDF has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete work mutation
  const deleteMutation = useMutation({
    mutationFn: async (workId: number) => {
      return apiRequest(`/api/works/${workId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      setDeleteConfirm({ show: false, certificate: null });
      toast({
        title: "Work Deleted",
        description: "Your work and associated certificate have been permanently removed from both database and blockchain records.",
      });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete work. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle delete confirmation
  const handleDeleteWork = (certificate: Certificate) => {
    setDeleteConfirm({ show: true, certificate });
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteConfirm.certificate) {
      deleteMutation.mutate(deleteConfirm.certificate.workId);
    }
  };

  // Handle preview
  const handlePreviewWork = (certificate: Certificate) => {
    setShowPreview({ show: true, certificate });
  };

  // Upload work mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsProcessing(true);
      setProgress(25);
      return await apiRequest('/api/works', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (response) => {
      console.log('Upload response:', response);
      setCreatedWork(response.work);
      setCreatedCertificate(response.certificate);
      setVerificationProof(response.verificationProof);
      setProgress(100);
      setCurrentStep('complete');
      setIsProcessing(false);
      // Invalidate and refetch certificates
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      queryClient.refetchQueries({ queryKey: ['/api/certificates'] });
      // Switch to certificates tab to show the new certificate
      setActiveTab('certificates');
      // Reset the upload form after successful upload
      setTimeout(() => {
        handleStartOver();
      }, 3000); // Wait 3 seconds to show success state, then reset
      toast({
        title: "Work uploaded and verified!",
        description: "Your creative work has been secured with certificate and blockchain verification proof.",
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 2GB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !workData.title) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a title.",
        variant: "destructive",
      });
      return;
    }

    // Check upload limits - Pro tier has remainingUploads = -1 (unlimited)
    if (subscriptionData?.remainingUploads === 0) {
      toast({
        title: "Upload limit reached",
        description: "You've reached your upload limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', workData.title);
    formData.append('description', workData.description);
    formData.append('creatorName', user?.username || 'Anonymous');
    formData.append('collaborators', JSON.stringify(workData.collaborators));

    uploadMutation.mutate(formData);
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setWorkData({ title: "", description: "", collaborators: [] });
    setCreatedWork(null);
    setCreatedCertificate(null);
    setVerificationProof(null);
    setProgress(0);
    setIsProcessing(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-purple-700/20 via-blue-600/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-700/20 via-purple-600/10 to-transparent blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Creative Studio</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your work and manage your certified creations - all in one place
          </p>
        </motion.div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-morphism border-purple-500/30 mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="upload" className="flex items-center gap-2 flex-1">
              <Upload className="h-4 w-4" />
              Upload Work
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2 flex-1">
              <Award className="h-4 w-4" />
              My Certificates
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Subscription Usage Display */}
            {subscriptionData && (
              <Card className="glass-morphism p-6 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">
                      {subscriptionData.tier.charAt(0).toUpperCase() + subscriptionData.tier.slice(1)} Plan
                    </span>
                    {/* Debug info */}
                    <span className="text-xs text-gray-500">
                      (DB: {user?.subscriptionTier || 'unknown'})
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-100">
                    {subscriptionData.remainingUploads === -1 ? '∞' : subscriptionData.remainingUploads} remaining
                  </Badge>
                </div>
                
                {subscriptionData.uploadLimit !== -1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Monthly uploads</span>
                      <span>
                        {subscriptionData.uploadsUsed} / {subscriptionData.uploadLimit}
                      </span>
                    </div>
                    <Progress 
                      value={subscriptionData.uploadLimit > 0 ? (subscriptionData.uploadsUsed / subscriptionData.uploadLimit) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {subscriptionData.remainingUploads <= 1 && subscriptionData.tier === 'free' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-yellow-300 mb-2">
                      You're running low on uploads. Upgrade for unlimited access!
                    </p>
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <Link href="/subscription">
                        <Crown className="w-3 h-3 mr-1" />
                        Upgrade Now
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Upload Form */}
            <Card className="glass-morphism p-8 max-w-2xl mx-auto">
              <form onSubmit={handleUpload} className="space-y-6">
                {/* File Upload Area */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-white">
                    Select Your Creative Work
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 text-purple-400 mx-auto" />
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-gray-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-white">Drop your file here or click to browse</p>
                        <p className="text-gray-400 text-sm">
                          Supports images, audio, video, documents (max 500MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                  />
                </div>

                {/* Work Details */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      value={workData.title}
                      onChange={(e) => setWorkData(prev => ({ ...prev, title: e.target.value }))}
                      className="glass-input"
                      placeholder="Enter work title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={workData.description}
                      onChange={(e) => setWorkData(prev => ({ ...prev, description: e.target.value }))}
                      className="glass-input"
                      placeholder="Describe your work"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!selectedFile || !workData.title || uploadMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Certify Work
                    </>
                  )}
                </Button>
              </form>

              {/* Success Message */}
              {currentStep === 'complete' && createdWork && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Upload Complete!</h3>
                      <p className="text-gray-300">Your work has been certified and secured.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setActiveTab('certificates')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                    <Button
                      onClick={handleStartOver}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Upload Another
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            {/* Search and Controls */}
            <Card className="glass-morphism p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="glass-button"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="glass-button"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Certificates Display */}
            {certificatesLoading ? (
              <div className="flex justify-center py-12">
                <LiquidGlassLoader text="Loading your certificates..." />
              </div>
            ) : filteredCertificates.length === 0 ? (
              <Card className="glass-morphism p-12 text-center">
                <Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Certificates Yet</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'No certificates match your search.' : 'Upload your first work to get started!'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setActiveTab('upload')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload First Work
                  </Button>
                )}
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredCertificates.map((certificate: Certificate) => (
                  <motion.div
                    key={certificate.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Gradient Header */}
                    <div className="h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 relative">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          <Shield className="w-3 h-3 mr-1" />
                          Certified
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30">
                          <WorkImage
                            filename={certificate.work.filename}
                            mimeType={certificate.work.mimeType}
                            title={certificate.work.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                        {certificate.work.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                        {certificate.work.description || 'No description provided'}
                      </p>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between mb-6 text-xs">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(certificate.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <FileText className="w-3 h-3" />
                          {certificate.work.mimeType.split('/')[0]}
                        </div>
                        <div className="flex items-center gap-1 text-green-500">
                          <Shield className="w-3 h-3" />
                          Verified
                        </div>
                      </div>

                      {/* Primary Actions */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => handlePreviewWork(certificate)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => handleDownloadCertificate(certificate)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => setLocation(`/certificate/${certificate.certificateId}`)}
                        >
                          <Eye className="w-3 h-3 mr-2" />
                          View
                        </Button>
                        {certificate.verificationProof && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
                            onClick={() => {
                              navigator.clipboard.writeText(certificate.verificationProof!);
                              toast({
                                title: "Verification Proof Copied",
                                description: "Blockchain verification proof copied to clipboard.",
                              });
                            }}
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy Hash
                          </Button>
                        )}
                      </div>

                      {/* Final Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                          onClick={() => window.open(certificate.shareableLink, '_blank')}
                        >
                          <Share className="w-3 h-3 mr-2" />
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          onClick={() => handleDeleteWork(certificate)}
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <Card className="glass-morphism p-8 max-w-md mx-4">
              <div className="text-center">
                <LiquidGlassLoader text="Processing your work..." />
                <div className="mt-4">
                  <Progress value={progress} className="w-full" />
                  <p className="text-gray-400 mt-2">
                    {progress < 30 ? 'Uploading file...' : progress < 70 ? 'Generating certificate...' : 'Creating verification proof...'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-morphism p-6 max-w-md mx-4 border border-red-500/30"
            >
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Delete Work</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete "{deleteConfirm.certificate?.work.title}"? This will permanently remove the work, certificate, and blockchain records. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm({ show: false, certificate: null })}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Permanently
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Work Preview Modal - Cute Pink Theme */}
      <AnimatePresence>
        {showPreview.show && showPreview.certificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pink-900/20 backdrop-blur-md z-[9999] flex items-center justify-center p-4 pt-20"
            onClick={() => setShowPreview({ show: false, certificate: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cute Pink Modal */}
              <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-gray-900 dark:via-pink-900/20 dark:to-gray-800 rounded-3xl shadow-2xl border border-pink-200/50 dark:border-pink-500/20 p-8 relative overflow-hidden">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-rose-300 to-pink-400"></div>
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-200/20 rounded-full blur-xl"></div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview({ show: false, certificate: null })}
                  className="absolute top-6 right-6 h-10 w-10 p-0 text-pink-400 hover:text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-full z-10"
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-200 to-rose-200 dark:from-pink-800/30 dark:to-rose-800/30 rounded-full mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-md">
                      <WorkImage
                        filename={showPreview.certificate.work.filename}
                        mimeType={showPreview.certificate.work.mimeType}
                        title={showPreview.certificate.work.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-pink-900 dark:text-pink-100">Work Preview</h2>
                  </div>
                  <h3 className="text-2xl font-bold text-pink-800 dark:text-pink-200 mb-2">{showPreview.certificate.work.title}</h3>
                  <p className="text-pink-600 dark:text-pink-300">{showPreview.certificate.work.description || 'No description provided'}</p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[60vh] overflow-auto">
                  
                  {/* Image Preview */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-pink-500/20">
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 min-h-[300px] flex items-center justify-center border-2 border-dashed border-pink-300 dark:border-pink-500/30">
                        <WorkImage
                          filename={showPreview.certificate.work.filename}
                          mimeType={showPreview.certificate.work.mimeType}
                          title={showPreview.certificate.work.title}
                          className="max-w-full max-h-[250px] object-contain rounded-lg shadow-md"
                        />
                      </div>
                      
                      {/* File Details */}
                      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                          <p className="text-pink-500 dark:text-pink-400 font-medium mb-1">Original Name</p>
                          <p className="text-pink-800 dark:text-pink-200 text-xs break-all font-mono">{showPreview.certificate.work.originalName}</p>
                        </div>
                        <div className="text-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                          <p className="text-rose-500 dark:text-rose-400 font-medium mb-1">File Type</p>
                          <p className="text-rose-800 dark:text-rose-200 text-xs font-mono">{showPreview.certificate.work.mimeType}</p>
                        </div>
                        <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                          <p className="text-pink-500 dark:text-pink-400 font-medium mb-1">File Size</p>
                          <p className="text-pink-800 dark:text-pink-200 text-xs font-mono">{(showPreview.certificate.work.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Sidebar */}
                  <div className="space-y-6">
                    
                    {/* File Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-pink-500/20">
                      <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200 mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                        File Information
                      </h4>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <span className="text-pink-600 dark:text-pink-400 font-medium">Original Name:</span>
                          <span className="text-pink-900 dark:text-pink-100 font-mono text-xs break-all max-w-[60%] text-right">{showPreview.certificate.work.originalName}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                          <span className="text-rose-600 dark:text-rose-400 font-medium">Type:</span>
                          <span className="text-rose-900 dark:text-rose-100">{showPreview.certificate.work.mimeType}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <span className="text-pink-600 dark:text-pink-400 font-medium">Size:</span>
                          <span className="text-pink-900 dark:text-pink-100">{(showPreview.certificate.work.fileSize / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Verification Guide */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-pink-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-pink-800 dark:text-pink-200">Blockchain Verification Guide</h4>
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-1 mb-6 p-1 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                        <button className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-sm">
                          How It Works
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs font-medium text-pink-600 dark:text-pink-300 hover:bg-pink-200/50 dark:hover:bg-pink-800/30 rounded-lg transition-colors">
                          Verify Your Proof
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs font-medium text-pink-600 dark:text-pink-300 hover:bg-pink-200/50 dark:hover:bg-pink-800/30 rounded-lg transition-colors">
                          Verification Tools
                        </button>
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                          <h5 className="text-blue-700 dark:text-blue-300 font-semibold mb-2 text-sm">Real Blockchain Timestamping</h5>
                          <p className="text-blue-600 dark:text-blue-400 text-xs mb-3">
                            Your work is protected using <strong>OpenTimestamps</strong> - a real blockchain timestamping service that creates verifiable proofs on Bitcoin and Ethereum blockchains.
                          </p>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-blue-700 dark:text-blue-300">Your file's SHA-256 hash:</span>
                                <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-xs font-mono break-all">
                                  <span className="text-purple-600 dark:text-purple-400">{showPreview.certificate.work.fileHash}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span className="text-blue-700 dark:text-blue-300">OpenTimestamps proof anchored to Bitcoin/Ethereum blockchain</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}