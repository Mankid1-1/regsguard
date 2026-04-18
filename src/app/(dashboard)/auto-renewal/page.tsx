"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface UserRegulation {
  id: string;
  regulation: {
    id: string;
    title: string;
    trade: string;
    state: string;
    fee: string | null;
    renewalCycle: string;
  };
  autoRenewalEnabled?: boolean;
}

export default function AutoRenewalPage() {
  const { toast } = useToast();
  const [regulations, setRegulations] = useState<UserRegulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/regulations/mine").then((r) => r.ok ? r.json() : []),
      fetch("/api/auto-renewal").then((r) => r.ok ? r.json() : { configs: [] }),
    ])
      .then(([userRegs, status]) => {
        const enabledIds = new Set<string>(
          (status.configs ?? [])
            .filter((c: { enabled: boolean; regulationId: string }) => c.enabled)
            .map((c: { regulationId: string }) => c.regulationId)
        );
        setRegulations(
          (userRegs ?? []).map((ur: UserRegulation) => ({
            ...ur,
            autoRenewalEnabled: enabledIds.has(ur.regulation.id),
          }))
        );
      })
      .catch(() => toast("Failed to load regulations", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function enable(regulationId: string) {
    setEnabling(regulationId);
    try {
      const res = await fetch("/api/auto-renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulationId, autoPay: false }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to enable");
      }
      toast("Auto-renewal enabled", "success");
      setRegulations((prev) =>
        prev.map((r) =>
          r.regulation.id === regulationId ? { ...r, autoRenewalEnabled: true } : r
        )
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setEnabling(null);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <p className="text-muted-foreground">Loading your regulations…</p>
      </div>
    );
  }

  if (regulations.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2">Auto-Renewal</h1>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have any tracked regulations yet. Add some in Regulations
          first, then come back to enable auto-renewal.
        </p>
        <Button onClick={() => (window.location.href = "/regulations")}>
          Go to Regulations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Auto-Renewal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enable auto-renewal on any regulation you track. We&apos;ll file the renewal
          paperwork on your behalf as the deadline approaches.
        </p>
      </header>

      <div className="space-y-3">
        {regulations.map((ur) => (
          <Card key={ur.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{ur.regulation.title}</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{ur.regulation.trade}</Badge>
                    <span>{ur.regulation.state}</span>
                    <span>·</span>
                    <span>{ur.regulation.renewalCycle.toLowerCase()}</span>
                    {ur.regulation.fee && (
                      <>
                        <span>·</span>
                        <span>{ur.regulation.fee}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {ur.autoRenewalEnabled ? (
                    <Badge>Auto-renewal on</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={enabling === ur.regulation.id}
                      onClick={() => enable(ur.regulation.id)}
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pt-0">
              We&apos;ll send a renewal reminder 90, 60, 30, 14, 7, and 1 day before the
              deadline, then attempt to file automatically if auto-pay is enabled.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
