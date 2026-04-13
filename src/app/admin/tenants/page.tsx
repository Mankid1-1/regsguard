"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  supportEmail: string | null;
  fromEmail: string | null;
  fromName: string | null;
  active: boolean;
  _count?: { users: number };
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  domain: "",
  logoUrl: "",
  primaryColor: "#1e40af",
  supportEmail: "",
  fromEmail: "",
  fromName: "",
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/tenants");
    if (res.ok) setTenants(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(t: Tenant) {
    setEditing(t);
    setForm({
      name: t.name,
      slug: t.slug,
      domain: t.domain ?? "",
      logoUrl: t.logoUrl ?? "",
      primaryColor: t.primaryColor,
      supportEmail: t.supportEmail ?? "",
      fromEmail: t.fromEmail ?? "",
      fromName: t.fromName ?? "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      domain: form.domain || null,
      logoUrl: form.logoUrl || null,
      primaryColor: form.primaryColor,
      supportEmail: form.supportEmail || null,
      fromEmail: form.fromEmail || null,
      fromName: form.fromName || null,
    };

    const url = editing
      ? `/api/admin/tenants/${editing.id}`
      : "/api/admin/tenants";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
    } else {
      setShowForm(false);
      load();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tenant? This cannot be undone.")) return;
    await fetch(`/api/admin/tenants/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleActive(t: Tenant) {
    await fetch(`/api/admin/tenants/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !t.active }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">White-Label Tenants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage branding for each white-label client
          </p>
        </div>
        <Button onClick={openCreate}>+ New Tenant</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : tenants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tenants yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tenants.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {t.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.logoUrl}
                        alt={t.name}
                        className="h-10 w-10 rounded-lg object-contain"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: t.primaryColor }}
                      >
                        {t.name
                          .split(/\s+/)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">
                        /{t.slug}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.active
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {t.domain && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Domain:</span>{" "}
                    {t.domain}
                  </p>
                )}
                {t.fromEmail && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">From:</span>{" "}
                    {t.fromName ? `${t.fromName} <${t.fromEmail}>` : t.fromEmail}
                  </p>
                )}
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Users:</span>{" "}
                  {t._count?.users ?? 0}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="h-4 w-4 rounded border border-border"
                    style={{ backgroundColor: t.primaryColor }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {t.primaryColor}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(t)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleActive(t)}
                  >
                    {t.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editing ? "Edit Tenant" : "Create Tenant"}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Input
                label="Brand Name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Acme Compliance"
              />
              {!editing && (
                <Input
                  label="Slug * (lowercase, no spaces)"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    }))
                  }
                  placeholder="acme"
                />
              )}
              <Input
                label="Custom Domain (optional)"
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                placeholder="app.acmecompliance.com"
              />
              <Input
                label="Logo URL (optional)"
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://acme.com/logo.png"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    label="Primary Color"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, primaryColor: e.target.value }))
                    }
                    placeholder="#1e40af"
                  />
                </div>
                <div
                  className="h-10 w-10 rounded-lg border border-border mt-5 shrink-0"
                  style={{ backgroundColor: form.primaryColor }}
                />
              </div>
              <Input
                label="From Name (emails)"
                value={form.fromName}
                onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
                placeholder="Acme Compliance"
              />
              <Input
                label="From Email"
                type="email"
                value={form.fromEmail}
                onChange={(e) => setForm((f) => ({ ...f, fromEmail: e.target.value }))}
                placeholder="noreply@acmecompliance.com"
              />
              <Input
                label="Support Email"
                type="email"
                value={form.supportEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, supportEmail: e.target.value }))
                }
                placeholder="support@acmecompliance.com"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>
                {editing ? "Save Changes" : "Create Tenant"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
