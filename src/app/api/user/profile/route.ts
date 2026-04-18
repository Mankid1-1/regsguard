import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { businessProfileSchema } from "@/lib/validators/profile";

export async function GET() {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = businessProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    // Build the data object for Prisma, handling optional date fields
    const profileData: Record<string, unknown> = {
      businessName: data.businessName,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      responsiblePerson: data.responsiblePerson,
      licenseNumbers: data.licenseNumbers ?? {},
      insuranceProvider: data.insuranceProvider || null,
      insurancePolicyNumber: data.insurancePolicyNumber || null,
      insuranceExpiration: data.insuranceExpiration
        ? new Date(data.insuranceExpiration)
        : null,
      bondAmount: data.bondAmount || null,
      bondProvider: data.bondProvider || null,
      bondExpiration: data.bondExpiration
        ? new Date(data.bondExpiration)
        : null,
      logoUrl: data.logoUrl || null,
      brandPrimaryColor: data.brandPrimaryColor || null,
      brandSecondaryColor: data.brandSecondaryColor || null,
      brandFooter: data.brandFooter || null,
    };

    const profile = await prisma.businessProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      } as never,
    });

    // Log the profile update
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        action: "PROFILE_UPDATED",
        details: { fields: Object.keys(data) },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
