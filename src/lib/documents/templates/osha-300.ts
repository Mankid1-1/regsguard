import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const osha300Template: DocumentTemplate = {
  slug: "osha-300-log",
  name: "OSHA Form 300 — Log of Work-Related Injuries & Illnesses",
  category: "SAFETY",
  description:
    "Required by OSHA for any establishment with 10+ employees (with limited industry exceptions). Log every recordable work-related injury or illness. Maintain for 5 years.",
  fields: [
    { key: "year", label: "Calendar Year", type: "text", required: true, section: "Header" },
    { key: "establishmentName", label: "Establishment Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Header" },
    { key: "establishmentAddress", label: "Establishment Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Header" },
    { key: "industryDescription", label: "Industry Description", type: "text", required: true, placeholder: "e.g. Plumbing contractor", section: "Header" },
    { key: "naicsCode", label: "NAICS Code", type: "text", required: false, section: "Header" },
    // Up to 4 case rows
    ...Array.from({ length: 6 }, (_, i) => i + 1).flatMap((i) => [
      { key: `case${i}Number`, label: `Case ${i}: Case #`, type: "text" as const, required: false, section: `Case ${i}` },
      { key: `case${i}EmployeeName`, label: `Case ${i}: Employee Name`, type: "text" as const, required: false, section: `Case ${i}` },
      { key: `case${i}JobTitle`, label: `Case ${i}: Job Title`, type: "text" as const, required: false, section: `Case ${i}` },
      { key: `case${i}DateOfInjury`, label: `Case ${i}: Date of Injury`, type: "date" as const, required: false, section: `Case ${i}` },
      { key: `case${i}Location`, label: `Case ${i}: Where Event Occurred`, type: "text" as const, required: false, section: `Case ${i}` },
      { key: `case${i}Description`, label: `Case ${i}: Description (object/substance + body part)`, type: "textarea" as const, required: false, section: `Case ${i}` },
      { key: `case${i}Outcome`, label: `Case ${i}: Outcome`, type: "select" as const, required: false,
        options: [
          { label: "Death", value: "death" }, { label: "Days away from work", value: "days_away" },
          { label: "Job transfer/restriction", value: "transfer" }, { label: "Other recordable", value: "other" },
        ], section: `Case ${i}` },
      { key: `case${i}DaysAway`, label: `Case ${i}: Days away`, type: "number" as const, required: false, section: `Case ${i}` },
      { key: `case${i}DaysRestricted`, label: `Case ${i}: Days on transfer/restriction`, type: "number" as const, required: false, section: `Case ${i}` },
    ]),
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    const rows = Array.from({ length: 6 }, (_, i) => i + 1)
      .filter((i) => d(`case${i}EmployeeName`))
      .map((i) => `
        <tr>
          <td>${d(`case${i}Number`)}</td>
          <td>${d(`case${i}EmployeeName`)}</td>
          <td>${d(`case${i}JobTitle`)}</td>
          <td>${d(`case${i}DateOfInjury`)}</td>
          <td>${d(`case${i}Location`)}</td>
          <td>${d(`case${i}Description`)}</td>
          <td>${d(`case${i}Outcome`)}</td>
          <td style="text-align:center;">${d(`case${i}DaysAway`) || "—"}</td>
          <td style="text-align:center;">${d(`case${i}DaysRestricted`) || "—"}</td>
        </tr>
      `).join("");

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  table th { font-size: 9px; }
  table td { font-size: 11px; }
  @page { size: Letter landscape; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">OSHA FORM 300</div><div class="doc-date">Calendar Year ${d("year")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Establishment</div><div class="field-value">${d("establishmentName")}</div></div>
    <div class="field"><div class="field-label">Address</div><div class="field-value">${d("establishmentAddress")}</div></div>
    <div class="field"><div class="field-label">Industry</div><div class="field-value">${d("industryDescription")}${d("naicsCode") ? ` (NAICS ${d("naicsCode")})` : ""}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Recordable Cases</div>
  ${rows ? `<table>
    <thead>
      <tr><th>Case #</th><th>Employee</th><th>Job Title</th><th>Date</th><th>Location</th><th>Description</th><th>Outcome</th><th>Days Away</th><th>Days Restricted</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>` : `<div class="callout">No recordable cases for this period.</div>`}
</div>

<div class="callout" style="margin-top:24px;">
  <strong>Public reporting burden:</strong> Public reporting burden for this collection of information is estimated to vary from 10 minutes to 30 minutes per response. Maintain this log for 5 years following the end of the calendar year that these records cover.
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>OSHA 300 · ${d("year")}</span>
</div>

</body></html>`;
  },
};

export const osha300aTemplate: DocumentTemplate = {
  slug: "osha-300a-summary",
  name: "OSHA Form 300A — Annual Summary",
  category: "SAFETY",
  description:
    "Annual summary of work-related injuries and illnesses. Must be posted in workplace from Feb 1 to Apr 30 each year. Required for establishments with 10+ employees.",
  fields: [
    { key: "year", label: "Calendar Year", type: "text", required: true, section: "Header" },
    { key: "establishmentName", label: "Establishment Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Header" },
    { key: "establishmentAddress", label: "Establishment Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Header" },
    { key: "industryDescription", label: "Industry Description", type: "text", required: true, section: "Header" },
    { key: "naicsCode", label: "NAICS Code", type: "text", required: false, section: "Header" },
    { key: "averageEmployees", label: "Annual average # of employees", type: "number", required: true, section: "Workforce" },
    { key: "totalHoursWorked", label: "Total hours worked by all employees", type: "number", required: true, section: "Workforce" },
    { key: "deaths", label: "Total deaths", type: "number", required: true, section: "Totals" },
    { key: "daysAwayCases", label: "Cases with days away from work", type: "number", required: true, section: "Totals" },
    { key: "transferCases", label: "Cases with job transfer/restriction", type: "number", required: true, section: "Totals" },
    { key: "otherRecordable", label: "Other recordable cases", type: "number", required: true, section: "Totals" },
    { key: "totalDaysAway", label: "Total days away from work", type: "number", required: true, section: "Days" },
    { key: "totalDaysRestricted", label: "Total days job transfer/restriction", type: "number", required: true, section: "Days" },
    { key: "injuries", label: "Injuries", type: "number", required: true, section: "Categories" },
    { key: "skinDisorders", label: "Skin disorders", type: "number", required: true, section: "Categories" },
    { key: "respiratoryConditions", label: "Respiratory conditions", type: "number", required: true, section: "Categories" },
    { key: "poisonings", label: "Poisonings", type: "number", required: true, section: "Categories" },
    { key: "hearingLoss", label: "Hearing loss", type: "number", required: true, section: "Categories" },
    { key: "allOtherIllnesses", label: "All other illnesses", type: "number", required: true, section: "Categories" },
    { key: "executiveName", label: "Company Executive Name", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Certification" },
    { key: "executiveTitle", label: "Company Executive Title", type: "text", required: true, section: "Certification" },
    { key: "certifiedDate", label: "Date Certified", type: "date", required: true, section: "Certification" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "0";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .stat { background: #f8fafc; border: 1px solid ${brandColor}; border-radius: 6px; padding: 12px; text-align: center; }
  .stat .num { font-size: 24px; font-weight: 700; color: ${brandColor}; }
  .stat .lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 4px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">OSHA FORM 300A</div><div class="doc-date">Annual Summary · ${d("year")}</div></div>
</div>

<div class="section">
  <div class="row">
    <div class="field"><div class="field-label">Establishment</div><div class="field-value">${data["establishmentName"] || ""}</div></div>
    <div class="field"><div class="field-label">Industry</div><div class="field-value">${data["industryDescription"] || ""}${data["naicsCode"] ? ` (NAICS ${data["naicsCode"]})` : ""}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Address</div><div class="field-value">${data["establishmentAddress"] || ""}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Number of Cases</div>
  <div class="stat-grid">
    <div class="stat"><div class="num">${d("deaths")}</div><div class="lbl">Deaths</div></div>
    <div class="stat"><div class="num">${d("daysAwayCases")}</div><div class="lbl">Days Away</div></div>
    <div class="stat"><div class="num">${d("transferCases")}</div><div class="lbl">Job Transfer/Restriction</div></div>
    <div class="stat"><div class="num">${d("otherRecordable")}</div><div class="lbl">Other Recordable</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Number of Days</div>
  <div class="stat-grid">
    <div class="stat"><div class="num">${d("totalDaysAway")}</div><div class="lbl">Days Away From Work</div></div>
    <div class="stat"><div class="num">${d("totalDaysRestricted")}</div><div class="lbl">Days Restricted/Transfer</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Injury and Illness Types</div>
  <div class="stat-grid">
    <div class="stat"><div class="num">${d("injuries")}</div><div class="lbl">Injuries</div></div>
    <div class="stat"><div class="num">${d("skinDisorders")}</div><div class="lbl">Skin Disorders</div></div>
    <div class="stat"><div class="num">${d("respiratoryConditions")}</div><div class="lbl">Respiratory</div></div>
    <div class="stat"><div class="num">${d("poisonings")}</div><div class="lbl">Poisonings</div></div>
    <div class="stat"><div class="num">${d("hearingLoss")}</div><div class="lbl">Hearing Loss</div></div>
    <div class="stat"><div class="num">${d("allOtherIllnesses")}</div><div class="lbl">All Other</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Workforce</div>
  <div class="row">
    <div class="field"><div class="field-label">Annual Avg Employees</div><div class="field-value large">${d("averageEmployees")}</div></div>
    <div class="field"><div class="field-label">Total Hours Worked</div><div class="field-value large">${d("totalHoursWorked")}</div></div>
  </div>
</div>

<div class="callout">
  <strong>Certification:</strong> I certify that I have examined this document and that to the best of my knowledge the entries are true, accurate, and complete.<br><br>
  <strong>${data["executiveName"]}</strong> — ${data["executiveTitle"]}<br>
  Date: ${data["certifiedDate"]}
</div>

<div class="callout">
  <strong>Posting requirement:</strong> Post this Summary in the workplace where notices to employees are usually posted, from <strong>February 1 to April 30</strong> of the year following the year covered by the summary.
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>OSHA 300A · ${d("year")}</span>
</div>

</body></html>`;
  },
};
