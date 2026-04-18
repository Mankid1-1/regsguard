import type { DocumentTemplate } from "./registry";
import { basePdfCss, brandHtml, footerBrandHtml } from "./registry";

export const aiaG703Template: DocumentTemplate = {
  slug: "aia-g703-continuation-sheet",
  name: "AIA G703 - Continuation Sheet / Schedule of Values",
  category: "OTHER",
  description:
    "AIA G703 Continuation Sheet, the companion to the G702 Application for Payment. Breaks down the contract sum by work line items, tracks completed work, stored materials, and remaining balance. Standard on all commercial AIA contracts.",
  fields: [
    { key: "applicationNumber", label: "Application Number", type: "text", required: true, section: "Header", placeholder: "1" },
    { key: "applicationDate", label: "Application Date", type: "date", required: true, section: "Header" },
    { key: "periodTo", label: "Period Ending", type: "date", required: true, section: "Header" },
    { key: "projectName", label: "Project", type: "text", required: true, autoFillFrom: "project.name", section: "Header" },
    { key: "projectAddress", label: "Project Address", type: "text", required: false, autoFillFrom: "project.address", section: "Header" },
    { key: "ownerName", label: "Owner / Client", type: "text", required: true, autoFillFrom: "client.companyName", section: "Header" },
    { key: "contractorName", label: "Contractor", type: "text", required: true, autoFillFrom: "profile.businessName", section: "Header" },
    { key: "contractAmount", label: "Original Contract Sum", type: "currency", required: true, autoFillFrom: "project.contractAmount", section: "Contract" },
    { key: "approvedChangeOrders", label: "Approved Change Orders to Date", type: "currency", required: false, section: "Contract", placeholder: "0" },
    // Line items — we'll support 20 rows of A/B/C/D/E/F/G/H/I fields as a JSON blob
    { key: "lineItems", label: "Line Items (JSON)", type: "textarea", required: true, section: "Line Items",
      placeholder: `[
  {"desc":"General Conditions","scheduledValue":10000,"workPrev":0,"workThis":5000,"stored":0},
  {"desc":"Demolition","scheduledValue":15000,"workPrev":15000,"workThis":0,"stored":0},
  {"desc":"Rough Plumbing","scheduledValue":35000,"workPrev":0,"workThis":20000,"stored":5000}
]` },
    { key: "retainagePercent", label: "Retainage %", type: "number", required: false, section: "Totals", placeholder: "5" },
  ],
  generateHtml(data, brandName, brandColor, branding) {
    const d = (k: string) => data[k] || "";
    const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    interface LineItem {
      desc: string;
      scheduledValue: number;
      workPrev: number;
      workThis: number;
      stored: number;
    }

    let items: LineItem[] = [];
    try {
      items = JSON.parse(d("lineItems") || "[]");
    } catch {
      items = [];
    }

    const contractAmount = Number(d("contractAmount") || 0);
    const co = Number(d("approvedChangeOrders") || 0);
    const totalContract = contractAmount + co;
    const retainagePct = Number(d("retainagePercent") || 0);

    let totalScheduled = 0;
    let totalPrev = 0;
    let totalThis = 0;
    let totalStored = 0;

    const rows = items.map((it, idx) => {
      const scheduled = Number(it.scheduledValue || 0);
      const prev = Number(it.workPrev || 0);
      const thisPeriod = Number(it.workThis || 0);
      const stored = Number(it.stored || 0);
      const completed = prev + thisPeriod + stored;
      const pct = scheduled > 0 ? (completed / scheduled) * 100 : 0;
      const balance = scheduled - completed;
      const retainage = completed * (retainagePct / 100);

      totalScheduled += scheduled;
      totalPrev += prev;
      totalThis += thisPeriod;
      totalStored += stored;

      return `
        <tr>
          <td style="font-family:monospace;">${idx + 1}</td>
          <td>${it.desc}</td>
          <td style="text-align:right;">$${fmt(scheduled)}</td>
          <td style="text-align:right;">$${fmt(prev)}</td>
          <td style="text-align:right;">$${fmt(thisPeriod)}</td>
          <td style="text-align:right;">$${fmt(stored)}</td>
          <td style="text-align:right;">$${fmt(completed)}</td>
          <td style="text-align:right;">${pct.toFixed(0)}%</td>
          <td style="text-align:right;">$${fmt(balance)}</td>
          <td style="text-align:right;">$${fmt(retainage)}</td>
        </tr>`;
    }).join("");

    const totalCompleted = totalPrev + totalThis + totalStored;
    const totalBalance = totalScheduled - totalCompleted;
    const totalRetainage = totalCompleted * (retainagePct / 100);

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>${basePdfCss(brandColor)}
  body { font-size: 11px; padding: 24px; }
  table { width:100%; border-collapse:collapse; }
  th, td { padding: 4px 6px; border-bottom:1px solid #e5e7eb; font-size: 10px; }
  th { background: #f3f4f6; font-size: 9px; text-transform:uppercase; text-align:right; }
  th:nth-child(2) { text-align: left; }
  .total-row td { font-weight: 700; background: #f9fafb; border-top: 2px solid ${brandColor}; }
  .contract-box { background: #f9fafb; padding:10px; border-radius:4px; font-size: 11px; margin: 12px 0; }
  .contract-box .row { display:flex; justify-content:space-between; padding:2px 0; }
</style></head><body>

<div class="header">
  <div>${brandHtml(brandName, branding)}</div>
  <div>
    <div class="doc-type">AIA G703</div>
    <div style="font-size:11px;color:#6b7280;">Continuation Sheet / Schedule of Values</div>
    <div class="doc-date">App #${d("applicationNumber")} · ${d("applicationDate")}</div>
  </div>
</div>

<div class="row" style="display:flex;gap:24px;margin-bottom:12px;font-size:11px;">
  <div style="flex:1;">
    <div class="field-label">Project</div>
    <strong>${d("projectName")}</strong><br/>
    <span style="color:#6b7280;">${d("projectAddress") || ""}</span>
  </div>
  <div style="flex:1;">
    <div class="field-label">Owner</div>
    <strong>${d("ownerName")}</strong>
  </div>
  <div style="flex:1;">
    <div class="field-label">Contractor</div>
    <strong>${d("contractorName")}</strong><br/>
    <span style="color:#6b7280;">Period: ${d("periodTo")}</span>
  </div>
</div>

<div class="contract-box">
  <div class="row"><span>Original Contract Sum</span><span>$${fmt(contractAmount)}</span></div>
  <div class="row"><span>Approved Change Orders to Date</span><span>$${fmt(co)}</span></div>
  <div class="row" style="border-top:1px solid #e5e7eb;padding-top:4px;margin-top:4px;"><strong>Contract Sum to Date</strong><strong>$${fmt(totalContract)}</strong></div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:30px;">A Item</th>
      <th>B Description</th>
      <th>C Scheduled</th>
      <th>D Work Previous</th>
      <th>E Work This Period</th>
      <th>F Stored Materials</th>
      <th>G Total Completed &amp; Stored</th>
      <th>H %</th>
      <th>I Balance</th>
      <th>J Retainage</th>
    </tr>
  </thead>
  <tbody>
    ${rows || `<tr><td colspan="10" style="text-align:center;color:#9ca3af;padding:20px;">No line items. Add them as JSON in the Line Items field.</td></tr>`}
    <tr class="total-row">
      <td colspan="2">GRAND TOTAL</td>
      <td style="text-align:right;">$${fmt(totalScheduled)}</td>
      <td style="text-align:right;">$${fmt(totalPrev)}</td>
      <td style="text-align:right;">$${fmt(totalThis)}</td>
      <td style="text-align:right;">$${fmt(totalStored)}</td>
      <td style="text-align:right;">$${fmt(totalCompleted)}</td>
      <td style="text-align:right;">${totalScheduled > 0 ? ((totalCompleted / totalScheduled) * 100).toFixed(1) : "0"}%</td>
      <td style="text-align:right;">$${fmt(totalBalance)}</td>
      <td style="text-align:right;">$${fmt(totalRetainage)}</td>
    </tr>
  </tbody>
</table>

<div style="margin-top:24px;font-size:10px;color:#6b7280;">
  <p>Column definitions per AIA G703:</p>
  <p style="margin-left:12px;">A: Line item number · B: Work description · C: Scheduled value · D: Work completed from previous applications · E: Work completed this period · F: Materials presently stored · G: Total completed and stored to date (D+E+F) · H: Percent complete (G/C) · I: Balance to finish (C-G) · J: Retainage (G × retainage %)</p>
</div>

<div class="footer">
  ${footerBrandHtml(brandName, branding)}
  <span>AIA G703 · App #${d("applicationNumber")}</span>
</div>

</body></html>`;
  },
};
