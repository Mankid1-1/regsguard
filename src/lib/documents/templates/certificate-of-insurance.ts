import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const coiTemplate: DocumentTemplate = {
  slug: "certificate-of-insurance",
  name: "Certificate of Insurance (COI)",
  category: "INSURANCE",
  description:
    "A certificate of insurance verifying that an insurance policy has been issued to the insured, detailing coverage types, limits, and effective dates.",
  fields: [
    {
      key: "insuredName",
      label: "Insured Name",
      type: "text",
      required: true,
      autoFillFrom: "profile.businessName",
      section: "Insured",
    },
    {
      key: "insuredAddress",
      label: "Insured Address",
      type: "text",
      required: true,
      autoFillFrom: "profile.address",
      section: "Insured",
    },
    {
      key: "insuredCity",
      label: "Insured City",
      type: "text",
      required: true,
      autoFillFrom: "profile.city",
      section: "Insured",
    },
    {
      key: "insuredState",
      label: "Insured State",
      type: "text",
      required: true,
      autoFillFrom: "profile.state",
      section: "Insured",
    },
    {
      key: "insuredZip",
      label: "Insured ZIP Code",
      type: "text",
      required: true,
      autoFillFrom: "profile.zip",
      section: "Insured",
    },
    {
      key: "insuranceCompany",
      label: "Insurance Company",
      type: "text",
      required: true,
      autoFillFrom: "profile.insuranceProvider",
      section: "Policy",
    },
    {
      key: "policyNumber",
      label: "Policy Number",
      type: "text",
      required: true,
      autoFillFrom: "profile.insurancePolicyNumber",
      section: "Policy",
    },
    {
      key: "policyType",
      label: "Policy Type",
      type: "select",
      required: true,
      options: [
        { label: "General Liability", value: "general_liability" },
        { label: "Workers Compensation", value: "workers_comp" },
        { label: "Automobile", value: "auto" },
        { label: "Umbrella / Excess Liability", value: "umbrella" },
        { label: "Professional Liability (E&O)", value: "professional" },
      ],
      section: "Policy",
    },
    {
      key: "effectiveDate",
      label: "Policy Effective Date",
      type: "date",
      required: true,
      section: "Policy",
    },
    {
      key: "expirationDate",
      label: "Policy Expiration Date",
      type: "date",
      required: true,
      autoFillFrom: "profile.insuranceExpiration",
      section: "Policy",
    },
    {
      key: "coverageLimit",
      label: "Coverage Limit",
      type: "currency",
      required: true,
      section: "Coverage",
    },
    {
      key: "deductible",
      label: "Deductible",
      type: "currency",
      required: false,
      section: "Coverage",
    },
    {
      key: "certificateHolder",
      label: "Certificate Holder",
      type: "text",
      required: true,
      placeholder: "Name of the entity requesting the COI",
      section: "Certificate Holder",
    },
    {
      key: "holderAddress",
      label: "Certificate Holder Address",
      type: "text",
      required: false,
      section: "Certificate Holder",
    },
    {
      key: "additionalInsured",
      label: "Certificate Holder is Additional Insured",
      type: "checkbox",
      required: false,
      section: "Certificate Holder",
    },
    {
      key: "description",
      label: "Description of Operations / Locations / Vehicles",
      type: "textarea",
      required: false,
      placeholder: "Describe the operations, project, or locations covered",
      section: "Description",
    },
  ],
  generateHtml(data: Record<string, string>, brandName: string, brandColor: string): string {
    const fmt = (v: string | undefined) => {
      if (!v) return "$0.00";
      const n = parseFloat(v);
      return isNaN(n) ? v : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const policyTypeLabels: Record<string, string> = {
      general_liability: "Commercial General Liability",
      workers_comp: "Workers Compensation",
      auto: "Automobile Liability",
      umbrella: "Umbrella / Excess Liability",
      professional: "Professional Liability (E&O)",
    };

    const isAdditionalInsured = data.additionalInsured === "true" || data.additionalInsured === "on";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Certificate of Insurance - ${data.insuredName || "Insured"}</title>
<style>
${basePdfCss(brandColor)}
.coi-badge { display: inline-block; background: ${brandColor}; color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 12px; border-radius: 3px; }
.info-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.info-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; }
.info-box-title { font-size: 10px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; }
.info-line { font-size: 12px; margin-bottom: 3px; }
.info-line.name { font-weight: 600; font-size: 13px; }
.coverage-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
.coverage-table th { text-align: left; font-size: 10px; font-weight: 700; color: white; background: ${brandColor}; padding: 8px 12px; text-transform: uppercase; letter-spacing: 0.3px; }
.coverage-table td { font-size: 12px; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
.coverage-table tr:last-child td { border-bottom: none; }
.addl-badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 3px; }
.addl-badge.yes { background: #d1fae5; color: #065f46; }
.addl-badge.no { background: #f3f4f6; color: #6b7280; }
.desc-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin: 16px 0; }
.desc-box .desc-title { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; }
.disclaimer { font-size: 10px; color: #9ca3af; line-height: 1.5; margin: 16px 0; }
.sig-block { display: flex; gap: 40px; margin-top: 28px; }
.sig-field { flex: 1; }
.sig-line { border-top: 1px solid #1a1a2e; margin-top: 40px; padding-top: 4px; font-size: 10px; color: #6b7280; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${brandName}</div>
      <div style="margin-top: 6px;"><span class="coi-badge">Certificate of Insurance</span></div>
    </div>
    <div>
      <div class="doc-type">COI</div>
      <div class="doc-date">Certificate of Liability Insurance</div>
    </div>
  </div>

  <div class="info-panel">
    <div class="info-box">
      <div class="info-box-title">Named Insured</div>
      <div class="info-line name">${data.insuredName || ""}</div>
      <div class="info-line">${data.insuredAddress || ""}</div>
      <div class="info-line">${data.insuredCity || ""}${data.insuredCity && data.insuredState ? ", " : ""}${data.insuredState || ""} ${data.insuredZip || ""}</div>
    </div>
    <div class="info-box">
      <div class="info-box-title">Insurance Company</div>
      <div class="info-line name">${data.insuranceCompany || ""}</div>
      <div class="info-line" style="margin-top: 8px; color: #6b7280; font-size: 11px;">Policy #: ${data.policyNumber || ""}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Coverage Information</div>
    <table class="coverage-table">
      <thead>
        <tr>
          <th>Type of Insurance</th>
          <th>Policy Number</th>
          <th>Effective Date</th>
          <th>Expiration Date</th>
          <th>Coverage Limit</th>
          <th>Deductible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 600;">${policyTypeLabels[data.policyType || ""] || data.policyType || ""}</td>
          <td>${data.policyNumber || ""}</td>
          <td>${data.effectiveDate || ""}</td>
          <td>${data.expirationDate || ""}</td>
          <td style="font-weight: 600; color: ${brandColor};">${fmt(data.coverageLimit)}</td>
          <td>${fmt(data.deductible)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${
    data.description
      ? `<div class="desc-box">
    <div class="desc-title">Description of Operations / Locations / Vehicles</div>
    <p style="font-size: 12px; color: #374151;">${data.description}</p>
  </div>`
      : ""
  }

  <div class="info-panel">
    <div class="info-box">
      <div class="info-box-title">Certificate Holder</div>
      <div class="info-line name">${data.certificateHolder || ""}</div>
      <div class="info-line">${data.holderAddress || ""}</div>
      <div style="margin-top: 8px;">
        <span class="addl-badge ${isAdditionalInsured ? "yes" : "no"}">
          Additional Insured: ${isAdditionalInsured ? "Yes" : "No"}
        </span>
      </div>
    </div>
    <div class="info-box" style="display: flex; flex-direction: column; justify-content: center;">
      <div class="disclaimer">
        This certificate is issued as a matter of information only and confers no rights upon the certificate holder.
        This certificate does not amend, extend, or alter the coverage afforded by the policies listed.
        The insurance afforded by the policies described herein is subject to all the terms, exclusions, and
        conditions of such policies.
      </div>
    </div>
  </div>

  <div class="sig-block">
    <div class="sig-field">
      <div class="sig-line">Authorized Representative Signature</div>
    </div>
    <div class="sig-field" style="flex: 0 0 160px;">
      <div class="sig-line">Date</div>
    </div>
  </div>

  <div class="footer">
    <span>Generated by <span class="brand-mark">${brandName}</span></span>
    <span>Certificate of Insurance</span>
  </div>
</body>
</html>`;
  },
};
