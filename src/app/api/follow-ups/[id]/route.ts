import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_CLIENTS);
  if (denied) return denied;

  const { id } = await params;

  // Verify the follow-up belongs to this user
  const existing = await prisma.scheduledFollowUp.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Follow-up not found" },
      { status: 404 }
    );
  }

  if (existing.sentAt) {
    return NextResponse.json(
      { error: "Cannot edit a follow-up that has already been sent" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { message, scheduledAt, channel, clientEmail, clientPhone, projectId } =
    body;

  const updateData: Record<string, unknown> = {};

  if (message !== undefined) {
    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "message cannot be empty" },
        { status: 400 }
      );
    }
    updateData.message = message.trim();
  }

  if (scheduledAt !== undefined) {
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledAt date" },
        { status: 400 }
      );
    }
    updateData.scheduledAt = date;
  }

  if (channel !== undefined) {
    const validChannels = ["EMAIL", "SMS", "PUSH", "IN_APP"];
    const normalized = channel.toUpperCase();
    if (!validChannels.includes(normalized)) {
      return NextResponse.json(
        { error: `channel must be one of: ${validChannels.join(", ")}` },
        { status: 400 }
      );
    }
    updateData.channel = normalized;
  }

  if (clientEmail !== undefined) updateData.clientEmail = clientEmail || null;
  if (clientPhone !== undefined) updateData.clientPhone = clientPhone || null;
  if (projectId !== undefined) {
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }
    updateData.projectId = projectId || null;
  }

  const updated = await prisma.scheduledFollowUp.update({
    where: { id },
    data: updateData,
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_CLIENTS);
  if (denied) return denied;

  const { id } = await params;

  const existing = await prisma.scheduledFollowUp.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Follow-up not found" },
      { status: 404 }
    );
  }

  await prisma.scheduledFollowUp.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
