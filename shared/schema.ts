import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileHash: text("file_hash").notNull(),
  certificateId: text("certificate_id").notNull().unique(),
  blockchainHash: text("blockchain_hash"),
  creatorName: text("creator_name").notNull(),
  collaborators: text("collaborators").array().default([]), // Array of collaborator names/emails
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  workId: integer("work_id").references(() => works.id).notNull(),
  certificateId: text("certificate_id").notNull().unique(),
  pdfPath: text("pdf_path"),
  qrCode: text("qr_code"),
  shareableLink: text("shareable_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  passwordHash: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertWorkSchema = createInsertSchema(works).pick({
  title: true,
  description: true,
  filename: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  fileHash: true,
  certificateId: true,
  blockchainHash: true,
  creatorName: true,
  collaborators: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  workId: true,
  certificateId: true,
  pdfPath: true,
  qrCode: true,
  shareableLink: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWork = z.infer<typeof insertWorkSchema>;
export type Work = typeof works.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
