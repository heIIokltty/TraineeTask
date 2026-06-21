import type {
  Cryptocurrency,
  CryptocurrencyId,
} from '../../../entities/cryptocurrency/model/cryptocurrency.types';
import './CryptoDropdown.css';

interface CryptoDropdownOptions {
  cryptocurrencies: ReadonlyArray<Cryptocurrency>;
  disabledCoinIds: ReadonlySet<CryptocurrencyId>;
  isLimitReached: boolean;
  onSelect: (coinId: CryptocurrencyId) => void;
}

interface CryptoDropdownUpdateOptions {
  disabledCoinIds: ReadonlySet<CryptocurrencyId>;
  isLimitReached: boolean;
}

export interface CryptoDropdown {
  element: HTMLElement;
  update: (options: CryptoDropdownUpdateOptions) => void;
}

export function createCryptoDropdown(options: CryptoDropdownOptions): CryptoDropdown {
  let disabledCoinIds = options.disabledCoinIds;
  let isLimitReached = options.isLimitReached;
  let focusedIndex = -1;

  const rootElement = document.createElement('div');
  rootElement.className = 'crypto-dropdown';

  const triggerElement = document.createElement('button');
  triggerElement.className = 'crypto-dropdown__trigger';
  triggerElement.type = 'button';
  triggerElement.setAttribute('aria-haspopup', 'listbox');
  triggerElement.setAttribute('aria-expanded', 'false');
  triggerElement.innerHTML = `
    <span>Add a Cryptocurrency</span>
    <span aria-hidden="true">›</span>
  `;

  const menuElement = document.createElement('div');
  menuElement.className = 'crypto-dropdown__menu';
  menuElement.setAttribute('role', 'listbox');
  menuElement.hidden = true;

  const optionButtons = options.cryptocurrencies.map((cryptocurrency) => {
    const optionElement = document.createElement('button');
    optionElement.className = 'crypto-dropdown__option';
    optionElement.type = 'button';
    optionElement.setAttribute('role', 'option');
    optionElement.dataset.coinId = cryptocurrency.id;

    const iconElement = document.createElement('span');
    iconElement.className = 'crypto-dropdown__option-icon';
    iconElement.style.setProperty('--crypto-dropdown-accent', cryptocurrency.accentColor);
    iconElement.textContent = cryptocurrency.symbol.slice(0, 1);
    iconElement.setAttribute('aria-hidden', 'true');

    const nameElement = document.createElement('span');
    nameElement.className = 'crypto-dropdown__option-name';
    nameElement.textContent = cryptocurrency.name;

    const statusElement = document.createElement('span');
    statusElement.className = 'crypto-dropdown__option-status';

    optionElement.append(iconElement, nameElement, statusElement);
    optionElement.addEventListener('click', () => {
      if (optionElement.disabled) {
        return;
      }

      options.onSelect(cryptocurrency.id);
      closeDropdown();
      triggerElement.focus();
    });

    menuElement.append(optionElement);

    return optionElement;
  });

  triggerElement.addEventListener('click', () => {
    if (menuElement.hidden) {
      openDropdown();
      return;
    }

    closeDropdown();
  });

  rootElement.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDropdown();
      triggerElement.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusNextOption(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusNextOption(-1);
    }
  });

  document.addEventListener('click', (event) => {
    if (!rootElement.contains(event.target as Node)) {
      closeDropdown();
    }
  });

  rootElement.append(triggerElement, menuElement);
  updateOptions();

  return {
    element: rootElement,
    update(updateOptionsValue): void {
      disabledCoinIds = updateOptionsValue.disabledCoinIds;
      isLimitReached = updateOptionsValue.isLimitReached;
      updateOptions();
    },
  };

  function openDropdown(): void {
    menuElement.hidden = false;
    triggerElement.setAttribute('aria-expanded', 'true');
    focusedIndex = -1;
  }

  function closeDropdown(): void {
    menuElement.hidden = true;
    triggerElement.setAttribute('aria-expanded', 'false');
    focusedIndex = -1;
  }

  function focusNextOption(direction: 1 | -1): void {
    if (menuElement.hidden) {
      openDropdown();
    }

    const enabledOptions = optionButtons.filter((button) => !button.disabled);

    if (enabledOptions.length === 0) {
      return;
    }

    focusedIndex =
      focusedIndex === -1
        ? direction === 1
          ? 0
          : enabledOptions.length - 1
        : (focusedIndex + direction + enabledOptions.length) % enabledOptions.length;

    enabledOptions[focusedIndex].focus();
  }

  function updateOptions(): void {
    optionButtons.forEach((optionElement) => {
      const coinId = optionElement.dataset.coinId as CryptocurrencyId;
      const isAlreadyVisible = disabledCoinIds.has(coinId);
      const isDisabled = isAlreadyVisible || isLimitReached;
      const statusElement = optionElement.querySelector<HTMLElement>(
        '.crypto-dropdown__option-status',
      );

      optionElement.disabled = isDisabled;
      optionElement.setAttribute('aria-selected', String(isAlreadyVisible));
      optionElement.classList.toggle('crypto-dropdown__option--selected', isAlreadyVisible);

      if (statusElement) {
        statusElement.textContent = isAlreadyVisible ? 'Added' : isLimitReached ? 'Limit' : '';
      }
    });
  }
}
