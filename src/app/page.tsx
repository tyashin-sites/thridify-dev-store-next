import { listProducts, listCategories, getStoreInfo, toView } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Hero3DCarousel, type HeroSlide } from '@/components/Hero3DCarousel';
import { siteConfig } from '@/lib/site';
import type { ProductView } from '@/lib/types';

export const dynamic = "force-dynamic";

// Curated hero line-up — an assortment ACROSS categories, one experience per
// slide, favouring immersive scenes and strong hero objects. Referenced by
// `productKey` (SKU || name, the id Thridify binds to); resolved against the
// live catalog below, so a pick that vanishes from the store simply drops out.
// The headline/blurb are showcase copy for the experience; the real product is
// always one tap away via the slide's "Open this experience" link.
// NOTE: every key here MUST be a product that renders in the Thridify VIEWER for
// this store's linked account — not merely present in the store catalog. Catalog
// listing and viewer authorization are separate: a product can have a poster
// (catalog) yet 403 in the viewer ("You are not authorized to access this
// product"), which paints the poster with the error text on top. These five are
// verified-authorized picks (Speaker / island_Kitchen_Test / Sound_Bar_* /
// Safelam do NOT resolve in the viewer — do not use them here).
const HERO_PICKS: { productKey: string; headline: string; blurb: string }[] = [
  {
    // Full modular-kitchen scene — the most immersive "step into the room" pick.
    productKey: '2319',
    headline: 'Step inside the scene',
    blurb: 'Explore a full modular kitchen in real time — room-scale 3D that turns a flat catalog into a place you can walk through.',
  },
  {
    productKey: '2150',
    headline: 'The centrepiece, in your hands',
    blurb: 'Spin the leather loveseat, study the stitching, judge the scale — hero furniture you can inspect from every angle before you decide.',
  },
  {
    productKey: '363',
    headline: 'Design you can circle',
    blurb: 'Circle the racing chair, read every contour and material — a product story a single flat photo can never tell.',
  },
  {
    productKey: '2045',
    headline: 'Detail you can almost touch',
    blurb: 'Turn the stand mixer in the light, catch the finish and the trim — everyday product, brought to life in real-time 3D.',
  },
  {
    productKey: '2075',
    headline: 'Look closer than a photo allows',
    blurb: 'Zoom the solitaire until the facets catch the light — the kind of close inspection only live 3D can give a shopper.',
  },
];

// Feature-section line-up (deliberately different from the hero) — a spread of
// categories for the ProductCard grid. Resolved in order, then topped up with
// any other in-stock, poster-bearing products so the grid is always full.
// (HeightAdjustableDesk intentionally NOT here — it's a hero slide; the grid
// backfills from the remaining catalog to stay full without repeating the hero.)
const FEATURE_PICKS = [
  '364',            // Chesterfield sofa
  '2109',           // Basket swing chair
  '2119',           // Patterned wingback chair
  '2137',           // Poliform platform bed
  '2264',           // French-door refrigerator
  'nasher_bag',     // Nasher terrazzo trolley
  '2249',           // Holmes wrist watch
  '2198',           // Nike Mercurial boots
];

const FEATURE_COUNT = 8;

export default async function HomePage() {
  const [store, categories, products] = await Promise.all([
    getStoreInfo(),
    listCategories(),
    listProducts({ limit: 100 }),
  ]);

  const views = products.map((p) => toView(p, categories, store.currency));
  const byKey = new Map<string, ProductView>(views.map((v) => [v.productKey, v]));

  // Hero slides: only picks that resolve to a real product WITH a poster (the
  // poster is the crash-safe floor + the SDK's poster↔3D handoff source).
  const heroSlides: HeroSlide[] = HERO_PICKS.map((pick): HeroSlide | null => {
    const v = byKey.get(pick.productKey);
    if (!v || !v.image) return null;
    return { ...v, headline: pick.headline, blurb: pick.blurb };
  }).filter((s): s is HeroSlide => s !== null);

  // Featured grid: curated order first, then fill from the rest (all with a
  // poster image), never repeating a card.
  const withImage = views.filter((v) => v.image);
  const used = new Set<string>();
  const featured: ProductView[] = [];
  for (const key of FEATURE_PICKS) {
    const v = byKey.get(key);
    if (v && v.image && !used.has(v.slug)) {
      featured.push(v);
      used.add(v.slug);
    }
  }
  for (const v of withImage) {
    if (featured.length >= FEATURE_COUNT) break;
    if (!used.has(v.slug)) {
      featured.push(v);
      used.add(v.slug);
    }
  }
  const featuredGrid = featured.slice(0, FEATURE_COUNT);

  return (
    <>
      {/* Hero — auto-advancing carousel of live 3D experiences (one live
          viewer at a time). Falls back to the static intro if the catalog is
          empty / unreachable. */}
      {heroSlides.length > 0 ? (
        <Hero3DCarousel slides={heroSlides} />
      ) : (
        <section className="thr-gradient">
          <div className="container-tight py-20 lg:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Powered by Thridify 3D &amp; AR
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/products" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
                Explore the store
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Featured products — the same ProductCard as the /products listing, with
          3D enabled (live viewer on hover / poster on mobile). */}
      {featuredGrid.length > 0 && (
        <section className="container-tight py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Featured experiences</h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Hover any card to bring it to life in 3D — then open it for the full experience and AR.
              </p>
            </div>
            <a href="/products" className="shrink-0 text-sm font-semibold text-primary hover:underline">View all →</a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {featuredGrid.map((p) => (
              <ProductCard key={p.slug} p={p} enable3d />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-tight pb-16">
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

      {/* How it works + CTA */}
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
        <div className="container-tight pb-20">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-border bg-card p-8 shadow-soft sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold sm:text-2xl">Bring your catalog to life</h3>
              <p className="mt-1 text-muted-foreground">Every product here is a live Thridify experience. Yours can be too.</p>
            </div>
            <a href={siteConfig.contactUrl} target="_blank" rel="noopener" className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
              Contact Thridify
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
