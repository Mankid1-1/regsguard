import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send-email";
import { generateCompliancePdf } from "@/lib/pdf/generate-pdf";
import { maskPii } from "@/lib/pii-mask";
import { calculateNextDueDate } from "@/lib/cron/deadline-calculator";

/**
 * One-click file action: generates a compliance PDF and emails it
 * to the regulation's official filing address.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: regulationId } = await params;

  try {
    // Load regulation + user's active deadline for it
    const [regulation, deadline, profile] = await Promise.all([
      prisma.regulation.findUnique({ where: { id: regulationId } }),
      prisma.userDeadline.findFirst({
        where: {
          userId: user.id,
          regulationId,
          status: { notIn: ["COMPLETED", "SKIPPED"] },
        },
        orderBy: { nextDueDate: "asc" },
      }),
      prisma.businessProfile.findUnique({ where: { userId: user.id } }),
    ]);

    if (!regulation) {
      return NextResponse.json({ error: "Regulation not found" }, { status: 404 });
    }

    if (!regulation.officialEmail) {
      return NextResponse.json(
        { error: "No filing email configured for this regulation. Use the portal link instead." },
        { status: 400 },
      );
    }

    // Generate the PDF
    const { buffer, filename } = await generateCompliancePdf(regulationId, user.id);

    const businessName = profile?.businessName || user.name || "Business";

    // Send to regulation's official email
    const filingResult = await sendEmail({
      to: regulation.officialEmail,
      subject: `Compliance Submission -- ${regulation.title} -- ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;padding:20px">
          <p>To whom it may concern,</p>
          <p>Please find attached the compliance documentation for
          <strong>${regulation.title}</strong> from <strong>${businessName}</strong>.</p>
          <p>Contact: <a href="mailto:${user.email}">${user.email}</a></p>
          <p>--<br/>Filed via RegsGuard on behalf of ${businessName}</p>
        </div>
      `,
      replyTo: user.email,
      attachments: [{ filename, content: buffer }],
    });

    if (!filingResult.success) {
      return NextResponse.json(
        { error: filingResult.error || "Failed to send email" },
        { status: 500 },
      );
    }

    const now = new Date();

    // Log the filing actions
    await prisma.$transaction(async (tx) => {
      await tx.complianceLog.create({
        data: {
          userId: user.id,
          regulationId,
          action: "EMAIL_SENT",
          details: maskPii({
            sentTo: regulation.officialEmail!,
            filename,
            autoFiled: false,
            messageId: filingResult.messageId,
            manual: true,
          }) as Record<string, string | boolean>,
        },
      });

      await tx.complianceLog.create({
        data: {
          userId: user.id,
          regulationId,
          action: "PDF_GENERATED",
          details: { filename, manualGenerated: true },
        },
      });

      // Mark deadline complete and schedule next one
      if (deadline) {
        await tx.userDeadline.update({
          where: { id: deadline.id },
          data: { status: "COMPLETED", completedAt: now },
        });

        if (regulation.renewalCycle !== "ONE_TIME") {
          const nextDueDate = calculateNextDueDate(regulation, now);
          await tx.userDeadline.create({
            data: {
              userId: user.id,
              regulationId,
              nextDueDate,
              status: "UPCOMING",
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      filedTo: regulation.officialEmail,
      messageId: filingResult.messageId,
    });
  } catch (err) {
    console.error("[file-now] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Filing failed" },
      { status: 500 },
    );
  }
}
