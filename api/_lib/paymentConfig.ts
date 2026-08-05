/** Manual Bitcoin payment details shown in order emails. */
export const BTC_PAYMENT_ADDRESS =
  process.env.BTC_PAYMENT_ADDRESS || '1CED26bTSz4JVWzrQCe3vCoxYfAwj95bFN';

export function isCryptoPaymentMethod(method: string | undefined) {
  const value = String(method || '').toLowerCase().trim();
  return value === 'crypto' || value === 'cryptocurrency' || value === 'bitcoin' || value === 'btc';
}
