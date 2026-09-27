/** Manual cryptocurrency wallets shown at checkout after an order is placed. */
export type CryptoWallet = {
  id: string;
  name: string;
  symbol: string;
  /** Optional network label, e.g. "TRC20" or "ERC20". */
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
    address: 'bc1qzsn5djk2pklr49hepvpu4ckzwj9tujkxtdlqma',
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

/** Automatic discount applied to the product subtotal when cryptocurrency is selected. Shipping is excluded. */
export const CRYPTO_PAYMENT_DISCOUNT_PERCENT = 10;

export function cryptoPaymentDiscountAmount(merchandiseNet: number) {
  const base = Math.max(0, merchandiseNet);
  return Math.round(base * (CRYPTO_PAYMENT_DISCOUNT_PERCENT / 100) * 100) / 100;
}

export function cryptoWalletLabel(wallet: CryptoWallet) {
  const base = `${wallet.name} (${wallet.symbol})`;
  return wallet.network ? `${base} · ${wallet.network}` : base;
}

/** Kept for existing Bitcoin-specific email and admin references. */
export const BTC_PAYMENT_ADDRESS =
  CRYPTO_WALLETS.find((wallet) => wallet.id === 'btc')?.address ?? '';
