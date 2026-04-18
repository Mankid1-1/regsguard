import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const i9Template: DocumentTemplate = {
  slug: "i-9-employment-eligibility",
  name: "Form I-9 Employment Eligibility Verification (Worksheet)",
  category: "COMPLIANCE",
  description:
    "Federal form required for every new US hire to verify identity and work authorization. Must be completed by Day 1 (Section 1) and Day 3 (Section 2). Retained for 3 years after hire or 1 year after termination, whichever is later. This is a worksheet — file the official USCIS form with retention.",
  fields: [
    // Employee section
    { key: "employeeFullName", label: "Full Legal Name (Last, First, Middle)", type: "text", required: true, section: "Section 1: Employee" },
    { key: "employeeAddress", label: "Street Address", type: "text", required: true, section: "Section 1: Employee" },
    { key: "employeeCity", label: "City", type: "text", required: true, section: "Section 1: Employee" },
    { key: "employeeState", label: "State", type: "text", required: true, section: "Section 1: Employee" },
    { key: "employeeZip", label: "ZIP", type: "text", required: true, section: "Section 1: Employee" },
    { key: "employeeDob", label: "Date of Birth", type: "date", required: true, section: "Section 1: Employee" },
    { key: "employeeSsn", label: "SSN (last 4)", type: "text", required: false, section: "Section 1: Employee" },
    { key: "employeeEmail", label: "Email", type: "text", required: false, section: "Section 1: Employee" },
    { key: "citizenshipStatus", label: "Citizenship/Authorization Status", type: "select", required: true,
      options: [
        { label: "U.S. Citizen", value: "citizen" },
        { label: "Noncitizen national", value: "national" },
        { label: "Lawful permanent resident", value: "permanent_resident" },
        { label: "Noncitizen authorized to work", value: "authorized" },
      ], section: "Section 1: Employee" },
    { key: "alienNumber", label: "USCIS A-Number / Form I-94 (if applicable)", type: "text", required: false, section: "Section 1: Employee" },
    { key: "workAuthExpiration", label: "Work authorization expiration", type: "date", required: false, section: "Section 1: Employee" },
    { key: "section1SignedDate", label: "Section 1 signed date", type: "date", required: true, section: "Section 1: Employee" },

    // Section 2 employer
    { key: "documentTitle", label: "Identity + Work Auth Document Title (e.g. US Passport, DL+SSC)", type: "text", required: true, section: "Section 2: Employer" },
    { key: "documentIssuer", label: "Issuing Authority", type: "text", required: true, section: "Section 2: Employer" },
    { key: "documentNumber", label: "Document Number", type: "text", required: true, section: "Section 2: Employer" },
    { key: "documentExpiration", label: "Expiration Date (if any)", type: "date", required: false, section: "Section 2: Employer" },
    { key: "firstDayOfEmployment", label: "First Day of Employment", type: "date", required: true, section: "Section 2: Employer" },
    { key: "employerRepName", label: "Employer Rep Name", type: "text", required: true, autoFillFrom: "profile.responsiblePerson", section: "Section 2: Employer" },
    { key: "employerRepTitle", label: "Title", type: "text", required: true, section: "Section 2: Employer" },
    { key: "employerName", label: "Business Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Section 2: Employer" },
    { key: "employerAddress", label: "Business Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Section 2: Employer" },
    { key: "section2SignedDate", label: "Section 2 signed date", type: "date", required: true, section: "Section 2: Employer" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .legal-warn { background: #fff3cd; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 12px 0; font-size: 11px; line-height: 1.5; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">FORM I-9 (WORKSHEET)</div><div class="doc-date">${d("section1SignedDate") || ""}</div></div>
</div>

<div class="legal-warn">
  <strong>This is a worksheet, not the official USCIS Form I-9.</strong> Use this to collect data, then transfer to the current official Form I-9 (current edition required by USCIS). Retain Form I-9 for the longer of 3 years from hire or 1 year from termination.
</div>

<div class="section">
  <div class="section-title">Section 1 — Employee Information &amp; Attestation</div>
  <div class="field"><div class="field-label">Full Legal Name</div><div class="field-value">${d("employeeFullName")}</div></div>
  <div class="grid-2" style="margin-top:8px;">
    <div class="field"><div class="field-label">Address</div><div class="field-value">${d("employeeAddress")}, ${d("employeeCity")} ${d("employeeState")} ${d("employeeZip")}</div></div>
    <div class="field"><div class="field-label">DOB</div><div class="field-value">${d("employeeDob")}</div></div>
  </div>
  <div class="grid-2" style="margin-top:8px;">
    <div class="field"><div class="field-label">SSN (last 4)</div><div class="field-value">${d("employeeSsn") || "—"}</div></div>
    <div class="field"><div class="field-label">Email</div><div class="field-value">${d("employeeEmail") || "—"}</div></div>
  </div>
  <div class="callout" style="margin-top:8px;">
    <div class="field-label">Citizenship Status</div>
    <div class="field-value">${d("citizenshipStatus")}</div>
    ${d("alienNumber") ? `<div style="font-size:11px;margin-top:4px;color:#4b5563;">A-Number/I-94: ${d("alienNumber")}</div>` : ""}
    ${d("workAuthExpiration") ? `<div style="font-size:11px;color:#4b5563;">Work authorization expires: ${d("workAuthExpiration")}</div>` : ""}
  </div>
  <div style="margin-top:24px;display:flex;gap:24px;">
    <div class="signature-line" style="flex:1;">Employee Signature</div>
    <div class="signature-line" style="width:140px;">${d("section1SignedDate")}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Section 2 — Employer Review &amp; Verification</div>
  <table>
    <thead><tr><th>Document</th><th>Issuing Authority</th><th>Document #</th><th>Expiration</th></tr></thead>
    <tbody>
      <tr>
        <td>${d("documentTitle")}</td>
        <td>${d("documentIssuer")}</td>
        <td>${d("documentNumber")}</td>
        <td>${d("documentExpiration") || "N/A"}</td>
      </tr>
    </tbody>
  </table>
  <div class="grid-2" style="margin-top:12px;">
    <div class="field"><div class="field-label">First Day of Employment</div><div class="field-value">${d("firstDayOfEmployment")}</div></div>
    <div class="field"><div class="field-label">Employer Rep</div><div class="field-value">${d("employerRepName")}, ${d("employerRepTitle")}</div></div>
  </div>
  <div class="field" style="margin-top:8px;"><div class="field-label">Business</div><div class="field-value">${d("employerName")} — ${d("employerAddress")}</div></div>
  <div style="margin-top:24px;display:flex;gap:24px;">
    <div class="signature-line" style="flex:1;">Employer Rep Signature</div>
    <div class="signature-line" style="width:140px;">${d("section2SignedDate")}</div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>I-9 Worksheet · Retain per USCIS requirements</span>
</div>

</body></html>`;
  },
};
