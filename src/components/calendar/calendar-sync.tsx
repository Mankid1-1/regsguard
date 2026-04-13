"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

export function CalendarSync() {
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load existing token on mount
  useEffect(() => {
    async function loadToken() {
      try {
        const res = await fetch("/api/calendar/token");
        if (res.ok) {
          const data = await res.json();
          if (data.feedUrl) setFeedUrl(data.feedUrl);
        }
      } catch {
        // Silently fail on initial load
      }
    }
    loadToken();
  }, []);

  const generateToken = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/token", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setFeedUrl(data.feedUrl);
    } catch (err) {
      console.error("Failed to generate calendar token:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = feedUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [feedUrl]);

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-start gap-3 mb-4">
        {/* Calendar icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Calendar Sync
          </h3>
          <p className="text-sm text-muted-foreground">
            Subscribe to your compliance deadlines in Google Calendar, Apple
            Calendar, or Outlook.
          </p>
        </div>
      </div>

      {!feedUrl ? (
        <Button onClick={generateToken} loading={loading}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.066a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757"
            />
          </svg>
          Subscribe to Calendar
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Feed URL display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted px-3 py-2">
              <p className="truncate text-sm font-mono text-muted-foreground">
                {feedUrl}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <svg
                    className="mr-1.5 h-4 w-4 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg
                    className="mr-1.5 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
              Setup Instructions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateToken}
              loading={loading}
            >
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                />
              </svg>
              Regenerate Link
            </Button>
          </div>

          {/* Instructions panel */}
          {showInstructions && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Google Calendar
                </h4>
                <ol className="mt-1 text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Open Google Calendar on the web</li>
                  <li>
                    Click the <strong>+</strong> next to &quot;Other
                    calendars&quot;
                  </li>
                  <li>
                    Select <strong>From URL</strong>
                  </li>
                  <li>Paste the feed URL above and click &quot;Add calendar&quot;</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Apple Calendar
                </h4>
                <ol className="mt-1 text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Open the Calendar app</li>
                  <li>
                    Go to <strong>File &gt; New Calendar Subscription</strong>
                  </li>
                  <li>Paste the feed URL and click &quot;Subscribe&quot;</li>
                  <li>Choose your refresh interval and click &quot;OK&quot;</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Outlook
                </h4>
                <ol className="mt-1 text-sm text-muted-foreground space-y-0.5 list-decimal list-inside">
                  <li>Open Outlook Calendar</li>
                  <li>
                    Click <strong>Add Calendar &gt; Subscribe from web</strong>
                  </li>
                  <li>Paste the feed URL and give it a name</li>
                  <li>Click &quot;Import&quot;</li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your calendar will automatically update as deadlines change.
                Regenerating the link will invalidate the old one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
