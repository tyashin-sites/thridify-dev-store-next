import type { Metadata } from 'next';
import { listProducts, listCategories, getStoreInfo, toView } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { siteConfig } from '@/lib/site';

export const dynamic = "force-dynamic";

type SP = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: SP): Promise<Metadata> {
  const { category } = await searchParams;
  const cats = await listCategories();
  const active = cats.find((c) => c.slug === category);
  const title = active ? `${active.name}` : 'Shop';
  const canonical = active ? `/products?category=${active.slug}` : '/products';
  return {
    title,
    description: active
      ? `Explore ${active.name} in interactive 3D and AR — powered by Thridify.`
      : siteConfig.seoDescription,
    alternates: { canonical },
  };
}

export default async function ProductsPage({ searchParams }: SP) {
  const { category } = await searchParams;
  const [store, categories, products] = await Promise.all([
    getStoreInfo(),
    listCategories(),
    listProducts({ category, limit: 100 }),
  ]);
  const active = categories.find((c) => c.slug === category);
  const views = products.map((p) => toView(p, categories, store.currency));

  return (
    <div className="container-tight py-12">
      <nav className="text-sm text-muted-foreground">
        <a href="/" className="hover:text-primary">Home</a> <span className="mx-1">/</span>{' '}
        <a href="/products" className="hover:text-primary">Shop</a>
        {active && (<><span className="mx-1">/</span> <span className="text-foreground">{active.name}</span></>)}
      </nav>

      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{active ? active.name : 'The store'}</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        {active ? `Products from ${active.name}, each explorable in 3D and AR.` : 'Every product, alive in real-time 3D and AR. Filter by collection.'}
      </p>

      {/* Category filter (crawlable links) */}
      <div className="mt-7 flex flex-wrap gap-2">
        <a href="/products" className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${!active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-primary'}`}>
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${active?.slug === c.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-primary'}`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {views.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">No products in this collection yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {views.map((p) => (
            <ProductCard key={p.slug} p={p} enable3d />
          ))}
        </div>
      )}
    </div>
  );
}
