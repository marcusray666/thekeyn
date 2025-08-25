#!/usr/bin/env tsx
/**
 * Fresh Deployment Test Script
 * Validates end-to-end deployment on a clean database
 */

import { db } from "../server/db";
import { users, works, posts, userFollows, userBackgroundPreferences, backgroundInteractions } from "@shared/schema";
import { storage } from "../server/storage";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface DeploymentTestResult {
  step: string;
  status: 'pass' | 'fail';
  message: string;
  error?: string;
}

class DeploymentTester {
  private results: DeploymentTestResult[] = [];
  private testUserId: number | null = null;
  private testWorkId: number | null = null;
  private testPostId: string | null = null;

  private addResult(step: string, status: 'pass' | 'fail', message: string, error?: string) {
    this.results.push({ step, status, message, error });
    const icon = status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${step}: ${message}`);
    if (error) console.log(`   Error: ${error}`);
  }

  async testDatabaseTables(): Promise<boolean> {
    try {
      // Test critical tables exist and are queryable
      const criticalTables = [
        { name: 'users', table: users },
        { name: 'works', table: works },
        { name: 'posts', table: posts },
        { name: 'userFollows', table: userFollows },
        { name: 'userBackgroundPreferences', table: userBackgroundPreferences },
        { name: 'backgroundInteractions', table: backgroundInteractions }
      ];

      for (const { name, table } of criticalTables) {
        const result = await db.select({ count: count() }).from(table).limit(1);
        this.addResult(`Database Table: ${name}`, 'pass', `Table exists and queryable (${result[0].count} records)`);
      }

      return true;
    } catch (error) {
      this.addResult('Database Tables', 'fail', 'Failed to verify table structure', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async testUserAuthentication(): Promise<boolean> {
    try {
      // Test user registration
      const testUser = await storage.createUser({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('testpassword123', 10),
        displayName: 'Test User',
        role: 'user'
      });

      this.testUserId = testUser.id;
      this.addResult('User Registration', 'pass', `User created with ID ${testUser.id}`);

      // Test user retrieval
      const retrievedUser = await storage.getUser(testUser.id);
      if (!retrievedUser) {
        this.addResult('User Retrieval', 'fail', 'Failed to retrieve created user');
        return false;
      }

      this.addResult('User Retrieval', 'pass', 'User retrieved successfully');

      // Test password verification
      const isValidPassword = await bcrypt.compare('testpassword123', retrievedUser.passwordHash);
      this.addResult('Password Verification', isValidPassword ? 'pass' : 'fail', 
        isValidPassword ? 'Password hash verification works' : 'Password verification failed');

      return isValidPassword;
    } catch (error) {
      this.addResult('User Authentication', 'fail', 'Authentication system failed', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async testWorkProtection(): Promise<boolean> {
    if (!this.testUserId) {
      this.addResult('Work Protection', 'fail', 'No test user available');
      return false;
    }

    try {
      // Test work creation
      const testWork = await storage.createWork({
        userId: this.testUserId,
        title: 'Test Protected Work',
        description: 'A test work for deployment validation',
        fileHash: 'test_hash_' + Date.now(),
        mimeType: 'image/jpeg',
        category: 'artwork',
        tags: ['test', 'deployment']
      });

      this.testWorkId = testWork.id;
      this.addResult('Work Creation', 'pass', `Work created with ID ${testWork.id}`);

      // Test work retrieval
      const retrievedWork = await storage.getWork(testWork.id);
      if (!retrievedWork) {
        this.addResult('Work Retrieval', 'fail', 'Failed to retrieve created work');
        return false;
      }

      this.addResult('Work Retrieval', 'pass', 'Work retrieved successfully');

      // Test certificate creation (basic structure test)
      const testCertificate = await storage.createCertificate({
        workId: testWork.id,
        certificateId: `CERT-TEST-${Date.now()}`,
        blockchainHash: 'test_blockchain_hash',
        timestampProof: 'test_timestamp_proof',
        verificationStatus: 'verified'
      });

      this.addResult('Certificate Creation', 'pass', `Certificate created with ID ${testCertificate.certificateId}`);

      return true;
    } catch (error) {
      this.addResult('Work Protection', 'fail', 'Work protection system failed', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async testSocialFeatures(): Promise<boolean> {
    if (!this.testUserId) {
      this.addResult('Social Features', 'fail', 'No test user available');
      return false;
    }

    try {
      // Create second user for follow testing
      const secondUser = await storage.createUser({
        username: `testuser2_${Date.now()}`,
        email: `test2_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('testpassword123', 10),
        displayName: 'Test User 2',
        role: 'user'
      });

      // Test post creation
      const testPost = await storage.createPost({
        userId: this.testUserId,
        content: 'Test post for deployment validation',
        title: 'Test Post'
      });

      this.testPostId = testPost.id;
      this.addResult('Post Creation', 'pass', `Post created with ID ${testPost.id}`);

      // Test follow functionality
      const followResult = await storage.followUser(this.testUserId, secondUser.id);
      this.addResult('Follow Functionality', 'pass', `Follow relationship created`);

      // Test like functionality
      await storage.likePost(secondUser.id, testPost.id);
      this.addResult('Like Functionality', 'pass', 'Post like functionality works');

      return true;
    } catch (error) {
      this.addResult('Social Features', 'fail', 'Social features failed', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async testBackgroundPreferences(): Promise<boolean> {
    if (!this.testUserId) {
      this.addResult('Background Preferences', 'fail', 'No test user available');
      return false;
    }

    try {
      // Test background preference creation
      const preference = await storage.createBackgroundPreference({
        userId: this.testUserId,
        gradientType: 'linear',
        colorScheme: 'warm',
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        direction: '45deg'
      });

      this.addResult('Background Preference Creation', 'pass', `Preference created with ID ${preference.id}`);

      // Test background interaction recording
      const interaction = await storage.recordBackgroundInteraction({
        userId: this.testUserId,
        interactionType: 'view',
        gradientType: 'linear',
        colorScheme: 'warm',
        timeSpent: 5000
      });

      this.addResult('Background Interaction Recording', 'pass', `Interaction recorded with ID ${interaction.id}`);

      return true;
    } catch (error) {
      this.addResult('Background Preferences', 'fail', 'Background preferences system failed', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async testForeignKeyConstraints(): Promise<boolean> {
    try {
      // Test that foreign key constraints are enforced
      try {
        await db.insert(works).values({
          userId: 99999, // Non-existent user
          title: 'Invalid Work',
          description: 'Should fail',
          fileHash: 'test_hash',
          mimeType: 'image/jpeg',
          category: 'artwork'
        });

        this.addResult('Foreign Key Constraints', 'fail', 'Foreign key constraint not enforced');
        return false;
      } catch (constraintError) {
        this.addResult('Foreign Key Constraints', 'pass', 'Foreign key constraints properly enforced');
        return true;
      }
    } catch (error) {
      this.addResult('Foreign Key Constraints', 'fail', 'Failed to test constraints', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up test data
      if (this.testPostId) {
        await db.delete(posts).where(eq(posts.id, this.testPostId));
      }
      if (this.testWorkId) {
        await db.delete(works).where(eq(works.id, this.testWorkId));
      }
      if (this.testUserId) {
        await db.delete(userFollows).where(eq(userFollows.followerId, this.testUserId));
        await db.delete(userFollows).where(eq(userFollows.followingId, this.testUserId));
        await db.delete(userBackgroundPreferences).where(eq(userBackgroundPreferences.userId, this.testUserId));
        await db.delete(backgroundInteractions).where(eq(backgroundInteractions.userId, this.testUserId));
        await db.delete(users).where(eq(users.id, this.testUserId));
      }

      console.log('🧹 Test data cleaned up');
    } catch (error) {
      console.log('⚠️ Cleanup warning:', error instanceof Error ? error.message : String(error));
    }
  }

  printSummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;

    console.log('\n📊 DEPLOYMENT TEST SUMMARY');
    console.log('===========================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`  - ${r.step}: ${r.message}`));
    }

    const deploymentReady = failed === 0;
    console.log(`\n🚀 Deployment Status: ${deploymentReady ? 'READY' : 'NOT READY'}`);
    
    if (deploymentReady) {
      console.log('✅ All systems validated - deployment should succeed');
    } else {
      console.log('❌ Critical issues detected - resolve before deployment');
    }
  }
}

async function runDeploymentTests(): Promise<void> {
  const tester = new DeploymentTester();

  try {
    console.log('🚀 Starting Fresh Deployment Validation Tests...\n');

    // Test database structure
    const dbOk = await tester.testDatabaseTables();
    if (!dbOk) {
      console.log('❌ Database structure test failed - aborting further tests');
      return;
    }

    // Test core functionality
    await tester.testUserAuthentication();
    await tester.testWorkProtection();
    await tester.testSocialFeatures();
    await tester.testBackgroundPreferences();
    await tester.testForeignKeyConstraints();

  } catch (error) {
    console.error('💥 Test suite crashed:', error instanceof Error ? error.message : String(error));
  } finally {
    await tester.cleanup();
    tester.printSummary();
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDeploymentTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export { DeploymentTester, runDeploymentTests };