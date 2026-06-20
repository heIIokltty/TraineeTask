export type CryptocurrencyId =
  | 'bitcoin'
  | 'ethereum'
  | 'solana'
  | 'xrp'
  | 'usd-coin'
  | 'binance-coin'
  | 'midnight'
  | 'dogecoin'
  | 'sui'
  | 'tether';

export type CryptocurrencyPriceStatus = 'loading' | 'ready' | 'error';

export interface Cryptocurrency {
  id: CryptocurrencyId;
  name: string;
  symbol: string;
  accentColor: string;
}

export interface CryptocurrencyPrice {
  coinId: CryptocurrencyId;
  value: number | null;
  status: CryptocurrencyPriceStatus;
}

export interface CryptocurrencyViewModel extends Cryptocurrency {
  price: CryptocurrencyPrice;
}

export type CryptocurrencyPriceListener = (
  prices: ReadonlyArray<CryptocurrencyPrice>,
) => void;
