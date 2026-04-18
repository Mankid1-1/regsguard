import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const dailyLogTemplate: DocumentTemplate = {
  slug: "daily-job-log",
  name: "Daily Job Log / Field Report",
  category: "SAFETY",
  description:
    "Daily field report documenting weather, crew, work performed, materials delivered, and any incidents. Defends workers' comp claims, insurance disputes, and contract delays. Strongly recommended for any project over $5K.",
  fields: [
    { key: "logDate", label: "Date", type: "date", required: true, section: "Header" },
    { key: "projectName", label: "Project Name", type: "text", required: true, autoFillFrom: "project.name", section: "Header" },
    { key: "projectAddress", label: "Project Address", type: "text", required: false, section: "Header" },
    { key: "preparedBy", label: "Prepared By", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Header" },
    { key: "weather", label: "Weather", type: "text", required: false, placeholder: "e.g. Sunny, 72°F, light wind", section: "Conditions" },
    { key: "tempHigh", label: "Temp High (°F)", type: "number", required: false, section: "Conditions" },
    { key: "tempLow", label: "Temp Low (°F)", type: "number", required: false, section: "Conditions" },
    { key: "crewMembers", label: "Crew Present", type: "textarea", required: true, placeholder: "Names + hours, e.g. J. Smith (8h), M. Jones (6h)", section: "Crew" },
    { key: "subcontractors", label: "Subcontractors On Site", type: "textarea", required: false, section: "Crew" },
    { key: "workPerformed", label: "Work Performed Today", type: "textarea", required: true, section: "Work" },
    { key: "materialsDelivered", label: "Materials Delivered", type: "textarea", required: false, section: "Work" },
    { key: "equipmentOnSite", label: "Equipment On Site", type: "textarea", required: false, section: "Work" },
    { key: "delays", label: "Delays / Issues", type: "textarea", required: false, section: "Issues" },
    { key: "safetyIncidents", label: "Safety Incidents (or 'None')", type: "textarea", required: true, placeholder: "None", section: "Issues" },
    { key: "visitors", label: "Visitors / Inspections", type: "textarea", required: false, section: "Issues" },
    { key: "notes", label: "Other Notes", type: "textarea", required: false, section: "Notes" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  pre { white-space: pre-wrap; font-family: inherit; font-size: 12px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">DAILY LOG</div><div class="doc-date">${d("logDate")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Project</div><div class="field-value">${d("projectName")}</div></div>
    <div class="field"><div class="field-label">Address</div><div class="field-value">${d("projectAddress") || "—"}</div></div>
    <div class="field"><div class="field-label">Prepared By</div><div class="field-value">${d("preparedBy")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Conditions</div>
  <div class="row">
    <div class="field"><div class="field-label">Weather</div><div class="field-value">${d("weather") || "—"}</div></div>
    <div class="field"><div class="field-label">Temp</div><div class="field-value">${d("tempHigh") ? `H ${d("tempHigh")}° / L ${d("tempLow") || "—"}°` : "—"}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Crew</div>
  <pre>${d("crewMembers")}</pre>
  ${d("subcontractors") ? `<div style="margin-top:8px;"><div class="field-label">Subcontractors</div><pre>${d("subcontractors")}</pre></div>` : ""}
</div>

<div class="section">
  <div class="section-title">Work Performed</div>
  <pre>${d("workPerformed")}</pre>
</div>

${d("materialsDelivered") ? `<div class="section"><div class="section-title">Materials Delivered</div><pre>${d("materialsDelivered")}</pre></div>` : ""}
${d("equipmentOnSite") ? `<div class="section"><div class="section-title">Equipment</div><pre>${d("equipmentOnSite")}</pre></div>` : ""}

${d("delays") ? `<div class="section"><div class="section-title">Delays / Issues</div><div class="callout">${d("delays")}</div></div>` : ""}

<div class="section">
  <div class="section-title">Safety Incidents</div>
  <div class="callout">${d("safetyIncidents") || "None"}</div>
</div>

${d("visitors") ? `<div class="section"><div class="section-title">Visitors / Inspections</div><pre>${d("visitors")}</pre></div>` : ""}
${d("notes") ? `<div class="section"><div class="section-title">Notes</div><pre>${d("notes")}</pre></div>` : ""}

<div style="margin-top:32px;">
  <div class="signature-line">Signed by ${d("preparedBy")} — ${d("logDate")}</div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Daily Log · ${d("logDate")}</span>
</div>

</body></html>`;
  },
};
