import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Upload, 
  Sparkles,
  CheckCircle,
  Clock,
  Loader2,
  Award,
  ExternalLink,
  Zap,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
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
  createdAt: string;
}

export default function SimplifiedNFT() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'minting' | 'completed' | 'failed'>('idle');

  // Fetch user's works
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ['/api/works'],
    retry: 3,
  });

  // One-click NFT minting mutation
  const mintNFTMutation = useMutation({
    mutationFn: async (workId: number) => {
      setMintingStatus('minting');
      
      // Step 1: Upload to IPFS
      await apiRequest(`/api/blockchain/upload-to-ipfs/${workId}`, {
        method: 'POST',
      });

      // Step 2: Generate metadata
      await apiRequest(`/api/blockchain/generate-metadata/${workId}`, {
        method: 'POST',
        body: JSON.stringify({
          externalUrl: `https://loggin.app/certificate/${selectedWork?.certificateId}`,
        }),
      });

      // Step 3: Mint NFT (app handles wallet automatically)
      return await apiRequest('/api/blockchain/mint-nft', {
        method: 'POST',
        body: JSON.stringify({
          workId,
          network: 'polygon', // Default to cheapest network
          royaltyPercentage: 10,
        }),
      });
    },
    onSuccess: (data) => {
      setMintingStatus('completed');
      toast({
        title: "NFT Created Successfully! 🎉",
        description: `Your artwork is now a blockchain-verified NFT. Token ID: ${data.mintResult.tokenId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain/my-nfts'] });
    },
    onError: (error) => {
      setMintingStatus('failed');
      toast({
        title: "NFT Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOneClickMint = () => {
    if (!selectedWork) return;
    mintNFTMutation.mutate(selectedWork.id);
  };

  const resetMinting = () => {
    setMintingStatus('idle');
    setSelectedWork(null);
  };

  if (worksLoading) {
    return <LiquidGlassLoader text="Loading your artworks..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold gradient-text">One-Click NFT Creation</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            No wallets, no crypto knowledge needed. Just select your artwork and we'll handle everything!
          </p>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                How It Works (100% Automated)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-white mb-2">1. We Store on IPFS</h4>
                  <p className="text-sm text-gray-400">Your artwork goes to decentralized storage automatically</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-white mb-2">2. We Create Metadata</h4>
                  <p className="text-sm text-gray-400">NFT-standard metadata generated with your work details</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-white mb-2">3. We Mint Your NFT</h4>
                  <p className="text-sm text-gray-400">Smart contract creates your blockchain certificate</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Work Selection & Minting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Select Your Artwork</h3>
              
              {mintingStatus === 'idle' && (
                <div className="space-y-4">
                  {works && works.length > 0 ? (
                    works.map((work: Work) => (
                      <div
                      key={work.id}
                      onClick={() => setSelectedWork(work)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedWork?.id === work.id
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{work.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{work.description}</p>
                          <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
                            <span>{work.mimeType}</span>
                            <span>Created: {new Date(work.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {selectedWork?.id === work.id && (
                          <CheckCircle className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No artworks found</p>
                      <Link href="/authenticated-upload">
                        <Button className="btn-glass">
                          <Plus className="mr-2 h-4 w-4" />
                          Upload Your First Artwork
                        </Button>
                      </Link>
                    </div>
                  )}

                  {selectedWork && (
                    <div className="mt-6 pt-6 border-t border-gray-600">
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <h4 className="text-white font-medium mb-2">Ready to Mint: {selectedWork.title}</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>• Network: Polygon (low fees)</p>
                          <p>• Cost: ~$0.01 (we cover it!)</p>
                          <p>• Royalties: 10% on resales</p>
                          <p>• Ownership: 100% yours</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleOneClickMint}
                        className="w-full btn-glass text-lg py-3"
                        disabled={mintNFTMutation.isPending}
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Create NFT Now (Free!)
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {mintingStatus === 'minting' && (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 text-purple-400 animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">Creating Your NFT...</h3>
                  <p className="text-gray-400 mb-4">
                    We're handling all the blockchain magic behind the scenes
                  </p>
                  <div className="text-sm text-gray-500">
                    This usually takes 30-60 seconds
                  </div>
                </div>
              )}

              {mintingStatus === 'completed' && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">NFT Created Successfully! 🎉</h3>
                  <p className="text-gray-400 mb-6">
                    Your artwork is now a verified NFT on the blockchain
                  </p>
                  <div className="space-y-3">
                    <Button className="btn-glass">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on OpenSea
                    </Button>
                    <Button
                      onClick={resetMinting}
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      Create Another NFT
                    </Button>
                  </div>
                </div>
              )}

              {mintingStatus === 'failed' && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h3>
                  <p className="text-gray-400 mb-6">
                    Don't worry, your artwork is still safe and protected
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => selectedWork && mintNFTMutation.mutate(selectedWork.id)}
                      className="btn-glass"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={resetMinting}
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      Choose Different Artwork
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}