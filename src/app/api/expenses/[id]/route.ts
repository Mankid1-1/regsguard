import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  projectId: z.string().optional().nullable(),
  category: z
    .enum([
      "MATERIALS",
      "LABOR",
      "PERMITS",
      "INSURANCE",
      "EQUIPMENT",
      "FUEL",
      "OFFICE",
      "OTHER",
    ])
    .optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  date: z.string().optional(),
  receiptUrl: z.string().optional().nullable(),
});

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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_EXPENSES);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Verify ownership
  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;

  // Validate projectId if provided
  if (data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId: user.id },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(data.projectId !== undefined && {
        projectId: data.projectId || null,
      }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
      ...(data.vendor !== undefined && { vendor: data.vendor || null }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.receiptUrl !== undefined && {
        receiptUrl: data.receiptUrl || null,
      }),
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(expense);
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

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_EXPENSES);
  if (denied) return denied;

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
