import puppeteer, { Browser, Page } from "puppeteer";
import { logger } from "@/lib/logger";

let browser: Browser | null = null;
const MAX_RETRIES = 2;

async function launchBrowser(): Promise<Browser> {
  const b = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  b.on("disconnected", () => {
    browser = null;
  });
  return b;
}

export async function getBrowser(): Promise<Browser> {
  if (browser && browser.connected) return browser;
  browser = await launchBrowser();
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Execute a function with a Puppeteer page, handling acquisition,
 * cleanup, and automatic retry on browser crashes.
 *
 * Retries up to MAX_RETRIES times with a fresh browser instance
 * if the page creation or function execution fails due to a
 * browser disconnect.
 */
export async function withPage<T>(
  fn: (page: Page) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let page: Page | null = null;
    try {
      const b = await getBrowser();
      page = await b.newPage();
      const result = await fn(page);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // If browser disconnected, force a fresh launch on retry
      if (
        lastError.message.includes("disconnected") ||
        lastError.message.includes("closed") ||
        lastError.message.includes("Target closed") ||
        lastError.message.includes("Protocol error")
      ) {
        browser = null;
        logger.warn("Browser crashed, retrying with fresh instance", {
          attempt: attempt + 1,
          error: lastError.message,
        });
        continue;
      }

      // Non-browser error — don't retry
      throw lastError;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  throw lastError ?? new Error("PDF generation failed after retries");
}
