"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { CommandPalette } from "@/components/command-palette";

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 hover:bg-accent md:hidden"
        aria-label="Toggle menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      <div className="flex-1">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Support dropdown-style button - always accessible */}
        <Link
          href="/support"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground transition-colors"
          title="Support: brendan@rebooked.org or (612) 439-7445"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Support
        </Link>

        {/* Mobile: icon-only support link */}
        <Link
          href="/support"
          className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
          aria-label="Support"
        >
          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>

        <NotificationBell />
        <UserButton />
      </div>
    </header>
  );
}
