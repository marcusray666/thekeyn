import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertWorkSchema } from "@shared/schema";

const MemStore = MemoryStore(session);

function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

function generateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function generateBlockchainHash(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getCopyrightOfficeFee(officeId: string): string {
  const fees: Record<string, string> = {
    'us_copyright_office': '$65',
    'uk_ipo': '£10',
    'cipo_canada': 'CAD $100',
    'eu_copyright': '€250'
  };
  return fees[officeId] || '$50';
}

// DMCA Takedown Email Template Generator
function generateTakedownEmail(data: {
  work: any;
  certificate: any;
  platform: string;
  infringingUrl: string;
  description: string;
  contactEmail: string;
  baseUrl: string;
}) {
  const { work, certificate, platform, infringingUrl, description, contactEmail, baseUrl } = data;
  
  return `Subject: Takedown Request – Unauthorized Use of Copyrighted Content

Hello,

I am contacting you on behalf of ${work.creatorName}, the rights holder of the original content referenced below. We have identified that our content has been published or distributed without permission on your platform.

Details of the original content:

Title: ${work.title}
Author: ${work.creatorName}${work.collaborators && work.collaborators.length > 0 ? `
Collaborators: ${work.collaborators.join(', ')}` : ''}
Original file name: ${work.originalName}
Copyright registration: Certificate ID ${certificate.certificateId}
URL/Location of original content: ${baseUrl}/certificate/${certificate.certificateId}
Blockchain verification hash: ${work.blockchainHash}

Details of the infringing content:

URL/Location where infringing content appears: ${infringingUrl}
Platform: ${platform}
Description of the infringing content: ${description}

This unauthorized use constitutes copyright infringement. We request that you promptly remove or disable access to the infringing material.

I have a good faith belief that use of the copyrighted content described above is not authorized by the copyright owner, its agent, or the law.

I declare, under penalty of perjury, that the information in this notice is accurate and that I am the copyright owner or am authorized to act on behalf of the copyright owner.

Please confirm when this content has been removed. If you need additional information, you can contact me at ${contactEmail}.

You can verify the authenticity of this copyright claim by visiting our certificate page: ${baseUrl}/certificate/${certificate.certificateId}

Thank you for your cooperation.

Sincerely,
${work.creatorName}
${contactEmail}

---
This takedown request was generated through Prooff Digital Copyright Protection Platform
Certificate ID: ${certificate.certificateId}
File Hash: ${work.fileHash}
Registration Date: ${new Date(certificate.createdAt).toLocaleDateString()}`;
}

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; email: string };
}

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    interface SessionData {
      userId?: number;
    }

    const sessionData = req.session as SessionData;
    if (!sessionData || !sessionData.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser(sessionData.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};

// Set up multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${extension}`);
  },
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "video/mp4",
      "video/webm",
      "application/pdf",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  const sessionMiddleware = session({
    store: new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });

  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
      });

      // Set session
      req.session.userId = user.id;
      
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Set session
      req.session.userId = user.id;
      
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  // Get single certificate by ID (public endpoint for certificate verification)
  app.get("/api/certificate/:id", async (req, res) => {
    try {
      const certificateId = req.params.id;
      
      // Find work by certificate ID
      const work = await storage.getWorkByCertificateId(certificateId);
      if (!work) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      
      // Find certificate by work ID
      const certificate = await storage.getCertificateByWorkId(work.id);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate data not found" });
      }
      
      // Return certificate with work data
      res.json({
        ...certificate,
        work
      });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ error: "Failed to fetch certificate" });
    }
  });

  // Get all certificates for authenticated user
  app.get("/api/certificates", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      
      // Transform certificates to include work data
      const certificatesWithWorks = await Promise.all(
        certificates.map(async (cert) => {
          const work = await storage.getWork(cert.workId);
          return {
            ...cert,
            work: work || null,
          };
        })
      );

      res.json(certificatesWithWorks);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const works = await storage.getAllWorks();
      const certificates = await storage.getAllCertificates();

      const stats = {
        protected: works.length,
        certificates: certificates.length,
        reports: 0, // Placeholder for future implementation
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get recent works
  app.get("/api/dashboard/recent-works", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const recentWorks = await storage.getRecentWorks(10);
      res.json(recentWorks);
    } catch (error) {
      console.error("Error fetching recent works:", error);
      res.status(500).json({ error: "Failed to fetch recent works" });
    }
  });

  // Report theft endpoint
  app.post("/api/report-theft", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { certificateId, platform, infringingUrl, description, contactEmail } = req.body;
      
      // Validate the certificate exists
      const work = await storage.getWorkByCertificateId(certificateId);
      if (!work) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      // Get certificate data
      const certificate = await storage.getCertificateByWorkId(work.id);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate data not found" });
      }

      // Generate DMCA takedown email template
      const emailTemplate = generateTakedownEmail({
        work,
        certificate,
        platform,
        infringingUrl,
        description,
        contactEmail,
        baseUrl: `${req.protocol}://${req.get("host")}`
      });

      // Get platform contact info
      const platformContacts = {
        'Twitter/X': 'copyright@twitter.com',
        'Instagram': 'ip@instagram.com',
        'Facebook': 'ip@facebook.com',
        'YouTube': 'copyright@youtube.com',
        'LinkedIn': 'copyright@linkedin.com',
        'TikTok': 'legal@tiktok.com',
        'Pinterest': 'copyright@pinterest.com'
      };

      const reportId = crypto.randomUUID();

      res.json({ 
        message: "Takedown request generated successfully",
        reportId,
        emailTemplate,
        platformEmail: platformContacts[platform as keyof typeof platformContacts] || 'Unknown platform',
        certificateUrl: `${req.protocol}://${req.get("host")}/certificate/${certificate.certificateId}`
      });
    } catch (error) {
      console.error("Error submitting theft report:", error);
      res.status(500).json({ error: "Failed to submit theft report" });
    }
  });

  // Upload work endpoint
  app.post("/api/works", requireAuth, upload.single("file"), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { title, description, creatorName, collaborators } = req.body;

      if (!title || !creatorName) {
        return res.status(400).json({ error: "Title and creator name are required" });
      }

      // Parse collaborators if provided (could be JSON string from form data)
      let collaboratorList = [];
      if (collaborators) {
        try {
          collaboratorList = typeof collaborators === 'string' ? JSON.parse(collaborators) : collaborators;
        } catch (e) {
          // If not JSON, treat as comma-separated string
          collaboratorList = collaborators.split(',').map((c: string) => c.trim()).filter(Boolean);
        }
      }

      // Generate file hash
      const fileHash = generateFileHash(req.file.path);
      const certificateId = generateCertificateId();
      const blockchainHash = generateBlockchainHash();

      // Create work record
      const work = await storage.createWork({
        title,
        description: description || "",
        creatorName,
        collaborators: collaboratorList,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileHash,
        certificateId,
        blockchainHash,
      });

      // Create certificate
      const certificate = await storage.createCertificate({
        workId: work.id,
        certificateId,
        shareableLink: `${req.protocol}://${req.get("host")}/certificate/${certificateId}`,
        qrCode: `data:image/svg+xml;base64,${Buffer.from(`<svg></svg>`).toString("base64")}`,
      });

      res.json({
        work,
        certificate,
        message: "Work uploaded and protected successfully",
      });
    } catch (error) {
      console.error("Error uploading work:", error);
      res.status(500).json({ error: "Failed to upload work" });
    }
  });

  // Update work endpoint
  app.put("/api/works/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const workId = parseInt(req.params.id);
      const { title, description, creatorName, collaborators } = req.body;

      if (!title || !creatorName) {
        return res.status(400).json({ error: "Title and creator name are required" });
      }

      const work = await storage.getWork(workId);
      if (!work) {
        return res.status(404).json({ error: "Work not found" });
      }

      const updatedWork = await storage.updateWork(workId, {
        title,
        description: description || "",
        creatorName,
        collaborators: collaborators || [],
      });

      res.json({
        work: updatedWork,
        message: "Work updated successfully",
      });
    } catch (error) {
      console.error("Error updating work:", error);
      res.status(500).json({ error: "Failed to update work" });
    }
  });

  // Delete work endpoint
  app.delete("/api/works/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const workId = parseInt(req.params.id);

      const work = await storage.getWork(workId);
      if (!work) {
        return res.status(404).json({ error: "Work not found" });
      }

      // Delete associated certificate first
      const certificate = await storage.getCertificateByWorkId(workId);
      if (certificate) {
        await storage.deleteCertificate(certificate.id);
      }

      // Delete the work
      await storage.deleteWork(workId);

      // Delete file from filesystem
      if (work.filename) {
        const filePath = path.join("uploads", work.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        message: "Work deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting work:", error);
      res.status(500).json({ error: "Failed to delete work" });
    }
  });

  // Copyright Registration Routes
  app.get("/api/copyright-registrations", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const applications = await storage.getCopyrightApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching copyright applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/copyright-registrations", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { workId, officeId, applicationData } = req.body;
      
      // Validate required fields
      if (!workId || !officeId || !applicationData) {
        return res.status(400).json({ message: "Missing required application data" });
      }

      // Verify work belongs to user
      const work = await storage.getWork(workId);
      if (!work || work.userId !== userId) {
        return res.status(403).json({ message: "Work not found or access denied" });
      }

      // Create application
      const application = await storage.createCopyrightApplication({
        userId,
        workId,
        officeId,
        applicationData,
        status: 'submitted',
        submissionDate: new Date().toISOString(),
        fee: getCopyrightOfficeFee(officeId)
      });

      res.json(application);
    } catch (error) {
      console.error("Error creating copyright application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get("/api/copyright-registrations/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const application = await storage.getCopyrightApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching copyright application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // NFT minting routes
  app.post('/api/nft-mints', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Simulate blockchain minting process
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockTokenId = Math.floor(Math.random() * 10000) + 1;
      
      const nftMint = await storage.createNftMint({
        ...req.body,
        userId: req.userId!,
        transactionHash: mockTransactionHash,
        tokenId: mockTokenId.toString(),
        status: 'minting',
        mintingCost: req.body.blockchain === 'ethereum' ? '$25.43' : 
                    req.body.blockchain === 'polygon' ? '$3.21' :
                    req.body.blockchain === 'arbitrum' ? '$6.18' : '$2.14',
        metadataUri: `https://prooff.app/metadata/${mockTokenId}`,
        marketplaceListings: ['OpenSea']
      });

      // Simulate minting completion after a delay
      setTimeout(async () => {
        try {
          await storage.updateNftMint(nftMint.id, {
            status: 'completed'
          });
        } catch (error) {
          console.error('Error updating NFT mint status:', error);
        }
      }, 5000);

      res.json(nftMint);
    } catch (error) {
      console.error('Error creating NFT mint:', error);
      res.status(500).json({ message: 'Failed to create NFT mint' });
    }
  });

  app.get('/api/nft-mints', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const nftMints = await storage.getNftMints(req.userId!);
      res.json(nftMints);
    } catch (error) {
      console.error('Error fetching NFT mints:', error);
      res.status(500).json({ message: 'Failed to fetch NFT mints' });
    }
  });

  app.get('/api/nft-mints/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const nftMint = await storage.getNftMint(parseInt(req.params.id));
      if (!nftMint || nftMint.userId !== req.userId!) {
        return res.status(404).json({ message: 'NFT mint not found' });
      }
      res.json(nftMint);
    } catch (error) {
      console.error('Error fetching NFT mint:', error);
      res.status(500).json({ message: 'Failed to fetch NFT mint' });
    }
  });

  app.put('/api/nft-mints/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const nftMint = await storage.updateNftMint(parseInt(req.params.id), req.body);
      res.json(nftMint);
    } catch (error) {
      console.error('Error updating NFT mint:', error);
      res.status(500).json({ message: 'Failed to update NFT mint' });
    }
  });

  // Subscription management routes
  app.post('/api/subscription/upgrade', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { tierId } = req.body;
      
      // Simulate payment processing and subscription update
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Calculate expiration date (30 days from now for monthly plans)
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      // Update user subscription
      await storage.updateUser(req.userId!, {
        subscriptionTier: tierId,
        subscriptionExpiresAt: expirationDate
      });

      res.json({ 
        message: 'Subscription upgraded successfully',
        tier: tierId,
        expiresAt: expirationDate
      });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      res.status(500).json({ message: 'Failed to upgrade subscription' });
    }
  });

  app.get('/api/subscription/status', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        tier: user.subscriptionTier,
        expiresAt: user.subscriptionExpiresAt,
        isActive: !user.subscriptionExpiresAt || user.subscriptionExpiresAt > new Date()
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ message: 'Failed to fetch subscription status' });
    }
  });

  // Social media routes
  app.get('/api/social/feed', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { filter = 'all', search, tags, limit = 20, offset = 0 } = req.query;
      
      const tagArray = tags ? (tags as string).split(',').filter(Boolean) : [];
      
      const works = await storage.getPublicWorks({
        userId: req.userId!,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        filter: filter as string,
        search: search as string,
        tags: tagArray
      });

      // Enrich with user data and interaction status
      const enrichedWorks = await Promise.all(
        works.map(async (work) => {
          const user = await storage.getUser(work.userId);
          const isLiked = await storage.isWorkLiked(req.userId!, work.id);
          const hasUserFollowed = user ? await storage.isFollowing(req.userId!, user.id) : false;
          
          return {
            ...work,
            user: user ? {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              profileImageUrl: user.profileImageUrl,
              isVerified: user.isVerified
            } : null,
            isLiked,
            hasUserFollowed: user?.id !== req.userId! ? hasUserFollowed : false
          };
        })
      );

      res.json(enrichedWorks);
    } catch (error) {
      console.error('Error fetching social feed:', error);
      res.status(500).json({ message: 'Failed to fetch social feed' });
    }
  });

  app.post('/api/social/works/:workId/like', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const workId = parseInt(req.params.workId);
      const like = await storage.likeWork(req.userId!, workId);
      
      // Create notification for work owner
      const work = await storage.getWork(workId);
      if (work && work.userId !== req.userId!) {
        await storage.createNotification({
          userId: work.userId,
          type: 'like',
          fromUserId: req.userId!,
          workId: workId,
          message: 'liked your work'
        });
      }
      
      res.json(like);
    } catch (error) {
      console.error('Error liking work:', error);
      res.status(500).json({ message: 'Failed to like work' });
    }
  });

  app.post('/api/social/works/:workId/unlike', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const workId = parseInt(req.params.workId);
      await storage.unlikeWork(req.userId!, workId);
      res.json({ message: 'Work unliked successfully' });
    } catch (error) {
      console.error('Error unliking work:', error);
      res.status(500).json({ message: 'Failed to unlike work' });
    }
  });

  app.post('/api/social/users/:userId/follow', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (userId === req.userId!) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }
      
      const follow = await storage.followUser(req.userId!, userId);
      
      // Create notification
      await storage.createNotification({
        userId: userId,
        type: 'follow',
        fromUserId: req.userId!,
        message: 'started following you'
      });
      
      res.json(follow);
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ message: 'Failed to follow user' });
    }
  });

  app.post('/api/social/users/:userId/unfollow', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await storage.unfollowUser(req.userId!, userId);
      res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ message: 'Failed to unfollow user' });
    }
  });

  app.post('/api/social/works/:workId/share', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const workId = parseInt(req.params.workId);
      const { shareText } = req.body;
      
      const share = await storage.shareWork({
        userId: req.userId!,
        workId: workId,
        shareText: shareText || ''
      });
      
      // Create notification for work owner
      const work = await storage.getWork(workId);
      if (work && work.userId !== req.userId!) {
        await storage.createNotification({
          userId: work.userId,
          type: 'share',
          fromUserId: req.userId!,
          workId: workId,
          message: 'shared your work'
        });
      }
      
      res.json(share);
    } catch (error) {
      console.error('Error sharing work:', error);
      res.status(500).json({ message: 'Failed to share work' });
    }
  });

  app.get('/api/social/trending-tags', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const tags = await storage.getTrendingTags(parseInt(limit as string));
      res.json(tags);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      res.status(500).json({ message: 'Failed to fetch trending tags' });
    }
  });

  // Profile showcase routes
  app.get('/api/social/profile/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if current user is following this profile (if authenticated)
      let isFollowing = false;
      if (req.userId) {
        isFollowing = await storage.isFollowing(req.userId, user.id);
      }

      const profile = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        website: user.website,
        location: user.location,
        isVerified: user.isVerified,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        totalLikes: user.totalLikes || 0,
        createdAt: user.createdAt,
        isFollowing
      };

      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  app.get('/api/social/profile/:username/works', async (req, res) => {
    try {
      const { username } = req.params;
      const { sort = 'recent' } = req.query;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userWorks = await storage.getUserWorks(user.id);
      
      // Sort works based on request
      let sortedWorks = [...userWorks];
      switch (sort) {
        case 'popular':
          sortedWorks.sort((a, b) => (b.likeCount || 0) + (b.viewCount || 0) - (a.likeCount || 0) - (a.viewCount || 0));
          break;
        case 'liked':
          sortedWorks.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
          break;
        case 'recent':
        default:
          sortedWorks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      // Enrich with like status if user is authenticated
      const enrichedWorks = await Promise.all(
        sortedWorks.map(async (work) => {
          let isLiked = false;
          if (req.userId) {
            isLiked = await storage.isWorkLiked(req.userId, work.id);
          }
          
          return {
            ...work,
            isLiked,
            // Set default values for social counts if missing
            likeCount: work.likeCount || 0,
            commentCount: work.commentCount || 0,
            shareCount: work.shareCount || 0,
            viewCount: work.viewCount || 0
          };
        })
      );

      res.json(enrichedWorks);
    } catch (error) {
      console.error('Error fetching user works:', error);
      res.status(500).json({ message: 'Failed to fetch user works' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}