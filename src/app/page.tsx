import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import { TenantLogo } from "@/components/ui/tenant-logo";

export const metadata: Metadata = {
  title: "RegsGuard | MN/WI Trade Compliance Autopilot",
  description:
    "Compliance tracking autopilot for plumbers, electricians, and HVAC professionals in Minnesota and Wisconsin. Auto-filled forms, deadline alerts, one-click filing. 14-day free trial.",
  openGraph: {
    title: "RegsGuard | Compliance Autopilot for the Trades",
    description:
      "Stop chasing license renewals. RegsGuard tracks deadlines, sends reminders, and auto-generates compliance PDFs. Built for MN/WI plumbers, electricians, and HVAC pros.",
    type: "website",
    url: "https://regsguard.rebooked.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "RegsGuard | Compliance Autopilot for the Trades",
    description: "Stop chasing license renewals. 14-day free trial.",
  },
  alternates: {
    canonical: "https://regsguard.rebooked.org",
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
            <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-20 text-center lg:py-28">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-1.5 text-sm text-amber-900">
              📍 Minnesota &amp; Wisconsin
            </span>
            <span className="inline-flex items-center rounded-full border border-green-200/70 bg-green-50 px-4 py-1.5 text-sm text-green-900">
              🔥 First 100 contractors: $19/mo for life
            </span>
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Stop Chasing License Renewals
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Your compliance autopilot. Track license deadlines, generate auto-filled PDFs, and file directly to MN DLI, WI DSPS, and EPA &mdash; in a single click.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-8">Start 14-Day Free Trial</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8">See How It Works</Button>
            </Link>
            <Link href="/audit">
              <Button variant="secondary" size="lg" className="text-base px-8">Free Compliance Audit</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Card required to start trial &middot; No charge for 14 days &middot; Cancel anytime
          </p>
        </section>

        {/* How It Works */}
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
              <p className="text-sm text-muted-foreground">Email alerts at 60, 30, 14, 7, and 1 day before every deadline. Color-coded calendar view.</p>
            </div>
            <div className="rounded-xl border border-border p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-lg mb-4">3</div>
              <h3 className="mb-3 text-lg font-semibold">One-Click Filing</h3>
              <p className="text-sm text-muted-foreground">We generate and email your compliance PDF to the right authority, with proof of delivery and a timestamped audit trail.</p>
            </div>
          </div>
        </section>

        {/* Coverage */}
        <section id="coverage" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What We Track</h2>
            <p className="text-muted-foreground">Current 2026 regulations for MN/WI trade professionals.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { trade: "Plumbing", items: ["Journeyman/Master licenses", "Contractor bonds", "Continuing education hours", "Backflow certifier"] },
              { trade: "Electrical", items: ["Journeyman/Master licenses", "NEC code-update CE", "Registered electrician renewal", "Power-limited technician"] },
              { trade: "HVAC / Mechanical", items: ["HVAC contractor license", "EPA 608 refrigerant handling", "A2L refrigerant supplemental training", "Qualifier credential (WI)"] },
              { trade: "Federal", items: ["EPA Section 608 certification", "EPA Lead-Safe RRP firm cert", "OSHA 300 / 300A logs", "I-9 employment eligibility"] },
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
          <div className="mt-10 rounded-xl bg-blue-50 border border-blue-200 p-6 text-center">
            <p className="text-sm text-blue-900 font-medium mb-1">Authorities we file with</p>
            <p className="text-sm text-blue-900/80">
              Minnesota Department of Labor &amp; Industry &middot; MN Board of Electricity &middot; MN Department of Health (Lead-Safe) &middot; Wisconsin DSPS &middot; U.S. EPA
            </p>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What You Get</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-8">
              <h3 className="font-semibold mb-4">25+ Document Templates</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "W-9 and 1099-NEC forms",
                  "Lien waivers (conditional + unconditional)",
                  "Certificate of insurance",
                  "AIA G702 / G704 pay applications",
                  "Permit applications",
                  "Notice to owner (statutory pre-lien)",
                  "OSHA 300 / 300A logs",
                  "I-9 employment eligibility",
                  "Job hazard analysis",
                  "Invoices, change orders, proposals",
                ].map((doc) => (
                  <li key={doc} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                {[
                  "Auto-fill every field from your business profile",
                  "90-day deadline calendar with color-coded priority",
                  "Auto-filing 7 days before each deadline",
                  "Live countdown timers on every deadline card",
                  "Command palette (⌘K) for instant navigation",
                  "Compliance score with weighted breakdown",
                  "Timestamped audit trail for every filing",
                  "E-signature capture + CSV/PDF export",
                  "Offline access (installable PWA)",
                  "Team roles: admin, field worker, office manager, bookkeeper",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-primary shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
          <p className="mb-10 text-muted-foreground">
            14-day free trial. Card required to start. No charge for 14 days. Cancel anytime.
          </p>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Solo */}
            <div className="rounded-xl border border-border p-8 text-left flex flex-col">
              <h3 className="text-lg font-semibold">Solo</h3>
              <p className="text-xs text-muted-foreground">First 100 contractors only</p>
              <div className="my-4">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>✓ 10 tracked deadlines</li>
                <li>✓ 1 user</li>
                <li>✓ All document templates</li>
                <li>✓ Email alerts + auto-filing</li>
                <li>✓ Public compliance badge</li>
                <li className="text-muted-foreground/60">&ndash; No team seats</li>
              </ul>
              <Link href="/sign-up?plan=solo" className="block">
                <Button variant="outline" className="w-full">Start Free Trial</Button>
              </Link>
            </div>

            {/* Monthly -- most popular */}
            <div className="rounded-xl border-2 border-primary p-8 text-left flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold">Pro Monthly</h3>
              <p className="text-xs text-muted-foreground">For growing shops</p>
              <div className="my-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited deadlines</li>
                <li>✓ Up to 5 team seats</li>
                <li>✓ All document templates</li>
                <li>✓ Auto-filing + follow-ups</li>
                <li>✓ Priority email support</li>
                <li>✓ Public compliance badge</li>
              </ul>
              <Link href="/sign-up?plan=monthly" className="block">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>

            {/* Annual */}
            <div className="rounded-xl border border-border p-8 text-left flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-4 py-1 text-xs font-semibold text-white">
                Save $58/yr
              </div>
              <h3 className="text-lg font-semibold">Pro Annual</h3>
              <p className="text-xs text-muted-foreground">Two months free</p>
              <div className="my-4">
                <span className="text-4xl font-bold">$290</span>
                <span className="text-muted-foreground">/yr</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>✓ Everything in Pro Monthly</li>
                <li>✓ 2 months free</li>
                <li>✓ Phone support</li>
                <li>✓ Dedicated onboarding call</li>
                <li>✓ Custom-branded PDFs</li>
                <li>✓ Vendor portal export</li>
              </ul>
              <Link href="/sign-up?plan=annual" className="block">
                <Button variant="outline" className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Questions about pricing? Call (612) 439-7445 or email{" "}
            <a href="mailto:brendan@rebooked.org" className="text-primary hover:underline">brendan@rebooked.org</a>.
          </p>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Stop Missing Deadlines?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join the first cohort of MN/WI contractors running compliance on autopilot.
              14-day free trial. Lock in $19/mo for life if you&rsquo;re in the first 100.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-8">Start Your Free Trial</Button>
              </Link>
              <a href="tel:+16124397445">
                <Button variant="outline" size="lg" className="text-base px-8">Call (612) 439-7445</Button>
              </a>
            </div>
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
                <Link href="/audit" className="block text-sm text-muted-foreground hover:text-foreground">Free Compliance Audit</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2">
                <Link href="/partners" className="block text-sm text-muted-foreground hover:text-foreground">Partner Program</Link>
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <div className="space-y-2">
                <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground">Help &amp; FAQ</Link>
                <a href="mailto:brendan@rebooked.org" className="block text-sm text-muted-foreground hover:text-foreground">
                  brendan@rebooked.org
                </a>
                <a href="tel:+16124397445" className="block text-sm text-muted-foreground hover:text-foreground">
                  (612) 439-7445
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 flex flex-col gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
            <p>&copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
            <p>Minnesota &amp; Wisconsin &middot; Built by Brendan Jacobs, Minneapolis</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
