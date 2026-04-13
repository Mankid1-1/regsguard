interface ComplianceReportData {
  businessName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  responsiblePerson: string;
  licenseNumbers: Record<string, string>;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceExpiration: string | null;
  bondAmount: string | null;
  bondProvider: string | null;
  bondExpiration: string | null;
  regulationTitle: string;
  regulationAuthority: string;
  regulationDescription: string;
  regulationCategory: string;
  regulationFee: string | null;
  regulationRenewalCycle: string;
  deadlineDate: string | null;
  generatedAt: string;
  /** White-label branding */
  tenantName?: string;
  tenantColor?: string;
  tenantLogoInitials?: string;
  tenantLogoUrl?: string | null;
}

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatCycle(cycle: string): string {
  const map: Record<string, string> = {
    ANNUAL: "Annual",
    BIENNIAL: "Biennial (Every 2 Years)",
    TRIENNIAL: "Triennial (Every 3 Years)",
    FIVE_YEAR: "Every 5 Years",
    ONE_TIME: "One-Time",
    VARIES: "Varies",
  };
  return map[cycle] || cycle;
}

export function generateComplianceReportHtml(data: ComplianceReportData): string {
  const licenseEntries = Object.entries(data.licenseNumbers).filter(
    ([, v]) => v && v.trim() !== ""
  );

  const brandName = data.tenantName || "RegsGuard";
  const brandColor = data.tenantColor || "#1e40af";
  const brandInitials = data.tenantLogoInitials || "RG";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compliance Report - ${data.regulationTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
      background: #ffffff;
      padding: 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid ${brandColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 48px;
      height: 48px;
      background: ${brandColor};
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 20px;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: ${brandColor};
      letter-spacing: -0.5px;
    }
    .doc-title {
      text-align: right;
    }
    .doc-title h1 {
      font-size: 22px;
      color: ${brandColor};
      font-weight: 600;
    }
    .doc-title p {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }

    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: ${brandColor};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 32px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 14px;
      color: #1a1a2e;
      font-weight: 500;
    }
    .info-value.highlight {
      color: ${brandColor};
      font-weight: 600;
    }

    .description-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      font-size: 14px;
      color: #374151;
      line-height: 1.7;
      margin-top: 8px;
    }

    .license-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .license-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      padding: 8px 12px;
      border-bottom: 2px solid #e5e7eb;
    }
    .license-table td {
      font-size: 14px;
      padding: 10px 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #1a1a2e;
    }
    .license-table tr:last-child td {
      border-bottom: none;
    }

    .insurance-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .deadline-highlight {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1px solid ${brandColor}40;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }
    .deadline-highlight .label {
      font-size: 13px;
      color: ${brandColor};
      font-weight: 600;
    }
    .deadline-highlight .date {
      font-size: 18px;
      color: #1e3a8a;
      font-weight: 700;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left {
      font-size: 12px;
      color: #9ca3af;
    }
    .footer-right {
      font-size: 12px;
      color: #9ca3af;
      text-align: right;
    }
    .footer-brand {
      color: ${brandColor};
      font-weight: 600;
    }

    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      ${data.tenantLogoUrl
        ? `<img src="${data.tenantLogoUrl}" alt="${brandName}" style="width:48px;height:48px;border-radius:10px;object-fit:contain;" />`
        : `<div class="logo-icon">${brandInitials}</div>`
      }
      <span class="logo-text">${brandName}</span>
    </div>
    <div class="doc-title">
      <h1>Compliance Report</h1>
      <p>Generated ${data.generatedAt}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Business Information</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Business Name</span>
        <span class="info-value highlight">${data.businessName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Responsible Person</span>
        <span class="info-value">${data.responsiblePerson}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Address</span>
        <span class="info-value">${data.address}, ${data.city}, ${data.state} ${data.zip}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Phone</span>
        <span class="info-value">${data.phone}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email</span>
        <span class="info-value">${data.email}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Regulation Details</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Regulation Title</span>
        <span class="info-value highlight">${data.regulationTitle}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Regulatory Authority</span>
        <span class="info-value">${data.regulationAuthority}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Category</span>
        <span class="info-value">${formatCategory(data.regulationCategory)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Renewal Cycle</span>
        <span class="info-value">${formatCycle(data.regulationRenewalCycle)}</span>
      </div>
      ${data.regulationFee ? `
      <div class="info-item">
        <span class="info-label">Fee</span>
        <span class="info-value">${data.regulationFee}</span>
      </div>` : ""}
    </div>
    <div class="description-box">${data.regulationDescription}</div>
    ${data.deadlineDate ? `
    <div class="deadline-highlight">
      <span class="label">Next Due Date</span>
      <span class="date">${data.deadlineDate}</span>
    </div>` : ""}
  </div>

  ${licenseEntries.length > 0 ? `
  <div class="section">
    <div class="section-title">License Numbers</div>
    <table class="license-table">
      <thead>
        <tr>
          <th>License Type</th>
          <th>Number</th>
        </tr>
      </thead>
      <tbody>
        ${licenseEntries
          .map(([key, value]) => `
        <tr>
          <td>${key}</td>
          <td>${value}</td>
        </tr>`)
          .join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${data.insuranceProvider || data.bondProvider ? `
  <div class="section">
    <div class="section-title">Insurance &amp; Bond Information</div>
    ${data.insuranceProvider ? `
    <div class="insurance-grid" style="margin-bottom: 12px;">
      <div class="info-item">
        <span class="info-label">Insurance Provider</span>
        <span class="info-value">${data.insuranceProvider}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Policy Number</span>
        <span class="info-value">${data.insurancePolicyNumber || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Expiration</span>
        <span class="info-value">${data.insuranceExpiration || "N/A"}</span>
      </div>
    </div>` : ""}
    ${data.bondProvider ? `
    <div class="insurance-grid">
      <div class="info-item">
        <span class="info-label">Bond Provider</span>
        <span class="info-value">${data.bondProvider}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Bond Amount</span>
        <span class="info-value">${data.bondAmount || "N/A"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Bond Expiration</span>
        <span class="info-value">${data.bondExpiration || "N/A"}</span>
      </div>
    </div>` : ""}
  </div>` : ""}

  <div class="footer">
    <div class="footer-left">
      <span class="footer-brand">Generated by ${brandName}</span><br />
      This document was auto-generated for compliance tracking purposes.
    </div>
    <div class="footer-right">
      ${data.businessName}<br />
      ${data.generatedAt}
    </div>
  </div>
</body>
</html>`;
}
