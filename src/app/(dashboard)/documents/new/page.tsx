"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface TemplateInfo {
  slug: string;
  name: string;
  category: string;
  description: string;
  fields: { key: string; label: string; type: string; required: boolean; autoFillFrom?: string; options?: { label: string; value: string }[]; placeholder?: string; section?: string }[];
}

interface ClientOption { id: string; name: string; companyName: string | null; }
interface ProjectOption { id: string; name: string; }

const CAT_LABELS: Record<string, string> = {
  TAX: "Tax", PERMIT: "Permit", LIEN_WAIVER: "Lien Waiver", INSURANCE: "Insurance",
  CONTRACT: "Contract", CHANGE_ORDER: "Change Order", INVOICE: "Invoice",
  PROPOSAL: "Proposal", CERTIFICATE: "Certificate", OTHER: "Other",
};

export default function NewDocumentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selected, setSelected] = useState<TemplateInfo | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState("ALL");

  useEffect(() => {
    // Fetch templates from a static endpoint we create, or import client-side
    // We'll use a simple API that returns template metadata
    fetch("/api/documents/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {});
    Promise.all([fetch("/api/clients"), fetch("/api/projects")])
      .then(async ([cRes, pRes]) => {
        if (cRes.ok) setClients(await cRes.json());
        if (pRes.ok) setProjects(await pRes.json());
      });
  }, []);

  function selectTemplate(t: TemplateInfo) {
    setSelected(t);
    setTitle(t.name);
    setFormData({});
    // Auto-fill immediately from profile
    const params = new URLSearchParams({ templateSlug: t.slug });
    fetch(`/api/documents/autofill?${params.toString()}`)
      .then((r) => r.ok ? r.json() : null)
      .then((filled) => { if (filled) setFormData(filled); })
      .catch(() => {});
  }

  function setField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAutoFill() {
    try {
      const params = new URLSearchParams({ templateSlug: selected!.slug });
      if (clientId) params.set("clientId", clientId);
      if (projectId) params.set("projectId", projectId);
      const res = await fetch(`/api/documents/autofill?${params.toString()}`);
      if (res.ok) {
        const filled = await res.json();
        setFormData((prev) => ({ ...prev, ...filled }));
        toast("Fields auto-filled from your profile.", "success");
      }
    } catch {
      toast("Auto-fill failed.", "error");
    }
  }

  async function handleCreate() {
    if (!selected || !title.trim()) { toast("Select a template and enter a title.", "error"); return; }
    setSaving(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateSlug: selected.slug,
        title,
        clientId: clientId || null,
        projectId: projectId || null,
        data: formData,
      }),
    });
    if (res.ok) {
      toast("Document created.", "success");
      router.push("/documents");
    } else {
      const d = await res.json();
      toast(d.error || "Failed to create.", "error");
    }
    setSaving(false);
  }

  // Template selection step
  if (!selected) {
    const cats = ["ALL", ...Array.from(new Set(templates.map((t) => t.category)))];
    const shown = catFilter === "ALL" ? templates : templates.filter((t) => t.category === catFilter);

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Document</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a template to create auto-filled paperwork</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {cats.map((cat) => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${catFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
              {cat === "ALL" ? "All Templates" : (CAT_LABELS[cat] ?? cat)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <button key={t.slug} onClick={() => selectTemplate(t)}
              className="rounded-xl border-2 border-border p-5 text-left transition-colors hover:border-primary hover:bg-primary/5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm">{t.name}</h3>
                <Badge variant="outline">{CAT_LABELS[t.category] ?? t.category}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Form fill step
  const sections = new Map<string, typeof selected.fields>();
  for (const field of selected.fields) {
    const sec = field.section || "Details";
    if (!sections.has(sec)) sections.set(sec, []);
    sections.get(sec)!.push(field);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline mb-1 block">&larr; Back to templates</button>
          <h1 className="text-2xl font-bold">{selected.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
        </div>
      </div>

      {/* Title + Client/Project selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input label="Document Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Client</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">None</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName || c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Project</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleAutoFill}>Auto-Fill from Profile</Button>
        </CardContent>
      </Card>

      {/* Dynamic fields by section */}
      {Array.from(sections.entries()).map(([section, fields]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle className="text-base">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((f) => {
              if (f.type === "select" && f.options) {
                return (
                  <div key={f.key}>
                    <label className="mb-1 block text-sm font-medium">{f.label}{f.required && " *"}</label>
                    <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={formData[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)}>
                      <option value="">Select...</option>
                      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                );
              }
              if (f.type === "textarea") {
                return (
                  <div key={f.key}>
                    <label className="mb-1 block text-sm font-medium">{f.label}{f.required && " *"}</label>
                    <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]" value={formData[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)} placeholder={f.placeholder} />
                  </div>
                );
              }
              if (f.type === "checkbox") {
                return (
                  <label key={f.key} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-border" checked={formData[f.key] === "true"} onChange={(e) => setField(f.key, e.target.checked ? "true" : "false")} />
                    <span className="text-sm">{f.label}</span>
                  </label>
                );
              }
              return (
                <Input key={f.key} label={`${f.label}${f.required ? " *" : ""}`}
                  type={f.type === "date" ? "date" : f.type === "number" || f.type === "currency" ? "number" : "text"}
                  value={formData[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder} />
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
        <Button className="flex-1" loading={saving} onClick={handleCreate}>Create &amp; Save</Button>
      </div>
    </div>
  );
}
