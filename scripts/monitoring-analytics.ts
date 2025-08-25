#!/usr/bin/env tsx
/**
 * Monitoring and Analytics Script
 * Populates system metrics and provides health checks for TheKeyn platform
 */

import { db } from "../server/db";
import { users, works, posts, userFollows, systemMetrics, userAnalytics } from "@shared/schema";
import { sql, count, desc, gte, lt } from "drizzle-orm";
import { config } from "../server/config/environment";

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  checks: HealthCheck[];
  metrics: PlatformMetrics;
  timestamp: Date;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  value?: number;
  threshold?: number;
}

interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalWorks: number;
  totalPosts: number;
  totalFollows: number;
  avgFollowersPerUser: number;
  worksCreatedToday: number;
  postsCreatedToday: number;
  usersRegisteredToday: number;
}

async function gatherPlatformMetrics(): Promise<PlatformMetrics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get basic counts
  const [
    totalUsersResult,
    totalWorksResult, 
    totalPostsResult,
    totalFollowsResult,
    worksCreatedTodayResult,
    postsCreatedTodayResult,
    usersRegisteredTodayResult
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(works),
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(userFollows),
    db.select({ count: count() }).from(works).where(gte(works.createdAt, today)),
    db.select({ count: count() }).from(posts).where(gte(posts.createdAt, today)),
    db.select({ count: count() }).from(users).where(gte(users.createdAt, today))
  ]);

  // Calculate active users (users with activity in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const activeUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastLoginAt, sevenDaysAgo));

  // Calculate average followers per user
  const followersStats = await db
    .select({
      avgFollowers: sql<number>`AVG(follower_count)::float`
    })
    .from(
      db.select({
        userId: userFollows.followingId,
        followerCount: count().as('follower_count')
      })
      .from(userFollows)
      .groupBy(userFollows.followingId)
      .as('follower_stats')
    );

  return {
    totalUsers: totalUsersResult[0].count,
    activeUsers: activeUsersResult[0].count,
    totalWorks: totalWorksResult[0].count,
    totalPosts: totalPostsResult[0].count,
    totalFollows: totalFollowsResult[0].count,
    avgFollowersPerUser: followersStats[0]?.avgFollowers || 0,
    worksCreatedToday: worksCreatedTodayResult[0].count,
    postsCreatedToday: postsCreatedTodayResult[0].count,
    usersRegisteredToday: usersRegisteredTodayResult[0].count
  };
}

async function performHealthChecks(metrics: PlatformMetrics): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Database connectivity check
  try {
    await db.select({ count: count() }).from(users).limit(1);
    checks.push({
      name: 'Database Connectivity',
      status: 'pass',
      message: 'Database connection successful'
    });
  } catch (error) {
    checks.push({
      name: 'Database Connectivity',
      status: 'fail',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  // User growth check (warn if no new users in 24h)
  checks.push({
    name: 'User Growth',
    status: metrics.usersRegisteredToday > 0 ? 'pass' : 'warn',
    message: `${metrics.usersRegisteredToday} new users today`,
    value: metrics.usersRegisteredToday,
    threshold: 1
  });

  // Content creation check (warn if no new content in 24h)
  const totalContentToday = metrics.worksCreatedToday + metrics.postsCreatedToday;
  checks.push({
    name: 'Content Creation',
    status: totalContentToday > 0 ? 'pass' : 'warn',
    message: `${totalContentToday} new pieces of content today`,
    value: totalContentToday,
    threshold: 1
  });

  // User engagement check (warn if active users < 10% of total)
  const engagementRate = metrics.totalUsers > 0 ? (metrics.activeUsers / metrics.totalUsers) * 100 : 0;
  checks.push({
    name: 'User Engagement',
    status: engagementRate >= 10 ? 'pass' : engagementRate >= 5 ? 'warn' : 'fail',
    message: `${engagementRate.toFixed(1)}% of users active in last 7 days`,
    value: engagementRate,
    threshold: 10
  });

  // Follow feature health (warn if average followers is suspiciously low)
  checks.push({
    name: 'Social Features',
    status: metrics.avgFollowersPerUser >= 1 ? 'pass' : 'warn',
    message: `Average ${metrics.avgFollowersPerUser.toFixed(1)} followers per user`,
    value: metrics.avgFollowersPerUser,
    threshold: 1
  });

  // Environment configuration check
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'STRIPE_SECRET_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  checks.push({
    name: 'Environment Configuration',
    status: missingVars.length === 0 ? 'pass' : 'fail',
    message: missingVars.length === 0 
      ? 'All required environment variables present'
      : `Missing variables: ${missingVars.join(', ')}`
  });

  return checks;
}

async function recordSystemMetrics(metrics: PlatformMetrics): Promise<void> {
  try {
    await db.insert(systemMetrics).values({
      metricName: 'daily_platform_stats',
      metricValue: JSON.stringify(metrics),
      category: 'platform',
      createdAt: new Date()
    });
    
    console.log('✅ System metrics recorded to database');
  } catch (error) {
    console.error('❌ Failed to record system metrics:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function generateHealthReport(): Promise<SystemHealth> {
  console.log('🔍 Gathering platform metrics...');
  const metrics = await gatherPlatformMetrics();
  
  console.log('🏥 Performing health checks...');
  const checks = await performHealthChecks(metrics);
  
  // Determine overall system status
  const hasFailures = checks.some(check => check.status === 'fail');
  const hasWarnings = checks.some(check => check.status === 'warn');
  
  const status: SystemHealth['status'] = hasFailures ? 'critical' : hasWarnings ? 'warning' : 'healthy';
  
  return {
    status,
    checks,
    metrics,
    timestamp: new Date()
  };
}

async function detectAnomalies(metrics: PlatformMetrics): Promise<string[]> {
  const anomalies: string[] = [];
  
  // Check for sudden drops in activity
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const dayAfterYesterday = new Date(yesterday);
  dayAfterYesterday.setDate(dayAfterYesterday.getDate() + 1);
  
  try {
    const [yesterdayWorks, yesterdayPosts] = await Promise.all([
      db.select({ count: count() }).from(works)
        .where(gte(works.createdAt, yesterday))
        .where(lt(works.createdAt, dayAfterYesterday)),
      db.select({ count: count() }).from(posts)
        .where(gte(posts.createdAt, yesterday))
        .where(lt(posts.createdAt, dayAfterYesterday))
    ]);
    
    const yesterdayWorksCount = yesterdayWorks[0].count;
    const yesterdayPostsCount = yesterdayPosts[0].count;
    
    // Detect significant drops (50% or more)
    if (yesterdayWorksCount > 0 && metrics.worksCreatedToday < yesterdayWorksCount * 0.5) {
      anomalies.push(`Significant drop in work creation: ${metrics.worksCreatedToday} today vs ${yesterdayWorksCount} yesterday`);
    }
    
    if (yesterdayPostsCount > 0 && metrics.postsCreatedToday < yesterdayPostsCount * 0.5) {
      anomalies.push(`Significant drop in post creation: ${metrics.postsCreatedToday} today vs ${yesterdayPostsCount} yesterday`);
    }
  } catch (error) {
    console.warn('Could not perform anomaly detection:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  return anomalies;
}

function printHealthReport(health: SystemHealth): void {
  console.log('\n📊 SYSTEM HEALTH REPORT');
  console.log('========================');
  console.log(`Status: ${health.status.toUpperCase()}`);
  console.log(`Timestamp: ${health.timestamp.toISOString()}`);
  
  console.log('\n📈 Platform Metrics:');
  console.log(`  Total Users: ${health.metrics.totalUsers}`);
  console.log(`  Active Users (7d): ${health.metrics.activeUsers}`);
  console.log(`  Total Works: ${health.metrics.totalWorks}`);
  console.log(`  Total Posts: ${health.metrics.totalPosts}`);
  console.log(`  Total Follows: ${health.metrics.totalFollows}`);
  console.log(`  Avg Followers/User: ${health.metrics.avgFollowersPerUser.toFixed(1)}`);
  
  console.log('\n📅 Today\'s Activity:');
  console.log(`  New Users: ${health.metrics.usersRegisteredToday}`);
  console.log(`  New Works: ${health.metrics.worksCreatedToday}`);
  console.log(`  New Posts: ${health.metrics.postsCreatedToday}`);
  
  console.log('\n🏥 Health Checks:');
  health.checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    console.log(`  ${icon} ${check.name}: ${check.message}`);
  });
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting system monitoring and analytics...');
    
    // Generate health report
    const health = await generateHealthReport();
    
    // Print report
    printHealthReport(health);
    
    // Record metrics to database
    await recordSystemMetrics(health.metrics);
    
    // Check for anomalies
    console.log('\n🔍 Checking for anomalies...');
    const anomalies = await detectAnomalies(health.metrics);
    
    if (anomalies.length > 0) {
      console.log('\n⚠️ ANOMALIES DETECTED:');
      anomalies.forEach(anomaly => console.log(`  - ${anomaly}`));
    } else {
      console.log('✅ No anomalies detected');
    }
    
    // Exit with appropriate code
    if (health.status === 'critical') {
      console.log('\n💥 CRITICAL ISSUES DETECTED - Manual intervention required');
      process.exit(1);
    } else if (health.status === 'warning') {
      console.log('\n⚠️ Warnings detected - monitoring recommended');
      process.exit(0);
    } else {
      console.log('\n✅ All systems healthy');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Monitoring script failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run monitoring if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateHealthReport, gatherPlatformMetrics, performHealthChecks, detectAnomalies };