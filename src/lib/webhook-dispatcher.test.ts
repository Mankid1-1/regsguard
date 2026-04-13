/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    webhook: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    webhookDelivery: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { dispatchWebhook } from "./webhook-dispatcher";
import { prisma } from "@/lib/prisma";

// Cast the mocks for easy access
const mockFindMany = prisma.webhook.findMany as ReturnType<typeof vi.fn>;
const mockWebhookUpdate = prisma.webhook.update as ReturnType<typeof vi.fn>;
const mockDeliveryCreate = (prisma as any).webhookDelivery.create as ReturnType<typeof vi.fn>;
const mockDeliveryUpdate = (prisma as any).webhookDelivery.update as ReturnType<typeof vi.fn>;

describe("dispatchWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeliveryCreate.mockResolvedValue({ id: "del-1" });
    mockDeliveryUpdate.mockResolvedValue({});
    mockWebhookUpdate.mockResolvedValue({});
  });

  it("does nothing when no webhooks are registered", async () => {
    mockFindMany.mockResolvedValue([]);

    await dispatchWebhook("user-1", "DEADLINE_DUE" as any, { foo: "bar" });

    expect(mockFindMany).toHaveBeenCalledOnce();
    expect(mockDeliveryCreate).not.toHaveBeenCalled();
  });

  it("calls fetch with correct headers including HMAC signature", async () => {
    const secret = "test-secret-key";
    const webhookUrl = "https://example.com/webhook";

    mockFindMany.mockResolvedValue([
      {
        id: "wh-1",
        userId: "user-1",
        url: webhookUrl,
        secret,
        active: true,
        events: ["DEADLINE_DUE"],
        lastError: null,
      },
    ]);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("OK"),
    });
    vi.stubGlobal("fetch", mockFetch);

    await dispatchWebhook("user-1", "DEADLINE_DUE" as any, { deadlineId: "d-1" });

    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(webhookUrl);
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers["X-RegsGuard-Event"]).toBe("DEADLINE_DUE");
    expect(options.headers["X-RegsGuard-Signature"]).toBeDefined();
    expect(options.headers["X-RegsGuard-Timestamp"]).toBeDefined();

    // Verify the HMAC signature matches
    const body = options.body;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    expect(options.headers["X-RegsGuard-Signature"]).toBe(expectedSig);

    // Delivery record should be created and marked successful
    expect(mockDeliveryCreate).toHaveBeenCalledOnce();
    expect(mockDeliveryUpdate).toHaveBeenCalledWith({
      where: { id: "del-1" },
      data: { status: "SUCCESS" },
    });

    vi.unstubAllGlobals();
  });

  it("records lastError on delivery failure", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "wh-2",
        userId: "user-1",
        url: "https://example.com/hook",
        secret: "secret",
        active: true,
        events: ["DOCUMENT_CREATED"],
        lastError: null,
      },
    ]);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });
    vi.stubGlobal("fetch", mockFetch);

    await dispatchWebhook("user-1", "DOCUMENT_CREATED" as any, {});

    // Webhook delivery should be updated with error
    expect(mockDeliveryUpdate).toHaveBeenCalledWith({
      where: { id: "del-1" },
      data: expect.objectContaining({
        status: "PENDING",
        lastError: expect.stringContaining("HTTP 500"),
      }),
    });

    // Webhook itself should record lastError
    expect(mockWebhookUpdate).toHaveBeenCalledWith({
      where: { id: "wh-2" },
      data: { lastError: expect.stringContaining("HTTP 500") },
    });

    vi.unstubAllGlobals();
  });

  it("clears lastError on successful delivery", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "wh-3",
        userId: "user-1",
        url: "https://example.com/hook",
        secret: "secret",
        active: true,
        events: ["PAYMENT_RECEIVED"],
        lastError: "previous failure",
      },
    ]);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("OK"),
    });
    vi.stubGlobal("fetch", mockFetch);

    await dispatchWebhook("user-1", "PAYMENT_RECEIVED" as any, {});

    // Should clear lastError on the webhook
    expect(mockWebhookUpdate).toHaveBeenCalledWith({
      where: { id: "wh-3" },
      data: { lastError: null },
    });

    vi.unstubAllGlobals();
  });
});

describe("HMAC signature generation", () => {
  it("produces a valid hex-encoded SHA-256 HMAC", () => {
    const secret = "my-webhook-secret";
    const payload = JSON.stringify({ event: "test", data: { id: 1 } });

    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    // Should be 64 hex characters (256 bits)
    expect(sig).toMatch(/^[a-f0-9]{64}$/);

    // Same input produces same output
    const sig2 = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    expect(sig).toBe(sig2);

    // Different secret produces different output
    const sig3 = crypto.createHmac("sha256", "different-secret").update(payload).digest("hex");
    expect(sig).not.toBe(sig3);
  });
});
