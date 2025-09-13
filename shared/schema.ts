import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, decimal, real, doublePrecision } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

// Re-export blockchain schema for convenience
export * from "./blockchain-schema";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // user, admin, moderator
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, starter, pro
  subscriptionStatus: text("subscription_status").default("active"), // active, cancelled, expired
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  monthlyUploads: integer("monthly_uploads").default(0), // Current month upload count
  monthlyUploadLimit: integer("monthly_upload_limit").default(3), // Monthly upload limit based on tier
  lastUploadReset: timestamp("last_upload_reset").defaultNow(), // When monthly counter was last reset
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
  lastLoginAt: timestamp("last_login_at"),
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename"),
  fileUrl: text("file_url"), // CDN URL for accessing the file
  originalName: text("original_name"),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size"),
  fileHash: text("file_hash").notNull(),
  certificateId: text("certificate_id"),
  blockchainHash: text("blockchain_hash"),
  creatorName: text("creator_name"),
  collaborators: text("collaborators").array().default([]), // Array of collaborator names/emails
  // Social features
  isPublic: boolean("is_public").default(false),
  tags: text("tags").array().default([]),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  viewCount: integer("view_count").default(0),
  // Content moderation
  moderationStatus: text("moderation_status").default("pending"),
  moderationFlags: text("moderation_flags").array().default([]),
  moderationScore: real("moderation_score").default(0),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
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
  isDownloadable: boolean("is_downloadable").default(false), // Based on subscription tier
  hasCustomBranding: boolean("has_custom_branding").default(false), // Pro+ feature
  verificationProof: text("verification_proof"), // JSON string of verification proof
  verificationLevel: text("verification_level").default("basic"), // basic, enhanced, premium
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tier: text("tier").notNull(), // free, starter, pro, agency
  status: text("status").notNull().default("active"), // active, cancelled, expired, pending
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  priceId: text("price_id"), // Stripe price ID
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  features: text("features").default("{}"), // JSON string of enabled features
  teamSize: integer("team_size").default(1), // For agency plans
  apiKey: text("api_key"), // For Pro+ plans
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionUsage = pgTable("subscription_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  month: text("month").notNull(), // YYYY-MM format
  uploadsUsed: integer("uploads_used").default(0),
  storageUsed: integer("storage_used").default(0), // in bytes
  apiCallsUsed: integer("api_calls_used").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = createInsertSchema(users).partial().omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertWorkSchema = createInsertSchema(works).pick({
  userId: true,
  title: true,
  description: true,
  filename: true,
  fileUrl: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  fileHash: true,
  certificateId: true,
  blockchainHash: true,
  creatorName: true,
  collaborators: true,
  moderationStatus: true,
  moderationFlags: true,
  moderationScore: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
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



export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWork = z.infer<typeof insertWorkSchema>;
export type Work = typeof works.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;


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

// Social posts table for Community feed
export const posts = pgTable("posts", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title"),
  description: text("description"),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  fileUrl: text("file_url"),
  filename: text("filename"),
  fileType: text("file_type"), // 'image', 'audio', 'video', etc.
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  hashtags: text("hashtags").array().default([]), // Hashtag functionality
  location: text("location"), // Location where photo/content was created
  mentionedUsers: text("mentioned_users").array().default([]), // User mentions
  isProtected: boolean("is_protected").default(false), // For shared protected works
  protectedWorkId: integer("protected_work_id").references(() => works.id), // Reference to protected work if shared
  isHidden: boolean("is_hidden").default(false), // For hiding posts from community wall
  tags: text("tags").array().default([]),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  views: integer("views").default(0),
  moderationStatus: text("moderation_status"),
  moderationFlags: text("moderation_flags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Keep community_posts for backward compatibility
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title"),
  description: text("description"),
  content: text("content"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  fileUrl: text("file_url"),
  filename: text("filename"),
  fileType: text("file_type"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"),
  hashtags: text("hashtags").array().default([]),
  location: text("location"),
  mentions: text("mentions").array().default([]),
  mentionedUsers: text("mentioned_users").array().default([]),
  isProtected: boolean("is_protected").default(false),
  protectedWorkId: integer("protected_work_id").references(() => works.id),
  isHidden: boolean("is_hidden").default(false),
  tags: text("tags").array().default([]),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  viewCount: integer("view_count").default(0),
  moderationStatus: text("moderation_status"),
  moderationFlags: text("moderation_flags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for posts table
export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  title: true,
  description: true,
  content: true,
  imageUrl: true,
  videoUrl: true,
  audioUrl: true,
  fileUrl: true,
  filename: true,
  fileType: true,
  mimeType: true,
  fileSize: true,
  hashtags: true,
  location: true,
  mentionedUsers: true,
  isProtected: true,
  protectedWorkId: true,
  isHidden: true,
  tags: true,
});

export const updatePostSchema = insertPostSchema.partial();

export type Post = typeof posts.$inferSelect & {
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  userEmail?: string;
  isLiked?: boolean;
};
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

// Post comments table
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: text("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  parentId: integer("parent_id"), // For reply threads
  content: text("content").notNull(),
  mentionedUsers: text("mentioned_users").array().default([]),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post reactions table (for different reaction types)
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: text("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'like', 'love', 'fire', 'star', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// User following relationships
export const userFollows = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced notifications system
export const userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'like', 'comment', 'follow', 'mention', 'post_share', 'work_featured', 'admin_action'
  fromUserId: integer("from_user_id").references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  workId: integer("work_id").references(() => works.id),
  commentId: integer("comment_id").references(() => postComments.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"), // Link to relevant content
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin audit logs for tracking administrative actions
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("adminId").references(() => users.id).notNull(),
  action: text("action").notNull(), // 'user_banned', 'content_removed', 'user_verified', 'subscription_modified'
  targetType: text("targetType").notNull(), // 'user', 'post', 'work', 'comment'
  targetId: text("targetId").notNull(),
  details: text("details"), // JSON string with action details
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Content reports for moderation
export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  reportedUserId: integer("reported_user_id").references(() => users.id),
  contentType: text("content_type").notNull(), // 'post', 'work', 'comment', 'user'
  contentId: text("content_id").notNull(),
  reason: text("reason").notNull(), // 'spam', 'inappropriate', 'copyright', 'harassment', 'other'
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"), // Action taken
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System metrics for admin dashboard
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0), // Users active in last 30 days
  newSignups: integer("new_signups").default(0),
  totalWorks: integer("total_works").default(0),
  totalPosts: integer("total_posts").default(0),
  totalRevenue: integer("total_revenue").default(0), // in cents
  storageUsed: integer("storage_used").default(0), // in bytes
  blockchainVerifications: integer("blockchain_verifications").default(0),
  reportsPending: integer("reports_pending").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content categories and tags
export const contentCategories = pgTable("content_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Icon identifier
  color: text("color"), // Color code
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences and settings
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  publicProfile: boolean("public_profile").default(true),
  showEmail: boolean("show_email").default(false),
  allowMessages: boolean("allow_messages").default(true),
  contentFilters: text("content_filters").array().default([]),
  preferredCategories: text("preferred_categories").array().default([]),
  language: text("language").default("en"),
  timezone: text("timezone").default("UTC"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User analytics and metrics
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow(),
  profileViews: integer("profile_views").default(0),
  postViews: integer("post_views").default(0),
  workViews: integer("work_views").default(0),
  newFollowers: integer("new_followers").default(0),
  totalEngagement: integer("total_engagement").default(0), // likes + comments + shares
  revenue: integer("revenue").default(0), // in cents
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace for selling protected works
export const marketplace = pgTable("marketplace", {
  id: serial("id").primaryKey(),
  workId: integer("work_id").references(() => works.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: text("currency").default("USD"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  licenseType: text("license_type").notNull(), // 'personal', 'commercial', 'exclusive'
  tags: text("tags").array().default([]),
  views: integer("views").default(0),
  favorites: integer("favorites").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase history
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  listingId: integer("listing_id").references(() => marketplace.id).notNull(),
  workId: integer("work_id").references(() => works.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'refunded'
  transactionId: text("transaction_id"),
  licenseGranted: text("license_granted").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaboration projects
export const collaborationProjects = pgTable("collaboration_projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  type: text("type").notNull(), // 'music', 'art', 'video', 'mixed'
  maxCollaborators: integer("max_collaborators").default(10),
  deadline: timestamp("deadline"),
  budget: integer("budget"), // in cents
  tags: text("tags").array().default([]),
  requirements: text("requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project collaborators
export const projectCollaborators = pgTable("project_collaborators", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => collaborationProjects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'owner', 'collaborator', 'reviewer'
  permissions: text("permissions").array().default([]), // 'edit', 'comment', 'share', 'export'
  joinedAt: timestamp("joined_at").defaultNow(),
  contribution: text("contribution"), // Description of their contribution
});

// Advanced blockchain verification table
export const blockchainVerifications = pgTable("blockchain_verifications", {
  id: text("id").primaryKey().default(nanoid()),
  workId: integer("work_id").notNull().references(() => works.id),
  certificateId: varchar("certificate_id").notNull(),
  fileHash: varchar("file_hash").notNull(),
  merkleRoot: varchar("merkle_root").notNull(),
  merkleProof: jsonb("merkle_proof").notNull().$type<string[]>(),
  timestampHash: varchar("timestamp_hash").notNull(),
  blockchainAnchor: varchar("blockchain_anchor").notNull(),
  ipfsHash: varchar("ipfs_hash"),
  digitalSignature: varchar("digital_signature").notNull(),
  networkId: varchar("network_id").notNull().default("ethereum"),
  blockNumber: integer("block_number"),
  transactionHash: varchar("transaction_hash"),
  contractAddress: varchar("contract_address"),
  tokenId: varchar("token_id"),
  verificationLevel: varchar("verification_level").notNull().default("basic"), // basic, enhanced, premium
  confidence: integer("confidence").notNull().default(100), // 0-100
  verificationTimestamp: timestamp("verification_timestamp").defaultNow(),
  lastVerified: timestamp("last_verified").defaultNow(),
  verificationCount: integer("verification_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BlockchainVerification = typeof blockchainVerifications.$inferSelect;
export type InsertBlockchainVerification = typeof blockchainVerifications.$inferInsert;

// Verification audit log for tracking verification attempts
export const verificationAuditLog = pgTable("verification_audit_log", {
  id: text("id").primaryKey().default(nanoid()),
  verificationId: text("verification_id").notNull().references(() => blockchainVerifications.id),
  verifierIp: varchar("verifier_ip"),
  verifierUserAgent: text("verifier_user_agent"),
  verificationResult: boolean("verification_result").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  verificationDetails: jsonb("verification_details").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type VerificationAuditLog = typeof verificationAuditLog.$inferSelect;
export type InsertVerificationAuditLog = typeof verificationAuditLog.$inferInsert;

// Insert schemas for new tables
export const insertPostCommentSchema = createInsertSchema(postComments).pick({
  postId: true,
  content: true,
  parentId: true,
  mentionedUsers: true,
});

export const insertUserFollowSchema = createInsertSchema(userFollows).pick({
  followerId: true,
  followingId: true,
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).pick({
  userId: true,
  type: true,
  fromUserId: true,
  postId: true,
  workId: true,
  commentId: true,
  title: true,
  message: true,
  actionUrl: true,
});

export const insertMarketplaceSchema = createInsertSchema(marketplace).pick({
  workId: true,
  title: true,
  description: true,
  price: true,
  currency: true,
  licenseType: true,
  tags: true,
});

export const insertCollaborationProjectSchema = createInsertSchema(collaborationProjects).pick({
  title: true,
  description: true,
  type: true,
  maxCollaborators: true,
  deadline: true,
  budget: true,
  tags: true,
  requirements: true,
});

// Type exports
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type ContentCategory = typeof contentCategories.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
export type UserAnalytic = typeof userAnalytics.$inferSelect;
export type MarketplaceListing = typeof marketplace.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type CollaborationProject = typeof collaborationProjects.$inferSelect;
export type InsertCollaborationProject = z.infer<typeof insertCollaborationProjectSchema>;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;

// Subscription types
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionUsage = typeof subscriptionUsage.$inferSelect;
export type InsertSubscriptionUsage = typeof subscriptionUsage.$inferInsert;

// Social media tables
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Background preferences tables
export const userBackgroundPreferences = pgTable("user_background_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),

  // NEW canonical columns (plural arrays)
  gradientType: text("gradient_type").notNull().default("linear"),
  colorScheme: text("color_scheme").notNull().default("cool"),
  primaryColors: text("primary_colors").array().notNull().default(sql`ARRAY[]::text[]`),
  secondaryColors: text("secondary_colors").array().notNull().default(sql`ARRAY[]::text[]`),

  direction: text("direction").notNull().default("to bottom right"),
  intensity: doublePrecision("intensity").notNull().default(0.5),

  animationSpeed: text("animation_speed").notNull().default("medium"),
  timeOfDayPreference: text("time_of_day_preference"),
  moodTag: text("mood_tag"),

  usageCount: integer("usage_count").notNull().default(0),
  lastUsed: timestamp("last_used", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const backgroundInteractions = pgTable("background_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gradientId: text("gradient_id").notNull(),
  interactionType: text("interaction_type").notNull(),
  timeSpent: integer("time_spent"),
  pageContext: text("page_context"),
  deviceType: text("device_type"),
  timeOfDay: text("time_of_day"),
  weatherContext: text("weather_context"),
  sessionDuration: integer("session_duration"),
  createdAt: timestamp("created_at").defaultNow(),
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
  parentId: integer("parent_id"), // For reply threads
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

// Messaging System Tables
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().notNull(),
  title: text("title"), // Optional title for group conversations
  type: text("type").notNull().default("direct"), // 'direct' or 'group'
  isArchived: boolean("is_archived").default(false),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("member"), // 'member', 'admin'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  isActive: boolean("is_active").default(true), // For soft leaving conversations
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().notNull(),
  conversationId: text("conversation_id").references(() => conversations.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // 'text', 'image', 'file', 'work_share'
  attachmentUrl: text("attachment_url"), // For files, images, shared works
  attachmentMetadata: text("attachment_metadata"), // JSON metadata for attachments
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  replyToMessageId: text("reply_to_message_id"), // For threaded conversations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messageReadStatus = pgTable("message_read_status", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").references(() => messages.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

// Messaging Schema Definitions
export const insertConversationSchema = createInsertSchema(conversations).pick({
  title: true,
  type: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  content: true,
  messageType: true,
  attachmentUrl: true,
  attachmentMetadata: true,
  replyToMessageId: true,
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).pick({
  conversationId: true,
  userId: true,
  role: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type MessageReadStatus = typeof messageReadStatus.$inferSelect;



// Background Schemas
export const insertUserBackgroundPreferenceSchema = createInsertSchema(userBackgroundPreferences).pick({
  userId: true,
  gradientType: true,
  colorScheme: true,
  primaryColors: true,
  secondaryColors: true,
  direction: true,
  intensity: true,
  animationSpeed: true,
  timeOfDayPreference: true,
  moodTag: true,
  usageCount: true,
});

export const insertBackgroundInteractionSchema = createInsertSchema(backgroundInteractions).pick({
  userId: true,
  gradientId: true,
  interactionType: true,
  timeSpent: true,
  pageContext: true,
  deviceType: true,
  timeOfDay: true,
  weatherContext: true,
  sessionDuration: true,
});

export type UserBackgroundPreference = typeof userBackgroundPreferences.$inferSelect;
export type InsertUserBackgroundPreference = z.infer<typeof insertUserBackgroundPreferenceSchema>;
export type BackgroundInteraction = typeof backgroundInteractions.$inferSelect;
export type InsertBackgroundInteraction = z.infer<typeof insertBackgroundInteractionSchema>;
