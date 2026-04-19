"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ReferralStats {
  code: string;
  totalReferrals: number;
  conversions: number;
  nextMilestone: number;
  freeMonthsEarned: number;
  freeMonthsRemaining: number;
  shareUrl: string;
}

export default function ReferPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedThing, setCopiedThing] = useState<"link" | "email" | "sms" | null>(null);

  useEffect(() => {
    fetch("/api/user/referral")
      .then((r) => r.json())
      .then((data) => {
        if (data.shareUrl) setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function copy(text: string, kind: "link" | "email" | "sms") {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedThing(kind);
      setTimeout(() => setCopiedThing(null), 2000);
    });
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading your referral program…</div>;
  }

  if (!stats) {
    return <div className="p-8 text-muted-foreground">Couldn&rsquo;t load referral info. Try again in a moment.</div>;
  }

  const emailSubject = "Ran into a compliance tracker that saves hours every month";
  const emailBody = `Hey,\n\nI started using RegsGuard to track my MN/WI license renewals, bonds, insurance, and CE hours. It auto-generates the paperwork and emails it to DLI/DSPS 7 days before the deadline. No more chasing dates.\n\nIf you sign up through my link we both get a free month:\n${stats.shareUrl}\n\n14-day free trial. First 100 shops lock in $19/mo for life.\n\n—`;

  const smsText = `Check this out — RegsGuard auto-files my MN/WI license renewals so I stop missing deadlines. Sign up with my link and we both get a free month: ${stats.shareUrl}`;

  const progressPct = (stats.conversions % 3) / 3 * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Refer a Contractor — Get a Free Month</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every 3 contractors you refer who sign up for RegsGuard → you get a free month of service.
        Unlimited. Compounds as long as you refer.
      </p>

      {/* Progress box */}
      <div className="mt-8 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-primary">Your progress</div>
            <div className="text-2xl font-bold mt-1">
              {stats.conversions} / {Math.ceil((stats.conversions + 1) / 3) * 3} conversions
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Free months earned</div>
            <div className="text-3xl font-bold text-primary">{stats.freeMonthsEarned}</div>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-primary/10">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {stats.nextMilestone === 3
            ? "Refer 3 more contractors to earn your next free month."
            : `${stats.nextMilestone} more conversion${stats.nextMilestone === 1 ? "" : "s"} to earn another free month.`}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-background/50 p-3">
            <div className="text-muted-foreground">Total invites</div>
            <div className="text-lg font-semibold">{stats.totalReferrals}</div>
          </div>
          <div className="rounded-lg bg-background/50 p-3">
            <div className="text-muted-foreground">Signed up</div>
            <div className="text-lg font-semibold">{stats.conversions}</div>
          </div>
        </div>
      </div>

      {/* Share section */}
      <div className="mt-8 rounded-xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">Your referral link</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Share this anywhere. When someone signs up through it, you both get credit.
        </p>

        <div className="flex items-center gap-2">
          <input
            readOnly
            value={stats.shareUrl}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={() => copy(stats.shareUrl, "link")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
          >
            {copiedThing === "link" ? "✓ Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Code: <code className="rounded bg-muted px-2 py-1 font-mono">{stats.code}</code>
        </div>
      </div>

      {/* Channels */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <a
          href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
          className="rounded-xl border border-border bg-background p-5 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-sm font-semibold">Email</h3>
          </div>
          <p className="text-xs text-muted-foreground">Opens your email client with a pre-filled invite.</p>
        </a>

        <a
          href={`sms:?&body=${encodeURIComponent(smsText)}`}
          className="rounded-xl border border-border bg-background p-5 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-sm font-semibold">Text message</h3>
          </div>
          <p className="text-xs text-muted-foreground">Opens your Messages app with a pre-filled text.</p>
        </a>

        <button
          onClick={() => copy(stats.shareUrl, "link")}
          className="rounded-xl border border-border bg-background p-5 hover:border-primary transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h3 className="text-sm font-semibold">Copy link</h3>
          </div>
          <p className="text-xs text-muted-foreground">Copy to share on social, Slack, or wherever.</p>
        </button>
      </div>

      {/* How it works */}
      <div className="mt-10 rounded-xl border border-border bg-background p-6">
        <h2 className="text-base font-semibold mb-4">How it works</h2>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            <span>Share your link with a plumber, electrician, HVAC tech, or residential contractor you know in MN/WI.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            <span>They sign up through your link and start their 14-day free trial.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
            <span>When they convert to a paid plan, it counts as a conversion.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
            <span>Every 3 conversions → you get 1 free month. No cap. Refer 30 shops → 10 free months.</span>
          </li>
        </ol>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Questions? <Link href="/support" className="text-primary hover:underline">Support →</Link>
      </p>
    </div>
  );
}
