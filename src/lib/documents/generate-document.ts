import { withPage } from "@/lib/pdf/browser-pool";
import { getTemplate } from "./templates/registry";
import type { TenantConfig } from "@/lib/tenant";
import { tenantInitials } from "@/lib/tenant";

interface GenerateDocumentPdfResult {
  buffer: Buffer;
  filename: string;
}

export async function generateDocumentPdf(
  templateSlug: string,
  data: Record<string, string>,
  tenant?: TenantConfig
): Promise<GenerateDocumentPdfResult> {
  const template = getTemplate(templateSlug);
  if (!template) throw new Error(`Template "${templateSlug}" not found`);

  const brandName = tenant?.name ?? "RegsGuard";
  const brandColor = tenant?.primaryColor ?? "#1e40af";

  const html = template.generateHtml(data, brandName, brandColor);

  return withPage(async (page) => {
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    });

    const buffer = Buffer.from(pdfBuffer);
    const safeSlug = templateSlug.replace(/[^a-z0-9-]/g, "");
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `${safeSlug}-${dateStr}.pdf`;

    return { buffer, filename };
  });
}

/** Resolves auto-fill values from profile, client, and project data */
export function resolveAutoFill(
  fields: { key: string; autoFillFrom?: string }[],
  sources: {
    profile?: Record<string, unknown>;
    client?: Record<string, unknown>;
    project?: Record<string, unknown>;
  }
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of fields) {
    if (!field.autoFillFrom) continue;
    const [source, key] = field.autoFillFrom.split(".");
    const obj = sources[source as keyof typeof sources];
    if (obj && key && obj[key] != null) {
      const val = obj[key];
      if (val instanceof Date) {
        result[field.key] = val.toISOString().split("T")[0];
      } else {
        result[field.key] = String(val);
      }
    }
  }

  return result;
}
