"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface Program {
  id: string;
  type: string;
  status: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string | null;
  website: string | null;
  notes: string | null;
  referralCode: string | null;
  commissionPct: number;
  discountPct: number;
  tenantId: string | null;
  tenant: { id: string; name: string; slug: string } | null;
  _count: { referrals: number };
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  WHITE_LABEL: "White-Label",
  REFERRAL: "Referral",
  ASSOCIATION: "Association",
  ENTERPRISE: "Enterprise",
};

const TYPE_COLORS: Record<string, string> = {
  WHITE_LABEL: "#1e40af",
  REFERRAL: "#059669",
  ASSOCIATION: "#7c3aed",
  ENTERPRISE: "#dc2626",
};

const STATUS_BADGE: Record<string, { variant: "default" | "success" | "warning" | "outline"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  APPROVED: { variant: "default", label: "Approved" },
  ACTIVE: { variant: "success", label: "Active" },
  SUSPENDED: { variant: "outline", label: "Suspended" },
};

export default function AdminProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Program | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/programs");
    if (res.ok) setPrograms(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string, type: string) {
    const res = await fetch(`/api/admin/programs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, type }),
    });
    if (res.ok) {
      toast(`Programme ${status.toLowerCase()}.`, "success");
      load();
      setDetail(null);
    } else {
      toast("Failed to update.", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this partner programme?")) return;
    await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
    load();
    setDetail(null);
  }

  const pending = programs.filter((p) => p.status === "PENDING");
  const active = programs.filter((p) => p.status === "ACTIVE" || p.status === "APPROVED");
  const other = programs.filter((p) => p.status === "SUSPENDED");

  function ProgramCard({ p }: { p: Program }) {
    const sb = STATUS_BADGE[p.status] ?? { variant: "outline" as const, label: p.status };
    return (
      <div
        className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setDetail(p)}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
          style={{ backgroundColor: TYPE_COLORS[p.type] ?? "#6b7280" }}
        >
          {TYPE_LABELS[p.type]?.substring(0, 2) ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{p.companyName}</p>
            <Badge variant={sb.variant}>{sb.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {TYPE_LABELS[p.type]} &middot; {p.contactName} &middot; {p.contactEmail}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          {p._count.referrals > 0 && <p>{p._count.referrals} referrals</p>}
          <p>{new Date(p.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partner Programmes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review applications, manage active partners, and track referrals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {["PENDING", "ACTIVE", "APPROVED", "SUSPENDED"].map((s) => {
          const count = programs.filter((p) => p.status === s).length;
          return (
            <Card key={s}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{STATUS_BADGE[s]?.label ?? s}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-1">No partner applications yet</p>
            <p className="text-sm">Applications from the public partner page will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Pending Applications ({pending.length})</h2>
              <div className="space-y-2">
                {pending.map((p) => <ProgramCard key={p.id} p={p} />)}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Active Partners ({active.length})</h2>
              <div className="space-y-2">
                {active.map((p) => <ProgramCard key={p.id} p={p} />)}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Suspended ({other.length})</h2>
              <div className="space-y-2">
                {other.map((p) => <ProgramCard key={p.id} p={p} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{detail.companyName}</h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant={STATUS_BADGE[detail.status]?.variant ?? "outline"}>
                    {STATUS_BADGE[detail.status]?.label ?? detail.status}
                  </Badge>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: TYPE_COLORS[detail.type] ?? "#6b7280" }}
                  >
                    {TYPE_LABELS[detail.type]}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{detail.contactName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{detail.contactEmail}</p>
                </div>
                {detail.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{detail.phone}</p>
                  </div>
                )}
                {detail.website && (
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="font-medium">{detail.website}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="font-medium">{detail.commissionPct}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Discount</p>
                  <p className="font-medium">{detail.discountPct}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referrals</p>
                  <p className="font-medium">{detail._count.referrals}</p>
                </div>
              </div>

              {detail.referralCode && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Referral Code</p>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{detail.referralCode}</code>
                </div>
              )}

              {detail.tenant && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Linked Tenant</p>
                  <p className="font-medium">{detail.tenant.name} ({detail.tenant.slug})</p>
                </div>
              )}

              {detail.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{detail.notes}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {detail.status === "PENDING" && (
                <>
                  <Button size="sm" onClick={() => updateStatus(detail.id, "ACTIVE", detail.type)}>
                    Approve &amp; Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(detail.id, "APPROVED", detail.type)}>
                    Approve
                  </Button>
                </>
              )}
              {detail.status === "APPROVED" && (
                <Button size="sm" onClick={() => updateStatus(detail.id, "ACTIVE", detail.type)}>
                  Activate
                </Button>
              )}
              {(detail.status === "ACTIVE" || detail.status === "APPROVED") && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(detail.id, "SUSPENDED", detail.type)}>
                  Suspend
                </Button>
              )}
              {detail.status === "SUSPENDED" && (
                <Button size="sm" onClick={() => updateStatus(detail.id, "ACTIVE", detail.type)}>
                  Reactivate
                </Button>
              )}
              <Button size="sm" variant="outline" className="text-destructive ml-auto" onClick={() => handleDelete(detail.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
