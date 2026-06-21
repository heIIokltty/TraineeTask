import type { CryptocurrencyId } from '../../../entities/cryptocurrency/model/cryptocurrency.types';
import type { SelectedCoinsListener, SelectedCoinsState } from './selectedCoins.types';

const MAX_SELECTED_COINS = 6;

export interface SelectedCoinsStore {
  getState: () => SelectedCoinsState;
  selectCoin: (coinId: CryptocurrencyId) => boolean;
  subscribe: (listener: SelectedCoinsListener) => () => void;
}

export function createSelectedCoinsStore(): SelectedCoinsStore {
  let selectedCoinIds: ReadonlyArray<CryptocurrencyId> = [];
  const listeners = new Set<SelectedCoinsListener>();

  function getState(): SelectedCoinsState {
    return {
      selectedCoinIds,
      maxSelectedCoins: MAX_SELECTED_COINS,
    };
  }

  function selectCoin(coinId: CryptocurrencyId): boolean {
    if (selectedCoinIds.includes(coinId) || selectedCoinIds.length >= MAX_SELECTED_COINS) {
      return false;
    }

    selectedCoinIds = [...selectedCoinIds, coinId];
    notify();

    return true;
  }

  function subscribe(listener: SelectedCoinsListener): () => void {
    listeners.add(listener);
    listener(getState());

    return () => {
      listeners.delete(listener);
    };
  }

  function notify(): void {
    const state = getState();
    listeners.forEach((listener) => listener(state));
  }

  return {
    getState,
    selectCoin,
    subscribe,
  };
}
