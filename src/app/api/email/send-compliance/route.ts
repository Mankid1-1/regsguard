import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCompliancePdf } from "@/lib/pdf/generate-pdf";
import { sendEmail } from "@/lib/email/send-email";
import { generateComplianceSentHtml } from "@/lib/email/templates/compliance-sent";
import { calculateNextDueDate } from "@/lib/cron/deadline-calculator";

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

    // Verify user has this regulation and fetch details
    const userRegulation = await prisma.userRegulation.findUnique({
      where: {
        userId_regulationId: {
          userId: user.id,
          regulationId,
        },
      },
      include: {
        regulation: true,
        user: {
          include: {
            businessProfile: true,
          },
        },
      },
    });

    if (!userRegulation) {
      return NextResponse.json(
        { error: "Regulation not found or not assigned to your account" },
        { status: 404 }
      );
    }

    const regulation = userRegulation.regulation;

    if (!regulation.officialEmail) {
      return NextResponse.json(
        { error: "This regulation does not have an official email address configured" },
        { status: 400 }
      );
    }

    // Generate PDF
    const { buffer, filename } = await generateCompliancePdf(
      regulationId,
      user.id
    );

    // Log PDF generation
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        regulationId,
        action: "PDF_GENERATED",
        details: { filename, generatedAt: new Date().toISOString() },
      },
    });

    const businessName =
      userRegulation.user.businessProfile?.businessName ||
      userRegulation.user.name ||
      "Business";
    const userEmail = userRegulation.user.email;
    const userName = userRegulation.user.name || "there";

    // Send compliance email to the official authority email
    const complianceEmailResult = await sendEmail({
      to: regulation.officialEmail,
      subject: `Compliance Submission - ${regulation.title} - ${businessName}`,
      html: `<p>Please find attached the compliance report for <strong>${regulation.title}</strong> from <strong>${businessName}</strong>.</p>
<p>If you have any questions, please contact us at <a href="mailto:${userEmail}">${userEmail}</a>.</p>
<p>Thank you.</p>`,
      replyTo: userEmail,
      attachments: [
        {
          filename,
          content: buffer,
        },
      ],
    });

    if (!complianceEmailResult.success) {
      return NextResponse.json(
        { error: `Failed to send compliance email: ${complianceEmailResult.error}` },
        { status: 500 }
      );
    }

    // Log email sent
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        regulationId,
        action: "EMAIL_SENT",
        details: {
          sentTo: regulation.officialEmail,
          filename,
          messageId: complianceEmailResult.messageId,
          sentAt: new Date().toISOString(),
        },
      },
    });

    // Update UserDeadline status to COMPLETED
    const activeDeadline = await prisma.userDeadline.findFirst({
      where: {
        userId: user.id,
        regulationId,
        status: { notIn: ["COMPLETED", "SKIPPED"] },
      },
      orderBy: { nextDueDate: "asc" },
    });

    if (activeDeadline) {
      await prisma.userDeadline.update({
        where: { id: activeDeadline.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await prisma.complianceLog.create({
        data: {
          userId: user.id,
          regulationId,
          action: "DEADLINE_COMPLETED",
          details: {
            deadlineId: activeDeadline.id,
            completedAt: new Date().toISOString(),
          },
        },
      });

      // Auto-create next deadline for recurring regulations
      if (regulation.renewalCycle !== "ONE_TIME") {
        const nextDueDate = calculateNextDueDate(regulation, new Date());
        await prisma.userDeadline.create({
          data: {
            userId: user.id,
            regulationId,
            nextDueDate,
            status: "UPCOMING",
          },
        });

        await prisma.complianceLog.create({
          data: {
            userId: user.id,
            regulationId,
            action: "DEADLINE_CREATED",
            details: {
              nextDueDate: nextDueDate.toISOString(),
              autoRenewed: true,
            },
          },
        });
      }
    }

    // Send confirmation email to the user
    const sentAt = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const dashboardUrl =
      process.env.NEXTAUTH_URL || "https://app.regsguard.com";

    // Check for next upcoming deadline
    const nextDeadline = await prisma.userDeadline.findFirst({
      where: {
        userId: user.id,
        regulationId,
        status: { notIn: ["COMPLETED", "SKIPPED"] },
      },
      orderBy: { nextDueDate: "asc" },
    });

    const nextDeadlineDate = nextDeadline
      ? nextDeadline.nextDueDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const confirmationHtml = generateComplianceSentHtml({
      userName,
      regulationTitle: regulation.title,
      authority: regulation.authority,
      sentTo: regulation.officialEmail,
      sentAt,
      pdfFilename: filename,
      nextDeadlineDate,
      dashboardUrl: `${dashboardUrl}/regulations/${regulationId}`,
    });

    await sendEmail({
      to: userEmail,
      subject: `[RegsGuard] Compliance Submitted: ${regulation.title}`,
      html: confirmationHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Compliance email sent successfully",
      sentTo: regulation.officialEmail,
      filename,
    });
  } catch (err) {
    console.error("[EMAIL] Send compliance error:", err);
    return NextResponse.json(
      { error: "Failed to send compliance email" },
      { status: 500 }
    );
  }
}
