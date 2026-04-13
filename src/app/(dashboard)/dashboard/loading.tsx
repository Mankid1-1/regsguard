export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-40 rounded-md bg-secondary" />
        <div className="mt-2 h-4 w-72 rounded-md bg-secondary" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-16 rounded bg-secondary" />
                <div className="mt-2 h-8 w-10 rounded bg-secondary" />
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Deadline list skeleton */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-secondary" />
            <div className="h-4 w-20 rounded bg-secondary" />
          </div>

          {/* Filter tabs skeleton */}
          <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 flex-1 rounded-md bg-background/50"
              />
            ))}
          </div>

          {/* Deadline cards skeleton */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-background p-4 shadow-sm border-l-4 border-l-secondary"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-48 rounded bg-secondary" />
                      <div className="h-5 w-16 rounded-full bg-secondary" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-3 w-20 rounded bg-secondary" />
                      <div className="h-3 w-24 rounded bg-secondary" />
                    </div>
                    <div className="h-4 w-32 rounded bg-secondary" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 rounded-lg bg-secondary" />
                    <div className="h-8 w-24 rounded-lg bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar skeleton */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-secondary" />
            <div className="h-4 w-12 rounded bg-secondary" />
          </div>
          <div className="rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="h-5 w-5 rounded bg-secondary" />
              <div className="h-4 w-28 rounded bg-secondary" />
              <div className="h-5 w-5 rounded bg-secondary" />
            </div>
            <div className="grid grid-cols-7 border-b border-border">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-center py-2">
                  <div className="h-3 w-6 rounded bg-secondary" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-14 items-start justify-center border-t border-border pt-2"
                >
                  <div className="h-4 w-4 rounded bg-secondary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
