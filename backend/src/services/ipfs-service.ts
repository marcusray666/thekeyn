import { create } from 'ipfs-http-client';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import type { IPFSUploadResponse } from '../../shared/blockchain-schema.js';

// IPFS service class for handling decentralized storage
export class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY || '';
    this.pinataJWT = process.env.PINATA_JWT || '';
  }

  // Upload file to IPFS via Pinata
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    metadata?: { [key: string]: any }
  ): Promise<IPFSUploadResponse> {
    try {
      if (!this.pinataJWT) {
        throw new Error('Pinata JWT token not configured. Please add PINATA_JWT to environment variables.');
      }

      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename,
        contentType: mimeType,
      });

      // Add metadata
      const pinataMetadata = {
        name: filename,
        keyvalues: {
          creator: 'Loggin',
          uploadedAt: new Date().toISOString(),
          fileType: mimeType,
          ...metadata,
        },
      };

      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      const pinataOptions = {
        cidVersion: 1,
      };

      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json() as { IpfsHash: string; PinSize: number };

      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        fileSize: result.PinSize,
        uploadId: uuidv4(),
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload JSON metadata to IPFS
  async uploadMetadata(metadata: any): Promise<IPFSUploadResponse> {
    try {
      if (!this.pinataJWT) {
        throw new Error('Pinata JWT token not configured. Please add PINATA_JWT to environment variables.');
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `metadata-${Date.now()}.json`,
            keyvalues: {
              type: 'nft-metadata',
              creator: 'Loggin',
              uploadedAt: new Date().toISOString(),
            },
          },
          pinataOptions: {
            cidVersion: 1,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Pinata metadata upload failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json() as { IpfsHash: string; PinSize: number };

      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        fileSize: result.PinSize,
        uploadId: uuidv4(),
      };
    } catch (error) {
      console.error('IPFS metadata upload error:', error);
      throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate NFT metadata standard (ERC-721)
  generateNFTMetadata(
    work: any,
    ipfsImageUrl: string,
    creatorAddress: string,
    externalUrl?: string
  ) {
    const attributes = [
      {
        trait_type: 'Creator',
        value: work.creator || 'Unknown',
      },
      {
        trait_type: 'File Type',
        value: work.mimeType || 'Unknown',
      },
      {
        trait_type: 'Certificate ID',
        value: work.certificateId,
      },
      {
        trait_type: 'Creation Date',
        value: new Date(work.createdAt).toISOString().split('T')[0],
        display_type: 'date',
      },
      {
        trait_type: 'File Size',
        value: Math.round((work.fileSize || 0) / 1024),
        display_type: 'number',
      },
      {
        trait_type: 'Protection Level',
        value: 'Blockchain Certified',
      },
    ];

    // Add animation_url for video/audio files
    let animationUrl;
    if (work.mimeType?.startsWith('video/') || work.mimeType?.startsWith('audio/')) {
      animationUrl = ipfsImageUrl;
    }

    return {
      name: work.title,
      description: `${work.description}\n\nThis work is protected and verified by Loggin's blockchain certificate system. Original creation date: ${new Date(work.createdAt).toLocaleDateString()}.`,
      image: ipfsImageUrl,
      external_url: externalUrl || `https://loggin.app/certificate/${work.certificateId}`,
      animation_url: animationUrl,
      attributes,
      properties: {
        creator: {
          address: creatorAddress,
          name: work.creator,
        },
        certificate: {
          id: work.certificateId,
          hash: work.fileHash,
          blockchain_hash: work.blockchainHash,
        },
        protection: {
          platform: 'Loggin',
          verified: true,
          timestamp: work.createdAt,
        },
      },
    };
  }

  // Get file from IPFS
  async getFile(ipfsHash: string): Promise<Buffer> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from IPFS: ${response.status}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('IPFS fetch error:', error);
      throw new Error(`Failed to fetch file from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if IPFS service is configured
  isConfigured(): boolean {
    return !!(this.pinataJWT || (this.pinataApiKey && this.pinataSecretKey));
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured(),
      provider: 'Pinata',
      hasJWT: !!this.pinataJWT,
      hasApiKeys: !!(this.pinataApiKey && this.pinataSecretKey),
    };
  }
}