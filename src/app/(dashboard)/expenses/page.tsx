"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QuickExpense } from "@/components/expenses/quick-expense";
import { ExpenseList } from "@/components/expenses/expense-list";

interface Project {
  id: string;
  name: string;
}

interface CategoryTotals {
  [key: string]: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  MATERIALS: "Materials",
  LABOR: "Labor",
  PERMITS: "Permits",
  INSURANCE: "Insurance",
  EQUIPMENT: "Equipment",
  FUEL: "Fuel",
  OFFICE: "Office",
  OTHER: "Other",
};

export default function ExpensesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotals>({});

  // Load projects for linking
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        // The projects API may return { projects: [] } or just []
        setProjects(Array.isArray(data) ? data : data.projects || []);
      })
      .catch(() => {});
  }, []);

  // Load summary stats
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const startOfYear = new Date(now.getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0];

    // This month
    fetch(`/api/expenses?startDate=${startOfMonth}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setMonthTotal(data.totalAmount);
      })
      .catch(() => {});

    // This year (with category breakdown)
    fetch(`/api/expenses?startDate=${startOfYear}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setYearTotal(data.totalAmount);
          setCategoryTotals(data.byCategory || {});
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  // Sort categories by total descending for display
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track receipts, expenses, and costs across all your projects
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              This Month
            </p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(monthTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              This Year
            </p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(yearTotal)}</p>
          </CardContent>
        </Card>
        {topCategories.map(([cat, total]) => (
          <Card key={cat}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {CATEGORY_LABELS[cat] || cat}
              </p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Expense form */}
      <QuickExpense
        projects={projects}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      {/* Expense list */}
      <ExpenseList refreshKey={refreshKey} projects={projects} />
    </div>
  );
}
