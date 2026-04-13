import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import crypto from "crypto";
import type { WebhookEvent } from "@prisma/client";

interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
}

// Exponential backoff intervals in seconds: 30s, 2m, 10m, 1h, 6h
const RETRY_DELAYS = [30, 120, 600, 3600, 21600];

/**
 * Sign a webhook payload using HMAC-SHA256 with the webhook's secret.
 */
function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Attempt to deliver a payload to a webhook endpoint.
 * Returns true on success, error message on failure.
 */
async function attemptDelivery(
  url: string,
  body: string,
  signature: string,
  event: WebhookEvent,
  timestamp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RegsGuard-Signature": signature,
        "X-RegsGuard-Event": event,
        "X-RegsGuard-Timestamp": timestamp,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return { success: false, error: `HTTP ${response.status}: ${errorText.slice(0, 200)}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Dispatch a webhook event to all registered endpoints for a user.
 *
 * Creates WebhookDelivery records for retry tracking.
 * Attempts immediate delivery; failures are queued for retry.
 */
export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      userId,
      active: true,
      events: { has: event },
    },
  });

  if (webhooks.length === 0) return;

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  const deliveries = webhooks.map(async (webhook) => {
    const signature = signPayload(body, webhook.secret);

    // Create delivery record for tracking
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: payload as unknown as Record<string, string>,
        status: "PENDING",
        attempts: 1,
      },
    });

    // Attempt immediate delivery
    const result = await attemptDelivery(
      webhook.url,
      body,
      signature,
      event,
      payload.timestamp
    );

    if (result.success) {
      // Mark successful
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: "SUCCESS" },
      });

      // Clear any previous error on the webhook
      if (webhook.lastError) {
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: { lastError: null },
        });
      }

      logger.info("Webhook delivered", {
        webhookId: webhook.id,
        event,
        url: webhook.url,
      });
    } else {
      // Schedule retry with exponential backoff
      const nextRetryAt = new Date(Date.now() + RETRY_DELAYS[0] * 1000);

      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "PENDING",
          lastError: result.error,
          nextRetryAt,
        },
      });

      // Record error on webhook for debugging
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { lastError: result.error },
      }).catch(() => {});

      logger.warn("Webhook delivery failed, scheduled retry", {
        webhookId: webhook.id,
        event,
        url: webhook.url,
        error: result.error,
        nextRetryAt: nextRetryAt.toISOString(),
      });
    }
  });

  await Promise.allSettled(deliveries);
}

/**
 * Process pending webhook deliveries that are due for retry.
 * Called by the cron scheduler every 30 seconds.
 */
export async function processWebhookRetries(): Promise<{ retried: number; succeeded: number; failed: number }> {
  const now = new Date();

  const pending = await prisma.webhookDelivery.findMany({
    where: {
      status: "PENDING",
      nextRetryAt: { lte: now },
    },
    include: {
      webhook: true,
    },
    take: 50, // Process in batches
  });

  let retried = 0;
  let succeeded = 0;
  let failed = 0;

  for (const delivery of pending) {
    if (!delivery.webhook.active) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: "FAILED", lastError: "Webhook deactivated" },
      });
      failed++;
      continue;
    }

    retried++;
    const body = JSON.stringify(delivery.payload);
    const signature = signPayload(body, delivery.webhook.secret);
    const payloadData = delivery.payload as unknown as WebhookPayload;

    const result = await attemptDelivery(
      delivery.webhook.url,
      body,
      signature,
      delivery.event,
      payloadData.timestamp || new Date().toISOString()
    );

    const attempts = delivery.attempts + 1;

    if (result.success) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: "SUCCESS", attempts },
      });
      await prisma.webhook.update({
        where: { id: delivery.webhook.id },
        data: { lastError: null },
      }).catch(() => {});
      succeeded++;
    } else if (attempts >= delivery.maxAttempts) {
      // Max retries exhausted
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: "FAILED", attempts, lastError: result.error },
      });
      failed++;
    } else {
      // Schedule next retry
      const delayIndex = Math.min(attempts - 1, RETRY_DELAYS.length - 1);
      const nextRetryAt = new Date(Date.now() + RETRY_DELAYS[delayIndex] * 1000);

      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { attempts, lastError: result.error, nextRetryAt },
      });
    }
  }

  return { retried, succeeded, failed };
}
