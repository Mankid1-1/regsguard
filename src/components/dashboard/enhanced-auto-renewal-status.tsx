"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RenewalStrategy {
  type: 'standard' | 'early_bird' | 'last_minute' | 'batch' | 'opportunistic';
  reason: string;
  expectedSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface RenewalConfig {
  id: string;
  regulation: {
    id: string;
    title: string;
    trade: string;
    state: string;
  };
  enabled: boolean;
  nextRenewalAt: string;
  strategy?: RenewalStrategy;
  timing?: {
    optimalDate: string;
    confidence: number;
    factors: string[];
  };
}

interface EnhancedAutoRenewalStatusProps {
  configs: RenewalConfig[];
}

export function EnhancedAutoRenewalStatus({ configs }: EnhancedAutoRenewalStatusProps) {
  const [showAll, setShowAll] = useState(false);
  const [strategies, setStrategies] = useState<Record<string, number>>({});
  
  const enabledConfigs = configs.filter(c => c.enabled);
  const upcomingRenewals = enabledConfigs
    .filter(c => {
      const daysUntil = Math.ceil((new Date(c.nextRenewalAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30;
    })
    .sort((a, b) => new Date(a.nextRenewalAt).getTime() - new Date(b.nextRenewalAt).getTime());

  const displayConfigs = showAll ? enabledConfigs : upcomingRenewals.slice(0, 3);

  // Calculate strategy distribution
  useEffect(() => {
    const strategyCount: Record<string, number> = {};
    enabledConfigs.forEach(config => {
      if (config.strategy) {
        const key = config.strategy.type;
        strategyCount[key] = (strategyCount[key] || 0) + 1;
      }
    });
    setStrategies(strategyCount);
  }, [enabledConfigs]);

  const getStrategyColor = (type: string) => {
    switch (type) {
      case 'early_bird': return 'bg-green-100 text-green-800';
      case 'batch': return 'bg-blue-100 text-blue-800';
      case 'opportunistic': return 'bg-purple-100 text-purple-800';
      case 'last_minute': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrategyLabel = (type: string) => {
    switch (type) {
      case 'early_bird': return 'Early Bird';
      case 'batch': return 'Batch';
      case 'opportunistic': return 'Opportunistic';
      case 'last_minute': return 'Last Minute';
      default: return 'Standard';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalSavings = enabledConfigs.reduce((sum, config) => 
    sum + (config.strategy?.expectedSavings || 0), 0
  );

  if (enabledConfigs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intelligent Auto-Renewal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-2xl mb-2">0</div>
            <p className="text-sm text-muted-foreground">Auto-renewals enabled</p>
            <Button variant="outline" size="sm" className="mt-3">
              Enable Intelligent Auto-Renewal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Intelligent Auto-Renewal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{enabledConfigs.length}</div>
              <p className="text-sm text-muted-foreground">Smart renewals active</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-600">
                ${totalSavings}
              </div>
              <p className="text-sm text-muted-foreground">Total projected savings</p>
            </div>
          </div>

          {/* Strategy Distribution */}
          {Object.keys(strategies).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Renewal Strategies</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(strategies).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className={getStrategyColor(type)}>
                    {getStrategyLabel(type)} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming renewals with intelligent insights */}
          {displayConfigs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Upcoming Smart Renewals</h4>
              {displayConfigs.map((config) => {
                const daysUntil = Math.ceil((new Date(config.nextRenewalAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const urgency = daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'high' : 'medium';
                
                return (
                  <div key={config.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{config.regulation.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {config.regulation.trade} · {config.regulation.state}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.strategy && (
                          <Badge variant="secondary" className={getStrategyColor(config.strategy.type)}>
                            {getStrategyLabel(config.strategy.type)}
                          </Badge>
                        )}
                        <Badge variant={
                          urgency === 'critical' ? 'destructive' :
                          urgency === 'high' ? 'warning' : 'default'
                        } className="text-xs">
                          {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
                        </Badge>
                      </div>
                    </div>

                    {/* Strategy insights */}
                    {config.strategy && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">Strategy:</span>
                          <span>{config.strategy.reason}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">Expected Savings:</span>
                          <span className="text-green-600">${config.strategy.expectedSavings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Risk Level:</span>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getRiskColor(config.strategy.riskLevel)}`} />
                            <span>{config.strategy.riskLevel}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timing insights */}
                    {config.timing && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">Optimal Date:</span>
                          <span>{new Date(config.timing.optimalDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">Confidence:</span>
                          <span>{config.timing.confidence}%</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="font-medium">Factors:</span>
                          <div className="flex flex-wrap gap-1">
                            {config.timing.factors.slice(0, 2).map((factor, i) => (
                              <span key={i} className="bg-white px-1 rounded text-xs">
                                {factor}
                              </span>
                            ))}
                            {config.timing.factors.length > 2 && (
                              <span className="text-muted-foreground">+{config.timing.factors.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
              Show all {enabledConfigs.length} smart renewals
            </Button>
          )}

          {/* System intelligence status */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Intelligence System</span>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Using built-in algorithms for optimal renewal strategies
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
