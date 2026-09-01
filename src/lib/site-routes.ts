/**
 * SINGLE SOURCE OF TRUTH for the site's indexable URL tree.
 *
 * Why this file exists: the Tyashin platform serves `/sitemap.xml` as a
 * sitemap-INDEX and has NO knowledge of this site's Next.js `app/` route tree,
 * so the code-defined pages were missing from the sitemap until the site
 * publishes its own. This module enumerates EVERY indexable page the site
 * actually serves so the sitemap and the built pages can never drift.
 *
 * The only consumer is `src/app/sitemap-pages.xml/route.ts`, which renders
 * every route below as XML. There are no enumerable `[slug]` routes to feed
 * back into `generateStaticParams` here (see EXCLUDED below), so this file
 * intentionally does NOT touch any route's `generateStaticParams`.
 *
 * EXCLUDED on purpose (not indexable / not code-enumerable — do not add here):
 *  - `/products` — a server redirect to `/collection`; not a real page.
 *  - `/products/[slug]` — e-commerce product DETAIL pages whose params come
 *    from the DB/API (`listProducts()`), not an in-repo list. They are not
 *    code-authoritative, so they stay out of this code sitemap.
 *  - `/blog/[slug]` — blog POSTS are platform-owned content and belong in the
 *    platform's own content sitemap (`/sitemap-content.xml`), NOT this page
 *    sitemap. `/blog` (the index) IS included.
 *  - utility routes (this sitemap route itself, robots.txt, etc.).
 *
 * Do NOT create `app/sitemap.ts` (path `/sitemap.xml`) — the platform owns
 * that path and index-references this one.
 */

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SiteRoute {
  /** Root-relative path, always starting with `/`, no trailing slash (except `/`). */
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

/**
 * Every STATIC indexable page in `src/app/**\/page.tsx`.
 * Keep in lockstep with the app tree: a `page.tsx` that renders an indexable
 * page and is missing here is the exact bug this file fixes.
 */
const STATIC_ROUTES: SiteRoute[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/device-compatibility', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
];

/**
 * The complete, ordered list of indexable site paths. This is THE list the
 * page sitemap emits.
 */
export function getSiteRoutes(): SiteRoute[] {
  return [...STATIC_ROUTES];
}
