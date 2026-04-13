import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const lienWaiverUnconditionalTemplate: DocumentTemplate = {
  slug: "lien-waiver-unconditional",
  name: "Unconditional Waiver and Release of Lien",
  category: "LIEN_WAIVER",
  description:
    "An unconditional lien waiver that immediately and irrevocably releases lien rights upon signing, confirming payment has already been received.",
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
      key: "receivedAmount",
      label: "Payment Amount Received",
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
  ],
  generateHtml(data: Record<string, string>, brandName: string, brandColor: string): string {
    const fmt = (v: string | undefined) => {
      if (!v) return "$0.00";
      const n = parseFloat(v);
      return isNaN(n) ? v : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Unconditional Lien Waiver - ${data.projectName || "Project"}</title>
<style>
${basePdfCss(brandColor)}
.legal-text { font-size: 12px; line-height: 1.7; color: #374151; margin-bottom: 16px; }
.legal-text strong { color: #1a1a2e; }
.detail-grid { display: grid; grid-template-columns: 140px 1fr; gap: 6px 12px; margin: 16px 0; font-size: 12px; }
.detail-grid .dl { font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 10px; letter-spacing: 0.3px; }
.detail-grid .dv { font-weight: 500; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
.amount-highlight { font-size: 20px; font-weight: 700; color: ${brandColor}; margin: 16px 0; }
.warning-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 12px; margin: 16px 0; }
.warning-box p { font-size: 11px; color: #991b1b; }
.sig-block { display: flex; gap: 40px; margin-top: 36px; }
.sig-field { flex: 1; }
.sig-line { border-top: 1px solid #1a1a2e; margin-top: 48px; padding-top: 4px; font-size: 10px; color: #6b7280; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${brandName}</div>
    </div>
    <div>
      <div class="doc-type">Unconditional Lien Waiver</div>
      <div class="doc-date">Unconditional Waiver and Release of Lien</div>
    </div>
  </div>

  <div class="warning-box">
    <p><strong>NOTICE:</strong> This document waives and releases lien, stop payment notice, and payment bond rights
    unconditionally and is effective immediately upon signing. This document is enforceable against the claimant even
    if the claimant has not been paid. The claimant should not sign this document until payment has been received.</p>
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
    <div class="amount-highlight">Amount Received: ${fmt(data.receivedAmount)}</div>
  </div>

  <div class="section">
    <div class="section-title">Unconditional Release</div>
    <div class="legal-text">
      The claimant, <strong>${data.claimantName || "________________"}</strong>, has been paid and has received
      a progress payment in the sum of <strong>${fmt(data.receivedAmount)}</strong> for labor, services,
      equipment, or material furnished to the project known as
      <strong>${data.projectName || "________________"}</strong> located at
      <strong>${data.projectAddress || "________________"}</strong> and owned by
      <strong>${data.customerName || "________________"}</strong>, and does hereby unconditionally waive and
      release any right to a mechanic's lien, stop payment notice, or any right against a labor and material
      bond on the above-referenced project for labor, services, equipment, or material furnished through
      <strong>${data.throughDate || "________________"}</strong>.
    </div>
    <div class="legal-text">
      This release covers a progress payment for labor, services, equipment, or material furnished through
      the date stated above and does not cover any retention or items furnished after said date. This waiver
      and release is unconditional and effective immediately upon execution, regardless of whether the
      claimant has endorsed or deposited the payment.
    </div>
    <div class="legal-text">
      The claimant warrants that it has already been paid the full amount indicated above and that it has no
      unsatisfied claims for additional compensation for work performed through the stated date, except for
      retention, if any, which is not covered by this waiver.
    </div>
  </div>

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
    <span>Generated by <span class="brand-mark">${brandName}</span></span>
    <span>Unconditional Waiver and Release of Lien</span>
  </div>
</body>
</html>`;
  },
};
