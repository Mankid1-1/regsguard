import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

/**
 * Log an admin action for audit purposes.
 *
 * Call this from any admin API route after a mutation
 * (create, update, delete) to maintain a clear audit trail.
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  target: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const headerStore = await headers();
    const ipAddress =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      null;

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action,
        target,
        details: (details ?? undefined) as Record<string, string | number | boolean> | undefined,
        ipAddress,
      },
    });

    logger.info("Admin action logged", { action, target, adminUserId });
  } catch (err) {
    // Audit logging should never break the primary operation
    logger.error("Failed to log admin action", {
      action,
      target,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
