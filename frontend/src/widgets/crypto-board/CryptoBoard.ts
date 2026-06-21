import { createSelectedCoinsStore } from '../../features/add-cryptocurrency/model/selectedCoins.store';
import { createCryptoDropdown } from '../../features/add-cryptocurrency/ui/CryptoDropdown';
import { createCryptoPriceStream } from '../../entities/cryptocurrency/api/cryptoPriceStream';
import { createCryptocurrencyStore } from '../../entities/cryptocurrency/model/cryptocurrency.store';
import type {
  CryptocurrencyId,
  CryptocurrencyViewModel,
} from '../../entities/cryptocurrency/model/cryptocurrency.types';
import {
  createCryptoCard,
  updateCryptoCardPrice,
} from '../../entities/cryptocurrency/ui/CryptoCard';
import './CryptoBoard.css';

type CryptoBoardSide = 'left' | 'right';

const LEFT_BASE_COIN_IDS: ReadonlyArray<CryptocurrencyId> = [
  'bitcoin',
  'ethereum',
  'xrp',
  'usd-coin',
];

const RIGHT_BASE_COIN_IDS: ReadonlyArray<CryptocurrencyId> = [
  'binance-coin',
  'midnight',
  'dogecoin',
  'sui',
];

const LEFT_ANGLE_RANGE = {
  start: 222,
  end: 138,
} as const;

const RIGHT_ANGLE_RANGE = {
  start: 318,
  end: 402,
} as const;

export function createCryptoBoard(): HTMLElement {
  const store = createCryptocurrencyStore();
  const selectedCoinsStore = createSelectedCoinsStore();
  const priceStream = createCryptoPriceStream();
  const sectionElement = document.createElement('section');
  sectionElement.className = 'crypto-board';
  sectionElement.setAttribute('aria-labelledby', 'crypto-board-title');

  const contentElement = document.createElement('div');
  contentElement.className = 'crypto-board__content';

  const lineLayerElement = document.createElement('div');
  lineLayerElement.className = 'crypto-board__line-layer';
  lineLayerElement.innerHTML = `
    <svg class="crypto-board__frame crypto-board__frame--top-left" viewBox="0 0 330 250" aria-hidden="true">
      <path class="crypto-board__frame-path" pathLength="1" d="M8 238 L8 92 L116 12 L322 12" />
      <circle class="crypto-board__frame-dot crypto-board__frame-dot--start" cx="8" cy="238" r="6" />
      <circle class="crypto-board__frame-dot crypto-board__frame-dot--end" cx="322" cy="12" r="4" />
    </svg>
    <svg class="crypto-board__frame crypto-board__frame--bottom-right" viewBox="0 0 430 160" aria-hidden="true">
      <path class="crypto-board__frame-path" pathLength="1" d="M8 148 L262 148 L334 70 L422 70" />
      <circle class="crypto-board__frame-dot crypto-board__frame-dot--start" cx="8" cy="148" r="5" />
      <circle class="crypto-board__frame-dot crypto-board__frame-dot--end" cx="422" cy="70" r="4" />
    </svg>
  `;

  const centerElement = document.createElement('div');
  centerElement.className = 'crypto-board__center';
  centerElement.innerHTML = `
    <svg class="crypto-board__orbit" viewBox="0 0 700 700" aria-hidden="true">
      <defs>
        <filter id="crypto-board-rough-line">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3.4" />
        </filter>
        <linearGradient id="crypto-board-ring-gradient" x1="70" y1="70" x2="630" y2="630">
          <stop offset="0" stop-color="#78b8f2" stop-opacity="0.28" />
          <stop offset="0.42" stop-color="#7ebdff" stop-opacity="0.82" />
          <stop offset="0.72" stop-color="#3c75b2" stop-opacity="0.44" />
          <stop offset="1" stop-color="#78b8f2" stop-opacity="0.22" />
        </linearGradient>
      </defs>
      <circle class="crypto-board__orbit-line crypto-board__orbit-line--outer" cx="350" cy="350" r="318" />
      <circle class="crypto-board__orbit-line crypto-board__orbit-line--middle" cx="350" cy="350" r="278" />
      <circle class="crypto-board__orbit-line crypto-board__orbit-line--inner" cx="350" cy="350" r="238" />
    </svg>
    <div class="crypto-board__center-content">
      <h2 class="crypto-board__title" id="crypto-board-title">Online Banking</h2>
      <div class="crypto-board__dropdown-slot"></div>
    </div>
  `;

  const cardsElement = document.createElement('div');
  cardsElement.className = 'crypto-board__cards';
  const cardElements = new Map<CryptocurrencyId, HTMLElement>();

  const cryptoDropdown = createCryptoDropdown({
    cryptocurrencies: store.getCryptocurrencies(),
    disabledCoinIds: getVisibleCoinIds(selectedCoinsStore.getState().selectedCoinIds),
    isLimitReached: false,
    onSelect(coinId): void {
      selectedCoinsStore.selectCoin(coinId);
    },
  });
  const dropdownSlot = centerElement.querySelector<HTMLElement>('.crypto-board__dropdown-slot');
  dropdownSlot?.append(cryptoDropdown.element);

  renderCryptoCards();

  const unsubscribeStream = priceStream.subscribe((prices) => {
    store.setPrices(prices);
  });
  const unsubscribeStore = store.subscribe(() => {
    store.getCryptocurrencies().forEach((cryptocurrency) => {
      const cardElement = cardElements.get(cryptocurrency.id);

      if (cardElement) {
        updateCryptoCardPrice(cardElement, cryptocurrency.price);
      }
    });
  });
  const unsubscribeSelectedCoins = selectedCoinsStore.subscribe(() => {
    renderCryptoCards();
  });

  priceStream.connect();
  observeBoardRemoval(sectionElement, () => {
    unsubscribeSelectedCoins();
    unsubscribeStore();
    unsubscribeStream();
    priceStream.disconnect();
  });

  contentElement.append(lineLayerElement, centerElement, cardsElement);
  sectionElement.append(contentElement);

  return sectionElement;

  function renderCryptoCards(): void {
    const selectedCoinIds = selectedCoinsStore.getState().selectedCoinIds;
    const cryptocurrencies = store.getCryptocurrencies();
    const leftCoins = getVisibleSideCoins(cryptocurrencies, selectedCoinIds, 'left');
    const rightCoins = getVisibleSideCoins(cryptocurrencies, selectedCoinIds, 'right');
    const visibleCoinIds = getVisibleCoinIds(selectedCoinIds);

    renderSide(leftCoins, 'left');
    renderSide(rightCoins, 'right');
    cryptoDropdown.update({
      disabledCoinIds: visibleCoinIds,
      isLimitReached: selectedCoinIds.length >= selectedCoinsStore.getState().maxSelectedCoins,
    });
  }

  function renderSide(
    cryptocurrencies: ReadonlyArray<CryptocurrencyViewModel>,
    side: CryptoBoardSide,
  ): void {
    const angleRange = side === 'left' ? LEFT_ANGLE_RANGE : RIGHT_ANGLE_RANGE;

    cryptocurrencies.forEach((cryptocurrency, index) => {
      const cardElement = getOrCreateCardElement(cryptocurrency);
      const angle = getAngleForIndex(index, cryptocurrencies.length, angleRange.start, angleRange.end);

      cardElement.classList.toggle('crypto-card--right', side === 'right');
      cardElement.style.setProperty('--angle', `${angle}deg`);
      cardElement.style.setProperty('--card-shift-x', side === 'right' ? '0%' : '-100%');
      cardsElement.append(cardElement);
      updateCryptoCardPrice(cardElement, cryptocurrency.price);
    });
  }

  function getOrCreateCardElement(cryptocurrency: CryptocurrencyViewModel): HTMLElement {
    const existingCardElement = cardElements.get(cryptocurrency.id);

    if (existingCardElement) {
      return existingCardElement;
    }

    const cardElement = createCryptoCard({ cryptocurrency });
    cardElement.classList.add('crypto-card--enter');
    cardElements.set(cryptocurrency.id, cardElement);

    requestAnimationFrame(() => {
      cardElement.classList.remove('crypto-card--enter');
    });

    return cardElement;
  }
}

function observeBoardRemoval(sectionElement: HTMLElement, cleanup: () => void): void {
  const observer = new MutationObserver(() => {
    if (document.body.contains(sectionElement)) {
      return;
    }

    cleanup();
    observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function getVisibleSideCoins(
  cryptocurrencies: ReadonlyArray<CryptocurrencyViewModel>,
  selectedCoinIds: ReadonlyArray<CryptocurrencyId>,
  side: CryptoBoardSide,
): ReadonlyArray<CryptocurrencyViewModel> {
  const baseCoinIds = side === 'left' ? LEFT_BASE_COIN_IDS : RIGHT_BASE_COIN_IDS;
  const selectedSideCoinIds = getSelectedCoinIdsForSide(selectedCoinIds, side);
  const visibleCoinIds = new Set<CryptocurrencyId>([
    ...baseCoinIds,
    ...selectedSideCoinIds,
  ]);

  return cryptocurrencies.filter((cryptocurrency) => visibleCoinIds.has(cryptocurrency.id));
}

function getSelectedCoinIdsForSide(
  selectedCoinIds: ReadonlyArray<CryptocurrencyId>,
  side: CryptoBoardSide,
): ReadonlyArray<CryptocurrencyId> {
  return selectedCoinIds.filter((_, index) => {
    const shouldPlaceRight = index % 2 === 0;

    return side === 'right' ? shouldPlaceRight : !shouldPlaceRight;
  });
}

function getVisibleCoinIds(
  selectedCoinIds: ReadonlyArray<CryptocurrencyId>,
): ReadonlySet<CryptocurrencyId> {
  return new Set<CryptocurrencyId>([
    ...LEFT_BASE_COIN_IDS,
    ...RIGHT_BASE_COIN_IDS,
    ...selectedCoinIds,
  ]);
}

function getAngleForIndex(
  index: number,
  itemsCount: number,
  startAngle: number,
  endAngle: number,
): number {
  if (itemsCount <= 1) {
    return (startAngle + endAngle) / 2;
  }

  const progress = index / (itemsCount - 1);

  return startAngle + (endAngle - startAngle) * progress;
}
