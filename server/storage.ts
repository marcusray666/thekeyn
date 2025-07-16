import { users, works, certificates, type User, type InsertUser, type Work, type InsertWork, type Certificate, type InsertCertificate } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createWork(work: InsertWork): Promise<Work>;
  getWork(id: number): Promise<Work | undefined>;
  getWorkByCertificateId(certificateId: string): Promise<Work | undefined>;
  getAllWorks(): Promise<Work[]>;
  getRecentWorks(limit?: number): Promise<Work[]>;
  updateWork(id: number, updates: Partial<InsertWork>): Promise<Work>;
  deleteWork(id: number): Promise<void>;
  
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByWorkId(workId: number): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  deleteCertificate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Database storage - no constructor needed

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createWork(insertWork: InsertWork): Promise<Work> {
    const [work] = await db
      .insert(works)
      .values(insertWork)
      .returning();
    return work;
  }

  async getWork(id: number): Promise<Work | undefined> {
    const [work] = await db.select().from(works).where(eq(works.id, id));
    return work || undefined;
  }

  async getWorkByCertificateId(certificateId: string): Promise<Work | undefined> {
    const [work] = await db.select().from(works).where(eq(works.certificateId, certificateId));
    return work || undefined;
  }

  async getAllWorks(): Promise<Work[]> {
    return await db
      .select()
      .from(works)
      .orderBy(desc(works.createdAt));
  }

  async getRecentWorks(limit: number = 10): Promise<Work[]> {
    return await db
      .select()
      .from(works)
      .orderBy(desc(works.createdAt))
      .limit(limit);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(insertCertificate)
      .returning();
    return certificate;
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate || undefined;
  }

  async getCertificateByWorkId(workId: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.workId, workId));
    return certificate || undefined;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .orderBy(desc(certificates.createdAt));
  }

  async updateWork(id: number, updates: Partial<InsertWork>): Promise<Work> {
    const [work] = await db
      .update(works)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(works.id, id))
      .returning();
    return work;
  }

  async deleteWork(id: number): Promise<void> {
    await db.delete(works).where(eq(works.id, id));
  }

  async deleteCertificate(id: number): Promise<void> {
    await db.delete(certificates).where(eq(certificates.id, id));
  }
}

export const storage = new DatabaseStorage();
