import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Authenticate an incoming API request using a bearer token.
 *
 * Expected header format:  Authorization: Bearer rg_xxxxx
 *
 * The raw key is hashed with SHA-256 and looked up in the ApiKey table.
 * Returns the owning userId when valid, or null otherwise.
 */
export async function authenticateApiKey(
  request: Request
): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  const rawKey = parts[1];
  if (!rawKey.startsWith("rg_")) return null;

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      active: true,
      expiresAt: true,
    },
  });

  if (!apiKey) return null;

  // Must be active
  if (!apiKey.active) return null;

  // Must not be expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update lastUsedAt (fire-and-forget — don't block the response)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      /* swallow — non-critical */
    });

  return { userId: apiKey.userId };
}
