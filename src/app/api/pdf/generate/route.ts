import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCompliancePdf } from "@/lib/pdf/generate-pdf";

export async function POST(request: NextRequest) {
  try {
    const user = await getDbUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { regulationId } = body;

    if (!regulationId || typeof regulationId !== "string") {
      return NextResponse.json(
        { error: "regulationId is required" },
        { status: 400 }
      );
    }

    // Verify the user has this regulation
    const userRegulation = await prisma.userRegulation.findUnique({
      where: {
        userId_regulationId: {
          userId: user.id,
          regulationId,
        },
      },
    });

    if (!userRegulation) {
      return NextResponse.json(
        { error: "Regulation not found or not assigned to your account" },
        { status: 404 }
      );
    }

    const { buffer, filename } = await generateCompliancePdf(
      regulationId,
      user.id
    );

    // Log to ComplianceLog
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        regulationId,
        action: "PDF_GENERATED",
        details: { filename, generatedAt: new Date().toISOString() },
      },
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("[PDF] Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
