import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const nec1099Template: DocumentTemplate = {
  slug: "1099-nec",
  name: "1099-NEC Nonemployee Compensation",
  category: "TAX",
  description:
    "Information return used to report nonemployee compensation of $600 or more paid to a contractor during the tax year.",
  fields: [
    {
      key: "payerName",
      label: "Payer's Name",
      type: "text",
      required: true,
      autoFillFrom: "profile.businessName",
      section: "Payer Information",
    },
    {
      key: "payerAddress",
      label: "Payer's Address",
      type: "text",
      required: true,
      autoFillFrom: "profile.address",
      section: "Payer Information",
    },
    {
      key: "payerCity",
      label: "Payer's City",
      type: "text",
      required: true,
      autoFillFrom: "profile.city",
      section: "Payer Information",
    },
    {
      key: "payerState",
      label: "Payer's State",
      type: "text",
      required: true,
      autoFillFrom: "profile.state",
      section: "Payer Information",
    },
    {
      key: "payerZip",
      label: "Payer's ZIP Code",
      type: "text",
      required: true,
      autoFillFrom: "profile.zip",
      section: "Payer Information",
    },
    {
      key: "payerTaxId",
      label: "Payer's TIN",
      type: "text",
      required: true,
      autoFillFrom: "profile.taxId",
      section: "Payer Information",
    },
    {
      key: "recipientName",
      label: "Recipient's Name",
      type: "text",
      required: true,
      autoFillFrom: "client.name",
      section: "Recipient Information",
    },
    {
      key: "recipientAddress",
      label: "Recipient's Address",
      type: "text",
      required: true,
      autoFillFrom: "client.address",
      section: "Recipient Information",
    },
    {
      key: "recipientCity",
      label: "Recipient's City",
      type: "text",
      required: true,
      autoFillFrom: "client.city",
      section: "Recipient Information",
    },
    {
      key: "recipientState",
      label: "Recipient's State",
      type: "text",
      required: true,
      autoFillFrom: "client.state",
      section: "Recipient Information",
    },
    {
      key: "recipientZip",
      label: "Recipient's ZIP Code",
      type: "text",
      required: true,
      autoFillFrom: "client.zip",
      section: "Recipient Information",
    },
    {
      key: "recipientTaxId",
      label: "Recipient's TIN",
      type: "text",
      required: true,
      autoFillFrom: "client.taxId",
      section: "Recipient Information",
    },
    {
      key: "nonemployeeCompensation",
      label: "1. Nonemployee Compensation",
      type: "currency",
      required: true,
      section: "Amounts",
    },
    {
      key: "federalTaxWithheld",
      label: "4. Federal Income Tax Withheld",
      type: "currency",
      required: false,
      section: "Amounts",
    },
    {
      key: "stateTaxWithheld",
      label: "5. State Tax Withheld",
      type: "currency",
      required: false,
      section: "Amounts",
    },
    {
      key: "stateIncome",
      label: "7. State Income",
      type: "currency",
      required: false,
      section: "Amounts",
    },
    {
      key: "taxYear",
      label: "Tax Year",
      type: "text",
      required: true,
      placeholder: "e.g. 2025",
      section: "Amounts",
    },
  ],
  generateHtml(data: Record<string, string>, brandName: string, brandColor: string, branding?: BrandingContext): string {
    const fmt = (v: string | undefined) => {
      if (!v) return "$0.00";
      const n = parseFloat(v);
      return isNaN(n) ? v : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>1099-NEC - ${data.recipientName || "Recipient"} - ${data.taxYear || ""}</title>
<style>
${basePdfCss(brandColor)}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 2px solid #1a1a2e; margin-bottom: 20px; }
.form-cell { border: 1px solid #d1d5db; padding: 12px; }
.form-cell.full { grid-column: 1 / -1; }
.form-cell .label { font-size: 9px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
.form-cell .value { font-size: 13px; font-weight: 500; min-height: 16px; }
.amount-cell .value { font-size: 16px; font-weight: 700; color: ${brandColor}; }
.tax-year-badge { display: inline-block; background: ${brandColor}; color: white; font-size: 20px; font-weight: 700; padding: 6px 16px; border-radius: 4px; }
.corrected-box { font-size: 10px; color: #6b7280; margin-top: 8px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      ${brandHtml(brandName, branding)}
    </div>
    <div>
      <div class="doc-type">1099-NEC</div>
      <div class="doc-date">Nonemployee Compensation &mdash; Tax Year ${data.taxYear || ""}</div>
    </div>
  </div>

  <div style="text-align: right; margin-bottom: 12px;">
    <span class="tax-year-badge">${data.taxYear || ""}</span>
  </div>

  <div class="form-grid">
    <div class="form-cell" style="grid-row: span 3;">
      <div class="label">Payer's Name, Address, and TIN</div>
      <div class="value" style="font-weight: 600;">${data.payerName || ""}</div>
      <div class="value">${data.payerAddress || ""}</div>
      <div class="value">${data.payerCity || ""}${data.payerCity && data.payerState ? ", " : ""}${data.payerState || ""} ${data.payerZip || ""}</div>
      <div class="value" style="margin-top: 8px; font-size: 11px; color: #6b7280;">TIN: ${data.payerTaxId || ""}</div>
    </div>
    <div class="form-cell amount-cell">
      <div class="label">1. Nonemployee Compensation</div>
      <div class="value">${fmt(data.nonemployeeCompensation)}</div>
    </div>
    <div class="form-cell">
      <div class="label">4. Federal Income Tax Withheld</div>
      <div class="value">${fmt(data.federalTaxWithheld)}</div>
    </div>
    <div class="form-cell">
      <div class="label">5. State Tax Withheld</div>
      <div class="value">${fmt(data.stateTaxWithheld)}</div>
    </div>

    <div class="form-cell" style="grid-row: span 2;">
      <div class="label">Recipient's Name, Address, and TIN</div>
      <div class="value" style="font-weight: 600;">${data.recipientName || ""}</div>
      <div class="value">${data.recipientAddress || ""}</div>
      <div class="value">${data.recipientCity || ""}${data.recipientCity && data.recipientState ? ", " : ""}${data.recipientState || ""} ${data.recipientZip || ""}</div>
      <div class="value" style="margin-top: 8px; font-size: 11px; color: #6b7280;">TIN: ${data.recipientTaxId || ""}</div>
    </div>
    <div class="form-cell">
      <div class="label">7. State Income</div>
      <div class="value">${fmt(data.stateIncome)}</div>
    </div>
    <div class="form-cell">
      <div class="label">Account Number (optional)</div>
      <div class="value"></div>
    </div>
  </div>

  <div class="callout">
    <p style="font-size: 11px; color: #4b5563;">
      <strong>Important:</strong> This is an informational statement furnished to the recipient.
      If you are required to file a return, a negligence penalty or other sanction may be imposed
      on you if this income is taxable and the IRS determines that it has not been reported.
    </p>
  </div>

  <div class="footer">
    ${footerBrandHtml(brandName, branding)}
    <span>Form 1099-NEC &mdash; Informational Copy</span>
  </div>
</body>
</html>`;
  },
};
