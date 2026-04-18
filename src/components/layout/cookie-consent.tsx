"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "regsguard-cookie-consent-v1";

type ConsentState = "accepted" | "essential-only" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "essential-only") {
      setConsent(stored);
    }
  }, []);

  function persist(value: "accepted" | "essential-only") {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  }

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-body"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-lg border border-border bg-background shadow-lg p-4 md:p-5"
    >
      <h2 id="cookie-consent-title" className="text-sm font-semibold mb-1">
        We use cookies
      </h2>
      <p id="cookie-consent-body" className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Essential cookies keep you signed in and your session secure. Optional cookies help us
        understand how the app is used so we can improve it. You can change this anytime in{" "}
        <Link href="/privacy" className="underline">privacy settings</Link>.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => persist("essential-only")}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => persist("accepted")}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
