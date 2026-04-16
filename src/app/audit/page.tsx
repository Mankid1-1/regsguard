"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { TRADES, STATES } from "@/lib/utils/constants";
import type { TradeValue, StateValue } from "@/lib/utils/constants";

interface AuditResult {
  email: string;
  state: string;
  trade: string;
  auditScore: number;
  status: "complete" | "incomplete";
  missingItems: string[];
  recommendations: string[];
  nextSteps: string[];
}

export default function ComplianceAuditPage() {
  const { toast } = useToast();

  const [step, setStep] = useState<"form" | "results">("form");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    state: "MN",
    trade: "PLUMBING",
    licenseNumber: "",
  });

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/compliance-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Audit failed");
      }

      const data = (await res.json()) as AuditResult;
      setResult(data);
      setStep("results");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Audit failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  const tradeLabel = (value: string) =>
    TRADES.find((t) => t.value === value)?.label ?? value;

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Free Compliance Audit
          </h1>
          <p className="text-lg text-gray-600">
            See what's missing from your compliance setup. No signup required.
          </p>
        </div>

        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Check Your Compliance Status</CardTitle>
              <CardDescription>
                Available for Minnesota and Wisconsin contractors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAudit} className="space-y-5">
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@company.com"
                  required
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value as StateValue })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MN">Minnesota (MN)</option>
                      <option value="WI">Wisconsin (WI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Trade
                    </label>
                    <select
                      value={formData.trade}
                      onChange={(e) =>
                        setFormData({ ...formData, trade: e.target.value as TradeValue })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TRADES.map((trade) => (
                        <option key={trade.value} value={trade.value}>
                          {trade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  id="licenseNumber"
                  label="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  placeholder="e.g., PL123456"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Run Free Audit
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Your data is only used for this audit. We won't contact you unless you sign up.
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "results" && result && (
          <div className="space-y-6">
            {/* Score Card */}
            <Card>
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <div className="mb-3 inline-block">
                    <div
                      className={`text-6xl font-bold ${scoreColor(
                        result.auditScore
                      )}`}
                    >
                      {result.auditScore}
                    </div>
                    <div className="text-sm text-gray-600">/ 100</div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mt-4">
                    {result.status === "complete"
                      ? "You're Fully Compliant!"
                      : "Compliance Gaps Detected"}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {result.trade} License in {result.state}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Missing Items */}
            {result.missingItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Missing or Incomplete</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.missingItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {result.nextSteps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-semibold text-blue-600 shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={() => setStep("form")}>
                Run Another Audit
              </Button>
              <Link href="/signup" className="w-full">
                <Button className="w-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
