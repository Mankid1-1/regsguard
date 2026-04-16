"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BusinessInsight {
  metric: string;
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  benchmark: number;
  industry: number;
  insights: string[];
  recommendations: string[];
}

interface IntelligentInsightsProps {
  userId: string;
}

export function IntelligentInsights({ userId }: IntelligentInsightsProps) {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  async function fetchInsights() {
    try {
      setLoading(true);
      const response = await fetch('/api/intelligent-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'insights' }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'trending_up';
      case 'declining':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceColor = (value: number, benchmark: number) => {
    if (value >= benchmark) return 'text-green-600';
    if (value >= benchmark * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intelligent Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Analyzing compliance patterns...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intelligent Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load insights</p>
            <Button onClick={fetchInsights} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Intelligent Compliance Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{insight.metric}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getPerformanceColor(insight.value, insight.benchmark)}`}>
                    {insight.value}%
                  </span>
                  <div className={`flex items-center ${getTrendColor(insight.trend)}`}>
                    <span className="text-sm">{getTrendIcon(insight.trend)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Your Performance</span>
                    <span>{insight.value}% vs {insight.benchmark}% target</span>
                  </div>
                  <Progress value={insight.value} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Industry Average: </span>
                    <span className="font-medium">{insight.industry}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Benchmark: </span>
                    <span className="font-medium">{insight.benchmark}%</span>
                  </div>
                </div>

                {insight.insights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Insights</h4>
                    <ul className="space-y-1">
                      {insight.insights.map((insightText, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {insightText}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Powered by intelligent compliance analysis
            </div>
            <Button variant="outline" size="sm" onClick={fetchInsights}>
              Refresh Insights
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
