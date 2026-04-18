import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6 px-4 md:px-6 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>&copy; {new Date().getFullYear()} RegsGuard</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/support" className="hover:text-foreground transition-colors">
            Support
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href="mailto:brendan@rebooked.org"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Email support"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            brendan@rebooked.org
          </a>
          <span className="text-muted-foreground/40">&middot;</span>
          <a
            href="tel:+16124397445"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Call support"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.5a1 1 0 01.97.757l1 4a1 1 0 01-.29.99L7.7 10.2a12 12 0 006.1 6.1l1.45-1.48a1 1 0 01.99-.29l4 1a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z" />
            </svg>
            (612) 439-7445
          </a>
        </div>
      </div>
    </footer>
  );
}
