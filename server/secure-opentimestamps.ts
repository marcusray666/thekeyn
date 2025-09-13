import crypto from 'crypto';
import { submit, upgrade, verify, newTree } from '@lacrypta/typescript-opentimestamps';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Secure OpenTimestamps implementation that creates REAL binary .ots files
 * This replaces the previous JSON-based implementation with proper OpenTimestamps format
 */
export class SecureOpenTimestampsService {
  
  /**
   * Create a REAL binary .ots timestamp that can be verified on opentimestamps.org
   */
  async createBinaryTimestamp(fileBuffer: Buffer): Promise<{
    success: boolean;
    otsData?: Uint8Array;
    otsFilename?: string;
    fileHash: string;
    status: 'pending' | 'failed';
    verificationInstructions?: string;
    error?: string;
  }> {
    try {
      // Generate SHA-256 hash of file
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      const digest = crypto.createHash('sha256').update(fileBuffer).digest();
      
      console.log('Creating OpenTimestamps proof for file hash:', fileHash);
      
      // Create timestamp using proper OpenTimestamps library
      const tree = newTree(digest);
      const receipt = await submit(tree);
      
      // Convert to Uint8Array for proper binary format
      const otsData = new Uint8Array(receipt.timestamp);
      const otsFilename = `${fileHash}.ots`;
      
      console.log('OpenTimestamps receipt created successfully');
      console.log('Receipt size:', otsData.length, 'bytes');
      
      return {
        success: true,
        otsData,
        otsFilename,
        fileHash,
        status: 'pending',
        verificationInstructions: 'Timestamp created and submitted to Bitcoin calendar servers. Confirmation will happen when included in Bitcoin blockchain (typically 1-6 hours).'
      };
      
    } catch (error) {
      console.error('OpenTimestamps creation failed:', error);
      
      return {
        success: false,
        fileHash: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
        status: 'failed',
        error: error instanceof Error ? error.message : 'OpenTimestamps service unavailable'
      };
    }
  }
  
  /**
   * Upgrade an existing .ots file to get Bitcoin blockchain confirmations
   */
  async upgradeTimestamp(otsData: Uint8Array, originalFileBuffer: Buffer): Promise<{
    success: boolean;
    verified: boolean;
    upgradedOtsData?: Uint8Array;
    bitcoinTxId?: string;
    blockHeight?: number;
    error?: string;
  }> {
    try {
      console.log('Attempting to upgrade OpenTimestamps proof...');
      
      // Attempt to upgrade the receipt
      const upgraded = await upgrade(otsData);
      
      // Verify the upgraded receipt
      const digest = crypto.createHash('sha256').update(originalFileBuffer).digest();
      const isVerified = await verify(digest, upgraded);
      
      if (isVerified) {
        console.log('✅ OpenTimestamps proof successfully verified with Bitcoin blockchain!');
        
        // Extract Bitcoin transaction info from the receipt if available
        const bitcoinInfo = this.extractBitcoinInfo(upgraded);
        
        return {
          success: true,
          verified: true,
          upgradedOtsData: upgraded,
          ...bitcoinInfo
        };
      } else {
        console.log('⏳ OpenTimestamps proof not yet confirmed in Bitcoin blockchain');
        
        return {
          success: true,
          verified: false,
          upgradedOtsData: upgraded
        };
      }
      
    } catch (error) {
      console.error('OpenTimestamps upgrade failed:', error);
      
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Upgrade failed'
      };
    }
  }
  
  /**
   * Verify an existing .ots file against the original file
   */
  async verifyTimestamp(otsData: Uint8Array, originalFileBuffer: Buffer): Promise<{
    verified: boolean;
    bitcoinTxId?: string;
    blockHeight?: number;
    timestamp?: Date;
    error?: string;
  }> {
    try {
      const digest = crypto.createHash('sha256').update(originalFileBuffer).digest();
      const isVerified = await verify(digest, otsData);
      
      if (isVerified) {
        const bitcoinInfo = this.extractBitcoinInfo(otsData);
        return {
          verified: true,
          ...bitcoinInfo
        };
      } else {
        return {
          verified: false
        };
      }
      
    } catch (error) {
      console.error('OpenTimestamps verification failed:', error);
      
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }
  
  /**
   * Extract Bitcoin transaction info from OTS receipt (if available)
   */
  private extractBitcoinInfo(otsData: Uint8Array): {
    bitcoinTxId?: string;
    blockHeight?: number;
    timestamp?: Date;
  } {
    try {
      // This is a simplified extraction - the actual implementation would need
      // to parse the OTS file format to extract Bitcoin attestation data
      // For now, return empty object since this requires deep OTS format parsing
      return {};
    } catch (error) {
      console.error('Failed to extract Bitcoin info from OTS:', error);
      return {};
    }
  }
  
  /**
   * Save binary .ots file to filesystem (for user download)
   */
  async saveOtsFile(otsData: Uint8Array, filename: string, directory = 'proofs'): Promise<string> {
    try {
      // Ensure proofs directory exists
      const proofsDir = path.join(process.cwd(), directory);
      if (!fs.existsSync(proofsDir)) {
        fs.mkdirSync(proofsDir, { recursive: true });
      }
      
      const filePath = path.join(proofsDir, filename);
      
      // Write binary .ots file
      fs.writeFileSync(filePath, Buffer.from(otsData));
      
      console.log('✅ Binary .ots file saved:', filePath);
      return filePath;
      
    } catch (error) {
      console.error('Failed to save .ots file:', error);
      throw error;
    }
  }
  
  /**
   * Load binary .ots file from filesystem
   */
  async loadOtsFile(filePath: string): Promise<Uint8Array> {
    try {
      const buffer = fs.readFileSync(filePath);
      return new Uint8Array(buffer);
    } catch (error) {
      console.error('Failed to load .ots file:', error);
      throw error;
    }
  }
  
  /**
   * Background job to upgrade pending timestamps
   * Should be called periodically (every few hours) to check for confirmations
   */
  async upgradeAllPendingTimestamps(): Promise<{
    processed: number;
    verified: number;
    stillPending: number;
    errors: number;
  }> {
    console.log('🔄 Running background OpenTimestamps upgrade job...');
    
    const stats = {
      processed: 0,
      verified: 0,
      stillPending: 0,
      errors: 0
    };
    
    try {
      const proofsDir = path.join(process.cwd(), 'proofs');
      if (!fs.existsSync(proofsDir)) {
        return stats;
      }
      
      const otsFiles = fs.readdirSync(proofsDir).filter(f => f.endsWith('.ots'));
      
      for (const otsFile of otsFiles) {
        stats.processed++;
        
        try {
          const otsPath = path.join(proofsDir, otsFile);
          const otsData = await this.loadOtsFile(otsPath);
          
          // For upgrade job, we'd need to track which files these correspond to
          // This would require a database lookup or file naming convention
          // For now, just attempt upgrade without verification
          const upgradeResult = await upgrade(otsData);
          const upgraded = upgradeResult.timestamp || otsData;
          
          // Save upgraded version back
          fs.writeFileSync(otsPath, Buffer.from(upgraded));
          
          // Check if now verified (would need original file for this)
          // stats.verified++; // Would increment if verified
          stats.stillPending++;
          
        } catch (error) {
          console.error(`Failed to upgrade ${otsFile}:`, error);
          stats.errors++;
        }
      }
      
      console.log('📊 OpenTimestamps upgrade job completed:', stats);
      return stats;
      
    } catch (error) {
      console.error('OpenTimestamps upgrade job failed:', error);
      return stats;
    }
  }
}