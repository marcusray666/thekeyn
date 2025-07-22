import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Admin middleware to check if user is admin
async function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

export default function setupAdminRoutes(app: Express) {
  // Get system metrics
  app.get("/api/admin/metrics", requireAdmin, async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Failed to get system metrics:", error);
      res.status(500).json({ error: "Failed to get system metrics" });
    }
  });

  // Get all users with filters
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { filter, search } = req.query as { filter?: string; search?: string };
      const users = await storage.getAllUsers(filter, search);
      res.json(users);
    } catch (error) {
      console.error("Failed to get users:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Ban user
  app.post("/api/admin/users/:userId/ban", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "Ban reason is required" });
      }

      const user = await storage.banUser(userId, reason);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'user_banned',
        targetType: 'user',
        targetId: userId.toString(),
        details: JSON.stringify({ reason }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(user);
    } catch (error) {
      console.error("Failed to ban user:", error);
      res.status(500).json({ error: "Failed to ban user" });
    }
  });

  // Unban user
  app.post("/api/admin/users/:userId/unban", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.unbanUser(userId);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'user_unbanned',
        targetType: 'user',
        targetId: userId.toString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(user);
    } catch (error) {
      console.error("Failed to unban user:", error);
      res.status(500).json({ error: "Failed to unban user" });
    }
  });

  // Verify user
  app.post("/api/admin/users/:userId/verify", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.verifyUser(userId);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'user_verified',
        targetType: 'user',
        targetId: userId.toString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(user);
    } catch (error) {
      console.error("Failed to verify user:", error);
      res.status(500).json({ error: "Failed to verify user" });
    }
  });

  // Get content reports
  app.get("/api/admin/reports", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.query as { status?: string };
      const reports = await storage.getContentReports(status);
      res.json(reports);
    } catch (error) {
      console.error("Failed to get content reports:", error);
      res.status(500).json({ error: "Failed to get content reports" });
    }
  });

  // Resolve content report
  app.post("/api/admin/reports/:reportId/resolve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.reportId);
      const { resolution } = req.body;

      const report = await storage.updateContentReport(reportId, {
        status: 'resolved',
        reviewedBy: req.session!.userId!,
        reviewedAt: new Date(),
        resolution,
      });
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'content_report_resolved',
        targetType: 'report',
        targetId: reportId.toString(),
        details: JSON.stringify({ resolution }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(report);
    } catch (error) {
      console.error("Failed to resolve report:", error);
      res.status(500).json({ error: "Failed to resolve report" });
    }
  });

  // Dismiss content report
  app.post("/api/admin/reports/:reportId/dismiss", requireAdmin, async (req: Request, res: Response) => {
    try {
      const reportId = parseInt(req.params.reportId);
      const { resolution } = req.body;

      const report = await storage.updateContentReport(reportId, {
        status: 'dismissed',
        reviewedBy: req.session!.userId!,
        reviewedAt: new Date(),
        resolution,
      });
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'content_report_dismissed',
        targetType: 'report',
        targetId: reportId.toString(),
        details: JSON.stringify({ resolution }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(report);
    } catch (error) {
      console.error("Failed to dismiss report:", error);
      res.status(500).json({ error: "Failed to dismiss report" });
    }
  });

  // Get audit logs
  app.get("/api/admin/audit-logs", requireAdmin, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getAdminAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Failed to get audit logs:", error);
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  });

  // Create content report (for users to report content)
  app.post("/api/content/report", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const reportSchema = z.object({
        contentType: z.string(),
        contentId: z.string(),
        reason: z.string(),
        description: z.string().optional(),
        reportedUserId: z.number().optional(),
      });

      const data = reportSchema.parse(req.body);

      const report = await storage.createContentReport({
        ...data,
        reporterId: req.session.userId,
      });

      res.json(report);
    } catch (error) {
      console.error("Failed to create content report:", error);
      res.status(500).json({ error: "Failed to create content report" });
    }
  });
}