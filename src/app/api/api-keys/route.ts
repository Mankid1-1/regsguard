import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import crypto from "crypto";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(64),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_API_KEYS);
  if (denied) return denied;

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      expiresAt: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_API_KEYS);
  if (denied) return denied;

  const body = await request.json();
  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, expiresAt } = parsed.data;

  // Generate the raw API key
  const rawKey = `rg_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = rawKey.substring(0, 8);
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      keyHash,
      prefix,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    select: {
      id: true,
      name: true,
      prefix: true,
      expiresAt: true,
      active: true,
      createdAt: true,
    },
  });

  // Return the full key ONCE — it cannot be retrieved again
  return NextResponse.json(
    { ...apiKey, key: rawKey },
    { status: 201 }
  );
}
