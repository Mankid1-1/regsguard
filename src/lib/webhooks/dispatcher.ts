import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { WebhookEvent } from "@prisma/client";

/**
 * Dispatch a webhook event to all active subscriptions for the given user.
 *
 * This is fire-and-forget: callers should NOT await the returned promise in
 * request-critical paths. Errors are caught per-webhook and stored in lastError.
 */
export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      userId,
      active: true,
      events: { has: event },
    },
    select: {
      id: true,
      url: true,
      secret: true,
    },
  });

  if (webhooks.length === 0) return;

  const body = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const deliveries = webhooks.map(async (wh) => {
    try {
      const signature = crypto
        .createHmac("sha256", wh.secret)
        .update(body)
        .digest("hex");

      const response = await fetch(wh.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature-256": `sha256=${signature}`,
          "X-Webhook-Event": event,
        },
        body,
        signal: AbortSignal.timeout(10_000), // 10-second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Clear any previous error on success
      await prisma.webhook.update({
        where: { id: wh.id },
        data: { lastError: null },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown delivery error";

      await prisma.webhook
        .update({
          where: { id: wh.id },
          data: { lastError: `${new Date().toISOString()}: ${message}` },
        })
        .catch(() => {
          /* swallow — non-critical */
        });
    }
  });

  // Fire-and-forget: run all deliveries concurrently but don't let failures
  // propagate to the caller.
  Promise.allSettled(deliveries).catch(() => {});
}
