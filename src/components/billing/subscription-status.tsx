"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SubscriptionStatusProps {
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: string;
}

export function SubscriptionStatus({ status, currentPeriodEnd, cancelAtPeriodEnd, plan }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "text-success",
    TRIALING: "text-primary",
    PAST_DUE: "text-warning",
    CANCELED: "text-destructive",
    INCOMPLETE: "text-muted-foreground",
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "Active",
    TRIALING: "Trial",
    PAST_DUE: "Past Due",
    CANCELED: "Canceled",
    INCOMPLETE: "Incomplete",
  };

  return (
    <div className="rounded-xl border border-border p-6">
      <h3 className="mb-4 text-lg font-semibold">Your Subscription</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium">{plan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className={`font-medium ${statusColors[status] || ""}`}>
            {statusLabels[status] || status}
          </span>
        </div>
        {currentPeriodEnd && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {cancelAtPeriodEnd ? "Expires" : "Renews"}
            </span>
            <span>{new Date(currentPeriodEnd).toLocaleDateString()}</span>
          </div>
        )}
        {cancelAtPeriodEnd && (
          <p className="text-sm text-warning">
            Your subscription will end at the current period. You can reactivate anytime.
          </p>
        )}
      </div>
      <Button className="mt-4 w-full" variant="outline" loading={loading} onClick={handleManage}>
        Manage Subscription
      </Button>
    </div>
  );
}
