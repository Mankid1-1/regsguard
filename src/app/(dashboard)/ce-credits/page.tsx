"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CECreditForm } from "@/components/ce-credits/ce-credit-form";
import { CECreditList } from "@/components/ce-credits/ce-credit-list";

interface Regulation {
  id: string;
  title: string;
  trade: string;
  state: string;
  category: string;
}

interface CECredit {
  id: string;
  courseName: string;
  provider: string | null;
  hours: number;
  completedAt: string;
  regulationId: string | null;
  certificateUrl: string | null;
  notes: string | null;
  regulation: Regulation | null;
}

export default function CECreditsPage() {
  const [credits, setCredits] = useState<CECredit[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCredit, setEditingCredit] = useState<CECredit | null>(null);

  const loadCredits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ce-credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.data ?? data.credits);
      }
    } catch {
      // handled by empty state
    }
    setLoading(false);
  }, []);

  const loadRegulations = useCallback(async () => {
    try {
      const res = await fetch("/api/regulations");
      if (res.ok) {
        const data = await res.json();
        setRegulations(data);
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    loadCredits();
    loadRegulations();
  }, [loadCredits, loadRegulations]);

  // Stats
  const totalHours = credits.reduce((sum, c) => sum + c.hours, 0);
  const currentYear = new Date().getFullYear();
  const thisYearHours = credits
    .filter((c) => new Date(c.completedAt).getFullYear() === currentYear)
    .reduce((sum, c) => sum + c.hours, 0);

  // Credits by trade
  const tradeMap = new Map<string, number>();
  for (const c of credits) {
    const trade = c.regulation?.trade || "General";
    tradeMap.set(trade, (tradeMap.get(trade) || 0) + c.hours);
  }
  const creditsByTrade = Array.from(tradeMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  function handleEdit(credit: CECredit) {
    setEditingCredit(credit);
    setShowForm(true);
  }

  function handleSave() {
    setShowForm(false);
    setEditingCredit(null);
    loadCredits();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingCredit(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CE Credits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your continuing education hours and certificates.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCredit(null);
            setShowForm(true);
          }}
        >
          + Add CE Credit
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <Card className="border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Hours
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-600">
                  {totalHours}
                </p>
              </div>
              <div className="rounded-full p-3 bg-blue-50">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  This Year
                </p>
                <p className="mt-1 text-3xl font-bold text-green-600">
                  {thisYearHours}
                </p>
              </div>
              <div className="rounded-full p-3 bg-green-50">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Certificates
                </p>
                <p className="mt-1 text-3xl font-bold text-purple-600">
                  {credits.filter((c) => c.certificateUrl).length}
                </p>
              </div>
              <div className="rounded-full p-3 bg-purple-50">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200">
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                By Trade
              </p>
              {creditsByTrade.length > 0 ? (
                <div className="space-y-1">
                  {creditsByTrade.slice(0, 3).map(([trade, hours]) => (
                    <div
                      key={trade}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground truncate">
                        {trade.replace(/_/g, " ")}
                      </span>
                      <span className="font-semibold text-amber-600">
                        {hours}h
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No credits yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editingCredit ? "Edit CE Credit" : "Add CE Credit"}
            </h2>
            <CECreditForm
              credit={
                editingCredit
                  ? {
                      id: editingCredit.id,
                      courseName: editingCredit.courseName,
                      provider: editingCredit.provider,
                      hours: editingCredit.hours,
                      completedAt: editingCredit.completedAt,
                      regulationId: editingCredit.regulationId,
                      certificateUrl: editingCredit.certificateUrl,
                      notes: editingCredit.notes,
                    }
                  : undefined
              }
              regulations={regulations.map((r) => ({
                id: r.id,
                title: r.title,
                trade: r.trade,
                state: r.state,
              }))}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Credits list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <CECreditList
          credits={credits}
          onDelete={loadCredits}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
