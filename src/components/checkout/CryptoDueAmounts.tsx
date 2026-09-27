import { useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { CRYPTO_WALLETS, cryptoWalletLabel } from '../../lib/paymentConfig';
import { useCryptoQuotes } from '../../lib/cryptoQuotes';
import { formatCurrency } from '../../lib/utils';

type CryptoDueAmountsProps = {
  eurAmount: number;
  variant: 'summary' | 'wallets';
};

export function CryptoDueAmounts({ eurAmount, variant }: CryptoDueAmountsProps) {
  const { quotes, status, quotedAt, refresh } = useCryptoQuotes(eurAmount);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const quotedLabel = quotedAt
    ? quotedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="space-y-3 text-left">
      {status === 'error' && !quotes ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          <p>The live rate could not be loaded, so the exact coin amount is not available yet.</p>
          <button type="button" onClick={refresh} className="mt-2 text-xs font-black uppercase tracking-widest text-brand-700 hover:underline">
            Retry rate
          </button>
        </div>
      ) : null}

      {variant === 'summary'
        ? CRYPTO_WALLETS.map((wallet) => {
            const quote = quotes?.[wallet.id];
            return (
              <div key={wallet.id} className="rounded-2xl bg-white border border-brand-100 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-silver-400">{cryptoWalletLabel(wallet)}</p>
                {quote ? (
                  <p className="mt-1 font-mono text-base font-black text-navy-950">
                    Send exactly {quote.amount} {wallet.symbol}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-steel-600 inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Calculating {wallet.symbol} amount…
                  </p>
                )}
              </div>
            );
          })
        : CRYPTO_WALLETS.map((wallet) => {
            const quote = quotes?.[wallet.id];
            const amountCopyKey = `amount:${wallet.id}`;
            const addressCopyKey = `address:${wallet.id}`;
            return (
              <div key={wallet.id}>
                <p className="text-[10px] font-black uppercase tracking-widest text-silver-400 mb-2">
                  {cryptoWalletLabel(wallet)}
                </p>
                <div className="mb-3 rounded-2xl bg-navy-950 text-white px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-200">Send exactly</p>
                  {quote ? (
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-lg font-black break-all">
                          {quote.amount} {wallet.symbol}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-white/70">
                          {formatCurrency(quote.eurPerCoin)} per {wallet.symbol} · covers {formatCurrency(eurAmount)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(amountCopyKey, `${quote.amount} ${wallet.symbol}`)}
                        className="shrink-0 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 motion-safe:active:scale-95"
                        aria-label={`Copy ${wallet.symbol} amount`}
                      >
                        {copiedKey === amountCopyKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-white/80 inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Calculating {wallet.symbol} amount…
                    </p>
                  )}
                </div>
                {wallet.qrSrc ? (
                  <img
                    src={wallet.qrSrc}
                    alt={`${cryptoWalletLabel(wallet)} payment QR code`}
                    className="mx-auto mb-3 h-44 w-44 rounded-2xl border border-brand-100 bg-white p-2"
                  />
                ) : null}
                <div className="flex items-stretch gap-2">
                  <p className="flex-1 p-3 bg-mist-50 border border-brand-100 rounded-xl font-mono text-xs sm:text-sm font-bold text-navy-950 break-all select-all">
                    {wallet.address}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText(addressCopyKey, wallet.address)}
                    className="px-4 rounded-xl bg-navy-950 text-white hover:bg-navy-900 transition-colors motion-safe:active:scale-95 flex items-center justify-center"
                    aria-label={`Copy ${cryptoWalletLabel(wallet)} address`}
                  >
                    {copiedKey === addressCopyKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}

      <p className="text-xs font-medium text-steel-600 leading-relaxed">
        {quotedLabel
          ? `Amounts use the live rate at ${quotedLabel} and are rounded up to 8 decimal places so the transfer covers ${formatCurrency(eurAmount)}. Send one currency only.`
          : `Each amount is your order total of ${formatCurrency(eurAmount)} converted at the live rate and rounded up to 8 decimal places. Send one currency only.`}
        {quotes ? (
          <>
            {' '}
            <button type="button" onClick={refresh} className="font-black uppercase tracking-widest text-[10px] text-brand-700 hover:underline">
              Refresh rate
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
