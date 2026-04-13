"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WEBHOOK_EVENTS = [
  { value: "DEADLINE_DUE", label: "Deadline Due" },
  { value: "DOCUMENT_CREATED", label: "Document Created" },
  { value: "DOCUMENT_SIGNED", label: "Document Signed" },
  { value: "COMPLIANCE_FILED", label: "Compliance Filed" },
  { value: "PAYMENT_RECEIVED", label: "Payment Received" },
] as const;

type WebhookEvent = (typeof WEBHOOK_EVENTS)[number]["value"];

interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export function WebhooksManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Create form state
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<WebhookEvent>>(
    new Set()
  );
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editEvents, setEditEvents] = useState<Set<WebhookEvent>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks");
      if (res.ok) {
        setWebhooks(await res.json());
      }
    } catch {
      setError("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  function toggleEvent(event: WebhookEvent) {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) {
        next.delete(event);
      } else {
        next.add(event);
      }
      return next;
    });
  }

  function toggleEditEvent(event: WebhookEvent) {
    setEditEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) {
        next.delete(event);
      } else {
        next.add(event);
      }
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || selectedEvents.size === 0) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          events: Array.from(selectedEvents),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || data.issues?.[0]?.message || "Failed to create webhook");
        return;
      }

      const data = await res.json();
      setNewSecret(data.secret);
      setUrl("");
      setSelectedEvents(new Set());
      fetchWebhooks();
    } catch {
      setError("Failed to create webhook");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(wh: Webhook) {
    setEditingId(wh.id);
    setEditUrl(wh.url);
    setEditEvents(new Set(wh.events));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditUrl("");
    setEditEvents(new Set());
  }

  async function handleSaveEdit() {
    if (!editingId || !editUrl.trim() || editEvents.size === 0) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/webhooks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: editUrl.trim(),
          events: Array.from(editEvents),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update webhook");
        return;
      }

      cancelEdit();
      fetchWebhooks();
    } catch {
      setError("Failed to update webhook");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchWebhooks();
      }
    } catch {
      setError("Failed to delete webhook");
    }
  }

  function copySecret(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create form */}
          <form onSubmit={handleCreate} className="mb-6 space-y-4">
            <Input
              id="webhook-url"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              label="Endpoint URL"
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Events
              </label>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((ev) => (
                  <button
                    key={ev.value}
                    type="button"
                    onClick={() => toggleEvent(ev.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selectedEvents.has(ev.value)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {ev.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              loading={creating}
              disabled={!url.trim() || selectedEvents.size === 0}
            >
              Add Webhook
            </Button>
          </form>

          {/* Newly-created webhook secret banner */}
          {newSecret && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
              <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                Copy this signing secret now. You will not be able to see it
                again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-amber-100 px-3 py-2 text-xs font-mono text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                  {newSecret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copySecret(newSecret)}
                >
                  {copiedSecret ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewSecret(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          {/* Webhooks list */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No webhooks configured
            </p>
          ) : (
            <div className="space-y-4">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="rounded-lg border border-border p-4"
                >
                  {editingId === wh.id ? (
                    /* ─── Edit mode ─── */
                    <div className="space-y-3">
                      <Input
                        id={`edit-url-${wh.id}`}
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://example.com/webhook"
                      />
                      <div className="flex flex-wrap gap-2">
                        {WEBHOOK_EVENTS.map((ev) => (
                          <button
                            key={ev.value}
                            type="button"
                            onClick={() => toggleEditEvent(ev.value)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                              editEvents.has(ev.value)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {ev.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          loading={saving}
                          onClick={handleSaveEdit}
                          disabled={
                            !editUrl.trim() || editEvents.size === 0
                          }
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ─── Read mode ─── */
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-sm">
                            {wh.url}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {wh.events.map((ev) => (
                              <Badge key={ev} variant="secondary">
                                {
                                  WEBHOOK_EVENTS.find((e) => e.value === ev)
                                    ?.label ?? ev
                                }
                              </Badge>
                            ))}
                          </div>
                          {wh.lastError && (
                            <p className="mt-2 text-xs text-destructive">
                              Last error: {wh.lastError}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Badge
                            variant={wh.active ? "default" : "secondary"}
                          >
                            {wh.active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(wh)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(wh.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
