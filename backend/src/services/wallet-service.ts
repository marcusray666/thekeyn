import { ethers } from 'ethers';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Service for managing user wallets automatically
export class WalletService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  // Generate a new wallet for a user
  async generateWalletForUser(userId: number): Promise<{
    address: string;
    privateKey: string; // encrypted
  }> {
    try {
      // Generate new wallet
      const wallet = ethers.Wallet.createRandom();
      
      // Encrypt the private key
      const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey);
      
      // Update user with wallet address
      await db
        .update(users)
        .set({ walletAddress: wallet.address })
        .where(eq(users.id, userId));

      return {
        address: wallet.address,
        privateKey: encryptedPrivateKey,
      };
    } catch (error) {
      console.error('Wallet generation error:', error);
      throw new Error('Failed to generate wallet');
    }
  }

  // Get or create wallet for user
  async getOrCreateUserWallet(userId: number): Promise<string> {
    try {
      // Check if user already has a wallet
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (user?.walletAddress) {
        return user.walletAddress;
      }

      // Generate new wallet
      const wallet = await this.generateWalletForUser(userId);
      return wallet.address;
    } catch (error) {
      console.error('Get wallet error:', error);
      throw new Error('Failed to get user wallet');
    }
  }

  // Encrypt private key for storage
  private encryptPrivateKey(privateKey: string): string {
    const cipher = crypto.createCipher('aes192', this.encryptionKey);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt private key for use
  private decryptPrivateKey(encryptedPrivateKey: string): string {
    const decipher = crypto.createDecipher('aes192', this.encryptionKey);
    let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Get wallet instance for transactions
  async getUserWalletInstance(userId: number, provider: ethers.JsonRpcProvider): Promise<ethers.Wallet | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user?.walletAddress) {
        return null;
      }

      // For security, we'll use the app's master wallet for now
      // In production, you'd store encrypted user private keys
      const masterPrivateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      if (!masterPrivateKey) {
        throw new Error('Master wallet not configured');
      }

      return new ethers.Wallet(masterPrivateKey, provider);
    } catch (error) {
      console.error('Wallet instance error:', error);
      return null;
    }
  }

  // Generate a deterministic wallet from user data (alternative approach)
  generateDeterministicWallet(userId: number, userEmail: string): ethers.Wallet {
    // Create a seed from user data + app secret
    const seed = crypto
      .createHash('sha256')
      .update(`${userId}-${userEmail}-${this.encryptionKey}`)
      .digest('hex');
    
    return new ethers.Wallet(seed);
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!this.encryptionKey && this.encryptionKey !== 'default-key-change-in-production';
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured(),
      hasEncryptionKey: !!this.encryptionKey,
      canGenerateWallets: true,
    };
  }
}