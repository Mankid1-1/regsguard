"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface BreakdownItem {
  score: number;
  max: number;
  [key: string]: unknown;
}

interface ScoreData {
  score: number;
  breakdown: {
    deadlines: BreakdownItem;
    ceCredits: BreakdownItem;
    insurance: BreakdownItem;
    filings: BreakdownItem;
  };
  grade: "A" | "B" | "C" | "D" | "F";
}

const GRADE_COLORS: Record<string, { stroke: string; text: string; bg: string }> = {
  A: { stroke: "stroke-green-500", text: "text-green-600", bg: "bg-green-50" },
  B: { stroke: "stroke-green-400", text: "text-green-500", bg: "bg-green-50" },
  C: { stroke: "stroke-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50" },
  D: { stroke: "stroke-orange-500", text: "text-orange-600", bg: "bg-orange-50" },
  F: { stroke: "stroke-red-500", text: "text-red-600", bg: "bg-red-50" },
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  deadlines: { label: "Deadlines", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
  ceCredits: { label: "CE Credits", icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" },
  insurance: { label: "Insurance & Bond", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  filings: { label: "Recent Filings", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
};

function CircularGauge({ score, grade }: { score: number; grade: string }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.F;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-secondary"
        />
        {/* Progress arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(colors.stroke, "transition-all duration-1000 ease-out")}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", colors.text)}>{grade}</span>
        <span className="text-sm text-muted-foreground">{score}/100</span>
      </div>
    </div>
  );
}

export function ComplianceScore() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch("/api/user/compliance-score");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // Silently fail -- component will show loading/fallback
      }
      setLoading(false);
    }
    fetchScore();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-[140px] w-[140px] rounded-full bg-secondary" />
            <div className="h-4 w-24 rounded bg-secondary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p className="text-sm">Unable to load compliance score.</p>
        </CardContent>
      </Card>
    );
  }

  const colors = GRADE_COLORS[data.grade] || GRADE_COLORS.F;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Compliance Score</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-3">
          <CircularGauge score={data.score} grade={data.grade} />

          <p className="text-sm text-muted-foreground text-center">
            {data.score >= 80
              ? "Your compliance is in great shape."
              : data.score >= 60
                ? "There are some areas to improve."
                : "Action needed to avoid compliance issues."}
          </p>

          {/* Toggle breakdown */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "Hide" : "Show"} breakdown
            <svg
              className={cn(
                "h-3 w-3 transition-transform",
                expanded && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {/* Breakdown detail */}
          {expanded && (
            <div className="w-full space-y-3 pt-2 border-t border-border">
              {(
                Object.entries(data.breakdown) as [
                  string,
                  BreakdownItem,
                ][]
              ).map(([key, item]) => {
                const cat = CATEGORY_LABELS[key];
                if (!cat) return null;
                const pct = item.max > 0 ? (item.score / item.max) * 100 : 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={cat.icon}
                          />
                        </svg>
                        <span className="text-xs font-medium text-foreground">
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.score}/{item.max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct >= 80
                            ? "bg-green-500"
                            : pct >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
