import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { db } from "../server/db";
import { users, works, posts, userFollows } from "@shared/schema";
import { eq } from "drizzle-orm";
import { registerRoutes } from "../server/routes";
import express from "express";
import session from "express-session";
import cors from "cors";

// Test database setup
let app: Express;
let testUserId: number;
let testWorkId: number;
let testPostId: string;

beforeAll(async () => {
  // Setup test Express app
  app = express();
  app.use(cors({ credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Session configuration for testing
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  await registerRoutes(app);

  // Cleanup any existing test data
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

beforeEach(async () => {
  await cleanupTestData();
});

async function cleanupTestData() {
  try {
    // Delete test data in correct order to avoid foreign key constraints
    await db.delete(userFollows).where(eq(userFollows.followerId, testUserId));
    await db.delete(posts).where(eq(posts.userId, testUserId));
    await db.delete(works).where(eq(works.userId, testUserId));
    await db.delete(users).where(eq(users.email, 'test@example.com'));
    await db.delete(users).where(eq(users.email, 'test2@example.com'));
  } catch (error) {
    // Ignore cleanup errors
  }
}

describe("Critical User Paths Integration Tests", () => {
  
  describe("User Authentication Flow", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/register")
        .send({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          displayName: "Test User"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Registration successful");
      
      // Verify user was created in database
      const user = await db.select().from(users).where(eq(users.email, "test@example.com")).limit(1);
      expect(user).toHaveLength(1);
      expect(user[0].username).toBe("testuser");
      testUserId = user[0].id;
    });

    it("should login with valid credentials", async () => {
      // First register a user
      await request(app)
        .post("/api/register")
        .send({
          username: "testuser",
          email: "test@example.com", 
          password: "password123",
          displayName: "Test User"
        });

      // Then login
      const response = await request(app)
        .post("/api/login")
        .send({
          email: "test@example.com",
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should reject invalid login credentials", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Work Upload and Protection Flow", () => {
    beforeEach(async () => {
      // Create test user for work tests
      const registerResponse = await request(app)
        .post("/api/register")
        .send({
          username: "creator",
          email: "test@example.com",
          password: "password123",
          displayName: "Test Creator"
        });
      
      const user = await db.select().from(users).where(eq(users.email, "test@example.com")).limit(1);
      testUserId = user[0].id;
    });

    it("should create a protected work with certificate", async () => {
      // Login first to get session
      const loginResponse = await request(app)
        .post("/api/login")
        .send({
          email: "test@example.com",
          password: "password123"
        });

      const sessionCookie = loginResponse.headers['set-cookie'];

      // Create a work
      const response = await request(app)
        .post("/api/works")
        .set('Cookie', sessionCookie)
        .send({
          title: "Test Artwork",
          description: "A test piece",
          tags: ["digital", "art"],
          category: "artwork"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("certificateId");
      expect(response.body.work).toHaveProperty("title", "Test Artwork");
      
      testWorkId = response.body.work.id;
      
      // Verify work was created in database
      const work = await db.select().from(works).where(eq(works.id, testWorkId)).limit(1);
      expect(work).toHaveLength(1);
      expect(work[0].title).toBe("Test Artwork");
    });

    it("should retrieve work details including certificate", async () => {
      // First create a work (using same setup as previous test)
      const loginResponse = await request(app)
        .post("/api/login")
        .send({
          email: "test@example.com",
          password: "password123"
        });

      const sessionCookie = loginResponse.headers['set-cookie'];
      
      const createResponse = await request(app)
        .post("/api/works")
        .set('Cookie', sessionCookie)
        .send({
          title: "Test Artwork",
          description: "A test piece",
          tags: ["digital"],
          category: "artwork"
        });

      const workId = createResponse.body.work.id;

      // Retrieve work details
      const response = await request(app)
        .get(`/api/works/${workId}`)
        .set('Cookie', sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("title", "Test Artwork");
      expect(response.body).toHaveProperty("certificateId");
    });
  });

  describe("Social Features Flow", () => {
    let user1Id: number;
    let user2Id: number;
    let user1Cookie: string[];
    let user2Cookie: string[];

    beforeEach(async () => {
      // Create two test users
      await request(app)
        .post("/api/register")
        .send({
          username: "user1",
          email: "test@example.com",
          password: "password123",
          displayName: "User One"
        });

      await request(app)
        .post("/api/register")
        .send({
          username: "user2", 
          email: "test2@example.com",
          password: "password123",
          displayName: "User Two"
        });

      const users_data = await db.select().from(users).where(eq(users.email, "test@example.com"));
      const users2_data = await db.select().from(users).where(eq(users.email, "test2@example.com"));
      
      user1Id = users_data[0].id;
      user2Id = users2_data[0].id;

      // Login both users
      const login1 = await request(app).post("/api/login").send({
        email: "test@example.com",
        password: "password123"
      });
      
      const login2 = await request(app).post("/api/login").send({
        email: "test2@example.com", 
        password: "password123"
      });

      user1Cookie = login1.headers['set-cookie'];
      user2Cookie = login2.headers['set-cookie'];
    });

    it("should allow users to follow each other", async () => {
      // User 1 follows User 2
      const response = await request(app)
        .post(`/api/users/${user2Id}/follow`)
        .set('Cookie', user1Cookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "User followed successfully");

      // Verify follow relationship in database
      const follow = await db.select().from(userFollows)
        .where(eq(userFollows.followerId, user1Id))
        .limit(1);
      
      expect(follow).toHaveLength(1);
      expect(follow[0].followingId).toBe(user2Id);
    });

    it("should create and retrieve posts", async () => {
      // Create a post
      const response = await request(app)
        .post("/api/posts")
        .set('Cookie', user1Cookie)
        .send({
          content: "This is a test post",
          title: "Test Post"
        });

      expect(response.status).toBe(201);
      expect(response.body.post).toHaveProperty("content", "This is a test post");
      
      testPostId = response.body.post.id;

      // Retrieve posts
      const getResponse = await request(app)
        .get("/api/posts")
        .set('Cookie', user1Cookie);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.posts).toBeInstanceOf(Array);
      expect(getResponse.body.posts.length).toBeGreaterThan(0);
    });

    it("should allow liking posts", async () => {
      // First create a post
      const createResponse = await request(app)
        .post("/api/posts")
        .set('Cookie', user1Cookie)
        .send({
          content: "Likeable post",
          title: "Like Me"
        });

      const postId = createResponse.body.post.id;

      // Like the post with user 2
      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Cookie', user2Cookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Post liked successfully");
    });
  });

  describe("Database Schema Validation", () => {
    it("should have all required tables", async () => {
      // Test that critical tables exist by attempting simple queries
      const userCount = await db.select().from(users).limit(1);
      const workCount = await db.select().from(works).limit(1);
      const postCount = await db.select().from(posts).limit(1);
      
      // These should not throw errors if tables exist
      expect(userCount).toBeDefined();
      expect(workCount).toBeDefined(); 
      expect(postCount).toBeDefined();
    });

    it("should enforce foreign key constraints", async () => {
      // Attempt to create a work with non-existent user ID
      try {
        await db.insert(works).values({
          userId: 99999, // Non-existent user
          title: "Invalid Work",
          description: "Should fail",
          fileHash: "testhash",
          mimeType: "image/jpeg",
          category: "artwork"
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw foreign key constraint error
        expect(error).toBeDefined();
      }
    });
  });
});

describe("API Error Handling", () => {
  it("should handle malformed JSON requests", async () => {
    const response = await request(app)
      .post("/api/register")
      .send("invalid json")
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(400);
  });

  it("should validate required fields", async () => {
    const response = await request(app)
      .post("/api/register")
      .send({
        username: "test",
        // Missing email and password
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should handle unauthorized access", async () => {
    const response = await request(app)
      .post("/api/works")
      .send({
        title: "Unauthorized Work"
      });

    expect(response.status).toBe(401);
  });
});