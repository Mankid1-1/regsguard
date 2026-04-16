import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HealthMonitor, FailureRecovery } from "@/lib/health-monitoring";

const startedAt = Date.now();

export async function GET() {
  try {
    // Run comprehensive health checks
    const healthReport = await HealthMonitor.runHealthChecks();
    
    // Enhanced memory usage reporting
    const mem = process.memoryUsage();
    const memoryMb = {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
    };

    // Additional system information
    const systemInfo = {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    };

    // Determine HTTP status code
    const statusCode = healthReport.overall === 'healthy' ? 200 : 
                      healthReport.overall === 'degraded' ? 200 : 503;

    return NextResponse.json({
      ...healthReport,
      memory: memoryMb,
      system: systemInfo,
      uptime: Math.round((Date.now() - startedAt) / 1000),
      environment: process.env.NODE_ENV || 'development',
    }, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    
    // Fallback basic health check
    const fallbackChecks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
    
    try {
      const dbStart = Date.now();
      await prisma.$queryRawUnsafe("SELECT 1");
      fallbackChecks.database = { status: "ok", latencyMs: Date.now() - dbStart };
    } catch (err) {
      fallbackChecks.database = {
        status: "error",
        latencyMs: Date.now() - dbStart,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }

    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - startedAt) / 1000),
      checks: fallbackChecks,
      error: error instanceof Error ? error.message : "Health check failed",
      version: process.env.npm_package_version ?? "unknown",
      node: process.version,
    }, { status: 503 });
  }
}
