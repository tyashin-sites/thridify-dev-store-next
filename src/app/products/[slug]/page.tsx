import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelated, listCategories, getStoreInfo, toView } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { siteConfig } from '@/lib/site';

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: 'Not found' };
  const img = p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url;
  return {
    title: p.name,
    description: (p.shortDescription || p.description || `${p.name} — explore in 3D and AR with Thridify.`).slice(0, 160),
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, type: 'website', images: img ? [{ url: img }] : undefined },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [product, categories, store] = await Promise.all([
    getProductBySlug(slug),
    listCategories(),
    getStoreInfo(),
  ]);
  if (!product) notFound();
  const p = toView(product, categories, store.currency);
  const related = (await getRelated(slug, 4)).map((r) => toView(r, categories, store.currency)).filter((r) => r.slug !== slug);

  return (
    <div className="container-tight py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <a href="/" className="hover:text-primary">Home</a> <span className="mx-1">/</span>{' '}
        <a href="/products" className="hover:text-primary">Shop</a>
        {p.category && (<><span className="mx-1">/</span> <a href={`/products?category=${p.categorySlug}`} className="hover:text-primary">{p.category}</a></>)}
        <span className="mx-1">/</span> <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery column: the media frame + the Thridify tab-switcher slot.
            Both live in ONE grid child so the tabs land directly under the
            gallery (its own row) instead of falling into the details column —
            which is what forced Thridify's absolute overlay fallback (tabs
            overlapping the experience's Customize control). See
            data-thridify-slot below. */}
        <div>
          {/* Gallery — Thridify 3D/AR trigger mounts here (slot must be relative/overlayable) */}
          <div
            data-tyashin-slot="product-gallery"
            data-thridify-page-product-id={p.productKey}
            className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
          >
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.imageAlt} className="aspect-square w-full object-cover" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-muted-foreground">
                <span className="text-sm">Interactive 3D model</span>
              </div>
            )}
          </div>
          {/* Thridify Images / 3D-View tab switcher renders here (in normal flow,
              below the gallery), so the experience keeps its own space. Without
              this slot the viewer re-homes the tabs as an absolute overlay on a
              two-column PDP. */}
          <div data-thridify-slot="viewer-tabs" className="mt-3" />
        </div>

        {/* Details */}
        <div>
          {p.category && (
            <a href={`/products?category=${p.categorySlug}`} className="text-xs font-semibold uppercase tracking-wide text-primary">
              {p.category}
            </a>
          )}
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{p.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-primary">{p.priceLabel ?? 'Price on request'}</p>

          <div data-tyashin-slot="product-description" className="mt-5 leading-relaxed text-muted-foreground">
            {p.description || 'Explore this product in interactive 3D and augmented reality.'}
          </div>

          {/* Primary CTA — Contact Thridify (this is a demo store; not a checkout) */}
          <div data-tyashin-slot="product-cta" className="mt-8">
            <a
              href={siteConfig.contactUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 sm:w-auto"
            >
              Contact Thridify
            </a>
            <p className="mt-3 text-sm text-muted-foreground">
              Want this experience for your own products?{' '}
              <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary hover:underline">
                {siteConfig.email}
              </a>
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-surface/60 p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live 3D &amp; AR
            </p>
            <p className="mt-1 text-muted-foreground">
              Rotate and zoom this product in real time, or view it in your own space with AR — powered by Thridify.
            </p>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.slug} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
