import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the logger to suppress console output during tests
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks are set up
import { sendSms } from "./sms";

describe("sendSms", () => {
  beforeEach(() => {
    // Clear Twilio env vars so we get stub behavior
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  it("returns success with stub when Twilio is not configured", async () => {
    const result = await sendSms({ to: "5551234567", body: "Hello" });
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(result.messageId!.startsWith("stub_")).toBe(true);
  });

  it("formats 10-digit US phone number to E.164", async () => {
    // We spy on console.log to capture the dev stub output
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendSms({ to: "(555) 123-4567", body: "Test" });

    // The stub logs the cleaned E.164 number
    expect(consoleSpy).toHaveBeenCalledWith(
      "[SMS-DEV]",
      expect.objectContaining({ to: "+15551234567" })
    );

    consoleSpy.mockRestore();
  });

  it("formats an already-prefixed international number", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendSms({ to: "+44 7911 123456", body: "Test" });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[SMS-DEV]",
      expect.objectContaining({ to: "+447911123456" })
    );

    consoleSpy.mockRestore();
  });
});
