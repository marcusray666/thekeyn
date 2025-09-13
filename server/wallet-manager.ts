import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

/**
 * Secure wallet management for blockchain verification
 * Generates and manages a dedicated application wallet (never asks for user's private key)
 */
export class WalletManager {
  private static instance: WalletManager;
  private wallet: ethers.Wallet | null = null;
  private provider: ethers.JsonRpcProvider;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  }
  
  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }
  
  /**
   * Get or create the application's dedicated blockchain wallet
   * This wallet is ONLY used for blockchain verification - not connected to any user funds
   */
  async getWallet(): Promise<ethers.Wallet> {
    if (this.wallet) {
      return this.wallet;
    }
    
    // Check if we have a stored private key in environment
    let privateKey = process.env.ETHEREUM_PRIVATE_KEY;
    
    if (!privateKey) {
      // Generate a new dedicated wallet for this application
      console.log('Generating new dedicated wallet for blockchain verification...');
      const newWallet = ethers.Wallet.createRandom();
      privateKey = newWallet.privateKey;
      
      // Log the wallet address and funding instructions (NEVER LOG PRIVATE KEY)
      console.log('🔐 NEW APPLICATION WALLET GENERATED:');
      console.log('📍 Address:', newWallet.address);
      console.log('💰 To enable blockchain verification, fund this wallet with ~$20-50 ETH');
      console.log('🔗 Etherscan:', `https://etherscan.io/address/${newWallet.address}`);
      console.log('🚨 SECURITY: Set ETHEREUM_PRIVATE_KEY environment variable to the generated private key');
      console.log('   Private key has been set for this session but will be lost on restart.');
      
      // Store for session use (will be lost on restart until env var is set)
      process.env.ETHEREUM_PRIVATE_KEY = privateKey;
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    return this.wallet;
  }
  
  /**
   * Check if the wallet has sufficient funds for blockchain verification
   */
  async checkWalletBalance(): Promise<{
    address: string;
    balance: string;
    balanceEth: string;
    hasMinimumFunds: boolean;
    fundingInstructions?: string;
  }> {
    const wallet = await this.getWallet();
    const balance = await this.provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    const hasMinimumFunds = balance > ethers.parseEther('0.01'); // Need at least 0.01 ETH
    
    const result = {
      address: wallet.address,
      balance: balance.toString(),
      balanceEth,
      hasMinimumFunds
    };
    
    if (!hasMinimumFunds) {
      return {
        ...result,
        fundingInstructions: `Send at least 0.02 ETH to ${wallet.address} to enable blockchain verification`
      };
    }
    
    return result;
  }
  
  /**
   * Create a real Ethereum transaction to anchor file hash
   */
  async createBlockchainAnchor(fileHash: string, metadata: {
    title: string;
    creator: string;
    timestamp: number;
  }): Promise<{
    success: boolean;
    transactionHash?: string;
    blockNumber?: number;
    blockHash?: string;
    verificationUrl?: string;
    error?: string;
    needsFunding?: boolean;
  }> {
    try {
      const wallet = await this.getWallet();
      const balance = await this.provider.getBalance(wallet.address);
      
      // Check if wallet has enough funds
      if (balance < ethers.parseEther('0.005')) {
        return {
          success: false,
          needsFunding: true,
          error: `Wallet needs funding. Send ETH to: ${wallet.address}`
        };
      }
      
      // Create blockchain anchor transaction
      const commitment = fileHash.startsWith('0x') ? fileHash : `0x${fileHash}`;
      const anchorData = {
        fileHash: commitment,
        title: metadata.title,
        creator: metadata.creator,
        timestamp: metadata.timestamp
      };
      
      // Encode metadata in transaction data
      const dataPayload = ethers.toUtf8Bytes(JSON.stringify(anchorData));
      
      console.log('Creating blockchain anchor transaction...');
      console.log('Wallet:', wallet.address);
      console.log('Balance:', ethers.formatEther(balance), 'ETH');
      
      // Send transaction to self with file hash in data
      const tx = await wallet.sendTransaction({
        to: wallet.address, // Self-transaction saves gas
        data: ethers.hexlify(dataPayload),
        value: BigInt(0)
      });
      
      console.log('Transaction submitted:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait(1);
      if (!receipt) {
        throw new Error('Transaction failed to confirm');
      }
      
      console.log('Transaction confirmed in block:', receipt.blockNumber);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        verificationUrl: `https://etherscan.io/tx/${receipt.hash}`
      };
      
    } catch (error) {
      console.error('Blockchain anchor failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }
  
  /**
   * Get verification status of a transaction
   */
  async getTransactionStatus(txHash: string): Promise<{
    confirmed: boolean;
    blockNumber?: number;
    confirmations?: number;
    error?: string;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { confirmed: false };
      }
      
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;
      
      return {
        confirmed: confirmations >= 1,
        blockNumber: receipt.blockNumber,
        confirmations
      };
    } catch (error) {
      return {
        confirmed: false,
        error: error instanceof Error ? error.message : 'Failed to check status'
      };
    }
  }
}