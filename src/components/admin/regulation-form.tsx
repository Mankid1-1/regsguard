"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TRADES = ["PLUMBING", "ELECTRICAL", "HVAC", "GENERAL", "EPA", "LEAD_SAFE"];
const CYCLES = ["ANNUAL", "BIENNIAL", "TRIENNIAL", "FIVE_YEAR", "ONE_TIME", "VARIES"];
const CATEGORIES = [
  "LICENSE_RENEWAL", "CONTINUING_EDUCATION", "INSURANCE", "BONDING",
  "EPA_CERTIFICATION", "SAFETY_TRAINING", "PERMIT", "REGISTRATION",
];

interface RegulationFormProps {
  regulation?: {
    id: string;
    title: string;
    description: string;
    trade: string;
    state: string;
    authority: string;
    officialEmail: string | null;
    portalUrl: string | null;
    fee: string | null;
    renewalCycle: string;
    category: string;
    defaultDueMonth: number | null;
    defaultDueDay: number | null;
    notes: string | null;
    active: boolean;
  };
}

export function RegulationForm({ regulation }: RegulationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = !!regulation;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title"),
      description: form.get("description"),
      trade: form.get("trade"),
      state: form.get("state"),
      authority: form.get("authority"),
      officialEmail: form.get("officialEmail") || null,
      portalUrl: form.get("portalUrl") || null,
      fee: form.get("fee") || null,
      renewalCycle: form.get("renewalCycle"),
      category: form.get("category"),
      defaultDueMonth: form.get("defaultDueMonth") ? Number(form.get("defaultDueMonth")) : null,
      defaultDueDay: form.get("defaultDueDay") ? Number(form.get("defaultDueDay")) : null,
      notes: form.get("notes") || null,
      active: form.get("active") === "on",
    };

    const url = isEditing ? `/api/regulations/${regulation.id}` : "/api/regulations";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Failed to save");
      return;
    }

    router.push("/admin/regulations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Input id="title" name="title" label="Title" required defaultValue={regulation?.title} />

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={regulation?.description}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="trade" className="block text-sm font-medium">Trade</label>
          <select
            id="trade" name="trade" required defaultValue={regulation?.trade}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Input id="state" name="state" label="State (2-letter)" required maxLength={2} defaultValue={regulation?.state || "MN"} />
      </div>

      <Input id="authority" name="authority" label="Authority" required defaultValue={regulation?.authority} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="renewalCycle" className="block text-sm font-medium">Renewal Cycle</label>
          <select
            id="renewalCycle" name="renewalCycle" required defaultValue={regulation?.renewalCycle}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-medium">Category</label>
          <select
            id="category" name="category" required defaultValue={regulation?.category}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="officialEmail" name="officialEmail" label="Official Email" type="email" defaultValue={regulation?.officialEmail ?? ""} />
        <Input id="portalUrl" name="portalUrl" label="Portal URL" defaultValue={regulation?.portalUrl ?? ""} />
      </div>

      <Input id="fee" name="fee" label="Fee" defaultValue={regulation?.fee ?? ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="defaultDueMonth" name="defaultDueMonth" label="Default Due Month (1-12)" type="number" min={1} max={12} defaultValue={regulation?.defaultDueMonth ?? ""} />
        <Input id="defaultDueDay" name="defaultDueDay" label="Default Due Day (1-31)" type="number" min={1} max={31} defaultValue={regulation?.defaultDueDay ?? ""} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
        <textarea
          id="notes" name="notes" rows={2} defaultValue={regulation?.notes ?? ""}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="active" name="active" defaultChecked={regulation?.active ?? true} className="h-4 w-4" />
        <label htmlFor="active" className="text-sm font-medium">Active</label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>{isEditing ? "Update" : "Create"} Regulation</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
