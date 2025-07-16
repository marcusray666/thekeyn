import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { insertWorkSchema, insertCertificateSchema, loginSchema, registerSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow most common creative file types
    const allowedExtensions = /\.(jpeg|jpg|png|gif|svg|pdf|doc|docx|txt|rtf|mp3|wav|ogg|m4a|mp4|mov|avi|webm|mkv|flv)$/i;
    const extname = allowedExtensions.test(file.originalname);
    
    // More permissive MIME type check
    const allowedMimes = /^(image|audio|video|text|application)\//;
    const mimetype = allowedMimes.test(file.mimetype);
    
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only creative content files are allowed."));
    }
  },
});

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `PRF-${new Date().getFullYear()}-${timestamp}-${random}`;
}

function generateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function generateBlockchainHash(): string {
  // Simulate blockchain hash generation
  return "0x" + crypto.randomBytes(32).toString("hex");
}

// Session store with corrected configuration
const pgStore = connectPg(session);

// Session middleware
const sessionMiddleware = session({
  store: new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'development-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid', // Use standard connect.sid name
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: 'lax', // Allow cookies in same-site context
  },
});

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; email: string };
}

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
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

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add session middleware
  app.use(sessionMiddleware);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        passwordHash,
      });

      // Set session and save it explicitly  
      req.session.userId = user.id;
      
      req.session.save((err) => {
        if (err) {
          console.error("Registration session save error:", err);
          return res.status(500).json({ error: "Session creation failed" });
        }
        
        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
      });
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

      // Set session and save it explicitly
      req.session.userId = user.id;
      
      req.session.save((err) => {
        if (err) {
          console.error("Login session save error:", err);
          return res.status(500).json({ error: "Session creation failed" });
        }
        
        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
      });
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

  // Get all certificates for authenticated user
  app.get("/api/certificates", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ error: "Failed to fetch certificates" });
    }
  });

  // Get specific certificate by ID (public endpoint)
  app.get("/api/certificate/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const work = await storage.getWorkByCertificateId(id);
      
      if (!work) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      
      const certificate = await storage.getCertificateByWorkId(work.id);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      
      res.json({ ...certificate, work });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ error: "Failed to fetch certificate" });
    }
  });

  // Report theft endpoint
  app.post("/api/report-theft", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { certificateId, platform, infringingUrl, description, contactEmail } = req.body;
      
      const work = await storage.getWorkByCertificateId(certificateId);
      if (!work) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      
      // Generate DMCA takedown email template
      const emailTemplate = `Subject: DMCA Takedown Notice - Copyright Infringement

Dear ${platform} Copyright Team,

I am writing to report copyright infringement of my original work hosted on your platform.

ORIGINAL WORK INFORMATION:
- Title: ${work.title}
- Creator: ${work.creatorName}
- Certificate ID: ${certificateId}
- Registration Date: ${new Date(work.createdAt).toLocaleDateString()}
- Blockchain Hash: ${work.blockchainHash}

INFRINGING CONTENT:
- Platform: ${platform}
- Infringing URL: ${infringingUrl}
- Description: ${description}

GOOD FAITH STATEMENT:
I have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

CONTACT INFORMATION:
Email: ${req.user?.email}
Date: ${new Date().toLocaleDateString()}

I request that you remove or disable access to the infringing material immediately.

Thank you for your prompt attention to this matter.

Sincerely,
${work.creatorName}`;

      res.json({ emailTemplate });
    } catch (error) {
      console.error("Error generating theft report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Upload and register creative work (now requires authentication)
  app.post("/api/works", requireAuth, upload.single("file"), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title, description, creatorName } = req.body;
      
      if (!title || !creatorName) {
        return res.status(400).json({ message: "Title and creator name are required" });
      }

      const fileHash = generateFileHash(req.file.path);
      const certificateId = generateCertificateId();
      const blockchainHash = generateBlockchainHash();

      const workData = {
        title,
        description: description || "",
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileHash,
        certificateId,
        blockchainHash,
        creatorName,
      };

      const validatedData = insertWorkSchema.parse(workData);
      const work = await storage.createWork(validatedData);

      // Create certificate
      const certificateData = {
        workId: work.id,
        certificateId,
        shareableLink: `${req.protocol}://${req.get("host")}/certificate/${certificateId}`,
        qrCode: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">${certificateId}</text></svg>`).toString("base64")}`,
      };

      const validatedCertificateData = insertCertificateSchema.parse(certificateData);
      const certificate = await storage.createCertificate(validatedCertificateData);

      res.json({ work, certificate });
    } catch (error) {
      console.error("Error uploading work:", error);
      res.status(500).json({ message: "Failed to upload and register work" });
    }
  });

  // Get all works
  app.get("/api/works", async (req, res) => {
    try {
      const works = await storage.getAllWorks();
      res.json(works);
    } catch (error) {
      console.error("Error fetching works:", error);
      res.status(500).json({ message: "Failed to fetch works" });
    }
  });

  // Get recent works
  app.get("/api/works/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const works = await storage.getRecentWorks(limit);
      res.json(works);
    } catch (error) {
      console.error("Error fetching recent works:", error);
      res.status(500).json({ message: "Failed to fetch recent works" });
    }
  });

  // Get work by ID
  app.get("/api/works/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const work = await storage.getWork(id);
      
      if (!work) {
        return res.status(404).json({ message: "Work not found" });
      }

      res.json(work);
    } catch (error) {
      console.error("Error fetching work:", error);
      res.status(500).json({ message: "Failed to fetch work" });
    }
  });

  // Get all certificates
  app.get("/api/certificates", async (req, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Get certificate by work ID
  app.get("/api/certificates/work/:workId", async (req, res) => {
    try {
      const workId = parseInt(req.params.workId);
      const certificate = await storage.getCertificateByWorkId(workId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.json(certificate);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Get stats for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const works = await storage.getAllWorks();
      const certificates = await storage.getAllCertificates();
      
      const stats = {
        protected: works.length,
        certificates: certificates.length,
        reports: 0, // Placeholder for future reporting feature
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get public certificate by certificate ID
  app.get("/api/certificate/:certificateId", async (req, res) => {
    try {
      const certificateId = req.params.certificateId;
      const work = await storage.getWorkByCertificateId(certificateId);
      
      if (!work) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      const certificate = await storage.getCertificateByWorkId(work.id);
      
      res.json({ work, certificate });
    } catch (error) {
      console.error("Error fetching public certificate:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const works = await storage.getAllWorks();
      const certificates = await storage.getAllCertificates();
      
      const stats = {
        protected: works.length,
        certificates: certificates.length,
        reports: 0, // Placeholder for reports functionality
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
