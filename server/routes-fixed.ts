import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import Stripe from "stripe";
import { fileURLToPath } from 'url';
import { pool } from "./db";
import { loginSchema, registerSchema, insertWorkSchema } from "@shared/schema";
import { createPostSchema, uploadUrlSchema, workUploadSchema, createApiError, isAllowedMediaType } from "@shared/validation";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Authentication types
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: Date | null;
    monthlyUploads: number;
    monthlyUploadLimit: number;
    lastUploadReset: Date;
    walletAddress: string | null;
    displayName: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    website: string | null;
    location: string | null;
    isVerified: boolean;
    followerCount: number;
    followingCount: number;
    totalLikes: number;
    themePreference: string;
    settings: Record<string, any>;
    lastLoginAt: Date | null;
    isBanned: boolean;
    banReason: string | null;
    createdAt: Date;
  };
}

// Extend express-session
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Initialize Stripe (with fallback to avoid crashes)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
}) : null;

function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const randomId = crypto.randomBytes(6).toString('hex');
  return `CERT-${timestamp}-${randomId}`.toUpperCase();
}

// Authentication middleware
async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user from database
    const result = await pool.query(`
      SELECT id, username, email, role, subscription_tier, subscription_status, 
             subscription_expires_at, monthly_uploads, monthly_upload_limit, 
             last_upload_reset, wallet_address, display_name, bio, 
             profile_image_url, website, location, is_verified, 
             follower_count, following_count, total_likes, theme_preference, 
             settings, last_login_at, is_banned, ban_reason, created_at
      FROM users WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = result.rows[0];
    
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscription_tier,
      subscriptionStatus: user.subscription_status || 'active',
      subscriptionExpiresAt: user.subscription_expires_at,
      monthlyUploads: user.monthly_uploads || 0,
      monthlyUploadLimit: user.monthly_upload_limit || 3,
      lastUploadReset: user.last_upload_reset,
      walletAddress: user.wallet_address,
      displayName: user.display_name,
      bio: user.bio,
      profileImageUrl: user.profile_image_url,
      website: user.website,
      location: user.location,
      isVerified: user.is_verified || false,
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0,
      totalLikes: user.total_likes || 0,
      themePreference: user.theme_preference || 'liquid-glass',
      settings: typeof user.settings === 'string' ? JSON.parse(user.settings || '{}') : user.settings || {},
      lastLoginAt: user.last_login_at,
      isBanned: user.is_banned || false,
      banReason: user.ban_reason,
      createdAt: user.created_at,
    };

    if (req.user.isBanned) {
      return res.status(403).json({ error: "Account is banned", reason: req.user.banReason });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerRoutes(app: Express) {
  // Create HTTP server
  const server = createServer(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Authentication endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      // Get user from database
      const result = await pool.query(
        'SELECT id, username, email, password_hash, role, is_banned, ban_reason FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const user = result.rows[0];

      if (user.is_banned) {
        return res.status(403).json({ 
          error: "Account is banned", 
          reason: user.ban_reason || "Account has been suspended"
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Set session
      (req.session as any).userId = user.id;

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: "Username or email already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const result = await pool.query(`
        INSERT INTO users (username, email, password_hash, role, subscription_tier, is_verified)
        VALUES ($1, $2, $3, 'user', 'free', false)
        RETURNING id, username, email, role
      `, [username, email, passwordHash]);

      const newUser = result.rows[0];

      // Set session
      (req.session as any).userId = newUser.id;

      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Failed to logout' });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({
      authenticated: true,
      user: req.user
    });
  });

  app.get('/api/auth/user', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  // Profile endpoints
  app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  app.patch('/api/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = req.body;
      const allowedFields = ['display_name', 'bio', 'website', 'location'];
      
      const setClause = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (setClause.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      values.push(req.user!.id);

      const result = await pool.query(`
        UPDATE users SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING display_name, bio, website, location
      `, values);

      res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Works endpoints
  app.get('/api/works', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT w.*, c.pdf_path, c.qr_code, c.shareable_link
        FROM works w
        LEFT JOIN certificates c ON w.id = c.work_id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
      `, [req.user!.id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get works error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/api/works/public', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const result = await pool.query(`
        SELECT w.*, u.username, u.display_name, u.profile_image_url,
               c.shareable_link
        FROM works w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN certificates c ON w.id = c.work_id
        WHERE w.is_public = true AND w.moderation_status = 'approved'
        ORDER BY w.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get public works error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/api/works/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        SELECT w.*, u.username, u.display_name, u.profile_image_url,
               c.pdf_path, c.qr_code, c.shareable_link
        FROM works w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN certificates c ON w.id = c.work_id
        WHERE w.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Work not found" });
      }

      const work = result.rows[0];

      // Check if work is public or user owns it
      const userId = (req.session as any)?.userId;
      if (!work.is_public && work.user_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Increment view count
      await pool.query(
        'UPDATE works SET view_count = view_count + 1 WHERE id = $1',
        [id]
      );

      res.json(work);
    } catch (error) {
      console.error('Get work error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Posts endpoints for community feed
  app.get('/api/posts', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const result = await pool.query(`
        SELECT p.*, u.username, u.display_name, u.profile_image_url
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        SELECT p.*, u.username, u.display_name, u.profile_image_url
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Profile/user works endpoint
  app.get('/api/users/:userId/works', async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = (req.session as any)?.userId;
      
      // Check if requesting own works or public works
      let query = `
        SELECT w.*, c.pdf_path, c.qr_code, c.shareable_link
        FROM works w
        LEFT JOIN certificates c ON w.id = c.work_id
        WHERE w.user_id = $1
      `;
      
      // If not the owner, only show public works
      if (parseInt(userId) !== currentUserId) {
        query += ` AND w.is_public = true AND w.moderation_status = 'approved'`;
      }
      
      query += ` ORDER BY w.created_at DESC`;
      
      const result = await pool.query(query, [userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Get user works error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current user's works (for profile page)
  app.get('/api/my-works', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await pool.query(`
        SELECT w.*, c.pdf_path, c.qr_code, c.shareable_link
        FROM works w
        LEFT JOIN certificates c ON w.id = c.work_id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
      `, [req.user!.id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get my works error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Community/feed endpoint
  app.get('/api/feed', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      // Get both posts and public works for the feed
      const postsResult = await pool.query(`
        SELECT 
          'post' as type,
          p.id,
          p.title,
          p.description,
          p.content,
          p.image_url as imageUrl,
          p.video_url as videoUrl,
          p.audio_url as audioUrl,
          p.hashtags,
          p.location,
          p.like_count as likes,
          p.comment_count as comments,
          p.share_count as shares,
          p.view_count as views,
          p.created_at,
          u.username,
          u.display_name,
          u.profile_image_url
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      const worksResult = await pool.query(`
        SELECT 
          'work' as type,
          w.id,
          w.title,
          w.description,
          w.filename,
          w.mime_type,
          w.like_count as likes,
          w.comment_count as comments,
          w.share_count as shares,
          w.view_count as views,
          w.created_at,
          u.username,
          u.display_name,
          u.profile_image_url,
          c.shareable_link
        FROM works w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN certificates c ON w.id = c.work_id
        WHERE w.is_public = true AND w.moderation_status = 'approved'
        ORDER BY w.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      // Combine and sort by created_at
      const combined = [...postsResult.rows, ...worksResult.rows]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, parseInt(limit as string));

      res.json(combined);
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Catch-all for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.path}` });
  });

  return server;
}