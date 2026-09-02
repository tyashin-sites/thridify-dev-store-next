import type { ProductView } from '@/lib/types';

export function ProductCard({ p }: { p: ProductView }) {
  return (
    <a href={`/products/${p.slug}`} className="group card-hover block overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Inert Thridify listing-card marker: the platform loader promotes this
          to a live inline 3D mount ONLY when the plugin's "Show 3D on product
          listing cards" setting is on. Otherwise it does nothing (the poster
          <img> below is what shows). The image box is relative/overlayable so a
          promoted <thridify-view> fills it. */}
      <div
        data-thridify-card-product-id={p.productKey}
        className="relative aspect-square overflow-hidden bg-surface"
      >
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={p.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
            </svg>
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-soft backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 3D · AR
        </span>
      </div>
      <div className="p-4">
        {p.category && <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{p.category}</p>}
        <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{p.name}</h3>
        <p className="mt-2 text-sm font-medium text-primary">{p.priceLabel ?? 'Price on request'}</p>
      </div>
    </a>
  );
}
