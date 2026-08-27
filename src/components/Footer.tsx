import { siteConfig } from '@/lib/site';
import { listCategories } from '@/lib/api';

export async function Footer() {
  const categories = await listCategories().catch(() => []);
  return (
    <footer className="mt-24 border-t border-border bg-surface/60">
      <div className="container-tight grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <img src="/brand/thridify-logo.png" alt="Thridify" className="h-7 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
          <a
            href={siteConfig.contactUrl}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Contact Thridify
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {siteConfig.nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-muted-foreground hover:text-primary">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Collections</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href={`/products?category=${c.slug}`} className="text-muted-foreground hover:text-primary">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-tight flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} Thridify. A demo store — products are shown for 3D/AR
            demonstration.
          </p>
          <p className="text-center">
            Made with ♥ by{' '}
            <a href="https://tyashin.com" target="_blank" rel="noopener" className="hover:text-primary">
              Tyashin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
