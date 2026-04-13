"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface Client {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  taxId: string | null;
  notes: string | null;
  _count?: { projects: number; documents: number };
}

const EMPTY = { name: "", companyName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", taxId: "", notes: "" };

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/clients");
    if (res.ok) setClients(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name, companyName: c.companyName ?? "", email: c.email ?? "",
      phone: c.phone ?? "", address: c.address ?? "", city: c.city ?? "",
      state: c.state ?? "", zip: c.zip ?? "", taxId: c.taxId ?? "", notes: c.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast("Name is required.", "error"); return; }
    setSaving(true);
    const url = "/api/clients";
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); load(); toast(editing ? "Client updated." : "Client added.", "success"); }
    else { const d = await res.json(); toast(d.error || "Failed", "error"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    load();
  }

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">GCs, property owners, and customers you work with</p>
        </div>
        <Button onClick={openCreate}>+ Add Client</Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p>
        : clients.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-1">No clients yet</p>
            <p className="text-sm">Add your first client to start auto-filling paperwork.</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  {c.companyName && <p className="text-xs text-muted-foreground">{c.companyName}</p>}
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {c.email && <p className="text-muted-foreground">{c.email}</p>}
                  {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
                  {c.city && c.state && <p className="text-muted-foreground">{c.city}, {c.state} {c.zip}</p>}
                  <div className="flex gap-2 pt-2 text-xs text-muted-foreground">
                    <span>{c._count?.projects ?? 0} projects</span>
                    <span>&middot;</span>
                    <span>{c._count?.documents ?? 0} docs</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(c)}>Edit</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? "Edit Client" : "Add Client"}</h2>
            <div className="space-y-3">
              <Input label="Contact Name *" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <Input label="Company Name" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <Input label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
                <Input label="State" value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} maxLength={2} />
                <Input label="ZIP" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
              </div>
              <Input label="Tax ID (EIN/SSN)" value={form.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="XX-XXXXXXX" />
              <Input label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>{editing ? "Save" : "Add Client"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
