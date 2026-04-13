import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import { parsePaginationParams, buildPaginatedResponse } from "@/lib/pagination";
import type { Role } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  projectId: z.string().optional().nullable(),
  category: z.enum([
    "MATERIALS",
    "LABOR",
    "PERMITS",
    "INSURANCE",
    "EQUIPMENT",
    "FUEL",
    "OFFICE",
    "OTHER",
  ]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  receiptUrl: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.VIEW_EXPENSES);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const category = searchParams.get("category");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = { userId: user.id };

  if (projectId) {
    where.projectId = projectId;
  }
  if (category) {
    where.category = category;
  }
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    where.date = dateFilter;
  }

  const { cursor, take } = parsePaginationParams(searchParams);

  const [expenses, aggregation] = await Promise.all([
    prisma.expense.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where,
      _sum: { amount: true },
    }),
  ]);

  const paginated = buildPaginatedResponse(expenses, take);
  const byCategory: Record<string, number> = {};
  let totalAmount = 0;
  for (const group of aggregation) {
    const amt = group._sum.amount ?? 0;
    byCategory[group.category] = amt;
    totalAmount += amt;
  }

  return NextResponse.json({ ...paginated, totalAmount, byCategory });
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_EXPENSES);
  if (denied) return denied;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
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

  const expense = await prisma.expense.create({
    data: {
      userId: user.id,
      projectId: data.projectId || null,
      category: data.category,
      amount: data.amount,
      description: data.description || null,
      vendor: data.vendor || null,
      date: new Date(data.date),
      receiptUrl: data.receiptUrl || null,
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

  return NextResponse.json(expense, { status: 201 });
}
