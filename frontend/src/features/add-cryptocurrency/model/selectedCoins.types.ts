import type { CryptocurrencyId } from '../../../entities/cryptocurrency/model/cryptocurrency.types';

export interface SelectedCoinsState {
  visibleCoinIds: ReadonlyArray<CryptocurrencyId>;
  maxSelectedCoins: number;
}

export type SelectedCoinsListener = (state: SelectedCoinsState) => void;
