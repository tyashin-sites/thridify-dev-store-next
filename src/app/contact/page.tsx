import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Thridify about 3D and AR product experiences.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="container-tight max-w-2xl py-16">
      <h1 className="text-4xl font-bold">Contact Thridify</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Like what you see in this demo store? Reach out and we&apos;ll show you how Thridify can bring
        the same interactive 3D and AR to your own products.
      </p>

      <div className="mt-10 space-y-4">
        <a href={`mailto:${siteConfig.email}`} className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:border-primary">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Email</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{siteConfig.email}</p>
          </div>
          <span className="text-primary">→</span>
        </a>
        <a href={siteConfig.website} target="_blank" rel="noopener" className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:border-primary">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Website</p>
            <p className="mt-1 text-lg font-semibold text-foreground">thridify.com</p>
          </div>
          <span className="text-primary">→</span>
        </a>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface/60 p-6 text-sm text-muted-foreground">
        This is a demonstration store. Products shown here are for 3D/AR demonstration and are not for sale.
      </div>
    </div>
  );
}
