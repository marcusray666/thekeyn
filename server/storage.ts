import { 
  users, works, certificates, copyrightApplications, nftMints, posts, follows, likes, comments, shares, notifications,
  postComments, postReactions, userFollows, userNotifications, contentCategories, userPreferences, userAnalytics,
  marketplace, purchases, collaborationProjects, projectCollaborators, subscriptions, subscriptionUsage,
  blockchainVerifications, verificationAuditLog,
  type User, type InsertUser, type Work, type InsertWork, type Certificate, type InsertCertificate, 
  type CopyrightApplication, type InsertCopyrightApplication, type NftMint, type InsertNftMint, 
  type Post, type InsertPost, type PostComment, type InsertPostComment, type UserFollow, type InsertUserFollow,
  type UserNotification, type InsertUserNotification, type ContentCategory, type UserPreference, type UserAnalytic,
  type MarketplaceListing, type InsertMarketplaceListing, type Purchase, type CollaborationProject, type InsertCollaborationProject,
  type ProjectCollaborator, type Follow, type InsertFollow, type Like, type InsertLike, type Comment, type InsertComment, 
  type Share, type InsertShare, type Notification, type InsertNotification, type Subscription, type InsertSubscription,
  type SubscriptionUsage, type InsertSubscriptionUsage, type BlockchainVerification, type InsertBlockchainVerification,
  type VerificationAuditLog, type InsertVerificationAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
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
  
  createCopyrightApplication(application: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication>;
  getCopyrightApplication(id: string, userId: number): Promise<CopyrightApplication | undefined>;
  getCopyrightApplications(userId: number): Promise<CopyrightApplication[]>;
  updateCopyrightApplication(id: string, updates: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication>;
  
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
  getPosts(options?: { userId?: number; limit?: number; offset?: number; category?: string; following?: boolean }): Promise<(Post & { username: string; userImage?: string; isFollowing?: boolean })[]>;
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
    await db.delete(works).where(eq(works.id, id));
  }

  async deleteCertificate(id: number): Promise<void> {
    await db.delete(certificates).where(eq(certificates.id, id));
  }

  async createCopyrightApplication(application: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication> {
    const appData = {
      ...application,
      applicationData: typeof application.applicationData === 'string' 
        ? application.applicationData 
        : JSON.stringify(application.applicationData || {}),
      submissionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [copyrightApp] = await db
      .insert(copyrightApplications)
      .values(appData as any)
      .returning();
    return copyrightApp;
  }

  async getCopyrightApplication(id: string, userId: number): Promise<CopyrightApplication | undefined> {
    const [application] = await db
      .select()
      .from(copyrightApplications)
      .where(eq(copyrightApplications.id, parseInt(id)));
    
    if (application && application.userId === userId) {
      return application;
    }
    return undefined;
  }

  async getCopyrightApplications(userId: number): Promise<CopyrightApplication[]> {
    return await db
      .select()
      .from(copyrightApplications)
      .where(eq(copyrightApplications.userId, userId))
      .orderBy(desc(copyrightApplications.createdAt));
  }

  async updateCopyrightApplication(id: string, updates: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication> {
    const updateData = {
      ...updates,
      applicationData: typeof updates.applicationData === 'string' 
        ? updates.applicationData 
        : JSON.stringify(updates.applicationData || {}),
      updatedAt: new Date()
    };

    const [application] = await db
      .update(copyrightApplications)
      .set(updateData as any)
      .where(eq(copyrightApplications.id, parseInt(id)))
      .returning();
    return application;
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
    return await db.select().from(works)
      .where(eq(works.userId, userId))
      .orderBy(desc(works.createdAt));
  }

  async followUser(followerId: number, followingId: number): Promise<Follow> {
    // Simple implementation for now
    const [follow] = await db.insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows)
      .where(eq(follows.followerId, followerId));
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db.select().from(follows)
      .where(eq(follows.followerId, followerId));
    return result.length > 0;
  }

  async likeWork(userId: number, workId: number): Promise<Like> {
    const [like] = await db.insert(likes)
      .values({ userId, workId })
      .returning();
    return like;
  }

  async unlikeWork(userId: number, workId: number): Promise<void> {
    await db.delete(likes)
      .where(eq(likes.userId, userId));
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

  async getUserWorks(userId: number): Promise<Work[]> {
    return await db.select().from(works).where(eq(works.userId, userId)).orderBy(desc(works.createdAt));
  }

  // Posts functionality implementation
  async createPost(postData: InsertPost & { userId: number }): Promise<Post> {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [post] = await db
      .insert(posts)
      .values({
        id: postId,
        userId: postData.userId,
        content: postData.content,
        imageUrl: postData.imageUrl,
        fileType: postData.fileType,
        tags: postData.tags || [],
      })
      .returning();
    
    return post;
  }

  async getPosts(options: { userId?: number; limit?: number; offset?: number } = {}): Promise<(Post & { username: string })[]> {
    const { limit = 20, offset = 0, userId } = options;
    
    let query = db
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
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    if (userId) {
      query = query.where(eq(posts.userId, userId));
    }

    return await query;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async likePost(userId: number, postId: string): Promise<void> {
    // For now, just increment the counter (in production, track individual likes)
    await db
      .update(posts)
      .set({ 
        likes: posts.likes + 1,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
  }

  async unlikePost(userId: number, postId: string): Promise<void> {
    // For now, just decrement the counter (in production, track individual likes)
    await db
      .update(posts)
      .set({ 
        likes: Math.max(posts.likes - 1, 0),
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

  async deletePost(id: string, userId: number): Promise<void> {
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
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        filename: posts.filename,
        fileType: posts.fileType,
        mimeType: posts.mimeType,
        fileSize: posts.fileSize,
        imageUrl: posts.imageUrl,
        tags: posts.tags,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        views: posts.views,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
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

  // Following functionality
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

  // Notifications functionality
  async createNotification(notification: InsertUserNotification): Promise<UserNotification> {
    const [newNotification] = await db
      .insert(userNotifications)
      .values(notification)
      .returning();
    
    return newNotification;
  }

  async getUserNotifications(userId: number, options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}): Promise<UserNotification[]> {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;
    
    let query = db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));
    
    if (unreadOnly) {
      query = query.where(eq(userNotifications.isRead, false));
    }
    
    return await query
      .orderBy(desc(userNotifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

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
    
    await db
      .insert(userAnalytics)
      .values({ userId, date: today, ...activity })
      .onConflictDoUpdate({
        target: [userAnalytics.userId, userAnalytics.date],
        set: {
          profileViews: sql`${userAnalytics.profileViews} + ${activity.profileViews || 0}`,
          postViews: sql`${userAnalytics.postViews} + ${activity.postViews || 0}`,
          workViews: sql`${userAnalytics.workViews} + ${activity.workViews || 0}`,
          newFollowers: sql`${userAnalytics.newFollowers} + ${activity.newFollowers || 0}`,
          totalEngagement: sql`${userAnalytics.totalEngagement} + ${activity.totalEngagement || 0}`,
          revenue: sql`${userAnalytics.revenue} + ${activity.revenue || 0}`,
        }
      });
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
    const remainingUploads = Math.max(0, limits.uploadLimit - uploadsUsed);
    
    return {
      canUpload: remainingUploads > 0 || limits.uploadLimit === -1, // -1 means unlimited
      remainingUploads: limits.uploadLimit === -1 ? Infinity : remainingUploads,
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
    const subscription = await this.getUserSubscription(userId);
    
    const tier = subscription?.tier || user?.subscriptionTier || 'free';
    
    const tierLimits = {
      free: {
        uploadLimit: 3,
        hasDownloadableCertificates: false,
        hasCustomBranding: false,
        hasIPFSStorage: false,
        hasAPIAccess: false,
        teamSize: 1
      },
      starter: {
        uploadLimit: 10,
        hasDownloadableCertificates: true,
        hasCustomBranding: false,
        hasIPFSStorage: false,
        hasAPIAccess: false,
        teamSize: 1
      },
      pro: {
        uploadLimit: -1, // unlimited
        hasDownloadableCertificates: true,
        hasCustomBranding: true,
        hasIPFSStorage: true,
        hasAPIAccess: true,
        teamSize: 1
      },
      agency: {
        uploadLimit: -1, // unlimited
        hasDownloadableCertificates: true,
        hasCustomBranding: true,
        hasIPFSStorage: true,
        hasAPIAccess: true,
        teamSize: 10
      }
    };
    
    return {
      tier,
      ...tierLimits[tier as keyof typeof tierLimits] || tierLimits.free
    };
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
}

export const storage = new DatabaseStorage();
