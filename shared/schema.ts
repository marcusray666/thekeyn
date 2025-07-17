import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, premium, enterprise
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  walletAddress: text("wallet_address"), // For NFT minting
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileHash: text("file_hash").notNull(),
  certificateId: text("certificate_id").notNull().unique(),
  blockchainHash: text("blockchain_hash"),
  creatorName: text("creator_name").notNull(),
  collaborators: text("collaborators").array().default([]), // Array of collaborator names/emails
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  workId: integer("work_id").references(() => works.id).notNull(),
  certificateId: text("certificate_id").notNull().unique(),
  pdfPath: text("pdf_path"),
  qrCode: text("qr_code"),
  shareableLink: text("shareable_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const copyrightApplications = pgTable("copyright_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workId: integer("work_id").references(() => works.id).notNull(),
  officeId: text("office_id").notNull(), // Copyright office identifier
  status: text("status").notNull().default("draft"), // draft, submitted, processing, approved, rejected
  applicationData: text("application_data").notNull(), // JSON string of application details
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  registrationNumber: text("registration_number"), // Assigned by copyright office
  estimatedCompletion: timestamp("estimated_completion"),
  fee: text("fee").notNull(),
  documents: text("documents").array().default([]), // Array of document paths/URLs
  notes: text("notes"), // Internal notes or feedback from copyright office
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertWorkSchema = createInsertSchema(works).pick({
  title: true,
  description: true,
  filename: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  fileHash: true,
  certificateId: true,
  blockchainHash: true,
  creatorName: true,
  collaborators: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  workId: true,
  certificateId: true,
  pdfPath: true,
  qrCode: true,
  shareableLink: true,
});

export const nftMints = pgTable("nft_mints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workId: integer("work_id").references(() => works.id).notNull(),
  certificateId: text("certificate_id").references(() => certificates.certificateId).notNull(),
  blockchain: text("blockchain").notNull(), // ethereum, polygon, arbitrum, base
  contractAddress: text("contract_address"),
  tokenId: text("token_id"),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, minting, completed, failed
  mintingCost: text("minting_cost"), // Gas fees + platform fees
  royaltyPercentage: integer("royalty_percentage").default(10), // Default 10% royalties
  metadataUri: text("metadata_uri"), // IPFS or other decentralized storage
  marketplaceListings: text("marketplace_listings").array().default([]), // OpenSea, Rarible, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCopyrightApplicationSchema = createInsertSchema(copyrightApplications).pick({
  userId: true,
  workId: true,
  officeId: true,
  status: true,
  applicationData: true,
  submissionDate: true,
  registrationNumber: true,
  estimatedCompletion: true,
  fee: true,
  documents: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWork = z.infer<typeof insertWorkSchema>;
export type Work = typeof works.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type CopyrightApplication = typeof copyrightApplications.$inferSelect;
export type InsertCopyrightApplication = z.infer<typeof insertCopyrightApplicationSchema>;

export const insertNftMintSchema = createInsertSchema(nftMints).pick({
  userId: true,
  workId: true,
  certificateId: true,
  blockchain: true,
  contractAddress: true,
  tokenId: true,
  transactionHash: true,
  status: true,
  mintingCost: true,
  royaltyPercentage: true,
  metadataUri: true,
  marketplaceListings: true,
});

export type NftMint = typeof nftMints.$inferSelect;
export type InsertNftMint = z.infer<typeof insertNftMintSchema>;
