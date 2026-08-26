export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-7xl text-primary">404</div>
        <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="/" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Return home
          </a>
          <a href="/products" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary">
            Browse the store
          </a>
        </div>
      </div>
    </div>
  );
}
