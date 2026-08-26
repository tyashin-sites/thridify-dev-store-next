import { listProducts, listCategories, getStoreInfo, toView } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { siteConfig } from '@/lib/site';

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [store, categories, products] = await Promise.all([
    getStoreInfo(),
    listCategories(),
    listProducts({ limit: 8 }),
  ]);
  const featured = products.map((p) => toView(p, categories, store.currency)).filter((p) => p.image);

  return (
    <>
      {/* Hero */}
      <section className="thr-gradient">
        <div className="container-tight grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Powered by Thridify 3D &amp; AR
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/products" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
                Explore the store
              </a>
              <a href={siteConfig.contactUrl} target="_blank" rel="noopener" className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                Contact Thridify
              </a>
            </div>
          </div>
          {featured[0] && (
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured[0].image} alt={featured[0].imageAlt} className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-border bg-background/90 px-4 py-3 text-sm shadow-soft backdrop-blur">
                <p className="font-semibold text-foreground">Spin it. Place it. Decide.</p>
                <p className="text-muted-foreground">Every product in real-time 3D</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-tight py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">Browse by collection</h2>
            <a href="/products" className="text-sm font-semibold text-primary hover:underline">View all →</a>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <a key={c.slug} href={`/products?category=${c.slug}`} className="card-hover flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div>
                  <p className="text-lg font-semibold text-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.productCount ?? ''} products</p>
                </div>
                <span className="text-primary">→</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container-tight py-8 pb-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Featured</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-t border-border bg-surface/50">
        <div className="container-tight grid gap-8 py-16 sm:grid-cols-3">
          {[
            ['See it in 3D', 'Rotate, zoom and inspect every product in real-time — no plugins, right in the browser.'],
            ['Place it in AR', 'Point your phone and drop the product into your own space, at true scale.'],
            ['Talk to Thridify', 'Like what you see? Contact Thridify to bring 3D & AR to your own catalog.'],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</div>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
