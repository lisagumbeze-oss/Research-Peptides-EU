import { useEffect, useMemo, useRef, useState } from 'react';
import { CRYPTO_WALLETS } from './paymentConfig';

const QUOTE_DECIMALS = 8;

export type CryptoQuote = {
  amount: string;
  eurPerCoin: number;
};

/**
 * Convert a euro total into a coin amount and round up to 8 decimal places
 * so the transfer is never short of the order total at the quoted rate.
 */
export function quoteCryptoAmount(eurAmount: number, eurPerCoin: number, decimals = QUOTE_DECIMALS): string {
  if (!Number.isFinite(eurAmount) || eurAmount < 0) return '';
  if (!Number.isFinite(eurPerCoin) || eurPerCoin <= 0) return '';
  const scale = 10 ** decimals;
  if (eurAmount === 0) return (0).toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '') || '0';
  const raw = (eurAmount / eurPerCoin) * scale;
  const units = Math.max(0, Math.ceil(raw - 1e-6));
  return (units / scale).toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
}

export async function fetchEurRates(): Promise<Record<string, number>> {
  const ids = CRYPTO_WALLETS.map((wallet) => wallet.priceId).join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=eur`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) {
    throw new Error('Could not load cryptocurrency rates.');
  }
  const body = (await response.json()) as Record<string, { eur?: number }>;
  const rates: Record<string, number> = {};
  for (const wallet of CRYPTO_WALLETS) {
    const eurPerCoin = Number(body[wallet.priceId]?.eur);
    if (!Number.isFinite(eurPerCoin) || eurPerCoin <= 0) {
      throw new Error(`Missing ${wallet.symbol} rate.`);
    }
    rates[wallet.id] = eurPerCoin;
  }
  return rates;
}

export function quotesFromRates(eurAmount: number, rates: Record<string, number>): Record<string, CryptoQuote> {
  const quotes: Record<string, CryptoQuote> = {};
  for (const wallet of CRYPTO_WALLETS) {
    const eurPerCoin = rates[wallet.id];
    if (!eurPerCoin) continue;
    quotes[wallet.id] = {
      eurPerCoin,
      amount: quoteCryptoAmount(eurAmount, eurPerCoin),
    };
  }
  return quotes;
}

export function useCryptoQuotes(eurAmount: number) {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [quotedAt, setQuotedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const hasRates = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!hasRates.current) setStatus('loading');
    fetchEurRates()
      .then((next) => {
        if (cancelled) return;
        hasRates.current = true;
        setRates(next);
        setQuotedAt(new Date());
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        if (!hasRates.current) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const quotes = useMemo(() => (rates ? quotesFromRates(eurAmount, rates) : null), [rates, eurAmount]);

  return {
    quotes,
    status,
    quotedAt,
    refresh: () => setReloadKey((value) => value + 1),
  };
}
