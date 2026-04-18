"use client";

import Link from "next/link";
import { useState } from "react";

interface Deadline {
  id: string;
  status: string;
  nextDueDate: string;
  regulation: { id: string; title: string; authority: string; officialEmail: string | null };
}

interface NextBestActionProps {
  deadlines: Deadline[];
  hasProfile: boolean;
  regulationCount: number;
  documentCount: number;
}

interface Action {
  priority: "critical" | "high" | "medium" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href?: string;
  onClick?: () => Promise<void> | void;
}

export function NextBestAction(props: NextBestActionProps) {
  const [busy, setBusy] = useState(false);

  const action = computeNextAction(props, setBusy);
  if (!action) return null;

  const bgColor = {
    critical: "from-red-500/10 to-red-500/5 border-red-500/30",
    high: "from-amber-500/10 to-amber-500/5 border-amber-500/30",
    medium: "from-blue-500/10 to-blue-500/5 border-blue-500/30",
    info: "from-primary/10 to-primary/5 border-primary/30",
  }[action.priority];

  const iconBg = {
    critical: "bg-red-500/20 text-red-600",
    high: "bg-amber-500/20 text-amber-600",
    medium: "bg-blue-500/20 text-blue-600",
    info: "bg-primary/20 text-primary",
  }[action.priority];

  const btnStyle = {
    critical: "bg-red-600 hover:bg-red-700 text-white",
    high: "bg-amber-600 hover:bg-amber-700 text-white",
    medium: "bg-blue-600 hover:bg-blue-700 text-white",
    info: "bg-primary hover:bg-primary/90 text-primary-foreground",
  }[action.priority];

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 ${bgColor}`}>
      <div className="absolute top-0 right-0 opacity-10">
        <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div className="relative flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          {action.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Next Best Action
            </span>
            {action.priority === "critical" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Urgent
              </span>
            )}
          </div>
          <h3 className="text-base font-bold mb-1">{action.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
          {action.href ? (
            <Link
              href={action.href}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${btnStyle}`}
            >
              {action.cta}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              disabled={busy}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${btnStyle}`}
            >
              {busy && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {busy ? "Processing..." : action.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function computeNextAction(
  props: NextBestActionProps,
  setBusy: (v: boolean) => void,
): Action | null {
  const { deadlines, hasProfile, regulationCount, documentCount } = props;

  // CRITICAL: Overdue deadlines
  const overdue = deadlines.filter((d) => d.status === "OVERDUE");
  if (overdue.length > 0) {
    const first = overdue[0];
    return {
      priority: "critical",
      icon: <IconAlert />,
      title: `${overdue.length} ${overdue.length === 1 ? "deadline is" : "deadlines are"} overdue`,
      description: `${first.regulation.title} was due ${formatDate(first.nextDueDate)}. File now to avoid penalties.`,
      cta: overdue.length === 1 ? "File Now" : `Review ${overdue.length} Overdue`,
      href: overdue.length === 1 ? `/regulations/${first.regulation.id}` : "/regulations",
    };
  }

  // HIGH: Due in next 7 days (auto-filing threshold)
  const dueSoon = deadlines.filter((d) => {
    if (d.status === "COMPLETED" || d.status === "SKIPPED") return false;
    const days = (new Date(d.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });
  if (dueSoon.length > 0) {
    const first = dueSoon[0];
    const days = Math.ceil(
      (new Date(first.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return {
      priority: "high",
      icon: <IconClock />,
      title: `${first.regulation.title} due in ${days} ${days === 1 ? "day" : "days"}`,
      description: first.regulation.officialEmail
        ? `Auto-filing will trigger at the 7-day mark. Pre-file now to ${first.regulation.officialEmail}.`
        : `File at ${first.regulation.authority} to stay compliant.`,
      cta: "Review & File",
      href: `/regulations/${first.regulation.id}`,
    };
  }

  // MEDIUM: No profile yet (auto-fill won't work)
  if (!hasProfile) {
    return {
      priority: "medium",
      icon: <IconSparkle />,
      title: "Complete your business profile",
      description: "Takes 2 minutes. Unlocks auto-fill for every document you generate -- no more typing the same info over and over.",
      cta: "Set Up Profile",
      href: "/profile",
    };
  }

  // MEDIUM: No documents generated yet
  if (documentCount === 0 && regulationCount > 0) {
    return {
      priority: "medium",
      icon: <IconDoc />,
      title: "Generate your first document",
      description: "W-9, lien waiver, permit application -- pre-filled from your profile in one click.",
      cta: "Create Document",
      href: "/documents/new",
    };
  }

  // INFO: Upcoming deadlines within 30 days
  const upcoming30 = deadlines.filter((d) => {
    if (d.status === "COMPLETED" || d.status === "SKIPPED") return false;
    const days = (new Date(d.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days > 7 && days <= 30;
  });
  if (upcoming30.length > 0) {
    return {
      priority: "info",
      icon: <IconCalendar />,
      title: `${upcoming30.length} ${upcoming30.length === 1 ? "deadline" : "deadlines"} in the next 30 days`,
      description: "We'll auto-file on your behalf 7 days before each due date. Review now to confirm details.",
      cta: "Review Upcoming",
      href: "/regulations",
    };
  }

  // INFO: Add more regulations
  if (regulationCount < 5) {
    return {
      priority: "info",
      icon: <IconPlus />,
      title: "Expand your compliance coverage",
      description: "Add more regulations to track -- bonds, insurance, CE requirements, EPA certifications.",
      cta: "Add Regulations",
      href: "/onboarding",
    };
  }

  // No action needed -- everything's on track
  return {
    priority: "info",
    icon: <IconCheck />,
    title: "You're fully compliant",
    description: "All regulations tracked, no upcoming deadlines in the next 30 days. We'll alert you when something needs action.",
    cta: "View Dashboard",
    href: "/dashboard",
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const IconAlert = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconClock = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconSparkle = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const IconDoc = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconCalendar = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconPlus = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const IconCheck = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
