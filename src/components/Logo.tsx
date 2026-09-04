/**
 * Thridify brand lockup — the layered-squares mark + the wordmark.
 *
 * Why not the /brand/thridify-logo.png asset: that PNG's wordmark is a light
 * cream colour meant for a DARK background. On this store's light header/footer
 * it is effectively invisible (only the coloured icon shows). This lockup is
 * drawn inline (crisp at any size) with the wordmark in `text-foreground`, so it
 * stays legible in both light and dark themes. `className` controls the height.
 */
export function Logo({ className = 'h-7' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-auto shrink-0" role="img" aria-label="Thridify">
        {/* three overlapping rounded squares — the "layers" motif */}
        <rect x="4.5" y="4.5" width="20" height="20" rx="6" fill="#EFB6C1" />
        <rect x="10" y="10" width="20" height="20" rx="6" fill="#F6DDE2" />
        <rect x="15.5" y="15.5" width="20" height="20" rx="6" fill="#2E7D64" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-foreground">Thridify</span>
    </span>
  );
}
