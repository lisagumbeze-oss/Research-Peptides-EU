/** Central brand & contact constants for Research Peptides EU */

export const BRAND_NAME = 'Research Peptides EU';
export const BRAND_SHORT = 'Research Peptides EU';
export const LEGAL_ENTITY = 'Research Peptides EU B.V.';

export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || 'info@researchpeptide.eu';

export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://www.researchpeptide.eu';

/** Single-line NAP for footers and copy */
export const HQ_LOCATION = 'Vivaldistraat 19, 5283 KP Boxtel, North Brabant, Netherlands';

/** Structured address — keep in sync with LocalBusiness schema */
export const HQ_ADDRESS = {
  streetAddress: 'Vivaldistraat 19',
  postalCode: '5283 KP',
  addressLocality: 'Boxtel',
  addressRegion: 'North Brabant',
  addressCountry: 'NL',
} as const;

export const BRAND_DESCRIPTION =
  'Premium research-grade peptides and compounds for European laboratories. Third-party tested, EUR pricing, EU distribution from the Netherlands. Laboratory research use only.';

/** Absolute default social / schema image (served from /public) */
export function defaultOgImageUrl(origin = SITE_URL.replace(/\/+$/, '')): string {
  return `${origin}/brand_logo.png`;
}

export function siteOriginFromConfig(): string {
  return SITE_URL.replace(/\/+$/, '').replace(
    '://researchpeptide.eu',
    '://www.researchpeptide.eu',
  );
}

export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || '+31612345678';

export function buildWhatsAppLink(productTitle: string, routePath: string): string {
  const origin = siteOriginFromConfig();
  const fullUrl = `${origin}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
  const text = `Hello! I would like to inquire about ${productTitle} (${fullUrl})`;
  const cleanNumber = WHATSAPP_NUMBER.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

