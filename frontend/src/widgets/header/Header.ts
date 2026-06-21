import './Header.css';

const navigationItems = ['HOME', 'ABOUT US', 'PROJECTS', 'CONTACT US'] as const;

function createNavigationItem(label: string): HTMLLIElement {
  const itemElement = document.createElement('li');
  itemElement.className = 'header__nav-item';

  const linkElement = document.createElement('a');
  linkElement.className = 'header__nav-link';
  linkElement.href = '#';
  linkElement.textContent = label;

  itemElement.append(linkElement);

  return itemElement;
}

export function createHeader(): HTMLElement {
  const headerElement = document.createElement('header');
  headerElement.className = 'header';

  const innerElement = document.createElement('div');
  innerElement.className = 'header__inner';

  const logoElement = document.createElement('a');
  logoElement.className = 'header__logo';
  logoElement.href = '/';
  logoElement.setAttribute('aria-label', 'KAIROS home');

  const logoImage = document.createElement('img');
  logoImage.className = 'header__logo-image';
  logoImage.src = '/assets/kairos-logo.png';
  logoImage.alt = 'KAIROS';

  logoElement.append(logoImage);

  const navigationElement = document.createElement('nav');
  navigationElement.className = 'header__nav';
  navigationElement.setAttribute('aria-label', 'Primary navigation');

  const listElement = document.createElement('ul');
  listElement.className = 'header__nav-list';
  navigationItems.forEach((item) => listElement.append(createNavigationItem(item)));

  navigationElement.append(listElement);
  innerElement.append(logoElement, navigationElement);
  headerElement.append(innerElement);

  return headerElement;
}
