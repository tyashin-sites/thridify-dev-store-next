// Instant skeleton shown the moment a product link is clicked (Suspense), so a
// PDP always feels immediate even on a cold render.
export default function ProductLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
        <div className="space-y-5">
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="space-y-2 pt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: `${95 - (i % 2) * 18}%` }}
              />
            ))}
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
