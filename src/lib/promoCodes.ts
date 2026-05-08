export const PRIMARY_PROMO_CODE = 'PEPTIDE10';
export const PROMO_DISCOUNT_PERCENT = 10;

export function normalizePromoCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidPromoCode(input: string): boolean {
  const normalized = normalizePromoCode(input);
  // Keep backward compatibility with old checkout copy while standardizing displays to PRIMARY_PROMO_CODE.
  return normalized === PRIMARY_PROMO_CODE || normalized === 'PEPTI10';
}
