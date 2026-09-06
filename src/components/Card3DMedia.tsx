'use client';

import { useEffect, useRef } from 'react';
import type { ProductView } from '@/lib/types';

/**
 * Listing-card media for cards with live 3D on hover.
 *
 * The plugin's hover controller overlays a **transparent** `<thridify-view>` on
 * top of this card box on hover. Without intervention the card's own poster
 * `<img>` shows THROUGH behind the rotating 3D model (the poster↔3D bleed-through
 * bug — the model-viewer canvas is `rgba(0,0,0,0)`). This is the per-card
 * poster↔3D handoff for that stopgap mount path (the SDK owns the hero's poster
 * via data-thridify-poster, but the listing cards keep their own <img> for the
 * non-hover state, so the site manages its visibility here):
 *
 * - watch the box for a `<thridify-view>` being mounted;
 * - hide the poster ONLY once the model's first frame has painted (poll the open
 *   shadow model-viewer's `modelIsVisible`/`loaded`), so there's no blank gap
 *   while the GLB downloads on hover;
 * - restore the poster when the viewer is torn down on hover-out.
 */
export function Card3DMedia({ p }: { p: ProductView }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img) return;

    let activeView: Element | null = null;
    let pollId = 0;
    const show = () => {
      img.style.opacity = '1';
    };
    const hide = () => {
      img.style.opacity = '0';
    };

    const waitFirstFrame = (view: Element) => {
      const check = () => {
        if (activeView !== view || !box.contains(view)) return; // superseded / torn down
        const mv = (view as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot?.querySelector(
          'model-viewer',
        ) as (Element & { loaded?: boolean; modelIsVisible?: boolean }) | null;
        if (mv && (mv.modelIsVisible || mv.loaded)) {
          hide();
          return;
        }
        pollId = window.setTimeout(check, 120);
      };
      check();
    };

    const sync = () => {
      const view = box.querySelector('thridify-view');
      if (view && view !== activeView) {
        activeView = view;
        waitFirstFrame(view);
      } else if (!view && activeView) {
        activeView = null;
        window.clearTimeout(pollId);
        show();
      }
    };

    const obs = new MutationObserver(sync);
    obs.observe(box, { childList: true, subtree: true });
    return () => {
      obs.disconnect();
      window.clearTimeout(pollId);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      data-thridify-card-product-id={p.productKey}
      className="relative aspect-square overflow-hidden bg-surface"
    >
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={p.image}
          alt={p.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-[transform,opacity] duration-300 group-hover:scale-[1.04]"
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
  );
}
