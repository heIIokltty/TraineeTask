import type { Cryptocurrency, CryptocurrencyPrice } from './cryptocurrency.types';

export const CRYPTOCURRENCIES: ReadonlyArray<Cryptocurrency> = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    accentColor: '#f5a623',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    accentColor: '#8f93ff',
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    accentColor: '#8b5cff',
  },
  {
    id: 'xrp',
    name: 'XRP',
    symbol: 'XRP',
    accentColor: '#4a4f58',
  },
  {
    id: 'usd-coin',
    name: 'USD Coin',
    symbol: 'USDC',
    accentColor: '#2775ca',
  },
  {
    id: 'binance-coin',
    name: 'Binance Coin',
    symbol: 'BNB',
    accentColor: '#f3ba2f',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    symbol: 'MID',
    accentColor: '#0d1117',
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    accentColor: '#c2a633',
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    accentColor: '#6fbcf0',
  },
  {
    id: 'tether',
    name: 'Tether',
    symbol: 'USDT',
    accentColor: '#26a17b',
  },
];

export const MOCK_CRYPTOCURRENCY_PRICES: ReadonlyArray<CryptocurrencyPrice> = [
  { coinId: 'bitcoin', value: 87965.62, status: 'ready' },
  { coinId: 'ethereum', value: 2950.04, status: 'ready' },
  { coinId: 'solana', value: 124.53, status: 'ready' },
  { coinId: 'xrp', value: 1.862, status: 'ready' },
  { coinId: 'usd-coin', value: 0.9997, status: 'ready' },
  { coinId: 'binance-coin', value: 844.91, status: 'ready' },
  { coinId: 'midnight', value: 0.06398, status: 'ready' },
  { coinId: 'dogecoin', value: 0.1278, status: 'ready' },
  { coinId: 'sui', value: 1.427, status: 'ready' },
  { coinId: 'tether', value: 1, status: 'ready' },
];
