import type { TenantConfig } from "@/lib/tenant";

/**
 * Shared email base layout with header, footer, and tenant branding.
 */
function baseLayout(
  content: string,
  tenant?: TenantConfig
): string {
  const brandName = tenant?.name ?? "RegsGuard";
  const brandColor = tenant?.primaryColor ?? "#1e40af";
  const supportEmail = tenant?.supportEmail ?? "support@regsguard.com";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: ${brandColor}; padding: 24px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; }
    .body { padding: 32px; line-height: 1.6; }
    .body h2 { color: ${brandColor}; font-size: 18px; margin-top: 0; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; background: ${brandColor}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .footer { padding: 24px 32px; background: #f4f4f5; color: #71717a; font-size: 12px; text-align: center; }
    .footer a { color: ${brandColor}; text-decoration: none; }
    .divider { height: 1px; background: #e4e4e7; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName}</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${year} ${brandName}. All rights reserved.</p>
      <p>Need help? <a href="mailto:${supportEmail}">${supportEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Template Registry ───

export interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined;
}

type TemplateRenderer = (data: EmailTemplateData) => string;

const templates: Record<string, TemplateRenderer> = {
  "deadline-alert": (data) => `
    <h2>Deadline Alert</h2>
    <p>Your <strong>${data.regulationTitle}</strong> deadline is approaching.</p>
    <p><strong>Due Date:</strong> ${data.dueDate}</p>
    <p><strong>Days Remaining:</strong> ${data.daysLeft}</p>
    <div class="divider"></div>
    <p>Take action now to stay compliant and avoid penalties.</p>
    ${data.portalUrl ? `<p><a href="${data.portalUrl}" class="btn">Go to Portal</a></p>` : ""}
  `,

  "auto-filed": (data) => `
    <h2>Auto-Filed Confirmation</h2>
    <p>Your <strong>${data.regulationTitle}</strong> renewal has been automatically filed.</p>
    <p><strong>Filed On:</strong> ${data.filedDate}</p>
    <p><strong>Next Due Date:</strong> ${data.nextDueDate}</p>
    <div class="divider"></div>
    <p>No further action is required. Your compliance record has been updated.</p>
  `,

  "follow-up": (data) => `
    <h2>${data.subject || "Follow-Up"}</h2>
    <p>${data.message}</p>
    ${data.projectName ? `<p><strong>Project:</strong> ${data.projectName}</p>` : ""}
  `,

  "compliance-sent": (data) => `
    <h2>Compliance Report Shared</h2>
    <p>A compliance report has been shared with you by <strong>${data.senderName}</strong>.</p>
    <p><a href="${data.reportUrl}" class="btn">View Compliance Report</a></p>
    <div class="divider"></div>
    <p>This link ${data.expiresAt ? `expires on ${data.expiresAt}` : "does not expire"}.</p>
  `,

  "document-signed": (data) => `
    <h2>Document Signed</h2>
    <p>Your document <strong>${data.documentTitle}</strong> has been signed by <strong>${data.signerName}</strong>.</p>
    <p><strong>Signed At:</strong> ${data.signedAt}</p>
    <div class="divider"></div>
    <p>You can view the signed document in your dashboard.</p>
  `,

  "welcome": (data) => `
    <h2>Welcome to ${data.brandName || "RegsGuard"}!</h2>
    <p>Hi ${data.name},</p>
    <p>Your account has been set up successfully. Here's what you can do next:</p>
    <ul>
      <li>Complete your business profile</li>
      <li>Add your trade licenses and regulations</li>
      <li>Set up deadline notifications</li>
    </ul>
    <p><a href="${data.dashboardUrl}" class="btn">Go to Dashboard</a></p>
  `,
};

/**
 * Render an email using a named template with tenant branding.
 *
 * @param templateName  Template key (e.g., "deadline-alert", "follow-up")
 * @param data          Template variables
 * @param tenant        Optional tenant config for branding
 * @returns             Complete HTML email string
 */
export function renderEmail(
  templateName: string,
  data: EmailTemplateData,
  tenant?: TenantConfig
): string {
  const renderer = templates[templateName];
  if (!renderer) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  const content = renderer(data);
  return baseLayout(content, tenant);
}
