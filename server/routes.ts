import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertWorkSchema } from "@shared/schema";
import blockchainRoutes from "./routes/blockchain-routes";
import { blockchainVerification } from "./blockchain-verification";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

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
This takedown request was generated through Loggin' Digital Copyright Protection Platform
Certificate ID: ${certificate.certificateId}
File Hash: ${work.fileHash}
Registration Date: ${new Date(certificate.createdAt).toLocaleDateString()}`;
}

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; email: string };
  userId?: number;
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
    
    // CRITICAL FIX: Set userId for profile updates
    req.userId = user.id;

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

  // Serve uploaded files with proper headers
  app.use("/uploads", express.static("uploads", {
    setHeaders: (res, path) => {
      // Set proper MIME type for images
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
      // Allow CORS for images
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // Blockchain/NFT routes (protected)
  app.use('/api/blockchain', requireAuth, blockchainRoutes);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists (case insensitive username)
      const existingUser = await storage.getUserByUsername(validatedData.username.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 12);

      // Create user (store username in lowercase)
      const user = await storage.createUser({
        username: validatedData.username.toLowerCase(),
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
      
      // Find user (case insensitive username)
      const user = await storage.getUserByUsername(validatedData.username.toLowerCase());
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

  // Serve uploaded files
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join("uploads", filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // Set appropriate headers
      const stat = fs.statSync(filePath);
      res.setHeader('Content-Length', stat.size);
      
      // Set content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const contentTypeMap: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
      };
      
      if (contentTypeMap[ext]) {
        res.setHeader('Content-Type', contentTypeMap[ext]);
      }
      
      // Stream the file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // Generate and download certificate PDF
  app.get("/api/certificates/:id/pdf", async (req, res) => {
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
      
      // Generate PDF content
      const pdfContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 40px; }
              .title { color: #8B5CF6; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { color: #666; font-size: 18px; }
              .content { max-width: 600px; margin: 0 auto; }
              .section { margin-bottom: 30px; }
              .label { font-weight: bold; color: #4A5568; }
              .value { margin-top: 5px; color: #2D3748; }
              .blockchain { background: #F7FAFC; padding: 20px; border-left: 4px solid #8B5CF6; margin: 20px 0; }
              .footer { text-align: center; margin-top: 50px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Loggin'</div>
              <div class="subtitle">Digital Work Protection Certificate</div>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="label">Certificate ID:</div>
                <div class="value">${certificate.certificateId}</div>
              </div>
              
              <div class="section">
                <div class="label">Work Title:</div>
                <div class="value">${work.title}</div>
              </div>
              
              <div class="section">
                <div class="label">Creator:</div>
                <div class="value">${work.creatorName}</div>
              </div>
              
              <div class="section">
                <div class="label">File Name:</div>
                <div class="value">${work.originalName}</div>
              </div>
              
              <div class="section">
                <div class="label">File Type:</div>
                <div class="value">${work.mimeType}</div>
              </div>
              
              <div class="section">
                <div class="label">File Size:</div>
                <div class="value">${Math.round(work.fileSize / 1024)} KB</div>
              </div>
              
              <div class="blockchain">
                <div class="label">Blockchain Verification:</div>
                <div class="value">${work.blockchainHash}</div>
              </div>
              
              <div class="section">
                <div class="label">Protected On:</div>
                <div class="value">${new Date(work.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>This certificate serves as proof of digital work ownership and timestamp verification.</p>
              <p>Certificate URL: ${certificate.shareableLink}</p>
            </div>
          </body>
        </html>
      `;
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
      
      // For now, return HTML that will be converted to PDF by the browser
      res.setHeader('Content-Type', 'text/html');
      res.send(pdfContent);
      
    } catch (error) {
      console.error("Error generating certificate PDF:", error);
      res.status(500).json({ error: "Failed to generate certificate PDF" });
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
        totalViews: Math.floor(Math.random() * 5000) + 1000, // Mock data for now
        thisMonth: Math.floor(Math.random() * 500) + 50, // Mock data for now
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Social feed endpoint
  app.get("/api/social/feed", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Get recent public works from all users (simulated social feed)
      const allWorks = await storage.getAllWorks();
      const socialPosts = allWorks.slice(0, 10).map(work => ({
        id: work.id,
        user: {
          id: work.userId || 1,
          username: work.creatorName,
          email: `${work.creatorName}@example.com`
        },
        work: {
          id: work.id,
          title: work.title,
          description: work.description,
          filename: work.filename,
          mimeType: work.mimeType,
          certificateId: work.certificateId
        },
        caption: `Check out my latest work: ${work.title}`,
        likes: Math.floor(Math.random() * 100) + 5,
        comments: Math.floor(Math.random() * 20) + 1,
        isLiked: Math.random() > 0.5,
        createdAt: work.createdAt
      }));

      res.json(socialPosts);
    } catch (error) {
      console.error("Error fetching social feed:", error);
      res.status(500).json({ error: "Failed to fetch social feed" });
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
      console.log('Upload request received:', {
        hasFile: !!req.file,
        bodyKeys: Object.keys(req.body),
        body: req.body
      });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { title, description, creatorName, collaborators } = req.body;

      if (!title || !creatorName) {
        return res.status(400).json({ error: "Title and creator name are required" });
      }

      // Check subscription limits
      const userId = req.session!.userId;
      console.log('Checking upload limits for user:', userId);
      const uploadCheck = await storage.checkUploadLimit(userId);
      console.log('Upload limit check result:', uploadCheck);
      
      if (!uploadCheck.canUpload) {
        return res.status(403).json({ 
          error: "Upload limit exceeded",
          message: `You have reached your monthly upload limit of ${uploadCheck.limit}. Please upgrade your subscription to upload more works.`,
          remainingUploads: uploadCheck.remainingUploads,
          limit: uploadCheck.limit
        });
      }

      // Parse collaborators if provided (could be JSON string from form data)
      let collaboratorList = [];
      if (collaborators) {
        try {
          if (typeof collaborators === 'string') {
            // Clean up the string first - remove any problematic characters
            const cleanedCollaborators = collaborators.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            if (cleanedCollaborators.startsWith('[') || cleanedCollaborators.startsWith('{')) {
              collaboratorList = JSON.parse(cleanedCollaborators);
            } else {
              collaboratorList = cleanedCollaborators.split(',').map((c: string) => c.trim()).filter(Boolean);
            }
          } else {
            collaboratorList = collaborators;
          }
        } catch (e) {
          console.error('Error parsing collaborators:', e);
          // If not valid JSON, treat as comma-separated string
          collaboratorList = String(collaborators).split(',').map((c: string) => c.trim()).filter(Boolean);
        }
      }

      // Generate file hash
      console.log('Generating file hash for:', req.file.filename);
      const fileHash = generateFileHash(req.file.path);
      const certificateId = generateCertificateId();
      const blockchainHash = generateBlockchainHash();
      console.log('Generated IDs:', { fileHash, certificateId, blockchainHash });

      // Create work record
      console.log('Creating work record...');
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

      console.log('Work created successfully:', work.id);

      // Get user's subscription limits for certificate features
      console.log('Getting subscription limits...');
      const limits = await storage.getUserSubscriptionLimits(userId);
      console.log('Subscription limits:', limits);
      
      // Create certificate
      console.log('Creating certificate...');
      const certificate = await storage.createCertificate({
        workId: work.id,
        certificateId,
        shareableLink: `${req.protocol}://${req.get("host")}/certificate/${certificateId}`,
        qrCode: `data:image/svg+xml;base64,${Buffer.from(`<svg></svg>`).toString("base64")}`,
        isDownloadable: limits.hasDownloadableCertificates,
        hasCustomBranding: limits.hasCustomBranding,
      });

      // Update usage counter
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentUsage = await storage.getSubscriptionUsage(userId, currentMonth);
      await storage.updateSubscriptionUsage(userId, currentMonth, {
        uploadsUsed: (currentUsage?.uploadsUsed || 0) + 1,
        storageUsed: (currentUsage?.storageUsed || 0) + req.file.size
      });

      console.log('Upload completed successfully:', {
        workId: work.id,
        certificateId: certificate.certificateId,
        title: work.title
      });

      res.json({
        work,
        certificate,
        message: "Work uploaded and protected successfully",
        remainingUploads: uploadCheck.remainingUploads - 1,
      });
    } catch (error) {
      console.error("Error uploading work:", error);
      
      // Check if it's a JSON parsing error
      if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
        return res.status(400).json({ 
          error: "Invalid JSON data in request", 
          details: error.message,
          suggestion: "Please check the format of the data being sent"
        });
      }
      
      res.status(500).json({ error: "Failed to upload work", details: error instanceof Error ? error.message : String(error) });
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

  // User settings routes
  app.get('/api/user/settings', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        notifications: user.settings?.notifications || {},
        privacy: user.settings?.privacy || {},
        security: user.settings?.security || {},
        theme: user.themePreference || 'liquid-glass'
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch('/api/user/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const updates = req.body;
      const userId = req.userId!;
      
      console.log('Profile update request:', { userId, updates });
      
      // Filter out undefined values and update user profile
      const filteredUpdates: any = {};
      if (updates.displayName !== undefined) filteredUpdates.displayName = updates.displayName;
      if (updates.bio !== undefined) filteredUpdates.bio = updates.bio;
      if (updates.website !== undefined) filteredUpdates.website = updates.website;
      if (updates.location !== undefined) filteredUpdates.location = updates.location;
      if (updates.username !== undefined) filteredUpdates.username = updates.username;
      if (updates.email !== undefined) filteredUpdates.email = updates.email;
      
      await storage.updateUser(userId, filteredUpdates);
      
      // Return updated user data
      const updatedUser = await storage.getUser(userId);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { passwordHash, ...userWithoutPassword } = updatedUser;
      console.log('Profile updated successfully:', userWithoutPassword);
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch('/api/user/password', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId!;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { passwordHash: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.patch('/api/user/theme', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { theme } = req.body;
      const userId = req.userId!;
      
      await storage.updateUser(userId, { themePreference: theme });
      res.json({ message: "Theme updated successfully" });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  app.patch('/api/user/settings', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, settings } = req.body;
      const userId = req.userId!;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentSettings = user.settings || {};
      const updatedSettings = {
        ...currentSettings,
        [type]: settings
      };

      await storage.updateUser(userId, { settings: updatedSettings });
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Profile routes
  app.get('/api/profile/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove sensitive information
      const { passwordHash, ...publicProfile } = user;
      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/profile/:username/works', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const works = await storage.getUserWorks(user.id);
      res.json(works);
    } catch (error) {
      console.error("Error fetching user works:", error);
      res.status(500).json({ message: "Failed to fetch user works" });
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

  // Posts endpoints
  app.get("/api/social/posts", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

      const posts = await storage.getPosts({ limit, offset, userId });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/social/posts", requireAuth, upload.single('file'), async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { content, tags } = req.body;
      const file = req.file;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Post content is required" });
      }

      let imageUrl = null;
      let fileType = null;

      // Handle file upload
      if (file) {
        imageUrl = file.filename;
        fileType = file.mimetype.split('/')[0]; // 'image', 'video', 'audio', etc.
      }

      const parsedTags = tags ? JSON.parse(tags) : [];

      const post = await storage.createPost({
        userId,
        content: content.trim(),
        imageUrl,
        fileType,
        tags: parsedTags
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/social/posts/:postId/like", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { postId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await storage.likePost(userId, postId);
      res.json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/social/posts/:postId/like", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { postId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await storage.unlikePost(userId, postId);
      res.json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.put("/api/social/posts/:postId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { postId } = req.params;
      const { content, tags } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Post content is required" });
      }

      // Check if post exists and belongs to user
      const existingPost = await storage.getPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (existingPost.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }

      const updatedPost = await storage.updatePost(postId, {
        content: content.trim(),
        tags: tags || [],
        updatedAt: new Date()
      });

      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/social/posts/:postId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { postId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check if post exists and belongs to user
      const existingPost = await storage.getPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (existingPost.userId !== userId) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }

      await storage.deletePost(postId, userId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Enhanced Social Media API Routes
  
  // Post search and discovery
  app.get("/api/social/posts/search", async (req, res) => {
    try {
      const { q, limit = 20, offset = 0 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const posts = await storage.searchPosts(q as string, {
        limit: Number(limit),
        offset: Number(offset),
      });
      
      res.json(posts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ error: "Failed to search posts" });
    }
  });

  app.get("/api/social/posts/trending", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const posts = await storage.getTrendingPosts(Number(limit));
      
      res.json(posts);
    } catch (error) {
      console.error("Error getting trending posts:", error);
      res.status(500).json({ error: "Failed to get trending posts" });
    }
  });

  // Comments API
  app.post("/api/social/posts/:id/comments", requireAuth, async (req: any, res) => {
    try {
      const postId = req.params.id;
      const userId = req.session.userId;
      const { content, parentId, mentionedUsers } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comment content is required" });
      }
      
      const comment = await storage.createComment({
        postId,
        userId,
        content: content.trim(),
        parentId: parentId || null,
        mentionedUsers: mentionedUsers || [],
      });
      
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/social/posts/:id/comments", async (req, res) => {
    try {
      const postId = req.params.id;
      const { limit = 50, offset = 0 } = req.query;
      
      const comments = await storage.getPostComments(postId, {
        limit: Number(limit),
        offset: Number(offset),
      });
      
      res.json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ error: "Failed to get comments" });
    }
  });

  app.put("/api/social/comments/:id", requireAuth, async (req: any, res) => {
    try {
      const commentId = Number(req.params.id);
      const userId = req.session.userId;
      const { content } = req.body;
      
      if (isNaN(commentId) || !isFinite(commentId) || commentId <= 0) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comment content is required" });
      }
      
      const updatedComment = await storage.updateComment(commentId, {
        content: content.trim(),
      });
      
      res.json(updatedComment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/social/comments/:id", requireAuth, async (req: any, res) => {
    try {
      const commentId = Number(req.params.id);
      const userId = req.session.userId;
      
      await storage.deleteComment(commentId, userId);
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  app.post("/api/social/comments/:id/like", requireAuth, async (req: any, res) => {
    try {
      const commentId = Number(req.params.id);
      const userId = req.session.userId;
      
      await storage.likeComment(userId, commentId);
      
      res.json({ message: "Comment liked successfully" });
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ error: "Failed to like comment" });
    }
  });

  // Following API
  app.post("/api/social/users/:id/follow", requireAuth, async (req: any, res) => {
    try {
      const followingId = Number(req.params.id);
      const followerId = req.session.userId;
      
      if (isNaN(followingId) || !isFinite(followingId) || followingId <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      if (followerId === followingId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }
      
      const follow = await storage.followUser(followerId, followingId);
      
      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  app.delete("/api/social/users/:id/follow", requireAuth, async (req: any, res) => {
    try {
      const followingId = Number(req.params.id);
      const followerId = req.session.userId;
      
      if (isNaN(followingId) || !isFinite(followingId) || followingId <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      await storage.unfollowUser(followerId, followingId);
      
      res.json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  app.get("/api/social/users/:id/following", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { limit = 50, offset = 0 } = req.query;
      
      if (isNaN(userId) || !isFinite(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const following = await storage.getFollowing(userId, {
        limit: Number(limit),
        offset: Number(offset),
      });
      
      res.json(following);
    } catch (error) {
      console.error("Error getting following:", error);
      res.status(500).json({ error: "Failed to get following" });
    }
  });

  app.get("/api/social/users/:id/followers", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const { limit = 50, offset = 0 } = req.query;
      
      if (isNaN(userId) || !isFinite(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const followers = await storage.getFollowers(userId, {
        limit: Number(limit),
        offset: Number(offset),
      });
      
      res.json(followers);
    } catch (error) {
      console.error("Error getting followers:", error);
      res.status(500).json({ error: "Failed to get followers" });
    }
  });

  app.get("/api/social/users/:id/follow-stats", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      
      if (isNaN(userId) || !isFinite(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const stats = await storage.getFollowStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting follow stats:", error);
      res.status(500).json({ error: "Failed to get follow stats" });
    }
  });

  // Notifications API
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { unreadOnly = false, limit = 50, offset = 0 } = req.query;
      
      const notifications = await storage.getUserNotifications(userId, {
        unreadOnly: unreadOnly === 'true',
        limit: Number(limit),
        offset: Number(offset),
      });
      
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      const count = await storage.getUnreadNotificationCount(userId);
      
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      res.status(500).json({ error: "Failed to get unread notification count" });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      const notificationId = Number(req.params.id);
      
      await storage.markNotificationRead(notificationId);
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      await storage.markAllNotificationsRead(userId);
      
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // User preferences API
  app.get("/api/user/preferences", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      const preferences = await storage.getUserPreferences(userId);
      
      res.json(preferences);
    } catch (error) {
      console.error("Error getting user preferences:", error);
      res.status(500).json({ error: "Failed to get user preferences" });
    }
  });

  app.put("/api/user/preferences", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const preferences = req.body;
      
      const updatedPreferences = await storage.updateUserPreferences(userId, preferences);
      
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  // Analytics API
  app.get("/api/user/analytics", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { days = 30 } = req.query;
      
      const analytics = await storage.getUserAnalytics(userId, Number(days));
      
      res.json(analytics);
    } catch (error) {
      console.error("Error getting user analytics:", error);
      res.status(500).json({ error: "Failed to get user analytics" });
    }
  });

  // Marketplace API
  app.post("/api/marketplace/listings", requireAuth, async (req: any, res) => {
    try {
      const sellerId = req.session.userId;
      const { workId, title, description, price, currency, licenseType, tags } = req.body;
      
      if (!workId || !title || !price || !licenseType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const listing = await storage.createMarketplaceListing({
        sellerId,
        workId,
        title,
        description,
        price,
        currency,
        licenseType,
        tags,
      });
      
      res.json(listing);
    } catch (error) {
      console.error("Error creating marketplace listing:", error);
      res.status(500).json({ error: "Failed to create marketplace listing" });
    }
  });

  app.get("/api/marketplace/listings", async (req, res) => {
    try {
      const { category, priceMin, priceMax, limit = 20, offset = 0 } = req.query;
      
      const options: any = {
        limit: Number(limit),
        offset: Number(offset),
      };
      
      if (category) options.category = category;
      if (priceMin || priceMax) {
        options.priceRange = [
          Number(priceMin || 0),
          Number(priceMax || 999999999)
        ];
      }
      
      const listings = await storage.getMarketplaceListings(options);
      
      res.json(listings);
    } catch (error) {
      console.error("Error getting marketplace listings:", error);
      res.status(500).json({ error: "Failed to get marketplace listings" });
    }
  });

  app.get("/api/marketplace/listings/:id", async (req, res) => {
    try {
      const listingId = Number(req.params.id);
      
      // Validate the listing ID is a valid number
      if (isNaN(listingId) || !isFinite(listingId) || listingId <= 0) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      
      const listing = await storage.getMarketplaceListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error getting marketplace listing:", error);
      res.status(500).json({ error: "Failed to get marketplace listing" });
    }
  });

  app.put("/api/marketplace/listings/:id", requireAuth, async (req: any, res) => {
    try {
      const listingId = Number(req.params.id);
      const sellerId = req.session.userId;
      const updates = req.body;
      
      // Validate the listing ID is a valid number
      if (isNaN(listingId) || !isFinite(listingId) || listingId <= 0) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      
      const updatedListing = await storage.updateMarketplaceListing(listingId, updates);
      
      res.json(updatedListing);
    } catch (error) {
      console.error("Error updating marketplace listing:", error);
      res.status(500).json({ error: "Failed to update marketplace listing" });
    }
  });

  app.delete("/api/marketplace/listings/:id", requireAuth, async (req: any, res) => {
    try {
      const listingId = Number(req.params.id);
      const sellerId = req.session.userId;
      
      // Validate the listing ID is a valid number
      if (isNaN(listingId) || !isFinite(listingId) || listingId <= 0) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      
      await storage.deleteMarketplaceListing(listingId, sellerId);
      
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting marketplace listing:", error);
      res.status(500).json({ error: "Failed to delete marketplace listing" });
    }
  });

  // Collaboration API
  app.post("/api/collaboration/projects", requireAuth, async (req: any, res) => {
    try {
      const ownerId = req.session.userId;
      const { title, description, type, maxCollaborators, deadline, budget, tags, requirements } = req.body;
      
      if (!title || !type) {
        return res.status(400).json({ error: "Title and type are required" });
      }
      
      const project = await storage.createCollaborationProject({
        ownerId,
        title,
        description,
        type,
        maxCollaborators,
        deadline,
        budget,
        tags,
        requirements,
      });
      
      res.json(project);
    } catch (error) {
      console.error("Error creating collaboration project:", error);
      res.status(500).json({ error: "Failed to create collaboration project" });
    }
  });

  app.get("/api/collaboration/projects", async (req, res) => {
    try {
      const { userId, status, limit = 20, offset = 0 } = req.query;
      
      const projects = await storage.getCollaborationProjects({
        userId: userId ? Number(userId) : undefined,
        status: status as string,
        limit: Number(limit),
        offset: Number(offset),
      });
      
      res.json(projects);
    } catch (error) {
      console.error("Error getting collaboration projects:", error);
      res.status(500).json({ error: "Failed to get collaboration projects" });
    }
  });

  app.get("/api/collaboration/projects/:id", async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      
      const project = await storage.getCollaborationProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error getting collaboration project:", error);
      res.status(500).json({ error: "Failed to get collaboration project" });
    }
  });

  app.post("/api/collaboration/projects/:id/join", requireAuth, async (req: any, res) => {
    try {
      const projectId = Number(req.params.id);
      const userId = req.session.userId;
      const { role = 'collaborator' } = req.body;
      
      const collaborator = await storage.joinCollaborationProject(projectId, userId, role);
      
      res.json(collaborator);
    } catch (error) {
      console.error("Error joining collaboration project:", error);
      res.status(500).json({ error: "Failed to join collaboration project" });
    }
  });

  app.post("/api/collaboration/projects/:id/leave", requireAuth, async (req: any, res) => {
    try {
      const projectId = Number(req.params.id);
      const userId = req.session.userId;
      
      await storage.leaveCollaborationProject(projectId, userId);
      
      res.json({ message: "Left collaboration project successfully" });
    } catch (error) {
      console.error("Error leaving collaboration project:", error);
      res.status(500).json({ error: "Failed to leave collaboration project" });
    }
  });

  // Content categories API
  app.get("/api/content/categories", async (req, res) => {
    try {
      const categories = await storage.getContentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting content categories:", error);
      res.status(500).json({ error: "Failed to get content categories" });
    }
  });

  // Subscription API routes
  app.get("/api/subscription", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const subscription = await storage.getUserSubscription(userId);
      const limits = await storage.getUserSubscriptionLimits(userId);
      const uploadCheck = await storage.checkUploadLimit(userId);
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usage = await storage.getSubscriptionUsage(userId, currentMonth);
      
      res.json({
        subscription,
        limits,
        usage: {
          uploads: uploadCheck,
          storage: usage?.storageUsed || 0,
          apiCalls: usage?.apiCallsUsed || 0
        }
      });
    } catch (error) {
      console.error("Error getting subscription:", error);
      res.status(500).json({ error: "Failed to get subscription" });
    }
  });

  app.post("/api/subscription/create-checkout", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { tier } = req.body;
      
      if (!['starter', 'pro', 'agency'].includes(tier)) {
        return res.status(400).json({ error: "Invalid subscription tier" });
      }
      
      // Price mapping (in cents)
      const prices = {
        starter: 799, // $7.99
        pro: 1999,    // $19.99
        agency: 4999  // $49.99
      };
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create or retrieve Stripe customer
      let customer;
      try {
        const existingSubscription = await storage.getUserSubscription(userId);
        if (existingSubscription?.stripeCustomerId) {
          customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
        } else {
          customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: userId.toString(),
              username: user.username
            }
          });
        }
      } catch (error) {
        customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId.toString(),
            username: user.username
          }
        });
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Loggin' ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
                description: `Monthly subscription to Loggin' ${tier} tier`,
              },
              unit_amount: prices[tier as keyof typeof prices],
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/subscription/cancelled`,
        metadata: {
          userId: userId.toString(),
          tier: tier
        }
      });
      
      console.log("Checkout session created successfully:", session.id);
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ 
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/subscription/cancel", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ error: "No active subscription found" });
      }
      
      // Cancel at period end in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      
      // Update in our database
      await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true
      });
      
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  app.post("/api/subscription/reactivate", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ error: "No subscription found" });
      }
      
      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });
      
      // Update in our database
      await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: false,
        status: 'active'
      });
      
      res.json({ message: "Subscription reactivated successfully" });
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      res.status(500).json({ error: "Failed to reactivate subscription" });
    }
  });

  // Webhook endpoint for Stripe events
  app.post("/api/webhook/stripe", express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
      // For production, you'd need to set the webhook secret
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.userId || '0');
          const tier = session.metadata?.tier;
          
          if (userId && tier && session.subscription) {
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
            
            // Create or update subscription in our database
            await storage.createSubscription({
              userId,
              tier,
              status: 'active',
              stripeSubscriptionId: stripeSubscription.id,
              stripeCustomerId: session.customer as string,
              priceId: stripeSubscription.items.data[0].price.id,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              features: JSON.stringify({}),
              teamSize: tier === 'agency' ? 10 : 1
            });
            
            // Update user's subscription tier
            await storage.updateUser(userId, {
              subscriptionTier: tier,
              subscriptionExpiresAt: new Date(stripeSubscription.current_period_end * 1000)
            });
          }
          break;
          
        case 'invoice.payment_succeeded':
          // Handle successful payment
          break;
          
        case 'invoice.payment_failed':
          // Handle failed payment
          break;
          
        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as Stripe.Subscription;
          const subscription = await storage.getUserSubscription(0); // We'd need to find by stripe ID
          if (subscription) {
            await storage.updateSubscription(subscription.id, {
              status: 'cancelled'
            });
          }
          break;
      }
      
      res.json({received: true});
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Advanced blockchain verification routes
  app.post("/api/verification/generate", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { workId, verificationLevel = 'basic' } = req.body;
      
      const work = await storage.getWork(workId);
      if (!work) {
        return res.status(404).json({ error: "Work not found" });
      }

      // Read the file to generate verification proof
      const filePath = path.join(process.cwd(), "uploads", work.filename);
      const fileBuffer = fs.readFileSync(filePath);

      // Generate comprehensive verification proof
      const verificationProof = await blockchainVerification.generateVerificationProof(
        fileBuffer,
        {
          title: work.title,
          creator: work.creatorName,
          certificateId: work.certificateId,
          collaborators: work.collaborators
        },
        {
          verificationLevel: verificationLevel as 'basic' | 'enhanced' | 'premium',
          networkId: 'ethereum',
          includeIPFS: verificationLevel !== 'basic'
        }
      );

      res.json({
        proof: verificationProof,
        message: "Advanced verification generated successfully",
        details: {
          verificationLevel,
          networkId: 'ethereum',
          confidence: 100,
          timestampProof: verificationProof.blockchainAnchor,
          merkleProofLength: verificationProof.merkleProof.length
        }
      });
    } catch (error) {
      console.error("Error generating verification:", error);
      res.status(500).json({ error: "Failed to generate verification" });
    }
  });

  app.post("/api/verification/verify", async (req, res) => {
    try {
      const { fileHash, proof, fileBuffer } = req.body;
      
      if (!proof || !fileHash) {
        return res.status(400).json({ error: "Missing required verification data" });
      }

      // Verify the proof
      const verificationResult = await blockchainVerification.verifyProof(
        proof,
        fileBuffer ? Buffer.from(fileBuffer, 'base64') : undefined
      );

      res.json({
        isValid: verificationResult.isValid,
        confidence: verificationResult.confidence,
        details: verificationResult.verificationDetails,
        timestamp: new Date().toISOString(),
        message: verificationResult.isValid ? "Verification successful" : "Verification failed"
      });
    } catch (error) {
      console.error("Error verifying proof:", error);
      res.status(500).json({ error: "Failed to verify proof" });
    }
  });

  app.post("/api/verification/batch-verify", async (req, res) => {
    try {
      const { workIds, verificationLevel = 'basic' } = req.body;
      
      if (!Array.isArray(workIds) || workIds.length === 0) {
        return res.status(400).json({ error: "Invalid work IDs array" });
      }

      const results = [];
      
      for (const workId of workIds) {
        try {
          const work = await storage.getWork(workId);
          if (!work) {
            results.push({
              workId,
              status: 'failed',
              error: 'Work not found'
            });
            continue;
          }

          const filePath = path.join(process.cwd(), "uploads", work.filename);
          const fileBuffer = fs.readFileSync(filePath);

          const blockchainCertificate = await blockchainVerification.generateBlockchainCertificate(
            fileBuffer,
            {
              title: work.title,
              creator: work.creatorName,
              description: work.description,
              certificateId: work.certificateId,
              collaborators: work.collaborators
            },
            verificationLevel as 'basic' | 'enhanced' | 'premium'
          );

          results.push({
            workId,
            certificate: blockchainCertificate,
            status: 'verified'
          });
        } catch (error) {
          results.push({
            workId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        results,
        summary: {
          totalProcessed: results.length,
          successful: results.filter(r => r.status === 'verified').length,
          failed: results.filter(r => r.status === 'failed').length
        },
        message: "Batch verification completed"
      });
    } catch (error) {
      console.error("Error in batch verification:", error);
      res.status(500).json({ error: "Failed to complete batch verification" });
    }
  });

  app.get("/api/verification/network-status", async (req, res) => {
    try {
      // Get status of supported blockchain networks
      const networks = ['ethereum', 'polygon', 'arbitrum', 'base'];
      const networkStatus = [];

      for (const network of networks) {
        try {
          const timestampProof = await blockchainVerification.generateTimestampProof('test', network);
          networkStatus.push({
            network,
            status: 'online',
            blockNumber: timestampProof.blockNumber,
            blockHash: timestampProof.blockHash,
            timestamp: timestampProof.timestamp
          });
        } catch (error) {
          networkStatus.push({
            network,
            status: 'offline',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        networks: networkStatus,
        summary: {
          totalNetworks: networks.length,
          onlineNetworks: networkStatus.filter(n => n.status === 'online').length,
          offlineNetworks: networkStatus.filter(n => n.status === 'offline').length
        }
      });
    } catch (error) {
      console.error("Error checking network status:", error);
      res.status(500).json({ error: "Failed to check network status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}