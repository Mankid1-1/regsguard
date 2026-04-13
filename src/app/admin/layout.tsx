import { getDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN" && user.role !== "OWNER") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold">Admin Panel</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/regulations" className="text-muted-foreground hover:text-foreground">
                Regulations
              </Link>
              <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
                Users
              </Link>
              <Link href="/admin/tenants" className="text-muted-foreground hover:text-foreground">
                Tenants
              </Link>
              <Link href="/admin/programs" className="text-muted-foreground hover:text-foreground">
                Partners
              </Link>
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Back to App
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
