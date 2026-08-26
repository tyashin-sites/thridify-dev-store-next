import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();

const PROJECT_SLUG = 'thridifydev-website-mt9w4dmf';
const SITES_HOST = `https://${PROJECT_SLUG}.sites.tyashin.com`;

const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https' as const, hostname: '**' }] },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_TYASHIN_API_KEY: process.env.TYASHIN_API_KEY || 'ak_a8CdSleuHevXEhKQveUQwWCNRgenlq4O',
    NEXT_PUBLIC_TYASHIN_API_URL: process.env.TYASHIN_API_URL || 'https://website-api.tyashin.com',
    NEXT_PUBLIC_TYASHIN_STOREFRONT_URL:
      process.env.TYASHIN_STOREFRONT_URL ||
      'https://website-api.tyashin.com/api/v1/public/ecommerce',
    NEXT_PUBLIC_PROJECT_ID: process.env.PROJECT_ID || '6a8eb17da22ad461bb5634bd',
    NEXT_PUBLIC_SITE_DOMAIN: process.env.SITE_DOMAIN || 'thridifydev-website-mt9w4dmf.sites.tyashin.com',
  },
  // Rewrites only fire on direct *.workers.dev access — in production the Tyashin
  // dispatch intercepts these platform paths before the Worker is invoked.
  async rewrites() {
    return [
      { source: '/brand-kit.css', destination: `${SITES_HOST}/brand-kit.css` },
      { source: '/tyashin-runtime.js', destination: `${SITES_HOST}/tyashin-runtime.js` },
      { source: '/sitemap.xml', destination: `${SITES_HOST}/sitemap.xml` },
    ];
  },
};

export default nextConfig;
