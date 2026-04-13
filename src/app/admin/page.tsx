import { prisma } from "@/lib/prisma";
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

  const stats = [
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Regulations", value: regCount, href: "/admin/regulations" },
    { label: "Documents", value: docCount, href: "/admin/users" },
    { label: "Tenants", value: tenantCount, href: "/admin/tenants" },
    { label: "Partners", value: partnerCount, href: "/admin/programs" },
    { label: "Active Deadlines", value: deadlineCount, href: "/admin/users" },
    { label: "Compliance Logs", value: logCount, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
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
