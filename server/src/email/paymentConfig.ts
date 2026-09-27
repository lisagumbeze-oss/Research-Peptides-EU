/** Manual cryptocurrency wallets for local/server email templates. */
export type CryptoWallet = {
  id: string;
  name: string;
  symbol: string;
  network?: string;
  address: string;
  /** Public path to a payment QR image. */
  qrSrc?: string;
  /** CoinGecko id used to convert the euro total into this coin. */
  priceId: string;
};

export const CRYPTO_WALLETS: CryptoWallet[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: process.env.BTC_PAYMENT_ADDRESS || 'bc1qzsn5djk2pklr49hepvpu4ckzwj9tujkxtdlqma',
    qrSrc: '/crypto/btc-qr.png',
    priceId: 'bitcoin',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x5fad5A80927C763C4037A7c07051910747E8179d',
    qrSrc: '/crypto/eth-qr.png',
    priceId: 'ethereum',
  },
  {
    id: 'bch',
    name: 'Bitcoin Cash',
    symbol: 'BCH',
    address: 'qptpfw320hvdrk0xutpg2kdhauruwle65uxzz7p57v',
    qrSrc: '/crypto/bch-qr.png',
    priceId: 'bitcoin-cash',
  },
];

export function cryptoWalletLabel(wallet: CryptoWallet) {
  const base = `${wallet.name} (${wallet.symbol})`;
  return wallet.network ? `${base} · ${wallet.network}` : base;
}

/** Kept for existing Bitcoin-specific email references. */
export const BTC_PAYMENT_ADDRESS =
  CRYPTO_WALLETS.find((wallet) => wallet.id === 'btc')?.address ?? '';

export function isCryptoPaymentMethod(method: string | undefined) {
  const value = String(method || '').toLowerCase().trim();
  return value === 'crypto' || value === 'cryptocurrency' || value === 'bitcoin' || value === 'btc';
}

/** Keep in sync with src/lib/paymentConfig.ts */
export const CRYPTO_PAYMENT_DISCOUNT_PERCENT = 10;
