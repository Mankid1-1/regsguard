import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { verifyLicense } from "@/lib/verification";
import { z } from "zod";

const verifySchema = z.object({
  state: z.string().length(2, "State must be a 2-letter code"),
  trade: z.string().min(1, "Trade is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 20, windowSec: 60 });
  if (limited) return limited;

  const body = await request.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { state, trade, licenseNumber } = parsed.data;
  const result = await verifyLicense(state, trade, licenseNumber);

  return NextResponse.json({
    ...result,
    trade,
    state,
    licenseNumber,
  });
}
