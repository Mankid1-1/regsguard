import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

const addMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["FIELD_WORKER", "MANAGER", "BOOKKEEPER"]),
});

export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.VIEW_TEAM);
  if (denied) return denied;

  const members = await prisma.teamMember.findMany({
    where: { ownerId: user.id },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_TEAM);
  if (denied) return denied;

  const body = await request.json();
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, role } = parsed.data;

  // Cannot add yourself
  if (email === user.email) {
    return NextResponse.json(
      { error: "You cannot add yourself as a team member" },
      { status: 400 }
    );
  }

  // Look up or create the user
  let memberUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!memberUser) {
    // Create a placeholder user record for invited team member
    // clerkId will be set when they sign up via Clerk
    memberUser = await prisma.user.create({
      data: {
        clerkId: `invite_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        email,
        name: email.split("@")[0],
        role: role as "FIELD_WORKER" | "MANAGER" | "BOOKKEEPER",
      },
    });
  }

  // Check if already a team member
  const existing = await prisma.teamMember.findUnique({
    where: {
      ownerId_memberId: {
        ownerId: user.id,
        memberId: memberUser.id,
      },
    },
  });

  if (existing) {
    if (existing.active) {
      return NextResponse.json(
        { error: "This person is already on your team" },
        { status: 409 }
      );
    }
    // Re-activate a previously removed member
    const reactivated = await prisma.teamMember.update({
      where: { id: existing.id },
      data: { active: true, role: role as "FIELD_WORKER" | "MANAGER" | "BOOKKEEPER" },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
    return NextResponse.json(reactivated, { status: 200 });
  }

  const teamMember = await prisma.teamMember.create({
    data: {
      ownerId: user.id,
      memberId: memberUser.id,
      role: role as "FIELD_WORKER" | "MANAGER" | "BOOKKEEPER",
    },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json(teamMember, { status: 201 });
}
