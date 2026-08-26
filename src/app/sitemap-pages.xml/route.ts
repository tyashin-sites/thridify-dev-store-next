import { getSiteRoutes } from '@/lib/site-routes';
import { siteConfig } from '@/lib/site';

/**
 * /sitemap-pages.xml — the SITE'S OWN page sitemap.
 *
 * The Tyashin platform intercepts `/sitemap.xml` and serves it as a
 * sitemap-INDEX that references THIS file. This route is NOT in the platform
 * registry, so it dispatches straight to the site Worker (good). It lists
 * every indexable page the site serves, sourced from `getSiteRoutes()`.
 *
 * It deliberately does NOT include blog POST URLs (`/blog/[slug]`) or
 * DB-sourced product PDPs (`/products/[slug]`): those are platform-owned /
 * API-driven content, not code-authoritative pages.
 *
 * ORIGIN — the sitemap MUST list the EXACT canonical URL of each page, i.e. the
 * host Google actually sees in `<link rel=canonical>` on the live page. On this
 * site that host is the APEX `https://woodlarkveneer.com` (verified live: both
 * apex and www serve a `canonical` of `https://woodlarkveneer.com/...`, and the
 * platform's own `/sitemap.xml` + `/sitemap-content.xml` are apex-hosted too).
 *
 * We deliberately do NOT reuse `siteUrl()` here: that helper prepends `www.`,
 * but the Tyashin edge normalises the served canonical DOWN to the apex host
 * (the documented `cleanAndAbsolutizeHead` twin-canonical rewrite). That rewrite
 * runs on the HTML <head>, NOT on this XML body — so if this route emitted
 * `www.` `<loc>`s they would ship as-is and MISMATCH the live apex canonical,
 * which makes Google drop the URLs. Deriving the origin straight from the single
 * source-of-truth `siteConfig.domain` (apex, no `www`) matches the live
 * canonical exactly, and is idempotent even if the edge ever did rewrite XML.
 * We do NOT read the request Host: OpenNext strips `x-forwarded-host`, and the
 * raw dispatch Host is the workers.dev target — neither is the canonical host.
 * Build-time constant → the route can be static.
 */
export const dynamic = 'force-static';

// Bare apex origin (no trailing slash) so `${ORIGIN}${path}` is clean.
const ORIGIN = `https://${siteConfig.domain}`.replace(/\/+$/, '');

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET(): Response {
  const lastmod = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (build date)

  const urls = getSiteRoutes()
    .map((route) => {
      const loc = escapeXml(`${ORIGIN}${route.path}`);
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${route.changeFrequency}</changefreq>`,
        `    <priority>${route.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
