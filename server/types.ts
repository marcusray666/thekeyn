import { Request } from 'express';
import 'express-session';

// Extend session types
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Authenticated request type
export interface AuthenticatedRequest extends Request {
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