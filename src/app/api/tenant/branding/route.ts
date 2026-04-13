import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .optional(),
  logoUrl: z.string().url().optional().nullable(),
  fromEmail: z.string().email().optional().nullable(),
  fromName: z.string().optional().nullable(),
});

export async function GET() {
  const authUser = await getDbUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find user's tenant
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { tenantId: true, role: true },
  });

  if (!user?.tenantId) {
    return NextResponse.json({ error: "No tenant associated" }, { status: 404 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      logoUrl: true,
      fromEmail: true,
      fromName: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json(tenant);
}

export async function PUT(request: NextRequest) {
  const authUser = await getDbUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(authUser.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(authUser.role as Role, PERMISSIONS.MANAGE_SETTINGS);
  if (denied) return denied;

  // Check role -- only ADMIN or OWNER can update branding
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { tenantId: true, role: true },
  });

  if (!user?.tenantId) {
    return NextResponse.json({ error: "No tenant associated" }, { status: 404 });
  }

  if (user.role !== "ADMIN" && user.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only ADMIN or OWNER roles can update branding" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const tenant = await prisma.tenant.update({
    where: { id: user.tenantId },
    data: {
      ...(data.primaryColor !== undefined && {
        primaryColor: data.primaryColor,
      }),
      ...(data.logoUrl !== undefined && {
        logoUrl: data.logoUrl || null,
      }),
      ...(data.fromEmail !== undefined && {
        fromEmail: data.fromEmail || null,
      }),
      ...(data.fromName !== undefined && {
        fromName: data.fromName || null,
      }),
    },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      logoUrl: true,
      fromEmail: true,
      fromName: true,
    },
  });

  return NextResponse.json(tenant);
}
