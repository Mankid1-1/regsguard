/**
 * Performance Optimization System
 * Caching, background processing, and performance monitoring
 */

import { cache } from "./cache";
import { prisma } from "./prisma";

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size
  tags?: string[]; // Cache tags for invalidation
}

export interface BackgroundJob {
  id: string;
  type: string;
  data: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

/**
 * Enhanced Caching System
 */
export class PerformanceCache {
  private static defaultConfig: CacheConfig = {
    ttl: 300, // 5 minutes
    maxSize: 1000,
  };

  /**
   * Cache with automatic invalidation
   */
  static async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    return cache.get(key, finalConfig.ttl, fetcher);
  }

  /**
   * Cache regulation data with longer TTL
   */
  static async getRegulations(trade?: string, state?: string): Promise<any[]> {
    const key = `regulations:${trade || 'all'}:${state || 'all'}`;
    const config: CacheConfig = {
      ttl: 3600, // 1 hour
      tags: ['regulations'],
    };

    return this.get(key, async () => {
      const where: any = { active: true };
      if (trade) where.trade = trade;
      if (state) where.state = state;

      return prisma.regulation.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { title: 'asc' },
        ],
      });
    }, config);
  }

  /**
   * Cache user deadlines with shorter TTL
   */
  static async getUserDeadlines(userId: string, days: number = 90): Promise<any[]> {
    const key = `deadlines:${userId}:${days}`;
    const config: CacheConfig = {
      ttl: 300, // 5 minutes
      tags: [`user:${userId}`, 'deadlines'],
    };

    return this.get(key, async () => {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return prisma.userDeadline.findMany({
        where: {
          userId,
          nextDueDate: { lte: endDate },
          status: { notIn: ['COMPLETED', 'SKIPPED'] },
        },
        include: {
          regulation: {
            select: {
              id: true,
              title: true,
              authority: true,
              trade: true,
              state: true,
              fee: true,
              portalUrl: true,
              officialEmail: true,
              category: true,
            },
          },
        },
        orderBy: { nextDueDate: 'asc' },
      });
    }, config);
  }

  /**
   * Cache compliance score
   */
  static async getComplianceScore(userId: string): Promise<number> {
    const key = `compliance-score:${userId}`;
    const config: CacheConfig = {
      ttl: 600, // 10 minutes
      tags: [`user:${userId}`, 'compliance'],
    };

    return this.get(key, async () => {
      const deadlines = await prisma.userDeadline.findMany({
        where: { userId },
      });

      if (deadlines.length === 0) return 0;

      const now = new Date();
      let score = 100;

      // Deduct for overdue items
      const overdue = deadlines.filter(
        d => d.nextDueDate < now && d.status !== 'COMPLETED' && d.status !== 'SKIPPED'
      ).length;
      score -= Math.min(overdue * 20, 40);

      // Deduct for due soon items
      const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const dueSoon = deadlines.filter(
        d => d.nextDueDate >= now && d.nextDueDate <= thirtyDaysOut && 
             d.status !== 'COMPLETED' && d.status !== 'SKIPPED'
      ).length;
      score -= Math.min(dueSoon * 10, 30);

      // Bonus for completed deadlines
      const completed = deadlines.filter(d => d.status === 'COMPLETED').length;
      score += Math.min(Math.floor(completed / 5), 10);

      return Math.max(0, Math.min(100, score));
    }, config);
  }

  /**
   * Invalidate cache by tags
   */
  static async invalidateByTag(tag: string): Promise<void> {
    // Implementation would depend on cache system
    // For now, use cache.invalidatePrefix
    await cache.invalidatePrefix(tag);
  }

  /**
   * Invalidate user-specific cache
   */
  static async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      cache.invalidatePrefix(`user:${userId}`),
      cache.invalidatePrefix(`deadlines:${userId}`),
      cache.invalidatePrefix(`compliance-score:${userId}`),
    ]);
  }
}

/**
 * Background Job Processing System
 */
export class BackgroundProcessor {
  private static jobs: Map<string, BackgroundJob> = new Map();
  private static processing = new Set<string>();

  /**
   * Queue a background job
   */
  static async queueJob(
    type: string,
    data: Record<string, unknown>,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    const job: BackgroundJob = {
      id: jobId,
      type,
      data,
      priority,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };

    this.jobs.set(jobId, job);
    
    // Process immediately for high priority jobs
    if (priority === 'high') {
      setImmediate(() => this.processJob(jobId));
    } else {
      // Use setTimeout to make it truly async
      setTimeout(() => this.processJob(jobId), 0);
    }

    return jobId;
  }

  /**
   * Process a background job
   */
  private static async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'pending' || this.processing.has(jobId)) {
      return;
    }

    this.processing.add(jobId);
    job.status = 'processing';
    job.startedAt = new Date();

    try {
      switch (job.type) {
        case 'generate-pdf':
          await this.processPdfGeneration(job);
          break;
        case 'send-email':
          await this.processEmailSending(job);
          break;
        case 'verify-license':
          await this.processLicenseVerification(job);
          break;
        case 'cleanup-old-data':
          await this.processDataCleanup(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.retryCount++;

      if (job.retryCount < job.maxRetries) {
        job.status = 'pending';
        // Exponential backoff
        const delay = Math.pow(2, job.retryCount) * 1000;
        setTimeout(() => this.processJob(jobId), delay);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
      }
    } finally {
      this.processing.delete(jobId);
    }
  }

  /**
   * Process PDF generation job
   */
  private static async processPdfGeneration(job: BackgroundJob): Promise<void> {
    const { regulationId, userId } = job.data as {
      regulationId: string;
      userId: string;
    };

    // Import PDF generation function
    const { generateCompliancePdf } = await import('./pdf/generate-pdf');
    const { buffer, filename } = await generateCompliancePdf(regulationId, userId);

    // Store PDF or send as needed
    job.data.result = { filename, size: buffer.length };
  }

  /**
   * Process email sending job
   */
  private static async processEmailSending(job: BackgroundJob): Promise<void> {
    const { to, subject, html, attachments } = job.data as {
      to: string;
      subject: string;
      html: string;
      attachments?: any[];
    };

    const { sendEmail } = await import('./email/send-email');
    const result = await sendEmail({ to, subject, html, attachments });

    job.data.result = { messageId: result.messageId };
  }

  /**
   * Process license verification job
   */
  private static async processLicenseVerification(job: BackgroundJob): Promise<void> {
    const { licenseNumber, state, trade } = job.data as {
      licenseNumber: string;
      state: string;
      trade: string;
    };

    const { verifyLicense } = await import('./license-verification');
    const result = await verifyLicense({
      licenseNumber,
      state,
      trade,
    });

    job.data.result = result;
  }

  /**
   * Process data cleanup job
   */
  private static async processDataCleanup(job: BackgroundJob): Promise<void> {
    const { daysOld = 90 } = job.data as { daysOld?: number };
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Clean up old compliance logs
    const deletedLogs = await prisma.complianceLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        action: 'DEADLINE_CHECK', // Only cleanup automated logs
      },
    });

    // Clean up old error logs
    const deletedErrors = await prisma.errorLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    job.data.result = { deletedLogs: deletedLogs.count, deletedErrors: deletedErrors.count };
  }

  /**
   * Get job status
   */
  static getJobStatus(jobId: string): BackgroundJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  static getAllJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clean up completed jobs
   */
  static cleanupJobs(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.completedAt &&
        job.completedAt.getTime() < oneHourAgo
      ) {
        this.jobs.delete(jobId);
      }
    }
  }
}

/**
 * Performance Monitoring
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Record performance metric
   */
  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get metric statistics
   */
  static getMetricStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p95: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const avg = sorted.reduce((sum, val) => sum + val, 0) / count;
    const p95 = sorted[Math.floor(count * 0.95)];

    return { count, min, max, avg, p95 };
  }

  /**
   * Get all metrics
   */
  static getAllMetrics(): Record<string, ReturnType<typeof this.getMetricStats>> {
    const result: Record<string, ReturnType<typeof this.getMetricStats>> = {};
    
    for (const name of this.metrics.keys()) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }

  /**
   * Measure execution time
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(`${name}:error`, duration);
      throw error;
    }
  }
}

/**
 * Performance optimization utilities
 */
export class PerformanceUtils {
  /**
   * Optimize database queries with pagination
   */
  static async paginatedQuery<T>(
    query: () => Promise<T[]>,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const offset = (page - 1) * pageSize;
    
    // This would need to be implemented based on specific query
    const data = await query();
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginatedData = data.slice(offset, offset + pageSize);

    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Batch process items to avoid memory issues
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 100
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }
}

// Set up periodic cleanup
setInterval(() => {
  BackgroundProcessor.cleanupJobs();
}, 60 * 60 * 1000); // Every hour
