import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applySchema = z.object({
  type: z.enum(["WHITE_LABEL", "REFERRAL", "ASSOCIATION", "ENTERPRISE"]),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
  phone: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = applySchema.parse(body);

    // Check for duplicate application by email + type
    const existing = await prisma.partnerProgram.findFirst({
      where: { contactEmail: data.contactEmail, type: data.type },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An application for this programme type already exists with this email." },
        { status: 409 }
      );
    }

    const program = await prisma.partnerProgram.create({
      data: {
        type: data.type,
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        phone: data.phone || null,
        website: data.website || null,
        notes: data.notes || null,
        status: "PENDING",
        commissionPct: data.type === "REFERRAL" ? 15 : data.type === "ASSOCIATION" ? 10 : 0,
        discountPct: data.type === "ASSOCIATION" ? 20 : data.type === "ENTERPRISE" ? 25 : 0,
      },
    });

    return NextResponse.json({ id: program.id, message: "Application submitted successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Partner apply error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
