import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Upload, 
  Blockchain,
  Coins,
  ExternalLink,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Share2,
  Copy,
  Wallet,
  Network,
  Fuel,
  DollarSign,
  Shield,
  Award,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Work {
  id: number;
  title: string;
  description: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  certificateId: string;
  createdAt: string;
}

interface BlockchainNetwork {
  id: string;
  name: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  gasEstimate: string;
  contractAddress: string;
  isActive: boolean;
}

interface NFTMintStatus {
  workId: number;
  step: 'idle' | 'uploading-ipfs' | 'generating-metadata' | 'estimating-gas' | 'minting' | 'completed' | 'failed';
  ipfsHash?: string;
  metadataUri?: string;
  transactionHash?: string;
  tokenId?: string;
  error?: string;
}

export default function NFTStudio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [mintStatus, setMintStatus] = useState<NFTMintStatus>({ workId: 0, step: 'idle' });

  // Fetch user's works
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ['/api/works'],
  });

  // Fetch blockchain networks
  const { data: networksData } = useQuery({
    queryKey: ['/api/blockchain/networks'],
  });

  // Fetch blockchain service status
  const { data: serviceStatus } = useQuery({
    queryKey: ['/api/blockchain/status'],
  });

  const networks: BlockchainNetwork[] = networksData?.networks || [];

  // Upload to IPFS mutation
  const uploadToIPFSMutation = useMutation({
    mutationFn: async (workId: number) => {
      return await apiRequest(`/api/blockchain/upload-to-ipfs/${workId}`, {
        method: 'POST',
      });
    },
    onSuccess: (data, workId) => {
      setMintStatus(prev => ({ ...prev, step: 'generating-metadata', ipfsHash: data.ipfs.ipfsHash }));
      generateMetadataMutation.mutate(workId);
    },
    onError: (error) => {
      setMintStatus(prev => ({ ...prev, step: 'failed', error: error.message }));
      toast({
        title: "IPFS Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate metadata mutation
  const generateMetadataMutation = useMutation({
    mutationFn: async (workId: number) => {
      return await apiRequest(`/api/blockchain/generate-metadata/${workId}`, {
        method: 'POST',
        body: JSON.stringify({
          externalUrl: `https://loggin.app/certificate/${selectedWork?.certificateId}`,
          creatorAddress: recipientAddress || user?.walletAddress || '0x0000000000000000000000000000000000000000',
        }),
      });
    },
    onSuccess: (data, workId) => {
      setMintStatus(prev => ({ ...prev, step: 'estimating-gas', metadataUri: data.metadata.metadataUri }));
      estimateGasMutation.mutate({ workId, network: selectedNetwork });
    },
    onError: (error) => {
      setMintStatus(prev => ({ ...prev, step: 'failed', error: error.message }));
      toast({
        title: "Metadata Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Gas estimation mutation
  const estimateGasMutation = useMutation({
    mutationFn: async ({ workId, network }: { workId: number; network: string }) => {
      return await apiRequest('/api/blockchain/estimate-gas', {
        method: 'POST',
        body: JSON.stringify({
          workId,
          network,
          recipientAddress: recipientAddress || user?.walletAddress || '0x0000000000000000000000000000000000000000',
        }),
      });
    },
    onSuccess: (data, { workId }) => {
      setMintStatus(prev => ({ ...prev, step: 'minting' }));
      mintNFTMutation.mutate(workId);
    },
    onError: (error) => {
      setMintStatus(prev => ({ ...prev, step: 'failed', error: error.message }));
      toast({
        title: "Gas Estimation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mint NFT mutation
  const mintNFTMutation = useMutation({
    mutationFn: async (workId: number) => {
      return await apiRequest('/api/blockchain/mint-nft', {
        method: 'POST',
        body: JSON.stringify({
          workId,
          network: selectedNetwork,
          recipientAddress: recipientAddress || user?.walletAddress,
          royaltyPercentage,
        }),
      });
    },
    onSuccess: (data) => {
      setMintStatus(prev => ({ 
        ...prev, 
        step: 'completed', 
        transactionHash: data.mintResult.transactionHash,
        tokenId: data.mintResult.tokenId 
      }));
      toast({
        title: "NFT Minted Successfully!",
        description: `Your NFT has been minted. Token ID: ${data.mintResult.tokenId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain/my-nfts'] });
    },
    onError: (error) => {
      setMintStatus(prev => ({ ...prev, step: 'failed', error: error.message }));
      toast({
        title: "NFT Minting Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMintNFT = async () => {
    if (!selectedWork) {
      toast({
        title: "No Work Selected",
        description: "Please select a work to mint as NFT",
        variant: "destructive",
      });
      return;
    }

    setMintStatus({ workId: selectedWork.id, step: 'uploading-ipfs' });
    uploadToIPFSMutation.mutate(selectedWork.id);
  };

  const resetMinting = () => {
    setMintStatus({ workId: 0, step: 'idle' });
    setSelectedWork(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const getStepStatus = (step: string) => {
    const currentStepIndex = ['idle', 'uploading-ipfs', 'generating-metadata', 'estimating-gas', 'minting', 'completed'].indexOf(mintStatus.step);
    const stepIndex = ['idle', 'uploading-ipfs', 'generating-metadata', 'estimating-gas', 'minting', 'completed'].indexOf(step);
    
    if (mintStatus.step === 'failed') return 'failed';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };

  const selectedNetworkInfo = networks.find(n => n.id === selectedNetwork);

  if (worksLoading) {
    return <LiquidGlassLoader text="Loading NFT Studio..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">NFT Studio</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your protected works into NFTs on the blockchain. Complete workflow: IPFS storage → Metadata generation → Smart contract minting.
          </p>
        </motion.div>

        {/* Service Status */}
        {serviceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Service Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">IPFS Storage</span>
                    <Badge variant={serviceStatus.ipfs?.configured ? "default" : "destructive"}>
                      {serviceStatus.ipfs?.configured ? "Ready" : "Not Configured"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Blockchain Networks</span>
                    <Badge variant={serviceStatus.blockchain?.configured ? "default" : "destructive"}>
                      {serviceStatus.blockchain?.supportedNetworks || 0} Networks
                    </Badge>
                  </div>
                </div>
                {!serviceStatus.ready && (
                  <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Some services require configuration. Check environment variables for PINATA_JWT and BLOCKCHAIN_PRIVATE_KEY.
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="mint" className="space-y-8">
            <TabsList className="bg-gray-800/50 backdrop-blur-md border border-gray-700">
              <TabsTrigger value="mint">Mint NFT</TabsTrigger>
              <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>
            </TabsList>

            <TabsContent value="mint">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Work Selection */}
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Select Work to Mint</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {works?.map((work: Work) => (
                        <div
                          key={work.id}
                          onClick={() => setSelectedWork(work)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedWork?.id === work.id
                              ? 'border-purple-500 bg-purple-900/20'
                              : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{work.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{work.description}</p>
                              <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                                <span>{work.mimeType}</span>
                                <span>{(work.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                <span>ID: {work.certificateId}</span>
                              </div>
                            </div>
                            {selectedWork?.id === work.id && (
                              <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {(!works || works.length === 0) && (
                        <div className="text-center py-8">
                          <Upload className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">No works found</p>
                          <Button
                            onClick={() => setLocation('/upload-work')}
                            className="btn-glass"
                          >
                            Upload Your First Work
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>

                {/* Minting Configuration */}
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Minting Configuration</h3>
                    
                    <div className="space-y-4">
                      {/* Network Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Blockchain Network
                        </label>
                        <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                          <SelectTrigger className="glass-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {networks.map((network) => (
                              <SelectItem key={network.id} value={network.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{network.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    ~{network.gasEstimate} {network.nativeCurrency.symbol}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedNetworkInfo && (
                          <p className="text-xs text-gray-400 mt-1">
                            Chain ID: {selectedNetworkInfo.chainId} • Est. Gas: {selectedNetworkInfo.gasEstimate} {selectedNetworkInfo.nativeCurrency.symbol}
                          </p>
                        )}
                      </div>

                      {/* Recipient Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Recipient Address (Optional)
                        </label>
                        <Input
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          placeholder="0x... (defaults to your wallet)"
                          className="glass-input"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Leave empty to mint to your wallet address
                        </p>
                      </div>

                      {/* Royalty Percentage */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Royalty Percentage
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max="25"
                            value={royaltyPercentage}
                            onChange={(e) => setRoyaltyPercentage(parseInt(e.target.value))}
                            className="glass-input"
                          />
                          <span className="text-gray-400">%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Percentage you'll receive from secondary sales (0-25%)
                        </p>
                      </div>

                      {/* Mint Button */}
                      <Button
                        onClick={handleMintNFT}
                        disabled={!selectedWork || mintStatus.step !== 'idle'}
                        className="w-full btn-glass mt-6"
                      >
                        {mintStatus.step === 'idle' ? (
                          <>
                            <Coins className="mr-2 h-4 w-4" />
                            Mint as NFT
                          </>
                        ) : (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Minting...
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Minting Progress */}
              <AnimatePresence>
                {mintStatus.step !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8"
                  >
                    <GlassCard>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-white">Minting Progress</h3>
                          {mintStatus.step === 'completed' && (
                            <Button
                              onClick={resetMinting}
                              variant="outline"
                              size="sm"
                              className="border-gray-600"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Mint Another
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Step indicators */}
                          {[
                            { key: 'uploading-ipfs', label: 'Upload to IPFS', icon: Upload },
                            { key: 'generating-metadata', label: 'Generate Metadata', icon: Settings },
                            { key: 'estimating-gas', label: 'Estimate Gas', icon: Fuel },
                            { key: 'minting', label: 'Mint NFT', icon: Coins },
                            { key: 'completed', label: 'Completed', icon: CheckCircle },
                          ].map((step, index) => {
                            const status = getStepStatus(step.key);
                            const Icon = step.icon;
                            
                            return (
                              <div key={step.key} className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  status === 'completed' ? 'bg-green-600' :
                                  status === 'active' ? 'bg-purple-600' :
                                  status === 'failed' ? 'bg-red-600' :
                                  'bg-gray-600'
                                }`}>
                                  {status === 'active' ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                  ) : (
                                    <Icon className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <span className={`${
                                  status === 'completed' ? 'text-green-400' :
                                  status === 'active' ? 'text-purple-400' :
                                  status === 'failed' ? 'text-red-400' :
                                  'text-gray-400'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Results */}
                        {mintStatus.ipfsHash && (
                          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-300 mb-2">IPFS Hash:</p>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-green-400 bg-gray-900/50 px-2 py-1 rounded">
                                {mintStatus.ipfsHash}
                              </code>
                              <Button
                                onClick={() => copyToClipboard(mintStatus.ipfsHash!)}
                                size="sm"
                                variant="ghost"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {mintStatus.transactionHash && (
                          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-300 mb-2">Transaction Hash:</p>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-purple-400 bg-gray-900/50 px-2 py-1 rounded">
                                {mintStatus.transactionHash}
                              </code>
                              <Button
                                onClick={() => copyToClipboard(mintStatus.transactionHash!)}
                                size="sm"
                                variant="ghost"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {mintStatus.error && (
                          <div className="mt-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-red-400 font-medium">Minting Failed</p>
                                <p className="text-red-300 text-sm mt-1">{mintStatus.error}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="my-nfts">
              <GlassCard>
                <div className="p-6 text-center">
                  <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">My NFTs</h3>
                  <p className="text-gray-400 mb-4">Your minted NFTs will appear here</p>
                  <Button className="btn-glass">
                    View on OpenSea
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}