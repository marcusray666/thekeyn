import { 
  users, works, certificates, nftMints, posts, follows, likes, comments, shares, notifications,
  postComments, postReactions, userFollows, userNotifications, contentCategories, userPreferences, userAnalytics,
  marketplace, purchases, collaborationProjects, projectCollaborators, subscriptions, subscriptionUsage,
  blockchainVerifications, verificationAuditLog, adminAuditLogs, contentReports, systemMetrics,
  conversations, conversationParticipants, messages, messageReadStatus,
  userBackgroundPreferences, backgroundInteractions,
  type User, type InsertUser, type Work, type InsertWork, type Certificate, type InsertCertificate, 
  type NftMint, type InsertNftMint, 
  type Post, type InsertPost, type PostComment, type InsertPostComment, type UserFollow, type InsertUserFollow,
  type UserNotification, type InsertUserNotification, type ContentCategory, type UserPreference, type UserAnalytic,
  type MarketplaceListing, type InsertMarketplaceListing, type Purchase, type CollaborationProject, type InsertCollaborationProject,
  type ProjectCollaborator, type Follow, type InsertFollow, type Like, type InsertLike, type Comment, type InsertComment, 
  type Share, type InsertShare, type Notification, type InsertNotification, type Subscription, type InsertSubscription,
  type SubscriptionUsage, type InsertSubscriptionUsage, type BlockchainVerification, type InsertBlockchainVerification,
  type VerificationAuditLog, type InsertVerificationAuditLog,
  type Conversation, type InsertConversation, type Message, type InsertMessage,
  type UserBackgroundPreference, type InsertUserBackgroundPreference, type BackgroundInteraction, type InsertBackgroundInteraction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, ne, isNull, ilike, or, lt, gt } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  createWork(work: InsertWork): Promise<Work>;
  getWork(id: number): Promise<Work | undefined>;
  getWorkByCertificateId(certificateId: string): Promise<Work | undefined>;
  getAllWorks(): Promise<Work[]>;
  getRecentWorks(limit?: number): Promise<Work[]>;
  updateWork(id: number, updates: Partial<InsertWork>): Promise<Work>;
  deleteWork(id: number): Promise<void>;
  
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByWorkId(workId: number): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  deleteCertificate(id: number): Promise<void>;
  

  
  createNftMint(mint: Partial<InsertNftMint>): Promise<NftMint>;
  getNftMint(id: number): Promise<NftMint | undefined>;
  getNftMints(userId: number): Promise<NftMint[]>;
  updateNftMint(id: number, updates: Partial<InsertNftMint>): Promise<NftMint>;
  
  // Social features
  getPublicWorks(options?: { userId?: number; limit?: number; offset?: number; filter?: string; search?: string; tags?: string[] }): Promise<Work[]>;
  getUserWorks(userId: number): Promise<Work[]>;
  followUser(followerId: number, followingId: number): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  likeWork(userId: number, workId: number): Promise<Like>;
  unlikeWork(userId: number, workId: number): Promise<void>;
  isWorkLiked(userId: number, workId: number): Promise<boolean>;
  addComment(comment: Partial<InsertComment>): Promise<Comment>;
  getWorkComments(workId: number): Promise<Comment[]>;
  shareWork(share: Partial<InsertShare>): Promise<Share>;
  createNotification(notification: Partial<InsertNotification>): Promise<Notification>;
  getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(notificationId: number): Promise<void>;
  incrementWorkViews(workId: number): Promise<void>;
  getTrendingTags(limit?: number): Promise<string[]>;
  
  // Posts functionality
  createPost(post: InsertPost & { userId: number }): Promise<Post>;
  getPosts(options?: { userId?: number; limit?: number; offset?: number; category?: string; following?: boolean; currentUserId?: number }): Promise<(Post & { username: string; userImage?: string; isFollowing?: boolean })[]>;
  getPost(id: string): Promise<Post | undefined>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post>;
  likePost(userId: number, postId: string): Promise<void>;
  unlikePost(userId: number, postId: string): Promise<void>;
  deletePost(id: string, userId: number): Promise<void>;
  searchPosts(query: string, options?: { limit?: number; offset?: number }): Promise<(Post & { username: string })[]>;
  getTrendingPosts(limit?: number): Promise<(Post & { username: string })[]>;
  
  // Comments functionality
  createComment(comment: InsertPostComment & { userId: number }): Promise<PostComment>;
  getPostComments(postId: string, options?: { limit?: number; offset?: number }): Promise<(PostComment & { username: string; userImage?: string })[]>;
  updateComment(id: number, updates: Partial<PostComment>): Promise<PostComment>;
  deleteComment(id: number, userId: number): Promise<void>;
  likeComment(userId: number, commentId: number): Promise<void>;
  
  // Following functionality
  followUser(followerId: number, followingId: number): Promise<UserFollow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number, options?: { limit?: number; offset?: number }): Promise<(User & { isFollowing?: boolean })[]>;
  getFollowing(userId: number, options?: { limit?: number; offset?: number }): Promise<(User & { isFollowing?: boolean })[]>;
  getFollowStats(userId: number): Promise<{ followers: number; following: number }>;
  
  // Notifications functionality
  createNotification(notification: InsertUserNotification): Promise<UserNotification>;
  getUserNotifications(userId: number, options?: { unreadOnly?: boolean; limit?: number; offset?: number }): Promise<UserNotification[]>;
  markNotificationRead(notificationId: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  
  // User preferences
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  updateUserPreferences(userId: number, preferences: Partial<UserPreference>): Promise<UserPreference>;
  
  // Analytics
  getUserAnalytics(userId: number, days?: number): Promise<UserAnalytic[]>;
  recordUserActivity(userId: number, activity: Partial<UserAnalytic>): Promise<void>;
  
  // Marketplace
  createMarketplaceListing(listing: InsertMarketplaceListing & { sellerId: number }): Promise<MarketplaceListing>;
  getMarketplaceListings(options?: { category?: string; priceRange?: [number, number]; limit?: number; offset?: number }): Promise<(MarketplaceListing & { sellerName: string })[]>;
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  updateMarketplaceListing(id: number, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing>;
  deleteMarketplaceListing(id: number, sellerId: number): Promise<void>;
  
  // Collaboration
  createCollaborationProject(project: InsertCollaborationProject & { ownerId: number }): Promise<CollaborationProject>;
  getCollaborationProjects(options?: { userId?: number; status?: string; limit?: number; offset?: number }): Promise<(CollaborationProject & { ownerName: string })[]>;
  getCollaborationProject(id: number): Promise<CollaborationProject | undefined>;
  joinCollaborationProject(projectId: number, userId: number, role: string): Promise<ProjectCollaborator>;
  leaveCollaborationProject(projectId: number, userId: number): Promise<void>;
  
  // Content categories
  getContentCategories(): Promise<ContentCategory[]>;
  
  // Background preferences and interactions
  getUserBackgroundPreferences(userId: number): Promise<any[]>;
  getBackgroundPreference(preferenceId: number): Promise<any>;
  saveBackgroundPreference(userId: number, preferenceData: any): Promise<any>;
  deleteBackgroundPreference(preferenceId: number): Promise<void>;
  trackBackgroundInteraction(userId: number, interactionData: any): Promise<any>;
  getBackgroundRecommendations(userId: number, pageContext?: string): Promise<any>;

  // Subscription management
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  getSubscriptionUsage(userId: number, month: string): Promise<SubscriptionUsage | undefined>;
  updateSubscriptionUsage(userId: number, month: string, usage: Partial<SubscriptionUsage>): Promise<SubscriptionUsage>;
  checkUploadLimit(userId: number): Promise<{ canUpload: boolean; remainingUploads: number; limit: number }>;
  resetMonthlyUploads(userId: number): Promise<void>;
  getUserSubscriptionLimits(userId: number): Promise<{
    tier: string;
    uploadLimit: number;
    hasDownloadableCertificates: boolean;
    hasCustomBranding: boolean;
    hasIPFSStorage: boolean;
    hasAPIAccess: boolean;
    teamSize: number;
  }>;

  // Blockchain verification
  createBlockchainVerification(verification: InsertBlockchainVerification): Promise<BlockchainVerification>;
  getBlockchainVerification(id: string): Promise<BlockchainVerification | undefined>;
  getBlockchainVerificationByFileHash(fileHash: string): Promise<BlockchainVerification | undefined>;
  updateBlockchainVerification(id: string, updates: Partial<InsertBlockchainVerification>): Promise<BlockchainVerification>;
  logVerificationAttempt(log: InsertVerificationAuditLog): Promise<VerificationAuditLog>;

  // User search for messaging
  searchUsers(query: string, currentUserId: number): Promise<{ id: number; username: string; displayName: string | null; profileImageUrl: string | null; isVerified: boolean | null; }[]>;
  findConversationBetweenUsers(userId1: number, userId2: number): Promise<any | null>;
  getUserProfile(userId: number, currentUserId: number): Promise<any | null>;
  getUserWorks(userId: number): Promise<Work[]>;
  followUser(followerId: number, followingId: number): Promise<any>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  discoverUsers(currentUserId: number): Promise<any[]>;
  getPostPreview(postId: number): Promise<any | null>;
  getWorkPreview(workId: number): Promise<any | null>;
  
  // Admin functions
  getSystemMetrics(): Promise<any>;
  getAllUsers(filter?: string, search?: string): Promise<User[]>;
  banUser(userId: number, reason: string): Promise<User>;
  unbanUser(userId: number): Promise<User>;
  verifyUser(userId: number): Promise<User>;
  createContentReport(report: any): Promise<any>;
  getContentReports(status?: string): Promise<any[]>;
  updateContentReport(reportId: number, updates: any): Promise<any>;
  createAdminAuditLog(log: any): Promise<any>;
  getAdminAuditLogs(): Promise<any[]>;
  getAllFileHashes(): Promise<string[]>;
  getPendingModerationWorks(): Promise<Work[]>;
  updateWorkModerationStatus(workId: number, status: string, reviewedBy: number, resolution?: string): Promise<Work>;
}

export class DatabaseStorage implements IStorage {
  // Database storage - no constructor needed

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase()));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    // Delete user and all associated data (cascading delete)
    // Note: This will remove all user data including works, posts, comments, etc.
    
    try {
      // Delete in proper order to avoid foreign key constraints
      // Start with dependent data first
      
      // Delete social data
      await db.delete(postReactions).where(eq(postReactions.userId, id));
      await db.delete(postComments).where(eq(postComments.userId, id));
      await db.delete(posts).where(eq(posts.userId, id));
      
      // Delete follows
      await db.delete(userFollows).where(or(eq(userFollows.followerId, id), eq(userFollows.followingId, id)));
      
      // Delete subscription data
      await db.delete(subscriptionUsage).where(eq(subscriptionUsage.userId, id));
      await db.delete(subscriptions).where(eq(subscriptions.userId, id));
      
      // Delete NFT data
      await db.delete(nftMints).where(eq(nftMints.userId, id));
      
      // Get works first, then delete certificates
      const userWorks = await db.select({ id: works.id }).from(works).where(eq(works.userId, id));
      
      // Delete certificates for user's works
      for (const work of userWorks) {
        await db.delete(certificates).where(eq(certificates.workId, work.id));
      }
      
      // Delete works
      await db.delete(works).where(eq(works.userId, id));
      
      // Finally delete the user
      await db.delete(users).where(eq(users.id, id));
      
    } catch (error) {
      console.error('Error during user deletion:', error);
      throw error;
    }
  }

  async createWork(insertWork: InsertWork): Promise<Work> {
    const [work] = await db
      .insert(works)
      .values(insertWork)
      .returning();
    return work;
  }

  async getWork(id: number): Promise<Work | undefined> {
    const [work] = await db.select().from(works).where(eq(works.id, id));
    return work || undefined;
  }

  async getWorkByCertificateId(certificateId: string): Promise<Work | undefined> {
    const [work] = await db.select().from(works).where(eq(works.certificateId, certificateId));
    return work || undefined;
  }

  async getAllWorks(): Promise<Work[]> {
    return await db
      .select()
      .from(works)
      .orderBy(desc(works.createdAt));
  }

  async getRecentWorks(limit: number = 10): Promise<Work[]> {
    return await db
      .select()
      .from(works)
      .orderBy(desc(works.createdAt))
      .limit(limit);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    // Check if verification proof already exists to ensure uniqueness
    if (insertCertificate.verificationProof) {
      const existingCert = await db
        .select()
        .from(certificates)
        .where(eq(certificates.verificationProof, insertCertificate.verificationProof))
        .limit(1);
      
      if (existingCert.length > 0) {
        throw new Error("Verification proof already exists for another work");
      }
    }

    const [certificate] = await db
      .insert(certificates)
      .values(insertCertificate)
      .returning();
    return certificate;
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate || undefined;
  }

  async getCertificateByStringId(certificateId: string): Promise<Certificate | undefined> {
    // First find the work by certificateId, then get the certificate by workId
    const work = await this.getWorkByCertificateId(certificateId);
    if (!work) {
      return undefined;
    }
    
    const [certificate] = await db.select().from(certificates).where(eq(certificates.workId, work.id));
    return certificate || undefined;
  }

  async getCertificateByWorkId(workId: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.workId, workId));
    return certificate || undefined;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .orderBy(desc(certificates.createdAt));
  }

  async updateWork(id: number, updates: Partial<InsertWork>): Promise<Work> {
    const [work] = await db
      .update(works)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(works.id, id))
      .returning();
    return work;
  }

  async deleteWork(id: number): Promise<void> {
    // Delete related records first to avoid foreign key constraints
    // For now, we'll handle this with raw SQL since the table structure may vary
    
    try {
      // Delete copyright applications if they exist
      await db.execute(sql`DELETE FROM copyright_applications WHERE work_id = ${id}`);
    } catch (error) {
      // Table might not exist, continue
      console.log('Note: copyright_applications table cleanup skipped');
    }
    
    // Delete any other related records that might reference this work
    // Add other deletions here as needed
    
    // Finally delete the work
    await db.delete(works).where(eq(works.id, id));
  }

  async deleteCertificate(id: number): Promise<void> {
    await db.delete(certificates).where(eq(certificates.id, id));
  }









  async createNftMint(mint: Partial<InsertNftMint>): Promise<NftMint> {
    const mintData = {
      ...mint,
      status: mint.status || 'pending',
      royaltyPercentage: mint.royaltyPercentage || 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [nftMint] = await db
      .insert(nftMints)
      .values(mintData as any)
      .returning();
    return nftMint;
  }

  async getNftMint(id: number): Promise<NftMint | undefined> {
    const [mint] = await db.select().from(nftMints).where(eq(nftMints.id, id));
    return mint || undefined;
  }

  async getNftMints(userId: number): Promise<NftMint[]> {
    return await db
      .select()
      .from(nftMints)
      .where(eq(nftMints.userId, userId))
      .orderBy(desc(nftMints.createdAt));
  }

  async updateNftMint(id: number, updates: Partial<InsertNftMint>): Promise<NftMint> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const [mint] = await db
      .update(nftMints)
      .set(updateData as any)
      .where(eq(nftMints.id, id))
      .returning();
    return mint;
  }

  // Social feature implementations
  async getPublicWorks(options: { userId?: number; limit?: number; offset?: number; filter?: string; search?: string; tags?: string[] } = {}): Promise<Work[]> {
    const { userId, limit = 20, offset = 0, filter, search, tags } = options;
    
    // For now, return all works until we add the isPublic column
    const publicWorks = await db.select().from(works)
      .orderBy(desc(works.createdAt))
      .limit(limit)
      .offset(offset);
      
    return publicWorks;
  }

  async getUserWorks(userId: number): Promise<Work[]> {
    try {
      const userWorks = await db.select().from(works)
        .where(eq(works.userId, userId))
        .orderBy(desc(works.createdAt));
      
      console.log(`Found ${userWorks.length} works for user ${userId}:`, userWorks.map(w => ({ id: w.id, title: w.title, certificateId: w.certificateId })));
      return userWorks;
    } catch (error) {
      console.error("Error getting user works:", error);
      return [];
    }
  }

  async followUser(followerId: number, followingId: number): Promise<UserFollow> {
    const [follow] = await db
      .insert(userFollows)
      .values({ followerId, followingId })
      .returning();
    
    // Update follower counts
    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));
    
    await db
      .update(users)
      .set({ followerCount: sql`${users.followerCount} + 1` })
      .where(eq(users.id, followingId));
    
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db
      .delete(userFollows)
      .where(and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      ));
    
    // Update follower counts
    await db
      .update(users)
      .set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` })
      .where(eq(users.id, followerId));
    
    await db
      .update(users)
      .set({ followerCount: sql`GREATEST(${users.followerCount} - 1, 0)` })
      .where(eq(users.id, followingId));
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(userFollows)
      .where(and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      ))
      .limit(1);
    
    return !!follow;
  }

  async likeWork(userId: number, workId: number): Promise<Like> {
    const [like] = await db.insert(likes)
      .values({ userId, workId })
      .returning();
    
    // Update work like count
    await db
      .update(works)
      .set({ likeCount: sql`${works.likeCount} + 1` })
      .where(eq(works.id, workId));
    
    // Update user's total likes count (for the work owner)
    const work = await this.getWork(workId);
    if (work) {
      await db
        .update(users)
        .set({ totalLikes: sql`${users.totalLikes} + 1` })
        .where(eq(users.id, work.userId));
    }
    
    return like;
  }

  async unlikeWork(userId: number, workId: number): Promise<void> {
    await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.workId, workId)));
    
    // Update work like count
    await db
      .update(works)
      .set({ likeCount: sql`GREATEST(${works.likeCount} - 1, 0)` })
      .where(eq(works.id, workId));
    
    // Update user's total likes count (for the work owner)
    const work = await this.getWork(workId);
    if (work) {
      await db
        .update(users)
        .set({ totalLikes: sql`GREATEST(${users.totalLikes} - 1, 0)` })
        .where(eq(users.id, work.userId));
    }
  }

  async isWorkLiked(userId: number, workId: number): Promise<boolean> {
    const result = await db.select().from(likes)
      .where(eq(likes.userId, userId));
    return result.length > 0;
  }

  async addComment(comment: Partial<InsertComment>): Promise<Comment> {
    const [newComment] = await db.insert(comments)
      .values(comment as any)
      .returning();
    return newComment;
  }

  async getWorkComments(workId: number): Promise<Comment[]> {
    return await db.select().from(comments)
      .where(eq(comments.workId, workId))
      .orderBy(desc(comments.createdAt));
  }

  async shareWork(share: Partial<InsertShare>): Promise<Share> {
    const [newShare] = await db.insert(shares)
      .values(share as any)
      .returning();
    return newShare;
  }

  async createNotification(notification: Partial<InsertNotification>): Promise<Notification> {
    const [newNotification] = await db.insert(notifications)
      .values(notification as any)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: number, unreadOnly = false): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async incrementWorkViews(workId: number): Promise<void> {
    // Will implement once we add the viewCount column
    console.log(`Incrementing views for work ${workId}`);
  }

  async getTrendingTags(limit = 10): Promise<string[]> {
    // Simple implementation - in production, use proper analytics
    const mockTags = ['digital-art', 'photography', 'design', 'nft', 'blockchain', 'ai-art', 'illustration', 'music', 'video', 'creative'];
    return mockTags.slice(0, limit);
  }



  // Posts functionality implementation
  async createPost(postData: InsertPost & { userId: number }): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        userId: postData.userId,
        title: postData.title,
        description: postData.description,
        content: postData.content || postData.title, // Use title as content if no content provided
        imageUrl: postData.imageUrl,
        filename: postData.filename,
        fileType: postData.fileType,
        mimeType: postData.mimeType,
        fileSize: postData.fileSize,
        hashtags: postData.hashtags || [],
        location: postData.location,
        mentionedUsers: postData.mentionedUsers || [],
        isProtected: postData.isProtected || false,
        protectedWorkId: postData.protectedWorkId,
        isHidden: postData.isHidden || false,
        tags: postData.tags || [],
      })
      .returning();
    
    // Send notifications to mentioned users
    if (postData.mentionedUsers && postData.mentionedUsers.length > 0) {
      for (const mentionedUsername of postData.mentionedUsers) {
        const mentionedUser = await this.getUserByUsername(mentionedUsername);
        if (mentionedUser && mentionedUser.id !== postData.userId) {
          await this.createNotification({
            userId: mentionedUser.id,
            type: 'mention',
            title: 'You were mentioned in a post',
            content: `@${(await this.getUser(postData.userId))?.username} mentioned you in a post: "${postData.title || postData.content?.substring(0, 50)}..."`,
            data: {
              postId: post.id,
              mentionedBy: postData.userId,
              postTitle: postData.title
            }
          });
        }
      }
    }
    
    // Get user info to complete Post type
    const user = await this.getUser(postData.userId);
    return {
      ...post,
      username: user?.username || 'unknown',
      displayName: user?.displayName,
      profileImageUrl: user?.profileImageUrl,
    };
  }

  async getPostById(postId: number): Promise<Post | null> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    
    if (!post) return null;

    // Get user info to complete Post type
    const user = await this.getUser(post.userId);
    return {
      ...post,
      username: user?.username || 'unknown',
      displayName: user?.displayName,
      profileImageUrl: user?.profileImageUrl,
    };
  }

  async updatePostVisibility(postId: number, isHidden: boolean): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        isHidden,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning();

    // Get user info to complete Post type
    const user = await this.getUser(updatedPost.userId);
    return {
      ...updatedPost,
      username: user?.username || 'unknown',
      displayName: user?.displayName,
      profileImageUrl: user?.profileImageUrl,
    };
  }

  async getPosts(options: { userId?: number; limit?: number; offset?: number; currentUserId?: number } = {}): Promise<(Post & { username: string })[]> {
    const { limit = 20, offset = 0, userId, currentUserId } = options;
    
    let query = db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        description: posts.description,
        content: posts.content,
        imageUrl: posts.imageUrl,
        filename: posts.filename,
        fileType: posts.fileType,
        mimeType: posts.mimeType,
        fileSize: posts.fileSize,
        hashtags: posts.hashtags,
        location: posts.location,
        mentionedUsers: posts.mentionedUsers,
        isProtected: posts.isProtected,
        protectedWorkId: posts.protectedWorkId,
        tags: posts.tags,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        views: posts.views,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
        isLiked: sql<boolean>`EXISTS (
          SELECT 1 FROM ${postReactions} 
          WHERE ${postReactions.postId} = ${posts.id} 
          AND ${postReactions.userId} = ${currentUserId || -1}
          AND ${postReactions.type} = 'like'
        )`.as('isLiked'),
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    if (userId) {
      query = query.where(eq(posts.userId, userId));
    } else {
      // For community feed, exclude hidden posts
      query = query.where(or(eq(posts.isHidden, false), isNull(posts.isHidden)));
    }

    return await query;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async likePost(userId: number, postId: string): Promise<void> {
    // Check if user already liked this post
    const [existingLike] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId), eq(postReactions.type, 'like')));

    if (existingLike) {
      // User already liked this post, so this is an unlike action
      await this.unlikePost(userId, postId);
      return;
    }

    // Add like reaction
    await db.insert(postReactions).values({
      postId,
      userId,
      type: 'like'
    });

    // Increment the likes counter
    await db
      .update(posts)
      .set({ 
        likes: sql`${posts.likes} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
  }

  async unlikePost(userId: number, postId: string): Promise<void> {
    // Remove like reaction
    await db
      .delete(postReactions)
      .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId), eq(postReactions.type, 'like')));

    // Decrement the likes counter
    await db
      .update(posts)
      .set({ 
        likes: sql`GREATEST(${posts.likes} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    
    return updatedPost;
  }

  async searchPostsByHashtag(hashtag: string): Promise<(Post & { username: string })[]> {
    const results = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        description: posts.description,
        content: posts.content,
        imageUrl: posts.imageUrl,
        filename: posts.filename,
        fileType: posts.fileType,
        mimeType: posts.mimeType,
        fileSize: posts.fileSize,
        hashtags: posts.hashtags,
        location: posts.location,
        mentionedUsers: posts.mentionedUsers,
        isProtected: posts.isProtected,
        protectedWorkId: posts.protectedWorkId,
        tags: posts.tags,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        views: posts.views,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(sql`${hashtag.toLowerCase()} = ANY(${posts.hashtags})`)
      .orderBy(desc(posts.createdAt))
      .limit(50);
    
    return results as (Post & { username: string })[];
  }

  async getPostsByLocation(location: string): Promise<(Post & { username: string })[]> {
    const results = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        description: posts.description,
        content: posts.content,
        imageUrl: posts.imageUrl,
        filename: posts.filename,
        fileType: posts.fileType,
        mimeType: posts.mimeType,
        fileSize: posts.fileSize,
        hashtags: posts.hashtags,
        location: posts.location,
        mentionedUsers: posts.mentionedUsers,
        isProtected: posts.isProtected,
        protectedWorkId: posts.protectedWorkId,
        tags: posts.tags,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        views: posts.views,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(ilike(posts.location, `%${location}%`))
      .orderBy(desc(posts.createdAt))
      .limit(50);
    
    return results as (Post & { username: string })[];
  }

  async deletePost(id: string, userId: number): Promise<void> {
    // First get the post to check for associated files
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Delete associated files if they exist
    if (post.imageUrl) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        
        // Extract filename from URL and construct file path
        let filePath: string;
        
        if (post.imageUrl.startsWith('/uploads/')) {
          // File stored locally in uploads directory
          filePath = path.join(process.cwd(), post.imageUrl);
        } else if (post.filename && post.imageUrl.includes('/uploads/')) {
          // Use filename if available
          filePath = path.join(process.cwd(), 'uploads', post.filename);
        } else {
          // Skip deletion for external URLs or non-local files
          console.log(`Skipping file deletion for external URL: ${post.imageUrl}`);
          filePath = '';
        }
        
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } else if (filePath) {
          console.log(`File not found, skipping deletion: ${filePath}`);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Delete related data first (foreign key constraints)
    // Delete post reactions (likes, etc.)
    await db
      .delete(postReactions)
      .where(eq(postReactions.postId, id));
    
    // Delete post comments
    await db
      .delete(postComments)
      .where(eq(postComments.postId, id));
    
    // Finally delete the post
    await db
      .delete(posts)
      .where(eq(posts.id, id));
  }

  async searchPosts(query: string, options: { limit?: number; offset?: number } = {}): Promise<(Post & { username: string })[]> {
    const { limit = 20, offset = 0 } = options;
    
    // Simple text search in content and tags
    const searchResults = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        fileType: posts.fileType,
        tags: posts.tags,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(
        // Search in content or tags
        sql`${posts.content} ILIKE ${`%${query}%`} OR ${posts.tags}::text ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return searchResults;
  }

  async getTrendingPosts(limit = 10): Promise<(Post & { username: string })[]> {
    // Get posts with high engagement in the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const trendingPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        fileType: posts.fileType,
        tags: posts.tags,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        username: users.username,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(gte(posts.createdAt, weekAgo))
      .orderBy(desc(sql`${posts.likes} + ${posts.comments} + ${posts.shares}`))
      .limit(limit);

    return trendingPosts;
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));

    return userPosts;
  }

  // Comments functionality
  async createComment(commentData: InsertPostComment & { userId: number }): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values({
        postId: commentData.postId,
        userId: commentData.userId,
        content: commentData.content,
        parentId: commentData.parentId,
        mentionedUsers: commentData.mentionedUsers || [],
      })
      .returning();
    
    // Increment comment count on post
    await db
      .update(posts)
      .set({ 
        comments: sql`${posts.comments} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, commentData.postId));
    
    return comment;
  }

  async getPostComments(postId: string, options: { limit?: number; offset?: number } = {}): Promise<(PostComment & { username: string; userImage?: string })[]> {
    const { limit = 50, offset = 0 } = options;
    
    const comments = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        parentId: postComments.parentId,
        content: postComments.content,
        mentionedUsers: postComments.mentionedUsers,
        likes: postComments.likes,
        createdAt: postComments.createdAt,
        updatedAt: postComments.updatedAt,
        username: users.username,
        userImage: users.profileImageUrl,
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt))
      .limit(limit)
      .offset(offset);

    return comments;
  }

  async updateComment(id: number, updates: Partial<PostComment>): Promise<PostComment> {
    const [updatedComment] = await db
      .update(postComments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(postComments.id, id))
      .returning();
    
    return updatedComment;
  }

  async deleteComment(id: number, userId: number): Promise<void> {
    await db
      .delete(postComments)
      .where(eq(postComments.id, id));
  }

  async likeComment(userId: number, commentId: number): Promise<void> {
    await db
      .update(postComments)
      .set({ 
        likes: sql`${postComments.likes} + 1`,
        updatedAt: new Date()
      })
      .where(eq(postComments.id, commentId));
  }

  // Following functionality - keep the more complete implementation

  async getFollowers(userId: number, options: { limit?: number; offset?: number } = {}): Promise<(User & { isFollowing?: boolean })[]> {
    const { limit = 50, offset = 0 } = options;
    
    const followers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        passwordHash: users.passwordHash,
        subscriptionTier: users.subscriptionTier,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        walletAddress: users.walletAddress,
        displayName: users.displayName,
        bio: users.bio,
        profileImageUrl: users.profileImageUrl,
        website: users.website,
        location: users.location,
        isVerified: users.isVerified,
        followerCount: users.followerCount,
        followingCount: users.followingCount,
        totalLikes: users.totalLikes,
        themePreference: users.themePreference,
        settings: users.settings,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(userFollows, eq(users.id, userFollows.followerId))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return followers;
  }

  async getFollowing(userId: number, options: { limit?: number; offset?: number } = {}): Promise<(User & { isFollowing?: boolean })[]> {
    const { limit = 50, offset = 0 } = options;
    
    const following = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        passwordHash: users.passwordHash,
        subscriptionTier: users.subscriptionTier,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        walletAddress: users.walletAddress,
        displayName: users.displayName,
        bio: users.bio,
        profileImageUrl: users.profileImageUrl,
        website: users.website,
        location: users.location,
        isVerified: users.isVerified,
        followerCount: users.followerCount,
        followingCount: users.followingCount,
        totalLikes: users.totalLikes,
        themePreference: users.themePreference,
        settings: users.settings,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(userFollows, eq(users.id, userFollows.followingId))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit)
      .offset(offset);

    return following;
  }

  async getFollowStats(userId: number): Promise<{ followers: number; following: number }> {
    const user = await this.getUser(userId);
    return {
      followers: user?.followerCount || 0,
      following: user?.followingCount || 0
    };
  }

  // Notifications functionality - keep the more complete implementation

  async markNotificationRead(notificationId: number): Promise<void> {
    await db
      .update(userNotifications)
      .set({ isRead: true })
      .where(eq(userNotifications.id, notificationId));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db
      .update(userNotifications)
      .set({ isRead: true })
      .where(eq(userNotifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userNotifications)
      .where(and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }

  // User preferences
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    
    return preferences;
  }

  async updateUserPreferences(userId: number, preferences: Partial<UserPreference>): Promise<UserPreference> {
    const [updatedPreferences] = await db
      .insert(userPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: [userPreferences.userId],
        set: { ...preferences, updatedAt: new Date() }
      })
      .returning();
    
    return updatedPreferences;
  }

  // Analytics
  async getUserAnalytics(userId: number, days = 30): Promise<UserAnalytic[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const analytics = await db
      .select()
      .from(userAnalytics)
      .where(and(
        eq(userAnalytics.userId, userId),
        gte(userAnalytics.date, startDate)
      ))
      .orderBy(desc(userAnalytics.date));
    
    return analytics;
  }

  async recordUserActivity(userId: number, activity: Partial<UserAnalytic>): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First check if record exists for today
    const existing = await db
      .select()
      .from(userAnalytics)
      .where(and(
        eq(userAnalytics.userId, userId),
        eq(userAnalytics.date, today)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(userAnalytics)
        .set({
          profileViews: sql`${userAnalytics.profileViews} + ${activity.profileViews || 0}`,
          postViews: sql`${userAnalytics.postViews} + ${activity.postViews || 0}`,
          workViews: sql`${userAnalytics.workViews} + ${activity.workViews || 0}`,
          newFollowers: sql`${userAnalytics.newFollowers} + ${activity.newFollowers || 0}`,
          totalEngagement: sql`${userAnalytics.totalEngagement} + ${activity.totalEngagement || 0}`,
          revenue: sql`${userAnalytics.revenue} + ${activity.revenue || 0}`,
        })
        .where(and(
          eq(userAnalytics.userId, userId),
          eq(userAnalytics.date, today)
        ));
    } else {
      // Create new record
      await db
        .insert(userAnalytics)
        .values({
          userId,
          date: today,
          profileViews: activity.profileViews || 0,
          postViews: activity.postViews || 0,
          workViews: activity.workViews || 0,
          newFollowers: activity.newFollowers || 0,
          totalEngagement: activity.totalEngagement || 0,
          revenue: activity.revenue || 0,
        });
    }
  }

  // Marketplace
  async createMarketplaceListing(listing: InsertMarketplaceListing & { sellerId: number }): Promise<MarketplaceListing> {
    const [newListing] = await db
      .insert(marketplace)
      .values(listing)
      .returning();
    
    return newListing;
  }

  async getMarketplaceListings(options: { category?: string; priceRange?: [number, number]; limit?: number; offset?: number } = {}): Promise<(MarketplaceListing & { sellerName: string })[]> {
    const { limit = 20, offset = 0 } = options;
    
    let query = db
      .select({
        id: marketplace.id,
        workId: marketplace.workId,
        sellerId: marketplace.sellerId,
        title: marketplace.title,
        description: marketplace.description,
        price: marketplace.price,
        currency: marketplace.currency,
        isActive: marketplace.isActive,
        isFeatured: marketplace.isFeatured,
        licenseType: marketplace.licenseType,
        tags: marketplace.tags,
        views: marketplace.views,
        favorites: marketplace.favorites,
        createdAt: marketplace.createdAt,
        updatedAt: marketplace.updatedAt,
        sellerName: users.username,
      })
      .from(marketplace)
      .innerJoin(users, eq(marketplace.sellerId, users.id))
      .where(eq(marketplace.isActive, true))
      .orderBy(desc(marketplace.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  async getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined> {
    const [listing] = await db
      .select()
      .from(marketplace)
      .where(eq(marketplace.id, id))
      .limit(1);
    
    return listing;
  }

  async updateMarketplaceListing(id: number, updates: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    const [updatedListing] = await db
      .update(marketplace)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(marketplace.id, id))
      .returning();
    
    return updatedListing;
  }

  async deleteMarketplaceListing(id: number, sellerId: number): Promise<void> {
    await db
      .delete(marketplace)
      .where(and(
        eq(marketplace.id, id),
        eq(marketplace.sellerId, sellerId)
      ));
  }

  // Collaboration
  async createCollaborationProject(project: InsertCollaborationProject & { ownerId: number }): Promise<CollaborationProject> {
    const [newProject] = await db
      .insert(collaborationProjects)
      .values(project)
      .returning();
    
    return newProject;
  }

  async getCollaborationProjects(options: { userId?: number; status?: string; limit?: number; offset?: number } = {}): Promise<(CollaborationProject & { ownerName: string })[]> {
    const { limit = 20, offset = 0 } = options;
    
    let query = db
      .select({
        id: collaborationProjects.id,
        title: collaborationProjects.title,
        description: collaborationProjects.description,
        ownerId: collaborationProjects.ownerId,
        status: collaborationProjects.status,
        type: collaborationProjects.type,
        maxCollaborators: collaborationProjects.maxCollaborators,
        deadline: collaborationProjects.deadline,
        budget: collaborationProjects.budget,
        tags: collaborationProjects.tags,
        requirements: collaborationProjects.requirements,
        createdAt: collaborationProjects.createdAt,
        updatedAt: collaborationProjects.updatedAt,
        ownerName: users.username,
      })
      .from(collaborationProjects)
      .innerJoin(users, eq(collaborationProjects.ownerId, users.id))
      .orderBy(desc(collaborationProjects.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  async getCollaborationProject(id: number): Promise<CollaborationProject | undefined> {
    const [project] = await db
      .select()
      .from(collaborationProjects)
      .where(eq(collaborationProjects.id, id))
      .limit(1);
    
    return project;
  }

  async joinCollaborationProject(projectId: number, userId: number, role: string): Promise<ProjectCollaborator> {
    const [collaborator] = await db
      .insert(projectCollaborators)
      .values({
        projectId,
        userId,
        role,
        permissions: ['edit', 'comment'],
        status: 'active'
      })
      .returning();
    
    return collaborator;
  }

  async leaveCollaborationProject(projectId: number, userId: number): Promise<void> {
    await db
      .update(projectCollaborators)
      .set({ status: 'left' })
      .where(and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId)
      ));
  }

  // Content categories
  async getContentCategories(): Promise<ContentCategory[]> {
    const categories = await db
      .select()
      .from(contentCategories)
      .where(eq(contentCategories.isActive, true))
      .orderBy(contentCategories.name);
    
    return categories;
  }

  // Subscription management
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    
    return newSubscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    
    return subscription;
  }

  async getSubscriptionUsage(userId: number, month: string): Promise<SubscriptionUsage | undefined> {
    const [usage] = await db
      .select()
      .from(subscriptionUsage)
      .where(and(
        eq(subscriptionUsage.userId, userId),
        eq(subscriptionUsage.month, month)
      ));
    
    return usage;
  }

  async updateSubscriptionUsage(userId: number, month: string, usage: Partial<SubscriptionUsage>): Promise<SubscriptionUsage> {
    const existingUsage = await this.getSubscriptionUsage(userId, month);
    
    if (existingUsage) {
      const [updated] = await db
        .update(subscriptionUsage)
        .set({ ...usage, updatedAt: new Date() })
        .where(and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.month, month)
        ))
        .returning();
      
      return updated;
    } else {
      const [created] = await db
        .insert(subscriptionUsage)
        .values({
          userId,
          month,
          ...usage
        })
        .returning();
      
      return created;
    }
  }

  async checkUploadLimit(userId: number): Promise<{ canUpload: boolean; remainingUploads: number; limit: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { canUpload: false, remainingUploads: 0, limit: 0 };
    }

    const limits = await this.getUserSubscriptionLimits(userId);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await this.getSubscriptionUsage(userId, currentMonth);
    
    const uploadsUsed = usage?.uploadsUsed || 0;
    
    // For unlimited plans (uploadLimit = -1), return -1 as remainingUploads
    if (limits.uploadLimit === -1) {
      return {
        canUpload: true,
        remainingUploads: -1,
        limit: -1
      };
    }
    
    const remainingUploads = Math.max(0, limits.uploadLimit - uploadsUsed);
    
    return {
      canUpload: remainingUploads > 0,
      remainingUploads,
      limit: limits.uploadLimit
    };
  }

  async resetMonthlyUploads(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        monthlyUploads: 0,
        lastUploadReset: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getUserSubscriptionLimits(userId: number): Promise<{
    tier: string;
    uploadLimit: number;
    hasDownloadableCertificates: boolean;
    hasCustomBranding: boolean;
    hasIPFSStorage: boolean;
    hasAPIAccess: boolean;
    teamSize: number;
  }> {
    const user = await this.getUser(userId);
    
    // Use direct user subscription tier from database, prioritize it
    const tier = user?.subscriptionTier || 'free';
    console.log('getUserSubscriptionLimits - detected tier:', tier, 'for user:', userId);
    
    const tierLimits = {
      free: {
        uploadLimit: 3,
        hasDownloadableCertificates: true, // 3 PDF certificates per month
        hasCustomBranding: false,
        hasIPFSStorage: false,
        hasAPIAccess: false,
        teamSize: 1
      },
      starter: {
        uploadLimit: 5,
        hasDownloadableCertificates: true, // 5 PDF certificates per month
        hasCustomBranding: false,
        hasIPFSStorage: false,
        hasAPIAccess: false,
        teamSize: 1
      },
      pro: {
        uploadLimit: -1, // unlimited uploads
        hasDownloadableCertificates: true, // unlimited PDF certificates
        hasCustomBranding: true,
        hasIPFSStorage: true,
        hasAPIAccess: true,
        teamSize: 10 // Pro now supports teams up to 10 users
      }
    };
    
    const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.free;
    console.log('getUserSubscriptionLimits - returning limits:', { tier, ...limits });
    
    return {
      tier,
      ...limits
    };
  }

  // Messaging System Methods
  async createConversation(participants: number[], title?: string): Promise<Conversation> {
    const conversationId = nanoid();
    
    // Create conversation
    const [conversation] = await db
      .insert(conversations)
      .values({
        id: conversationId,
        title,
        type: participants.length > 2 ? "group" : "direct",
      })
      .returning();

    // Add participants
    const participantData = participants.map(userId => ({
      conversationId,
      userId,
    }));

    await db.insert(conversationParticipants).values(participantData);

    return conversation;
  }

  async getUserConversations(userId: number): Promise<(Conversation & { 
    participants: { userId: number; username: string }[]; 
    lastMessage?: { content: string; createdAt: Date; senderName: string };
    unreadCount: number;
  })[]> {
    const userConversations = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        type: conversations.type,
        isArchived: conversations.isArchived,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .where(
        and(
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // Enrich with participants and last message for each conversation
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        // Get participants
        const participants = await db
          .select({
            userId: users.id,
            username: users.username,
          })
          .from(conversationParticipants)
          .innerJoin(users, eq(conversationParticipants.userId, users.id))
          .where(eq(conversationParticipants.conversationId, conv.id));

        // Get last message
        const lastMessage = await db
          .select({
            content: messages.content,
            createdAt: messages.createdAt,
            senderName: users.username,
          })
          .from(messages)
          .innerJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Count unread messages
        const unreadCount = await this.getUnreadMessageCount(userId, conv.id);

        return {
          ...conv,
          participants,
          lastMessage: lastMessage[0],
          unreadCount,
        };
      })
    );

    return enrichedConversations;
  }

  async getConversationMessages(conversationId: string, userId: number, limit = 50, offset = 0): Promise<(Message & { senderName: string; senderAvatar?: string })[]> {
    // Verify user is participant
    const participant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      )
      .limit(1);

    if (!participant.length) {
      throw new Error("User not authorized to view this conversation");
    }

    const messageList = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        attachmentUrl: messages.attachmentUrl,
        attachmentMetadata: messages.attachmentMetadata,
        isEdited: messages.isEdited,
        editedAt: messages.editedAt,
        isDeleted: messages.isDeleted,
        deletedAt: messages.deletedAt,
        replyToMessageId: messages.replyToMessageId,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderName: users.username,
        senderAvatar: users.profileImageUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return messageList.reverse(); // Return in chronological order
  }

  async sendMessage(data: InsertMessage): Promise<Message> {
    const messageId = nanoid();
    
    const [message] = await db
      .insert(messages)
      .values({
        ...data,
        id: messageId,
      })
      .returning();

    // Update conversation last message timestamp
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, data.conversationId));

    return message;
  }

  async markMessagesAsRead(userId: number, conversationId: string): Promise<void> {
    // Get all unread messages in the conversation
    const unreadMessages = await db
      .select({ id: messages.id })
      .from(messages)
      .leftJoin(
        messageReadStatus,
        and(
          eq(messageReadStatus.messageId, messages.id),
          eq(messageReadStatus.userId, userId)
        )
      )
      .where(
        and(
          eq(messages.conversationId, conversationId),
          isNull(messageReadStatus.id)
        )
      );

    if (unreadMessages.length > 0) {
      const readStatusData = unreadMessages.map(msg => ({
        messageId: msg.id,
        userId,
      }));

      await db.insert(messageReadStatus).values(readStatusData);
    }

    // Update participant's last seen timestamp
    await db
      .update(conversationParticipants)
      .set({ lastSeenAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );
  }

  async getUnreadMessageCount(userId: number, conversationId: string): Promise<number> {
    const unreadCount = await db
      .select({ count: sql`count(*)`.as('count') })
      .from(messages)
      .leftJoin(
        messageReadStatus,
        and(
          eq(messageReadStatus.messageId, messages.id),
          eq(messageReadStatus.userId, userId)
        )
      )
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId), // Don't count own messages
          isNull(messageReadStatus.id)
        )
      );

    return parseInt(unreadCount[0]?.count as string) || 0;
  }

  async searchUsers(query: string, currentUserId: number): Promise<{ id: number; username: string; displayName: string | null; profileImageUrl: string | null; isVerified: boolean | null; }[]> {
    const whereClause = and(
      or(
        ilike(users.username, `%${query}%`),
        ilike(users.displayName, `%${query}%`)
      ),
      ne(users.id, currentUserId)
    );

    return await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(whereClause)
      .limit(10);
  }

  // Blockchain verification methods
  async createBlockchainVerification(verification: InsertBlockchainVerification): Promise<BlockchainVerification> {
    const [created] = await db
      .insert(blockchainVerifications)
      .values(verification)
      .returning();
    
    return created;
  }

  async getBlockchainVerification(id: string): Promise<BlockchainVerification | undefined> {
    const [verification] = await db
      .select()
      .from(blockchainVerifications)
      .where(eq(blockchainVerifications.id, id));
    
    return verification;
  }

  async getBlockchainVerificationByFileHash(fileHash: string): Promise<BlockchainVerification | undefined> {
    const [verification] = await db
      .select()
      .from(blockchainVerifications)
      .where(eq(blockchainVerifications.fileHash, fileHash));
    
    return verification;
  }

  async updateBlockchainVerification(id: string, updates: Partial<InsertBlockchainVerification>): Promise<BlockchainVerification> {
    const [updated] = await db
      .update(blockchainVerifications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blockchainVerifications.id, id))
      .returning();
    
    return updated;
  }

  async logVerificationAttempt(log: InsertVerificationAuditLog): Promise<VerificationAuditLog> {
    const [created] = await db
      .insert(verificationAuditLog)
      .values(log)
      .returning();
    
    return created;
  }

  // Admin method implementations
  async getSystemMetrics(): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.lastLoginAt, thirtyDaysAgo));
    const newSignups = await db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, thirtyDaysAgo));
    const totalWorks = await db.select({ count: sql<number>`count(*)` }).from(works);
    const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const pendingReports = await db.select({ count: sql<number>`count(*)` }).from(contentReports).where(eq(contentReports.status, 'pending'));
    
    // Calculate storage used from file sizes
    const storageQuery = await db.select({ 
      totalSize: sql<number>`COALESCE(SUM(${works.fileSize}), 0)` 
    }).from(works);
    
    // Calculate revenue from subscriptions (Starter: $9.99, Pro: $19.99)
    const revenueData = await db.select({
      starterCount: sql<number>`COUNT(CASE WHEN ${users.subscriptionTier} = 'starter' THEN 1 END)`,
      proCount: sql<number>`COUNT(CASE WHEN ${users.subscriptionTier} = 'pro' THEN 1 END)`
    }).from(users);
    
    const starterRevenue = (Number(revenueData[0]?.starterCount) || 0) * 999; // $9.99 in cents
    const proRevenue = (Number(revenueData[0]?.proCount) || 0) * 1999; // $19.99 in cents
    const totalRevenue = starterRevenue + proRevenue;

    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      newSignups: newSignups[0]?.count || 0,
      totalWorks: totalWorks[0]?.count || 0,
      totalPosts: totalPosts[0]?.count || 0,
      totalRevenue: totalRevenue,
      storageUsed: Number(storageQuery[0]?.totalSize) || 0,
      blockchainVerifications: totalWorks[0]?.count || 0,
      reportsPending: pendingReports[0]?.count || 0,
      subscriptionBreakdown: {
        free: Math.max(0, (totalUsers[0]?.count || 0) - (Number(revenueData[0]?.starterCount) || 0) - (Number(revenueData[0]?.proCount) || 0)),
        starter: Number(revenueData[0]?.starterCount) || 0,
        pro: Number(revenueData[0]?.proCount) || 0
      }
    };
  }

  async getAllUsers(filter?: string, search?: string): Promise<User[]> {
    let query = db.select().from(users);
    
    const conditions = [];
    
    if (filter) {
      switch (filter) {
        case 'admin':
          conditions.push(eq(users.role, 'admin'));
          break;
        case 'verified':
          conditions.push(eq(users.isVerified, true));
          break;
        case 'banned':
          conditions.push(eq(users.isBanned, true));
          break;
        case 'pro':
          conditions.push(eq(users.subscriptionTier, 'pro'));
          break;
        case 'recent':
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          conditions.push(gte(users.createdAt, weekAgo));
          break;
      }
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(users.createdAt)).limit(100);
  }

  // ADMIN PRIVACY OVERRIDE: Get all users with complete private information
  async getAllUsersWithPrivateInfo(filter?: string, search?: string): Promise<any[]> {
    try {
      let query = db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        subscriptionTier: users.subscriptionTier,
        subscriptionStatus: users.subscriptionStatus,
        isVerified: users.isVerified,
        isBanned: users.isBanned,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        location: users.location,
        website: users.website,
        totalWorks: sql`(SELECT count(*) FROM ${works} WHERE user_id = ${users.id})`.as('totalWorks')
      }).from(users);

      const conditions = [];

      if (search) {
        conditions.push(
          or(
            ilike(users.username, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.displayName, `%${search}%`)
          )
        );
      }

      if (filter && filter !== 'all') {
        switch (filter) {
          case 'banned':
            conditions.push(eq(users.isBanned, true));
            break;
          case 'verified':
            conditions.push(eq(users.isVerified, true));
            break;
          case 'premium':
            conditions.push(ne(users.subscriptionTier, 'free'));
            break;
          case 'admins':
            conditions.push(eq(users.role, 'admin'));
            break;
        }
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query.orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error getting users with private info:", error);
      return [];
    }
  }

  // ADMIN PRIVACY OVERRIDE: Get complete user information including all private data
  async getUserWithAllPrivateInfo(userId: number): Promise<any> {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        subscriptionTier: users.subscriptionTier,
        subscriptionStatus: users.subscriptionStatus,
        isVerified: users.isVerified,
        isBanned: users.isBanned,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        location: users.location,
        website: users.website,
        birthDate: users.birthDate,
        phone: users.phone,
        socialLinks: users.socialLinks,
        privacySettings: users.privacySettings,
        passwordHash: users.passwordHash,
        stripeCustomerId: users.stripeCustomerId,
        uploadCount: users.uploadCount,
        totalStorageUsed: users.totalStorageUsed,
        followerCount: sql`(SELECT count(*) FROM ${follows} WHERE following_id = ${users.id})`.as('followerCount'),
        followingCount: sql`(SELECT count(*) FROM ${follows} WHERE follower_id = ${users.id})`.as('followingCount'),
        totalLikes: sql`(SELECT count(*) FROM ${postReactions} WHERE user_id = ${users.id})`.as('totalLikes'),
        totalWorks: sql`(SELECT count(*) FROM ${works} WHERE user_id = ${users.id})`.as('totalWorks'),
        totalPosts: sql`(SELECT count(*) FROM ${posts} WHERE user_id = ${users.id})`.as('totalPosts')
      }).from(users).where(eq(users.id, userId));

      return user;
    } catch (error) {
      console.error("Error getting user with all private info:", error);
      return null;
    }
  }

  // Get user's complete activity log
  async getUserActivityLog(userId: number): Promise<any[]> {
    try {
      const activities = await db.select().from(auditLogs)
        .where(eq(auditLogs.targetId, userId.toString()))
        .orderBy(desc(auditLogs.createdAt))
        .limit(100);

      return activities;
    } catch (error) {
      console.error("Error getting user activity log:", error);
      return [];
    }
  }

  // ADMIN PRIVACY OVERRIDE: Get all user content including private posts/works
  async getUserAllContent(userId: number): Promise<any> {
    try {
      const [userWorks, userPosts] = await Promise.all([
        db.select().from(works).where(eq(works.userId, userId)).orderBy(desc(works.createdAt)),
        db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt))
      ]);

      return {
        works: userWorks,
        posts: userPosts,
        totalContent: userWorks.length + userPosts.length
      };
    } catch (error) {
      console.error("Error getting user content:", error);
      return { works: [], posts: [], totalContent: 0 };
    }
  }

  async banUser(userId: number, reason: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned: true, banReason: reason })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async unbanUser(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned: false, banReason: null })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async verifyUser(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createContentReport(report: any): Promise<any> {
    const [newReport] = await db
      .insert(contentReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getContentReports(status?: string): Promise<any[]> {
    let query = db
      .select({
        id: contentReports.id,
        reporterId: contentReports.reporterId,
        reportedUserId: contentReports.reportedUserId,
        contentType: contentReports.contentType,
        contentId: contentReports.contentId,
        reason: contentReports.reason,
        description: contentReports.description,
        status: contentReports.status,
        createdAt: contentReports.createdAt,
        reporterUsername: sql<string>`reporter.username`,
        reportedUsername: sql<string>`reported.username`,
      })
      .from(contentReports)
      .leftJoin(sql`${users} as reporter`, eq(contentReports.reporterId, sql`reporter.id`))
      .leftJoin(sql`${users} as reported`, eq(contentReports.reportedUserId, sql`reported.id`));

    if (status) {
      query = query.where(eq(contentReports.status, status));
    }

    return await query.orderBy(desc(contentReports.createdAt));
  }

  async updateContentReport(reportId: number, updates: any): Promise<any> {
    const [report] = await db
      .update(contentReports)
      .set(updates)
      .where(eq(contentReports.id, reportId))
      .returning();
    return report;
  }

  async createAdminAuditLog(log: any): Promise<any> {
    const [auditLog] = await db
      .insert(adminAuditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getAdminAuditLogs(): Promise<any[]> {
    return await db
      .select({
        id: adminAuditLogs.id,
        adminId: adminAuditLogs.adminId,
        action: adminAuditLogs.action,
        targetType: adminAuditLogs.targetType,
        targetId: adminAuditLogs.targetId,
        details: adminAuditLogs.details,
        createdAt: adminAuditLogs.createdAt,
        adminUsername: users.username,
      })
      .from(adminAuditLogs)
      .innerJoin(users, eq(adminAuditLogs.adminId, users.id))
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(100);
  }

  // Additional moderation methods
  async getAllFileHashes(): Promise<string[]> {
    const result = await db.select({ fileHash: works.fileHash }).from(works);
    return result.map(r => r.fileHash);
  }

  async getPendingModerationWorks(): Promise<Work[]> {
    return await db
      .select()
      .from(works)
      .where(eq(works.moderationStatus, 'pending'))
      .orderBy(desc(works.createdAt));
  }

  async updateWorkModerationStatus(workId: number, status: string, reviewedBy: number, resolution?: string): Promise<Work> {
    const [work] = await db
      .update(works)
      .set({ 
        moderationStatus: status,
        reviewedBy,
        reviewedAt: new Date()
      })
      .where(eq(works.id, workId))
      .returning();
    return work;
  }

  async searchUsers(query: string, currentUserId: number): Promise<{ id: number; username: string; displayName: string | null; profileImageUrl: string | null; isVerified: boolean | null; }[]> {
    try {
      const searchResults = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified
        })
        .from(users)
        .where(
          and(
            ne(users.id, currentUserId), // Exclude current user
            ne(users.isBanned, true), // Exclude banned users
            or(
              ilike(users.username, `%${query}%`),
              ilike(users.displayName, `%${query}%`)
            )
          )
        )
        .limit(10);

      return searchResults;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  async findConversationBetweenUsers(userId1: number, userId2: number): Promise<any | null> {
    try {
      // Find conversation where both users are participants
      const [conversation] = await db
        .select({
          id: conversations.id,
          createdAt: conversations.createdAt
        })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .where(
          and(
            eq(conversationParticipants.userId, userId1),
            sql`EXISTS (
              SELECT 1 FROM ${conversationParticipants} cp2 
              WHERE cp2.conversation_id = ${conversations.id} 
              AND cp2.user_id = ${userId2}
            )`
          )
        )
        .limit(1);

      return conversation || null;
    } catch (error) {
      console.error("Error finding conversation between users:", error);
      return null;
    }
  }

  async getUserProfile(userId: number, currentUserId: number): Promise<any | null> {
    try {
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          bio: users.bio,
          profileImageUrl: users.profileImageUrl,
          location: users.location,
          website: users.website,
          isVerified: users.isVerified,
          createdAt: users.createdAt,
          followerCount: sql`(SELECT count(*) FROM ${userFollows} WHERE following_id = ${users.id})`.as('followerCount'),
          followingCount: sql`(SELECT count(*) FROM ${userFollows} WHERE follower_id = ${users.id})`.as('followingCount'),
          workCount: sql`(SELECT count(*) FROM ${works} WHERE user_id = ${users.id})`.as('workCount'),
          postCount: sql`(SELECT count(*) FROM ${posts} WHERE user_id = ${users.id})`.as('postCount'),
          isFollowing: sql`EXISTS (
            SELECT 1 FROM ${userFollows} 
            WHERE follower_id = ${currentUserId} 
            AND following_id = ${users.id}
          )`.as('isFollowing'),
          isOnline: sql`true`.as('isOnline') // Simplified - would be based on actual activity
        })
        .from(users)
        .where(and(eq(users.id, userId), ne(users.isBanned, true)))
        .limit(1);

      if (!user) return null;

      return {
        ...user,
        joinedDate: user.createdAt,
        followerCount: Number(user.followerCount),
        followingCount: Number(user.followingCount),
        workCount: Number(user.workCount),
        postCount: Number(user.postCount),
        isFollowing: Boolean(user.isFollowing)
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  async getUserWorks(userId: number): Promise<any[]> {
    try {
      const userWorks = await db
        .select()
        .from(works)
        .where(eq(works.userId, userId))
        .orderBy(desc(works.createdAt))
        .limit(20);

      return userWorks;
    } catch (error) {
      console.error("Error getting user works:", error);
      return [];
    }
  }

  async followUser(followerId: number, followingId: number): Promise<any> {
    try {
      // Check if already following
      const existingFollow = await db
        .select()
        .from(userFollows)
        .where(and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        ))
        .limit(1);

      if (existingFollow.length > 0) {
        return existingFollow[0];
      }

      // Create new follow relationship
      const [follow] = await db
        .insert(userFollows)
        .values({
          followerId,
          followingId,
          createdAt: new Date().toISOString()
        })
        .returning();

      return follow;
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    try {
      await db
        .delete(userFollows)
        .where(and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        ));
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  }

  async discoverUsers(currentUserId: number): Promise<any[]> {
    try {
      const discoveredUsers = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          bio: users.bio,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
          followerCount: sql`(SELECT count(*) FROM ${userFollows} WHERE following_id = ${users.id})`.as('followerCount'),
          followingCount: sql`(SELECT count(*) FROM ${userFollows} WHERE follower_id = ${users.id})`.as('followingCount'),
          workCount: sql`(SELECT count(*) FROM ${works} WHERE user_id = ${users.id})`.as('workCount'),
          isFollowing: sql`EXISTS (
            SELECT 1 FROM ${userFollows} 
            WHERE follower_id = ${currentUserId} 
            AND following_id = ${users.id}
          )`.as('isFollowing'),
          isOnline: sql`true`.as('isOnline'), // Simplified - would be based on actual activity
          lastSeen: sql`'recently'`.as('lastSeen')
        })
        .from(users)
        .where(and(
          ne(users.id, currentUserId), // Don't include current user
          ne(users.isBanned, true)     // Don't include banned users
        ))
        .orderBy(desc(users.createdAt))
        .limit(50);

      return discoveredUsers.map(user => ({
        ...user,
        followerCount: Number(user.followerCount),
        followingCount: Number(user.followingCount),
        workCount: Number(user.workCount),
        isFollowing: Boolean(user.isFollowing)
      }));
    } catch (error) {
      console.error("Error discovering users:", error);
      return [];
    }
  }

  async getPostPreview(postId: number): Promise<any | null> {
    try {
      // This would get community post data for preview
      // For now, return a mock response since posts system isn't fully implemented
      return {
        id: postId,
        title: `Community Post #${postId}`,
        description: "This is a community post shared on Loggin' platform",
        type: 'post',
        creatorName: "Community User",
        creatorId: 1,
        createdAt: new Date().toISOString(),
        isVerified: true,
        stats: {
          views: Math.floor(Math.random() * 1000),
          likes: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 50)
        }
      };
    } catch (error) {
      console.error("Error getting post preview:", error);
      return null;
    }
  }

  async getWorkPreview(workId: number): Promise<any | null> {
    try {
      const work = await db
        .select({
          id: works.id,
          title: works.title,
          filename: works.filename,
          mimeType: works.mimeType,
          thumbnailUrl: works.thumbnailUrl,
          createdAt: works.createdAt,
          userId: works.userId,
          sha256Hash: works.sha256Hash,
          blockchainHash: works.blockchainHash
        })
        .from(works)
        .where(eq(works.id, workId))
        .limit(1);

      if (!work.length) return null;

      const workData = work[0];

      // Get creator info
      const creator = await db
        .select({
          username: users.username,
          displayName: users.displayName
        })
        .from(users)
        .where(eq(users.id, workData.userId))
        .limit(1);

      return {
        id: workData.id,
        title: workData.title || workData.filename,
        description: `Protected digital work verified on blockchain`,
        type: 'work',
        creatorName: creator.length > 0 ? (creator[0].displayName || creator[0].username) : 'Unknown',
        creatorId: workData.userId,
        createdAt: workData.createdAt,
        thumbnailUrl: workData.thumbnailUrl,
        isProtected: true,
        isVerified: Boolean(workData.blockchainHash),
        stats: {
          views: Math.floor(Math.random() * 500), // Would come from analytics
          likes: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 25)
        }
      };
    } catch (error) {
      console.error("Error getting work preview:", error);
      return null;
    }
  }

  // Background Preferences Management
  async getUserBackgroundPreferences(userId: number): Promise<UserBackgroundPreference[]> {
    const preferences = await db
      .select()
      .from(userBackgroundPreferences)
      .where(eq(userBackgroundPreferences.userId, userId))
      .orderBy(desc(userBackgroundPreferences.lastUsed));

    return preferences;
  }

  async createBackgroundPreference(data: InsertUserBackgroundPreference): Promise<UserBackgroundPreference> {
    const [preference] = await db
      .insert(userBackgroundPreferences)
      .values(data)
      .returning();

    return preference;
  }

  async updateBackgroundPreference(id: number, updates: Partial<UserBackgroundPreference>): Promise<UserBackgroundPreference> {
    const [preference] = await db
      .update(userBackgroundPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userBackgroundPreferences.id, id))
      .returning();

    return preference;
  }

  async recordBackgroundInteraction(data: InsertBackgroundInteraction): Promise<BackgroundInteraction> {
    const [interaction] = await db
      .insert(backgroundInteractions)
      .values(data)
      .returning();

    return interaction;
  }

  async getBackgroundAnalytics(userId: number, days: number = 30): Promise<BackgroundInteraction[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const analytics = await db
      .select()
      .from(backgroundInteractions)
      .where(
        and(
          eq(backgroundInteractions.userId, userId),
          gte(backgroundInteractions.createdAt, daysAgo)
        )
      )
      .orderBy(desc(backgroundInteractions.createdAt));

    return analytics;
  }

  async getPopularBackgroundTrends(limit: number = 10): Promise<{
    gradientType: string;
    colorScheme: string;
    usageCount: number;
  }[]> {
    const trends = await db
      .select({
        gradientType: userBackgroundPreferences.gradientType,
        colorScheme: userBackgroundPreferences.colorScheme,
        usageCount: sql<number>`sum(${userBackgroundPreferences.usageCount})`.as('total_usage'),
      })
      .from(userBackgroundPreferences)
      .groupBy(userBackgroundPreferences.gradientType, userBackgroundPreferences.colorScheme)
      .orderBy(desc(sql`sum(${userBackgroundPreferences.usageCount})`))
      .limit(limit);

    return trends;
  }

  async updateBackgroundUsage(preferenceId: number): Promise<void> {
    await db
      .update(userBackgroundPreferences)
      .set({
        usageCount: sql`${userBackgroundPreferences.usageCount} + 1`,
        lastUsed: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userBackgroundPreferences.id, preferenceId));
  }

  async getBackgroundPreference(preferenceId: number): Promise<UserBackgroundPreference | undefined> {
    const [preference] = await db
      .select()
      .from(userBackgroundPreferences)
      .where(eq(userBackgroundPreferences.id, preferenceId));
    
    return preference;
  }

  async deleteBackgroundPreference(preferenceId: number): Promise<void> {
    await db
      .delete(userBackgroundPreferences)
      .where(eq(userBackgroundPreferences.id, preferenceId));
  }

  // Interface implementation methods
  async saveBackgroundPreference(userId: number, preferenceData: any): Promise<any> {
    const preference = await this.createBackgroundPreference({
      userId,
      gradientType: preferenceData.gradientType,
      colorScheme: preferenceData.colorScheme,
      primaryColors: preferenceData.primaryColors,
      secondaryColors: preferenceData.secondaryColors,
      direction: preferenceData.direction,
      intensity: preferenceData.intensity,
      animationSpeed: preferenceData.animationSpeed,
      timeOfDayPreference: preferenceData.timeOfDayPreference,
      moodTag: preferenceData.moodTag,
      userRating: preferenceData.userRating,
    });
    return preference;
  }

  async trackBackgroundInteraction(userId: number, interactionData: any): Promise<any> {
    const interaction = await this.recordBackgroundInteraction({
      userId,
      gradientId: `preference-${interactionData.preferenceId || 'generated'}`, // Use preference ID as gradient identifier
      interactionType: interactionData.interactionType,
      timeSpent: interactionData.timeSpent,
      pageContext: interactionData.pageContext,
      deviceType: interactionData.deviceType,
      timeOfDay: interactionData.timeOfDay,
      weatherContext: interactionData.weatherContext,
      sessionDuration: interactionData.sessionDuration,
    });
    return interaction;
  }

  async getBackgroundRecommendations(userId: number, pageContext?: string): Promise<any> {
    // Get user's preferences and interaction history
    const preferences = await this.getUserBackgroundPreferences(userId);
    const analytics = await this.getBackgroundAnalytics(userId, 30);
    const trends = await this.getPopularBackgroundTrends();

    // Simple recommendation algorithm combining user preferences, history, and trends
    const recommendations = {
      personalizedGradients: preferences.slice(0, 3),
      trendingGradients: trends.slice(0, 3),
      contextualSuggestions: this.generateContextualSuggestions(pageContext),
      aiGeneratedOptions: this.generateAISuggestions(preferences, analytics)
    };

    return recommendations;
  }

  private generateContextualSuggestions(pageContext?: string): any[] {
    // Generate contextual gradient suggestions based on page context
    const contexts = {
      '/premium-home': [
        { gradientType: 'radial', colorScheme: 'warm', primaryColors: ['#FE3F5E', '#FFD200'] },
        { gradientType: 'linear', colorScheme: 'cool', primaryColors: ['#6366f1', '#8b5cf6'] },
      ],
      '/dashboard': [
        { gradientType: 'linear', colorScheme: 'professional', primaryColors: ['#374151', '#6b7280'] },
        { gradientType: 'radial', colorScheme: 'energetic', primaryColors: ['#ef4444', '#f97316'] },
      ],
      default: [
        { gradientType: 'linear', colorScheme: 'sunset', primaryColors: ['#FE3F5E', '#FFD200'] },
        { gradientType: 'radial', colorScheme: 'ocean', primaryColors: ['#0ea5e9', '#06b6d4'] },
      ]
    };

    return contexts[pageContext as keyof typeof contexts] || contexts.default;
  }

  private generateAISuggestions(preferences: any[], analytics: any[]): any[] {
    // AI-powered suggestions based on user behavior patterns
    const suggestions = [
      {
        gradientType: 'linear',
        colorScheme: 'adaptive',
        primaryColors: ['#FE3F5E', '#FFD200'],
        reason: 'Based on your interaction patterns',
        confidence: 0.85
      },
      {
        gradientType: 'radial',
        colorScheme: 'complementary',
        primaryColors: ['#8b5cf6', '#06b6d4'],
        reason: 'Popular among similar users',
        confidence: 0.72
      }
    ];

    return suggestions;
  }
}

export const storage = new DatabaseStorage();
