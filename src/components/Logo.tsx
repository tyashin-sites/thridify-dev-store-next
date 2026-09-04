/**
 * Thridify brand lockup — the official layered-squares mark + green wordmark.
 *
 * Uses the real brand asset at /brand/thridify-logo.png (green "Thridify"
 * wordmark, visible on the light header/footer). This REPLACED an earlier
 * cream-wordmark asset that was invisible on light chrome, and a stopgap
 * inline-SVG approximation. `className` controls the rendered height.
 */
export function Logo({ className = 'h-7' }: { className?: string }) {
  return (
    <img
      src="/brand/thridify-logo.png"
      alt="Thridify"
      className={`${className} w-auto`}
    />
  );
}
