"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "idle" | "generating" | "sending" | "success" | "error";

interface FileNowButtonProps {
  regulationId: string;
  regulationTitle: string;
  officialEmail: string | null;
  portalUrl: string | null;
  onComplete?: () => void;
}

export function FileNowButton({
  regulationId,
  regulationTitle,
  officialEmail,
  portalUrl,
  onComplete,
}: FileNowButtonProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFile() {
    // If no official email, open portal in new tab
    if (!officialEmail && portalUrl) {
      window.open(portalUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!officialEmail) {
      setError("No filing destination configured for this regulation");
      setStage("error");
      return;
    }

    setError(null);
    setStage("generating");

    try {
      // Generate PDF + send in one API call
      const res = await fetch(`/api/regulations/${regulationId}/file`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Filing failed");
      }

      setStage("sending");

      // Simulate the "sending" visual stage briefly for UX
      await new Promise((r) => setTimeout(r, 600));

      setStage("success");
      if (onComplete) onComplete();

      // Refresh server data after brief success flash
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Filing failed");
      setStage("error");
    }
  }

  if (stage === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Filed to {officialEmail}
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={handleFile}
          className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry filing
        </button>
        {error && <span className="text-xs text-red-600 px-1">{error}</span>}
      </div>
    );
  }

  const isWorking = stage === "generating" || stage === "sending";

  return (
    <button
      onClick={handleFile}
      disabled={isWorking}
      className="group relative flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
      title={officialEmail ? `Files to ${officialEmail}` : portalUrl ? "Opens portal in new tab" : "No filing destination"}
    >
      {isWorking ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {stage === "generating" ? "Generating PDF..." : "Sending..."}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {officialEmail ? "File Now" : portalUrl ? "Open Portal" : "File"}
        </>
      )}
    </button>
  );
}
