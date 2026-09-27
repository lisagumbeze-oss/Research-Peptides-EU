import { CRYPTO_WALLETS } from './paymentConfig.js';

const QUOTE_DECIMALS = 8;

export type CryptoQuote = {
  amount: string;
  eurPerCoin: number;
};

export function quoteCryptoAmount(eurAmount: number, eurPerCoin: number, decimals = QUOTE_DECIMALS): string {
  if (!Number.isFinite(eurAmount) || eurAmount < 0) return '';
  if (!Number.isFinite(eurPerCoin) || eurPerCoin <= 0) return '';
  const scale = 10 ** decimals;
  if (eurAmount === 0) return '0';
  const raw = (eurAmount / eurPerCoin) * scale;
  const units = Math.max(0, Math.ceil(raw - 1e-6));
  return (units / scale).toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
}

export async function fetchCryptoQuotes(eurAmount: number): Promise<Record<string, CryptoQuote>> {
  const ids = CRYPTO_WALLETS.map((wallet) => wallet.priceId).join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=eur`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) {
    throw new Error('Could not load cryptocurrency rates.');
  }
  const body = (await response.json()) as Record<string, { eur?: number }>;
  const quotes: Record<string, CryptoQuote> = {};
  for (const wallet of CRYPTO_WALLETS) {
    const eurPerCoin = Number(body[wallet.priceId]?.eur);
    if (!Number.isFinite(eurPerCoin) || eurPerCoin <= 0) {
      throw new Error(`Missing ${wallet.symbol} rate.`);
    }
    quotes[wallet.id] = {
      eurPerCoin,
      amount: quoteCryptoAmount(eurAmount, eurPerCoin),
    };
  }
  return quotes;
}
