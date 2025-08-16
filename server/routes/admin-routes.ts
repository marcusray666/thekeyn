import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Admin middleware to check if user is admin
async function requireAdmin(req: Request, res: Response, next: Function) {
  interface SessionData {
    userId?: number;
  }
  
  const session = req.session as SessionData;
  if (!session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await storage.getUser(session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

export default function setupAdminRoutes(app: Express) {
  // Debug endpoint to check admin status
  app.get("/api/admin/status", async (req: Request, res: Response) => {
    try {
      interface SessionData {
        userId?: number;
      }
      
      const session = req.session as SessionData;
      const isAuthenticated = !!session?.userId;
      let user = null;
      let isAdmin = false;
      
      if (isAuthenticated && session.userId) {
        user = await storage.getUser(session.userId);
        isAdmin = user?.role === 'admin';
      }
      
      res.json({
        isAuthenticated,
        userId: session?.userId || null,
        username: user?.username || null,
        role: user?.role || null,
        isAdmin,
        sessionId: req.sessionID
      });
    } catch (error) {
      console.error("Failed to get admin status:", error);
      res.status(500).json({ error: "Failed to get admin status" });
    }
  });

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

  // Get all users with filters - ADMIN PRIVACY OVERRIDE
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { filter, search } = req.query as { filter?: string; search?: string };
      const users = await storage.getAllUsersWithPrivateInfo(filter, search);
      res.json(users);
    } catch (error) {
      console.error("Failed to get users:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Get detailed user information - ADMIN PRIVACY OVERRIDE
  app.get("/api/admin/users/:userId", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await storage.getUserWithAllPrivateInfo(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Failed to get user details:", error);
      res.status(500).json({ error: "Failed to get user details" });
    }
  });

  // Get user's complete activity log
  app.get("/api/admin/users/:userId/activity", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const activity = await storage.getUserActivityLog(userId);
      res.json(activity);
    } catch (error) {
      console.error("Failed to get user activity:", error);
      res.status(500).json({ error: "Failed to get user activity" });
    }
  });

  // Get user's all content (posts, works, etc.) - PRIVACY OVERRIDE
  app.get("/api/admin/users/:userId/content", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const content = await storage.getUserAllContent(userId);
      res.json(content);
    } catch (error) {
      console.error("Failed to get user content:", error);
      res.status(500).json({ error: "Failed to get user content" });
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

  // Delete user (permanent)
  app.delete("/api/admin/users/:userId", requireAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "Deletion reason is required" });
      }

      // Prevent admin from deleting themselves
      if (userId === req.session!.userId!) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      // Get user info before deletion for logging
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete the user and all associated data
      await storage.deleteUser(userId);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'user_deleted',
        targetType: 'user',
        targetId: userId.toString(),
        details: JSON.stringify({ 
          reason, 
          deletedUsername: userToDelete.username,
          deletedEmail: userToDelete.email 
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
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

  // System management endpoints
  app.post("/api/admin/system/database-maintenance", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Log the maintenance action
      await storage.createAdminAuditLog({
        adminId: (req as any).user.id,
        action: "DATABASE_MAINTENANCE",
        targetType: "system",
        targetId: "database",
        details: JSON.stringify({ timestamp: new Date().toISOString() })
      });

      // Simulate database maintenance (placeholder)
      console.log("Database maintenance initiated by admin:", (req as any).user.username);
      
      res.json({ 
        success: true, 
        message: "Database maintenance initiated successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to run database maintenance:", error);
      res.status(500).json({ error: "Failed to run database maintenance" });
    }
  });

  app.post("/api/admin/system/export", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Log the export action
      await storage.createAdminAuditLog({
        adminId: (req as any).user.id,
        action: "SYSTEM_EXPORT",
        targetType: "system",
        targetId: "data",
        details: JSON.stringify({ timestamp: new Date().toISOString() })
      });

      // Generate system export data
      const exportData = {
        timestamp: new Date().toISOString(),
        systemMetrics: await storage.getSystemMetrics(),
        userCount: (await storage.getAllUsers()).length,
        exportedBy: (req as any).user.username,
        version: "1.0.0"
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="system-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Failed to export system data:", error);
      res.status(500).json({ error: "Failed to export system data" });
    }
  });

  // Get all content/works
  app.get("/api/admin/content", requireAdmin, async (req: Request, res: Response) => {
    try {
      const works = await storage.getAllWorks();
      res.json(works);
    } catch (error) {
      console.error("Failed to get content:", error);
      res.status(500).json({ error: "Failed to get content" });
    }
  });

  // Delete content
  app.delete("/api/admin/content/:workId/delete", requireAdmin, async (req: Request, res: Response) => {
    try {
      const workId = parseInt(req.params.workId);
      
      await storage.deleteWork(workId);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'content_deleted',
        targetType: 'work',
        targetId: workId.toString(),
        details: JSON.stringify({ reason: 'Admin deletion' }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
      console.error("Failed to delete content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Get pending moderation works
  app.get("/api/admin/moderation/pending", requireAdmin, async (req: Request, res: Response) => {
    try {
      const pendingWorks = await storage.getPendingModerationWorks();
      res.json(pendingWorks);
    } catch (error) {
      console.error("Failed to get pending moderation works:", error);
      res.status(500).json({ error: "Failed to get pending moderation works" });
    }
  });

  // Approve work
  app.post("/api/admin/moderation/:workId/approve", requireAdmin, async (req: Request, res: Response) => {
    try {
      const workId = parseInt(req.params.workId);
      const { resolution } = req.body;

      const work = await storage.updateWorkModerationStatus(workId, 'approved', req.session!.userId!, resolution);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'work_approved',
        targetType: 'work',
        targetId: workId.toString(),
        details: JSON.stringify({ resolution }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(work);
    } catch (error) {
      console.error("Failed to approve work:", error);
      res.status(500).json({ error: "Failed to approve work" });
    }
  });

  // Reject work
  app.post("/api/admin/moderation/:workId/reject", requireAdmin, async (req: Request, res: Response) => {
    try {
      const workId = parseInt(req.params.workId);
      const { resolution } = req.body;

      const work = await storage.updateWorkModerationStatus(workId, 'rejected', req.session!.userId!, resolution);
      
      // Log admin action
      await storage.createAdminAuditLog({
        adminId: req.session!.userId!,
        action: 'work_rejected',
        targetType: 'work',
        targetId: workId.toString(),
        details: JSON.stringify({ resolution }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(work);
    } catch (error) {
      console.error("Failed to reject work:", error);
      res.status(500).json({ error: "Failed to reject work" });
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