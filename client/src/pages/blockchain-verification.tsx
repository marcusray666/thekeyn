import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Network, 
  Database,
  Lock,
  Eye,
  Download,
  Share2,
  Copy,
  RefreshCw,
  FileCheck,
  Globe,
  Activity,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";

interface VerificationProof {
  fileHash: string;
  timestamp: number;
  creator: string;
  merkleProof: string[];
  blockchainAnchor: string;
  ipfsHash: string;
  digitalSignature: string;
  certificateId: string;
}

interface NetworkStatus {
  network: string;
  status: 'online' | 'offline';
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  error?: string;
}

export default function BlockchainVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<'basic' | 'enhanced' | 'premium'>('basic');
  const [verificationProof, setVerificationProof] = useState<VerificationProof | null>(null);
  const [verifyingFile, setVerifyingFile] = useState<File | null>(null);
  const [verifyingProof, setVerifyingProof] = useState<string>('');

  // Fetch user's works
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/works"],
  });

  // Fetch network status
  const { data: networkStatus, isLoading: networkLoading } = useQuery({
    queryKey: ["/api/verification/network-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate verification mutation
  const generateVerification = useMutation({
    mutationFn: async ({ workId, level }: { workId: number; level: string }) => {
      console.log('Making API request to /api/verification/generate with:', { workId, verificationLevel: level });
      const response = await apiRequest("/api/verification/generate", {
        method: "POST",
        body: { 
          workId, 
          verificationLevel: level 
        }
      });
      console.log('Verification API response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Verification generation successful:', data);
      setVerificationProof(data.proof);
      toast({
        title: "Verification Generated",
        description: `Advanced ${verificationLevel} verification created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/works"] });
    },
    onError: (error) => {
      console.error('Verification generation failed:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to generate verification",
        variant: "destructive",
      });
    },
  });

  // Verify proof mutation
  const verifyProof = useMutation({
    mutationFn: async ({ proof, fileBuffer }: { proof: string; fileBuffer?: string }) => {
      try {
        const parsedProof = JSON.parse(proof);
        return await apiRequest("POST", "/api/verification/verify", { 
          fileHash: parsedProof.fileHash,
          proof: parsedProof, 
          fileBuffer 
        });
      } catch (e) {
        throw new Error("Invalid verification proof format");
      }
    },
    onSuccess: (data) => {
      toast({
        title: data.isValid ? "Verification Success" : "Verification Failed",
        description: `Confidence: ${data.confidence}%`,
        variant: data.isValid ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify proof",
        variant: "destructive",
      });
    },
  });

  const handleGenerateVerification = () => {
    console.log('Generate verification clicked', { selectedWork, verificationLevel });
    
    if (!selectedWork) {
      toast({
        title: "No Work Selected",
        description: "Please select a work to generate verification for.",
        variant: "destructive",
      });
      return;
    }

    console.log('Making verification request for work:', selectedWork);
    generateVerification.mutate({ workId: selectedWork, level: verificationLevel });
  };

  const handleVerifyProof = () => {
    if (!verifyingProof) {
      toast({
        title: "No Proof Provided",
        description: "Please paste a verification proof to verify.",
        variant: "destructive",
      });
      return;
    }

    let fileBuffer: string | undefined;
    if (verifyingFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const buffer = Buffer.from(arrayBuffer);
        fileBuffer = buffer.toString('base64');
        verifyProof.mutate({ proof: verifyingProof, fileBuffer });
      };
      reader.readAsArrayBuffer(verifyingFile);
    } else {
      verifyProof.mutate({ proof: verifyingProof });
    }
  };

  const copyProofToClipboard = () => {
    if (verificationProof) {
      navigator.clipboard.writeText(JSON.stringify(verificationProof, null, 2));
      toast({
        title: "Copied to Clipboard",
        description: "Verification proof copied successfully.",
      });
    }
  };

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getVerificationLevelInfo = (level: string) => {
    switch (level) {
      case 'basic':
        return {
          description: 'Verify external files not uploaded to TheKeyn (works created elsewhere)',
          features: ['External file verification', 'Basic timestamp proof', 'Downloadable certificate'],
          price: 'Free',
          useCase: 'Perfect for: Art created in other platforms, old works, client verification'
        };
      case 'enhanced':
        return {
          description: 'Legal-grade verification with distributed storage for court evidence',
          features: ['All basic features', 'IPFS permanent storage', 'Multi-blockchain anchoring', 'Legal certificate'],
          price: '$0.50',
          useCase: 'Perfect for: Commercial work, licensing, disputes, professional portfolios'
        };
      case 'premium':
        return {
          description: 'Maximum security with priority processing and legal support',
          features: ['All enhanced features', 'Priority blockchain inclusion', 'Attorney-ready documents', 'Expert witness support'],
          price: '$2.00',
          useCase: 'Perfect for: High-value works, ongoing legal cases, enterprise clients'
        };
      default:
        return {
          description: 'Unknown verification level',
          features: [],
          price: 'N/A',
          useCase: ''
        };
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FE3F5E]/20 via-transparent to-[#FFD200]/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FE3F5E]/15 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD200]/15 rounded-full blur-[100px]"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900">External Work Verification</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Verify digital works from outside TheKeyn or add enhanced verification to existing protected works
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">📝 How This Differs From Regular Uploads</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Regular TheKeyn Upload (Free):</p>
                <ul className="space-y-1 text-xs">
                  <li>• Automatic blockchain protection</li>
                  <li>• Hash generation & certificate</li>
                  <li>• Basic timestamp proof</li>
                  <li>• Community sharing</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">External Verification (Paid):</p>
                <ul className="space-y-1 text-xs">
                  <li>• Verify works created elsewhere</li>
                  <li>• Enhanced legal-grade certificates</li>
                  <li>• Multi-network blockchain anchoring</li>
                  <li>• Court-admissible evidence</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900">Blockchain Network Status</h3>
                <RefreshCw 
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/verification/network-status"] })}
                />
              </div>
              
              {networkLoading ? (
                <div className="flex items-center gap-2">
                  <LiquidGlassLoader size="sm" />
                  <span className="text-gray-600">Checking network status...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {networkStatus?.networks?.map((network: NetworkStatus) => (
                    <div key={network.network} className="text-center">
                      <div className={`flex items-center justify-center gap-1 mb-1 ${getNetworkStatusColor(network.status)}`}>
                        <Activity className="w-4 h-4" />
                        <span className="font-medium capitalize">{network.network}</span>
                      </div>
                      <Badge 
                        variant={network.status === 'online' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {network.status}
                      </Badge>
                      {network.blockNumber && (
                        <div className="text-xs text-gray-400 mt-1">
                          Block #{network.blockNumber.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-md">
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700">
              Generate Verification
            </TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700">
              Verify Proof
            </TabsTrigger>
            <TabsTrigger value="batch" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-700">
              Batch Operations
            </TabsTrigger>
          </TabsList>

          {/* Generate Verification Tab */}
          <TabsContent value="generate">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Generation Form */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Generate New Verification
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="work-select" className="text-gray-700">Select Work</Label>
                      <Select value={selectedWork?.toString()} onValueChange={(value) => setSelectedWork(parseInt(value))}>
                        <SelectTrigger className="bg-white/90 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Choose a work to verify" />
                        </SelectTrigger>
                        <SelectContent>
                          {works?.map((work: any) => (
                            <SelectItem key={work.id} value={work.id.toString()}>
                              {work.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="verification-level" className="text-gray-700">Verification Level</Label>
                      <Select value={verificationLevel} onValueChange={(value: any) => setVerificationLevel(value)}>
                        <SelectTrigger className="bg-white/90 border-gray-300 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (Free)</SelectItem>
                          <SelectItem value="enhanced">Enhanced ($0.50)</SelectItem>
                          <SelectItem value="premium">Premium ($2.00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{verificationLevel.charAt(0).toUpperCase() + verificationLevel.slice(1)} Verification - {getVerificationLevelInfo(verificationLevel).price}</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        {getVerificationLevelInfo(verificationLevel).description}
                      </p>
                      <p className="text-xs text-purple-600 mb-3 font-medium">
                        {getVerificationLevelInfo(verificationLevel).useCase}
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {getVerificationLevelInfo(verificationLevel).features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={handleGenerateVerification} 
                      disabled={generateVerification.isPending || !selectedWork}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {generateVerification.isPending ? (
                        <>
                          <LiquidGlassLoader size="sm" className="mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Verification
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Generated Proof Display */}
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-400" />
                    Generated Verification Proof
                  </h3>

                  {verificationProof ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">File Hash:</span>
                          <p className="text-gray-900 font-mono text-xs break-all">{verificationProof.fileHash}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Certificate ID:</span>
                          <p className="text-gray-900 font-mono text-xs">{verificationProof.certificateId}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">IPFS Hash:</span>
                          <p className="text-gray-900 font-mono text-xs break-all">{verificationProof.ipfsHash}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Blockchain Anchor:</span>
                          <p className="text-gray-900 font-mono text-xs break-all">{verificationProof.blockchainAnchor}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-700 mb-2 block">Full Verification Proof</Label>
                        <Textarea 
                          value={JSON.stringify(verificationProof, null, 2)}
                          readOnly
                          className="bg-gray-100 border-gray-300 text-gray-900 font-mono text-xs h-32"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={copyProofToClipboard}
                          variant="outline" 
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Proof
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No verification proof generated yet</p>
                      <p className="text-sm text-gray-500">Select a work and generate verification to see proof details</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Verify Proof Tab */}
          <TabsContent value="verify">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Verify Existing Proof
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verify-proof" className="text-gray-700">Verification Proof (JSON)</Label>
                    <Textarea 
                      id="verify-proof"
                      value={verifyingProof}
                      onChange={(e) => setVerifyingProof(e.target.value)}
                      placeholder="Paste the complete verification proof JSON here..."
                      className="bg-white/90 border-gray-300 text-gray-900 font-mono h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="verify-file" className="text-gray-700">Original File (Optional)</Label>
                    <Input 
                      id="verify-file"
                      type="file"
                      onChange={(e) => setVerifyingFile(e.target.files?.[0] || null)}
                      className="bg-white/90 border-gray-300 text-gray-900"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Upload the original file to verify file hash integrity
                    </p>
                  </div>

                  <Button 
                    onClick={handleVerifyProof}
                    disabled={verifyProof.isPending || !verifyingProof}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {verifyProof.isPending ? (
                      <>
                        <LiquidGlassLoader size="sm" className="mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Proof
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          {/* Batch Operations Tab */}
          <TabsContent value="batch">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Batch Verification Operations
                </h3>

                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Batch operations coming soon</p>
                  <p className="text-sm text-gray-500">
                    Verify multiple works at once with bulk operations for enterprise users
                  </p>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}