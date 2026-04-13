"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  startDate: string | null;
  endDate: string | null;
  contractAmount: number | null;
  status: string;
  permitNumber: string | null;
  clientId: string | null;
  client: { id: string; name: string; companyName: string | null } | null;
  _count?: { documents: number };
}

interface ClientOption { id: string; name: string; companyName: string | null; }

const EMPTY = { name: "", description: "", clientId: "", address: "", city: "", state: "", zip: "", startDate: "", endDate: "", contractAmount: "", status: "ACTIVE", permitNumber: "" };

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([fetch("/api/projects"), fetch("/api/clients")]);
    if (pRes.ok) setProjects(await pRes.json());
    if (cRes.ok) setClients(await cRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? "", clientId: p.clientId ?? "",
      address: p.address ?? "", city: p.city ?? "", state: p.state ?? "", zip: p.zip ?? "",
      startDate: p.startDate ? p.startDate.split("T")[0] : "", endDate: p.endDate ? p.endDate.split("T")[0] : "",
      contractAmount: p.contractAmount?.toString() ?? "", status: p.status, permitNumber: p.permitNumber ?? "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast("Name is required.", "error"); return; }
    setSaving(true);
    const payload = {
      ...(editing && { id: editing.id }),
      name: form.name, description: form.description || null,
      clientId: form.clientId || null, address: form.address || null,
      city: form.city || null, state: form.state || null, zip: form.zip || null,
      startDate: form.startDate || null, endDate: form.endDate || null,
      contractAmount: form.contractAmount ? parseFloat(form.contractAmount) : null,
      status: form.status, permitNumber: form.permitNumber || null,
    };
    const res = await fetch("/api/projects", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { setShowForm(false); load(); toast(editing ? "Project updated." : "Project created.", "success"); }
    else { const d = await res.json(); toast(d.error || "Failed", "error"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    load();
  }

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  const statusBadge = (s: string) => {
    switch (s) {
      case "ACTIVE": return <Badge variant="success">Active</Badge>;
      case "COMPLETED": return <Badge variant="default">Completed</Badge>;
      case "DRAFT": return <Badge variant="outline">Draft</Badge>;
      case "ARCHIVED": return <Badge variant="outline">Archived</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Track jobs and link documents to specific projects</p>
        </div>
        <Button onClick={openCreate}>+ New Project</Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p>
        : projects.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-1">No projects yet</p>
            <p className="text-sm">Create a project to organize your documents by job.</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    {statusBadge(p.status)}
                  </div>
                  {p.client && <p className="text-xs text-muted-foreground">{p.client.companyName || p.client.name}</p>}
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {p.city && p.state && <p className="text-muted-foreground">{p.city}, {p.state}</p>}
                  <p className="text-muted-foreground">Contract: {fmt(p.contractAmount)}</p>
                  <div className="flex gap-2 pt-1 text-xs text-muted-foreground">
                    <span>{p._count?.documents ?? 0} documents</span>
                    {p.permitNumber && <><span>&middot;</span><span>Permit: {p.permitNumber}</span></>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>Edit</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(p.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? "Edit Project" : "New Project"}</h2>
            <div className="space-y-3">
              <Input label="Project Name *" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <div>
                <label className="mb-1 block text-sm font-medium">Client</label>
                <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
                  <option value="">No client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName || c.name}</option>)}
                </select>
              </div>
              <Input label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
              <Input label="Job Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
                <Input label="State" value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} maxLength={2} />
                <Input label="ZIP" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                <Input label="End Date" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Contract Amount ($)" type="number" value={form.contractAmount} onChange={(e) => set("contractAmount", e.target.value)} />
                <Input label="Permit Number" value={form.permitNumber} onChange={(e) => set("permitNumber", e.target.value)} />
              </div>
              {editing && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>{editing ? "Save" : "Create Project"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
