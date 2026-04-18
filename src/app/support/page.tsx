import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | RegsGuard",
  description:
    "Get help with RegsGuard. Email brendan@rebooked.org or call (612) 439-7445.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="mt-2 text-muted-foreground">
          A real person will get back to you. Usually within a few hours during
          business hours (9 AM &ndash; 6 PM CT, Monday to Friday).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email */}
        <a
          href="mailto:brendan@rebooked.org"
          className="group rounded-xl border-2 border-border bg-background p-6 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Email</div>
              <div className="text-xs text-muted-foreground">Best for non-urgent questions</div>
            </div>
          </div>
          <div className="font-mono text-sm text-primary group-hover:underline">
            brendan@rebooked.org
          </div>
        </a>

        {/* Phone */}
        <a
          href="tel:+16124397445"
          className="group rounded-xl border-2 border-border bg-background p-6 transition-colors hover:border-primary hover:bg-primary/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.5a1 1 0 01.97.757l1 4a1 1 0 01-.29.99L7.7 10.2a12 12 0 006.1 6.1l1.45-1.48a1 1 0 01.99-.29l4 1a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Phone / Text</div>
              <div className="text-xs text-muted-foreground">Fastest for billing &amp; urgent issues</div>
            </div>
          </div>
          <div className="font-mono text-sm text-primary group-hover:underline">
            (612) 439-7445
          </div>
        </a>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Common questions</h2>
        <div className="space-y-4">
          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">
              How do I cancel my trial?
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              Go to <Link href="/billing" className="text-primary hover:underline">Billing</Link>,
              click <strong>Manage Subscription</strong>, and cancel from the
              Stripe portal. Your trial ends immediately with no charge if you
              cancel before the trial period ends.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">
              Is my card charged during the trial?
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              No. We collect your card at signup so your account converts
              automatically when the trial ends, but you are not billed until
              the 14-day trial completes. We&rsquo;ll email you 3 days before
              the trial ends as a reminder.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">
              How does auto-filing work?
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              Seven days before a deadline, RegsGuard generates the required
              compliance PDF using your business profile data and emails it to
              the relevant authority (e.g., MN DLI for plumbing licenses). The
              filing is logged to your audit trail with a timestamp, recipient,
              and message ID for proof.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">
              What if a filing fails or gets rejected?
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              You&rsquo;ll get an in-app and email notification immediately. The
              deadline is re-opened so you can manually retry or contact the
              authority. We also retry on transient failures up to 3 times
              automatically.
            </p>
          </details>

          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">
              Can I add team members?
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">
              Yes, on the Pro plan and above. Invite your office manager,
              bookkeeper, or field workers from the{" "}
              <Link href="/team" className="text-primary hover:underline">Team</Link>{" "}
              page. Office managers can see paperwork but not payroll/PII.
            </p>
          </details>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
        <h3 className="font-semibold mb-2">Still stuck?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Reach out directly &mdash; I read every message personally.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:brendan@rebooked.org?subject=RegsGuard support request"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Email me
          </a>
          <a
            href="tel:+16124397445"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Call (612) 439-7445
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Brendan Jacobs &middot; Founder &middot; Minneapolis, MN
      </p>
    </div>
  );
}
