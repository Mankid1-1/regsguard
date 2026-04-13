import type { DocumentTemplate } from "./registry";
import { basePdfCss } from "./registry";

export const wh347Template: DocumentTemplate = {
  slug: "wh-347",
  name: "WH-347 Certified Payroll Report",
  category: "COMPLIANCE",
  description:
    "Federal WH-347 Certified Payroll Report for prevailing wage projects. Required for Davis-Bacon Act compliance on federally funded construction.",
  fields: [
    // Contractor info
    {
      key: "contractorName",
      label: "Contractor / Subcontractor",
      type: "text",
      required: true,
      autoFillFrom: "profile.businessName",
      section: "Contractor Information",
    },
    {
      key: "contractorAddress",
      label: "Address",
      type: "text",
      required: true,
      autoFillFrom: "profile.address",
      section: "Contractor Information",
    },
    // Project info
    {
      key: "contractNumber",
      label: "Contract Number",
      type: "text",
      required: true,
      section: "Project Information",
    },
    {
      key: "projectName",
      label: "Project and Location",
      type: "text",
      required: true,
      autoFillFrom: "project.name",
      section: "Project Information",
    },
    {
      key: "projectLocation",
      label: "Project Location",
      type: "text",
      required: true,
      section: "Project Information",
    },
    // Payroll period
    {
      key: "weekEnding",
      label: "For Week Ending",
      type: "date",
      required: true,
      section: "Payroll Period",
    },
    {
      key: "payrollNumber",
      label: "Payroll No.",
      type: "number",
      required: true,
      placeholder: "1",
      section: "Payroll Period",
    },
    // Employee rows (up to 8)
    {
      key: "emp1Name",
      label: "Employee 1 - Name",
      type: "text",
      required: false,
      section: "Employee 1",
    },
    {
      key: "emp1Classification",
      label: "Employee 1 - Work Classification",
      type: "text",
      required: false,
      placeholder: "e.g. Electrician, Plumber, Laborer",
      section: "Employee 1",
    },
    {
      key: "emp1Hours",
      label: "Employee 1 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 1",
    },
    {
      key: "emp1Rate",
      label: "Employee 1 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 1",
    },
    {
      key: "emp1Gross",
      label: "Employee 1 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 1",
    },
    {
      key: "emp1Deductions",
      label: "Employee 1 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 1",
    },
    {
      key: "emp1Net",
      label: "Employee 1 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 1",
    },
    // Employee 2
    {
      key: "emp2Name",
      label: "Employee 2 - Name",
      type: "text",
      required: false,
      section: "Employee 2",
    },
    {
      key: "emp2Classification",
      label: "Employee 2 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 2",
    },
    {
      key: "emp2Hours",
      label: "Employee 2 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 2",
    },
    {
      key: "emp2Rate",
      label: "Employee 2 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 2",
    },
    {
      key: "emp2Gross",
      label: "Employee 2 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 2",
    },
    {
      key: "emp2Deductions",
      label: "Employee 2 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 2",
    },
    {
      key: "emp2Net",
      label: "Employee 2 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 2",
    },
    // Employee 3
    {
      key: "emp3Name",
      label: "Employee 3 - Name",
      type: "text",
      required: false,
      section: "Employee 3",
    },
    {
      key: "emp3Classification",
      label: "Employee 3 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 3",
    },
    {
      key: "emp3Hours",
      label: "Employee 3 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 3",
    },
    {
      key: "emp3Rate",
      label: "Employee 3 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 3",
    },
    {
      key: "emp3Gross",
      label: "Employee 3 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 3",
    },
    {
      key: "emp3Deductions",
      label: "Employee 3 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 3",
    },
    {
      key: "emp3Net",
      label: "Employee 3 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 3",
    },
    // Employee 4
    {
      key: "emp4Name",
      label: "Employee 4 - Name",
      type: "text",
      required: false,
      section: "Employee 4",
    },
    {
      key: "emp4Classification",
      label: "Employee 4 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 4",
    },
    {
      key: "emp4Hours",
      label: "Employee 4 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 4",
    },
    {
      key: "emp4Rate",
      label: "Employee 4 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 4",
    },
    {
      key: "emp4Gross",
      label: "Employee 4 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 4",
    },
    {
      key: "emp4Deductions",
      label: "Employee 4 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 4",
    },
    {
      key: "emp4Net",
      label: "Employee 4 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 4",
    },
    // Employee 5
    {
      key: "emp5Name",
      label: "Employee 5 - Name",
      type: "text",
      required: false,
      section: "Employee 5",
    },
    {
      key: "emp5Classification",
      label: "Employee 5 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 5",
    },
    {
      key: "emp5Hours",
      label: "Employee 5 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 5",
    },
    {
      key: "emp5Rate",
      label: "Employee 5 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 5",
    },
    {
      key: "emp5Gross",
      label: "Employee 5 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 5",
    },
    {
      key: "emp5Deductions",
      label: "Employee 5 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 5",
    },
    {
      key: "emp5Net",
      label: "Employee 5 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 5",
    },
    // Employee 6
    {
      key: "emp6Name",
      label: "Employee 6 - Name",
      type: "text",
      required: false,
      section: "Employee 6",
    },
    {
      key: "emp6Classification",
      label: "Employee 6 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 6",
    },
    {
      key: "emp6Hours",
      label: "Employee 6 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 6",
    },
    {
      key: "emp6Rate",
      label: "Employee 6 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 6",
    },
    {
      key: "emp6Gross",
      label: "Employee 6 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 6",
    },
    {
      key: "emp6Deductions",
      label: "Employee 6 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 6",
    },
    {
      key: "emp6Net",
      label: "Employee 6 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 6",
    },
    // Employee 7
    {
      key: "emp7Name",
      label: "Employee 7 - Name",
      type: "text",
      required: false,
      section: "Employee 7",
    },
    {
      key: "emp7Classification",
      label: "Employee 7 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 7",
    },
    {
      key: "emp7Hours",
      label: "Employee 7 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 7",
    },
    {
      key: "emp7Rate",
      label: "Employee 7 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 7",
    },
    {
      key: "emp7Gross",
      label: "Employee 7 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 7",
    },
    {
      key: "emp7Deductions",
      label: "Employee 7 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 7",
    },
    {
      key: "emp7Net",
      label: "Employee 7 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 7",
    },
    // Employee 8
    {
      key: "emp8Name",
      label: "Employee 8 - Name",
      type: "text",
      required: false,
      section: "Employee 8",
    },
    {
      key: "emp8Classification",
      label: "Employee 8 - Work Classification",
      type: "text",
      required: false,
      section: "Employee 8",
    },
    {
      key: "emp8Hours",
      label: "Employee 8 - Total Hours",
      type: "number",
      required: false,
      section: "Employee 8",
    },
    {
      key: "emp8Rate",
      label: "Employee 8 - Rate of Pay",
      type: "currency",
      required: false,
      section: "Employee 8",
    },
    {
      key: "emp8Gross",
      label: "Employee 8 - Gross Pay",
      type: "currency",
      required: false,
      section: "Employee 8",
    },
    {
      key: "emp8Deductions",
      label: "Employee 8 - Total Deductions",
      type: "currency",
      required: false,
      section: "Employee 8",
    },
    {
      key: "emp8Net",
      label: "Employee 8 - Net Pay",
      type: "currency",
      required: false,
      section: "Employee 8",
    },
  ],

  generateHtml(data, brandName, brandColor) {
    const d = (key: string) => data[key] || "";
    const money = (key: string) => {
      const val = d(key);
      if (!val) return "";
      const n = parseFloat(val);
      return isNaN(n) ? val : `$${n.toFixed(2)}`;
    };

    // Build employee rows
    const employeeRows = [1, 2, 3, 4, 5, 6, 7, 8]
      .filter((i) => d(`emp${i}Name`))
      .map(
        (i) => `
        <tr>
          <td>${d(`emp${i}Name`)}</td>
          <td>${d(`emp${i}Classification`)}</td>
          <td style="text-align:center;">${d(`emp${i}Hours`)}</td>
          <td style="text-align:right;">${money(`emp${i}Rate`)}</td>
          <td style="text-align:right;">${money(`emp${i}Gross`)}</td>
          <td style="text-align:right;">${money(`emp${i}Deductions`)}</td>
          <td style="text-align:right;">${money(`emp${i}Net`)}</td>
        </tr>`
      )
      .join("");

    // Calculate totals
    const totalHours = [1, 2, 3, 4, 5, 6, 7, 8]
      .filter((i) => d(`emp${i}Name`))
      .reduce((sum, i) => sum + (parseFloat(d(`emp${i}Hours`)) || 0), 0);
    const totalGross = [1, 2, 3, 4, 5, 6, 7, 8]
      .filter((i) => d(`emp${i}Name`))
      .reduce((sum, i) => sum + (parseFloat(d(`emp${i}Gross`)) || 0), 0);
    const totalDeductions = [1, 2, 3, 4, 5, 6, 7, 8]
      .filter((i) => d(`emp${i}Name`))
      .reduce((sum, i) => sum + (parseFloat(d(`emp${i}Deductions`)) || 0), 0);
    const totalNet = [1, 2, 3, 4, 5, 6, 7, 8]
      .filter((i) => d(`emp${i}Name`))
      .reduce((sum, i) => sum + (parseFloat(d(`emp${i}Net`)) || 0), 0);

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  .form-id { text-align: center; font-size: 10px; color: #6b7280; margin-bottom: 4px; }
  .form-title { text-align: center; font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px; }
  .form-subtitle { text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 16px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .info-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
  .info-box .label { font-size: 9px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-box .value { font-size: 13px; font-weight: 500; margin-top: 2px; }
  .payroll-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
  .payroll-table th { background: ${brandColor}; color: white; padding: 8px 6px; text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
  .payroll-table td { padding: 7px 6px; border-bottom: 1px solid #e5e7eb; }
  .payroll-table .total-row { background: #f8fafc; font-weight: 700; }
  .payroll-table .total-row td { border-top: 2px solid ${brandColor}; border-bottom: 2px solid ${brandColor}; }
  .certification { border: 2px solid ${brandColor}; border-radius: 8px; padding: 16px; margin-top: 24px; }
  .certification-title { font-size: 12px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; margin-bottom: 8px; }
  .certification-text { font-size: 10px; color: #4b5563; line-height: 1.6; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
  .sig-block { padding-top: 4px; }
  .sig-line { border-top: 1px solid #1a1a2e; margin-top: 30px; padding-top: 4px; font-size: 10px; color: #6b7280; }
</style></head><body>

<div class="form-id">U.S. Department of Labor -- Wage and Hour Division</div>
<div class="form-title">PAYROLL</div>
<div class="form-subtitle">(WH-347 -- Certified Payroll Report for Federal and Federally Assisted Construction)</div>

<div class="header">
  <div>
    <div class="brand">${brandName}</div>
    <div style="margin-top:4px;font-size:11px;color:#6b7280;">Certified Payroll Report</div>
  </div>
  <div>
    <div class="doc-type">WH-347</div>
    <div class="doc-date">Payroll #${d("payrollNumber")}</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <div class="label">Contractor / Subcontractor</div>
    <div class="value">${d("contractorName")}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:2px;">${d("contractorAddress")}</div>
  </div>
  <div class="info-box">
    <div class="label">Contract Number</div>
    <div class="value">${d("contractNumber")}</div>
  </div>
  <div class="info-box">
    <div class="label">Project and Location</div>
    <div class="value">${d("projectName")}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:2px;">${d("projectLocation")}</div>
  </div>
  <div class="info-box">
    <div class="label">For Week Ending</div>
    <div class="value">${d("weekEnding")}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px;">
      <span class="label">Payroll No.</span> ${d("payrollNumber")}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Employee Payroll Detail</div>
  <table class="payroll-table">
    <thead>
      <tr>
        <th style="width:22%;">Name</th>
        <th style="width:18%;">Classification</th>
        <th style="width:10%;text-align:center;">Hours</th>
        <th style="width:12%;text-align:right;">Rate</th>
        <th style="width:14%;text-align:right;">Gross</th>
        <th style="width:12%;text-align:right;">Deductions</th>
        <th style="width:12%;text-align:right;">Net Pay</th>
      </tr>
    </thead>
    <tbody>
      ${employeeRows || '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:20px;">No employees entered</td></tr>'}
      <tr class="total-row">
        <td colspan="2" style="text-align:right;font-weight:700;">TOTALS</td>
        <td style="text-align:center;">${totalHours || ""}</td>
        <td></td>
        <td style="text-align:right;">$${totalGross.toFixed(2)}</td>
        <td style="text-align:right;">$${totalDeductions.toFixed(2)}</td>
        <td style="text-align:right;">$${totalNet.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="certification">
  <div class="certification-title">Statement of Compliance</div>
  <div class="certification-text">
    I, <strong>${d("contractorName")}</strong>, do hereby state:<br><br>
    (1) That I pay or supervise the payment of the persons employed by me on the
    <strong>${d("projectName")}</strong>; that during the payroll period commencing on the
    day of _________, and ending the <strong>${d("weekEnding")}</strong> day of _________,
    all persons employed on said project have been paid the full weekly wages earned, that no rebates
    have been or will be made either directly or indirectly to or on behalf of said
    from the full weekly wages earned by any person and that no deductions have been made either
    directly or indirectly from the full wages earned by any person, other than permissible deductions
    as defined in Regulations, Part 3 (29 CFR Subtitle A), issued by the Secretary of Labor.<br><br>
    (2) That any payrolls otherwise under this contract required to be submitted for the above period are
    correct and complete; that the wage rates for laborers or mechanics contained therein are not less
    than the applicable wage rates contained in any wage determination incorporated into the contract.
  </div>
</div>

<div class="sig-grid">
  <div class="sig-block">
    <div class="sig-line">Signature</div>
  </div>
  <div class="sig-block">
    <div class="sig-line">Title</div>
  </div>
  <div class="sig-block">
    <div class="sig-line">Name (Print)</div>
  </div>
  <div class="sig-block">
    <div class="sig-line">Date</div>
  </div>
</div>

<div class="footer">
  <span>Generated by <span class="brand-mark">${brandName}</span></span>
  <span>WH-347 -- Payroll #${d("payrollNumber")}</span>
</div>

</body></html>`;
  },
};
