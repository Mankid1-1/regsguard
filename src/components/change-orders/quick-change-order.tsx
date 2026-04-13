"use client";

import { useState, useCallback } from "react";
import { VoiceRecorder } from "@/components/voice/voice-recorder";
import { SignaturePad } from "@/components/signatures/signature-pad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickChangeOrderProps {
  projectId?: string;
  clientId?: string;
  onComplete?: (documentId: string) => void;
}

export function QuickChangeOrder({
  projectId,
  clientId,
  onComplete,
}: QuickChangeOrderProps) {
  // Step data
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [signatureData, setSignatureData] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleTranscript = useCallback((text: string) => {
    setDescription(text);
  }, []);

  const handleSign = useCallback((dataUrl: string) => {
    setSignatureData(dataUrl);
  }, []);

  const isReady =
    description.trim().length > 0 &&
    amount.trim().length > 0 &&
    signatureData.length > 0;

  const handleSubmit = async () => {
    if (!isReady) return;

    setSubmitting(true);
    setError("");

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new Error("Please enter a valid dollar amount.");
      }

      // Create the change order document via /api/documents
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: "change-order",
          title: `Change Order - ${new Date().toLocaleDateString("en-US")}`,
          projectId: projectId || null,
          clientId: clientId || null,
          data: {
            description: description.trim(),
            amount: String(parsedAmount),
            signatureData,
            capturedAt: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create change order");
      }

      const doc = await res.json();
      setDocumentId(doc.id);
      setSubmitted(true);
      onComplete?.(doc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setDescription("");
    setAmount("");
    setSignatureData("");
    setSubmitted(false);
    setDocumentId(null);
    setError("");
  };

  // Success state
  if (submitted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Change Order Captured
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your change order has been saved and is ready for review.
          </p>
          {documentId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Document ID: {documentId}
            </p>
          )}
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
            >
              Create Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Description (Voice + Text) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            Describe the Change
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <VoiceRecorder
            onTranscript={handleTranscript}
            placeholder="Tap mic to dictate the change"
          />
          <div className="space-y-1.5">
            <label
              htmlFor="change-description"
              className="block text-sm font-medium text-foreground"
            >
              Change Description
            </label>
            <textarea
              id="change-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what changed and why..."
              rows={3}
              className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            Amount Change
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            id="change-amount"
            type="number"
            label="Dollar Amount"
            placeholder="0.00"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enter positive for additions, negative for credits
          </p>
        </CardContent>
      </Card>

      {/* Step 3: Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            Capture Signature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignaturePad onSign={handleSign} />
          {signatureData && (
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              Signature captured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step 4: Submit */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={!isReady || submitting}
        onClick={handleSubmit}
      >
        Submit Change Order
      </Button>

      {/* Readiness checklist */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Checklist
        </p>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            {description.trim() ? (
              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
            <span className={description.trim() ? "text-foreground" : "text-muted-foreground"}>
              Description
            </span>
          </li>
          <li className="flex items-center gap-2">
            {amount.trim() ? (
              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
            <span className={amount.trim() ? "text-foreground" : "text-muted-foreground"}>
              Amount
            </span>
          </li>
          <li className="flex items-center gap-2">
            {signatureData ? (
              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
            <span className={signatureData ? "text-foreground" : "text-muted-foreground"}>
              Signature
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
