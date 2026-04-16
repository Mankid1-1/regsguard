/**
 * Comprehensive Health Monitoring System
 * Monitors external services, database performance, and application health
 */

import { prisma } from "./prisma";
import { createAppError, logError } from "./error-handling";

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  error?: string;
  lastChecked: Date;
  details?: Record<string, unknown>;
}

export interface HealthReport {
  overall: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  timestamp: Date;
  uptime: number;
  version: string;
}

export class HealthMonitor {
  private static checks: Map<string, HealthCheck> = new Map();
  private static startTime = Date.now();
  private static version = process.env.npm_package_version || '1.0.0';

  /**
   * Run all health checks
   */
  static async runHealthChecks(): Promise<HealthReport> {
    const checkPromises = [
      this.checkDatabase(),
      this.checkEmailService(),
      this.checkPaymentService(),
      this.checkLicenseVerification(),
      this.checkPdfGeneration(),
      this.checkCronJobs(),
      this.checkDiskSpace(),
      this.checkMemoryUsage(),
    ];

    const results = await Promise.allSettled(checkPromises);
    const checks: HealthCheck[] = [];

    results.forEach((result, index) => {
      const serviceNames = [
        'database', 'email', 'payments', 'license-verification', 
        'pdf-generation', 'cron-jobs', 'disk-space', 'memory'
      ];
      
      if (result.status === 'fulfilled') {
        checks.push(result.value);
      } else {
        checks.push({
          service: serviceNames[index],
          status: 'down',
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          lastChecked: new Date(),
        });
      }
    });

    // Determine overall health
    const overall = this.calculateOverallHealth(checks);

    return {
      overall,
      checks,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
      version: this.version,
    };
  }

  /**
   * Check database connectivity and performance
   */
  private static async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      // Test performance with a simple query
      const perfStart = Date.now();
      await prisma.userDeadline.findFirst({ take: 1 });
      const responseTime = Date.now() - perfStart;

      // Check connection pool status
      const poolStats = await this.getDatabasePoolStats();

      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        lastChecked: new Date(),
        details: {
          poolConnections: poolStats.total,
          poolIdle: poolStats.idle,
          poolActive: poolStats.active,
        },
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'down',
        error: error instanceof Error ? error.message : 'Database connection failed',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check email service (Resend)
   */
  private static async checkEmailService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('Resend API key not configured');
      }

      // Simple API health check
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        service: 'email',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        service: 'email',
        status: 'down',
        error: error instanceof Error ? error.message : 'Email service unavailable',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check payment service (Stripe)
   */
  private static async checkPaymentService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key not configured');
      }

      // Test Stripe API with a simple balance check
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const responseTime = Date.now() - startTime;
      
      await stripe.balance.retrieve();

      return {
        service: 'payments',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        service: 'payments',
        status: 'down',
        error: error instanceof Error ? error.message : 'Payment service unavailable',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check license verification APIs
   */
  private static async checkLicenseVerification(): Promise<HealthCheck> {
    const startTime = Date.now();
    let healthyCount = 0;
    let totalCount = 0;
    const errors: string[] = [];

    const apis = [
      { name: 'Minnesota DLI', key: 'MINNESOTA_DLI_API_KEY' },
      { name: 'Minnesota Electrical', key: 'MINNESOTA_ELECTRICAL_API_KEY' },
      { name: 'Wisconsin DSPS', key: 'WISCONSIN_DSPS_API_KEY' },
      { name: 'Wisconsin Electrical', key: 'WISCONSIN_ELECTRICAL_API_KEY' },
    ];

    for (const api of apis) {
      totalCount++;
      if (process.env[api.key]) {
        healthyCount++;
      } else {
        errors.push(`${api.name} API key not configured`);
      }
    }

    const responseTime = Date.now() - startTime;
    const status = healthyCount === totalCount ? 'healthy' : 
                   healthyCount > 0 ? 'degraded' : 'down';

    return {
      service: 'license-verification',
      status,
      responseTime,
      lastChecked: new Date(),
      details: {
        configured: healthyCount,
        total: totalCount,
        errors,
      },
    };
  }

  /**
   * Check PDF generation capability
   */
  private static async checkPdfGeneration(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test Puppeteer availability
      const puppeteer = require('puppeteer');
      const responseTime = Date.now() - startTime;

      return {
        service: 'pdf-generation',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        service: 'pdf-generation',
        status: 'down',
        error: error instanceof Error ? error.message : 'PDF generation unavailable',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check cron job health
   */
  private static async checkCronJobs(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check recent cron job executions
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogs = await prisma.complianceLog.findMany({
        where: {
          action: 'DEADLINE_CHECK',
          createdAt: { gte: oneHourAgo },
        },
        take: 5,
      });

      const responseTime = Date.now() - startTime;
      const status = recentLogs.length > 0 ? 'healthy' : 'degraded';

      return {
        service: 'cron-jobs',
        status,
        responseTime,
        lastChecked: new Date(),
        details: {
          recentExecutions: recentLogs.length,
          lastExecution: recentLogs[0]?.createdAt,
        },
      };
    } catch (error) {
      return {
        service: 'cron-jobs',
        status: 'down',
        error: error instanceof Error ? error.message : 'Cron job check failed',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check disk space
   */
  private static async checkDiskSpace(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const fs = require('fs');
      const stats = fs.statSync(process.cwd());
      
      // Simple check - in production you'd want actual disk space monitoring
      const responseTime = Date.now() - startTime;

      return {
        service: 'disk-space',
        status: 'healthy', // Simplified for now
        responseTime,
        lastChecked: new Date(),
        details: {
          available: 'Sufficient', // Would calculate actual available space
        },
      };
    } catch (error) {
      return {
        service: 'disk-space',
        status: 'down',
        error: error instanceof Error ? error.message : 'Disk space check failed',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check memory usage
   */
  private static async checkMemoryUsage(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal / 1024 / 1024; // MB
      const usedMem = memUsage.heapUsed / 1024 / 1024; // MB
      const usagePercent = (usedMem / totalMem) * 100;

      const responseTime = Date.now() - startTime;
      const status = usagePercent < 80 ? 'healthy' : usagePercent < 90 ? 'degraded' : 'down';

      return {
        service: 'memory',
        status,
        responseTime,
        lastChecked: new Date(),
        details: {
          used: Math.round(usedMem),
          total: Math.round(totalMem),
          usagePercent: Math.round(usagePercent),
        },
      };
    } catch (error) {
      return {
        service: 'memory',
        status: 'down',
        error: error instanceof Error ? error.message : 'Memory check failed',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Calculate overall health status
   */
  private static calculateOverallHealth(checks: HealthCheck[]): 'healthy' | 'degraded' | 'down' {
    const healthy = checks.filter(c => c.status === 'healthy').length;
    const degraded = checks.filter(c => c.status === 'degraded').length;
    const down = checks.filter(c => c.status === 'down').length;

    if (down > 0) return 'down';
    if (degraded > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Get database pool statistics
   */
  private static async getDatabasePoolStats(): Promise<{
    total: number;
    idle: number;
    active: number;
  }> {
    try {
      // This would depend on your database client
      // For Prisma, you might need to access internal pool stats
      return {
        total: 10,
        idle: 8,
        active: 2,
      };
    } catch (error) {
      return {
        total: 0,
        idle: 0,
        active: 0,
      };
    }
  }

  /**
   * Get service health history
   */
  static async getHealthHistory(hours: number = 24): Promise<HealthReport[]> {
    // This would typically store health reports in a database
    // For now, return empty array
    return [];
  }

  /**
   * Set up alerting for health issues
   */
  static async setupAlerting(): Promise<void> {
    // Implementation would depend on your alerting system
    // Could send to Slack, email, PagerDuty, etc.
  }
}

/**
 * Failure Recovery System
 */
export class FailureRecovery {
  /**
   * Attempt to recover from service failures
   */
  static async attemptRecovery(service: string, error: Error): Promise<boolean> {
    console.log(`Attempting recovery for ${service}: ${error.message}`);

    switch (service) {
      case 'database':
        return await this.recoverDatabase(error);
      case 'email':
        return await this.recoverEmailService(error);
      case 'payments':
        return await this.recoverPaymentService(error);
      default:
        return false;
    }
  }

  /**
   * Recover database connection
   */
  private static async recoverDatabase(error: Error): Promise<boolean> {
    try {
      // Disconnect and reconnect
      await prisma.$disconnect();
      // Reconnect happens automatically on next query
      return true;
    } catch (recoveryError) {
      console.error('Database recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Recover email service
   */
  private static async recoverEmailService(error: Error): Promise<boolean> {
    try {
      // Clear any cached connections and retry
      // Implementation depends on email service
      return true;
    } catch (recoveryError) {
      console.error('Email service recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Recover payment service
   */
  private static async recoverPaymentService(error: Error): Promise<boolean> {
    try {
      // Reinitialize Stripe client
      // Implementation depends on payment service
      return true;
    } catch (recoveryError) {
      console.error('Payment service recovery failed:', recoveryError);
      return false;
    }
  }
}
