import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import { TenantLogo } from "@/components/ui/tenant-logo";

export const metadata: Metadata = {
  title: "RegsGuard - MN/WI Trade Compliance Autopilot",
  description:
    "Compliance tracking autopilot for plumbers, electricians, and HVAC professionals in Minnesota and Wisconsin. Auto-filled forms, deadline alerts, document generation. 14-day free trial.",
  openGraph: {
    title: "RegsGuard - Compliance Autopilot for the Trades",
    description:
      "Stop chasing license renewals. RegsGuard tracks deadlines, sends reminders, and auto-generates compliance PDFs. Built for MN/WI plumbers, electricians, and HVAC pros.",
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
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#coverage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coverage</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Partners</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-20 text-center lg:py-28">
          <div className="mb-4 space-y-2 inline-flex flex-col items-center">
            <div className="inline-flex items-center rounded-full border border-amber-200/50 bg-amber-50/50 px-4 py-1.5 text-sm text-amber-900">
              📍 Minnesota & Wisconsin only
            </div>
            <div className="inline-flex items-center rounded-full border border-green-200/50 bg-green-50/50 px-4 py-1.5 text-sm text-green-900">
              🔥 First 100 contractors: $19/mo for LIFE
            </div>
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Stop Chasing License Renewals
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Your compliance autopilot. Never miss a deadline. Auto-filled forms. One-click submissions. Email reminders that actually work.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">Start 14-Day Free Trial</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8">See How It Works</Button>
            </Link>
            <Link href="/audit">
              <Button variant="secondary" size="lg" className="text-base px-8">Free Audit</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required. Cancel anytime.</p>
        </section>

        {/* How It Works (3-Step) */}
        <section id="how-it-works" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three steps to compliance peace of mind.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-lg mb-4">1</div>
              <h3 className="mb-3 text-lg font-semibold">Enter Your Info Once</h3>
              <p className="text-sm text-muted-foreground">Your business details auto-fill every form, PDF, and submission. Set it and forget it.</p>
            </div>
            <div className="rounded-xl border border-border p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-lg mb-4">2</div>
              <h3 className="mb-3 text-lg font-semibold">Get Smart Reminders</h3>
              <p className="text-sm text-muted-foreground">Alerts at 60, 30, 14, 7, and 1 day before deadlines. Color-coded calendar view.</p>
            </div>
            <div className="rounded-xl border border-border p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-lg mb-4">3</div>
              <h3 className="mb-3 text-lg font-semibold">One-Click Submit</h3>
              <p className="text-sm text-muted-foreground">Auto-fill PDFs and email them to the right government office in seconds.</p>
            </div>
          </div>
        </section>

        {/* Coverage (Trade & State) */}
        <section id="coverage" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What We Track</h2>
            <p className="text-muted-foreground">Current 2026 regulations for MN/WI trade professionals.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { trade: "Plumbing", items: ["Journeyman/Master licenses", "Backflow certifier", "Medical gas brazer", "Uniform plumbing code compliance"] },
              { trade: "Electrical", items: ["Journeyman/Master licenses", "Power limited technician", "Elevator constructor", "Low voltage technician"] },
              { trade: "HVAC", items: ["HVAC contractor license", "EPA 608 refrigerant handling", "Boiler operator", "Fire protection technician"] },
              { trade: "General", items: ["General contractor license", "Building official cert", "Project manager license", "Safety manager certification"] },
            ].map((t) => (
              <div key={t.trade} className="rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-3 text-base">{t.trade}</h3>
                <ul className="space-y-2">
                  {t.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl bg-blue-50 border border-blue-200 p-8 text-center">
            <p className="text-sm text-blue-900 mb-2">Verification Features Available</p>
            <p className="text-muted-foreground text-sm mb-4">License, insurance, and bond checks run in simulated mode unless configured. All results clearly labeled.</p>
            <div className="flex gap-4 justify-center text-sm">
              <span className="px-3 py-1 rounded-full bg-white border border-blue-200">License checks</span>
              <span className="px-3 py-1 rounded-full bg-white border border-blue-200">Insurance verification</span>
              <span className="px-3 py-1 rounded-full bg-white border border-blue-200">Bond checks</span>
            </div>
          </div>
        </section>

        {/* Proof (Templates + Results) */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What You Get</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-8">
              <h3 className="font-semibold mb-4">17 Document Templates</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["W-9 / 1099 forms", "Lien waivers", "Certificate of Insurance", "Invoices", "Change orders", "Contract templates", "Proposals", "Safety compliance docs"].map((doc) => (
                  <li key={doc} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border p-8">
              <h3 className="font-semibold mb-4">Smart Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Auto-fill all fields from your profile", "90-day deadline calendar", "Color-coded priority (red/yellow/green)", "E-signature capture", "CSV/PDF export", "Offline access (PWA)", "Team member roles", "Compliance score"].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
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
                <li>✓ All features</li>
                <li>✓ Unlimited documents</li>
                <li>✓ Email alerts</li>
                <li>✓ Team access</li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>
            <div className="rounded-xl border-2 border-primary p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Save $58/year
              </div>
              <h3 className="text-lg font-semibold">Annual</h3>
              <div className="my-4">
                <span className="text-4xl font-bold">$290</span>
                <span className="text-muted-foreground">/yr</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-muted-foreground text-left">
                <li>✓ Everything monthly</li>
                <li>✓ 2 months free</li>
                <li>✓ Priority support</li>
                <li>✓ API access</li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Stop Missing Deadlines?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Hundreds of MN/WI contractors trust RegsGuard to keep their licenses current.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">Start Your Free Trial</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TenantLogo tenant={tenant} size="sm" />
                <span className="font-bold">{tenant.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compliance autopilot for plumbers, electricians, and HVAC pros in Minnesota and Wisconsin.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <div className="space-y-2">
                <Link href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground">How It Works</Link>
                <Link href="#coverage" className="block text-sm text-muted-foreground hover:text-foreground">Coverage</Link>
                <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2">
                <Link href="/partners" className="block text-sm text-muted-foreground hover:text-foreground">Partner Program</Link>
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
            <p>&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved. | Minnesota & Wisconsin only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
