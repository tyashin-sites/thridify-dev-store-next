// Single source of truth for this store's identity. Every canonical, OG URL and
// piece of chrome reads from here. This is a Thridify demo storefront on Tyashin —
// the conversion action is "Contact Thridify", NOT add-to-cart.
export const siteConfig = {
  name: 'Thridify',
  storeName: 'Thridify Dev Store',
  tagline: 'See it in 3D. Place it in your space.',
  description:
    'An interactive demo store where every product comes alive in real-time 3D and augmented reality — powered by Thridify.',
  seoDescription:
    'Thridify turns flat product photos into interactive 3D and AR experiences. Explore this demo store: spin any product in 3D, view it in your own room with AR, then talk to Thridify about bringing it to your catalog.',
  // No custom domain yet — the Tyashin slug host. Override via env at build.
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'thridifydev-website-mt9w4dmf.sites.tyashin.com',
  email: 'hello@thridify.com',
  website: 'https://thridify.com',
  // "Contact Thridify" destinations (real facts only — no invented phone/address).
  contactUrl: 'https://thridify.com',
  socials: {
    website: 'https://thridify.com',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Device Support', href: '/device-compatibility' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
