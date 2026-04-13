import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_API_KEYS);
  if (denied) return denied;

  const { id } = await params;

  // Find the key and verify ownership
  const apiKey = await prisma.apiKey.findUnique({
    where: { id },
    select: { id: true, userId: true, active: true },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  if (apiKey.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!apiKey.active) {
    return NextResponse.json({ error: "API key already revoked" }, { status: 400 });
  }

  // Soft-delete: deactivate the key rather than removing the row
  await prisma.apiKey.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
