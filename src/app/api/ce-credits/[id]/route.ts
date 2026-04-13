import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  courseName: z.string().min(1).optional(),
  provider: z.string().optional().nullable(),
  hours: z.number().positive().optional(),
  completedAt: z.string().optional(),
  regulationId: z.string().optional().nullable(),
  certificateUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const existing = await prisma.cECredit.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;

  const credit = await prisma.cECredit.update({
    where: { id },
    data: {
      ...(data.courseName !== undefined && { courseName: data.courseName }),
      ...(data.provider !== undefined && { provider: data.provider || null }),
      ...(data.hours !== undefined && { hours: data.hours }),
      ...(data.completedAt !== undefined && {
        completedAt: new Date(data.completedAt),
      }),
      ...(data.regulationId !== undefined && {
        regulationId: data.regulationId || null,
      }),
      ...(data.certificateUrl !== undefined && {
        certificateUrl: data.certificateUrl || null,
      }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
    include: {
      regulation: {
        select: {
          id: true,
          title: true,
          trade: true,
          state: true,
          category: true,
        },
      },
    },
  });

  return NextResponse.json(credit);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.cECredit.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.cECredit.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
