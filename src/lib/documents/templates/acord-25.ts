import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml } from "./registry";

export const acord25Template: DocumentTemplate = {
  slug: "acord-25-liability-coi",
  name: "ACORD 25 - Certificate of Liability Insurance",
  category: "INSURANCE",
  description:
    "Industry-standard ACORD 25 Certificate of Liability Insurance form. Summarizes coverage for General Liability, Auto, Workers Comp, and Umbrella policies. Required by most GCs, cities, and awarding authorities before work begins. Informational only -- does not alter the policy.",
  fields: [
    { key: "certDate", label: "Certificate Date", type: "date", required: true, section: "Header" },
    { key: "producer", label: "Insurance Producer (Broker)", type: "text", required: true, section: "Producer", placeholder: "ABC Insurance Agency" },
    { key: "producerAddress", label: "Producer Address", type: "textarea", required: true, section: "Producer", placeholder: "123 Main St, Minneapolis, MN 55401" },
    { key: "producerPhone", label: "Producer Phone", type: "text", required: false, section: "Producer" },
    { key: "producerContact", label: "Producer Contact Person", type: "text", required: false, section: "Producer" },
    { key: "insuredName", label: "Insured Business Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Insured" },
    { key: "insuredAddress", label: "Insured Address", type: "textarea", required: true, autoFillFrom: "profile.address", section: "Insured" },
    { key: "insurerA", label: "Insurer A (Primary Carrier)", type: "text", required: true, section: "Carriers", placeholder: "e.g., Travelers Casualty" },
    { key: "insurerB", label: "Insurer B (Auto)", type: "text", required: false, section: "Carriers" },
    { key: "insurerC", label: "Insurer C (Workers Comp)", type: "text", required: false, section: "Carriers" },
    // General Liability
    { key: "glPolicyNumber", label: "GL Policy Number", type: "text", required: true, section: "General Liability", autoFillFrom: "profile.insurancePolicyNumber" },
    { key: "glEffective", label: "GL Effective Date", type: "date", required: true, section: "General Liability" },
    { key: "glExpires", label: "GL Expiration Date", type: "date", required: true, section: "General Liability", autoFillFrom: "profile.insuranceExpiration" },
    { key: "glEachOccurrence", label: "Each Occurrence Limit ($)", type: "currency", required: true, section: "General Liability", placeholder: "1000000" },
    { key: "glGenAgg", label: "General Aggregate ($)", type: "currency", required: true, section: "General Liability", placeholder: "2000000" },
    { key: "glProducts", label: "Products/Completed Ops ($)", type: "currency", required: false, section: "General Liability" },
    // Auto
    { key: "autoPolicyNumber", label: "Auto Policy Number", type: "text", required: false, section: "Commercial Auto" },
    { key: "autoExpires", label: "Auto Expiration Date", type: "date", required: false, section: "Commercial Auto" },
    { key: "autoCombinedLimit", label: "Combined Single Limit ($)", type: "currency", required: false, section: "Commercial Auto", placeholder: "1000000" },
    // Workers Comp
    { key: "wcPolicyNumber", label: "Workers Comp Policy Number", type: "text", required: false, section: "Workers Compensation" },
    { key: "wcExpires", label: "WC Expiration Date", type: "date", required: false, section: "Workers Compensation" },
    { key: "wcEachAccident", label: "WC Each Accident ($)", type: "currency", required: false, section: "Workers Compensation", placeholder: "1000000" },
    // Certificate Holder
    { key: "certHolderName", label: "Certificate Holder Name", type: "text", required: true, section: "Certificate Holder", placeholder: "General contractor / project owner" },
    { key: "certHolderAddress", label: "Certificate Holder Address", type: "textarea", required: true, section: "Certificate Holder" },
    { key: "description", label: "Description of Operations / Locations / Vehicles", type: "textarea", required: false, section: "Certificate Holder", placeholder: "Re: Project 123, 456 Oak St. Certificate Holder is named as Additional Insured per written contract." },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (k: string) => data[k] || "";
    const fmt = (n: string) => n ? Number(n).toLocaleString("en-US") : "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .coi-top { background: ${brandColor}; color: white; padding: 12px 16px; margin-bottom: 16px; font-weight: 700; font-size: 14px; }
  .coi-disclaimer { background: #fef3c7; border: 1px solid #fde68a; padding: 8px 12px; font-size: 10px; color: #78350f; margin-bottom: 16px; }
  .coverage-table th { background: #f9fafb; }
  .coverage-table .cov-name { font-weight: 700; font-size: 11px; }
  .cert-holder-box { border: 2px solid ${brandColor}; padding: 16px; margin-top: 16px; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div>
    <div class="doc-type">CERTIFICATE OF LIABILITY INSURANCE</div>
    <div class="doc-date">Issue Date: ${d("certDate")}</div>
  </div>
</div>

<div class="coi-disclaimer">
  THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY AND CONFERS NO RIGHTS UPON THE CERTIFICATE HOLDER. THIS CERTIFICATE DOES NOT AFFIRMATIVELY OR NEGATIVELY AMEND, EXTEND OR ALTER THE COVERAGE AFFORDED BY THE POLICIES BELOW.
</div>

<div class="section">
  <div class="row">
    <div class="field">
      <div class="field-label">Producer (Broker)</div>
      <div class="field-value">${d("producer")}</div>
      <div style="font-size:11px;color:#6b7280;white-space:pre-line;">${d("producerAddress")}</div>
      ${d("producerPhone") ? `<div style="font-size:11px;color:#6b7280;">${d("producerPhone")}</div>` : ""}
      ${d("producerContact") ? `<div style="font-size:11px;color:#6b7280;">Contact: ${d("producerContact")}</div>` : ""}
    </div>
    <div class="field">
      <div class="field-label">Insured</div>
      <div class="field-value">${d("insuredName")}</div>
      <div style="font-size:11px;color:#6b7280;white-space:pre-line;">${d("insuredAddress")}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Insurers Affording Coverage</div>
  <table>
    <tr><th style="width:40px">Ltr</th><th>Insurer Name</th></tr>
    <tr><td>A</td><td>${d("insurerA")}</td></tr>
    ${d("insurerB") ? `<tr><td>B</td><td>${d("insurerB")}</td></tr>` : ""}
    ${d("insurerC") ? `<tr><td>C</td><td>${d("insurerC")}</td></tr>` : ""}
  </table>
</div>

<div class="section">
  <div class="section-title">Coverages</div>
  <table class="coverage-table">
    <tr>
      <th style="width:40px">Ltr</th>
      <th>Type of Insurance</th>
      <th>Policy Number</th>
      <th>Policy Eff / Exp</th>
      <th>Limits</th>
    </tr>
    <tr>
      <td>A</td>
      <td>
        <div class="cov-name">Commercial General Liability</div>
        <div style="font-size:10px;color:#6b7280;">☒ Occurrence &nbsp; ☐ Claims Made</div>
      </td>
      <td>${d("glPolicyNumber")}</td>
      <td>${d("glEffective")} <br/> ${d("glExpires")}</td>
      <td>
        Each Occurrence: $${fmt(d("glEachOccurrence"))}<br/>
        General Aggregate: $${fmt(d("glGenAgg"))}
        ${d("glProducts") ? `<br/>Products/Ops: $${fmt(d("glProducts"))}` : ""}
      </td>
    </tr>
    ${d("autoPolicyNumber") ? `
    <tr>
      <td>B</td>
      <td><div class="cov-name">Commercial Auto</div><div style="font-size:10px;color:#6b7280;">Any Auto</div></td>
      <td>${d("autoPolicyNumber")}</td>
      <td>${d("autoExpires")}</td>
      <td>Combined Single Limit: $${fmt(d("autoCombinedLimit"))}</td>
    </tr>` : ""}
    ${d("wcPolicyNumber") ? `
    <tr>
      <td>C</td>
      <td><div class="cov-name">Workers Compensation &amp; Employers Liability</div></td>
      <td>${d("wcPolicyNumber")}</td>
      <td>${d("wcExpires")}</td>
      <td>Each Accident: $${fmt(d("wcEachAccident"))}</td>
    </tr>` : ""}
  </table>
</div>

<div class="cert-holder-box">
  <div class="field-label">Certificate Holder</div>
  <div class="field-value">${d("certHolderName")}</div>
  <div style="font-size:11px;color:#6b7280;white-space:pre-line;margin-top:4px;">${d("certHolderAddress")}</div>
  ${d("description") ? `
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
      <div class="field-label">Description of Operations</div>
      <div style="font-size:11px;white-space:pre-line;">${d("description")}</div>
    </div>
  ` : ""}
</div>

<div style="margin-top:24px;padding:12px;background:#f9fafb;font-size:10px;color:#6b7280;border-radius:4px;">
  <strong>CANCELLATION:</strong> Should any of the above described policies be cancelled before the expiration date thereof, notice will be delivered in accordance with the policy provisions.
</div>

<div style="margin-top:24px;">
  <div style="display:flex;justify-content:space-between;gap:24px;">
    <div style="flex:1;">
      <div style="border-bottom:1px solid #1a1a2e;margin-bottom:4px;height:30px;"></div>
      <div style="font-size:10px;color:#6b7280;">Authorized Representative Signature</div>
    </div>
    <div style="flex:1;">
      <div style="border-bottom:1px solid #1a1a2e;margin-bottom:4px;height:30px;"></div>
      <div style="font-size:10px;color:#6b7280;">Date</div>
    </div>
  </div>
</div>

<div class="footer" style="margin-top:24px;font-size:10px;color:#9ca3af;">
  ${footerBrandHtml(brandName, branding)}
  <span>ACORD 25 equivalent - issued ${d("certDate")}</span>
</div>

</body></html>`;
  },
};
