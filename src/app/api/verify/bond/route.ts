import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { verifyBond } from "@/lib/verification";
import { z } from "zod";

const schema = z.object({
  bondNumber: z.string().min(1, "Bond number is required"),
  surety: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 20, windowSec: 60 });
  if (limited) return limited;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await verifyBond(parsed.data.bondNumber, parsed.data.surety);
  return NextResponse.json(result);
}
