"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ShareLink {
  id: string;
  token: string;
  label: string | null;
  url: string;
  active: boolean;
  viewCount: number;
  lastViewedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export function ShareLinkManager() {
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    try {
      const res = await fetch("/api/compliance/share");
      if (res.ok) {
        const data = await res.json();
        setShares(data);
      }
    } catch (err) {
      console.error("Failed to fetch shares:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  async function handleCreate() {
    setCreating(true);
    try {
      let expiresAt: string | undefined;
      if (expiresIn) {
        const days = parseInt(expiresIn, 10);
        if (!isNaN(days) && days > 0) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          expiresAt = d.toISOString();
        }
      }

      const res = await fetch("/api/compliance/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim() || undefined,
          expiresAt,
        }),
      });

      if (res.ok) {
        setLabel("");
        setExpiresIn("");
        setShowCreate(false);
        await fetchShares();
      }
    } catch (err) {
      console.error("Failed to create share:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await fetch("/api/compliance/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: false }),
      });
      await fetchShares();
    } catch (err) {
      console.error("Failed to deactivate:", err);
    }
  }

  async function handleReactivate(id: string) {
    try {
      await fetch("/api/compliance/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: true }),
      });
      await fetchShares();
    } catch (err) {
      console.error("Failed to reactivate:", err);
    }
  }

  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function shareViaSms(url: string, label: string | null) {
    const businessLabel = label || "my compliance status";
    const text = `Here's a link to view ${businessLabel}: ${url}`;
    navigator.clipboard.writeText(text);
    setCopiedId("sms-" + url);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            Loading share links...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Compliance Share Links</CardTitle>
        <Button
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "Cancel" : "Create New Link"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        {showCreate && (
          <div className="rounded-lg border border-border bg-accent/30 p-4 space-y-3">
            <Input
              label="Label (optional)"
              placeholder="e.g., For ABC General Contractors"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Input
              label="Expires in (days, optional)"
              placeholder="e.g., 30"
              type="number"
              min="1"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            />
            <Button onClick={handleCreate} loading={creating} size="sm">
              Create Share Link
            </Button>
          </div>
        )}

        {/* Links list */}
        {shares.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No share links yet. Create one to share your compliance status with
            clients or general contractors.
          </p>
        ) : (
          <div className="space-y-3">
            {shares.map((share) => (
              <div
                key={share.id}
                className={`rounded-lg border p-4 ${
                  share.active
                    ? "border-border bg-background"
                    : "border-border/50 bg-muted/30 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {share.label || "Untitled Link"}
                      </span>
                      {!share.active && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Inactive
                        </span>
                      )}
                      {share.expiresAt &&
                        new Date(share.expiresAt) < new Date() && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            Expired
                          </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {share.url}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{share.viewCount} views</span>
                      {share.lastViewedAt && (
                        <span>
                          Last viewed{" "}
                          {new Date(share.lastViewedAt).toLocaleDateString()}
                        </span>
                      )}
                      {share.expiresAt && (
                        <span>
                          Expires{" "}
                          {new Date(share.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(share.url, share.id)}
                    >
                      {copiedId === share.id ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareViaSms(share.url, share.label)}
                    >
                      {copiedId === `sms-${share.url}`
                        ? "Copied!"
                        : "Share via SMS"}
                    </Button>
                    {share.active ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivate(share.id)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReactivate(share.id)}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
