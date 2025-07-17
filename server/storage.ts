import { users, works, certificates, copyrightApplications, nftMints, type User, type InsertUser, type Work, type InsertWork, type Certificate, type InsertCertificate, type CopyrightApplication, type InsertCopyrightApplication, type NftMint, type InsertNftMint } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
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
  
  createCopyrightApplication(application: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication>;
  getCopyrightApplication(id: string, userId: number): Promise<CopyrightApplication | undefined>;
  getCopyrightApplications(userId: number): Promise<CopyrightApplication[]>;
  updateCopyrightApplication(id: string, updates: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication>;
  
  createNftMint(mint: Partial<InsertNftMint>): Promise<NftMint>;
  getNftMint(id: number): Promise<NftMint | undefined>;
  getNftMints(userId: number): Promise<NftMint[]>;
  updateNftMint(id: number, updates: Partial<InsertNftMint>): Promise<NftMint>;
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

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
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

  async createCopyrightApplication(application: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication> {
    const appData = {
      ...application,
      applicationData: typeof application.applicationData === 'string' 
        ? application.applicationData 
        : JSON.stringify(application.applicationData || {}),
      submissionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [copyrightApp] = await db
      .insert(copyrightApplications)
      .values(appData as any)
      .returning();
    return copyrightApp;
  }

  async getCopyrightApplication(id: string, userId: number): Promise<CopyrightApplication | undefined> {
    const [application] = await db
      .select()
      .from(copyrightApplications)
      .where(eq(copyrightApplications.id, parseInt(id)));
    
    if (application && application.userId === userId) {
      return application;
    }
    return undefined;
  }

  async getCopyrightApplications(userId: number): Promise<CopyrightApplication[]> {
    return await db
      .select()
      .from(copyrightApplications)
      .where(eq(copyrightApplications.userId, userId))
      .orderBy(desc(copyrightApplications.createdAt));
  }

  async updateCopyrightApplication(id: string, updates: Partial<InsertCopyrightApplication>): Promise<CopyrightApplication> {
    const updateData = {
      ...updates,
      applicationData: typeof updates.applicationData === 'string' 
        ? updates.applicationData 
        : JSON.stringify(updates.applicationData || {}),
      updatedAt: new Date()
    };

    const [application] = await db
      .update(copyrightApplications)
      .set(updateData as any)
      .where(eq(copyrightApplications.id, parseInt(id)))
      .returning();
    return application;
  }

  async createNftMint(mint: Partial<InsertNftMint>): Promise<NftMint> {
    const mintData = {
      ...mint,
      status: mint.status || 'pending',
      royaltyPercentage: mint.royaltyPercentage || 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [nftMint] = await db
      .insert(nftMints)
      .values(mintData as any)
      .returning();
    return nftMint;
  }

  async getNftMint(id: number): Promise<NftMint | undefined> {
    const [mint] = await db.select().from(nftMints).where(eq(nftMints.id, id));
    return mint || undefined;
  }

  async getNftMints(userId: number): Promise<NftMint[]> {
    return await db
      .select()
      .from(nftMints)
      .where(eq(nftMints.userId, userId))
      .orderBy(desc(nftMints.createdAt));
  }

  async updateNftMint(id: number, updates: Partial<InsertNftMint>): Promise<NftMint> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const [mint] = await db
      .update(nftMints)
      .set(updateData as any)
      .where(eq(nftMints.id, id))
      .returning();
    return mint;
  }
}

export const storage = new DatabaseStorage();
