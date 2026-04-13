"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
}

interface FollowUp {
  id: string;
  projectId: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  message: string;
  scheduledAt: string;
  sentAt: string | null;
  channel: string;
  project: { id: string; name: string } | null;
}

const MESSAGE_TEMPLATES = [
  {
    label: "Thank You",
    message:
      "Thank you for choosing us for your project. We appreciate your business and look forward to working with you again.",
  },
  {
    label: "Check-In",
    message:
      "How is everything working out? We wanted to follow up and make sure everything is to your satisfaction.",
  },
  {
    label: "Warranty Reminder",
    message:
      "Just a friendly reminder that your warranty covers all workmanship for the agreed period. Don't hesitate to reach out if you notice anything.",
  },
  {
    label: "Seasonal Reminder",
    message:
      "As the seasons change, it's a good time to schedule a maintenance check. Would you like us to set something up?",
  },
];

const QUICK_PRESETS = [
  { label: "1 Week", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

export function FollowUpScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [followUps, setFollowUps] = useState<{
    upcoming: FollowUp[];
    pending: FollowUp[];
    sent: FollowUp[];
  }>({ upcoming: [], pending: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [channel, setChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, followUpsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/follow-ups"),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (followUpsRes.ok) setFollowUps(await followUpsRes.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function applyPreset(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    setScheduledAt(local.toISOString().slice(0, 16));
  }

  function applyTemplate(msg: string) {
    setMessage(msg);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!message.trim()) {
      setError("Message is required");
      return;
    }
    if (!scheduledAt) {
      setError("Schedule date/time is required");
      return;
    }

    setSubmitting(true);

    try {
      const isEditing = !!editingId;
      const url = isEditing
        ? `/api/follow-ups/${editingId}`
        : "/api/follow-ups";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId || undefined,
          clientEmail: clientEmail || undefined,
          clientPhone: clientPhone || undefined,
          message: message.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          channel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to save follow-up");
        return;
      }

      setSuccess(true);
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setProjectId("");
    setClientEmail("");
    setClientPhone("");
    setMessage("");
    setScheduledAt("");
    setChannel("EMAIL");
    setEditingId(null);
  }

  function startEdit(followUp: FollowUp) {
    setEditingId(followUp.id);
    setProjectId(followUp.projectId || "");
    setClientEmail(followUp.clientEmail || "");
    setClientPhone(followUp.clientPhone || "");
    setMessage(followUp.message);
    const local = new Date(
      new Date(followUp.scheduledAt).getTime() -
        new Date(followUp.scheduledAt).getTimezoneOffset() * 60000
    );
    setScheduledAt(local.toISOString().slice(0, 16));
    setChannel(followUp.channel as "EMAIL" | "SMS");
    setSuccess(false);
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/follow-ups/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scheduler Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Follow-Up" : "Schedule Follow-Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                Follow-up {editingId ? "updated" : "scheduled"} successfully!
              </div>
            )}

            {/* Project selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Project (optional)
              </label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Channel
              </label>
              <div className="flex gap-2">
                {(["EMAIL", "SMS"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      channel === ch
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {ch === "EMAIL" ? "Email" : "SMS"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            {channel === "EMAIL" ? (
              <Input
                label="Recipient Email"
                type="email"
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            ) : (
              <Input
                label="Recipient Phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            )}

            {/* Message templates */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Message Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t.message)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y"
                placeholder="Type your follow-up message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Date/time with quick presets */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Schedule For
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.days)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="datetime-local"
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={submitting}>
                {editingId ? "Update Follow-Up" : "Schedule Follow-Up"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Upcoming Follow-Ups */}
      {(followUps.upcoming.length > 0 || followUps.pending.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Follow-Ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...followUps.pending, ...followUps.upcoming].map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {f.project && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {f.project.name}
                        </p>
                      )}
                      <p className="text-sm text-foreground line-clamp-2">
                        {f.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(f.scheduledAt)}
                        </span>
                        <Badge
                          variant={
                            new Date(f.scheduledAt) <= new Date()
                              ? "warning"
                              : "default"
                          }
                        >
                          {f.channel}
                        </Badge>
                        {f.clientEmail && (
                          <span className="text-xs text-muted-foreground truncate">
                            {f.clientEmail}
                          </span>
                        )}
                        {f.clientPhone && (
                          <span className="text-xs text-muted-foreground">
                            {f.clientPhone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(f)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(f.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sent Follow-Ups */}
      {followUps.sent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Follow-Ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {followUps.sent.slice(0, 10).map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-border/50 bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {f.project && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {f.project.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {f.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="success">Sent</Badge>
                        <span className="text-xs text-muted-foreground">
                          {f.sentAt ? formatDate(f.sentAt) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
