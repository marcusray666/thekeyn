import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// IPFS storage tracking
export const ipfsUploads = pgTable("ipfs_uploads", {
  id: varchar("id").primaryKey().notNull(),
  workId: integer("work_id").notNull(),
  ipfsHash: varchar("ipfs_hash").notNull(),
  ipfsUrl: varchar("ipfs_url").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: varchar("status", { enum: ["uploading", "uploaded", "failed"] }).default("uploading"),
});

// NFT metadata structure
export const nftMetadata = pgTable("nft_metadata", {
  id: varchar("id").primaryKey().notNull(),
  workId: integer("work_id").notNull(),
  metadataUri: varchar("metadata_uri").notNull(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  image: varchar("image").notNull(), // IPFS URL
  externalUrl: varchar("external_url"),
  animationUrl: varchar("animation_url"),
  attributes: jsonb("attributes").$type<Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Smart contract interactions
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: varchar("id").primaryKey().notNull(),
  workId: integer("work_id").notNull(),
  metadataId: varchar("metadata_id"),
  network: varchar("network", { enum: ["ethereum", "polygon", "arbitrum", "base"] }).notNull(),
  contractAddress: varchar("contract_address").notNull(),
  transactionHash: varchar("transaction_hash"),
  tokenId: varchar("token_id"),
  fromAddress: varchar("from_address").notNull(),
  toAddress: varchar("to_address"),
  gasUsed: varchar("gas_used"),
  gasPrice: varchar("gas_price"),
  status: varchar("status", { enum: ["pending", "confirmed", "failed"] }).default("pending"),
  blockNumber: integer("block_number"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// NFT ownership tracking
export const nftTokens = pgTable("nft_tokens", {
  id: varchar("id").primaryKey().notNull(),
  workId: integer("work_id").notNull(),
  transactionId: varchar("transaction_id").notNull(),
  tokenId: varchar("token_id").notNull(),
  contractAddress: varchar("contract_address").notNull(),
  network: varchar("network").notNull(),
  ownerAddress: varchar("owner_address").notNull(),
  creatorAddress: varchar("creator_address").notNull(),
  mintedAt: timestamp("minted_at").defaultNow(),
  transferCount: integer("transfer_count").default(0),
  lastTransferAt: timestamp("last_transfer_at"),
  isForSale: boolean("is_for_sale").default(false),
  salePrice: varchar("sale_price"),
  royaltyPercentage: integer("royalty_percentage").default(10),
});

// Blockchain network configurations
export const blockchainNetworks = pgTable("blockchain_networks", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  chainId: integer("chain_id").notNull(),
  rpcUrl: varchar("rpc_url").notNull(),
  explorerUrl: varchar("explorer_url").notNull(),
  nativeCurrency: jsonb("native_currency").$type<{
    name: string;
    symbol: string;
    decimals: number;
  }>(),
  contractAddress: varchar("contract_address").notNull(),
  isActive: boolean("is_active").default(true),
  gasEstimate: varchar("gas_estimate").default("0.01"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types
export type IpfsUpload = typeof ipfsUploads.$inferSelect;
export type InsertIpfsUpload = typeof ipfsUploads.$inferInsert;

export type NftMetadata = typeof nftMetadata.$inferSelect;
export type InsertNftMetadata = typeof nftMetadata.$inferInsert;

export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type InsertBlockchainTransaction = typeof blockchainTransactions.$inferInsert;

export type NftToken = typeof nftTokens.$inferSelect;
export type InsertNftToken = typeof nftTokens.$inferInsert;

export type BlockchainNetwork = typeof blockchainNetworks.$inferSelect;
export type InsertBlockchainNetwork = typeof blockchainNetworks.$inferInsert;

// Zod schemas for validation
export const insertIpfsUploadSchema = createInsertSchema(ipfsUploads);
export const insertNftMetadataSchema = createInsertSchema(nftMetadata);
export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions);
export const insertNftTokenSchema = createInsertSchema(nftTokens);
export const insertBlockchainNetworkSchema = createInsertSchema(blockchainNetworks);

// Extended types for API responses
export interface NFTMintRequest {
  workId: number;
  network: "ethereum" | "polygon" | "arbitrum" | "base";
  recipientAddress?: string;
  royaltyPercentage?: number;
  salePrice?: string;
}

export interface NFTMintResponse {
  success: boolean;
  transactionId: string;
  transactionHash?: string;
  tokenId?: string;
  ipfsHash: string;
  metadataUri: string;
  estimatedGasFee: string;
  networkFee: string;
}

export interface IPFSUploadResponse {
  success: boolean;
  ipfsHash: string;
  ipfsUrl: string;
  fileSize: number;
  uploadId: string;
}