import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const proposalTemplate: DocumentTemplate = {
  slug: "proposal",
  name: "Contractor Proposal / Estimate",
  category: "PROPOSAL",
  description:
    "Professional contractor proposal with scope of work, line item estimates, payment schedule, and terms.",
  fields: [
    // Proposal details
    { key: "proposalNumber", label: "Proposal Number", type: "text", required: true, placeholder: "PROP-001", section: "Proposal Details" },
    { key: "proposalDate", label: "Proposal Date", type: "date", required: true, section: "Proposal Details" },
    { key: "validUntil", label: "Valid Until", type: "date", required: true, section: "Proposal Details" },
    { key: "projectName", label: "Project / Job Name", type: "text", required: false, autoFillFrom: "project.name", section: "Proposal Details" },
    { key: "projectAddress", label: "Project Address", type: "text", required: false, autoFillFrom: "project.address", section: "Proposal Details" },
    // From
    { key: "fromName", label: "From Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "From" },
    { key: "fromAddress", label: "Address", type: "text", required: true, autoFillFrom: "profile.address", section: "From" },
    { key: "fromCity", label: "City", type: "text", required: true, autoFillFrom: "profile.city", section: "From" },
    { key: "fromState", label: "State", type: "text", required: true, autoFillFrom: "profile.state", section: "From" },
    { key: "fromZip", label: "ZIP", type: "text", required: true, autoFillFrom: "profile.zip", section: "From" },
    { key: "fromPhone", label: "Phone", type: "text", required: false, autoFillFrom: "profile.phone", section: "From" },
    { key: "fromEmail", label: "Email", type: "text", required: false, autoFillFrom: "profile.email", section: "From" },
    // To
    { key: "toName", label: "To Name", type: "text", required: true, autoFillFrom: "client.name", section: "To" },
    { key: "toCompany", label: "Company", type: "text", required: false, autoFillFrom: "client.company", section: "To" },
    { key: "toAddress", label: "Address", type: "text", required: false, autoFillFrom: "client.address", section: "To" },
    // Scope
    { key: "scopeOfWork", label: "Scope of Work", type: "textarea", required: true, section: "Scope" },
    { key: "materials", label: "Materials", type: "textarea", required: false, section: "Scope" },
    { key: "laborDescription", label: "Labor Description", type: "textarea", required: false, section: "Scope" },
    { key: "timeline", label: "Estimated Timeline", type: "text", required: false, placeholder: "e.g. 4-6 weeks", section: "Scope" },
    // Line items
    { key: "item1", label: "Item 1", type: "text", required: true, section: "Cost Breakdown" },
    { key: "itemCost1", label: "Cost 1", type: "currency", required: true, section: "Cost Breakdown" },
    { key: "item2", label: "Item 2", type: "text", required: false, section: "Cost Breakdown" },
    { key: "itemCost2", label: "Cost 2", type: "currency", required: false, section: "Cost Breakdown" },
    { key: "item3", label: "Item 3", type: "text", required: false, section: "Cost Breakdown" },
    { key: "itemCost3", label: "Cost 3", type: "currency", required: false, section: "Cost Breakdown" },
    { key: "item4", label: "Item 4", type: "text", required: false, section: "Cost Breakdown" },
    { key: "itemCost4", label: "Cost 4", type: "currency", required: false, section: "Cost Breakdown" },
    // Totals & terms
    { key: "totalEstimate", label: "Total Estimate", type: "currency", required: true, section: "Total" },
    { key: "paymentSchedule", label: "Payment Schedule", type: "textarea", required: false, placeholder: "e.g. 50% upon signing, 50% upon completion", section: "Terms" },
    { key: "exclusions", label: "Exclusions", type: "textarea", required: false, section: "Terms" },
    { key: "warranty", label: "Warranty", type: "text", required: false, section: "Terms" },
    { key: "notes", label: "Additional Notes", type: "textarea", required: false, section: "Terms" },
  ],

  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";

    const lineRows = [1, 2, 3, 4]
      .filter((i) => d(`item${i}`))
      .map(
        (i) => `
        <tr>
          <td>${d(`item${i}`)}</td>
          <td style="text-align:right;">$${d(`itemCost${i}`)}</td>
        </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .total-banner { background: ${brandColor}; color: #fff; padding: 12px 16px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
  .total-banner .label { font-size: 14px; font-weight: 600; }
  .total-banner .amount { font-size: 20px; font-weight: 700; }
  .validity { font-size: 11px; color: #6b7280; margin-top: 4px; }
</style></head><body>

<div class="header">
  <div>
    ${brandHtml(brandName, branding)}
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Proposal / Estimate</div>
  </div>
  <div>
    <div class="doc-type">PROPOSAL</div>
    <div class="doc-date">#${d("proposalNumber")}</div>
    <div class="validity">Valid until ${d("validUntil")}</div>
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
      <div class="section-title">Prepared For</div>
      <div class="field-value">${d("toName")}</div>
      ${d("toCompany") ? `<div style="font-size:12px;color:#4b5563;">${d("toCompany")}</div>` : ""}
      ${d("toAddress") ? `<div style="font-size:12px;color:#4b5563;">${d("toAddress")}</div>` : ""}
    </div>
    <div class="field" style="flex:0.6;">
      <div class="section-title">Details</div>
      <div class="field-label">Proposal Date</div>
      <div class="field-value">${d("proposalDate")}</div>
      <div class="field-label" style="margin-top:6px;">Timeline</div>
      <div class="field-value">${d("timeline")}</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Scope of Work</div>
  <div class="callout">${d("scopeOfWork")}</div>
</div>

${d("materials") ? `
<div class="section">
  <div class="section-title">Materials</div>
  <div class="callout">${d("materials")}</div>
</div>
` : ""}

${d("laborDescription") ? `
<div class="section">
  <div class="section-title">Labor</div>
  <div class="callout">${d("laborDescription")}</div>
</div>
` : ""}

<div class="section">
  <div class="section-title">Cost Breakdown</div>
  <table>
    <thead>
      <tr>
        <th style="width:70%;">Item</th>
        <th style="text-align:right;">Cost</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
    </tbody>
  </table>
  <div class="total-banner">
    <span class="label">Total Estimate</span>
    <span class="amount">$${d("totalEstimate")}</span>
  </div>
</div>

${d("paymentSchedule") ? `
<div class="section">
  <div class="section-title">Payment Schedule</div>
  <div class="callout">${d("paymentSchedule")}</div>
</div>
` : ""}

${d("exclusions") ? `
<div class="section">
  <div class="section-title">Exclusions</div>
  <div class="callout">${d("exclusions")}</div>
</div>
` : ""}

${d("warranty") ? `
<div class="section">
  <div class="section-title">Warranty</div>
  <div class="field-value">${d("warranty")}</div>
</div>
` : ""}

${d("notes") ? `
<div class="section">
  <div class="section-title">Additional Notes</div>
  <div class="callout">${d("notes")}</div>
</div>
` : ""}

<div style="display:flex;gap:48px;margin-top:40px;">
  <div style="flex:1;"><div class="signature-line">Client Signature &amp; Date</div></div>
  <div style="flex:1;"><div class="signature-line">Contractor Signature &amp; Date</div></div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Proposal #${d("proposalNumber")}</span>
</div>

</body></html>`;
  },
};
