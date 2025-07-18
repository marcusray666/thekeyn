import { ethers } from 'ethers';
import crypto from 'crypto';
import type { 
  NFTMintRequest, 
  NFTMintResponse, 
  BlockchainNetwork,
  InsertBlockchainTransaction,
  InsertNftToken 
} from '@shared/blockchain-schema';

// Smart contract ABI for ERC-721 NFT minting
const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string memory tokenURI) public returns (uint256)",
  "function tokenCounter() public view returns (uint256)",
  "function setRoyalty(uint256 tokenId, address recipient, uint96 feeNumerator) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event MetadataUpdate(uint256 indexed tokenId)"
];

// Blockchain service for smart contract interactions
export class BlockchainService {
  private networks: Map<string, BlockchainNetwork>;
  private providers: Map<string, ethers.JsonRpcProvider>;
  private privateKey: string;

  constructor() {
    this.networks = new Map();
    this.providers = new Map();
    this.privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || '';
    
    this.initializeNetworks();
  }

  private initializeNetworks() {
    // Default supported networks
    const defaultNetworks: BlockchainNetwork[] = [
      {
        id: 'ethereum',
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_API_KEY',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS || '',
        isActive: true,
        gasEstimate: '0.015',
        createdAt: new Date(),
      },
      {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
        contractAddress: process.env.POLYGON_CONTRACT_ADDRESS || '',
        isActive: true,
        gasEstimate: '0.001',
        createdAt: new Date(),
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
        explorerUrl: 'https://arbiscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        contractAddress: process.env.ARBITRUM_CONTRACT_ADDRESS || '',
        isActive: true,
        gasEstimate: '0.002',
        createdAt: new Date(),
      },
      {
        id: 'base',
        name: 'Base',
        chainId: 8453,
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        contractAddress: process.env.BASE_CONTRACT_ADDRESS || '',
        isActive: true,
        gasEstimate: '0.001',
        createdAt: new Date(),
      },
    ];

    defaultNetworks.forEach(network => {
      this.networks.set(network.id, network);
      if (network.rpcUrl && network.isActive) {
        this.providers.set(network.id, new ethers.JsonRpcProvider(network.rpcUrl));
      }
    });
  }

  // Mint NFT on specified blockchain (using app-managed wallet)
  async mintNFTForUser(
    request: NFTMintRequest,
    metadataUri: string,
    userId: number
  ): Promise<NFTMintResponse> {
    try {
      const network = this.networks.get(request.network);
      if (!network) {
        throw new Error(`Unsupported network: ${request.network}`);
      }

      if (!network.contractAddress) {
        throw new Error(`Contract address not configured for ${request.network}`);
      }

      if (!this.privateKey) {
        throw new Error('Blockchain private key not configured. Please add BLOCKCHAIN_PRIVATE_KEY to environment variables.');
      }

      const provider = this.providers.get(request.network);
      if (!provider) {
        throw new Error(`Provider not available for ${request.network}`);
      }

      // Create wallet instance
      const wallet = new ethers.Wallet(this.privateKey, provider);

      // Create contract instance
      const contract = new ethers.Contract(
        network.contractAddress,
        NFT_CONTRACT_ABI,
        wallet
      );

      // Use app's master wallet to mint, but set user as recipient
      const recipientAddress = request.recipientAddress || await this.getUserWalletAddress(userId);

      // Estimate gas
      const gasEstimate = await contract.mintNFT.estimateGas(
        recipientAddress,
        metadataUri
      );

      // Get current gas price
      const gasPrice = await provider.getFeeData();

      // Calculate total gas cost
      const estimatedGasFee = ethers.formatEther(
        gasEstimate * (gasPrice.gasPrice || BigInt(0))
      );

      // Execute minting transaction
      const transaction = await contract.mintNFT(
        recipientAddress,
        metadataUri,
        {
          gasLimit: gasEstimate * BigInt(120) / BigInt(100), // Add 20% buffer
          gasPrice: gasPrice.gasPrice,
        }
      );

      // Wait for transaction confirmation
      const receipt = await transaction.wait();

      // Extract token ID from transaction logs
      let tokenId = '';
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog?.name === 'Transfer' && parsedLog.args.from === ethers.ZeroAddress) {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }

      // Set royalty if specified
      if (request.royaltyPercentage && tokenId) {
        try {
          const royaltyBasisPoints = request.royaltyPercentage * 100; // Convert percentage to basis points
          const userWalletAddress = await this.getUserWalletAddress(userId);
          await contract.setRoyalty(tokenId, userWalletAddress, royaltyBasisPoints);
        } catch (error) {
          console.warn('Failed to set royalty:', error);
        }
      }

      return {
        success: true,
        transactionId: `${request.network}-${Date.now()}`,
        transactionHash: transaction.hash,
        tokenId,
        ipfsHash: metadataUri.split('/').pop() || '',
        metadataUri,
        estimatedGasFee,
        networkFee: network.gasEstimate || '0.01',
      };

    } catch (error) {
      console.error('NFT minting error:', error);
      throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get transaction status
  async getTransactionStatus(
    transactionHash: string,
    network: string
  ): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
    confirmations?: number;
  }> {
    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for ${network}`);
      }

      const receipt = await provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      if (receipt.status === 1) {
        const currentBlock = await provider.getBlockNumber();
        return {
          status: 'confirmed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          confirmations: currentBlock - receipt.blockNumber,
        };
      } else {
        return { status: 'failed' };
      }
    } catch (error) {
      console.error('Transaction status check error:', error);
      return { status: 'pending' };
    }
  }

  // Get NFT ownership
  async getNFTOwner(tokenId: string, contractAddress: string, network: string): Promise<string> {
    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for ${network}`);
      }

      const contract = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, provider);
      return await contract.ownerOf(tokenId);
    } catch (error) {
      console.error('NFT owner check error:', error);
      throw new Error(`Failed to get NFT owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get token URI
  async getTokenURI(tokenId: string, contractAddress: string, network: string): Promise<string> {
    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for ${network}`);
      }

      const contract = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, provider);
      return await contract.tokenURI(tokenId);
    } catch (error) {
      console.error('Token URI check error:', error);
      throw new Error(`Failed to get token URI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Estimate gas costs
  async estimateGasCosts(network: string, recipientAddress: string, metadataUri: string): Promise<{
    gasEstimate: string;
    gasPriceGwei: string;
    totalCostEth: string;
    totalCostUsd?: string;
  }> {
    try {
      const networkConfig = this.networks.get(network);
      if (!networkConfig || !networkConfig.contractAddress) {
        throw new Error(`Network ${network} not configured`);
      }

      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for ${network}`);
      }

      const wallet = new ethers.Wallet(this.privateKey, provider);
      const contract = new ethers.Contract(networkConfig.contractAddress, NFT_CONTRACT_ABI, wallet);

      const gasEstimate = await contract.mintNFT.estimateGas(recipientAddress, metadataUri);
      const gasPrice = await provider.getFeeData();

      const gasPriceGwei = ethers.formatUnits(gasPrice.gasPrice || BigInt(0), 'gwei');
      const totalCostWei = gasEstimate * (gasPrice.gasPrice || BigInt(0));
      const totalCostEth = ethers.formatEther(totalCostWei);

      return {
        gasEstimate: gasEstimate.toString(),
        gasPriceGwei,
        totalCostEth,
      };
    } catch (error) {
      console.error('Gas estimation error:', error);
      throw new Error(`Failed to estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's wallet address (app-managed)
  private async getUserWalletAddress(userId: number): Promise<string> {
    // Generate deterministic address from user ID
    // In production, you'd store this in the database
    const seed = crypto
      .createHash('sha256')
      .update(`user-${userId}-${process.env.WALLET_ENCRYPTION_KEY || 'default'}`)
      .digest('hex');
    
    const wallet = new ethers.Wallet(seed);
    return wallet.address;
  }

  // Original mint function for backwards compatibility
  async mintNFT(
    request: NFTMintRequest,
    metadataUri: string,
    creatorAddress: string
  ): Promise<NFTMintResponse> {
    // Redirect to user-managed version
    return this.mintNFTForUser(request, metadataUri, 0); // 0 as placeholder
  }

  // Get supported networks
  getSupportedNetworks(): BlockchainNetwork[] {
    return Array.from(this.networks.values()).filter(network => network.isActive);
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!this.privateKey && this.networks.size > 0;
  }

  // Get service status
  getStatus() {
    const configuredNetworks = Array.from(this.networks.values())
      .filter(network => network.contractAddress && network.isActive);

    return {
      configured: this.isConfigured(),
      hasPrivateKey: !!this.privateKey,
      supportedNetworks: configuredNetworks.length,
      networks: configuredNetworks.map(network => ({
        id: network.id,
        name: network.name,
        hasContract: !!network.contractAddress,
        hasRpc: !!this.providers.get(network.id),
      })),
    };
  }
}