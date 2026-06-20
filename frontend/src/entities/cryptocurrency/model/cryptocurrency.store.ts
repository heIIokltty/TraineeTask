import { CRYPTOCURRENCIES } from './cryptocurrency.constants';
import type {
  CryptocurrencyId,
  CryptocurrencyPrice,
  CryptocurrencyPriceListener,
  CryptocurrencyViewModel,
} from './cryptocurrency.types';

export interface CryptocurrencyStore {
  getCryptocurrencies: () => ReadonlyArray<CryptocurrencyViewModel>;
  getPrices: () => ReadonlyArray<CryptocurrencyPrice>;
  setPrices: (prices: ReadonlyArray<CryptocurrencyPrice>) => void;
  subscribe: (listener: CryptocurrencyPriceListener) => () => void;
}

export function createCryptocurrencyStore(): CryptocurrencyStore {
  let prices = CRYPTOCURRENCIES.map((coin) => createLoadingPrice(coin.id));
  const listeners = new Set<CryptocurrencyPriceListener>();

  function getPrices(): ReadonlyArray<CryptocurrencyPrice> {
    return prices;
  }

  function setPrices(nextPrices: ReadonlyArray<CryptocurrencyPrice>): void {
    prices = prices.map((price) => {
      const nextPrice = nextPrices.find((item) => item.coinId === price.coinId);

      return nextPrice ?? price;
    });

    listeners.forEach((listener) => listener(prices));
  }

  function getCryptocurrencies(): ReadonlyArray<CryptocurrencyViewModel> {
    return CRYPTOCURRENCIES.map((coin) => {
      const price = prices.find((item) => item.coinId === coin.id) ?? createLoadingPrice(coin.id);

      return {
        ...coin,
        price,
      };
    });
  }

  function subscribe(listener: CryptocurrencyPriceListener): () => void {
    listeners.add(listener);
    listener(prices);

    return () => {
      listeners.delete(listener);
    };
  }

  return {
    getCryptocurrencies,
    getPrices,
    setPrices,
    subscribe,
  };
}

function createLoadingPrice(coinId: CryptocurrencyId): CryptocurrencyPrice {
  return {
    coinId,
    value: null,
    status: 'loading',
  };
}
