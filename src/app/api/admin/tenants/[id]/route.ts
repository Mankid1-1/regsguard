import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit-log";
import type { Role } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  supportEmail: z.string().email().optional().nullable(),
  fromEmail: z.string().email().optional().nullable(),
  fromName: z.string().max(100).optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.ADMIN_PANEL);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: parsed.data,
    });

    await logAdminAction(user.id, "tenant.update", `tenant:${id}`, {
      fields: Object.keys(parsed.data),
    });

    return NextResponse.json(tenant);
  } catch {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.ADMIN_PANEL);
  if (denied) return denied;

  const { id } = await params;

  try {
    await prisma.tenant.delete({ where: { id } });

    await logAdminAction(user.id, "tenant.delete", `tenant:${id}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
}
