import { processWebhookRetries } from "@/lib/webhook-dispatcher";
import { logger } from "@/lib/logger";

/**
 * Cron handler for webhook retry processing.
 * Called every 30 seconds by the scheduler.
 */
export async function retryFailedWebhooks(): Promise<void> {
  try {
    const result = await processWebhookRetries();
    if (result.retried > 0) {
      logger.info("Webhook retries processed", result);
    }
  } catch (err) {
    logger.error("Webhook retry processing failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
