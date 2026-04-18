import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const lienWaiverConditionalTemplate: DocumentTemplate = {
  slug: "lien-waiver-conditional",
  name: "Conditional Waiver and Release of Lien",
  category: "LIEN_WAIVER",
  description:
    "A conditional lien waiver that releases lien rights upon receipt of payment. The release is effective only when the claimant has actually received the payment.",
  fields: [
    {
      key: "claimantName",
      label: "Claimant Name (Company / Individual)",
      type: "text",
      required: true,
      autoFillFrom: "profile.businessName",
      section: "Claimant",
    },
    {
      key: "claimantAddress",
      label: "Claimant Address",
      type: "text",
      required: true,
      autoFillFrom: "profile.address",
      section: "Claimant",
    },
    {
      key: "customerName",
      label: "Customer / Owner Name",
      type: "text",
      required: true,
      autoFillFrom: "client.name",
      section: "Project",
    },
    {
      key: "projectName",
      label: "Project Name",
      type: "text",
      required: true,
      autoFillFrom: "project.name",
      section: "Project",
    },
    {
      key: "projectAddress",
      label: "Project / Job Site Address",
      type: "text",
      required: true,
      autoFillFrom: "project.address",
      section: "Project",
    },
    {
      key: "throughDate",
      label: "Through Date (work performed through)",
      type: "date",
      required: true,
      section: "Payment",
    },
    {
      key: "conditionalAmount",
      label: "Conditional Payment Amount",
      type: "currency",
      required: true,
      section: "Payment",
    },
    {
      key: "invoiceNumber",
      label: "Invoice / Application Number",
      type: "text",
      required: false,
      placeholder: "e.g. INV-001 or Pay App #3",
      section: "Payment",
    },
    {
      key: "exceptionNotes",
      label: "Exceptions / Disputed Claims",
      type: "textarea",
      required: false,
      placeholder: "List any exceptions or disputed amounts, if none leave blank",
      section: "Exceptions",
    },
  ],
  generateHtml(data: Record<string, string>, brandName: string, brandColor: string, branding?: BrandingContext): string {
    const fmt = (v: string | undefined) => {
      if (!v) return "$0.00";
      const n = parseFloat(v);
      return isNaN(n) ? v : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Conditional Lien Waiver - ${data.projectName || "Project"}</title>
<style>
${basePdfCss(brandColor)}
.legal-text { font-size: 12px; line-height: 1.7; color: #374151; margin-bottom: 16px; }
.legal-text strong { color: #1a1a2e; }
.detail-grid { display: grid; grid-template-columns: 140px 1fr; gap: 6px 12px; margin: 16px 0; font-size: 12px; }
.detail-grid .dl { font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 10px; letter-spacing: 0.3px; }
.detail-grid .dv { font-weight: 500; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
.amount-highlight { font-size: 20px; font-weight: 700; color: ${brandColor}; margin: 16px 0; }
.exception-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 12px; margin: 16px 0; font-size: 12px; }
.exception-box .exc-title { font-weight: 700; font-size: 11px; color: #92400e; text-transform: uppercase; margin-bottom: 4px; }
.notice-box { background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 6px; padding: 12px; margin: 16px 0; }
.notice-box p { font-size: 11px; color: #0c4a6e; }
.sig-block { display: flex; gap: 40px; margin-top: 36px; }
.sig-field { flex: 1; }
.sig-line { border-top: 1px solid #1a1a2e; margin-top: 48px; padding-top: 4px; font-size: 10px; color: #6b7280; }
</style>
</head>
<body>
  <div class="header">
    <div>
      ${brandHtml(brandName, branding)}
    </div>
    <div>
      <div class="doc-type">Conditional Lien Waiver</div>
      <div class="doc-date">Conditional Waiver and Release of Lien</div>
    </div>
  </div>

  <div class="notice-box">
    <p><strong>NOTICE:</strong> This document waives the claimant's lien, stop payment notice, and payment bond rights
    effective only upon receipt of payment. A person should not rely on this document unless satisfied that the claimant
    has received payment.</p>
  </div>

  <div class="section">
    <div class="section-title">Project &amp; Payment Details</div>
    <div class="detail-grid">
      <div class="dl">Claimant</div>
      <div class="dv">${data.claimantName || ""}</div>
      <div class="dl">Claimant Address</div>
      <div class="dv">${data.claimantAddress || ""}</div>
      <div class="dl">Customer / Owner</div>
      <div class="dv">${data.customerName || ""}</div>
      <div class="dl">Project Name</div>
      <div class="dv">${data.projectName || ""}</div>
      <div class="dl">Project Address</div>
      <div class="dv">${data.projectAddress || ""}</div>
      <div class="dl">Through Date</div>
      <div class="dv">${data.throughDate || ""}</div>
      <div class="dl">Invoice / App #</div>
      <div class="dv">${data.invoiceNumber || "N/A"}</div>
    </div>
    <div class="amount-highlight">Conditional Amount: ${fmt(data.conditionalAmount)}</div>
  </div>

  <div class="section">
    <div class="section-title">Conditional Release</div>
    <div class="legal-text">
      Upon receipt of a check from <strong>${data.customerName || "________________"}</strong>
      in the sum of <strong>${fmt(data.conditionalAmount)}</strong> payable to
      <strong>${data.claimantName || "________________"}</strong>, and when the check has been properly
      endorsed and has been paid by the bank on which it is drawn, this document shall become effective to
      release any mechanic's lien, stop payment notice, or bond right the claimant has for labor, services,
      equipment, or material furnished to the project known as
      <strong>${data.projectName || "________________"}</strong> located at
      <strong>${data.projectAddress || "________________"}</strong>
      through <strong>${data.throughDate || "________________"}</strong>.
    </div>
    <div class="legal-text">
      This release covers a progress payment for labor, services, equipment, or material furnished through
      the date stated above and does not cover any retention or items furnished after said date.
    </div>
  </div>

  ${
    data.exceptionNotes
      ? `<div class="exception-box">
    <div class="exc-title">Exceptions</div>
    <p>${data.exceptionNotes}</p>
  </div>`
      : ""
  }

  <div class="sig-block">
    <div class="sig-field">
      <div class="sig-line">Claimant Signature</div>
    </div>
    <div class="sig-field" style="flex: 0 0 200px;">
      <div class="sig-line">Title</div>
    </div>
    <div class="sig-field" style="flex: 0 0 160px;">
      <div class="sig-line">Date</div>
    </div>
  </div>

  <div class="footer">
    ${footerBrandHtml(brandName, branding)}
    <span>Conditional Waiver and Release of Lien</span>
  </div>
</body>
</html>`;
  },
};
