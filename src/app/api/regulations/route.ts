import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const tradesParam = searchParams.get("trades");
    const statesParam = searchParams.get("states");

    const trades = tradesParam
      ? tradesParam.split(",").filter(Boolean)
      : undefined;
    const states = statesParam
      ? statesParam.split(",").filter(Boolean)
      : undefined;

    const where: Record<string, unknown> = {
      active: true,
    };

    if (trades && trades.length > 0) {
      where.trade = { in: trades };
    }

    if (states && states.length > 0) {
      where.state = { in: states };
    }

    // Cache regulation lists for 10 minutes (reference data)
    const cacheKey = `regulations:${tradesParam || "all"}:${statesParam || "all"}`;
    const regulations = await cache.get(cacheKey, 600, () =>
      prisma.regulation.findMany({
        where,
        orderBy: [{ trade: "asc" }, { category: "asc" }, { title: "asc" }],
      })
    );

    return NextResponse.json(regulations);
  } catch (error) {
    console.error("Error fetching regulations:", error);
    return NextResponse.json(
      { error: "Failed to fetch regulations" },
      { status: 500 }
    );
  }
}
