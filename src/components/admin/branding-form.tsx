"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface BrandingData {
  id: string;
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  fromEmail: string | null;
  fromName: string | null;
}

export function BrandingForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    primaryColor: "#1e40af",
    logoUrl: "",
    fromEmail: "",
    fromName: "",
    companyName: "",
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    fetch("/api/tenant/branding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BrandingData | null) => {
        if (data) {
          setForm({
            primaryColor: data.primaryColor || "#1e40af",
            logoUrl: data.logoUrl || "",
            fromEmail: data.fromEmail || "",
            fromName: data.fromName || "",
            companyName: data.name || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoUpload(file: File) {
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
        set("logoUrl", data.url || data.filePath || "");
        toast("Logo uploaded.", "success");
      } else {
        toast("Upload failed.", "error");
      }
    } catch {
      toast("Upload failed.", "error");
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);

    const payload: Record<string, string | null> = {};
    if (form.primaryColor) payload.primaryColor = form.primaryColor;
    payload.logoUrl = form.logoUrl || null;
    payload.fromEmail = form.fromEmail || null;
    payload.fromName = form.fromName || null;

    try {
      const res = await fetch("/api/tenant/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast("Branding updated.", "success");
      } else {
        const data = await res.json();
        toast(data.error || "Failed to update branding.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading branding settings...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border p-1"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                placeholder="#1e40af"
                className="w-32"
                maxLength={7}
              />
              <span
                className="h-8 w-8 rounded-full border border-border"
                style={{ backgroundColor: form.primaryColor }}
              />
            </div>
          </div>

          {/* Logo upload */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Company logo"
                  className="h-14 w-14 rounded-lg border border-border object-contain bg-white p-1"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                  <svg
                    className="h-6 w-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex flex-col gap-2">
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
                  {uploading ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.svg"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                </label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => set("logoUrl", "")}
                    className="text-xs text-destructive hover:underline text-left"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Company name (read-only display) */}
          <Input
            id="branding-company"
            label="Company Name"
            value={form.companyName}
            disabled
            className="opacity-60"
          />

          {/* Email settings */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="branding-from-email"
              label="From Email"
              type="email"
              value={form.fromEmail}
              onChange={(e) => set("fromEmail", e.target.value)}
              placeholder="compliance@yourcompany.com"
            />
            <Input
              id="branding-from-name"
              label="From Name"
              value={form.fromName}
              onChange={(e) => set("fromName", e.target.value)}
              placeholder="Your Company Compliance"
            />
          </div>

          <Button onClick={handleSave} loading={saving} className="w-full">
            Save Branding
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This is how your brand will appear on generated documents.
          </p>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            {/* Mock document header */}
            <div
              className="flex items-center justify-between border-b-[3px] pb-4 mb-4"
              style={{ borderColor: form.primaryColor }}
            >
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="h-10 w-10 rounded object-contain"
                  />
                ) : null}
                <span
                  className="text-xl font-bold"
                  style={{ color: form.primaryColor }}
                >
                  {form.companyName || "Your Company"}
                </span>
              </div>
              <div className="text-right">
                <div
                  className="text-lg font-bold"
                  style={{ color: form.primaryColor }}
                >
                  INVOICE
                </div>
                <div className="text-xs text-gray-500 mt-1">#INV-001</div>
              </div>
            </div>

            {/* Mock content */}
            <div className="space-y-3">
              <div
                className="text-xs font-bold uppercase tracking-wide border-b pb-1"
                style={{
                  color: form.primaryColor,
                  borderColor: "#e5e7eb",
                }}
              >
                Bill To
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-900">John Smith</div>
                <div>123 Main Street</div>
                <div>Springfield, IL 62701</div>
              </div>

              {/* Mock table */}
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">Plumbing repair</td>
                    <td className="py-2 text-right text-gray-700">$450.00</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">Materials</td>
                    <td className="py-2 text-right text-gray-700">$125.00</td>
                  </tr>
                  <tr>
                    <td
                      className="py-2 text-right font-bold text-base"
                      style={{ color: form.primaryColor }}
                    >
                      Total
                    </td>
                    <td
                      className="py-2 text-right font-bold text-base"
                      style={{ color: form.primaryColor }}
                    >
                      $575.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mock footer */}
            <div className="mt-6 pt-3 border-t-2 border-gray-200 flex justify-between text-xs text-gray-400">
              <span>
                Generated by{" "}
                <span className="font-semibold" style={{ color: form.primaryColor }}>
                  {form.companyName || "Your Company"}
                </span>
              </span>
              <span>
                {form.fromEmail || "compliance@yourcompany.com"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
