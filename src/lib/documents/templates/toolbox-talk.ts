import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml } from "./registry";

export const toolboxTalkTemplate: DocumentTemplate = {
  slug: "toolbox-talk",
  name: "Toolbox Talk / Safety Meeting",
  category: "OTHER",
  description:
    "Documented weekly safety meeting required on most construction sites. OSHA best practice and often contractually required by GCs. Records attendees, topic, discussion points, and signatures as proof of safety training.",
  fields: [
    { key: "talkDate", label: "Meeting Date", type: "date", required: true, section: "Meeting" },
    { key: "talkTime", label: "Start Time", type: "text", required: false, section: "Meeting", placeholder: "7:00 AM" },
    { key: "duration", label: "Duration (min)", type: "number", required: false, section: "Meeting", placeholder: "15" },
    { key: "projectName", label: "Project", type: "text", required: true, autoFillFrom: "project.name", section: "Meeting" },
    { key: "projectAddress", label: "Project Address", type: "text", required: false, autoFillFrom: "project.address", section: "Meeting" },
    { key: "leadBy", label: "Led By", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Meeting" },
    { key: "topic", label: "Topic", type: "text", required: true, section: "Topic", placeholder: "e.g., Fall Protection on Scaffolding" },
    { key: "relatedStandards", label: "Related OSHA Standards", type: "text", required: false, section: "Topic", placeholder: "29 CFR 1926.501, 1926.451" },
    { key: "hazardsDiscussed", label: "Hazards Discussed", type: "textarea", required: true, section: "Discussion" },
    { key: "controls", label: "Controls / Safe Practices", type: "textarea", required: true, section: "Discussion" },
    { key: "ppeRequired", label: "PPE Required", type: "textarea", required: false, section: "Discussion", placeholder: "Hard hat, safety glasses, fall harness, steel-toed boots" },
    { key: "questions", label: "Questions / Discussion", type: "textarea", required: false, section: "Discussion" },
    { key: "actionItems", label: "Action Items / Corrective Actions", type: "textarea", required: false, section: "Follow-Up" },
    { key: "attendees", label: "Attendees (one per line)", type: "textarea", required: true, section: "Attendance", placeholder: "John Smith\nJane Doe\nBob Johnson" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (k: string) => data[k] || "";
    const attendees = d("attendees").split("\n").filter((s) => s.trim());

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .attendee-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dotted #d1d5db; font-size:12px; }
  .attendee-row:last-child { border-bottom: none; }
  .sig-line { border-bottom:1px solid #1a1a2e; min-width:200px; height:18px; display:inline-block; margin-left:12px; }
  .topic-banner { background: ${brandColor}; color: white; padding: 12px 16px; font-weight:700; font-size:16px; margin-bottom:16px; border-radius:4px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div>
    <div class="doc-type">TOOLBOX TALK</div>
    <div class="doc-date">${d("talkDate")}${d("talkTime") ? ` · ${d("talkTime")}` : ""}</div>
  </div>
</div>

<div class="topic-banner">${d("topic")}</div>

<div class="section">
  <div class="row">
    <div class="field">
      <div class="field-label">Project</div>
      <div class="field-value">${d("projectName")}</div>
      ${d("projectAddress") ? `<div style="font-size:11px;color:#6b7280;">${d("projectAddress")}</div>` : ""}
    </div>
    <div class="field">
      <div class="field-label">Led By</div>
      <div class="field-value">${d("leadBy")}</div>
    </div>
    <div class="field">
      <div class="field-label">Duration</div>
      <div class="field-value">${d("duration") || "—"} min</div>
    </div>
  </div>
</div>

${d("relatedStandards") ? `
<div class="section" style="font-size:11px;color:#6b7280;margin-top:-12px;margin-bottom:16px;">
  <strong>OSHA:</strong> ${d("relatedStandards")}
</div>` : ""}

<div class="section">
  <div class="section-title">Hazards Discussed</div>
  <div style="white-space:pre-line;font-size:12px;">${d("hazardsDiscussed")}</div>
</div>

<div class="section">
  <div class="section-title">Controls &amp; Safe Practices</div>
  <div style="white-space:pre-line;font-size:12px;">${d("controls")}</div>
</div>

${d("ppeRequired") ? `
<div class="section">
  <div class="section-title">PPE Required</div>
  <div style="white-space:pre-line;font-size:12px;">${d("ppeRequired")}</div>
</div>` : ""}

${d("questions") ? `
<div class="section">
  <div class="section-title">Questions &amp; Discussion</div>
  <div style="white-space:pre-line;font-size:12px;">${d("questions")}</div>
</div>` : ""}

${d("actionItems") ? `
<div class="section">
  <div class="section-title">Action Items</div>
  <div class="callout" style="white-space:pre-line;">${d("actionItems")}</div>
</div>` : ""}

<div class="section">
  <div class="section-title">Attendance &amp; Acknowledgment</div>
  <p style="font-size:11px;color:#6b7280;margin-bottom:8px;">
    By signing below, I acknowledge attending this safety meeting and understand the hazards and controls discussed.
  </p>
  ${attendees.map((name) => `
    <div class="attendee-row">
      <span>${name}</span>
      <span>Signature: <span class="sig-line"></span></span>
    </div>
  `).join("")}
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Toolbox Talk - ${d("talkDate")}</span>
</div>

</body></html>`;
  },
};
