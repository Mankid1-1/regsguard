import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const changeOrderTemplate: DocumentTemplate = {
  slug: "change-order",
  name: "Change Order",
  category: "CHANGE_ORDER",
  description:
    "Formal change order document for modifying the original contract scope, cost, or schedule.",
  fields: [
    { key: "changeOrderNumber", label: "Change Order Number", type: "text", required: true, placeholder: "CO-001", section: "Change Order Details" },
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Project Information" },
    { key: "projectAddress", label: "Project Address", type: "text", required: true, autoFillFrom: "project.address", section: "Project Information" },
    { key: "ownerName", label: "Owner / Client Name", type: "text", required: true, autoFillFrom: "client.name", section: "Parties" },
    { key: "contractorName", label: "Contractor Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Parties" },
    { key: "originalContractAmount", label: "Original Contract Amount", type: "currency", required: true, autoFillFrom: "project.contractAmount", section: "Contract Amounts" },
    { key: "previousChangeOrders", label: "Previous Change Orders Total", type: "currency", required: false, placeholder: "0.00", section: "Contract Amounts" },
    { key: "currentChangeAmount", label: "This Change Order Amount", type: "currency", required: true, section: "Contract Amounts" },
    { key: "newContractTotal", label: "New Contract Total", type: "currency", required: true, section: "Contract Amounts" },
    { key: "description", label: "Description of Change", type: "textarea", required: true, section: "Change Details" },
    { key: "reason", label: "Reason for Change", type: "textarea", required: true, section: "Change Details" },
    { key: "scheduleImpact", label: "Schedule Impact", type: "text", required: false, placeholder: "e.g. +5 working days", section: "Change Details" },
    { key: "dateSubmitted", label: "Date Submitted", type: "date", required: true, section: "Dates" },
    { key: "dateApproved", label: "Date Approved", type: "date", required: false, section: "Dates" },
  ],

  generateHtml(data, brandName, brandColor) {
    const d = (key: string) => data[key] || "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .amounts-table { width: 100%; margin-top: 8px; }
  .amounts-table td { padding: 8px 12px; font-size: 13px; }
  .amounts-table .label-cell { color: #6b7280; font-weight: 600; width: 60%; }
  .amounts-table .value-cell { text-align: right; font-weight: 600; }
  .amounts-table .highlight td { font-size: 15px; font-weight: 700; color: ${brandColor}; border-top: 2px solid ${brandColor}; }
  .approval-block { display: flex; gap: 48px; margin-top: 40px; }
  .approval-slot { flex: 1; }
</style></head><body>

<div class="header">
  <div>
    <div class="brand">${brandName}</div>
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Change Order</div>
  </div>
  <div>
    <div class="doc-type">CHANGE ORDER</div>
    <div class="doc-date">#${d("changeOrderNumber")}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Project Information</div>
  <div class="row">
    <div class="field"><div class="field-label">Project Name</div><div class="field-value">${d("projectName")}</div></div>
    <div class="field"><div class="field-label">Project Address</div><div class="field-value">${d("projectAddress")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Parties</div>
  <div class="row">
    <div class="field"><div class="field-label">Owner / Client</div><div class="field-value">${d("ownerName")}</div></div>
    <div class="field"><div class="field-label">Contractor</div><div class="field-value">${d("contractorName")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contract Amounts</div>
  <table class="amounts-table">
    <tr><td class="label-cell">Original Contract Amount</td><td class="value-cell">$${d("originalContractAmount")}</td></tr>
    <tr><td class="label-cell">Previous Change Orders Total</td><td class="value-cell">$${d("previousChangeOrders") || "0.00"}</td></tr>
    <tr><td class="label-cell">This Change Order Amount</td><td class="value-cell">$${d("currentChangeAmount")}</td></tr>
    <tr class="highlight"><td class="label-cell">New Contract Total</td><td class="value-cell">$${d("newContractTotal")}</td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">Description of Change</div>
  <div class="callout">${d("description")}</div>
</div>

<div class="section">
  <div class="section-title">Reason for Change</div>
  <div class="callout">${d("reason")}</div>
</div>

${d("scheduleImpact") ? `
<div class="section">
  <div class="section-title">Schedule Impact</div>
  <div class="field-value">${d("scheduleImpact")}</div>
</div>
` : ""}

<div class="section">
  <div class="section-title">Dates</div>
  <div class="row">
    <div class="field"><div class="field-label">Date Submitted</div><div class="field-value">${d("dateSubmitted")}</div></div>
    <div class="field"><div class="field-label">Date Approved</div><div class="field-value">${d("dateApproved")}</div></div>
  </div>
</div>

<div class="approval-block">
  <div class="approval-slot">
    <div class="signature-line">Owner / Client Signature &amp; Date</div>
  </div>
  <div class="approval-slot">
    <div class="signature-line">Contractor Signature &amp; Date</div>
  </div>
</div>

<div class="footer">
  <span>Generated by <span class="brand-mark">${brandName}</span></span>
  <span>Change Order #${d("changeOrderNumber")}</span>
</div>

</body></html>`;
  },
};
