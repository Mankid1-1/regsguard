import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit-log";
import type { Role } from "@prisma/client";

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.ADMIN_PANEL);
  if (denied) return denied;

  const programs = await prisma.partnerProgram.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      _count: { select: { referrals: true } },
    },
  });

  return NextResponse.json(programs);
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.ADMIN_PANEL);
  if (denied) return denied;

  const body = await request.json();

  const program = await prisma.partnerProgram.create({
    data: {
      type: body.type,
      status: body.status || "PENDING",
      companyName: body.companyName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      phone: body.phone || null,
      website: body.website || null,
      notes: body.notes || null,
      referralCode: body.referralCode || null,
      commissionPct: body.commissionPct ?? 0,
      discountPct: body.discountPct ?? 0,
      tenantId: body.tenantId || null,
    },
  });

  await logAdminAction(user.id, "program.create", `program:${program.id}`, {
    type: program.type,
    companyName: program.companyName,
  });

  return NextResponse.json(program, { status: 201 });
}
