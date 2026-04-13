import Link from "next/link";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import { TenantLogo } from "@/components/ui/tenant-logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromHeaders();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <TenantLogo tenant={tenant} size="lg" />
        <span className="text-2xl font-bold">{tenant.name}</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
