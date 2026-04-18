import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const workOrderTemplate: DocumentTemplate = {
  slug: "work-order",
  name: "Work Order",
  category: "CONTRACT",
  description:
    "Service call / work order form for small jobs, emergency calls, and warranty work",
  fields: [
    // Contractor
    { key: "contractorName", label: "Contractor Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Contractor" },
    { key: "contractorPhone", label: "Phone", type: "text", required: false, autoFillFrom: "profile.phone", section: "Contractor" },
    { key: "contractorEmail", label: "Email", type: "text", required: false, autoFillFrom: "profile.email", section: "Contractor" },
    // Customer
    { key: "customerName", label: "Customer Name", type: "text", required: true, autoFillFrom: "client.name", section: "Customer" },
    { key: "customerPhone", label: "Phone", type: "text", required: false, autoFillFrom: "client.phone", section: "Customer" },
    { key: "customerAddress", label: "Address", type: "text", required: true, autoFillFrom: "client.address", section: "Customer" },
    // Service Details
    { key: "serviceDate", label: "Service Date", type: "date", required: true, section: "Service Details" },
    { key: "serviceType", label: "Service Type", type: "select", required: true, options: [
      { label: "Emergency", value: "Emergency" },
      { label: "Scheduled", value: "Scheduled" },
      { label: "Warranty", value: "Warranty" },
      { label: "Inspection", value: "Inspection" },
    ], section: "Service Details" },
    { key: "workDescription", label: "Work Description", type: "textarea", required: true, section: "Service Details" },
    { key: "materialsUsed", label: "Materials Used", type: "textarea", required: false, section: "Service Details" },
    // Costs
    { key: "laborHours", label: "Labor Hours", type: "number", required: true, section: "Costs" },
    { key: "laborRate", label: "Labor Rate (per hour)", type: "currency", required: true, section: "Costs" },
    { key: "materialsCost", label: "Materials Cost", type: "currency", required: false, section: "Costs" },
    { key: "totalAmount", label: "Total Amount", type: "currency", required: true, section: "Costs" },
    // Signatures
    { key: "customerSignature", label: "Customer Signature", type: "text", required: false, section: "Signatures" },
    { key: "technicianSignature", label: "Technician Signature", type: "text", required: false, section: "Signatures" },
  ],

  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";

    const serviceTypeBadge = d("serviceType")
      ? `<span style="display:inline-block;background:${d("serviceType") === "Emergency" ? "#dc2626" : brandColor};color:#fff;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;">${d("serviceType")}</span>`
      : "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .costs-table { width: 100%; margin-top: 8px; }
  .costs-table td { padding: 8px 12px; font-size: 13px; }
  .costs-table .label-cell { color: #6b7280; font-weight: 600; width: 60%; }
  .costs-table .value-cell { text-align: right; font-weight: 600; }
  .costs-table .highlight td { font-size: 15px; font-weight: 700; color: ${brandColor}; border-top: 2px solid ${brandColor}; }
</style></head><body>

<div class="header">
  <div>
    ${brandHtml(brandName, branding)}
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Work Order</div>
  </div>
  <div>
    <div class="doc-type">WORK ORDER</div>
    <div class="doc-date">${d("serviceDate")}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contractor</div>
  <div class="row">
    <div class="field"><div class="field-label">Name</div><div class="field-value">${d("contractorName")}</div></div>
    <div class="field"><div class="field-label">Phone</div><div class="field-value">${d("contractorPhone")}</div></div>
    <div class="field"><div class="field-label">Email</div><div class="field-value">${d("contractorEmail")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Customer</div>
  <div class="row">
    <div class="field"><div class="field-label">Name</div><div class="field-value">${d("customerName")}</div></div>
    <div class="field"><div class="field-label">Phone</div><div class="field-value">${d("customerPhone")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Address</div><div class="field-value">${d("customerAddress")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Service Details</div>
  <div class="row">
    <div class="field"><div class="field-label">Service Date</div><div class="field-value">${d("serviceDate")}</div></div>
    <div class="field"><div class="field-label">Service Type</div><div class="field-value">${serviceTypeBadge}</div></div>
  </div>
  <div class="row">
    <div class="field">
      <div class="field-label">Work Description</div>
      <div class="callout">${d("workDescription")}</div>
    </div>
  </div>
  ${d("materialsUsed") ? `
  <div class="row">
    <div class="field">
      <div class="field-label">Materials Used</div>
      <div class="callout">${d("materialsUsed")}</div>
    </div>
  </div>
  ` : ""}
</div>

<div class="section">
  <div class="section-title">Costs</div>
  <table class="costs-table">
    <tr><td class="label-cell">Labor (${d("laborHours")} hrs &times; $${d("laborRate")}/hr)</td><td class="value-cell">$${(parseFloat(d("laborHours") || "0") * parseFloat(d("laborRate") || "0")).toFixed(2)}</td></tr>
    ${d("materialsCost") ? `<tr><td class="label-cell">Materials</td><td class="value-cell">$${d("materialsCost")}</td></tr>` : ""}
    <tr class="highlight"><td class="label-cell">Total Amount</td><td class="value-cell">$${d("totalAmount")}</td></tr>
  </table>
</div>

<div style="display:flex;gap:48px;margin-top:40px;">
  <div style="flex:1;">
    <div class="signature-line">Customer Signature &amp; Date</div>
  </div>
  <div style="flex:1;">
    <div class="signature-line">Technician Signature &amp; Date</div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Work Order &mdash; ${d("serviceDate")}</span>
</div>

</body></html>`;
  },
};
