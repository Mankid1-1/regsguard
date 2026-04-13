import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regulation = await prisma.regulation.findUnique({ where: { id } });
  if (!regulation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(regulation);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_REGULATIONS);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();

  try {
    const regulation = await prisma.regulation.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        trade: body.trade,
        state: body.state,
        authority: body.authority,
        officialEmail: body.officialEmail,
        portalUrl: body.portalUrl,
        fee: body.fee,
        renewalCycle: body.renewalCycle,
        category: body.category,
        defaultDueMonth: body.defaultDueMonth,
        defaultDueDay: body.defaultDueDay,
        notes: body.notes,
        active: body.active,
      },
    });
    return NextResponse.json(regulation);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_REGULATIONS);
  if (denied) return denied;

  const { id } = await params;

  try {
    await prisma.regulation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
