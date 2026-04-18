"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface ProfileData {
  businessName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  responsiblePerson: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiration: string;
  bondAmount: string;
  bondProvider: string;
  bondExpiration: string;
  logoUrl: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  brandFooter: string;
}

const EMPTY: ProfileData = {
  businessName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  responsiblePerson: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insuranceExpiration: "",
  bondAmount: "",
  bondProvider: "",
  bondExpiration: "",
  logoUrl: "",
  brandPrimaryColor: "",
  brandSecondaryColor: "",
  brandFooter: "",
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setProfile({
            businessName: data.businessName ?? "",
            address: data.address ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            zip: data.zip ?? "",
            phone: data.phone ?? "",
            email: data.email ?? "",
            responsiblePerson: data.responsiblePerson ?? "",
            insuranceProvider: data.insuranceProvider ?? "",
            insurancePolicyNumber: data.insurancePolicyNumber ?? "",
            insuranceExpiration: data.insuranceExpiration
              ? data.insuranceExpiration.split("T")[0]
              : "",
            bondAmount: data.bondAmount ?? "",
            bondProvider: data.bondProvider ?? "",
            bondExpiration: data.bondExpiration
              ? data.bondExpiration.split("T")[0]
              : "",
            logoUrl: data.logoUrl ?? "",
            brandPrimaryColor: data.brandPrimaryColor ?? "",
            brandSecondaryColor: data.brandSecondaryColor ?? "",
            brandFooter: data.brandFooter ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const upload = await res.json();
      const logoUrl = `/api/files/${upload.id}`;
      set("logoUrl", logoUrl);
      toast("Logo uploaded. Save to apply.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Logo upload failed", "error");
    }
  }

  function set(field: keyof ProfileData, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate(): boolean {
    const required: (keyof ProfileData)[] = [
      "businessName", "address", "city", "state", "zip",
      "phone", "email", "responsiblePerson",
    ];
    const next: Partial<ProfileData> = {};
    for (const f of required) {
      if (!profile[f]?.trim()) next[f] = "Required";
    }
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      next.email = "Invalid email";
    }
    if (profile.zip && !/^\d{5}(-\d{4})?$/.test(profile.zip)) {
      next.zip = "Invalid ZIP";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) { toast("Please fix the errors below.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      toast("Profile saved.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This information auto-fills your compliance PDFs and submissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Required for all compliance documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Business Name *"
            value={profile.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            error={errors.businessName}
          />
          <Input
            label="Responsible Person *"
            value={profile.responsiblePerson}
            onChange={(e) => set("responsiblePerson", e.target.value)}
            error={errors.responsiblePerson}
            placeholder="Full name of the license holder"
          />
          <Input
            label="Address *"
            value={profile.address}
            onChange={(e) => set("address", e.target.value)}
            error={errors.address}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input
              label="City *"
              value={profile.city}
              onChange={(e) => set("city", e.target.value)}
              error={errors.city}
            />
            <Input
              label="State *"
              value={profile.state}
              onChange={(e) => set("state", e.target.value.toUpperCase())}
              error={errors.state}
              maxLength={2}
              placeholder="MN"
            />
            <Input
              label="ZIP *"
              value={profile.zip}
              onChange={(e) => set("zip", e.target.value)}
              error={errors.zip}
              placeholder="55401"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Phone *"
              type="tel"
              value={profile.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={errors.phone}
              placeholder="(612) 555-1234"
            />
            <Input
              label="Business Email *"
              type="email"
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance &amp; Bonding</CardTitle>
          <CardDescription>Optional — pre-fills insurance sections on forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Insurance Provider"
              value={profile.insuranceProvider}
              onChange={(e) => set("insuranceProvider", e.target.value)}
            />
            <Input
              label="Policy Number"
              value={profile.insurancePolicyNumber}
              onChange={(e) => set("insurancePolicyNumber", e.target.value)}
            />
          </div>
          <Input
            label="Insurance Expiration"
            type="date"
            value={profile.insuranceExpiration}
            onChange={(e) => set("insuranceExpiration", e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Bond Provider"
              value={profile.bondProvider}
              onChange={(e) => set("bondProvider", e.target.value)}
            />
            <Input
              label="Bond Amount"
              value={profile.bondAmount}
              onChange={(e) => set("bondAmount", e.target.value)}
              placeholder="$25,000"
            />
          </div>
          <Input
            label="Bond Expiration"
            type="date"
            value={profile.bondExpiration}
            onChange={(e) => set("bondExpiration", e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDF Branding</CardTitle>
          <CardDescription>
            Optional — upload your logo and pick brand colors. They appear on every PDF you generate. Leave blank to use RegsGuard defaults.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo</label>
            <div className="flex items-center gap-4">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="Logo preview"
                  className="h-16 w-auto max-w-48 rounded border border-border bg-white object-contain p-1"
                />
              ) : (
                <div className="h-16 w-32 rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  No logo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleLogoUpload(f);
                  }}
                />
                {profile.logoUrl && (
                  <button
                    type="button"
                    className="text-xs text-destructive text-left hover:underline"
                    onClick={() => set("logoUrl", "")}
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, or SVG. Max 10MB. Best at 300×100 with transparent background.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandPrimaryColor || "#1e40af"}
                  onChange={(e) => set("brandPrimaryColor", e.target.value)}
                  className="h-10 w-16 rounded border border-border cursor-pointer"
                />
                <Input
                  value={profile.brandPrimaryColor}
                  onChange={(e) => set("brandPrimaryColor", e.target.value)}
                  placeholder="#1e40af"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={profile.brandSecondaryColor || "#e2e8f0"}
                  onChange={(e) => set("brandSecondaryColor", e.target.value)}
                  className="h-10 w-16 rounded border border-border cursor-pointer"
                />
                <Input
                  value={profile.brandSecondaryColor}
                  onChange={(e) => set("brandSecondaryColor", e.target.value)}
                  placeholder="#e2e8f0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">PDF Footer Text</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
              maxLength={500}
              placeholder='e.g. "Acme Plumbing · License #PM-12345 · Thank you for your business"'
              value={profile.brandFooter}
              onChange={(e) => set("brandFooter", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown at the bottom of every generated PDF. Up to 500 characters.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
