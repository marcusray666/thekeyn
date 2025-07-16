import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { insertWorkSchema, insertCertificateSchema, loginSchema, registerSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and audio files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images, documents, and audio files are allowed."));
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

// Session store
const sessionStore = MemoryStore(session);

// Session middleware
const sessionMiddleware = session({
  store: new sessionStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

      // Set session
      req.session.userId = user.id;

      // Return user without password
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

      // Return user without password
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
