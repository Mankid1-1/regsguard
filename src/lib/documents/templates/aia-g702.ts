import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const aiaG702Template: DocumentTemplate = {
  slug: "aia-g702-application-payment",
  name: "AIA G702-style Application for Payment",
  category: "INVOICE",
  description:
    "Industry-standard application for payment used on commercial projects. Tracks original contract sum, change orders, work completed to date, retainage, and amount due. Modeled on AIA Document G702.",
  fields: [
    { key: "applicationNumber", label: "Application No.", type: "text", required: true, section: "Header" },
    { key: "applicationDate", label: "Application Date", type: "date", required: true, section: "Header" },
    { key: "periodEnding", label: "Period Ending", type: "date", required: true, section: "Header" },
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Project" },
    { key: "projectAddress", label: "Project Address", type: "text", required: true, section: "Project" },
    { key: "ownerName", label: "Owner", type: "text", required: true, section: "Parties" },
    { key: "architectName", label: "Architect", type: "text", required: false, section: "Parties" },
    { key: "contractorName", label: "Contractor", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Parties" },
    { key: "contractDate", label: "Contract Date", type: "date", required: true, section: "Contract" },
    { key: "originalContractSum", label: "Original Contract Sum", type: "currency", required: true, section: "Contract Sum" },
    { key: "approvedChangeOrders", label: "Net Approved Change Orders", type: "currency", required: true, section: "Contract Sum" },
    { key: "contractSumToDate", label: "Contract Sum to Date", type: "currency", required: true, section: "Contract Sum" },
    { key: "totalCompletedStored", label: "Total Completed & Stored to Date", type: "currency", required: true, section: "Work" },
    { key: "retainagePercent", label: "Retainage % (e.g. 10)", type: "number", required: true, section: "Retainage" },
    { key: "retainageAmount", label: "Retainage Amount", type: "currency", required: true, section: "Retainage" },
    { key: "totalLessRetainage", label: "Total Earned Less Retainage", type: "currency", required: true, section: "Calculation" },
    { key: "previousPayments", label: "Less Previous Certificates for Payment", type: "currency", required: true, section: "Calculation" },
    { key: "currentPaymentDue", label: "CURRENT PAYMENT DUE", type: "currency", required: true, section: "Calculation" },
    { key: "balanceToFinish", label: "Balance to Finish (incl. retainage)", type: "currency", required: false, section: "Calculation" },
    { key: "contractorName2", label: "Contractor Sign Name", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Certification" },
    { key: "signatureDate", label: "Signature Date", type: "date", required: true, section: "Certification" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .calc-table { width: 100%; margin-top: 12px; }
  .calc-table td { padding: 10px 12px; font-size: 12px; }
  .calc-table .lbl { color: #4b5563; }
  .calc-table .num { text-align: right; font-weight: 600; }
  .calc-table .total td { font-size: 14px; font-weight: 700; color: ${brandColor}; border-top: 2px solid ${brandColor}; background: #f8fafc; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">APPLICATION FOR PAYMENT</div><div class="doc-date">App. #${d("applicationNumber")} · ${d("applicationDate")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Project</div><div class="field-value">${d("projectName")}</div><div style="font-size:11px;color:#6b7280;">${d("projectAddress")}</div></div>
    <div class="field"><div class="field-label">Period Ending</div><div class="field-value">${d("periodEnding")}</div></div>
  </div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Owner</div><div class="field-value">${d("ownerName")}</div></div>
    <div class="field"><div class="field-label">Architect</div><div class="field-value">${d("architectName") || "—"}</div></div>
    <div class="field"><div class="field-label">Contractor</div><div class="field-value">${d("contractorName")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contract Sum</div>
  <table class="calc-table">
    <tr><td class="lbl">1. Original Contract Sum</td><td class="num">$${d("originalContractSum")}</td></tr>
    <tr><td class="lbl">2. Net Change by Approved Change Orders</td><td class="num">$${d("approvedChangeOrders")}</td></tr>
    <tr><td class="lbl">3. Contract Sum to Date (Line 1 + 2)</td><td class="num">$${d("contractSumToDate")}</td></tr>
    <tr><td class="lbl">4. Total Completed &amp; Stored to Date</td><td class="num">$${d("totalCompletedStored")}</td></tr>
    <tr><td class="lbl">5. Retainage (${d("retainagePercent")}%)</td><td class="num">$${d("retainageAmount")}</td></tr>
    <tr><td class="lbl">6. Total Earned Less Retainage (Line 4 − 5)</td><td class="num">$${d("totalLessRetainage")}</td></tr>
    <tr><td class="lbl">7. Less Previous Certificates for Payment</td><td class="num">$${d("previousPayments")}</td></tr>
    <tr class="total"><td>8. CURRENT PAYMENT DUE</td><td class="num">$${d("currentPaymentDue")}</td></tr>
    <tr><td class="lbl">9. Balance to Finish (incl. retainage)</td><td class="num">$${d("balanceToFinish") || "—"}</td></tr>
  </table>
</div>

<div class="callout">
  <strong>Contractor's Certification:</strong> The undersigned Contractor certifies that to the best of the Contractor's knowledge, information and belief, the Work covered by this Application has been completed in accordance with the Contract Documents, that all amounts have been paid by the Contractor for Work for which previous Certificates for Payment were issued and payments received from the Owner, and that current payment shown herein is now due.
</div>

<div style="margin-top:32px;display:flex;gap:24px;">
  <div class="signature-line" style="flex:1;">Contractor Signature — ${d("contractorName2")}</div>
  <div class="signature-line" style="width:160px;">${d("signatureDate")}</div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Application for Payment #${d("applicationNumber")}</span>
</div>

</body></html>`;
  },
};
