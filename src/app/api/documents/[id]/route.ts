import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  data: z.record(z.string(), z.string()).optional(),
  status: z.enum(["DRAFT", "GENERATED", "SENT", "SIGNED", "FILED"]).optional(),
  clientId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.VIEW_DOCUMENTS);
  if (denied) return denied;

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, userId: user.id },
    include: {
      client: { select: { id: true, name: true, companyName: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_DOCUMENTS);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const updates = parsed.data;
    const doc = await prisma.document.update({
      where: { id, userId: user.id },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.data && { data: updates.data }),
        ...(updates.status && { status: updates.status }),
        ...(updates.clientId !== undefined && { clientId: updates.clientId || null }),
        ...(updates.projectId !== undefined && { projectId: updates.projectId || null }),
      },
    });
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_DOCUMENTS);
  if (denied) return denied;

  const { id } = await params;
  try {
    await prisma.document.delete({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
