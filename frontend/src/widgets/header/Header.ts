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
  let isMenuOpen = false;
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
  navigationElement.id = 'primary-navigation';

  const listElement = document.createElement('ul');
  listElement.className = 'header__nav-list';
  navigationItems.forEach((item) => listElement.append(createNavigationItem(item)));

  const menuToggleElement = document.createElement('button');
  menuToggleElement.className = 'header__menu-toggle';
  menuToggleElement.type = 'button';
  menuToggleElement.setAttribute('aria-controls', navigationElement.id);
  menuToggleElement.setAttribute('aria-expanded', 'false');
  menuToggleElement.setAttribute('aria-label', 'Open navigation menu');
  menuToggleElement.innerHTML = '<span></span><span></span><span></span>';
  menuToggleElement.addEventListener('click', () => {
    setMenuOpen(!isMenuOpen);
  });

  listElement.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setMenuOpen(false);
    }
  });

  navigationElement.append(listElement);
  innerElement.append(logoElement, menuToggleElement, navigationElement);
  headerElement.append(innerElement);

  return headerElement;

  function setMenuOpen(nextIsMenuOpen: boolean): void {
    isMenuOpen = nextIsMenuOpen;
    headerElement.classList.toggle('header--menu-open', isMenuOpen);
    menuToggleElement.classList.toggle('header__menu-toggle--open', isMenuOpen);
    menuToggleElement.setAttribute('aria-expanded', String(isMenuOpen));
    menuToggleElement.setAttribute(
      'aria-label',
      isMenuOpen ? 'Close navigation menu' : 'Open navigation menu',
    );
  }
}
