/**
 * Research Peptides EU — design tokens (logo-derived + biotech system)
 */

export const brandColors = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#93A5FD',
  400: '#5B7FFF',
  500: '#4357D6',
  600: '#3545B8',
  700: '#2D3A9E',
  800: '#252F7A',
  900: '#1A2258',
} as const;

export const neutralColors = {
  navy950: '#0A0F1E',
  slate850: '#141B2D',
  mist50: '#F6F5FF',
  silver400: '#A7B9C8',
  steel600: '#496961',
} as const;

export const semanticColors = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purity: '#22D3EE',
} as const;

export const gradients = {
  hero: 'linear-gradient(135deg, #0A0F1E 0%, #1A2258 50%, #4357D6 100%)',
  cta: 'linear-gradient(90deg, #4357D6, #5B7FFF)',
  glow: 'radial-gradient(ellipse at 50% 0%, rgba(67, 87, 214, 0.35), transparent 70%)',
} as const;

export const fonts = {
  display: '"Sora", system-ui, sans-serif',
  sans: '"DM Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export const spacing = {
  sectionSm: '4rem',
  sectionMd: '6rem',
  sectionLg: '8rem',
} as const;

export const radii = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
} as const;

export const shadows = {
  card: '0 4px 24px rgba(10, 15, 30, 0.08)',
  elevated: '0 12px 48px rgba(67, 87, 214, 0.15)',
  glow: '0 0 40px rgba(67, 87, 214, 0.25)',
} as const;

export const motionDuration = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
} as const;

export const motionSpring = {
  stiffness: 300,
  damping: 30,
} as const;

export const brandName = 'Research Peptides EU' as const;

export const defaultLocale = 'en' as const;
export const defaultCurrency = 'EUR' as const;
