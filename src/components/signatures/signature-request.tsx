"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignatureRequestProps {
  documentId: string;
}

export function SignatureRequest({ documentId }: SignatureRequestProps) {
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signingLink, setSigningLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningLink(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/documents/${documentId}/signatures/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signerName, signerEmail }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create signature request");
      }

      const data = await res.json();
      setSigningLink(data.signingUrl);
      setSignerName("");
      setSignerEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!signingLink) return;
    try {
      await navigator.clipboard.writeText(signingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = signingLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        Request a Signature
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="signer-name"
          label="Signer Name"
          type="text"
          placeholder="e.g. John Smith"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          required
        />
        <Input
          id="signer-email"
          label="Signer Email"
          type="email"
          placeholder="john@example.com"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" size="md" loading={loading}>
          Send Signature Request
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {signingLink && (
        <div className="space-y-2 rounded-lg border border-border bg-accent/50 p-4">
          <p className="text-sm font-medium text-foreground">
            Signing link created! Share this with the signer:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={signingLink}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyLink}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
