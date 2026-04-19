import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/seo-guides/data";
import { Footer } from "@/components/layout/footer";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import { TenantLogo } from "@/components/ui/tenant-logo";

export const metadata: Metadata = {
  title: "MN/WI Trade Contractor Compliance Guides | RegsGuard",
  description:
    "Free guides to Minnesota and Wisconsin trade licensing, continuing education, bonds, insurance, and compliance documents for plumbers, electricians, and HVAC contractors.",
  alternates: { canonical: "https://regsguard.rebooked.org/guides" },
};

const CATEGORY_LABELS: Record<string, string> = {
  license: "License Renewal",
  ce: "Continuing Education",
  bond: "Bonds & Surety",
  insurance: "Insurance",
  epa: "EPA / Federal Cert",
  city: "City License",
  document: "Document Templates",
  permit: "Permits & Filings",
};

export default async function GuidesIndexPage() {
  const tenant = await getTenantFromHeaders();

  // Group guides by category
  const byCategory = GUIDES.reduce<Record<string, typeof GUIDES>>((acc, g) => {
    (acc[g.category] ??= []).push(g);
    return acc;
  }, {});

  const categoryOrder: (keyof typeof CATEGORY_LABELS)[] = [
    "license",
    "ce",
    "bond",
    "insurance",
    "epa",
    "city",
    "document",
    "permit",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <TenantLogo tenant={tenant} size="md" />
            <span className="text-xl font-bold">{tenant.name}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/audit" className="hover:text-primary">Free Audit</Link>
            <Link href="/sign-up" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">MN/WI Compliance Guides</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plain-English answers to the license, insurance, CE, and document
            questions actual contractors Google at 9 PM on a Tuesday. Free to read,
            no signup required.
          </p>
        </div>

        <div className="space-y-10">
          {categoryOrder.map((cat) => {
            const guides = byCategory[cat] ?? [];
            if (guides.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-2xl font-bold mb-4">{CATEGORY_LABELS[cat]}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="rounded-lg border border-border p-4 hover:border-primary transition-colors"
                    >
                      <div className="text-sm font-semibold mb-1">{g.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{g.description}</div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-16 rounded-xl border-2 border-primary bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Stop Googling every deadline</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
            RegsGuard tracks your MN/WI license renewals, CE hours, bonds, insurance, and city
            registrations automatically. Auto-files with the right authority 7 days before each
            deadline. 14-day free trial. First 100 shops lock in $19/mo for life.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
