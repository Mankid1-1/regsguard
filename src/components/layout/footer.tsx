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
        </div>
        <div>
          Need help?{" "}
          <a
            href="mailto:brendan@rebooked.org"
            className="text-primary hover:underline"
          >
            brendan@rebooked.org
          </a>
        </div>
      </div>
    </footer>
  );
}
