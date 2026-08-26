import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/lib/site';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });

const siteUrl = `https://${siteConfig.domain}`;
const noindex = process.env.ROBOTS_NOINDEX === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.storeName} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.storeName}`,
  },
  description: siteConfig.seoDescription,
  openGraph: {
    type: 'website',
    siteName: siteConfig.storeName,
    title: `${siteConfig.storeName} — ${siteConfig.tagline}`,
    description: siteConfig.seoDescription,
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image', title: siteConfig.storeName, description: siteConfig.seoDescription },
  robots: noindex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="stylesheet" href="/brand-kit.css" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Header />
        <main>{children}</main>
        <Footer />
        <script src="/tyashin-runtime.js" defer />
      </body>
    </html>
  );
}
