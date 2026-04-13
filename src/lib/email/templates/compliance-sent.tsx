interface ComplianceSentData {
  userName: string;
  regulationTitle: string;
  authority: string;
  sentTo: string;
  sentAt: string;
  pdfFilename: string;
  nextDeadlineDate: string | null;
  dashboardUrl: string;
}

export function generateComplianceSentHtml(data: ComplianceSentData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compliance Submission Confirmation</title>
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
                    <span style="font-size: 13px; color: #bfdbfe;">Submission Confirmation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="margin-top: 24px; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 36px; margin-bottom: 8px;">&#10003;</div>
                <div style="font-size: 18px; font-weight: 700; color: #166534;">Compliance Submitted Successfully</div>
                <div style="font-size: 13px; color: #15803d; margin-top: 4px;">Your documentation has been sent</div>
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
                Your compliance documentation for <strong>${data.regulationTitle}</strong> has been
                generated and submitted. Here is a summary of what was sent:
              </p>

              <!-- Submission Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Regulation</span><br />
                          <span style="font-size: 14px; color: #1e40af; font-weight: 600;">${data.regulationTitle}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Authority</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${data.authority}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Sent To</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${data.sentTo}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Sent At</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${data.sentAt}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">
                          <span style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.3px;">Attachment</span><br />
                          <span style="font-size: 14px; color: #1a1a2e;">${data.pdfFilename} (PDF)</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.nextDeadlineDate ? `
              <!-- Next Deadline -->
              <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="font-size: 13px; color: #1e40af; font-weight: 600;">Next Deadline</span>
                    </td>
                    <td align="right">
                      <span style="font-size: 16px; color: #1e3a8a; font-weight: 700;">${data.nextDeadlineDate}</span>
                    </td>
                  </tr>
                </table>
              </div>` : ""}

              <!-- CTA -->
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
                This confirmation was sent by
                <a href="${data.dashboardUrl}" style="color: #1e40af;">RegsGuard</a>.
                Keep this email for your records.
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
