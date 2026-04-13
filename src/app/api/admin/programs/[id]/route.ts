import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit-log";
import type { Role } from "@prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // If activating a WHITE_LABEL program, auto-create a tenant if none exists
  if (body.status === "ACTIVE" && body.type === "WHITE_LABEL" && !body.tenantId) {
    const program = await prisma.partnerProgram.findUnique({ where: { id } });
    if (program && !program.tenantId) {
      const slug = program.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const tenant = await prisma.tenant.create({
        data: {
          name: program.companyName,
          slug,
          supportEmail: program.contactEmail,
        },
      });
      body.tenantId = tenant.id;
    }
  }

  // Generate referral code if activating a REFERRAL program without one
  if (body.status === "ACTIVE" && !body.referralCode) {
    const program = await prisma.partnerProgram.findUnique({ where: { id } });
    if (program && !program.referralCode && (program.type === "REFERRAL" || program.type === "ASSOCIATION")) {
      body.referralCode = program.companyName
        .substring(0, 6)
        .toUpperCase()
        .replace(/[^A-Z]/g, "") + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
  }

  const updated = await prisma.partnerProgram.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.companyName && { companyName: body.companyName }),
      ...(body.contactName && { contactName: body.contactName }),
      ...(body.contactEmail && { contactEmail: body.contactEmail }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.website !== undefined && { website: body.website || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.referralCode !== undefined && { referralCode: body.referralCode || null }),
      ...(body.commissionPct !== undefined && { commissionPct: body.commissionPct }),
      ...(body.discountPct !== undefined && { discountPct: body.discountPct }),
      ...(body.tenantId !== undefined && { tenantId: body.tenantId || null }),
    },
  });

  await logAdminAction(user.id, "program.update", `program:${id}`, {
    status: updated.status,
    type: updated.type,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.ADMIN_PANEL);
  if (denied) return denied;

  const { id } = await params;
  await prisma.partnerProgram.delete({ where: { id } });

  await logAdminAction(user.id, "program.delete", `program:${id}`);

  return NextResponse.json({ ok: true });
}
