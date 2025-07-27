import type { User } from "@shared/schema";

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    userId: number;
    user?: User;
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export interface AuthenticatedUser extends User {
  // Additional client-side user properties if needed
}