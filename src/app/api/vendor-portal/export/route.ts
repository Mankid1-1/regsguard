import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportForPortal, toCsv, type PortalSlug } from "@/lib/vendor-portals";

const VALID_PORTALS: PortalSlug[] = ["isnetworld", "avetta", "veriforce", "browz", "complyworks", "json", "csv"];

export async function GET(request: NextRequest) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portal = (request.nextUrl.searchParams.get("portal") ?? "json") as PortalSlug;
  if (!VALID_PORTALS.includes(portal)) {
    return NextResponse.json(
      { error: `Invalid portal. Must be one of: ${VALID_PORTALS.join(", ")}` },
      { status: 400 }
    );
  }

  const profile = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json(
      { error: "Complete your business profile first" },
      { status: 400 }
    );
  }

  const exported = exportForPortal(profile, portal);
  const wantsCsv = portal === "csv" || request.nextUrl.searchParams.get("format") === "csv";

  if (wantsCsv) {
    const csv = toCsv(exported);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="regsguard-${portal}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json(exported);
}
