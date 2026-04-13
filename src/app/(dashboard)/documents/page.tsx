"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface Doc {
  id: string;
  templateSlug: string;
  category: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; companyName: string | null } | null;
  project: { id: string; name: string } | null;
}

const CAT_LABELS: Record<string, string> = {
  TAX: "Tax", PERMIT: "Permit", LIEN_WAIVER: "Lien Waiver", INSURANCE: "Insurance",
  CONTRACT: "Contract", CHANGE_ORDER: "Change Order", INVOICE: "Invoice",
  SAFETY: "Safety", COMPLIANCE: "Compliance", PROPOSAL: "Proposal",
  CERTIFICATE: "Certificate", OTHER: "Other",
};

const STATUS_BADGE: Record<string, { variant: "default" | "success" | "warning" | "outline"; label: string }> = {
  DRAFT: { variant: "outline", label: "Draft" },
  GENERATED: { variant: "default", label: "Generated" },
  SENT: { variant: "success", label: "Sent" },
  SIGNED: { variant: "success", label: "Signed" },
  FILED: { variant: "success", label: "Filed" },
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [generating, setGenerating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/documents");
    if (res.ok) {
      const json = await res.json();
      setDocs(json.data ?? json);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "ALL" ? docs : docs.filter((d) => d.category === filter);

  const categories = ["ALL", ...Array.from(new Set(docs.map((d) => d.category)))];

  async function handleGeneratePdf(id: string) {
    setGenerating(id);
    try {
      const res = await fetch(`/api/documents/${id}/pdf`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disp = res.headers.get("Content-Disposition");
      a.download = disp?.match(/filename="(.+)"/)?.[1] ?? "document.pdf";
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      toast("PDF downloaded.", "success");
      load(); // refresh status
    } catch {
      toast("PDF generation failed.", "error");
    }
    setGenerating(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your generated paperwork &mdash; W-9s, lien waivers, invoices, permits, and more
          </p>
        </div>
        <Link href="/documents/new">
          <Button>+ New Document</Button>
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {cat === "ALL" ? "All" : (CAT_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading...</p>
        : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-1">
              {docs.length === 0 ? "No documents yet" : "No documents in this category"}
            </p>
            <p className="text-sm mb-4">Create your first document to get started with auto-filled paperwork.</p>
            <Link href="/documents/new"><Button>Create Document</Button></Link>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => {
              const sb = STATUS_BADGE[doc.status] ?? { variant: "outline" as const, label: doc.status };
              return (
                <div key={doc.id} className="flex items-center gap-4 rounded-lg border border-border bg-background p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                      <span className="text-xs text-muted-foreground">{CAT_LABELS[doc.category] ?? doc.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {doc.client && <span>{doc.client.companyName || doc.client.name}</span>}
                      {doc.client && doc.project && <span>&middot;</span>}
                      {doc.project && <span>{doc.project.name}</span>}
                      <span>&middot;</span>
                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" loading={generating === doc.id} onClick={() => handleGeneratePdf(doc.id)}>
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(doc.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
