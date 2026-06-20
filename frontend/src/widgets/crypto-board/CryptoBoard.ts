import { createCryptocurrencyStore } from '../../entities/cryptocurrency/model/cryptocurrency.store';
import { createCryptoCard } from '../../entities/cryptocurrency/ui/CryptoCard';
import './CryptoBoard.css';

const CRYPTO_ORBIT_ANGLES = [
  '222deg',
  '200deg',
  '180deg',
  '160deg',
  '138deg',
  '318deg',
  '340deg',
  '0deg',
  '20deg',
  '42deg',
] as const;

export function createCryptoBoard(): HTMLElement {
  const store = createCryptocurrencyStore();
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
      <button class="crypto-board__add-button" type="button">
        <span>Add a Cryptocurrency</span>
        <span aria-hidden="true">&gt;</span>
      </button>
    </div>
  `;

  const cardsElement = document.createElement('div');
  cardsElement.className = 'crypto-board__cards';

  const cryptocurrencies = store.getCryptocurrencies();
  cryptocurrencies.forEach((cryptocurrency, index) => {
    const cardElement = createCryptoCard({ cryptocurrency });
    cardElement.classList.add(`crypto-card--orbit-${index + 1}`);
    cardElement.style.setProperty('--angle', CRYPTO_ORBIT_ANGLES[index]);

    if (index >= cryptocurrencies.length / 2) {
      cardElement.classList.add('crypto-card--right');
      cardElement.style.setProperty('--card-shift-x', '0%');
    } else {
      cardElement.style.setProperty('--card-shift-x', '-100%');
    }

    cardsElement.append(cardElement);
  });

  contentElement.append(lineLayerElement, centerElement, cardsElement);
  sectionElement.append(contentElement);

  return sectionElement;
}
