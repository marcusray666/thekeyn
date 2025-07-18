import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
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
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";

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
  id: string;
  workId: number;
  certificateId: string;
  pdfPath?: string;
  shareableLink?: string;
  createdAt: string;
}

type WorkflowStep = 'upload' | 'certificate' | 'nft' | 'complete';

export default function Studio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workData, setWorkData] = useState({
    title: "",
    description: "",
    collaborators: [] as string[],
  });
  const [createdWork, setCreatedWork] = useState<Work | null>(null);
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch subscription data
  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/subscription"],
  });

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
    onSuccess: (data) => {
      setCreatedWork(data);
      setProgress(50);
      setCurrentStep('certificate');
      toast({
        title: "Work uploaded successfully!",
        description: "Your creative work has been secured and timestamped.",
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

  // Generate certificate mutation
  const certificateMutation = useMutation({
    mutationFn: async (workId: number) => {
      setProgress(75);
      return await apiRequest(`/api/works/${workId}/certificate`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      setCreatedCertificate(data);
      setProgress(90);
      setCurrentStep('nft');
      toast({
        title: "Certificate generated!",
        description: "Your legal proof of ownership is ready for download.",
      });
    },
    onError: (error) => {
      toast({
        title: "Certificate generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // NFT minting mutation
  const nftMutation = useMutation({
    mutationFn: async (workId: number) => {
      // Step 1: Upload to IPFS
      await apiRequest(`/api/blockchain/upload-to-ipfs/${workId}`, {
        method: 'POST',
      });

      // Step 2: Generate metadata
      await apiRequest(`/api/blockchain/generate-metadata/${workId}`, {
        method: 'POST',
        body: JSON.stringify({
          externalUrl: `https://loggin.app/certificate/${createdWork?.certificateId}`,
        }),
      });

      // Step 3: Mint NFT
      return await apiRequest('/api/blockchain/mint-nft', {
        method: 'POST',
        body: JSON.stringify({
          workId,
          network: 'polygon',
          royaltyPercentage: 10,
        }),
      });
    },
    onSuccess: (data) => {
      setProgress(100);
      setCurrentStep('complete');
      setIsProcessing(false);
      toast({
        title: "NFT created successfully! 🎉",
        description: `Your artwork is now a blockchain-verified NFT. Token ID: ${data.mintResult.tokenId}`,
      });
    },
    onError: (error) => {
      toast({
        title: "NFT creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 500MB.",
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
        description: "Please select a file and provide a title.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', workData.title);
    formData.append('description', workData.description);
    formData.append('collaborators', JSON.stringify(workData.collaborators));
    formData.append('creatorName', user?.username || 'Anonymous');

    uploadMutation.mutate(formData);
  };

  const handleGenerateCertificate = () => {
    if (createdWork) {
      certificateMutation.mutate(createdWork.id);
    }
  };

  const handleMintNFT = () => {
    if (createdWork) {
      nftMutation.mutate(createdWork.id);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setWorkData({ title: "", description: "", collaborators: [] });
    setCreatedWork(null);
    setCreatedCertificate(null);
    setProgress(0);
    setIsProcessing(false);
  };

  const downloadCertificate = () => {
    if (createdCertificate?.pdfPath) {
      window.open(createdCertificate.pdfPath, '_blank');
    }
  };

  const stepConfig = {
    upload: { icon: Upload, title: "Upload Your Work", color: "purple" },
    certificate: { icon: Shield, title: "Generate Certificate", color: "blue" },
    nft: { icon: Sparkles, title: "Create NFT", color: "cyan" },
    complete: { icon: CheckCircle, title: "Complete", color: "emerald" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Creative Studio</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your work, generate legal certificates, and mint NFTs - all in one place
          </p>
          
          {/* Subscription Usage Display */}
          {subscriptionData && (
            <div className="mt-6 max-w-md mx-auto">
              <GlassCard>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">
                        {subscriptionData.limits.tier.charAt(0).toUpperCase() + subscriptionData.limits.tier.slice(1)} Plan
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-100">
                      {subscriptionData.usage.uploads.remainingUploads === Infinity ? '∞' : subscriptionData.usage.uploads.remainingUploads} remaining
                    </Badge>
                  </div>
                  
                  {subscriptionData.usage.uploads.limit !== -1 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>Monthly uploads</span>
                        <span>
                          {subscriptionData.usage.uploads.limit - subscriptionData.usage.uploads.remainingUploads} / {subscriptionData.usage.uploads.limit}
                        </span>
                      </div>
                      <Progress 
                        value={((subscriptionData.usage.uploads.limit - subscriptionData.usage.uploads.remainingUploads) / subscriptionData.usage.uploads.limit) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {subscriptionData.usage.uploads.remainingUploads <= 1 && subscriptionData.limits.tier === 'free' && (
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
                </div>
              </GlassCard>
            </div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                {Object.entries(stepConfig).map(([step, config], index) => {
                  const isActive = currentStep === step;
                  const isCompleted = ['upload', 'certificate', 'nft'].indexOf(currentStep) > index || currentStep === 'complete';
                  const StepIcon = config.icon;
                  
                  return (
                    <div key={step} className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-emerald-600 text-white' 
                          : isActive 
                            ? `bg-${config.color}-600 text-white`
                            : 'bg-gray-600 text-gray-400'
                      }`}>
                        <StepIcon className="h-6 w-6" />
                      </div>
                      {index < 3 && (
                        <div className={`w-16 h-1 mx-2 ${
                          isCompleted ? 'bg-emerald-600' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-center text-gray-400 mt-2">
                {stepConfig[currentStep]?.title}
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'upload' && (
              <GlassCard>
                <div className="p-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <Button
                      type="submit"
                      disabled={!selectedFile || !workData.title || uploadMutation.isPending}
                      className="w-full btn-glass py-3 text-lg"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-5 w-5" />
                          Upload & Secure Work
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </GlassCard>
            )}

            {currentStep === 'certificate' && createdWork && (
              <GlassCard>
                <div className="p-8 text-center">
                  <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Generate Legal Certificate
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Create a professional certificate with blockchain verification for "{createdWork.title}"
                  </p>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <div className="text-left space-y-2">
                      <p><span className="text-gray-400">Work ID:</span> <span className="text-white">{createdWork.certificateId}</span></p>
                      <p><span className="text-gray-400">File:</span> <span className="text-white">{createdWork.filename}</span></p>
                      <p><span className="text-gray-400">Created:</span> <span className="text-white">{new Date(createdWork.createdAt).toLocaleDateString()}</span></p>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateCertificate}
                    disabled={certificateMutation.isPending}
                    className="btn-glass px-8 py-3 text-lg"
                  >
                    {certificateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Certificate...
                      </>
                    ) : (
                      <>
                        <Award className="mr-2 h-5 w-5" />
                        Generate Certificate
                      </>
                    )}
                  </Button>
                </div>
              </GlassCard>
            )}

            {currentStep === 'nft' && createdWork && createdCertificate && (
              <GlassCard>
                <div className="p-8 text-center">
                  <Sparkles className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Create NFT
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Transform your protected work into a blockchain NFT - no technical knowledge required!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Certificate Ready</h4>
                      <Button
                        onClick={downloadCertificate}
                        variant="outline"
                        size="sm"
                        className="glass-button"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">NFT Details</h4>
                      <p className="text-gray-400 text-sm">Network: Polygon (Low fees)</p>
                      <p className="text-gray-400 text-sm">Royalty: 10%</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleMintNFT}
                    disabled={nftMutation.isPending}
                    className="btn-glass px-8 py-3 text-lg"
                  >
                    {nftMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating NFT...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Create NFT
                      </>
                    )}
                  </Button>
                  
                  <p className="text-gray-500 text-sm mt-4">
                    Skip this step if you only need the certificate
                  </p>
                  <Button
                    onClick={() => setCurrentStep('complete')}
                    variant="ghost"
                    className="mt-2 text-gray-400 hover:text-white"
                  >
                    Skip NFT Creation
                  </Button>
                </div>
              </GlassCard>
            )}

            {currentStep === 'complete' && (
              <GlassCard>
                <div className="p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    All Done! 🎉
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Your creative work is now fully protected and ready to share with the world.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold">Protected</h4>
                      <p className="text-gray-400 text-sm">Blockchain verified</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold">Certified</h4>
                      <p className="text-gray-400 text-sm">Legal proof ready</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <Sparkles className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold">NFT Ready</h4>
                      <p className="text-gray-400 text-sm">Blockchain asset</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={downloadCertificate}
                      className="btn-glass"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Certificate
                    </Button>
                    <Button
                      onClick={handleStartOver}
                      variant="outline"
                      className="glass-button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Protect Another Work
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <GlassCard className="p-8 m-4">
              <div className="text-center">
                <LiquidGlassLoader />
                <p className="text-white mt-4">Processing your creative work...</p>
                <p className="text-gray-400 text-sm">This may take a few moments</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}