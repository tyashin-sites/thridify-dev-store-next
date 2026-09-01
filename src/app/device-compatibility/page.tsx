import type { Metadata } from 'next';

// Shopper-facing device guide: will the 3D viewer and AR work on my device?
// Tiers mirror the Thridify platform's actual behaviour (WebGL2 viewer floor,
// Quick Look / Scene Viewer AR, automatic Lite mode on low-memory hardware).
// Linked from the site nav and listed in site-routes.ts (sitemap SSOT).

export const metadata: Metadata = {
  title: 'Device Support',
  description:
    'Which phones, tablets and computers run the 3D and AR experiences in this store — iPhone and iPad support, Android AR requirements, and what to expect on each.',
  alternates: { canonical: '/device-compatibility' },
};

const ARCORE_LIST = 'https://developers.google.com/ar/devices';
const PLAY_AR = 'https://play.google.com/store/apps/details?id=com.google.ar.core';

const ROWS: { device: string; note: string; experience: string }[] = [
  {
    device: 'iPhone Pro & iPad Pro (LiDAR)',
    note: 'iPhone 12 Pro and later Pro models; iPad Pro 2020 and later',
    experience: 'Full 3D and customization; AR places the product almost instantly.',
  },
  {
    device: 'iPhone 13 & later, recent iPads',
    note: 'Including iPhone SE (2022), iPad (2022+), iPad Air (2022+), iPad mini (2021+)',
    experience: 'Full 3D and customization; AR takes a short guided moment to find your floor.',
  },
  {
    device: 'iPhone 11 / 12 / SE (2020), 2019–2021 iPads',
    note: 'Fully supported',
    experience: 'Full 3D; the heaviest scenes may automatically use lighter textures. Guided AR.',
  },
  {
    device: 'Android phones & tablets (2019+)',
    note: 'ARCore-certified devices with Google Play Services for AR',
    experience: 'Full 3D and customization; guided AR via Google Scene Viewer.',
  },
  {
    device: 'Older phones & tablets',
    note: '2 GB memory or less — e.g. iPad Air 2, iPad 5th/6th gen, iPhone 7/8/X',
    experience: 'Automatic Lite mode: lighter textures, smooth browsing. AR where the OS supports it.',
  },
  {
    device: 'Desktop & laptop',
    note: 'Chrome, Edge, Safari 15+, or Firefox',
    experience: 'Full 3D and customization; “View in your space” hands AR to your phone via QR code.',
  },
];

const TIPS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'AR takes a while to find the floor',
    a: 'Normal on devices without LiDAR: move your phone slowly in a small sweep, aim at a floor with visible texture (rugs, wood grain, tiles), and add light if the room is dim.',
  },
  {
    q: 'No AR button on my Android phone?',
    a: (
      <>
        Install or update{' '}
        <a href={PLAY_AR} rel="noopener" className="text-primary underline underline-offset-4">
          Google Play Services for AR
        </a>
        . If the Play Store says it isn&rsquo;t available, your phone isn&rsquo;t on{' '}
        <a href={ARCORE_LIST} rel="noopener" className="text-primary underline underline-offset-4">
          Google&rsquo;s ARCore list
        </a>{' '}
        — the 3D viewer still works fully.
      </>
    ),
  },
  {
    q: 'The 3D view doesn’t appear',
    a: 'Update your browser — the viewer needs one from roughly the last four years (Safari 15+, or current Chrome, Edge, Firefox). Content blockers in private windows can also interfere.',
  },
  {
    q: 'The page reloaded on my older tablet',
    a: 'Older devices have limited graphics memory. The experience detects this and reopens in a lighter mode automatically — a tap on the preview resumes where you left off.',
  },
];

export default function DeviceCompatibilityPage() {
  return (
    <div className="container-tight max-w-4xl py-16">
      <h1 className="text-4xl font-bold">Device support for 3D &amp; AR</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Everything in this store runs right in your browser — no app to install. The experience
        adapts to your device automatically: full quality where the hardware allows it, a lighter
        mode where it doesn&rsquo;t, and augmented reality wherever your phone or tablet supports it.
      </p>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="p-4 font-semibold">Your device</th>
              <th className="p-4 font-semibold">What you get</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.device} className="border-t border-border align-top">
                <th scope="row" className="p-4 font-medium">
                  {row.device}
                  <span className="mt-1 block max-w-xs text-xs font-normal text-muted-foreground">{row.note}</span>
                </th>
                <td className="p-4 text-muted-foreground">{row.experience}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface/60 p-6">
        <h2 className="text-xl font-bold">Using AR without LiDAR</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          On most phones, AR finds your floor by watching how the image shifts as the camera moves —
          expect a short &ldquo;preparing&rdquo; moment, then 5–15 seconds of guided scanning before
          the product appears. Once placed, walk around it, scale it, and see it anchored at true
          size, exactly like on LiDAR devices.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold">Quick fixes</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TIPS.map((tip) => (
          <div key={tip.q} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-semibold">{tip.q}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tip.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Android AR device coverage:{' '}
        <a href={ARCORE_LIST} rel="noopener" className="text-primary underline underline-offset-4">
          developers.google.com/ar/devices
        </a>
        . Capabilities evolve with each release — this page reflects the current platform.
      </p>
    </div>
  );
}
