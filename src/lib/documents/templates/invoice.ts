import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const invoiceTemplate: DocumentTemplate = {
  slug: "contractor-invoice",
  name: "Contractor Invoice",
  category: "INVOICE",
  description:
    "Professional contractor invoice with line items, tax calculation, and payment terms.",
  fields: [
    // Invoice details
    { key: "invoiceNumber", label: "Invoice Number", type: "text", required: true, placeholder: "INV-001", section: "Invoice Details" },
    { key: "invoiceDate", label: "Invoice Date", type: "date", required: true, section: "Invoice Details" },
    { key: "dueDate", label: "Due Date", type: "date", required: true, section: "Invoice Details" },
    // From
    { key: "fromName", label: "From Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "From" },
    { key: "fromAddress", label: "Address", type: "text", required: true, autoFillFrom: "profile.address", section: "From" },
    { key: "fromCity", label: "City", type: "text", required: true, autoFillFrom: "profile.city", section: "From" },
    { key: "fromState", label: "State", type: "text", required: true, autoFillFrom: "profile.state", section: "From" },
    { key: "fromZip", label: "ZIP", type: "text", required: true, autoFillFrom: "profile.zip", section: "From" },
    { key: "fromPhone", label: "Phone", type: "text", required: false, autoFillFrom: "profile.phone", section: "From" },
    { key: "fromEmail", label: "Email", type: "text", required: false, autoFillFrom: "profile.email", section: "From" },
    // To
    { key: "toName", label: "To Name", type: "text", required: true, autoFillFrom: "client.name", section: "Bill To" },
    { key: "toCompany", label: "Company", type: "text", required: false, autoFillFrom: "client.company", section: "Bill To" },
    { key: "toAddress", label: "Address", type: "text", required: true, autoFillFrom: "client.address", section: "Bill To" },
    { key: "toCity", label: "City", type: "text", required: true, autoFillFrom: "client.city", section: "Bill To" },
    { key: "toState", label: "State", type: "text", required: true, autoFillFrom: "client.state", section: "Bill To" },
    { key: "toZip", label: "ZIP", type: "text", required: true, autoFillFrom: "client.zip", section: "Bill To" },
    // Project
    { key: "projectName", label: "Project Name", type: "text", required: false, autoFillFrom: "project.name", section: "Project" },
    { key: "projectAddress", label: "Project Address", type: "text", required: false, section: "Project" },
    // Line items
    { key: "description1", label: "Description (Line 1)", type: "text", required: true, section: "Line Items" },
    { key: "quantity1", label: "Qty (Line 1)", type: "number", required: true, section: "Line Items" },
    { key: "rate1", label: "Rate (Line 1)", type: "currency", required: true, section: "Line Items" },
    { key: "description2", label: "Description (Line 2)", type: "text", required: false, section: "Line Items" },
    { key: "quantity2", label: "Qty (Line 2)", type: "number", required: false, section: "Line Items" },
    { key: "rate2", label: "Rate (Line 2)", type: "currency", required: false, section: "Line Items" },
    { key: "description3", label: "Description (Line 3)", type: "text", required: false, section: "Line Items" },
    { key: "quantity3", label: "Qty (Line 3)", type: "number", required: false, section: "Line Items" },
    { key: "rate3", label: "Rate (Line 3)", type: "currency", required: false, section: "Line Items" },
    { key: "description4", label: "Description (Line 4)", type: "text", required: false, section: "Line Items" },
    { key: "quantity4", label: "Qty (Line 4)", type: "number", required: false, section: "Line Items" },
    { key: "rate4", label: "Rate (Line 4)", type: "currency", required: false, section: "Line Items" },
    // Totals
    { key: "subtotal", label: "Subtotal", type: "currency", required: true, section: "Totals" },
    { key: "taxRate", label: "Tax Rate (%)", type: "number", required: false, placeholder: "0", section: "Totals" },
    { key: "taxAmount", label: "Tax Amount", type: "currency", required: false, section: "Totals" },
    { key: "total", label: "Total Due", type: "currency", required: true, section: "Totals" },
    // Payment / Notes
    { key: "paymentTerms", label: "Payment Terms", type: "text", required: false, placeholder: "Net 30", section: "Payment" },
    { key: "notes", label: "Notes", type: "textarea", required: false, section: "Payment" },
  ],

  generateHtml(data, brandName, brandColor) {
    const d = (key: string) => data[key] || "";

    const lineRows = [1, 2, 3, 4]
      .filter((i) => d(`description${i}`))
      .map(
        (i) => `
        <tr>
          <td>${d(`description${i}`)}</td>
          <td style="text-align:center;">${d(`quantity${i}`)}</td>
          <td style="text-align:right;">$${d(`rate${i}`)}</td>
          <td style="text-align:right;">$${(parseFloat(d(`quantity${i}`)) * parseFloat(d(`rate${i}`))).toFixed(2) || ""}</td>
        </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .invoice-meta { text-align: right; }
  .invoice-meta .label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
  .invoice-meta .value { font-size: 14px; font-weight: 600; }
  .totals-table { width: 280px; margin-left: auto; margin-top: 12px; }
  .totals-table td { padding: 6px 8px; font-size: 13px; }
  .totals-table .grand-total td { font-size: 16px; font-weight: 700; color: ${brandColor}; border-top: 2px solid ${brandColor}; }
</style></head><body>

<div class="header">
  <div>
    <div class="brand">${brandName}</div>
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Contractor Invoice</div>
  </div>
  <div class="invoice-meta">
    <div class="doc-type">INVOICE</div>
    <div class="doc-date">#${d("invoiceNumber")}</div>
  </div>
</div>

<div class="section">
  <div class="row">
    <div class="field" style="flex:1;">
      <div class="section-title">From</div>
      <div class="field-value">${d("fromName")}</div>
      <div style="font-size:12px;color:#4b5563;">${d("fromAddress")}<br>${d("fromCity")}, ${d("fromState")} ${d("fromZip")}</div>
      ${d("fromPhone") ? `<div style="font-size:12px;color:#4b5563;">${d("fromPhone")}</div>` : ""}
      ${d("fromEmail") ? `<div style="font-size:12px;color:#4b5563;">${d("fromEmail")}</div>` : ""}
    </div>
    <div class="field" style="flex:1;">
      <div class="section-title">Bill To</div>
      <div class="field-value">${d("toName")}</div>
      ${d("toCompany") ? `<div style="font-size:12px;color:#4b5563;">${d("toCompany")}</div>` : ""}
      <div style="font-size:12px;color:#4b5563;">${d("toAddress")}<br>${d("toCity")}, ${d("toState")} ${d("toZip")}</div>
    </div>
    <div class="field" style="flex:0.7;">
      <div class="section-title">Invoice Details</div>
      <div class="row"><div class="field"><div class="field-label">Invoice Date</div><div class="field-value">${d("invoiceDate")}</div></div></div>
      <div class="row"><div class="field"><div class="field-label">Due Date</div><div class="field-value">${d("dueDate")}</div></div></div>
      <div class="row"><div class="field"><div class="field-label">Payment Terms</div><div class="field-value">${d("paymentTerms")}</div></div></div>
    </div>
  </div>
</div>

${d("projectName") ? `
<div class="section">
  <div class="section-title">Project</div>
  <div class="row">
    <div class="field"><div class="field-label">Project Name</div><div class="field-value">${d("projectName")}</div></div>
    ${d("projectAddress") ? `<div class="field"><div class="field-label">Project Address</div><div class="field-value">${d("projectAddress")}</div></div>` : ""}
  </div>
</div>
` : ""}

<div class="section">
  <div class="section-title">Line Items</div>
  <table>
    <thead>
      <tr>
        <th style="width:50%;">Description</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
    </tbody>
  </table>

  <table class="totals-table">
    <tr><td style="text-align:right;color:#6b7280;">Subtotal</td><td style="text-align:right;">$${d("subtotal")}</td></tr>
    ${d("taxRate") ? `<tr><td style="text-align:right;color:#6b7280;">Tax (${d("taxRate")}%)</td><td style="text-align:right;">$${d("taxAmount")}</td></tr>` : ""}
    <tr class="grand-total"><td style="text-align:right;">Total Due</td><td style="text-align:right;">$${d("total")}</td></tr>
  </table>
</div>

${d("notes") ? `
<div class="section">
  <div class="section-title">Notes</div>
  <div class="callout">${d("notes")}</div>
</div>
` : ""}

<div class="footer">
  <span>Generated by <span class="brand-mark">${brandName}</span></span>
  <span>Invoice #${d("invoiceNumber")}</span>
</div>

</body></html>`;
  },
};
