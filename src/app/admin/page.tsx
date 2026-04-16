import { prisma } from "@/lib/prisma";
import { isProviderConfigured } from "@/lib/verification-response";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [userCount, regCount, deadlineCount, logCount, tenantCount, partnerCount, docCount] = await Promise.all([
    prisma.user.count(),
    prisma.regulation.count(),
    prisma.userDeadline.count({ where: { status: { notIn: ["COMPLETED", "SKIPPED"] } } }),
    prisma.complianceLog.count(),
    prisma.tenant.count(),
    prisma.partnerProgram.count(),
    prisma.document.count(),
  ]);

  // Check operational readiness
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER));
  const smsConfigured = await isProviderConfigured("sms");
  const verificationConfigured = await isProviderConfigured("license");
  const appUrlConfigured = Boolean(process.env.NEXT_PUBLIC_APP_URL);

  const stats = [
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Regulations", value: regCount, href: "/admin/regulations" },
    { label: "Documents", value: docCount, href: "/admin/users" },
    { label: "Tenants", value: tenantCount, href: "/admin/tenants" },
    { label: "Partners", value: partnerCount, href: "/admin/programs" },
    { label: "Active Deadlines", value: deadlineCount, href: "/admin/users" },
    { label: "Compliance Logs", value: logCount, href: "/admin/users" },
  ];

  const readiness = [
    { label: "Stripe", configured: stripeConfigured, critical: true },
    { label: "Email (Resend/SMTP)", configured: emailConfigured, critical: true },
    { label: "SMS (Twilio)", configured: smsConfigured, critical: false },
    { label: "License Verification", configured: verificationConfigured, critical: false },
    { label: "App URL", configured: appUrlConfigured, critical: true },
  ];

  const critical = readiness.filter((r) => r.critical && !r.configured);
  const warnings = readiness.filter((r) => !r.critical && !r.configured);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      {/* Readiness Status */}
      <div className="mb-8 rounded-xl border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">Launch Readiness</h2>
        <div className="space-y-3">
          {critical.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-2">⚠️ Critical: {critical.length} item(s)</p>
              <ul className="text-sm text-red-700 space-y-1">
                {critical.map((item) => (
                  <li key={item.label}>• {item.label} not configured</li>
                ))}
              </ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-2">⚡ Optional: {warnings.length} provider(s)</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((item) => (
                  <li key={item.label}>• {item.label} not configured (simulated mode)</li>
                ))}
              </ul>
            </div>
          )}
          {critical.length === 0 && (
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-sm font-medium text-green-800">✓ All critical services configured</p>
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          {readiness.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={`font-medium ${item.configured ? "text-green-600" : "text-amber-600"}`}>
                {item.configured ? "✓ Configured" : "○ Not configured"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-border bg-background p-6 transition-colors hover:bg-accent"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
