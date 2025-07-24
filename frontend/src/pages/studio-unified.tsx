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
  X
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
                  <Card key={certificate.id} className="glass-morphism p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                        <WorkImage
                          filename={certificate.work.filename}
                          mimeType={certificate.work.mimeType}
                          title={certificate.work.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white truncate">{certificate.work.title}</h3>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-100 ml-2">
                            <Shield className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {certificate.work.description || 'No description provided'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(certificate.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {certificate.work.mimeType.split('/')[0]}
                          </div>
                          <div className="flex items-center gap-1 text-green-400">
                            <Shield className="h-3 w-3" />
                            Blockchain Verified
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => handlePreviewWork(certificate)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 h-8 flex items-center gap-1"
                            title="Preview Work"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadCertificate(certificate)}
                            className="bg-purple-600 hover:bg-purple-700 px-3 py-2 h-8 flex items-center gap-1"
                            title="Download Certificate PDF"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLocation(`/certificate/${certificate.certificateId}`)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 h-8 flex items-center gap-1"
                            title="View Certificate"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {certificate.verificationProof && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(certificate.verificationProof!);
                                toast({
                                  title: "Verification Proof Copied",
                                  description: "Blockchain verification proof copied to clipboard.",
                                });
                              }}
                              className="border-green-600 text-green-300 hover:bg-green-700/20 px-3 py-2 h-8 flex items-center gap-1"
                              title="Copy Verification Proof"
                            >
                              <Shield className="h-3 w-3" />
                              Copy Hash
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(certificate.shareableLink, '_blank')}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 px-3 py-2 h-8 flex items-center gap-1"
                            title="Share Certificate"
                          >
                            <Share2 className="h-3 w-3" />
                            Share
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWork(certificate)}
                            className="border-red-600 text-red-300 hover:bg-red-700/20 px-3 py-2 h-8 flex items-center gap-1"
                            title="Delete Work"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
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

      {/* Work Preview Modal */}
      <AnimatePresence>
        {showPreview.show && showPreview.certificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="work-preview-modal fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 pt-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="work-preview-modal glass-morphism p-6 max-w-4xl max-h-[85vh] overflow-auto mx-4 relative mt-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              <Button
                onClick={() => setShowPreview({ show: false, certificate: null })}
                className="absolute top-4 right-4 bg-gray-600 hover:bg-gray-700 p-2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Work Preview</h2>
                <h3 className="text-lg text-gray-300">{showPreview.certificate.work.title}</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="space-y-4 flex flex-col items-center">
                  <div className="bg-gray-800/50 rounded-lg p-4 border-2 border-dashed border-gray-600 min-h-[300px] w-full flex items-center justify-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <WorkImage
                        filename={showPreview.certificate.work.filename}
                        mimeType={showPreview.certificate.work.mimeType}
                        title={showPreview.certificate.work.title}
                        className="max-w-full max-h-[400px] object-contain rounded-lg mx-auto"
                      />
                    </div>
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm text-gray-400">
                      Original Name: {showPreview.certificate.work.originalName}
                    </p>
                    <p className="text-sm text-gray-400">
                      File Type: {showPreview.certificate.work.mimeType}
                    </p>
                    <p className="text-sm text-gray-400">
                      Size: {(showPreview.certificate.work.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* File Information */}
                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <h4 className="text-lg font-semibold mb-3" style={{ color: '#1a1a1a' }}>File Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span style={{ color: '#6b7280' }}>Original Name:</span>
                        <p className="break-all" style={{ color: '#1a1a1a' }}>{showPreview.certificate.work.originalName}</p>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Type:</span>
                        <p style={{ color: '#1a1a1a' }}>{showPreview.certificate.work.mimeType}</p>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280' }}>Size:</span>
                        <p style={{ color: '#1a1a1a' }}>{(showPreview.certificate.work.fileSize / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>

                  <BlockchainVerificationGuide
                    blockchainHash={showPreview.certificate.work.blockchainHash || ''}
                    fileHash={showPreview.certificate.work.fileHash}
                    verificationProof={showPreview.certificate.verificationProof}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}