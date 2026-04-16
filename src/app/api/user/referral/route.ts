import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { getReferralStats, generateReferralCode } from "@/lib/referral";

export async function GET(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let stats = await getReferralStats(user.id);

    // Generate code if doesn't exist
    if (!stats) {
      const code = await generateReferralCode(user.id);
      stats = await getReferralStats(user.id);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
