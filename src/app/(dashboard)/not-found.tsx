import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-4xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Not Found</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          This page doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
