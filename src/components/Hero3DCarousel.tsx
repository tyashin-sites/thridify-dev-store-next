'use client';

/**
 * Hero3DCarousel — the showcase hero. An auto-advancing carousel that cycles the
 * store's best Thridify experiences ACROSS categories, one per slide, with a
 * full-3D feel.
 *
 * CRASH-SAFETY (the one rule): this store crashes iPhones when too many live 3D
 * contexts co-exist, so the hero mounts AT MOST ONE live `<thridify-view>` at a
 * time. We do NOT stack every slide as a live viewer. Only the settled ACTIVE
 * slide renders the single live mount container (`data-thridify-product`); every
 * other slide — and the active slide WHILE a transition is animating — is a
 * plain poster `<img>`. On advance, React unmounts the previous slide's live
 * container (tearing down its WebGL context) and mounts the next — one in, one
 * out.
 *
 * SLIDE TRANSITION (§ user feedback #3): all slides render their poster in a
 * horizontal filmstrip `track` that translates by `-active * 100%`, so a change
 * of slide ANIMATES sideways — the motion signals "there are neighbours you can
 * go back/forward to". The single live viewer is mounted only once the track
 * has SETTLED (onTransitionEnd), so we never animate a live WebGL canvas and we
 * keep the one-live-at-a-time rule. The live model area stays interactive for
 * rotate/zoom; navigation between experiences is via the animated transition +
 * the prev/next/dots below (deliberately not finger-drag OVER the model, which
 * would fight model-viewer's own orbit gesture).
 *
 * AUTO-ADVANCE, load-gated (§ feedback #1): the dwell timer for a slide does NOT
 * start until that slide's model is actually live — we wait for the per-mount
 * `thridify:commands-ready` DOM event (captured on the stage; the SDK fires it
 * once the model has loaded and the poster→3D handoff is armed), with a safety
 * cap so a slow/failed load can't stall the carousel forever. So every slide
 * gets a guaranteed AUTO_MS of VIEWING time after it becomes interactive, not a
 * fixed budget that the load time eats into.
 *
 * PAUSE-ON-INTERACTION (§ feedback #2): any manual navigation (arrows, dots,
 * keyboard) suspends auto-advance for RESUME_MS of no further interaction, so a
 * user studying one experience is not yanked to the next. Auto-advance resumes
 * only after that quiet window.
 *
 * SDK seam (THRIDIFY-EXPERIENCE-MODES-PLAN §2/§5): the platform loader injects
 * the Thridify SDK (with the account) via /tyashin-runtime.js. It scans for
 * `[data-thridify-product]` and mounts a poster-first `<thridify-view>`, using
 * `data-thridify-poster` for the poster↔3D handoff and dismissing the poster on
 * first frame. `data-thridify-mode="instant"` asks for full 3D immediately (the
 * SDK governor auto-downgrades to `ready` on mobile). React swaps the active
 * slide, so after each advance settles we nudge the SDK to mount the newly
 * rendered container: `window.Thridify.scan()`, guarded for SSR + async load.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductView } from '@/lib/types';

export interface HeroSlide extends ProductView {
  /** Curated showcase headline for this experience (falls back to name). */
  headline?: string;
  /** Short one-line blurb describing the experience. */
  blurb?: string;
}

/** Guaranteed viewing time on a slide AFTER its model is live. */
const AUTO_MS = 8000;
/** After manual nav, stay put until this long passes with no interaction. */
const RESUME_MS = 90000;
/** If the model never signals "live", advance anyway after this cap. */
const READY_CAP_MS = 9000;
/** Track slide animation duration — keep in sync with the CSS below. */
const SLIDE_MS = 450;

export function Hero3DCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [hovering, setHovering] = useState(false);
  // The active slide's model is live (poster→3D handoff done) → dwell may start.
  const [ready, setReady] = useState(false);
  // A sideways transition is animating → suppress the live mount until settled.
  const [transitioning, setTransitioning] = useState(false);
  // Wall-clock until which auto-advance is suspended after a manual interaction.
  const [pausedUntil, setPausedUntil] = useState(0);

  // Respect prefers-reduced-motion — no auto-advance AND no slide animation.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const go = useCallback(
    (i: number) => {
      const n = ((i % count) + count) % count;
      setActive((prev) => {
        if (prev !== n) {
          setReady(false);
          if (!reduced) setTransitioning(true);
        }
        return n;
      });
    },
    [count, reduced],
  );
  // Manual navigation pauses auto-advance for a quiet window (feedback #2).
  const goManual = useCallback(
    (i: number) => {
      setPausedUntil(Date.now() + RESUME_MS);
      go(i);
    },
    [go],
  );
  const nextManual = useCallback(() => goManual(active + 1), [goManual, active]);
  const prevManual = useCallback(() => goManual(active - 1), [goManual, active]);

  // Load-gate: the active model is "live" when the SDK fires
  // `thridify:commands-ready` on the mounted <thridify-view>. It is non-bubbling,
  // so we capture it on the stage. Reset on every advance; cap so a slow/failed
  // load still lets the carousel move on. (feedback #1)
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (transitioning) return; // wait until the live mount actually exists
    let done = false;
    const markReady = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const stage = stageRef.current;
    stage?.addEventListener('thridify:commands-ready', markReady, true);
    const cap = window.setTimeout(markReady, READY_CAP_MS);
    return () => {
      stage?.removeEventListener('thridify:commands-ready', markReady, true);
      window.clearTimeout(cap);
    };
  }, [active, transitioning]);

  // Auto-advance: only once the active model is live, never while hovered,
  // reduced-motion, mid-transition, or inside the post-interaction quiet window.
  useEffect(() => {
    if (reduced || hovering || count <= 1 || !ready || transitioning) return;
    const delay = Math.max(AUTO_MS, pausedUntil - Date.now());
    const t = window.setTimeout(() => {
      if (Date.now() < pausedUntil) return; // still paused → re-armed by state
      go(active + 1);
    }, delay);
    return () => window.clearTimeout(t);
  }, [active, ready, transitioning, reduced, hovering, count, pausedUntil, go]);

  // Scan-on-settle: once a transition ends and the live container is rendered,
  // let the SDK mount it. Poll briefly for window.Thridify and react to a late
  // `thridify:sdk-ready`.
  useEffect(() => {
    if (typeof window === 'undefined' || transitioning) return;
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
  }, [active, transitioning]);

  // Keyboard: left/right arrows move between slides when the carousel has focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextManual();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevManual();
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
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
      onKeyDown={onKeyDown}
    >
      <div className="container-tight grid items-center gap-5 py-6 lg:grid-cols-2 lg:gap-10 lg:py-20">
        {/* Live 3D stage — exactly ONE live viewer mounts here at a time. */}
        <div className="order-1 lg:order-none">
          <div
            ref={stageRef}
            className="relative h-[42vh] max-h-[400px] min-h-[260px] w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-lift lg:h-auto lg:aspect-square lg:max-h-none"
          >
            {/* Filmstrip track — one cell per slide, translated by the active
                index so an advance ANIMATES sideways (feedback #3). Only the
                settled active cell hosts the single live mount; every cell
                otherwise shows its poster. */}
            <div
              className="flex h-full w-full"
              style={{
                transform: `translateX(-${active * 100}%)`,
                transition: reduced ? 'none' : `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
              onTransitionEnd={(e) => {
                if (e.propertyName === 'transform') setTransitioning(false);
              }}
            >
              {slides.map((s, i) => {
                const isLive = i === active && !transitioning;
                return (
                  <div key={s.productKey} className="relative h-full w-full shrink-0">
                    {/* Poster for the slide animation. Hidden on the active cell
                        ONCE its live mount exists — the viewer canvas is
                        transparent and the SDK paints its own poster, so leaving
                        ours behind would bleed through (double-image bug). */}
                    {!isLive && s.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image}
                        alt={s.imageAlt || s.name}
                        className="absolute inset-0 h-full w-full object-contain"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        draggable={false}
                      />
                    )}
                    {/* THE single live mount. Keyed by productKey → a fresh node
                        each advance, so the SDK re-scan mounts it and the
                        previous slide's live context is torn down. */}
                    {isLive && (
                      <div
                        key={s.productKey}
                        data-thridify-product={s.productKey}
                        data-thridify-mode="instant"
                        {...(s.image ? { 'data-thridify-poster': s.image } : {})}
                        className="absolute inset-0"
                        aria-label={`Interactive 3D — ${s.name}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3D · AR badge */}
            <span className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-[11px] font-semibold text-primary shadow-soft backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live 3D · AR
            </span>
          </div>

          {/* Controls row — prev · dots · next — BELOW the stage, clear of the
              experience and the viewer's own control column. */}
          {count > 1 && (
            <div className="mt-3 flex items-center justify-center gap-4 lg:mt-5">
              <button
                type="button"
                onClick={prevManual}
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
                    onClick={() => goManual(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === active ? 'w-7 bg-primary' : 'w-2 bg-border hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextManual}
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
