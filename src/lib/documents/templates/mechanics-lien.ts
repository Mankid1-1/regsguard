import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const mechanicsLienTemplate: DocumentTemplate = {
  slug: "mechanics-lien",
  name: "Mechanic's Lien",
  category: "LIEN_WAIVER",
  description:
    "Mechanic's Lien filing form to secure payment for labor and materials provided",
  fields: [
    // Claimant Info
    { key: "claimantName", label: "Claimant Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Claimant Info" },
    { key: "claimantAddress", label: "Claimant Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Claimant Info" },
    { key: "claimantCity", label: "City", type: "text", required: true, section: "Claimant Info" },
    { key: "claimantState", label: "State", type: "text", required: true, section: "Claimant Info" },
    { key: "claimantZip", label: "ZIP", type: "text", required: true, section: "Claimant Info" },
    // Property Info
    { key: "propertyOwner", label: "Property Owner", type: "text", required: true, autoFillFrom: "client.name", section: "Property Info" },
    { key: "propertyAddress", label: "Property Address", type: "text", required: true, section: "Property Info" },
    { key: "propertyCity", label: "City", type: "text", required: true, section: "Property Info" },
    { key: "propertyState", label: "State", type: "text", required: true, section: "Property Info" },
    { key: "propertyZip", label: "ZIP", type: "text", required: true, section: "Property Info" },
    { key: "legalDescription", label: "Legal Description", type: "textarea", required: true, section: "Property Info" },
    // Claim Details
    { key: "contractAmount", label: "Contract Amount", type: "currency", required: true, autoFillFrom: "project.contractAmount", section: "Claim Details" },
    { key: "amountDue", label: "Amount Due", type: "currency", required: true, section: "Claim Details" },
    { key: "firstWorkDate", label: "First Work Date", type: "date", required: true, section: "Claim Details" },
    { key: "lastWorkDate", label: "Last Work Date", type: "date", required: true, section: "Claim Details" },
    { key: "workDescription", label: "Description of Work", type: "textarea", required: true, section: "Claim Details" },
    { key: "materialDescription", label: "Description of Materials", type: "textarea", required: false, section: "Claim Details" },
    // Notarization
    { key: "notarizeDate", label: "Notarization Date", type: "date", required: false, section: "Notarization" },
    { key: "countyName", label: "County", type: "text", required: true, section: "Notarization" },
  ],

  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .lien-title { text-align: center; font-size: 20px; font-weight: 700; color: ${brandColor}; margin-bottom: 4px; }
  .lien-subtitle { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 24px; }
  .amount-highlight { font-size: 18px; font-weight: 700; color: ${brandColor}; }
  .legal-block { font-style: italic; background: #f8fafc; border-left: 3px solid ${brandColor}; padding: 12px 16px; margin: 12px 0; font-size: 12px; line-height: 1.6; }
  .notary-block { border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 24px; }
  .notary-block .section-title { margin-top: 0; }
</style></head><body>

<div class="header">
  <div>
    ${brandHtml(brandName, branding)}
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Mechanic's Lien</div>
  </div>
  <div>
    <div class="doc-type">MECHANIC'S LIEN</div>
    <div class="doc-date">${d("countyName") ? `${d("countyName")} County` : ""}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Claimant Information</div>
  <div class="row">
    <div class="field"><div class="field-label">Claimant Name</div><div class="field-value">${d("claimantName")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Address</div><div class="field-value">${d("claimantAddress")}</div></div>
    <div class="field"><div class="field-label">City, State, ZIP</div><div class="field-value">${d("claimantCity")}, ${d("claimantState")} ${d("claimantZip")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Property Information</div>
  <div class="row">
    <div class="field"><div class="field-label">Property Owner</div><div class="field-value">${d("propertyOwner")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">Property Address</div><div class="field-value">${d("propertyAddress")}</div></div>
    <div class="field"><div class="field-label">City, State, ZIP</div><div class="field-value">${d("propertyCity")}, ${d("propertyState")} ${d("propertyZip")}</div></div>
  </div>
  ${d("legalDescription") ? `
  <div class="row">
    <div class="field"><div class="field-label">Legal Description</div><div class="legal-block">${d("legalDescription")}</div></div>
  </div>
  ` : ""}
</div>

<div class="section">
  <div class="section-title">Claim Details</div>
  <div class="row">
    <div class="field"><div class="field-label">Contract Amount</div><div class="field-value">$${d("contractAmount")}</div></div>
    <div class="field"><div class="field-label">Amount Due</div><div class="field-value amount-highlight">$${d("amountDue")}</div></div>
  </div>
  <div class="row">
    <div class="field"><div class="field-label">First Work Date</div><div class="field-value">${d("firstWorkDate")}</div></div>
    <div class="field"><div class="field-label">Last Work Date</div><div class="field-value">${d("lastWorkDate")}</div></div>
  </div>
  <div class="row">
    <div class="field">
      <div class="field-label">Description of Work</div>
      <div class="callout">${d("workDescription")}</div>
    </div>
  </div>
  ${d("materialDescription") ? `
  <div class="row">
    <div class="field">
      <div class="field-label">Description of Materials</div>
      <div class="callout">${d("materialDescription")}</div>
    </div>
  </div>
  ` : ""}
</div>

<div class="notary-block">
  <div class="section-title">Notarization</div>
  <div class="row">
    <div class="field"><div class="field-label">County</div><div class="field-value">${d("countyName")}</div></div>
    <div class="field"><div class="field-label">Date</div><div class="field-value">${d("notarizeDate")}</div></div>
  </div>
  <div style="display:flex;gap:48px;margin-top:40px;">
    <div style="flex:1;">
      <div class="signature-line">Claimant Signature</div>
    </div>
    <div style="flex:1;">
      <div class="signature-line">Notary Public Signature &amp; Seal</div>
    </div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Mechanic's Lien &mdash; ${d("claimantName")}</span>
</div>

</body></html>`;
  },
};
