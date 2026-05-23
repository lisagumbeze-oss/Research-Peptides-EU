/**
 * Research Peptides EU — design tokens (teal → navy logo gradient)
 */

export const brandColors = {
  50: '#ECFBF8',
  100: '#C8F2EB',
  200: '#8FE3D5',
  300: '#52D4C3',
  400: '#2DB5A3',
  500: '#249688',
  600: '#1D7A73',
  700: '#176861',
  800: '#145650',
  900: '#1A365D',
} as const;

export const neutralColors = {
  navy950: '#0F2744',
  navy900: '#1A365D',
  slate850: '#152238',
  mist50: '#F4FAF9',
  silver400: '#8FA8B8',
  steel600: '#4A6170',
} as const;

export const semanticColors = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purity: '#2DB5A3',
} as const;

export const gradients = {
  hero: 'linear-gradient(135deg, #0F2744 0%, #1A365D 45%, #1D7A73 100%)',
  cta: 'linear-gradient(90deg, #2DB5A3, #1A365D)',
  brand: 'linear-gradient(90deg, #2DB5A3, #3DC9B6, #1A365D)',
  glow: 'radial-gradient(ellipse at 50% 0%, rgba(45, 181, 163, 0.32), transparent 70%)',
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
  card: '0 4px 24px rgba(15, 39, 68, 0.08)',
  elevated: '0 12px 48px rgba(45, 181, 163, 0.18)',
  glow: '0 0 40px rgba(45, 181, 163, 0.28)',
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
