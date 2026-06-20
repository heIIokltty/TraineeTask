import type {
  CryptocurrencyPrice,
  CryptocurrencyViewModel,
} from '../model/cryptocurrency.types';
import './CryptoCard.css';

interface CryptoCardOptions {
  cryptocurrency: CryptocurrencyViewModel;
}

export function createCryptoCard({ cryptocurrency }: CryptoCardOptions): HTMLElement {
  const cardElement = document.createElement('article');
  cardElement.className = 'crypto-card';
  cardElement.dataset.coinId = cryptocurrency.id;
  cardElement.style.setProperty('--crypto-card-accent', cryptocurrency.accentColor);

  const priceElement = document.createElement('p');
  priceElement.className = 'crypto-card__price';
  priceElement.textContent = formatPrice(cryptocurrency.price);

  const nameElement = document.createElement('h3');
  nameElement.className = 'crypto-card__name';
  nameElement.textContent = cryptocurrency.name;

  const iconElement = document.createElement('span');
  iconElement.className = 'crypto-card__icon';
  iconElement.textContent = cryptocurrency.symbol.slice(0, 1);
  iconElement.setAttribute('aria-hidden', 'true');

  cardElement.append(priceElement, nameElement, iconElement);

  return cardElement;
}

export function updateCryptoCardPrice(
  cardElement: HTMLElement,
  price: CryptocurrencyPrice,
): void {
  const priceElement = cardElement.querySelector<HTMLElement>('.crypto-card__price');

  if (!priceElement) {
    return;
  }

  priceElement.textContent = formatPrice(price);
}

function formatPrice(price: CryptocurrencyPrice): string {
  if (price.status === 'loading') {
    return 'Loading';
  }

  if (price.value === null) {
    return 'Unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price.value >= 1 ? 2 : 4,
    maximumFractionDigits: price.value >= 1 ? 3 : 5,
  }).format(price.value);
}
