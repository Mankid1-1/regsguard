import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const noticeToOwnerTemplate: DocumentTemplate = {
  slug: "notice-to-owner",
  name: "Notice to Owner / Pre-Lien Notice",
  category: "LIEN_WAIVER",
  description:
    "Statutory pre-lien notice protecting your right to file a mechanic's lien. In MN, must be served within 45 days of first work. In WI, within 60 days. Skipping this step kills your lien rights.",
  fields: [
    { key: "noticeDate", label: "Notice Date", type: "date", required: true, section: "Notice" },
    { key: "ownerName", label: "Property Owner Name", type: "text", required: true, autoFillFrom: "client.name", section: "Owner" },
    { key: "ownerAddress", label: "Owner Mailing Address", type: "text", required: true, autoFillFrom: "client.address", section: "Owner" },
    { key: "propertyAddress", label: "Property Address (where work performed)", type: "text", required: true, autoFillFrom: "project.address", section: "Property" },
    { key: "propertyCounty", label: "County", type: "text", required: true, section: "Property" },
    { key: "propertyState", label: "State", type: "text", required: true, autoFillFrom: "project.state", section: "Property" },
    { key: "legalDescription", label: "Legal Description (optional)", type: "textarea", required: false, section: "Property" },
    { key: "claimantName", label: "Claimant (Your Name)", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Claimant" },
    { key: "claimantAddress", label: "Claimant Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Claimant" },
    { key: "claimantCity", label: "City", type: "text", required: true, autoFillFrom: "profile.city", section: "Claimant" },
    { key: "claimantState", label: "State", type: "text", required: true, autoFillFrom: "profile.state", section: "Claimant" },
    { key: "claimantZip", label: "ZIP", type: "text", required: true, autoFillFrom: "profile.zip", section: "Claimant" },
    { key: "claimantPhone", label: "Phone", type: "text", required: false, autoFillFrom: "profile.phone", section: "Claimant" },
    { key: "contractingParty", label: "Party who hired you", type: "text", required: true, section: "Work" },
    { key: "workDescription", label: "Description of work or materials", type: "textarea", required: true, section: "Work" },
    { key: "firstWorkDate", label: "Date of first work / delivery", type: "date", required: true, section: "Work" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .legal-block { background: #fffbe6; border: 1px solid ${brandColor}; padding: 14px; border-radius: 6px; margin: 16px 0; font-size: 12px; line-height: 1.6; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div><div class="doc-type">NOTICE TO OWNER</div><div class="doc-date">${d("noticeDate")}</div></div>
</div>

<div class="legal-block">
  <strong>STATUTORY NOTICE — PRESERVES MECHANIC'S LIEN RIGHTS</strong><br>
  This Notice is provided pursuant to applicable state mechanic's-lien statute. The undersigned (the "Claimant") has been or will be furnishing labor, services, or materials for improvement of the property described below.
</div>

<div class="section">
  <div class="section-title">To the Property Owner</div>
  <div class="field-value">${d("ownerName")}</div>
  <div style="font-size:12px;color:#4b5563;">${d("ownerAddress")}</div>
</div>

<div class="section">
  <div class="section-title">Property Improved</div>
  <div class="field-value">${d("propertyAddress")}</div>
  <div style="font-size:12px;color:#4b5563;">${d("propertyCounty")} County, ${d("propertyState")}</div>
  ${d("legalDescription") ? `<div style="font-size:11px;color:#6b7280;margin-top:6px;"><strong>Legal description:</strong> ${d("legalDescription")}</div>` : ""}
</div>

<div class="section">
  <div class="section-title">Claimant</div>
  <div class="field-value">${d("claimantName")}</div>
  <div style="font-size:12px;color:#4b5563;">${d("claimantAddress")}<br>${d("claimantCity")}, ${d("claimantState")} ${d("claimantZip")}</div>
  ${d("claimantPhone") ? `<div style="font-size:12px;color:#4b5563;">${d("claimantPhone")}</div>` : ""}
</div>

<div class="section">
  <div class="section-title">Work Performed</div>
  <div class="row">
    <div class="field"><div class="field-label">Hired By</div><div class="field-value">${d("contractingParty")}</div></div>
    <div class="field"><div class="field-label">First Work Date</div><div class="field-value">${d("firstWorkDate")}</div></div>
  </div>
  <div class="callout">${d("workDescription")}</div>
</div>

<div class="legal-block">
  <strong>WARNING:</strong> If the bill is not paid in full for the labor, services, or materials furnished by the Claimant for the property described above, the Claimant may file a mechanic's lien against the property. A lien may be enforced by sale of the property if not paid in full within the time required by law.
</div>

<div class="row" style="margin-top:32px;">
  <div class="field">
    <div class="signature-line">Claimant Signature / Date</div>
  </div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>Notice to Owner</span>
</div>

</body></html>`;
  },
};
