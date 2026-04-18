"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AutoRenewalConfig {
  id: string;
  regulation: {
    id: string;
    title: string;
    trade: string;
    state: string;
  };
  enabled: boolean;
  nextRenewalAt: string;
  autoPay: boolean;
}

interface AutoRenewalStatusProps {
  configs: AutoRenewalConfig[];
}

export function AutoRenewalStatus({ configs }: AutoRenewalStatusProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  
  const enabledConfigs = configs.filter(c => c.enabled);
  const upcomingRenewals = enabledConfigs
    .filter(c => {
      const daysUntil = Math.ceil((new Date(c.nextRenewalAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30;
    })
    .sort((a, b) => new Date(a.nextRenewalAt).getTime() - new Date(b.nextRenewalAt).getTime());

  const displayConfigs = showAll ? enabledConfigs : upcomingRenewals.slice(0, 3);

  if (enabledConfigs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Auto-Renewal Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-2xl mb-2">0</div>
            <p className="text-sm text-muted-foreground">Auto-renewals enabled</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.push("/auto-renewal")}
            >
              Enable Auto-Renewal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Auto-Renewal Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{enabledConfigs.length}</div>
              <p className="text-sm text-muted-foreground">Auto-renewals active</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-600">
                {upcomingRenewals.length}
              </div>
              <p className="text-sm text-muted-foreground">Due in 30 days</p>
            </div>
          </div>

          {/* Upcoming renewals */}
          {displayConfigs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Upcoming Renewals</h4>
              {displayConfigs.map((config) => {
                const daysUntil = Math.ceil((new Date(config.nextRenewalAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const urgency = daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'high' : 'medium';
                
                return (
                  <div key={config.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{config.regulation.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.regulation.trade} · {config.regulation.state}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {config.autoPay && (
                        <Badge variant="secondary" className="text-xs">Auto-Pay</Badge>
                      )}
                      <Badge variant={
                        urgency === 'critical' ? 'destructive' :
                        urgency === 'high' ? 'warning' : 'default'
                      } className="text-xs">
                        {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show more button */}
          {enabledConfigs.length > 3 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="w-full"
            >
              Show all {enabledConfigs.length} renewals
            </Button>
          )}

          {/* Auto-renewal health indicator */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System Status</span>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-renewals processing normally
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
