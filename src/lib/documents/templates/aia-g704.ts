import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const aiaG704Template: DocumentTemplate = {
  slug: "aia-g704-substantial-completion",
  name: "AIA G704-style Certificate of Substantial Completion",
  category: "CERTIFICATE",
  description:
    "Industry-standard certificate establishing the date of Substantial Completion, which triggers warranty periods, final payment, and transfer of project responsibility. Modeled on AIA Document G704.",
  fields: [
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Project" },
    { key: "projectAddress", label: "Project Address", type: "text", required: true, section: "Project" },
    { key: "ownerName", label: "Owner", type: "text", required: true, section: "Parties" },
    { key: "contractorName", label: "Contractor", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Parties" },
    { key: "architectName", label: "Architect", type: "text", required: false, section: "Parties" },
    { key: "contractDate", label: "Contract Date", type: "date", required: true, section: "Contract" },
    { key: "scopeDescription", label: "Scope of Work Substantially Complete", type: "textarea", required: true, section: "Scope" },
    { key: "substantialCompletionDate", label: "Date of Substantial Completion", type: "date", required: true, section: "Completion" },
    { key: "warrantyStartDate", label: "Warranty Period Start", type: "date", required: true, section: "Completion" },
    { key: "punchListAttached", label: "Punch list attached?", type: "select", required: true,
      options: [{ label: "Yes — see attached", value: "yes" }, { label: "No — none", value: "no" }],
      section: "Completion" },
    { key: "ownerResponsibilityDate", label: "Owner assumes responsibility (utilities, security, insurance)", type: "date", required: true, section: "Responsibilities" },
    { key: "contractorResponsibilityNote", label: "Contractor responsibilities post-completion", type: "textarea", required: false, section: "Responsibilities" },
    { key: "architectSignName", label: "Architect Sign Name", type: "text", required: false, section: "Signatures" },
    { key: "architectSignDate", label: "Architect Sign Date", type: "date", required: false, section: "Signatures" },
    { key: "contractorSignName", label: "Contractor Sign Name", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Signatures" },
    { key: "contractorSignDate", label: "Contractor Sign Date", type: "date", required: true, section: "Signatures" },
    { key: "ownerSignName", label: "Owner Sign Name", type: "text", required: true, section: "Signatures" },
    { key: "ownerSignDate", label: "Owner Sign Date", type: "date", required: true, section: "Signatures" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .key-date { background: #f8fafc; border-left: 4px solid ${brandColor}; padding: 12px 16px; margin: 12px 0; }
  .key-date .lbl { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px; }
  .key-date .val { font-size: 20px; font-weight: 700; color: ${brandColor}; margin-top: 2px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 32px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">CERTIFICATE OF<br>SUBSTANTIAL COMPLETION</div><div class="doc-date">${d("substantialCompletionDate")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Project</div><div class="field-value">${d("projectName")}</div><div style="font-size:11px;color:#6b7280;">${d("projectAddress")}</div></div>
    <div class="field"><div class="field-label">Contract Date</div><div class="field-value">${d("contractDate")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Owner</div><div class="field-value">${d("ownerName")}</div></div>
    <div class="field"><div class="field-label">Contractor</div><div class="field-value">${d("contractorName")}</div></div>
    <div class="field"><div class="field-label">Architect</div><div class="field-value">${d("architectName") || "—"}</div></div>
  </div>
</div>

<div class="key-date">
  <div class="lbl">Date of Substantial Completion</div>
  <div class="val">${d("substantialCompletionDate")}</div>
</div>

<div class="section">
  <div class="section-title">Scope of Work Substantially Complete</div>
  <div class="callout">${d("scopeDescription")}</div>
</div>

<div class="row">
  <div class="field"><div class="field-label">Warranty Period Begins</div><div class="field-value">${d("warrantyStartDate")}</div></div>
  <div class="field"><div class="field-label">Owner Assumes Responsibility</div><div class="field-value">${d("ownerResponsibilityDate")}</div></div>
  <div class="field"><div class="field-label">Punch List</div><div class="field-value">${d("punchListAttached") === "yes" ? "Attached" : "None"}</div></div>
</div>

${d("contractorResponsibilityNote") ? `
<div class="section">
  <div class="section-title">Contractor Responsibilities After Substantial Completion</div>
  <div class="callout">${d("contractorResponsibilityNote")}</div>
</div>
` : ""}

<div class="callout">
  <strong>Effect:</strong> The work or designated portion thereof is sufficiently complete in accordance with the Contract Documents so the Owner can occupy or utilize the Work for its intended use. This Certificate establishes the date of Substantial Completion, the date of commencement of warranties, and the time within which the Contractor shall complete remaining items of work.
</div>

<div class="sig-grid">
  <div>
    <div class="signature-line">${d("architectSignName") || "Architect"}</div>
    <div style="font-size:10px;color:#6b7280;margin-top:2px;">Date: ${d("architectSignDate") || "—"}</div>
  </div>
  <div>
    <div class="signature-line">${d("contractorSignName")}</div>
    <div style="font-size:10px;color:#6b7280;margin-top:2px;">Contractor · Date: ${d("contractorSignDate")}</div>
  </div>
  <div>
    <div class="signature-line">${d("ownerSignName")}</div>
    <div style="font-size:10px;color:#6b7280;margin-top:2px;">Owner · Date: ${d("ownerSignDate")}</div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Substantial Completion · ${d("substantialCompletionDate")}</span>
</div>

</body></html>`;
  },
};
