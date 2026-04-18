import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { completeSmartOnboarding, type BusinessProfileData } from "@/lib/smart-onboarding";
import { z } from "zod";
import { validationSchemas } from "@/lib/security";

const onboardingSchema = z.object({
  businessName: validationSchemas.businessName,
  address: validationSchemas.address,
  city: validationSchemas.city,
  state: validationSchemas.state,
  zip: validationSchemas.zip,
  phone: validationSchemas.phone,
  email: validationSchemas.email,
  responsiblePerson: z.string().min(1, "Responsible person is required"),
  licenseNumbers: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await rateLimit(user.id, { limit: 5, windowSec: 300 });
    if (limited) return limited;

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const profileData: BusinessProfileData = {
      businessName: parsed.data.businessName,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      zip: parsed.data.zip,
      phone: parsed.data.phone,
      email: parsed.data.email,
      responsiblePerson: parsed.data.responsiblePerson,
      licenseNumbers: parsed.data.licenseNumbers,
    };

    const result = await completeSmartOnboarding(user.id, profileData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Smart onboarding failed:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
