import cron from "node-cron";
import { checkDeadlines } from "./deadline-checker";
import { processFollowUps } from "./follow-up-sender";
import { retryFailedWebhooks } from "./webhook-retry";

let scheduled = false;

export function startScheduler() {
  if (scheduled) return;
  scheduled = true;

  // Daily at 7:00 AM in the configured timezone (default: Central Time)
  const tz = process.env.CRON_TIMEZONE || "America/Chicago";
  cron.schedule("0 7 * * *", async () => {
    console.log("[CRON] Running deadline check...");
    try {
      const result = await checkDeadlines();
      console.log(
        `[CRON] Done: ${result.checked} checked, ${result.notified} notified, ${result.autoFiled} auto-filed, ${result.errors} errors`
      );
    } catch (err) {
      console.error(
        "[CRON] Deadline check failed:",
        err instanceof Error ? err.message : err
      );
    }
  }, { timezone: tz });

  // Every 15 minutes — process scheduled follow-ups
  cron.schedule("*/15 * * * *", async () => {
    try {
      const result = await processFollowUps();
      if (result.sent > 0) {
        console.log(`[CRON] Follow-ups: ${result.sent} sent, ${result.errors} errors`);
      }
    } catch (err) {
      console.error(
        "[CRON] Follow-up processing failed:",
        err instanceof Error ? err.message : err
      );
    }
  });

  // Every 30 seconds — retry failed webhook deliveries
  cron.schedule("*/30 * * * * *", async () => {
    try {
      await retryFailedWebhooks();
    } catch (err) {
      console.error(
        "[CRON] Webhook retry failed:",
        err instanceof Error ? err.message : err
      );
    }
  });

  console.log(`[CRON] Scheduler started - deadline check at 7 AM ${tz}, follow-ups every 15 min, webhook retries every 30s`);
}
