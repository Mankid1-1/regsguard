import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

const regulationSchema = z.object({
  trade: z.string(),
  state: z.string().length(2),
  title: z.string().min(1),
  description: z.string(),
  authority: z.string(),
  officialEmail: z.string().email().optional().nullable(),
  portalUrl: z.string().url().optional().nullable(),
  fee: z.string().optional().nullable(),
  renewalCycle: z.enum(["ANNUAL", "BIENNIAL", "TRIENNIAL", "FIVE_YEAR", "ONE_TIME", "VARIES"]),
  category: z.enum(["LICENSE_RENEWAL", "CONTINUING_EDUCATION", "INSURANCE", "BONDING", "EPA_CERTIFICATION", "SAFETY_TRAINING", "PERMIT", "REGISTRATION"]),
  defaultDueMonth: z.number().int().min(1).max(12).optional().nullable(),
  defaultDueDay: z.number().int().min(1).max(31).optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  // Only ADMIN and OWNER can create regulations
  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_REGULATIONS);
  if (denied) return denied;

  const body = await request.json();
  const parsed = regulationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const regulation = await prisma.regulation.create({
      data: {
        trade: parsed.data.trade as never,
        state: parsed.data.state,
        title: parsed.data.title,
        description: parsed.data.description,
        authority: parsed.data.authority,
        officialEmail: parsed.data.officialEmail || null,
        portalUrl: parsed.data.portalUrl || null,
        fee: parsed.data.fee || null,
        renewalCycle: parsed.data.renewalCycle as never,
        category: parsed.data.category as never,
        defaultDueMonth: parsed.data.defaultDueMonth || null,
        defaultDueDay: parsed.data.defaultDueDay || null,
        notes: parsed.data.notes || null,
        active: parsed.data.active,
      },
    });

    // Log the action
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        regulationId: regulation.id,
        action: "REGULATION_ADDED",
        details: { title: regulation.title, trade: regulation.trade, state: regulation.state },
      },
    });

    return NextResponse.json(regulation, { status: 201 });
  } catch (error) {
    console.error("Error creating regulation:", error);
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return NextResponse.json(
        { error: "Regulation already exists for this trade/state/title combination" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create regulation" },
      { status: 500 }
    );
  }
}
