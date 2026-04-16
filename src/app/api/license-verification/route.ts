import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { verifyLicense, verifyLicensesBatch, getVerificationConfiguration } from "@/lib/license-verification";
import { z } from "zod";

const verifySchema = z.object({
  state: z.enum(["MN", "WI"], "State must be MN or WI"),
  trade: z.enum(["CONTRACTOR", "ELECTRICAL", "PLUMBING", "HVAC"], "Trade is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseType: z.string().optional(),
});

const batchVerifySchema = z.object({
  licenses: z.array(verifySchema).min(1, "At least one license is required"),
});

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 20, windowSec: 60 });
  if (limited) return limited;

  const body = await request.json();
  
  // Check if this is a batch request
  if (body.licenses && Array.isArray(body.licenses)) {
    const parsed = batchVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { licenses } = parsed.data;
    const results = await verifyLicensesBatch(licenses);

    // Log verification attempts
    await Promise.all(
      licenses.map(license => 
        prisma.complianceLog.create({
          data: {
            userId: user.id,
            action: "LICENSE_VERIFICATION",
            details: {
              licenseNumber: license.licenseNumber,
              state: license.state,
              trade: license.trade,
              batch: true,
            },
          },
        }).catch(() => {}) // Ignore logging errors
      )
    );

    return NextResponse.json(results);
  }

  // Single license verification
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { state, trade, licenseNumber, licenseType } = parsed.data;
  
  const result = await verifyLicense({
    state,
    trade,
    licenseNumber,
    licenseType,
  });

  // Log verification attempt
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      action: "LICENSE_VERIFICATION",
      details: {
        licenseNumber,
        state,
        trade,
        licenseType,
        success: result.success,
        mode: result.mode,
      },
    },
  }).catch(() => {}); // Ignore logging errors

  return NextResponse.json({
    ...result,
    trade,
    state,
    licenseNumber,
  });
}

export async function GET() {
  // Return verification configuration status
  const config = getVerificationConfiguration();
  
  return NextResponse.json({
    configuration: config,
    supportedStates: ["MN", "WI"],
    supportedTrades: ["CONTRACTOR", "ELECTRICAL", "PLUMBING", "HVAC"],
  });
}
