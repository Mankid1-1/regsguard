"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface Project {
  id: string;
  name: string;
}

interface QuickExpenseProps {
  projects?: Project[];
  onSaved?: () => void;
}

const CATEGORIES = [
  { value: "MATERIALS", label: "Materials" },
  { value: "LABOR", label: "Labor" },
  { value: "PERMITS", label: "Permits" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "FUEL", label: "Fuel" },
  { value: "OFFICE", label: "Office" },
  { value: "OTHER", label: "Other" },
];

export function QuickExpense({ projects = [], onSaved }: QuickExpenseProps) {
  const { toast } = useToast();
  const cameraRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    category: "MATERIALS",
    amount: "",
    vendor: "",
    description: "",
    projectId: "",
    date: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleReceiptCapture(file: File) {
    setUploading(true);
    // Show a local preview
    const reader = new FileReader();
    reader.onload = (e) => setReceiptPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        set("receiptUrl", data.url || data.filePath || "");
        toast("Receipt uploaded.", "success");
      } else {
        toast("Upload failed. You can save without receipt.", "error");
      }
    } catch {
      toast("Upload failed. You can save without receipt.", "error");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast("Amount is required.", "error");
      return;
    }
    if (!form.date) {
      toast("Date is required.", "error");
      return;
    }

    setSaving(true);

    const payload = {
      category: form.category,
      amount: parseFloat(form.amount),
      vendor: form.vendor.trim() || null,
      description: form.description.trim() || null,
      projectId: form.projectId || null,
      date: form.date,
      receiptUrl: form.receiptUrl || null,
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast("Expense saved.", "success");
        setForm({
          category: "MATERIALS",
          amount: "",
          vendor: "",
          description: "",
          projectId: "",
          date: new Date().toISOString().split("T")[0],
          receiptUrl: "",
        });
        setReceiptPreview(null);
        onSaved?.();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to save expense.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }

    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-background p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="h-5 w-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <h3 className="text-base font-semibold">Quick Expense</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Snap receipt &rarr; done
        </span>
      </div>

      {/* Camera / Receipt capture */}
      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={uploading}
          onClick={() => cameraRef.current?.click()}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          {uploading ? "Uploading..." : "Snap Receipt Photo"}
        </Button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*;capture=camera"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReceiptCapture(file);
            e.target.value = "";
          }}
        />
        {receiptPreview && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={receiptPreview}
              alt="Receipt preview"
              className="h-16 w-16 rounded-lg border border-border object-cover"
            />
            <span className="text-xs text-success font-medium">
              Receipt attached
            </span>
          </div>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground italic">
          OCR coming soon -- fill in amount manually for now
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div className="space-y-1.5">
          <label
            htmlFor="expense-category"
            className="block text-sm font-medium text-foreground"
          >
            Category *
          </label>
          <select
            id="expense-category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <Input
          id="expense-amount"
          label="Amount *"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* Vendor */}
        <Input
          id="expense-vendor"
          label="Vendor"
          value={form.vendor}
          onChange={(e) => set("vendor", e.target.value)}
          placeholder="e.g. Home Depot"
        />

        {/* Date */}
        <Input
          id="expense-date"
          label="Date *"
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </div>

      {/* Project link */}
      {projects.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <label
            htmlFor="expense-project"
            className="block text-sm font-medium text-foreground"
          >
            Project
          </label>
          <select
            id="expense-project"
            value={form.projectId}
            onChange={(e) => set("projectId", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          >
            <option value="">-- No Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div className="mt-3 space-y-1.5">
        <label
          htmlFor="expense-description"
          className="block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="expense-description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="What was this for?"
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 resize-none"
        />
      </div>

      <Button type="submit" className="w-full mt-4" loading={saving}>
        Save Expense
      </Button>
    </form>
  );
}
