import { siteConfig } from '@/lib/site';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-tight flex h-16 items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2" aria-label={siteConfig.storeName}>
          {/* Thridify wordmark */}
          <img src="/brand/thridify-logo.svg" alt="Thridify" className="h-7 w-auto" />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={siteConfig.contactUrl}
            target="_blank"
            rel="noopener"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 sm:inline-flex"
          >
            Contact Thridify
          </a>
          {/* No-JS mobile menu */}
          <details className="relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border">
              <span className="sr-only">Menu</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lift">
              {siteConfig.nav.map((item) => (
                <a key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                  {item.label}
                </a>
              ))}
              <a
                href={siteConfig.contactUrl}
                target="_blank"
                rel="noopener"
                className="mt-1 block rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                Contact Thridify
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
