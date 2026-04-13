import type { DocumentCategory } from "@prisma/client";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "currency" | "textarea" | "select" | "checkbox";
  required: boolean;
  /** Dot-path to auto-fill from: "profile.businessName", "client.name", "project.contractAmount" */
  autoFillFrom?: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  section?: string;
}

export interface DocumentTemplate {
  slug: string;
  name: string;
  category: DocumentCategory;
  description: string;
  fields: TemplateField[];
  generateHtml: (data: Record<string, string>, brandName: string, brandColor: string) => string;
}

// ─── Template imports ───
import { w9Template } from "./w9";
import { nec1099Template } from "./1099-nec";
import { lienWaiverConditionalTemplate } from "./lien-waiver-conditional";
import { lienWaiverUnconditionalTemplate } from "./lien-waiver-unconditional";
import { coiTemplate } from "./certificate-of-insurance";
import { invoiceTemplate } from "./invoice";
import { changeOrderTemplate } from "./change-order";
import { proposalTemplate } from "./proposal";
import { permitApplicationTemplate } from "./permit-application";
import { certificateOfCompletionTemplate } from "./certificate-of-completion";
import { paymentApplicationTemplate } from "./payment-application";
import { mechanicsLienTemplate } from "./mechanics-lien";
import { workOrderTemplate } from "./work-order";
import { subcontractorAgreementTemplate } from "./subcontractor-agreement";
import { wh347Template } from "./wh-347";

export const TEMPLATE_REGISTRY: DocumentTemplate[] = [
  w9Template,
  nec1099Template,
  lienWaiverConditionalTemplate,
  lienWaiverUnconditionalTemplate,
  coiTemplate,
  invoiceTemplate,
  changeOrderTemplate,
  proposalTemplate,
  permitApplicationTemplate,
  certificateOfCompletionTemplate,
  paymentApplicationTemplate,
  mechanicsLienTemplate,
  workOrderTemplate,
  subcontractorAgreementTemplate,
  wh347Template,
];

export function getTemplate(slug: string): DocumentTemplate | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.slug === slug);
}

export function getTemplatesByCategory(category: DocumentCategory): DocumentTemplate[] {
  return TEMPLATE_REGISTRY.filter((t) => t.category === category);
}

/** Standard CSS for all document PDFs */
export function basePdfCss(brandColor: string): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; line-height: 1.5; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${brandColor}; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; color: ${brandColor}; }
    .doc-type { font-size: 18px; font-weight: 700; color: ${brandColor}; text-align: right; }
    .doc-date { font-size: 11px; color: #6b7280; margin-top: 4px; text-align: right; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
    .row { display: flex; gap: 24px; margin-bottom: 8px; }
    .field { flex: 1; }
    .field-label { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
    .field-value { font-size: 13px; font-weight: 500; }
    .field-value.large { font-size: 18px; font-weight: 700; color: ${brandColor}; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    table th { text-align: left; font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; padding: 8px; border-bottom: 2px solid #e5e7eb; }
    table td { font-size: 13px; padding: 8px; border-bottom: 1px solid #f3f4f6; }
    .total-row td { font-weight: 700; border-top: 2px solid #e5e7eb; border-bottom: none; }
    .signature-line { border-top: 1px solid #1a1a2e; width: 250px; margin-top: 40px; padding-top: 4px; font-size: 11px; color: #6b7280; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e5e7eb; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
    .footer .brand-mark { color: ${brandColor}; font-weight: 600; }
    .callout { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 12px 0; }
    @media print { body { padding: 20px; } }
  `;
}
