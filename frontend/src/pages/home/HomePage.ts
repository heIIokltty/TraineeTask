import { createHeader } from '../../widgets/header/Header';
import { createCryptoBoard } from '../../widgets/crypto-board/CryptoBoard';
import { createHeroSection } from '../../widgets/hero/HeroSection';

export function createHomePage(): HTMLElement {
  const pageElement = document.createElement('div');
  pageElement.className = 'home-page';

  const mainElement = document.createElement('main');
  mainElement.className = 'home-page__main';
  mainElement.append(createHeroSection(), createCryptoBoard());

  pageElement.append(createHeader(), mainElement);

  return pageElement;
}
