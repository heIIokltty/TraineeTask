import type { CryptocurrencyPrice } from '../model/cryptocurrency.types';

export interface CryptoPriceStream {
  connect: () => void;
  disconnect: () => void;
  subscribe: (listener: (prices: ReadonlyArray<CryptocurrencyPrice>) => void) => () => void;
}

export function createCryptoPriceStream(): CryptoPriceStream {
  const listeners = new Set<(prices: ReadonlyArray<CryptocurrencyPrice>) => void>();

  return {
    connect(): void {
      // Real WebSocket integration belongs to the next stage.
    },
    disconnect(): void {
      listeners.clear();
    },
    subscribe(listener): () => void {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
