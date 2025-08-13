import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { works } from '@shared/schema';
import { 
  ipfsUploads, 
  nftMetadata, 
  blockchainTransactions, 
  nftTokens,
  insertNftMetadataSchema,
  insertBlockchainTransactionSchema,
  insertNftTokenSchema,
  type NFTMintRequest 
} from '@shared/blockchain-schema';
import { IPFSService } from '../services/ipfs-service';
import { BlockchainService } from '../services/blockchain-service';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

// Auth interface
interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; email: string };
  userId?: number;
}

const router = Router();
const ipfsService = new IPFSService();
const blockchainService = new BlockchainService();

// NFT Minting Request Schema
const nftMintRequestSchema = z.object({
  workId: z.number(),
  network: z.enum(['ethereum', 'polygon', 'arbitrum', 'base']),
  recipientAddress: z.string().optional(),
  royaltyPercentage: z.number().min(0).max(25).default(10),
  salePrice: z.string().optional(),
});

// Upload work to IPFS
router.post('/upload-to-ipfs/:workId', async (req: AuthenticatedRequest, res) => {
  try {
    const workId = parseInt(req.params.workId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get work details
    const [work] = await db
      .select()
      .from(works)
      .where(eq(works.id, workId));

    if (!work || work.userId !== userId) {
      return res.status(404).json({ error: 'Work not found or access denied' });
    }

    // Check if already uploaded to IPFS
    const existingUpload = await db
      .select()
      .from(ipfsUploads)
      .where(eq(ipfsUploads.workId, workId));

    if (existingUpload.length > 0) {
      return res.json({
        success: true,
        ipfs: existingUpload[0],
        message: 'File already uploaded to IPFS'
      });
    }

    // Read the file
    const filePath = join(process.cwd(), 'uploads', work.filename);
    const fileBuffer = await readFile(filePath);

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadFile(
      fileBuffer,
      work.originalName,
      work.mimeType,
      {
        workId: work.id,
        title: work.title,
        creator: work.creatorName,
        certificateId: work.certificateId,
      }
    );

    // Save IPFS upload record
    const [ipfsUpload] = await db
      .insert(ipfsUploads)
      .values({
        id: ipfsResult.uploadId,
        workId: work.id,
        ipfsHash: ipfsResult.ipfsHash,
        ipfsUrl: ipfsResult.ipfsUrl,
        fileSize: ipfsResult.fileSize,
        mimeType: work.mimeType,
        status: 'uploaded',
      })
      .returning();

    res.json({
      success: true,
      ipfs: ipfsUpload,
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload to IPFS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate and upload NFT metadata
router.post('/generate-metadata/:workId', async (req: AuthenticatedRequest, res) => {
  try {
    const workId = parseInt(req.params.workId);
    const userId = req.user?.id;
    const { externalUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get work and IPFS upload
    const [work] = await db
      .select()
      .from(works)
      .where(eq(works.id, workId));

    if (!work || work.userId !== userId) {
      return res.status(404).json({ error: 'Work not found or access denied' });
    }

    const [ipfsUpload] = await db
      .select()
      .from(ipfsUploads)
      .where(eq(ipfsUploads.workId, workId));

    if (!ipfsUpload) {
      return res.status(400).json({ error: 'Work must be uploaded to IPFS first' });
    }

    // Check if metadata already exists
    const existingMetadata = await db
      .select()
      .from(nftMetadata)
      .where(eq(nftMetadata.workId, workId));

    if (existingMetadata.length > 0) {
      return res.json({
        success: true,
        metadata: existingMetadata[0],
        message: 'Metadata already generated'
      });
    }

    // Get user wallet address or use a default
    const user = await db.select().from(works).where(eq(works.userId, userId));
    const creatorAddress = req.body.creatorAddress || '0x0000000000000000000000000000000000000000';

    // Generate NFT metadata
    const metadata = ipfsService.generateNFTMetadata(
      work,
      ipfsUpload.ipfsUrl,
      creatorAddress,
      externalUrl
    );

    // Upload metadata to IPFS
    const metadataResult = await ipfsService.uploadMetadata(metadata);

    // Save metadata record
    const [metadataRecord] = await db
      .insert(nftMetadata)
      .values({
        id: randomUUID(),
        workId: work.id,
        metadataUri: metadataResult.ipfsUrl,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        externalUrl: metadata.external_url,
        animationUrl: metadata.animation_url,
        attributes: metadata.attributes,
      })
      .returning();

    res.json({
      success: true,
      metadata: metadataRecord,
      ipfsMetadata: metadataResult,
    });
  } catch (error) {
    console.error('Metadata generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mint NFT
router.post('/mint-nft', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requestData = nftMintRequestSchema.parse(req.body);

    // Get work and verify ownership
    const [work] = await db
      .select()
      .from(works)
      .where(eq(works.id, requestData.workId));

    if (!work || work.userId !== userId) {
      return res.status(404).json({ error: 'Work not found or access denied' });
    }

    // Get metadata
    const [metadata] = await db
      .select()
      .from(nftMetadata)
      .where(eq(nftMetadata.workId, requestData.workId));

    if (!metadata) {
      return res.status(400).json({ error: 'Metadata must be generated first' });
    }

    // Check for existing pending/confirmed transaction
    const existingTransaction = await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.workId, requestData.workId));

    if (existingTransaction.length > 0) {
      const existing = existingTransaction[0];
      if (existing.status === 'confirmed') {
        return res.status(400).json({ error: 'NFT already minted for this work' });
      }
      if (existing.status === 'pending') {
        return res.json({
          success: true,
          transaction: existing,
          message: 'Minting transaction already in progress'
        });
      }
    }

    // Get creator address from request or user wallet
    const creatorAddress = requestData.recipientAddress || '0x0000000000000000000000000000000000000000';

    // Mint NFT using blockchain service (app-managed)
    const mintResult = await blockchainService.mintNFTForUser(
      requestData,
      metadata.metadataUri,
      userId
    );

    // Save transaction record
    const [transaction] = await db
      .insert(blockchainTransactions)
      .values({
        id: mintResult.transactionId,
        workId: requestData.workId,
        metadataId: metadata.id,
        network: requestData.network,
        contractAddress: blockchainService.getSupportedNetworks()
          .find(n => n.id === requestData.network)?.contractAddress || '',
        transactionHash: mintResult.transactionHash,
        tokenId: mintResult.tokenId,
        fromAddress: creatorAddress,
        toAddress: requestData.recipientAddress,
        status: mintResult.transactionHash ? 'pending' : 'failed',
      })
      .returning();

    // If successful, create NFT token record
    if (mintResult.success && mintResult.tokenId) {
      await db
        .insert(nftTokens)
        .values({
          id: randomUUID(),
          workId: requestData.workId,
          transactionId: transaction.id,
          tokenId: mintResult.tokenId,
          contractAddress: transaction.contractAddress,
          network: requestData.network,
          ownerAddress: requestData.recipientAddress || creatorAddress,
          creatorAddress,
          royaltyPercentage: requestData.royaltyPercentage,
        });
    }

    res.json({
      success: true,
      mintResult,
      transaction,
    });
  } catch (error) {
    console.error('NFT minting error:', error);
    res.status(500).json({ 
      error: 'Failed to mint NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get transaction status
router.get('/transaction-status/:transactionId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const transactionId = req.params.transactionId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [transaction] = await db
      .select()
      .from(blockchainTransactions)
      .where(eq(blockchainTransactions.id, transactionId));

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify user owns the work
    const [work] = await db
      .select()
      .from(works)
      .where(eq(works.id, transaction.workId));

    if (!work || work.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let status = transaction;

    // If transaction has hash, check blockchain status
    if (transaction.transactionHash && transaction.status === 'pending') {
      try {
        const blockchainStatus = await blockchainService.getTransactionStatus(
          transaction.transactionHash,
          transaction.network
        );

        // Update status in database if changed
        if (blockchainStatus.status !== 'pending') {
          const [updatedTransaction] = await db
            .update(blockchainTransactions)
            .set({
              status: blockchainStatus.status,
              blockNumber: blockchainStatus.blockNumber,
              gasUsed: blockchainStatus.gasUsed,
              confirmedAt: blockchainStatus.status === 'confirmed' ? new Date() : undefined,
            })
            .where(eq(blockchainTransactions.id, transactionId))
            .returning();

          status = updatedTransaction;
        }
      } catch (error) {
        console.error('Blockchain status check error:', error);
      }
    }

    res.json({
      success: true,
      transaction: status,
    });
  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({ 
      error: 'Failed to get transaction status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get gas estimates
router.post('/estimate-gas', async (req: AuthenticatedRequest, res) => {
  try {
    const { network, recipientAddress, workId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get metadata URI for estimation
    const [metadata] = await db
      .select()
      .from(nftMetadata)
      .where(eq(nftMetadata.workId, workId));

    if (!metadata) {
      return res.status(400).json({ error: 'Metadata not found' });
    }

    const estimates = await blockchainService.estimateGasCosts(
      network,
      recipientAddress,
      metadata.metadataUri
    );

    res.json({
      success: true,
      estimates,
    });
  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({ 
      error: 'Failed to estimate gas',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get supported networks
router.get('/networks', async (req, res) => {
  try {
    const networks = blockchainService.getSupportedNetworks();
    res.json({
      success: true,
      networks,
    });
  } catch (error) {
    console.error('Networks fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to get networks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get service status
router.get('/status', async (req, res) => {
  try {
    const ipfsStatus = ipfsService.getStatus();
    const blockchainStatus = blockchainService.getStatus();

    res.json({
      success: true,
      ipfs: ipfsStatus,
      blockchain: blockchainStatus,
      ready: ipfsStatus.configured && blockchainStatus.configured,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to get service status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's NFTs
router.get('/my-nfts', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all NFTs for user's works
    const userNfts = await db
      .select({
        nft: nftTokens,
        work: works,
        transaction: blockchainTransactions,
        metadata: nftMetadata,
      })
      .from(nftTokens)
      .innerJoin(works, eq(nftTokens.workId, works.id))
      .innerJoin(blockchainTransactions, eq(nftTokens.transactionId, blockchainTransactions.id))
      .leftJoin(nftMetadata, eq(blockchainTransactions.metadataId, nftMetadata.id))
      .where(eq(works.userId, userId));

    res.json({
      success: true,
      nfts: userNfts,
    });
  } catch (error) {
    console.error('NFTs fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to get NFTs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;