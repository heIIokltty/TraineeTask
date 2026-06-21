import type { CryptocurrencyId } from '../../../entities/cryptocurrency/model/cryptocurrency.types';
import type { SelectedCoinsListener, SelectedCoinsState } from './selectedCoins.types';

const MAX_SELECTED_COINS = 16;

export interface SelectedCoinsStore {
  getState: () => SelectedCoinsState;
  showCoin: (coinId: CryptocurrencyId) => boolean;
  hideCoin: (coinId: CryptocurrencyId) => boolean;
  toggleCoin: (coinId: CryptocurrencyId) => boolean;
  subscribe: (listener: SelectedCoinsListener) => () => void;
}

export function createSelectedCoinsStore(
  initialVisibleCoinIds: ReadonlyArray<CryptocurrencyId>,
): SelectedCoinsStore {
  let visibleCoinIds: ReadonlyArray<CryptocurrencyId> = [...initialVisibleCoinIds];
  const listeners = new Set<SelectedCoinsListener>();

  function getState(): SelectedCoinsState {
    return {
      visibleCoinIds,
      maxSelectedCoins: MAX_SELECTED_COINS,
    };
  }

  function showCoin(coinId: CryptocurrencyId): boolean {
    if (visibleCoinIds.includes(coinId) || visibleCoinIds.length >= MAX_SELECTED_COINS) {
      return false;
    }

    visibleCoinIds = [...visibleCoinIds, coinId];
    notify();

    return true;
  }

  function hideCoin(coinId: CryptocurrencyId): boolean {
    if (!visibleCoinIds.includes(coinId) || visibleCoinIds.length <= 1) {
      return false;
    }

    visibleCoinIds = visibleCoinIds.filter((visibleCoinId) => visibleCoinId !== coinId);
    notify();

    return true;
  }

  function toggleCoin(coinId: CryptocurrencyId): boolean {
    if (visibleCoinIds.includes(coinId)) {
      return hideCoin(coinId);
    }

    return showCoin(coinId);
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
    hideCoin,
    showCoin,
    subscribe,
    toggleCoin,
  };
}
