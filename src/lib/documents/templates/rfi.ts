import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const rfiTemplate: DocumentTemplate = {
  slug: "request-for-information",
  name: "Request for Information (RFI)",
  category: "OTHER",
  description:
    "Formal request to the architect, GC, or owner asking for clarification on plans, specifications, or scope. Standard on commercial projects. Tracked by RFI number for the project record.",
  fields: [
    { key: "rfiNumber", label: "RFI Number", type: "text", required: true, placeholder: "RFI-001", section: "Header" },
    { key: "rfiDate", label: "RFI Date", type: "date", required: true, section: "Header" },
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Header" },
    { key: "projectAddress", label: "Project Address", type: "text", required: false, section: "Header" },
    { key: "fromName", label: "From (Your Name)", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Routing" },
    { key: "fromCompany", label: "From Company", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Routing" },
    { key: "toName", label: "To (Recipient Name)", type: "text", required: true, section: "Routing" },
    { key: "toCompany", label: "To Company / Role", type: "text", required: true, section: "Routing" },
    { key: "ccList", label: "CC", type: "text", required: false, section: "Routing" },
    { key: "subject", label: "Subject", type: "text", required: true, placeholder: "Clarification: column footing detail at gridline B-3", section: "Subject" },
    { key: "specReference", label: "Drawing / Spec Reference", type: "text", required: false, placeholder: "A-301, S-201, Spec section 03 30 00", section: "Subject" },
    { key: "priority", label: "Priority", type: "select", required: true,
      options: [
        { label: "Low — informational", value: "low" },
        { label: "Normal — needed within 5 days", value: "normal" },
        { label: "High — needed within 48h", value: "high" },
        { label: "Critical — work stopped", value: "critical" },
      ], section: "Subject" },
    { key: "responseNeededBy", label: "Response Needed By", type: "date", required: true, section: "Subject" },
    { key: "question", label: "Question / Issue", type: "textarea", required: true, section: "Body" },
    { key: "proposedSolution", label: "Proposed Solution (if any)", type: "textarea", required: false, section: "Body" },
    { key: "scheduleImpact", label: "Schedule Impact (days)", type: "number", required: false, section: "Impact" },
    { key: "costImpact", label: "Cost Impact ($)", type: "currency", required: false, section: "Impact" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    const priorityColors: Record<string, string> = {
      low: "#6b7280", normal: "#0891b2", high: "#ea580c", critical: "#dc2626",
    };
    const pColor = priorityColors[d("priority")] || "#6b7280";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .priority-pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: white; background: ${pColor}; }
  .response-box { border: 2px dashed #cbd5e1; padding: 24px; margin-top: 24px; min-height: 120px; }
  .response-box .lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">RFI #${d("rfiNumber")}</div><div class="doc-date">${d("rfiDate")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Project</div><div class="field-value">${d("projectName")}</div><div style="font-size:11px;color:#6b7280;">${d("projectAddress") || ""}</div></div>
    <div class="field"><div class="field-label">Priority</div><div><span class="priority-pill">${d("priority")}</span></div></div>
    <div class="field"><div class="field-label">Response Needed By</div><div class="field-value">${d("responseNeededBy")}</div></div>
  </div>
</div>

<div class="section">
  <div class="row">
    <div class="field">
      <div class="field-label">From</div>
      <div class="field-value">${d("fromName")}</div>
      <div style="font-size:11px;color:#6b7280;">${d("fromCompany")}</div>
    </div>
    <div class="field">
      <div class="field-label">To</div>
      <div class="field-value">${d("toName")}</div>
      <div style="font-size:11px;color:#6b7280;">${d("toCompany")}</div>
    </div>
    ${d("ccList") ? `<div class="field"><div class="field-label">CC</div><div class="field-value" style="font-size:11px;">${d("ccList")}</div></div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-title">Subject</div>
  <div class="field-value large">${d("subject")}</div>
  ${d("specReference") ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">Reference: ${d("specReference")}</div>` : ""}
</div>

<div class="section">
  <div class="section-title">Question</div>
  <div class="callout">${d("question")}</div>
</div>

${d("proposedSolution") ? `
<div class="section">
  <div class="section-title">Proposed Solution</div>
  <div class="callout">${d("proposedSolution")}</div>
</div>
` : ""}

${(d("scheduleImpact") || d("costImpact")) ? `
<div class="section">
  <div class="section-title">Impact</div>
  <div class="row">
    ${d("scheduleImpact") ? `<div class="field"><div class="field-label">Schedule</div><div class="field-value">+${d("scheduleImpact")} days if unanswered</div></div>` : ""}
    ${d("costImpact") ? `<div class="field"><div class="field-label">Cost</div><div class="field-value">$${d("costImpact")}</div></div>` : ""}
  </div>
</div>
` : ""}

<div class="response-box">
  <div class="lbl">Response (filled in by recipient)</div>
  <div style="height:80px;"></div>
  <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;">
    <span>Signed: _________________________</span>
    <span>Date: _________________________</span>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>RFI #${d("rfiNumber")}</span>
</div>

</body></html>`;
  },
};
