import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const paymentApplicationTemplate: DocumentTemplate = {
  slug: "payment-application",
  name: "Payment Application",
  category: "INVOICE",
  description:
    "AIA G702-style payment application for progress billing on construction projects",
  fields: [
    // Contract Info
    { key: "contractorName", label: "Contractor Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Contract Info" },
    { key: "ownerName", label: "Owner Name", type: "text", required: true, autoFillFrom: "client.name", section: "Contract Info" },
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Contract Info" },
    { key: "projectAddress", label: "Project Address", type: "text", required: true, section: "Contract Info" },
    { key: "contractDate", label: "Contract Date", type: "date", required: true, section: "Contract Info" },
    { key: "contractAmount", label: "Contract Amount", type: "currency", required: true, autoFillFrom: "project.contractAmount", section: "Contract Info" },
    // Application Period
    { key: "applicationNumber", label: "Application Number", type: "text", required: true, section: "Application Period" },
    { key: "periodFrom", label: "Period From", type: "date", required: true, section: "Application Period" },
    { key: "periodTo", label: "Period To", type: "date", required: true, section: "Application Period" },
    // Schedule of Values
    { key: "originalContractSum", label: "Original Contract Sum", type: "currency", required: true, section: "Schedule of Values" },
    { key: "changeOrdersTotal", label: "Change Orders Total", type: "currency", required: false, section: "Schedule of Values" },
    { key: "currentContractSum", label: "Current Contract Sum", type: "currency", required: true, section: "Schedule of Values" },
    { key: "previouslyBilled", label: "Previously Billed", type: "currency", required: false, section: "Schedule of Values" },
    { key: "currentBilled", label: "Current Billed", type: "currency", required: true, section: "Schedule of Values" },
    { key: "retainagePercent", label: "Retainage Percent (%)", type: "number", required: false, section: "Schedule of Values" },
    { key: "retainagePrevious", label: "Retainage (Previous)", type: "currency", required: false, section: "Schedule of Values" },
    { key: "retainageCurrent", label: "Retainage (Current)", type: "currency", required: false, section: "Schedule of Values" },
    { key: "netPaymentDue", label: "Net Payment Due", type: "currency", required: true, section: "Schedule of Values" },
    // Notes
    { key: "notes", label: "Notes", type: "textarea", required: false, section: "Notes" },
  ],

  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .summary-table { width: 100%; margin-top: 8px; }
  .summary-table td { padding: 8px 12px; font-size: 13px; }
  .summary-table .label-cell { color: #6b7280; font-weight: 600; width: 60%; }
  .summary-table .value-cell { text-align: right; font-weight: 600; }
  .summary-table .highlight td { font-size: 15px; font-weight: 700; color: ${brandColor}; border-top: 2px solid ${brandColor}; }
  .app-number { display: inline-block; background: ${brandColor}; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; }
</style></head><body>

<div class="header">
  <div>
    ${brandHtml(brandName, branding)}
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Payment Application</div>
  </div>
  <div>
    <div class="doc-type">PAYMENT APPLICATION</div>
    <div class="doc-date"><span class="app-number">#${d("applicationNumber")}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contract Info</div>
  <div class="row">
    <div class="field"><div class="field-label">Contractor</div><div class="field-value">${d("contractorName")}</div></div>
    <div class="field"><div class="field-label">Owner</div><div class="field-value">${d("ownerName")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Project Name</div><div class="field-value">${d("projectName")}</div></div>
    <div class="field"><div class="field-label">Project Address</div><div class="field-value">${d("projectAddress")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Contract Date</div><div class="field-value">${d("contractDate")}</div></div>
    <div class="field"><div class="field-label">Contract Amount</div><div class="field-value">$${d("contractAmount")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Application Period</div>
  <div class="row">
    <div class="field"><div class="field-label">Application Number</div><div class="field-value">${d("applicationNumber")}</div></div>
    <div class="field"><div class="field-label">Period From</div><div class="field-value">${d("periodFrom")}</div></div>
    <div class="field"><div class="field-label">Period To</div><div class="field-value">${d("periodTo")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Schedule of Values</div>
  <table class="summary-table">
    <tr><td class="label-cell">Original Contract Sum</td><td class="value-cell">$${d("originalContractSum")}</td></tr>
    <tr><td class="label-cell">Change Orders Total</td><td class="value-cell">$${d("changeOrdersTotal") || "0.00"}</td></tr>
    <tr><td class="label-cell">Current Contract Sum</td><td class="value-cell">$${d("currentContractSum")}</td></tr>
    <tr><td class="label-cell">Previously Billed</td><td class="value-cell">$${d("previouslyBilled") || "0.00"}</td></tr>
    <tr><td class="label-cell">Current Billed</td><td class="value-cell">$${d("currentBilled")}</td></tr>
    ${d("retainagePercent") ? `<tr><td class="label-cell">Retainage (${d("retainagePercent")}%)</td><td class="value-cell"></td></tr>` : ""}
    ${d("retainagePrevious") ? `<tr><td class="label-cell">&nbsp;&nbsp;Retainage (Previous)</td><td class="value-cell">$${d("retainagePrevious")}</td></tr>` : ""}
    ${d("retainageCurrent") ? `<tr><td class="label-cell">&nbsp;&nbsp;Retainage (Current)</td><td class="value-cell">$${d("retainageCurrent")}</td></tr>` : ""}
    <tr class="highlight"><td class="label-cell">Net Payment Due</td><td class="value-cell">$${d("netPaymentDue")}</td></tr>
  </table>
</div>

${d("notes") ? `
<div class="section">
  <div class="section-title">Notes</div>
  <div class="callout">${d("notes")}</div>
</div>
` : ""}

<div class="approval-block" style="display:flex;gap:48px;margin-top:40px;">
  <div style="flex:1;">
    <div class="signature-line">Contractor Signature &amp; Date</div>
  </div>
  <div style="flex:1;">
    <div class="signature-line">Owner Signature &amp; Date</div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Application #${d("applicationNumber")}</span>
</div>

</body></html>`;
  },
};
