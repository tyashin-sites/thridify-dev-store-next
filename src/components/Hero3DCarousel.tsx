'use client';

/**
 * Hero3DCarousel — the showcase hero. An auto-advancing carousel that cycles the
 * store's best Thridify experiences ACROSS categories, one per slide, with a
 * full-3D feel.
 *
 * CRASH-SAFETY (the one rule): this store crashes iPhones when too many live 3D
 * contexts co-exist, so the hero mounts AT MOST ONE live `<thridify-view>` at a
 * time. We do NOT stack every slide as a live viewer. Only the ACTIVE slide
 * renders the single live mount container (`data-thridify-product`); every other
 * slide is a plain poster `<img>`. On advance, React unmounts the previous
 * slide's live container (tearing down its WebGL context) and mounts the next —
 * one in, one out.
 *
 * The live container is KEYED by the active productKey so React always creates a
 * fresh DOM node on advance (never carrying the SDK's `data-thridify-mounted`
 * marker), which lets a re-scan pick it up. Because we only ever render this one
 * container, there is exactly one `[data-thridify-product]` element in the hero
 * at any instant.
 *
 * SDK seam (THRIDIFY-EXPERIENCE-MODES-PLAN §2/§5): the platform loader injects
 * the Thridify SDK (with the account) via /tyashin-runtime.js. It scans for
 * `[data-thridify-product]` and mounts a poster-first `<thridify-view>`, using
 * `data-thridify-poster` for the poster↔3D handoff and dismissing the poster on
 * first frame. `data-thridify-mode="instant"` asks for full 3D immediately (the
 * SDK governor auto-downgrades to `ready` on mobile). React swaps the active
 * slide, so after each advance we must nudge the SDK to mount the newly-rendered
 * container: `window.Thridify.scan()` in an effect keyed on the active index,
 * guarded for SSR + async SDK load (poll briefly and also listen for
 * `thridify:sdk-ready`).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductView } from '@/lib/types';

export interface HeroSlide extends ProductView {
  /** Curated showcase headline for this experience (falls back to name). */
  headline?: string;
  /** Short one-line blurb describing the experience. */
  blurb?: string;
}

const AUTO_MS = 7500;

export function Hero3DCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Respect prefers-reduced-motion — no auto-advance when set.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const go = useCallback(
    (i: number) => setActive(((i % count) + count) % count),
    [count],
  );
  const next = useCallback(() => go(active + 1), [go, active]);
  const prev = useCallback(() => go(active - 1), [go, active]);

  // Auto-advance ~6s; paused on hover/focus and when reduced-motion is set.
  useEffect(() => {
    if (reduced || paused || count <= 1) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % count), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, reduced, count]);

  // Scan-on-advance: after the active slide changes, let the SDK mount the
  // newly-rendered live container. Guard for SSR + async SDK load: poll briefly
  // for window.Thridify and also react to a late `thridify:sdk-ready`.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let tries = 0;
    const scan = () => {
      const T = (window as unknown as { Thridify?: { scan?: () => void } }).Thridify;
      if (T?.scan) {
        try {
          T.scan();
        } catch {
          /* a broken embed must not loop */
        }
        return true;
      }
      return false;
    };
    const attempt = () => {
      if (cancelled) return;
      if (scan()) return;
      if (tries++ < 40) window.setTimeout(attempt, 150); // ~6s max, then give up
    };
    const onReady = () => {
      if (!cancelled) scan();
    };
    window.addEventListener('thridify:sdk-ready', onReady);
    attempt();
    return () => {
      cancelled = true;
      window.removeEventListener('thridify:sdk-ready', onReady);
    };
  }, [active]);

  // Keyboard: left/right arrows move between slides when the carousel has focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  if (count === 0) return null;
  const slide = slides[active];

  return (
    <section
      className="thr-gradient"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Thridify 3D experiences"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className="container-tight grid items-center gap-5 py-6 lg:grid-cols-2 lg:gap-10 lg:py-20">
        {/* Live 3D stage — exactly ONE live viewer mounts here at a time. */}
        <div className="order-1 lg:order-none">
          <div className="relative h-[42vh] max-h-[400px] min-h-[260px] w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-lift lg:h-auto lg:aspect-square lg:max-h-none">
            {/* The POSTER is owned entirely by the SDK: the mount below carries
                data-thridify-poster, and the SDK renders it poster-first then
                dismisses it on the model's first frame. We must NOT render our
                own poster <img> under the mount — the viewer canvas is
                transparent, so a site poster bleeds THROUGH behind the 3D model
                (the double-image bug). bg-surface on the frame covers the brief
                gap before the SDK paints its poster. */}

            {/* THE single live mount. Keyed by productKey → a fresh node each
                advance, so the SDK re-scan mounts it and the previous slide's
                live context is torn down. This is the one-live-at-a-time seam. */}
            <div
              key={slide.productKey}
              data-thridify-product={slide.productKey}
              data-thridify-mode="instant"
              {...(slide.image ? { 'data-thridify-poster': slide.image } : {})}
              className="absolute inset-0"
              aria-label={`Interactive 3D — ${slide.name}`}
            />

            {/* 3D · AR badge */}
            <span className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold text-primary shadow-soft backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live 3D · AR
            </span>

            {/* Prev/next are NOT overlaid on the stage — they live in the
                controls row below, so they never cover the experience or the
                viewer's own control column (zoom / AR / share). */}
          </div>

          {/* Controls row — prev · dots · next — BELOW the stage, clear of the
              experience and the viewer's controls. */}
          {count > 1 && (
            <div className="mt-3 flex items-center justify-center gap-4 lg:mt-5">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous experience"
                className="rounded-full border border-border bg-background p-2 text-foreground shadow-soft transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div className="flex items-center gap-2.5" role="tablist" aria-label="Choose an experience">
                {slides.map((s, i) => (
                  <button
                    key={s.productKey}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Show ${s.headline ?? s.name}`}
                    onClick={() => go(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === active ? 'w-7 bg-primary' : 'w-2 bg-border hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                aria-label="Next experience"
                className="rounded-full border border-border bg-background p-2 text-foreground shadow-soft transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Copy column — updates per slide. aria-live announces the change for
            assistive tech without stealing focus. */}
        <div aria-live="polite" aria-atomic="true">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {slide.category ?? 'Featured experience'}
          </span>
          <h1 className="mt-3 text-2xl font-bold leading-[1.1] sm:text-3xl lg:mt-5 lg:text-6xl lg:leading-[1.05]">
            {slide.headline ?? slide.name}
          </h1>
          <p className="mt-2 line-clamp-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:mt-5 lg:line-clamp-none lg:text-lg">
            {slide.blurb ?? 'Spin it, zoom it, place it in your space — a real-time 3D & AR experience powered by Thridify.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 lg:mt-8">
            <a
              href={`/products/${slide.slug}`}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 lg:px-6 lg:py-3 lg:text-sm"
            >
              Open this experience
            </a>
            <a
              href="/products"
              className="hidden rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary sm:inline-flex lg:px-6 lg:py-3 lg:text-sm"
            >
              Explore the store
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
