import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRegulations = await prisma.userRegulation.findMany({
      where: { userId: user.id },
      include: { regulation: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(userRegulations);
  } catch (error) {
    console.error("Error fetching user regulations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user regulations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { regulationIds } = body as { regulationIds: string[] };

    if (!Array.isArray(regulationIds) || regulationIds.length === 0) {
      return NextResponse.json(
        { error: "regulationIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Verify all regulations exist
    const regulations = await prisma.regulation.findMany({
      where: { id: { in: regulationIds }, active: true },
    });

    if (regulations.length !== regulationIds.length) {
      return NextResponse.json(
        { error: "One or more regulations not found or inactive" },
        { status: 400 }
      );
    }

    // Delete existing user regulations and deadlines, then recreate
    await prisma.$transaction(async (tx) => {
      // Remove old selections
      await tx.userDeadline.deleteMany({
        where: { userId: user.id },
      });
      await tx.userRegulation.deleteMany({
        where: { userId: user.id },
      });

      // Create new UserRegulation records
      await tx.userRegulation.createMany({
        data: regulationIds.map((regulationId) => ({
          userId: user.id,
          regulationId,
        })),
      });

      // Create initial UserDeadline records
      const now = new Date();
      const deadlineData = regulations.map((reg) => {
        // Calculate next due date based on defaultDueMonth/Day or fallback to end of year
        let nextDueDate: Date;
        if (reg.defaultDueMonth && reg.defaultDueDay) {
          nextDueDate = new Date(
            now.getFullYear(),
            reg.defaultDueMonth - 1,
            reg.defaultDueDay
          );
          // If the date has already passed this year, push to next year
          if (nextDueDate <= now) {
            nextDueDate = new Date(
              now.getFullYear() + 1,
              reg.defaultDueMonth - 1,
              reg.defaultDueDay
            );
          }
        } else {
          // Default to Dec 31 of this year, or next year if past
          nextDueDate = new Date(now.getFullYear(), 11, 31);
          if (nextDueDate <= now) {
            nextDueDate = new Date(now.getFullYear() + 1, 11, 31);
          }
        }

        return {
          userId: user.id,
          regulationId: reg.id,
          nextDueDate,
          status: "UPCOMING" as const,
        };
      });

      await tx.userDeadline.createMany({ data: deadlineData });

      // Log each regulation addition
      for (const reg of regulations) {
        await tx.complianceLog.create({
          data: {
            userId: user.id,
            regulationId: reg.id,
            action: "REGULATION_ADDED",
            details: { title: reg.title, trade: reg.trade, state: reg.state },
          },
        });
      }

      // Mark onboarding as complete
      await tx.user.update({
        where: { id: user.id },
        data: { onboardingComplete: true },
      });

      // Auto-create deadlines for insurance/bond expirations from profile
      const profile = await tx.businessProfile.findUnique({
        where: { userId: user.id },
      });

      if (profile?.insuranceExpiration) {
        const insDate = new Date(profile.insuranceExpiration);
        if (insDate > now) {
          await tx.complianceLog.create({
            data: {
              userId: user.id,
              action: "DEADLINE_CREATED",
              details: {
                type: "INSURANCE_EXPIRATION",
                expirationDate: insDate.toISOString(),
                provider: profile.insuranceProvider,
                autoCreated: true,
              },
            },
          });
        }
      }

      if (profile?.bondExpiration) {
        const bondDate = new Date(profile.bondExpiration);
        if (bondDate > now) {
          await tx.complianceLog.create({
            data: {
              userId: user.id,
              action: "DEADLINE_CREATED",
              details: {
                type: "BOND_EXPIRATION",
                expirationDate: bondDate.toISOString(),
                provider: profile.bondProvider,
                autoCreated: true,
              },
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true, count: regulationIds.length });
  } catch (error) {
    console.error("Error saving user regulations:", error);
    return NextResponse.json(
      { error: "Failed to save user regulations" },
      { status: 500 }
    );
  }
}
