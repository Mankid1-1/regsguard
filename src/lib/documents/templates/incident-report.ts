import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml } from "./registry";

export const incidentReportTemplate: DocumentTemplate = {
  slug: "incident-report",
  name: "Incident / Injury Report (OSHA 301 Equivalent)",
  category: "OTHER",
  description:
    "Workplace injury/illness incident report, equivalent to OSHA Form 301. Required within 7 days of any recordable injury per 29 CFR 1904. Establishes the factual record for workers comp claims, OSHA investigations, and root-cause analysis.",
  fields: [
    { key: "reportDate", label: "Report Date", type: "date", required: true, section: "Report" },
    { key: "caseNumber", label: "Case Number", type: "text", required: true, section: "Report", placeholder: "Link to OSHA 300 log entry" },
    { key: "companyName", label: "Employer / Company", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Employer" },
    { key: "companyAddress", label: "Company Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Employer" },
    // Employee
    { key: "employeeName", label: "Injured Employee Name", type: "text", required: true, section: "Employee" },
    { key: "employeeAddress", label: "Employee Address", type: "text", required: false, section: "Employee" },
    { key: "employeeDob", label: "Date of Birth", type: "date", required: false, section: "Employee" },
    { key: "employeeHireDate", label: "Date Hired", type: "date", required: false, section: "Employee" },
    { key: "employeeGender", label: "Gender", type: "select", required: false, section: "Employee",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Prefer not to say", value: "not_specified" },
      ] },
    { key: "jobTitle", label: "Job Title", type: "text", required: true, section: "Employee", placeholder: "Journeyman Plumber" },
    // Incident
    { key: "incidentDate", label: "Date of Incident", type: "date", required: true, section: "Incident" },
    { key: "incidentTime", label: "Time of Incident", type: "text", required: true, section: "Incident", placeholder: "2:30 PM" },
    { key: "projectName", label: "Project / Job Site", type: "text", required: true, autoFillFrom: "project.name", section: "Incident" },
    { key: "projectAddress", label: "Job Site Address", type: "text", required: false, autoFillFrom: "project.address", section: "Incident" },
    { key: "incidentLocation", label: "Specific Location on Site", type: "text", required: true, section: "Incident", placeholder: "e.g., 3rd floor east mechanical room" },
    { key: "witnessNames", label: "Witnesses", type: "textarea", required: false, section: "Incident", placeholder: "One per line" },
    { key: "taskPerformed", label: "Task Being Performed", type: "textarea", required: true, section: "Incident", placeholder: "What was the employee doing immediately before the incident?" },
    { key: "incidentDescription", label: "Description of Incident", type: "textarea", required: true, section: "Incident", placeholder: "What happened? Be specific." },
    { key: "injuryDescription", label: "Nature of Injury", type: "textarea", required: true, section: "Incident", placeholder: "e.g., Laceration to right forearm, approximately 3 inches" },
    { key: "bodyPart", label: "Body Part Affected", type: "text", required: true, section: "Incident", placeholder: "Right forearm" },
    { key: "equipmentInvolved", label: "Equipment / Materials Involved", type: "text", required: false, section: "Incident" },
    // Treatment
    { key: "firstAid", label: "First Aid Given", type: "textarea", required: false, section: "Treatment" },
    { key: "medicalTreatment", label: "Medical Treatment", type: "select", required: true, section: "Treatment",
      options: [
        { label: "None required", value: "none" },
        { label: "First aid only", value: "first_aid" },
        { label: "Doctor visit (non-emergency)", value: "doctor" },
        { label: "Emergency room", value: "er" },
        { label: "Hospitalized overnight+", value: "hospitalized" },
        { label: "Fatality", value: "fatality" },
      ] },
    { key: "treatmentFacility", label: "Treatment Facility / Doctor", type: "text", required: false, section: "Treatment" },
    { key: "returnToWork", label: "Expected Return to Work Date", type: "date", required: false, section: "Treatment" },
    { key: "daysAwayFromWork", label: "Days Away from Work", type: "number", required: false, section: "Treatment" },
    { key: "daysRestricted", label: "Days of Restricted Work", type: "number", required: false, section: "Treatment" },
    // Root cause
    { key: "rootCause", label: "Root Cause Analysis", type: "textarea", required: false, section: "Root Cause" },
    { key: "correctiveActions", label: "Corrective Actions Taken", type: "textarea", required: false, section: "Root Cause" },
    { key: "preventiveMeasures", label: "Preventive Measures Going Forward", type: "textarea", required: false, section: "Root Cause" },
    // Reporter
    { key: "preparedBy", label: "Prepared By", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Reporter" },
    { key: "preparerTitle", label: "Preparer Title", type: "text", required: false, section: "Reporter", placeholder: "Safety Manager" },
    { key: "reportToOsha", label: "Report to OSHA?", type: "checkbox", required: false, section: "Reporter" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (k: string) => data[k] || "";
    const treatmentMap: Record<string, string> = {
      none: "No treatment required",
      first_aid: "First aid only",
      doctor: "Physician (non-emergency)",
      er: "Emergency room",
      hospitalized: "Hospitalized overnight or longer",
      fatality: "FATALITY",
    };

    const isSerious = ["er", "hospitalized", "fatality"].includes(d("medicalTreatment"));
    const isOshaReportable = isSerious || d("reportToOsha") === "true";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .severity-banner { background: ${isSerious ? "#dc2626" : "#f59e0b"}; color: white; padding:10px 16px; margin-bottom:16px; font-weight:700; font-size:13px; border-radius:4px; }
  .case-id { display:inline-block; background: #f3f4f6; padding:4px 12px; border-radius:4px; font-family:monospace; font-size:11px; }
  .field-box { background:#f9fafb; border-left:3px solid ${brandColor}; padding:10px 12px; margin:8px 0; font-size:12px; line-height:1.5; white-space:pre-line; }
  .confidential { background:#fee2e2; border:1px solid #fca5a5; padding:8px 12px; font-size:10px; color:#991b1b; margin-bottom:12px; border-radius:4px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div>
    <div class="doc-type">INCIDENT / INJURY REPORT</div>
    <div class="doc-date">Case ${d("caseNumber")} · ${d("reportDate")}</div>
  </div>
</div>

<div class="confidential">
  <strong>CONFIDENTIAL - ATTORNEY/CLIENT &amp; WORK PRODUCT</strong> - This report is prepared in the ordinary course of business for workers compensation and safety compliance purposes.
</div>

${isSerious ? `<div class="severity-banner">⚠ SERIOUS INCIDENT - OSHA notification may be required within 8-24 hours per 29 CFR 1904.39</div>` : ""}

<div class="section">
  <div class="section-title">Employer</div>
  <div>${d("companyName")}</div>
  <div style="font-size:11px;color:#6b7280;">${d("companyAddress")}</div>
</div>

<div class="section">
  <div class="section-title">Injured Employee</div>
  <div class="row">
    <div class="field"><div class="field-label">Name</div><div class="field-value">${d("employeeName")}</div></div>
    <div class="field"><div class="field-label">Job Title</div><div class="field-value">${d("jobTitle")}</div></div>
    <div class="field"><div class="field-label">Date Hired</div><div class="field-value">${d("employeeHireDate") || "—"}</div></div>
  </div>
  ${d("employeeAddress") ? `<div style="font-size:11px;color:#6b7280;margin-top:6px;">${d("employeeAddress")}</div>` : ""}
</div>

<div class="section">
  <div class="section-title">Incident Details</div>
  <div class="row">
    <div class="field"><div class="field-label">Date</div><div class="field-value">${d("incidentDate")}</div></div>
    <div class="field"><div class="field-label">Time</div><div class="field-value">${d("incidentTime")}</div></div>
    <div class="field"><div class="field-label">Project</div><div class="field-value">${d("projectName")}</div></div>
  </div>
  <div style="margin-top:8px;">
    <div class="field-label">Specific Location</div>
    <div style="font-size:12px;">${d("incidentLocation")}${d("projectAddress") ? ` — ${d("projectAddress")}` : ""}</div>
  </div>

  <div style="margin-top:12px;">
    <div class="field-label">Task Being Performed</div>
    <div class="field-box">${d("taskPerformed")}</div>
  </div>

  <div style="margin-top:12px;">
    <div class="field-label">What Happened</div>
    <div class="field-box">${d("incidentDescription")}</div>
  </div>

  ${d("equipmentInvolved") ? `
  <div style="margin-top:8px;">
    <div class="field-label">Equipment / Materials Involved</div>
    <div style="font-size:12px;">${d("equipmentInvolved")}</div>
  </div>` : ""}

  ${d("witnessNames") ? `
  <div style="margin-top:8px;">
    <div class="field-label">Witnesses</div>
    <div style="font-size:12px;white-space:pre-line;">${d("witnessNames")}</div>
  </div>` : ""}
</div>

<div class="section">
  <div class="section-title">Injury</div>
  <div class="row">
    <div class="field"><div class="field-label">Body Part Affected</div><div class="field-value">${d("bodyPart")}</div></div>
    <div class="field"><div class="field-label">Medical Treatment</div><div class="field-value">${treatmentMap[d("medicalTreatment")] || "—"}</div></div>
  </div>
  <div style="margin-top:8px;">
    <div class="field-label">Nature of Injury</div>
    <div class="field-box">${d("injuryDescription")}</div>
  </div>
  ${d("treatmentFacility") ? `
  <div style="margin-top:8px;">
    <div class="field-label">Treatment Facility / Physician</div>
    <div style="font-size:12px;">${d("treatmentFacility")}</div>
  </div>` : ""}
  <div class="row" style="margin-top:8px;">
    ${d("daysAwayFromWork") ? `<div class="field"><div class="field-label">Days Away</div><div class="field-value">${d("daysAwayFromWork")}</div></div>` : ""}
    ${d("daysRestricted") ? `<div class="field"><div class="field-label">Days Restricted</div><div class="field-value">${d("daysRestricted")}</div></div>` : ""}
    ${d("returnToWork") ? `<div class="field"><div class="field-label">Expected Return</div><div class="field-value">${d("returnToWork")}</div></div>` : ""}
  </div>
</div>

${(d("rootCause") || d("correctiveActions") || d("preventiveMeasures")) ? `
<div class="section">
  <div class="section-title">Root Cause &amp; Corrective Actions</div>
  ${d("rootCause") ? `<div class="field-label">Root Cause</div><div class="field-box">${d("rootCause")}</div>` : ""}
  ${d("correctiveActions") ? `<div class="field-label" style="margin-top:8px;">Corrective Actions</div><div class="field-box">${d("correctiveActions")}</div>` : ""}
  ${d("preventiveMeasures") ? `<div class="field-label" style="margin-top:8px;">Preventive Measures</div><div class="field-box">${d("preventiveMeasures")}</div>` : ""}
</div>` : ""}

<div class="section" style="margin-top:24px;">
  <div class="row">
    <div class="field">
      <div class="field-label">Prepared By</div>
      <div class="field-value">${d("preparedBy")}</div>
      ${d("preparerTitle") ? `<div style="font-size:11px;color:#6b7280;">${d("preparerTitle")}</div>` : ""}
    </div>
    <div class="field">
      <div class="field-label">Report Date</div>
      <div class="field-value">${d("reportDate")}</div>
    </div>
    <div class="field">
      <div style="border-bottom:1px solid #1a1a2e;height:30px;"></div>
      <div class="field-label">Signature</div>
    </div>
  </div>
</div>

${isOshaReportable ? `
<div style="margin-top:16px;background:#fef2f2;border:1px solid #fca5a5;padding:10px;border-radius:4px;font-size:11px;color:#991b1b;">
  <strong>OSHA Reporting:</strong> Fatalities must be reported within 8 hours. Inpatient hospitalizations, amputations, and loss of an eye must be reported within 24 hours. Online: www.osha.gov/pls/oshaweb/osha_report_form · Phone: 1-800-321-OSHA
</div>` : ""}

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Incident Report · Case ${d("caseNumber")}</span>
</div>

</body></html>`;
  },
};
