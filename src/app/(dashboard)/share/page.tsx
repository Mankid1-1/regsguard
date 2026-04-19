"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BadgeState {
  enabled: boolean;
  slug: string | null;
  publicUrl: string | null;
  score: number | null;
  scoreUpdatedAt: string | null;
  embedSnippet: string | null;
}

export default function ShareBadgePage() {
  const [state, setState] = useState<BadgeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState<"html" | "url" | null>(null);

  useEffect(() => {
    fetch("/api/badge")
      .then((r) => r.json())
      .then((data) => {
        setState(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggleBadge(enable: boolean) {
    setToggling(true);
    try {
      const res = await fetch("/api/badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: enable }),
      });
      if (!res.ok) throw new Error("Failed to toggle badge");
      const data = await res.json();
      // Refresh full state
      const fresh = await fetch("/api/badge").then((r) => r.json());
      setState(fresh);
    } finally {
      setToggling(false);
    }
  }

  function copyToClipboard(text: string, which: "html" | "url") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading badge status…</div>;
  }

  if (!state) {
    return <div className="p-8 text-muted-foreground">Couldn&rsquo;t load badge. Try again in a moment.</div>;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://regsguard.rebooked.org";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Share Your Compliance Badge</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Put a badge on your website that shows you&rsquo;re compliance-verified. Every visitor
        to your site sees your grade + links back to a public profile. Free forever.
      </p>

      {/* Enable / status card */}
      <div className="mt-8 rounded-xl border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Public badge is {state.enabled ? "ON" : "OFF"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {state.enabled
                ? `Live at ${state.publicUrl}`
                : "Badge hidden. Turn on below to publish."}
            </p>
          </div>
          <button
            onClick={() => toggleBadge(!state.enabled)}
            disabled={toggling}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              state.enabled
                ? "bg-red-500/10 text-red-700 hover:bg-red-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } disabled:opacity-50`}
          >
            {toggling ? "Working…" : state.enabled ? "Turn Off" : "Turn On"}
          </button>
        </div>

        {state.enabled && state.score !== null && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">Current Score</div>
              <div className="text-xl font-bold">{state.score}/100</div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">Updated</div>
              <div className="text-sm">
                {state.scoreUpdatedAt
                  ? new Date(state.scoreUpdatedAt).toLocaleDateString()
                  : "—"}
              </div>
            </div>
            <div className="rounded-lg bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">Refresh</div>
              <button
                onClick={() => toggleBadge(true)}
                className="text-sm text-primary hover:underline"
              >
                Recalculate now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live preview */}
      {state.enabled && state.slug && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Live preview</h2>
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center gap-4">
            {/* Use img tag directly so user can preview the actual SVG rendering */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${appUrl}/api/badge/${state.slug}/svg`}
              alt="Your compliance badge"
              className="max-w-full"
            />
            <a
              href={state.publicUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              → View public profile page
            </a>
          </div>
        </div>
      )}

      {/* Embed snippets */}
      {state.enabled && state.embedSnippet && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Embed on your website</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Paste this HTML into your website. Works on WordPress, Squarespace, Wix, Shopify,
              and anywhere else HTML is allowed. No account needed on your visitors&rsquo; side.
            </p>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-relaxed whitespace-pre-wrap break-all">
                <code>{state.embedSnippet}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(state.embedSnippet!, "html")}
                className="absolute right-2 top-2 rounded-md bg-background border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
              >
                {copied === "html" ? "Copied!" : "Copy HTML"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Or share the link</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Use this URL on social media, email signatures, or in proposal PDFs.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={state.publicUrl ?? ""}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(state.publicUrl!, "url")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {copied === "url" ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Email signature snippet</h3>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap break-all">
              <code>
                ✅ Compliance Verified · RegsGuard
                {"\n"}
                {state.publicUrl}
              </code>
            </pre>
          </div>
        </div>
      )}

      {/* Why use this */}
      <div className="mt-10 rounded-xl border border-border bg-background p-6">
        <h2 className="text-base font-semibold mb-3">Why contractors share their badge</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">→</span>
            <span>
              <strong>Close deals faster.</strong> Customers and GCs see you&rsquo;re verified
              before they even ask for proof.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">→</span>
            <span>
              <strong>Win bids that require insurance / license proof.</strong> Link straight
              from your proposal PDFs.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">→</span>
            <span>
              <strong>Stand out from uninsured &ldquo;Craigslist contractors.&rdquo;</strong>
              Professional trust signal on your homepage.
            </span>
          </li>
        </ul>
        <div className="mt-4 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
          Your badge auto-refreshes nightly. When you miss a deadline or let a license lapse,
          the score drops — so it&rsquo;s always accurate.
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Need a refresher on the score?{" "}
        <Link href="/dashboard" className="text-primary hover:underline">
          See how it&rsquo;s calculated →
        </Link>
      </p>
    </div>
  );
}
