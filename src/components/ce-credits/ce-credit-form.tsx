"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface CECreditData {
  id: string;
  courseName: string;
  provider: string | null;
  hours: number;
  completedAt: string;
  regulationId: string | null;
  certificateUrl: string | null;
  notes: string | null;
}

interface Regulation {
  id: string;
  title: string;
  trade: string;
  state: string;
}

interface CECreditFormProps {
  regulationId?: string;
  onSave?: () => void;
  credit?: CECreditData;
  regulations?: Regulation[];
  onCancel?: () => void;
}

export function CECreditForm({
  regulationId,
  onSave,
  credit,
  regulations = [],
  onCancel,
}: CECreditFormProps) {
  const { toast } = useToast();
  const isEditing = !!credit;

  const [form, setForm] = useState({
    courseName: credit?.courseName ?? "",
    provider: credit?.provider ?? "",
    hours: credit?.hours?.toString() ?? "",
    completedAt: credit?.completedAt
      ? new Date(credit.completedAt).toISOString().split("T")[0]
      : "",
    regulationId: credit?.regulationId ?? regulationId ?? "",
    certificateUrl: credit?.certificateUrl ?? "",
    notes: credit?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCertificateUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        set("certificateUrl", data.url || data.filePath || "");
        toast("Certificate uploaded.", "success");
      } else {
        toast("Upload failed. You can add the URL manually.", "error");
      }
    } catch {
      toast("Upload failed. You can add the URL manually.", "error");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.courseName.trim()) {
      toast("Course name is required.", "error");
      return;
    }
    if (!form.hours || parseFloat(form.hours) <= 0) {
      toast("Hours must be a positive number.", "error");
      return;
    }
    if (!form.completedAt) {
      toast("Completion date is required.", "error");
      return;
    }

    setSaving(true);

    const payload = {
      courseName: form.courseName.trim(),
      provider: form.provider.trim() || null,
      hours: parseFloat(form.hours),
      completedAt: form.completedAt,
      regulationId: form.regulationId || null,
      certificateUrl: form.certificateUrl.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      const url = isEditing ? `/api/ce-credits/${credit.id}` : "/api/ce-credits";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(
          isEditing ? "CE credit updated." : "CE credit added.",
          "success"
        );
        onSave?.();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to save.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="courseName"
        label="Course Name *"
        value={form.courseName}
        onChange={(e) => set("courseName", e.target.value)}
        placeholder="e.g. 2026 Plumbing Code Update"
      />

      <Input
        id="provider"
        label="Provider"
        value={form.provider}
        onChange={(e) => set("provider", e.target.value)}
        placeholder="e.g. PHCC Education Foundation"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="hours"
          label="Hours *"
          type="number"
          step="0.5"
          min="0.5"
          value={form.hours}
          onChange={(e) => set("hours", e.target.value)}
          placeholder="4"
        />
        <Input
          id="completedAt"
          label="Date Completed *"
          type="date"
          value={form.completedAt}
          onChange={(e) => set("completedAt", e.target.value)}
        />
      </div>

      {regulations.length > 0 && (
        <div className="space-y-1.5">
          <label
            htmlFor="regulationId"
            className="block text-sm font-medium text-foreground"
          >
            Linked Regulation
          </label>
          <select
            id="regulationId"
            value={form.regulationId}
            onChange={(e) => set("regulationId", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          >
            <option value="">-- None --</option>
            {regulations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.trade} - {r.state})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          Certificate
        </label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            {uploading ? "Uploading..." : "Upload File"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCertificateUpload(file);
              }}
            />
          </label>
          {form.certificateUrl && (
            <span className="text-xs text-success truncate max-w-[200px]">
              Uploaded
            </span>
          )}
        </div>
        <Input
          id="certificateUrl"
          value={form.certificateUrl}
          onChange={(e) => set("certificateUrl", e.target.value)}
          placeholder="Or paste certificate URL"
          className="mt-1"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-foreground"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="Any additional notes about this credit..."
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={saving}>
          {isEditing ? "Update Credit" : "Add Credit"}
        </Button>
      </div>
    </form>
  );
}
