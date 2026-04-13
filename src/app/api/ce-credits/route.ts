import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePaginationParams, buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";

const createSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  provider: z.string().optional().nullable(),
  hours: z.number().positive("Hours must be positive"),
  completedAt: z.string().min(1, "Completion date is required"),
  regulationId: z.string().optional().nullable(),
  certificateUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const regulationId = searchParams.get("regulationId");
  const { cursor, take } = parsePaginationParams(searchParams);

  const where: Record<string, unknown> = { userId: user.id };
  if (regulationId) {
    where.regulationId = regulationId;
  }

  const [credits, totalHoursResult] = await Promise.all([
    prisma.cECredit.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
      orderBy: { completedAt: "desc" },
    }),
    prisma.cECredit.aggregate({
      where,
      _sum: { hours: true },
    }),
  ]);

  const paginated = buildPaginatedResponse(credits, take);

  return NextResponse.json({
    ...paginated,
    totalHours: totalHoursResult._sum.hours ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Validate regulationId if provided
  if (data.regulationId) {
    const regulation = await prisma.regulation.findUnique({
      where: { id: data.regulationId },
    });
    if (!regulation) {
      return NextResponse.json(
        { error: "Regulation not found" },
        { status: 404 }
      );
    }
  }

  const credit = await prisma.cECredit.create({
    data: {
      userId: user.id,
      courseName: data.courseName,
      provider: data.provider || null,
      hours: data.hours,
      completedAt: new Date(data.completedAt),
      regulationId: data.regulationId || null,
      certificateUrl: data.certificateUrl || null,
      notes: data.notes || null,
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

  // Log the CE credit completion
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      regulationId: data.regulationId || null,
      action: "CE_COMPLETED",
      details: {
        courseName: data.courseName,
        hours: data.hours,
        provider: data.provider || null,
      },
    },
  });

  return NextResponse.json(credit, { status: 201 });
}
