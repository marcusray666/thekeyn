import { users, works, certificates, type User, type InsertUser, type Work, type InsertWork, type Certificate, type InsertCertificate } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createWork(work: InsertWork): Promise<Work>;
  getWork(id: number): Promise<Work | undefined>;
  getWorkByCertificateId(certificateId: string): Promise<Work | undefined>;
  getAllWorks(): Promise<Work[]>;
  getRecentWorks(limit?: number): Promise<Work[]>;
  
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getCertificateByWorkId(workId: number): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private works: Map<number, Work>;
  private certificates: Map<number, Certificate>;
  private userIdCounter: number;
  private workIdCounter: number;
  private certificateIdCounter: number;

  constructor() {
    this.users = new Map();
    this.works = new Map();
    this.certificates = new Map();
    this.userIdCounter = 1;
    this.workIdCounter = 1;
    this.certificateIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createWork(insertWork: InsertWork): Promise<Work> {
    const id = this.workIdCounter++;
    const work: Work = { 
      ...insertWork, 
      id,
      description: insertWork.description || null,
      blockchainHash: insertWork.blockchainHash || null,
      createdAt: new Date()
    };
    this.works.set(id, work);
    return work;
  }

  async getWork(id: number): Promise<Work | undefined> {
    return this.works.get(id);
  }

  async getWorkByCertificateId(certificateId: string): Promise<Work | undefined> {
    return Array.from(this.works.values()).find(
      (work) => work.certificateId === certificateId,
    );
  }

  async getAllWorks(): Promise<Work[]> {
    return Array.from(this.works.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentWorks(limit: number = 10): Promise<Work[]> {
    const allWorks = await this.getAllWorks();
    return allWorks.slice(0, limit);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.certificateIdCounter++;
    const certificate: Certificate = { 
      ...insertCertificate, 
      id,
      pdfPath: insertCertificate.pdfPath || null,
      qrCode: insertCertificate.qrCode || null,
      shareableLink: insertCertificate.shareableLink || null,
      createdAt: new Date()
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByWorkId(workId: number): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(
      (certificate) => certificate.workId === workId,
    );
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const storage = new MemStorage();
