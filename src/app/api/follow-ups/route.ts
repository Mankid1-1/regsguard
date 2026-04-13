import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.VIEW_CLIENTS);
  if (denied) return denied;

  const followUps = await prisma.scheduledFollowUp.findMany({
    where: { userId: user.id },
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const now = new Date();
  const upcoming = followUps.filter(
    (f) => !f.sentAt && f.scheduledAt > now
  );
  const pending = followUps.filter(
    (f) => !f.sentAt && f.scheduledAt <= now
  );
  const sent = followUps.filter((f) => !!f.sentAt);

  return NextResponse.json({ upcoming, pending, sent });
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_CLIENTS);
  if (denied) return denied;

  const body = await request.json();
  const { projectId, clientEmail, clientPhone, message, scheduledAt, channel } =
    body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  if (!scheduledAt || typeof scheduledAt !== "string") {
    return NextResponse.json(
      { error: "scheduledAt is required (ISO date string)" },
      { status: 400 }
    );
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid scheduledAt date" },
      { status: 400 }
    );
  }

  const validChannels = ["EMAIL", "SMS", "PUSH", "IN_APP"];
  const normalizedChannel = channel?.toUpperCase() || "EMAIL";
  if (!validChannels.includes(normalizedChannel)) {
    return NextResponse.json(
      { error: `channel must be one of: ${validChannels.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify project belongs to user if provided
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

  const followUp = await prisma.scheduledFollowUp.create({
    data: {
      userId: user.id,
      projectId: projectId || null,
      clientEmail: clientEmail || null,
      clientPhone: clientPhone || null,
      message: message.trim(),
      scheduledAt: scheduledDate,
      channel: normalizedChannel as "EMAIL" | "SMS" | "PUSH" | "IN_APP",
    },
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(followUp, { status: 201 });
}
