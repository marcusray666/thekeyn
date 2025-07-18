import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export blockchain schema for convenience
export * from "./blockchain-schema";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, premium, enterprise
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  walletAddress: text("wallet_address"), // For NFT minting
  displayName: text("display_name"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  website: text("website"),
  location: text("location"),
  isVerified: boolean("is_verified").default(false),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  totalLikes: integer("total_likes").default(0),
  themePreference: text("theme_preference").default("liquid-glass"),
  settings: text("settings").default("{}"), // JSON string for settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
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
  // Social features
  isPublic: boolean("is_public").default(false),
  tags: text("tags").array().default([]),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  viewCount: integer("view_count").default(0),
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

// Social media tables
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workId: integer("work_id").references(() => works.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workId: integer("work_id").references(() => works.id).notNull(),
  parentId: integer("parent_id").references(() => comments.id), // For reply threads
  content: text("content").notNull(),
  mentionedUsers: text("mentioned_users").array().default([]), // Array of mentioned usernames
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workId: integer("work_id").references(() => works.id).notNull(),
  shareText: text("share_text"), // Optional message when sharing
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // follow, like, comment, mention, share
  fromUserId: integer("from_user_id").references(() => users.id),
  workId: integer("work_id").references(() => works.id),
  commentId: integer("comment_id").references(() => comments.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Social schema exports
export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  workId: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  workId: true,
  parentId: true,
  content: true,
  mentionedUsers: true,
});

export const insertShareSchema = createInsertSchema(shares).pick({
  userId: true,
  workId: true,
  shareText: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  fromUserId: true,
  workId: true,
  commentId: true,
  message: true,
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Share = typeof shares.$inferSelect;
export type InsertShare = z.infer<typeof insertShareSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
