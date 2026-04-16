import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const testimonialSchema = z.object({
  quote: z.string().min(20, "Quote must be at least 20 characters").max(500),
  role: z.string().min(3, "Role required (e.g., 'Master Plumber')"),
  location: z.string().min(3, "Location required (e.g., 'Minneapolis, MN')"),
});

/**
 * Collect testimonials from real users (post-signup, real data only)
 */
export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = testimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    // Check if testimonial already exists for this user
    const existing = await prisma.userTestimonial.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      // Update existing testimonial
      await prisma.userTestimonial.update({
        where: { userId: user.id },
        data: {
          quote: parsed.data.quote,
          role: parsed.data.role,
          location: parsed.data.location,
          approved: false, // Re-require approval on change
        },
      });
    } else {
      // Create new testimonial
      await prisma.userTestimonial.create({
        data: {
          userId: user.id,
          quote: parsed.data.quote,
          role: parsed.data.role,
          location: parsed.data.location,
          avatarUrl: user.image || undefined,
          approved: false,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Thank you! Your testimonial is under review." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving testimonial:", error);
    return NextResponse.json(
      { error: "Failed to save testimonial" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get approved, featured testimonials for homepage
    const testimonials = await prisma.userTestimonial.findMany({
      where: {
        approved: true,
        featured: true,
      },
      select: {
        quote: true,
        role: true,
        location: true,
        avatarUrl: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
