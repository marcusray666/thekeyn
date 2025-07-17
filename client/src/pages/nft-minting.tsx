import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Coins, 
  Sparkles, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Wallet,
  Crown,
  Zap,
  Shield,
  TrendingUp,
  Copy,
  Eye,
  DollarSign,
  Network,
  Image,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LiquidGlassLoader } from "@/components/ui/liquid-glass-loader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Blockchain {
  id: string;
  name: string;
  symbol: string;
  networkId: number;
  explorerUrl: string;
  mintingFee: string;
  gasEstimate: string;
  logo: string;
  marketplaces: string[];
  isPremium: boolean;
}

const BLOCKCHAINS: Blockchain[] = [
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    networkId: 137,
    explorerUrl: 'https://polygonscan.com',
    mintingFee: '~$2-5',
    gasEstimate: '0.01 MATIC',
    logo: '🔷',
    marketplaces: ['OpenSea', 'Rarible', 'Magic Eden'],
    isPremium: false
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    networkId: 1,
    explorerUrl: 'https://etherscan.io',
    mintingFee: '~$20-50',
    gasEstimate: '0.005-0.02 ETH',
    logo: '⬢',
    marketplaces: ['OpenSea', 'Rarible', 'Foundation', 'SuperRare'],
    isPremium: true
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    networkId: 42161,
    explorerUrl: 'https://arbiscan.io',
    mintingFee: '~$3-8',
    gasEstimate: '0.001 ETH',
    logo: '🔵',
    marketplaces: ['OpenSea', 'Treasure'],
    isPremium: true
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    networkId: 8453,
    explorerUrl: 'https://basescan.org',
    mintingFee: '~$1-3',
    gasEstimate: '0.0005 ETH',
    logo: '🔷',
    marketplaces: ['OpenSea', 'Zora'],
    isPremium: true
  }
];

export default function NFTMinting() {
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('polygon');
  const [walletAddress, setWalletAddress] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [nftMetadata, setNftMetadata] = useState({
    name: '',
    description: '',
    attributes: [] as Array<{trait_type: string, value: string}>
  });
  const [walletConnected, setWalletConnected] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isPremiumUser = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';

  // Fetch user's works
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ["/api/works"]
  });

  // Fetch user's NFT mints
  const { data: nftMints, isLoading: mintsLoading } = useQuery({
    queryKey: ["/api/nft-mints"]
  });

  // Connect wallet simulation
  const connectWallet = async () => {
    try {
      // Simulate wallet connection (in real implementation, use Web3 library)
      const simulatedAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setWalletAddress(simulatedAddress);
      setWalletConnected(true);
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mint NFT mutation
  const mintNFT = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/nft-mints`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "NFT Minting Started",
        description: "Your NFT is being minted on the blockchain. This may take a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nft-mints"] });
      // Reset form
      setSelectedWork(null);
      setNftMetadata({ name: '', description: '', attributes: [] });
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to start NFT minting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleMintNFT = () => {
    if (!selectedWork || !walletConnected || !selectedBlockchain) {
      toast({
        title: "Missing Information",
        description: "Please select a work, connect your wallet, and choose a blockchain.",
        variant: "destructive",
      });
      return;
    }

    const blockchain = BLOCKCHAINS.find(b => b.id === selectedBlockchain);
    if (blockchain?.isPremium && !isPremiumUser) {
      toast({
        title: "Premium Required",
        description: `${blockchain.name} minting requires a premium subscription. Please upgrade your account.`,
        variant: "destructive",
      });
      return;
    }

    const selectedWorkData = works?.find((w: any) => w.id === selectedWork);
    
    mintNFT.mutate({
      workId: selectedWork,
      certificateId: selectedWorkData?.certificateId,
      blockchain: selectedBlockchain,
      walletAddress,
      royaltyPercentage,
      metadata: nftMetadata
    });
  };

  const addAttribute = () => {
    setNftMetadata(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setNftMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index: number) => {
    setNftMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'minting': return <Zap className="h-4 w-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  if (worksLoading || mintsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <LiquidGlassLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mr-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              NFT Minting Studio
            </h1>
            {isPremiumUser && (
              <Badge className="ml-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-lg">
            Transform your protected works into authentic NFTs on the blockchain
          </p>
        </div>

        {/* Premium Banner for Free Users */}
        {!isPremiumUser && (
          <div className="mb-8">
            <GlassCard className="border-gradient-to-r from-yellow-500 to-orange-500 border-2">
              <div className="p-6 text-center">
                <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Unlock Premium NFT Features
                </h3>
                <p className="text-gray-300 mb-4">
                  Mint on Ethereum, Arbitrum, and Base networks. Get priority minting and advanced marketplace listings.
                </p>
                <Button className="btn-glass bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold">
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade to Premium
                </Button>
              </div>
            </GlassCard>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Minting Form */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  Mint Your NFT
                </h2>

                <div className="space-y-6">
                  {/* Wallet Connection */}
                  <div>
                    <Label className="text-white mb-2 block">
                      Wallet Connection *
                    </Label>
                    {!walletConnected ? (
                      <Button
                        onClick={connectWallet}
                        className="w-full btn-glass py-3 rounded-xl font-semibold text-white"
                      >
                        <Wallet className="mr-2 h-5 w-5" />
                        Connect Wallet
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-900 bg-opacity-20 rounded-xl border border-green-600">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                          <span className="text-green-300 font-medium">Connected</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 font-mono text-sm">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(walletAddress)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Select Work */}
                  <div>
                    <Label className="text-white mb-2 block">
                      Select Work to Mint *
                    </Label>
                    <Select value={selectedWork?.toString() || ''} onValueChange={(value) => setSelectedWork(parseInt(value))}>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Choose a protected work" />
                      </SelectTrigger>
                      <SelectContent>
                        {works?.map((work: any) => (
                          <SelectItem key={work.id} value={work.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <Image className="h-4 w-4" />
                              <span>{work.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {work.mimeType.split('/')[0]}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Blockchain Selection */}
                  <div>
                    <Label className="text-white mb-2 block">
                      Blockchain Network *
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {BLOCKCHAINS.map((blockchain) => (
                        <div
                          key={blockchain.id}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedBlockchain === blockchain.id
                              ? 'border-purple-500 bg-purple-900 bg-opacity-20'
                              : 'border-gray-600 bg-gray-800 bg-opacity-20'
                          } ${blockchain.isPremium && !isPremiumUser ? 'opacity-50' : ''}`}
                          onClick={() => {
                            if (!blockchain.isPremium || isPremiumUser) {
                              setSelectedBlockchain(blockchain.id);
                            }
                          }}
                        >
                          {blockchain.isPremium && !isPremiumUser && (
                            <Crown className="absolute top-2 right-2 h-5 w-5 text-yellow-400" />
                          )}
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{blockchain.logo}</span>
                            <div>
                              <h3 className="text-white font-semibold">{blockchain.name}</h3>
                              <p className="text-gray-400 text-sm">Fee: {blockchain.mintingFee}</p>
                              <p className="text-gray-500 text-xs">Gas: ~{blockchain.gasEstimate}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NFT Metadata */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">NFT Metadata</h3>
                    
                    <div>
                      <Label className="text-white mb-2 block">NFT Name *</Label>
                      <Input
                        value={nftMetadata.name}
                        onChange={(e) => setNftMetadata(prev => ({...prev, name: e.target.value}))}
                        placeholder="Enter a unique name for your NFT"
                        className="glass-input"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Description</Label>
                      <Textarea
                        value={nftMetadata.description}
                        onChange={(e) => setNftMetadata(prev => ({...prev, description: e.target.value}))}
                        placeholder="Describe your NFT..."
                        className="glass-input min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Royalty Percentage</Label>
                      <Select value={royaltyPercentage.toString()} onValueChange={(value) => setRoyaltyPercentage(parseInt(value))}>
                        <SelectTrigger className="glass-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20].map(percentage => (
                            <SelectItem key={percentage} value={percentage.toString()}>
                              {percentage}% - You earn {percentage}% on each resale
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Attributes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white">Attributes (Optional)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addAttribute}
                          className="border-gray-600 text-gray-300"
                        >
                          Add Trait
                        </Button>
                      </div>
                      
                      {nftMetadata.attributes.map((attr, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <Input
                            value={attr.trait_type}
                            onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                            placeholder="Trait type"
                            className="glass-input"
                          />
                          <Input
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="glass-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttribute(index)}
                            className="border-red-600 text-red-400"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mint Button */}
                  <Button
                    onClick={handleMintNFT}
                    disabled={mintNFT.isPending || !walletConnected || !selectedWork}
                    className="w-full btn-glass py-3 rounded-xl font-semibold text-white"
                  >
                    {mintNFT.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Minting NFT...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Mint NFT
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Selected Blockchain Info */}
            {selectedBlockchain && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Network className="mr-2 h-5 w-5" />
                    Network Details
                  </h3>
                  
                  {(() => {
                    const blockchain = BLOCKCHAINS.find(b => b.id === selectedBlockchain);
                    if (!blockchain) return null;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{blockchain.logo}</span>
                          <div>
                            <h4 className="text-white font-semibold">{blockchain.name}</h4>
                            <p className="text-gray-400 text-sm">Network ID: {blockchain.networkId}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Estimated Cost</p>
                          <p className="text-white">{blockchain.mintingFee}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Gas Estimate</p>
                          <p className="text-white">{blockchain.gasEstimate}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Supported Marketplaces</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {blockchain.marketplaces.map(marketplace => (
                              <Badge key={marketplace} variant="outline" className="text-xs">
                                {marketplace}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                          onClick={() => window.open(blockchain.explorerUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Explorer
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </GlassCard>
            )}

            {/* Benefits */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  NFT Benefits
                </h3>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Immutable proof of ownership on blockchain</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Automatic royalties on secondary sales</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Global marketplace compatibility</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Enhanced digital authenticity</span>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Increased collectible value</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Your NFT Mints */}
        {nftMints && nftMints.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Your NFT Collection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftMints.map((mint: any) => {
                const work = works?.find((w: any) => w.id === mint.workId);
                const blockchain = BLOCKCHAINS.find(b => b.id === mint.blockchain);
                
                return (
                  <GlassCard key={mint.id}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {work?.title || 'Unknown Work'}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(mint.status)}
                          <span className="text-sm text-gray-300 capitalize">
                            {mint.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Blockchain:</span>
                          <span className="text-white flex items-center">
                            {blockchain?.logo} {blockchain?.name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Royalties:</span>
                          <span className="text-white">{mint.royaltyPercentage}%</span>
                        </div>
                        
                        {mint.tokenId && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Token ID:</span>
                            <span className="text-white font-mono">#{mint.tokenId}</span>
                          </div>
                        )}
                        
                        {mint.mintingCost && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Cost:</span>
                            <span className="text-white">{mint.mintingCost}</span>
                          </div>
                        )}
                      </div>
                      
                      {mint.status === 'completed' && (
                        <div className="mt-4 space-y-2">
                          {mint.transactionHash && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-gray-600 text-gray-300 hover:bg-white hover:bg-opacity-5"
                              onClick={() => window.open(`${blockchain?.explorerUrl}/tx/${mint.transactionHash}`, '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Transaction
                            </Button>
                          )}
                          
                          {mint.marketplaceListings && mint.marketplaceListings.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-blue-600 text-blue-300 hover:bg-blue-900 hover:bg-opacity-20"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View on OpenSea
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}