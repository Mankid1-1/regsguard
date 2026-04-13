interface DeadlineAlertData {
  userName: string;
  regulationTitle: string;
  daysUntilDue: number;
  dueDate: string;
  authority: string;
  category: string;
  fee: string | null;
  portalUrl: string | null;
  dashboardUrl: string;
}

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function getUrgencyColor(days: number): { bg: string; text: string; border: string } {
  if (days <= 1) return { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" };
  if (days <= 7) return { bg: "#fff7ed", text: "#9a3412", border: "#fdba74" };
  if (days <= 14) return { bg: "#fffbeb", text: "#92400e", border: "#fcd34d" };
  return { bg: "#eff6ff", text: "#1e40af", border: "#93c5fd" };
}

function getUrgencyLabel(days: number): string {
  if (days <= 0) return "OVERDUE";
  if (days === 1) return "DUE TOMORROW";
  if (days <= 7) return "DUE THIS WEEK";
  if (days <= 14) return "DUE IN 2 WEEKS";
  if (days <= 30) return "DUE IN 30 DAYS";
  return "UPCOMING DEADLINE";
}

export function generateDeadlineAlertHtml(data: DeadlineAlertData): string {
  const urgency = getUrgencyColor(data.daysUntilDue);
  const urgencyLabel = getUrgencyLabel(data.daysUntilDue);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Deadline Alert - ${data.regulationTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e40af; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">RegsGuard</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 13px; color: #bfdbfe;">Compliance Alert</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Urgency Banner -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="margin-top: 24px; background-color: ${urgency.bg}; border: 1px solid ${urgency.border}; border-radius: 8px; padding: 16px 20px; text-align: center;">
                <span style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: ${urgency.text};">${urgencyLabel}</span>
                <div style="font-size: 28px; font-weight: 700; color: ${urgency.text}; margin-top: 4px;">
                  ${data.daysUntilDue <= 0 ? "Past Due" : data.daysUntilDue === 1 ? "1 Day Left" : `${data.daysUntilDue} Days Left`}
                </div>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">
                Hi ${data.userName},
              </p>
              <p style="font-size: 15px; color: #374151; margin: 0 0 24px; line-height: 1.6;">
                Your compliance deadline for <strong>${data.regulationTitle}</strong> is
                ${data.daysUntilDue <= 0 ? "past due" : `coming up on <strong>${data.dueDate}</strong>`}.
                Please take action to stay compliant.
              </p>

              <!-- Regulation Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Regulation</span><br />
                          <span style="font-size: 14px; color: #1e40af; font-weight: 600;">${data.regulationTitle}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Authority</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${data.authority}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Category</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${formatCategory(data.category)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Due Date</span><br />
                          <span style="font-size: 14px; color: #1a1a2e; font-weight: 600;">${data.dueDate}</span>
                        </td>
                      </tr>
                      ${data.fee ? `
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Fee</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${data.fee}</span>
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Items -->
              <div style="margin-bottom: 24px;">
                <p style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px;">What you need to do:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #374151;">
                      1. Log in to your RegsGuard dashboard to review the full details
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #374151;">
                      2. Generate the compliance PDF with your business information
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #374151;">
                      3. Submit your compliance documentation to ${data.authority}
                    </td>
                  </tr>
                  ${data.fee ? `
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #374151;">
                      4. Pay the required fee of ${data.fee}
                    </td>
                  </tr>` : ""}
                  ${data.portalUrl ? `
                  <tr>
                    <td style="padding: 4px 0; font-size: 14px; color: #374151;">
                      ${data.fee ? "5" : "4"}. Visit the official portal: <a href="${data.portalUrl}" style="color: #1e40af;">${data.portalUrl}</a>
                    </td>
                  </tr>` : ""}
                </table>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 16px;">
                    <a href="${data.dashboardUrl}" style="display: inline-block; background-color: #1e40af; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                You are receiving this email because you have deadline alerts enabled on
                <a href="${data.dashboardUrl}" style="color: #1e40af;">RegsGuard</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
