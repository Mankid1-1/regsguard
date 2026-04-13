import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const certificateOfCompletionTemplate: DocumentTemplate = {
  slug: "certificate-of-completion",
  name: "Certificate of Completion",
  category: "CERTIFICATE",
  description:
    "Professional certificate confirming project completion, including inspection results and final amounts.",
  fields: [
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Project Information" },
    { key: "projectAddress", label: "Project Address", type: "text", required: true, autoFillFrom: "project.address", section: "Project Information" },
    { key: "projectCity", label: "City", type: "text", required: true, section: "Project Information" },
    { key: "projectState", label: "State", type: "text", required: true, section: "Project Information" },
    { key: "projectZip", label: "ZIP", type: "text", required: true, section: "Project Information" },
    { key: "ownerName", label: "Owner / Client Name", type: "text", required: true, autoFillFrom: "client.name", section: "Parties" },
    { key: "contractorName", label: "Contractor Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Parties" },
    { key: "contractDate", label: "Original Contract Date", type: "date", required: true, section: "Contract Details" },
    { key: "completionDate", label: "Completion Date", type: "date", required: true, section: "Contract Details" },
    { key: "contractAmount", label: "Original Contract Amount", type: "currency", required: true, autoFillFrom: "project.contractAmount", section: "Contract Details" },
    { key: "finalAmount", label: "Final Contract Amount", type: "currency", required: true, section: "Contract Details" },
    { key: "description", label: "Work Description", type: "textarea", required: true, section: "Work Summary" },
    { key: "inspectionDate", label: "Inspection Date", type: "date", required: false, section: "Inspection" },
    { key: "inspectionResult", label: "Inspection Result", type: "select", required: false, options: [
      { label: "Passed", value: "Passed" },
      { label: "Conditional", value: "Conditional" },
      { label: "Failed", value: "Failed" },
    ], section: "Inspection" },
    { key: "punchListItems", label: "Punch List Items", type: "textarea", required: false, section: "Inspection" },
    { key: "notes", label: "Notes", type: "textarea", required: false, section: "Additional" },
  ],

  generateHtml(data, brandName, brandColor) {
    const d = (key: string) => data[key] || "";

    const inspectionColor =
      d("inspectionResult") === "Passed" ? "#16a34a" :
      d("inspectionResult") === "Conditional" ? "#d97706" :
      d("inspectionResult") === "Failed" ? "#dc2626" : brandColor;

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .completion-stamp { text-align: center; margin: 24px auto; padding: 24px; border: 4px solid ${brandColor}; border-radius: 12px; max-width: 420px; }
  .completion-stamp .title { font-size: 22px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 1px; }
  .completion-stamp .project { font-size: 16px; font-weight: 600; margin-top: 8px; }
  .completion-stamp .date { font-size: 13px; color: #6b7280; margin-top: 4px; }
  .inspection-badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
  .amounts-row { display: flex; gap: 24px; margin-top: 8px; }
  .amount-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center; }
  .amount-card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
  .amount-card .value { font-size: 18px; font-weight: 700; color: ${brandColor}; margin-top: 4px; }
</style></head><body>

<div class="header">
  <div>
    <div class="brand">${brandName}</div>
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Certificate of Completion</div>
  </div>
  <div>
    <div class="doc-type">CERTIFICATE</div>
    <div class="doc-date">of Completion</div>
  </div>
</div>

<div class="completion-stamp">
  <div class="title">Project Complete</div>
  <div class="project">${d("projectName")}</div>
  <div class="date">Completed on ${d("completionDate")}</div>
</div>

<div class="section">
  <div class="section-title">Project Information</div>
  <div class="row">
    <div class="field"><div class="field-label">Project Name</div><div class="field-value">${d("projectName")}</div></div>
    <div class="field"><div class="field-label">Address</div><div class="field-value">${d("projectAddress")}, ${d("projectCity")}, ${d("projectState")} ${d("projectZip")}</div></div>
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
  <div class="section-title">Contract Details</div>
  <div class="row">
    <div class="field"><div class="field-label">Contract Date</div><div class="field-value">${d("contractDate")}</div></div>
    <div class="field"><div class="field-label">Completion Date</div><div class="field-value">${d("completionDate")}</div></div>
  </div>
  <div class="amounts-row">
    <div class="amount-card">
      <div class="label">Original Contract Amount</div>
      <div class="value">$${d("contractAmount")}</div>
    </div>
    <div class="amount-card">
      <div class="label">Final Contract Amount</div>
      <div class="value">$${d("finalAmount")}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Work Description</div>
  <div class="callout">${d("description")}</div>
</div>

${d("inspectionDate") || d("inspectionResult") ? `
<div class="section">
  <div class="section-title">Inspection</div>
  <div class="row">
    <div class="field"><div class="field-label">Inspection Date</div><div class="field-value">${d("inspectionDate")}</div></div>
    <div class="field"><div class="field-label">Result</div><div class="field-value"><span class="inspection-badge" style="background:${inspectionColor};">${d("inspectionResult")}</span></div></div>
  </div>
  ${d("punchListItems") ? `<div style="margin-top:8px;"><div class="field-label">Punch List Items</div><div class="callout">${d("punchListItems")}</div></div>` : ""}
</div>
` : ""}

${d("notes") ? `
<div class="section">
  <div class="section-title">Notes</div>
  <div class="callout">${d("notes")}</div>
</div>
` : ""}

<div style="display:flex;gap:48px;margin-top:40px;">
  <div style="flex:1;"><div class="signature-line">Owner / Client Signature &amp; Date</div></div>
  <div style="flex:1;"><div class="signature-line">Contractor Signature &amp; Date</div></div>
</div>

<div class="footer">
  <span>Generated by <span class="brand-mark">${brandName}</span></span>
  <span>Certificate of Completion</span>
</div>

</body></html>`;
  },
};
