"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Deadline {
  id: string;
  nextDueDate: string;
  status: string;
  regulation: {
    id: string;
    title: string;
    trade: string;
    state: string;
  };
}

interface ComplianceInsightsProps {
  deadlines: Deadline[];
  autoRenewalCount: number;
  totalRegulations: number;
}

export function ComplianceInsights({ deadlines, autoRenewalCount, totalRegulations }: ComplianceInsightsProps) {
  const router = useRouter();
  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const criticalDeadlines = deadlines.filter(d => 
    d.status !== 'COMPLETED' && 
    d.status !== 'SKIPPED' && 
    new Date(d.nextDueDate) <= now
  );
  
  const upcomingDeadlines = deadlines.filter(d => 
    d.status !== 'COMPLETED' && 
    d.status !== 'SKIPPED' && 
    new Date(d.nextDueDate) > now && 
    new Date(d.nextDueDate) <= thirtyDaysOut
  );

  const complianceRate = totalRegulations > 0 
    ? Math.round((deadlines.filter(d => d.status === 'COMPLETED').length / totalRegulations) * 100)
    : 0;

  const autoRenewalCoverage = totalRegulations > 0 
    ? Math.round((autoRenewalCount / totalRegulations) * 100)
    : 0;

  const insights = [
    {
      title: "Critical Issues",
      value: criticalDeadlines.length,
      description: "Require immediate attention",
      type: "critical",
      action: criticalDeadlines.length > 0 ? "Review Now" : null,
      href: "/regulations?filter=overdue",
    },
    {
      title: "Upcoming Deadlines",
      value: upcomingDeadlines.length,
      description: "Due within 30 days",
      type: "warning",
      action: upcomingDeadlines.length > 0 ? "Plan Ahead" : null,
      href: "/regulations?filter=upcoming",
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      description: "Deadlines completed",
      type: complianceRate >= 80 ? "success" : complianceRate >= 60 ? "warning" : "critical",
      action: complianceRate < 80 ? "Improve" : null,
      href: "/regulations",
    },
    {
      title: "Auto-Renewal Coverage",
      value: `${autoRenewalCoverage}%`,
      description: "Automated renewals",
      type: autoRenewalCoverage >= 70 ? "success" : autoRenewalCoverage >= 40 ? "warning" : "info",
      action: autoRenewalCoverage < 70 ? "Enable More" : null,
      href: "/auto-renewal",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive' as const;
      case 'warning': return 'warning' as const;
      case 'success': return 'default' as const;
      case 'info': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Compliance Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {insights.map((insight) => (
            <div key={insight.title} className="text-center">
              <div className={`text-2xl font-bold rounded-lg p-2 ${getTypeColor(insight.type)}`}>
                {insight.value}
              </div>
              <h4 className="text-sm font-medium mt-2">{insight.title}</h4>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
              {insight.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push(insight.href)}
                >
                  {insight.action}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Recommendations</h4>
          <div className="space-y-2">
            {criticalDeadlines.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm text-red-800">
                  Address {criticalDeadlines.length} critical deadline{criticalDeadlines.length > 1 ? 's' : ''} immediately
                </span>
              </div>
            )}
            
            {autoRenewalCoverage < 70 && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-blue-800">
                  Enable auto-renewal for more regulations to reduce manual work
                </span>
              </div>
            )}
            
            {complianceRate < 80 && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm text-orange-800">
                  Focus on completing overdue deadlines to improve compliance rate
                </span>
              </div>
            )}
            
            {criticalDeadlines.length === 0 && autoRenewalCoverage >= 70 && complianceRate >= 80 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-800">
                  Great job! Your compliance is well-managed
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
