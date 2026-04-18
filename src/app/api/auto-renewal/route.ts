import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { processAutoRenewals, enableAutoRenewal, getAutoRenewalStatus } from "@/lib/auto-renewal";
import { z } from "zod";

const enableRenewalSchema = z.object({
  regulationId: z.string(),
  autoPay: z.boolean().optional(),
  paymentMethodId: z.string().optional(),
  digitalSignature: z.record(z.string(), z.any()).optional(),
});

// GET: Get auto-renewal status for user
export async function GET(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getAutoRenewalStatus(user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching auto-renewal status:", error);
    return NextResponse.json(
      { error: "Failed to fetch auto-renewal status" },
      { status: 500 }
    );
  }
}

// POST: Enable auto-renewal for a regulation
export async function POST(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await rateLimit(user.id, { limit: 5, windowSec: 60 });
    if (limited) return limited;

    const body = await request.json();
    const parsed = enableRenewalSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Verify user has this regulation
    const hasRegulation = await prisma.userRegulation.findFirst({
      where: {
        userId: user.id,
        regulationId: parsed.data.regulationId,
      },
    });

    if (!hasRegulation) {
      return NextResponse.json(
        { error: "Regulation not found for this user" },
        { status: 404 }
      );
    }

    const config = await enableAutoRenewal(user.id, parsed.data.regulationId, {
      autoPay: parsed.data.autoPay,
      paymentMethodId: parsed.data.paymentMethodId,
      digitalSignature: parsed.data.digitalSignature,
    });

    // Log the action
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        regulationId: parsed.data.regulationId,
        action: "AUTO_RENEWAL_ENABLED",
        details: { configId: config.id, enabled: true },
      },
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error("Error enabling auto-renewal:", error);
    return NextResponse.json(
      { error: "Failed to enable auto-renewal" },
      { status: 500 }
    );
  }
}
