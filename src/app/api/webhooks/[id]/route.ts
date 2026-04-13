import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

const VALID_EVENTS = [
  "DEADLINE_DUE",
  "DOCUMENT_CREATED",
  "DOCUMENT_SIGNED",
  "COMPLIANCE_FILED",
  "PAYMENT_RECEIVED",
] as const;

const updateWebhookSchema = z.object({
  url: z
    .string()
    .url("Must be a valid URL")
    .refine((u) => u.startsWith("https://"), {
      message: "Webhook URL must use HTTPS",
    })
    .optional(),
  events: z
    .array(z.enum(VALID_EVENTS))
    .min(1, "At least one event is required")
    .optional(),
  active: z.boolean().optional(),
});

async function getOwnedWebhook(id: string, userId: string) {
  const webhook = await prisma.webhook.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!webhook) return { error: "Webhook not found", status: 404 as const };
  if (webhook.userId !== userId)
    return { error: "Forbidden", status: 403 as const };
  return { webhook };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_WEBHOOKS);
  if (denied) return denied;

  const { id } = await params;
  const result = await getOwnedWebhook(id, user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const body = await request.json();
  const parsed = updateWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.webhook.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      url: true,
      events: true,
      active: true,
      lastError: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_WEBHOOKS);
  if (denied) return denied;

  const { id } = await params;
  const result = await getOwnedWebhook(id, user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await prisma.webhook.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
