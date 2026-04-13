import { NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

/**
 * GET /api/export/compliance-summary
 *
 * Generates an HTML compliance summary report suitable for PDF generation
 * (e.g., via Puppeteer or browser print-to-PDF).
 */
export async function GET() {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.EXPORT_DATA);
  if (denied) return denied;

  const userId = user.id;

  // Fetch all required data in parallel
  const [userProfile, profile, deadlines, recentLogs, ceCredits] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.businessProfile.findUnique({
      where: { userId },
    }),
    prisma.userDeadline.findMany({
      where: { userId },
      include: {
        regulation: {
          select: {
            title: true,
            authority: true,
            trade: true,
            state: true,
            renewalCycle: true,
            category: true,
          },
        },
      },
      orderBy: { nextDueDate: "asc" },
    }),
    prisma.complianceLog.findMany({
      where: { userId },
      include: {
        regulation: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.cECredit.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  // Compute compliance score
  const totalDeadlines = deadlines.length;
  const completedDeadlines = deadlines.filter((d) => d.status === "COMPLETED").length;
  const overdueDeadlines = deadlines.filter((d) => {
    if (d.status === "COMPLETED" || d.status === "SKIPPED") return false;
    return d.nextDueDate < new Date();
  }).length;
  const upcomingDeadlines = deadlines.filter((d) => {
    if (d.status === "COMPLETED" || d.status === "SKIPPED") return false;
    return d.nextDueDate >= new Date();
  });

  const complianceScore =
    totalDeadlines > 0
      ? Math.round(((totalDeadlines - overdueDeadlines) / totalDeadlines) * 100)
      : 100;

  const totalCEHours = ceCredits.reduce((sum, c) => sum + c.hours, 0);
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build the HTML report
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Summary Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      padding: 40px;
      line-height: 1.5;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24px;
      color: #1e40af;
    }
    .header .meta {
      text-align: right;
      font-size: 13px;
      color: #64748b;
    }
    h2 {
      font-size: 18px;
      color: #1e40af;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .score-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .score-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #1e40af;
    }
    .score-card .label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .score-card.danger .value { color: #ef4444; }
    .score-card.success .value { color: #22c55e; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .info-row .label { color: #64748b; }
    .info-row .value { font-weight: 500; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 13px;
    }
    th {
      background: #f8fafc;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
      color: #475569;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-gray { background: #f1f5f9; color: #475569; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
      table { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Compliance Summary Report</h1>
      <p style="color: #64748b; margin-top: 4px;">
        ${escapeHtml(profile?.businessName || userProfile?.name || "Unknown Business")}
      </p>
    </div>
    <div class="meta">
      <p><strong>Report Date:</strong> ${reportDate}</p>
      <p>${escapeHtml(userProfile?.email || "")}</p>
    </div>
  </div>

  ${profile ? `
  <h2>Business Information</h2>
  <div class="info-grid">
    <div class="info-row">
      <span class="label">Business Name</span>
      <span class="value">${escapeHtml(profile.businessName)}</span>
    </div>
    <div class="info-row">
      <span class="label">Contact</span>
      <span class="value">${escapeHtml(profile.responsiblePerson)}</span>
    </div>
    <div class="info-row">
      <span class="label">Address</span>
      <span class="value">${escapeHtml(profile.address)}, ${escapeHtml(profile.city)}, ${escapeHtml(profile.state)} ${escapeHtml(profile.zip)}</span>
    </div>
    <div class="info-row">
      <span class="label">Phone</span>
      <span class="value">${escapeHtml(profile.phone)}</span>
    </div>
    ${profile.insuranceProvider ? `
    <div class="info-row">
      <span class="label">Insurance</span>
      <span class="value">${escapeHtml(profile.insuranceProvider)} (${escapeHtml(profile.insurancePolicyNumber || "N/A")})</span>
    </div>` : ""}
    ${profile.bondProvider ? `
    <div class="info-row">
      <span class="label">Bond</span>
      <span class="value">${escapeHtml(profile.bondProvider)} - $${escapeHtml(profile.bondAmount || "N/A")}</span>
    </div>` : ""}
  </div>
  ` : ""}

  <h2>Compliance Overview</h2>
  <div class="score-grid">
    <div class="score-card ${complianceScore >= 90 ? "success" : complianceScore >= 70 ? "" : "danger"}">
      <div class="value">${complianceScore}%</div>
      <div class="label">Compliance Score</div>
    </div>
    <div class="score-card">
      <div class="value">${totalDeadlines}</div>
      <div class="label">Total Deadlines</div>
    </div>
    <div class="score-card danger">
      <div class="value">${overdueDeadlines}</div>
      <div class="label">Overdue</div>
    </div>
    <div class="score-card success">
      <div class="value">${completedDeadlines}</div>
      <div class="label">Completed</div>
    </div>
  </div>

  ${upcomingDeadlines.length > 0 ? `
  <h2>Upcoming Deadlines</h2>
  <table>
    <thead>
      <tr>
        <th>Regulation</th>
        <th>Authority</th>
        <th>Due Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${upcomingDeadlines.map((d) => {
        const daysLeft = Math.ceil((d.nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const badgeClass = daysLeft <= 7 ? "badge-red" : daysLeft <= 30 ? "badge-yellow" : "badge-green";
        const statusLabel = daysLeft <= 0 ? "Overdue" : daysLeft <= 7 ? "Due Soon" : "Upcoming";
        return `
      <tr>
        <td>${escapeHtml(d.regulation.title)}</td>
        <td>${escapeHtml(d.regulation.authority)}</td>
        <td>${d.nextDueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
      </tr>`;
      }).join("")}
    </tbody>
  </table>
  ` : ""}

  ${ceCredits.length > 0 ? `
  <h2>Continuing Education Credits</h2>
  <p style="font-size: 14px; color: #64748b; margin-bottom: 12px;">
    Total CE Hours: <strong>${totalCEHours}</strong>
  </p>
  <table>
    <thead>
      <tr>
        <th>Course</th>
        <th>Provider</th>
        <th>Hours</th>
        <th>Completed</th>
      </tr>
    </thead>
    <tbody>
      ${ceCredits.slice(0, 15).map((c) => `
      <tr>
        <td>${escapeHtml(c.courseName)}</td>
        <td>${escapeHtml(c.provider || "N/A")}</td>
        <td>${c.hours}</td>
        <td>${c.completedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  ` : ""}

  ${recentLogs.length > 0 ? `
  <h2>Recent Compliance Activity</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Action</th>
        <th>Regulation</th>
      </tr>
    </thead>
    <tbody>
      ${recentLogs.map((log) => `
      <tr>
        <td>${log.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
        <td>${formatAction(log.action)}</td>
        <td>${log.regulation?.title ? escapeHtml(log.regulation.title) : "-"}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  ` : ""}

  <div class="footer">
    <p>Generated by RegsGuard on ${reportDate}</p>
    <p>This report is for informational purposes only. Verify all compliance requirements with the relevant authorities.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

// ── Helpers ──

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
