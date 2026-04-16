import { prisma } from "@/lib/prisma";
import { generateCompliancePdf } from "@/lib/pdf/generate-pdf";
import { sendEmail } from "@/lib/email/send-email";
import { maskPii } from "@/lib/pii-mask";
import { calculateNextDueDate } from "@/lib/cron/deadline-calculator";
import type { Regulation, User, AutoRenewalConfig } from "@prisma/client";

interface AutoRenewalResult {
  success: boolean;
  renewed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Process automatic renewals for due licenses and permits
 * This is the core "autopilot" functionality
 */
export async function processAutoRenewals(): Promise<{
  processed: number;
  renewed: number;
  failed: number;
  errors: string[];
}> {
  const results = { processed: 0, renewed: 0, failed: 0, errors: [] as string[] };
  
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get all auto-renewal configs that are due within 7 days
  const renewalConfigs = await prisma.autoRenewalConfig.findMany({
    where: {
      enabled: true,
      nextRenewalAt: { lte: sevenDaysFromNow },
      failureCount: { lt: prisma.autoRenewalConfig.fields.maxRetries },
    },
    include: {
      user: {
        include: {
          businessProfile: true,
        },
      },
      regulation: true,
    },
  });

  for (const config of renewalConfigs) {
    results.processed++;
    
    try {
      const result = await processSingleRenewal(config);
      
      if (result.success && result.renewed) {
        results.renewed++;
      } else if (!result.success) {
        results.failed++;
        results.errors.push(`${config.regulation.title} for ${config.user.email}: ${result.error}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`${config.regulation.title} for ${config.user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
}

/**
 * Process a single auto-renewal
 */
async function processSingleRenewal(
  config: AutoRenewalConfig & { user: User & { businessProfile?: any }; regulation: Regulation }
): Promise<AutoRenewalResult> {
  const { user, regulation } = config;

  try {
    // Step 1: Generate compliance PDF
    const { buffer, filename } = await generateCompliancePdf(config.regulationId, config.userId);

    // Step 2: Submit to authority (if official email is available)
    if (regulation.officialEmail) {
      const businessName = user.businessProfile?.businessName || user.name || "Business";
      
      const submissionResult = await sendEmail({
        to: regulation.officialEmail,
        subject: `Automatic License Renewal - ${regulation.title} - ${businessName}`,
        html: `
          <h2>Automatic License Renewal Submission</h2>
          <p><strong>Business:</strong> ${businessName}</p>
          <p><strong>License/Permit:</strong> ${regulation.title}</p>
          <p><strong>Regulation Authority:</strong> ${regulation.authority}</p>
          <p><strong>Contact:</strong> ${user.email}</p>
          <p><strong>Auto-Submitted:</strong> ${new Date().toLocaleDateString()}</p>
          <hr>
          <p>Please find the completed renewal application attached.</p>
          <p>This is an automatic submission via RegsGuard compliance automation.</p>
        `,
        replyTo: user.email,
        attachments: [{ filename, content: buffer }],
      });

      if (!submissionResult.success) {
        throw new Error(`Failed to submit to authority: ${submissionResult.error}`);
      }

      // Step 3: Log successful submission
      await prisma.complianceLog.create({
        data: {
          userId: config.userId,
          regulationId: config.regulationId,
          action: "AUTO_FILED",
          details: maskPii({
            submittedTo: regulation.officialEmail,
            filename,
            messageId: submissionResult.messageId,
            autoRenewal: true,
          }) as Record<string, unknown>,
        },
      });

      // Step 4: Update deadline and create next one
      await prisma.userDeadline.updateMany({
        where: {
          userId: config.userId,
          regulationId: config.regulationId,
          status: { notIn: ["COMPLETED", "SKIPPED"] },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Step 5: Create next deadline if not one-time
      if (regulation.renewalCycle !== "ONE_TIME") {
        const nextDueDate = calculateNextDueDate(regulation, new Date());
        await prisma.userDeadline.create({
          data: {
            userId: config.userId,
            regulationId: config.regulationId,
            nextDueDate,
            status: "UPCOMING",
          },
        });

        // Update auto-renewal config for next cycle
        await prisma.autoRenewalConfig.update({
          where: { id: config.id },
          data: {
            lastRenewedAt: new Date(),
            nextRenewalAt: nextDueDate,
            failureCount: 0, // Reset failure count on success
          },
        });
      } else {
        // Disable auto-renewal for one-time regulations
        await prisma.autoRenewalConfig.update({
          where: { id: config.id },
          data: {
            enabled: false,
            lastRenewedAt: new Date(),
          },
        });
      }

      // Step 6: Notify user of successful renewal
      await sendEmail({
        to: user.email,
        subject: `[RegsGuard] Auto-Renewed: ${regulation.title}`,
        html: `
          <h2>License Auto-Renewal Complete</h2>
          <p>Great news! We automatically renewed your <strong>${regulation.title}</strong> and submitted it to <strong>${regulation.authority}</strong>.</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Submitted to:</strong> ${regulation.officialEmail}</p>
            <p><strong>Document:</strong> ${filename}</p>
            <p><strong>Next renewal:</strong> ${regulation.renewalCycle === "ONE_TIME" ? "N/A (one-time)" : calculateNextDueDate(regulation, new Date()).toLocaleDateString()}</p>
          </div>
          <p>No action needed on your part. Your compliance is maintained.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Dashboard</a></p>
        `,
      });

      return { success: true, renewed: true };
    } else {
      // No official email - notify user that manual action is needed
      await sendEmail({
        to: user.email,
        subject: `[RegsGuard] Action Required: ${regulation.title}`,
        html: `
          <h2>Manual Renewal Required</h2>
          <p>Your <strong>${regulation.title}</strong> is due for renewal, but automatic submission is not available.</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Authority:</strong> ${regulation.authority}</p>
            <p><strong>Portal:</strong> ${regulation.portalUrl || "Contact authority directly"}</p>
            <p><strong>Fee:</strong> ${regulation.fee || "Check with authority"}</p>
          </div>
          <p>We've prepared your renewal document - just download and submit manually.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/regulations/${config.regulationId}">Get Renewal Document</a></p>
        `,
      });

      return { success: true, renewed: false, details: { manualActionRequired: true } };
    }
  } catch (error) {
    // Increment failure count
    await prisma.autoRenewalConfig.update({
      where: { id: config.id },
      data: {
        failureCount: { increment: 1 },
      },
    });

    // Disable if max retries reached
    if (config.failureCount + 1 >= config.maxRetries) {
      await prisma.autoRenewalConfig.update({
        where: { id: config.id },
        data: { enabled: false },
      });

      // Notify user of failure
      await sendEmail({
        to: user.email,
        subject: `[RegsGuard] Auto-Renewal Failed: ${regulation.title}`,
        html: `
          <h2>Auto-Renewal Failed</h2>
          <p>We were unable to automatically renew your <strong>${regulation.title}</strong> after multiple attempts.</p>
          <p>Please renew manually to avoid compliance issues.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/regulations/${config.regulationId}">Renew Manually</a></p>
        `,
      });
    }

    return { 
      success: false, 
      renewed: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Enable auto-renewal for a user's regulation
 */
export async function enableAutoRenewal(
  userId: string,
  regulationId: string,
  config: Partial<Pick<AutoRenewalConfig, 'autoPay' | 'paymentMethodId' | 'digitalSignature'>>
): Promise<AutoRenewalConfig> {
  // Get the next due date for this regulation
  const deadline = await prisma.userDeadline.findFirst({
    where: { userId, regulationId, status: { notIn: ["COMPLETED", "SKIPPED"] } },
    orderBy: { nextDueDate: "asc" },
  });

  if (!deadline) {
    throw new Error("No upcoming deadline found for this regulation");
  }

  return await prisma.autoRenewalConfig.upsert({
    where: { userId_regulationId: { userId, regulationId } },
    update: {
      enabled: true,
      nextRenewalAt: deadline.nextDueDate,
      failureCount: 0,
      ...config,
    },
    create: {
      userId,
      regulationId,
      nextRenewalAt: deadline.nextDueDate,
      enabled: true,
      ...config,
    },
  });
}

/**
 * Get auto-renewal status for a user
 */
export async function getAutoRenewalStatus(userId: string): Promise<{
  enabled: number;
  total: number;
  configs: (AutoRenewalConfig & { regulation: Regulation })[];
}> {
  const configs = await prisma.autoRenewalConfig.findMany({
    where: { userId },
    include: { regulation: true },
    orderBy: { nextRenewalAt: "asc" },
  });

  const enabled = configs.filter(c => c.enabled).length;

  return {
    enabled,
    total: configs.length,
    configs,
  };
}
