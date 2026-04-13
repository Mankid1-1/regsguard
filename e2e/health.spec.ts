import { test, expect } from "@playwright/test";

test.describe("Health Check", () => {
  test("returns ok status with database check", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.checks.database).toBeDefined();
    expect(body.checks.database.status).toBe("ok");
    expect(body.uptime).toBeGreaterThan(0);
    expect(body.memory).toBeDefined();
  });
});

test.describe("Landing Page", () => {
  test("loads and has key content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/RegsGuard/i);
  });
});

test.describe("Regulations API", () => {
  test("returns regulations list", async ({ request }) => {
    const response = await request.get("/api/regulations");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("filters by trade", async ({ request }) => {
    const response = await request.get("/api/regulations?trades=PLUMBING");
    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const reg of body) {
      expect(reg.trade).toBe("PLUMBING");
    }
  });
});
