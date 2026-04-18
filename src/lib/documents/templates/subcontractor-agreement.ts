import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const subcontractorAgreementTemplate: DocumentTemplate = {
  slug: "subcontractor-agreement",
  name: "Subcontractor Agreement",
  category: "CONTRACT",
  description:
    "Subcontractor agreement covering scope, payment, insurance, and liability terms",
  fields: [
    // Parties
    { key: "contractorName", label: "Contractor Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Parties" },
    { key: "contractorAddress", label: "Contractor Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Parties" },
    { key: "subcontractorName", label: "Subcontractor Name", type: "text", required: true, autoFillFrom: "client.name", section: "Parties" },
    { key: "subcontractorAddress", label: "Subcontractor Address", type: "text", required: true, autoFillFrom: "client.address", section: "Parties" },
    // Project
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Project" },
    { key: "projectAddress", label: "Project Address", type: "text", required: true, autoFillFrom: "project.address", section: "Project" },
    // Scope & Timeline
    { key: "scopeOfWork", label: "Scope of Work", type: "textarea", required: true, section: "Scope & Timeline" },
    { key: "startDate", label: "Start Date", type: "date", required: true, section: "Scope & Timeline" },
    { key: "completionDate", label: "Completion Date", type: "date", required: true, section: "Scope & Timeline" },
    // Payment
    { key: "contractAmount", label: "Contract Amount", type: "currency", required: true, autoFillFrom: "project.contractAmount", section: "Payment" },
    { key: "paymentTerms", label: "Payment Terms", type: "select", required: true, options: [
      { label: "Net 15", value: "Net 15" },
      { label: "Net 30", value: "Net 30" },
      { label: "Net 45", value: "Net 45" },
      { label: "Upon Completion", value: "Upon Completion" },
    ], section: "Payment" },
    { key: "retainagePercent", label: "Retainage Percent (%)", type: "number", required: false, section: "Payment" },
    // Requirements
    { key: "insuranceRequired", label: "Insurance Required", type: "checkbox", required: false, section: "Requirements" },
    { key: "licenseRequired", label: "License Required", type: "checkbox", required: false, section: "Requirements" },
    // Terms
    { key: "changeOrderProcess", label: "Change Order Process", type: "textarea", required: false, section: "Terms" },
    { key: "warrantyPeriod", label: "Warranty Period", type: "text", required: false, section: "Terms" },
    { key: "disputeResolution", label: "Dispute Resolution", type: "select", required: false, options: [
      { label: "Arbitration", value: "Arbitration" },
      { label: "Mediation", value: "Mediation" },
      { label: "Litigation", value: "Litigation" },
    ], section: "Terms" },
    { key: "governingState", label: "Governing State", type: "text", required: false, autoFillFrom: "profile.state", section: "Terms" },
  ],

  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";

    const checkMark = (key: string) =>
      d(key) === "true" || d(key) === "on" || d(key) === "yes"
        ? `<span style="color:${brandColor};font-weight:700;">&#10003; Yes</span>`
        : `<span style="color:#9ca3af;">&#10007; No</span>`;

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .agreement-intro { font-size: 12px; line-height: 1.7; color: #374151; margin-bottom: 20px; }
  .clause { margin-bottom: 8px; font-size: 12px; line-height: 1.6; color: #374151; }
  .clause-number { font-weight: 700; color: ${brandColor}; }
  .requirements-grid { display: flex; gap: 32px; margin-top: 8px; }
  .requirement-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
</style></head><body>

<div class="header">
  <div>
    ${brandHtml(brandName, branding)}
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Subcontractor Agreement</div>
  </div>
  <div>
    <div class="doc-type">SUBCONTRACTOR AGREEMENT</div>
  </div>
</div>

<div class="agreement-intro">
  This Subcontractor Agreement is entered into between <strong>${d("contractorName")}</strong> ("Contractor")
  and <strong>${d("subcontractorName")}</strong> ("Subcontractor") for the project described below.
</div>

<div class="section">
  <div class="section-title">Parties</div>
  <div class="row">
    <div class="field" style="flex:1;">
      <div class="field-label">Contractor</div>
      <div class="field-value">${d("contractorName")}</div>
      <div style="font-size:12px;color:#4b5563;">${d("contractorAddress")}</div>
    </div>
    <div class="field" style="flex:1;">
      <div class="field-label">Subcontractor</div>
      <div class="field-value">${d("subcontractorName")}</div>
      <div style="font-size:12px;color:#4b5563;">${d("subcontractorAddress")}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Project</div>
  <div class="row">
    <div class="field"><div class="field-label">Project Name</div><div class="field-value">${d("projectName")}</div></div>
    <div class="field"><div class="field-label">Project Address</div><div class="field-value">${d("projectAddress")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Scope &amp; Timeline</div>
  <div class="row">
    <div class="field">
      <div class="field-label">Scope of Work</div>
      <div class="callout">${d("scopeOfWork")}</div>
    </div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Start Date</div><div class="field-value">${d("startDate")}</div></div>
    <div class="field"><div class="field-label">Completion Date</div><div class="field-value">${d("completionDate")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Payment</div>
  <div class="row">
    <div class="field"><div class="field-label">Contract Amount</div><div class="field-value large">$${d("contractAmount")}</div></div>
    <div class="field"><div class="field-label">Payment Terms</div><div class="field-value">${d("paymentTerms")}</div></div>
    ${d("retainagePercent") ? `<div class="field"><div class="field-label">Retainage</div><div class="field-value">${d("retainagePercent")}%</div></div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-title">Requirements</div>
  <div class="requirements-grid">
    <div class="requirement-item">${checkMark("insuranceRequired")} Insurance Required</div>
    <div class="requirement-item">${checkMark("licenseRequired")} License Required</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Terms</div>
  ${d("changeOrderProcess") ? `
  <div class="row">
    <div class="field">
      <div class="field-label">Change Order Process</div>
      <div class="callout">${d("changeOrderProcess")}</div>
    </div>
  </div>
  ` : ""}
  <div class="row">
    ${d("warrantyPeriod") ? `<div class="field"><div class="field-label">Warranty Period</div><div class="field-value">${d("warrantyPeriod")}</div></div>` : ""}
    ${d("disputeResolution") ? `<div class="field"><div class="field-label">Dispute Resolution</div><div class="field-value">${d("disputeResolution")}</div></div>` : ""}
    ${d("governingState") ? `<div class="field"><div class="field-label">Governing State</div><div class="field-value">${d("governingState")}</div></div>` : ""}
  </div>
</div>

<div style="display:flex;gap:48px;margin-top:40px;">
  <div style="flex:1;">
    <div class="signature-line">Contractor Signature &amp; Date</div>
  </div>
  <div style="flex:1;">
    <div class="signature-line">Subcontractor Signature &amp; Date</div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Subcontractor Agreement &mdash; ${d("projectName")}</span>
</div>

</body></html>`;
  },
};
