import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRegulations = await prisma.userRegulation.findMany({
    where: { userId: user.id },
    include: {
      regulation: {
        select: {
          id: true,
          title: true,
          trade: true,
          state: true,
          fee: true,
          renewalCycle: true,
          authority: true,
          portalUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(userRegulations);
}
