import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml, type BrandingContext } from "./registry";

export const permitApplicationTemplate: DocumentTemplate = {
  slug: "permit-application",
  name: "Building / Trade Permit Application",
  category: "PERMIT",
  description:
    "Permit application form for building, electrical, plumbing, HVAC, and other trade permits.",
  fields: [
    { key: "permitType", label: "Permit Type", type: "select", required: true, options: [
      { label: "Building", value: "Building" },
      { label: "Electrical", value: "Electrical" },
      { label: "Plumbing", value: "Plumbing" },
      { label: "HVAC", value: "HVAC" },
      { label: "Mechanical", value: "Mechanical" },
      { label: "Demolition", value: "Demolition" },
      { label: "Roofing", value: "Roofing" },
    ], section: "Permit Information" },
    // Applicant
    { key: "applicantName", label: "Applicant Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Applicant Information" },
    { key: "applicantAddress", label: "Address", type: "text", required: true, autoFillFrom: "profile.address", section: "Applicant Information" },
    { key: "applicantCity", label: "City", type: "text", required: true, autoFillFrom: "profile.city", section: "Applicant Information" },
    { key: "applicantState", label: "State", type: "text", required: true, autoFillFrom: "profile.state", section: "Applicant Information" },
    { key: "applicantZip", label: "ZIP", type: "text", required: true, autoFillFrom: "profile.zip", section: "Applicant Information" },
    { key: "applicantPhone", label: "Phone", type: "text", required: true, autoFillFrom: "profile.phone", section: "Applicant Information" },
    { key: "applicantEmail", label: "Email", type: "text", required: false, autoFillFrom: "profile.email", section: "Applicant Information" },
    { key: "licenseNumber", label: "License Number", type: "text", required: true, autoFillFrom: "profile.licenseNumber", section: "Applicant Information" },
    // Property
    { key: "propertyAddress", label: "Property Address", type: "text", required: true, autoFillFrom: "project.address", section: "Property Information" },
    { key: "propertyCity", label: "City", type: "text", required: true, section: "Property Information" },
    { key: "propertyState", label: "State", type: "text", required: true, section: "Property Information" },
    { key: "propertyZip", label: "ZIP", type: "text", required: true, section: "Property Information" },
    { key: "propertyOwner", label: "Property Owner", type: "text", required: true, autoFillFrom: "client.name", section: "Property Information" },
    { key: "ownerPhone", label: "Owner Phone", type: "text", required: false, section: "Property Information" },
    // Project
    { key: "projectDescription", label: "Project Description", type: "textarea", required: true, section: "Project Details" },
    { key: "estimatedCost", label: "Estimated Cost", type: "currency", required: true, section: "Project Details" },
    { key: "startDate", label: "Proposed Start Date", type: "date", required: true, section: "Project Details" },
    { key: "completionDate", label: "Estimated Completion Date", type: "date", required: true, section: "Project Details" },
    { key: "contractorName", label: "Contractor Name", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Contractor Information" },
    { key: "contractorLicense", label: "Contractor License #", type: "text", required: true, autoFillFrom: "profile.licenseNumber", section: "Contractor Information" },
    { key: "squareFootage", label: "Square Footage", type: "number", required: false, section: "Project Details" },
  ],

  generateHtml(data, brandName, brandColor, branding) {
    const d = (key: string) => data[key] || "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .permit-badge { display: inline-block; background: ${brandColor}; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .form-grid .full { grid-column: 1 / -1; }
</style></head><body>

<div class="header">
  <div>
    ${brandHtml(brandName, branding)}
    <div style="margin-top:4px;font-size:12px;color:#6b7280;">Permit Application</div>
  </div>
  <div>
    <div class="doc-type">PERMIT APPLICATION</div>
    <div style="margin-top:6px;"><span class="permit-badge">${d("permitType")} Permit</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Applicant Information</div>
  <div class="form-grid">
    <div class="field"><div class="field-label">Applicant Name</div><div class="field-value">${d("applicantName")}</div></div>
    <div class="field"><div class="field-label">License Number</div><div class="field-value">${d("licenseNumber")}</div></div>
    <div class="field full"><div class="field-label">Address</div><div class="field-value">${d("applicantAddress")}, ${d("applicantCity")}, ${d("applicantState")} ${d("applicantZip")}</div></div>
    <div class="field"><div class="field-label">Phone</div><div class="field-value">${d("applicantPhone")}</div></div>
    <div class="field"><div class="field-label">Email</div><div class="field-value">${d("applicantEmail")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Property Information</div>
  <div class="form-grid">
    <div class="field full"><div class="field-label">Property Address</div><div class="field-value">${d("propertyAddress")}, ${d("propertyCity")}, ${d("propertyState")} ${d("propertyZip")}</div></div>
    <div class="field"><div class="field-label">Property Owner</div><div class="field-value">${d("propertyOwner")}</div></div>
    <div class="field"><div class="field-label">Owner Phone</div><div class="field-value">${d("ownerPhone")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Project Details</div>
  <div class="form-grid">
    <div class="field full"><div class="field-label">Project Description</div><div class="callout">${d("projectDescription")}</div></div>
    <div class="field"><div class="field-label">Estimated Cost</div><div class="field-value">$${d("estimatedCost")}</div></div>
    <div class="field"><div class="field-label">Square Footage</div><div class="field-value">${d("squareFootage")}</div></div>
    <div class="field"><div class="field-label">Proposed Start Date</div><div class="field-value">${d("startDate")}</div></div>
    <div class="field"><div class="field-label">Estimated Completion</div><div class="field-value">${d("completionDate")}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Contractor Information</div>
  <div class="form-grid">
    <div class="field"><div class="field-label">Contractor Name</div><div class="field-value">${d("contractorName")}</div></div>
    <div class="field"><div class="field-label">Contractor License #</div><div class="field-value">${d("contractorLicense")}</div></div>
  </div>
</div>

<div style="display:flex;gap:48px;margin-top:40px;">
  <div style="flex:1;"><div class="signature-line">Applicant Signature &amp; Date</div></div>
  <div style="flex:1;"><div class="signature-line">Property Owner Signature &amp; Date</div></div>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>${d("permitType")} Permit Application</span>
</div>

</body></html>`;
  },
};
