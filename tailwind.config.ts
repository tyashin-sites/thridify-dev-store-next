import type { Config } from 'tailwindcss';

// Thridify design tokens. CSS vars in globals.css hold RAW HSL channels
// (e.g. `--primary: 163 100% 22%`). Wrapping with `hsl(... / <alpha-value>)`
// here makes utilities like `text-primary/90` and `bg-surface/60` valid in v3.
const hslVar = (name: string) => `hsl(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1320px' } },
    extend: {
      colors: {
        background: hslVar('--background'),
        foreground: hslVar('--foreground'),
        surface: hslVar('--surface'),
        card: { DEFAULT: hslVar('--card'), foreground: hslVar('--card-foreground') },
        primary: { DEFAULT: hslVar('--primary'), foreground: hslVar('--primary-foreground') },
        accent: { DEFAULT: hslVar('--accent'), foreground: hslVar('--accent-foreground') },
        muted: { DEFAULT: hslVar('--muted'), foreground: hslVar('--muted-foreground') },
        border: hslVar('--border'),
        input: hslVar('--input'),
        ring: hslVar('--ring'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
        '3xl': 'calc(var(--radius) + 18px)',
      },
      boxShadow: {
        soft: '0 1px 2px hsl(163 40% 10% / 0.04), 0 8px 24px hsl(163 40% 10% / 0.06)',
        lift: '0 2px 4px hsl(163 40% 10% / 0.05), 0 18px 40px hsl(163 40% 10% / 0.10)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
