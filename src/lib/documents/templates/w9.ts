import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const w9Template: DocumentTemplate = {
  slug: "w9",
  name: "W-9 Request for Taxpayer Identification Number",
  category: "TAX",
  description:
    "Substitute W-9 form used to request a taxpayer identification number (TIN) and certification from a contractor or vendor.",
  fields: [
    {
      key: "name",
      label: "Name (as shown on your income tax return)",
      type: "text",
      required: true,
      autoFillFrom: "profile.responsiblePerson",
      section: "Taxpayer Information",
    },
    {
      key: "businessName",
      label: "Business Name / Disregarded Entity Name",
      type: "text",
      required: false,
      autoFillFrom: "profile.businessName",
      section: "Taxpayer Information",
    },
    {
      key: "federalTaxClassification",
      label: "Federal Tax Classification",
      type: "select",
      required: true,
      options: [
        { label: "Individual / Sole Proprietor", value: "individual_sole_prop" },
        { label: "C Corporation", value: "c_corp" },
        { label: "S Corporation", value: "s_corp" },
        { label: "Partnership", value: "partnership" },
        { label: "Limited Liability Company (LLC)", value: "llc" },
        { label: "Other", value: "other" },
      ],
      section: "Taxpayer Information",
    },
    {
      key: "exemptPayeeCode",
      label: "Exempt Payee Code (if any)",
      type: "text",
      required: false,
      placeholder: "Enter code if applicable",
      section: "Taxpayer Information",
    },
    {
      key: "address",
      label: "Address (number, street, and apt. or suite no.)",
      type: "text",
      required: true,
      autoFillFrom: "profile.address",
      section: "Address",
    },
    {
      key: "city",
      label: "City",
      type: "text",
      required: true,
      autoFillFrom: "profile.city",
      section: "Address",
    },
    {
      key: "state",
      label: "State",
      type: "text",
      required: true,
      autoFillFrom: "profile.state",
      section: "Address",
    },
    {
      key: "zip",
      label: "ZIP Code",
      type: "text",
      required: true,
      autoFillFrom: "profile.zip",
      section: "Address",
    },
    {
      key: "taxId",
      label: "Taxpayer Identification Number (SSN or EIN)",
      type: "text",
      required: true,
      autoFillFrom: "profile.taxId",
      placeholder: "XX-XXXXXXX or XXX-XX-XXXX",
      section: "TIN",
    },
    {
      key: "accountNumbers",
      label: "Account Number(s) (optional)",
      type: "text",
      required: false,
      placeholder: "List account number(s) if applicable",
      section: "TIN",
    },
  ],
  generateHtml(data: Record<string, string>, brandName: string, brandColor: string): string {
    const classificationLabels: Record<string, string> = {
      individual_sole_prop: "Individual / Sole Proprietor",
      c_corp: "C Corporation",
      s_corp: "S Corporation",
      partnership: "Partnership",
      llc: "Limited Liability Company (LLC)",
      other: "Other",
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>W-9 - ${data.name || "Taxpayer"}</title>
<style>
${basePdfCss(brandColor)}
.form-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
.form-box-title { font-size: 11px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px; }
.field-row { display: flex; gap: 16px; margin-bottom: 10px; }
.field-box { flex: 1; }
.field-box .label { font-size: 9px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
.field-box .value { font-size: 13px; font-weight: 500; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; min-height: 20px; }
.classification-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; }
.classification-item { font-size: 11px; padding: 3px 8px; border: 1px solid #d1d5db; border-radius: 4px; color: #6b7280; }
.classification-item.active { border-color: ${brandColor}; background: ${brandColor}11; color: ${brandColor}; font-weight: 600; }
.certification { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; }
.certification h3 { font-size: 12px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.certification ol { font-size: 11px; color: #4b5563; padding-left: 20px; line-height: 1.6; }
.sig-block { display: flex; gap: 40px; margin-top: 32px; }
.sig-field { flex: 1; }
.sig-line { border-top: 1px solid #1a1a2e; margin-top: 48px; padding-top: 4px; font-size: 10px; color: #6b7280; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${brandName}</div>
    </div>
    <div>
      <div class="doc-type">W-9</div>
      <div class="doc-date">Request for Taxpayer Identification Number and Certification</div>
    </div>
  </div>

  <div class="form-box">
    <div class="form-box-title">Taxpayer Information</div>
    <div class="field-row">
      <div class="field-box">
        <div class="label">1. Name (as shown on your income tax return)</div>
        <div class="value">${data.name || ""}</div>
      </div>
    </div>
    <div class="field-row">
      <div class="field-box">
        <div class="label">2. Business Name / Disregarded Entity Name (if different from above)</div>
        <div class="value">${data.businessName || ""}</div>
      </div>
    </div>
    <div class="field-row">
      <div class="field-box">
        <div class="label">3. Federal Tax Classification</div>
        <div class="classification-grid">
          ${Object.entries(classificationLabels)
            .map(
              ([value, label]) =>
                `<span class="classification-item${data.federalTaxClassification === value ? " active" : ""}">${label}</span>`
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
    <div class="field-row">
      <div class="field-box" style="flex: 0 0 200px;">
        <div class="label">4. Exempt Payee Code</div>
        <div class="value">${data.exemptPayeeCode || ""}</div>
      </div>
    </div>
  </div>

  <div class="form-box">
    <div class="form-box-title">Address</div>
    <div class="field-row">
      <div class="field-box">
        <div class="label">5. Address (number, street, apt. or suite no.)</div>
        <div class="value">${data.address || ""}</div>
      </div>
    </div>
    <div class="field-row">
      <div class="field-box">
        <div class="label">6. City</div>
        <div class="value">${data.city || ""}</div>
      </div>
      <div class="field-box" style="flex: 0 0 100px;">
        <div class="label">State</div>
        <div class="value">${data.state || ""}</div>
      </div>
      <div class="field-box" style="flex: 0 0 120px;">
        <div class="label">ZIP Code</div>
        <div class="value">${data.zip || ""}</div>
      </div>
    </div>
  </div>

  <div class="form-box">
    <div class="form-box-title">Taxpayer Identification Number (TIN)</div>
    <div class="field-row">
      <div class="field-box">
        <div class="label">Social Security Number (SSN) or Employer Identification Number (EIN)</div>
        <div class="value">${data.taxId || ""}</div>
      </div>
      <div class="field-box">
        <div class="label">Account Number(s)</div>
        <div class="value">${data.accountNumbers || ""}</div>
      </div>
    </div>
  </div>

  <div class="certification">
    <h3>Certification</h3>
    <p style="font-size: 11px; color: #4b5563; margin-bottom: 8px;">Under penalties of perjury, I certify that:</p>
    <ol>
      <li>The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me);</li>
      <li>I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding;</li>
      <li>I am a U.S. citizen or other U.S. person; and</li>
      <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
    </ol>
  </div>

  <div class="sig-block">
    <div class="sig-field">
      <div class="sig-line">Signature of U.S. Person</div>
    </div>
    <div class="sig-field" style="flex: 0 0 180px;">
      <div class="sig-line">Date</div>
    </div>
  </div>

  <div class="footer">
    <span>Generated by <span class="brand-mark">${brandName}</span></span>
    <span>Substitute Form W-9 &mdash; Not for submission to the IRS</span>
  </div>
</body>
</html>`;
  },
};
