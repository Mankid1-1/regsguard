import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import { TenantLogo } from "@/components/ui/tenant-logo";

export const metadata: Metadata = {
  title: "RegsGuard - Never Miss a License Renewal Again",
  description:
    "Compliance tracking for plumbers, electricians, and HVAC pros. Auto-filled forms, deadline alerts, document generation, and one-click submissions. Start free.",
  openGraph: {
    title: "RegsGuard - Compliance Made Simple for Trade Pros",
    description:
      "Track every license, permit, and CE deadline. Auto-fill forms. Get reminded before it's too late. Built for the trades.",
    type: "website",
  },
};

export default async function HomePage() {
  const tenant = await getTenantFromHeaders();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <TenantLogo tenant={tenant} size="md" />
            <span className="text-xl font-bold">{tenant.name}</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#trades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trades</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partners</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-20 text-center lg:py-28">
          <div className="mb-4 inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
            Trusted by 500+ trade professionals
          </div>
          <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Never Miss a License Renewal Again
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {tenant.name} tracks every compliance deadline for plumbers, electricians, and HVAC pros.
            Auto-filled forms, one-click submissions, and alerts that actually work.
            Set it up in 5 minutes, then forget about it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">Start Free Trial</Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base px-8">See How It Works</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">14-day free trial. No credit card required.</p>
        </section>

        {/* Stats Bar */}
        <section className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/30 p-8 sm:grid-cols-4 mb-16">
          {[
            { stat: "17", label: "Document Templates" },
            { stat: "50+", label: "Regulations Tracked" },
            { stat: "99.9%", label: "Uptime SLA" },
            { stat: "5 min", label: "Average Setup Time" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold sm:text-3xl">{item.stat}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything You Need to Stay Compliant</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From deadline tracking to document generation, we handle the compliance paperwork so you can focus on the job.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "One-Time Setup",
                desc: "Enter your business info once. It auto-fills every form, PDF, and submission forever.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Smart Deadline Tracking",
                desc: "Color-coded calendar shows everything due in the next 90 days. Red, yellow, green -- at a glance.",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              },
              {
                title: "One-Click PDF & Send",
                desc: "Generate pre-filled compliance PDFs and email them directly to the right government office.",
                icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
              },
              {
                title: "Automatic Alerts",
                desc: "Email reminders at 60, 30, 14, 7, and 1 day before every deadline. Zero false alarms.",
                icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
              },
              {
                title: "17 Document Templates",
                desc: "W-9s, 1099s, lien waivers, COIs, invoices, change orders, permits -- auto-filled and ready to send.",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              },
              {
                title: "E-Signatures",
                desc: "Built-in signature capture. Send documents for signing and track status in real-time.",
                icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
              },
              {
                title: "Compliance Score",
                desc: "Know your compliance health at a glance. A-F grade across deadlines, CE credits, insurance, and filings.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
              {
                title: "Works on Any Device",
                desc: "Install on your phone like a native app. Works offline too. Perfect for the job site.",
                icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
              },
              {
                title: "Team Management",
                desc: "Add field workers, bookkeepers, and managers. Role-based access keeps everyone in their lane.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trade Coverage */}
        <section id="trades" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Built for Your Trade</h2>
            <p className="text-muted-foreground">Pre-loaded with current 2026 regulations across all major trades and jurisdictions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { trade: "Plumbing", items: ["Journeyman/Master licenses", "Backflow certifier", "Medical gas brazer"] },
              { trade: "Electrical", items: ["Journeyman/Master licenses", "Power limited technician", "Elevator constructor"] },
              { trade: "HVAC", items: ["HVAC contractor license", "Refrigerant handling (EPA 608)", "Boiler operator"] },
              { trade: "General", items: ["General contractor license", "Building official cert", "Project management"] },
              { trade: "EPA / Lead-Safe", items: ["EPA Lead Renovator (RRP)", "Lead abatement worker", "Lead inspector/assessor"] },
              { trade: "Safety", items: ["OSHA 10/30", "First aid/CPR", "Confined space entry"] },
            ].map((t) => (
              <div key={t.trade} className="rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-3">{t.trade}</h3>
                <ul className="space-y-1.5">
                  {t.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Trade Pros Say</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "I used to get hit with late fees every other year. Haven't missed a renewal since I started using RegsGuard.",
                name: "Mike D.",
                role: "Master Plumber, Minneapolis",
              },
              {
                quote: "The auto-filled W-9s and lien waivers alone save me 2 hours a week. Everything's pre-populated from my profile.",
                name: "Sarah K.",
                role: "Electrical Contractor, Milwaukee",
              },
              {
                quote: "My bookkeeper loves the expense tracking and CSV exports. Tax season went from a nightmare to a breeze.",
                name: "Tom R.",
                role: "HVAC Business Owner, St. Paul",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 text-center">
          <h2 className="mb-2 text-3xl font-bold">Simple Pricing</h2>
          <p className="mb-10 text-muted-foreground">14-day free trial. No credit card required.</p>
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-8">
              <h3 className="text-lg font-semibold">Monthly</h3>
              <div className="my-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground text-left">
                <li>All features included</li>
                <li>Unlimited documents</li>
                <li>Email + SMS alerts</li>
                <li>Team management</li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
            <div className="rounded-xl border-2 border-primary p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Best Value
              </div>
              <h3 className="text-lg font-semibold">Annual</h3>
              <div className="my-4">
                <span className="text-4xl font-bold">$290</span>
                <span className="text-muted-foreground">/yr</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground text-left">
                <li>Everything in Monthly</li>
                <li>Save $58/year (2 months free)</li>
                <li>Priority support</li>
                <li>API access</li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Stop Worrying About Compliance?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join hundreds of trade professionals who trust {tenant.name} to keep their licenses current and their paperwork in order.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">Start Your Free Trial</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TenantLogo tenant={tenant} size="sm" />
                <span className="font-bold">{tenant.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compliance tracking built for the trades. Never miss a deadline again.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <div className="space-y-2">
                <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground">Features</Link>
                <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
                <Link href="#trades" className="block text-sm text-muted-foreground hover:text-foreground">Trades</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2">
                <Link href="/partners" className="block text-sm text-muted-foreground hover:text-foreground">Partners</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <div className="space-y-2">
                {tenant.supportEmail && (
                  <a href={`mailto:${tenant.supportEmail}`} className="block text-sm text-muted-foreground hover:text-foreground">{tenant.supportEmail}</a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
