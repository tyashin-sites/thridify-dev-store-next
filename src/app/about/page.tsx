import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'About this Thridify demo store — 3D and AR product experiences for modern commerce.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="container-tight max-w-3xl py-16">
      <h1 className="text-4xl font-bold">A store you can walk around</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        This is a demonstration store built to show what Thridify does: it turns ordinary product
        listings into interactive 3D and augmented-reality experiences. Every item here can be spun,
        zoomed and inspected in real time — and placed into your own room, at true scale, with AR.
      </p>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Shoppers understand a product far better when they can see it from every angle and preview it
        in their space. That confidence means fewer doubts, fewer returns, and more delight. Thridify
        makes it possible without special apps or plugins — it all runs right in the browser.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ['Real-time 3D', 'Interactive models that load fast and look true to life.'],
          ['Augmented reality', 'Place products in the real world from any modern phone.'],
          ['Made for commerce', 'Drops into product pages across platforms and storefronts.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-surface/60 p-8 text-center">
        <h2 className="text-2xl font-bold">Bring 3D &amp; AR to your catalog</h2>
        <p className="mt-2 text-muted-foreground">Talk to the Thridify team about your products.</p>
        <a href={siteConfig.contactUrl} target="_blank" rel="noopener" className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Contact Thridify
        </a>
      </div>
    </div>
  );
}
