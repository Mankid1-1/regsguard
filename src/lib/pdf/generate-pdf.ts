import { prisma } from "@/lib/prisma";
import { withPage } from "./browser-pool";
import { generateComplianceReportHtml } from "./templates/compliance-report";
import type { TenantConfig } from "@/lib/tenant";
import { tenantInitials } from "@/lib/tenant";

interface GeneratePdfResult {
  buffer: Buffer;
  filename: string;
}

export async function generateCompliancePdf(
  regulationId: string,
  userId: string,
  tenant?: TenantConfig
): Promise<GeneratePdfResult> {
  const [regulation, profile, deadline] = await Promise.all([
    prisma.regulation.findUniqueOrThrow({
      where: { id: regulationId },
    }),
    prisma.businessProfile.findUnique({
      where: { userId },
    }),
    prisma.userDeadline.findFirst({
      where: {
        userId,
        regulationId,
        status: { not: "COMPLETED" },
      },
      orderBy: { nextDueDate: "asc" },
    }),
  ]);

  const now = new Date();
  const generatedAt = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const licenseNumbers =
    profile?.licenseNumbers &&
    typeof profile.licenseNumbers === "object" &&
    !Array.isArray(profile.licenseNumbers)
      ? (profile.licenseNumbers as Record<string, string>)
      : {};

  const deadlineDate = deadline
    ? deadline.nextDueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const insuranceExpiration = profile?.insuranceExpiration
    ? profile.insuranceExpiration.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const bondExpiration = profile?.bondExpiration
    ? profile.bondExpiration.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const html = generateComplianceReportHtml({
    tenantName: tenant?.name,
    tenantColor: tenant?.primaryColor,
    tenantLogoInitials: tenant ? tenantInitials(tenant.name) : undefined,
    tenantLogoUrl: tenant?.logoUrl,
    businessName: profile?.businessName ?? "Not Provided",
    address: profile?.address ?? "Not Provided",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    zip: profile?.zip ?? "",
    phone: profile?.phone ?? "Not Provided",
    email: profile?.email ?? "Not Provided",
    responsiblePerson: profile?.responsiblePerson ?? "Not Provided",
    licenseNumbers,
    insuranceProvider: profile?.insuranceProvider ?? null,
    insurancePolicyNumber: profile?.insurancePolicyNumber ?? null,
    insuranceExpiration,
    bondAmount: profile?.bondAmount ?? null,
    bondProvider: profile?.bondProvider ?? null,
    bondExpiration,
    regulationTitle: regulation.title,
    regulationAuthority: regulation.authority,
    regulationDescription: regulation.description,
    regulationCategory: regulation.category,
    regulationFee: regulation.fee ?? null,
    regulationRenewalCycle: regulation.renewalCycle,
    deadlineDate,
    generatedAt,
  });

  return withPage(async (page) => {
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    const buffer = Buffer.from(pdfBuffer);

    const safeTitle = regulation.title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `compliance-report-${safeTitle}-${dateStr}.pdf`;

    return { buffer, filename };
  });
}
