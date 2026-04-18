import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const jhaTemplate: DocumentTemplate = {
  slug: "job-hazard-analysis",
  name: "Job Hazard Analysis (JHA) / Pre-Task Plan",
  category: "SAFETY",
  description:
    "Pre-task safety analysis required by OSHA 1926.20(b)(2) and most GC safety programs. Identifies hazards for each work step and the controls used to mitigate them. Sign every morning before crew starts work.",
  fields: [
    { key: "jhaDate", label: "Date", type: "date", required: true, section: "Header" },
    { key: "projectName", label: "Project / Location", type: "text", required: true, autoFillFrom: "project.name", section: "Header" },
    { key: "taskDescription", label: "Task Being Performed", type: "text", required: true, section: "Header" },
    { key: "preparedBy", label: "Prepared By", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Header" },
    { key: "supervisor", label: "Supervisor on Site", type: "text", required: true, section: "Header" },
    { key: "ppeRequired", label: "PPE Required", type: "textarea", required: true, placeholder: "Hard hat, safety glasses, gloves, steel-toe boots, hi-vis", section: "PPE" },
    // 6 hazard rows
    ...Array.from({ length: 6 }, (_, i) => i + 1).flatMap((i) => [
      { key: `step${i}Description`, label: `Step ${i}: Work Step Description`, type: "textarea" as const, required: false, section: `Step ${i}` },
      { key: `step${i}Hazards`, label: `Step ${i}: Potential Hazards`, type: "textarea" as const, required: false, section: `Step ${i}` },
      { key: `step${i}Controls`, label: `Step ${i}: Controls / Mitigations`, type: "textarea" as const, required: false, section: `Step ${i}` },
    ]),
    { key: "emergencyProcedures", label: "Emergency Procedures (911 + nearest hospital)", type: "textarea", required: true, section: "Emergency" },
    { key: "crewSignatures", label: "Crew Sign-Off (names — they should physically sign printed copy)", type: "textarea", required: true, section: "Sign-Off" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    const stepRows = Array.from({ length: 6 }, (_, i) => i + 1)
      .filter((i) => d(`step${i}Description`))
      .map((i) => `
        <tr>
          <td style="font-weight:600;width:30%;">${d(`step${i}Description`)}</td>
          <td style="width:35%;">${d(`step${i}Hazards`)}</td>
          <td style="width:35%;">${d(`step${i}Controls`)}</td>
        </tr>
      `).join("");

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  table td { vertical-align: top; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 12px; margin: 0; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">JOB HAZARD ANALYSIS</div><div class="doc-date">${d("jhaDate")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Project / Location</div><div class="field-value">${d("projectName")}</div></div>
    <div class="field"><div class="field-label">Task</div><div class="field-value">${d("taskDescription")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Prepared By</div><div class="field-value">${d("preparedBy")}</div></div>
    <div class="field"><div class="field-label">Site Supervisor</div><div class="field-value">${d("supervisor")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Required PPE</div>
  <div class="callout">${d("ppeRequired")}</div>
</div>

<div class="section">
  <div class="section-title">Steps · Hazards · Controls</div>
  ${stepRows ? `<table>
    <thead><tr><th>Work Step</th><th>Potential Hazards</th><th>Controls</th></tr></thead>
    <tbody>${stepRows}</tbody>
  </table>` : `<div class="callout">No steps documented.</div>`}
</div>

<div class="section">
  <div class="section-title">Emergency Procedures</div>
  <div class="callout">${d("emergencyProcedures")}</div>
</div>

<div class="section">
  <div class="section-title">Crew Sign-Off</div>
  <pre>${d("crewSignatures")}</pre>
  <div style="margin-top:16px;font-size:11px;color:#6b7280;">By signing, each crew member acknowledges they have reviewed this JHA and understand the hazards and controls.</div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>JHA · ${d("jhaDate")}</span>
</div>

</body></html>`;
  },
};
