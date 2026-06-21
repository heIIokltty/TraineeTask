import { createGoogleLoginButton } from '../../features/google-auth/ui/GoogleLoginButton';
import type {
  AuthAccountType,
  AuthService,
} from '../../features/google-auth/model/auth.types';
import './BankingCard.css';

interface BankingCardOptions {
  authService: AuthService;
}

export function createBankingCard({ authService }: BankingCardOptions): HTMLElement {
  let selectedAccountType: AuthAccountType = 'personal';

  const cardElement = document.createElement('aside');
  cardElement.className = 'banking-card';
  cardElement.setAttribute('aria-labelledby', 'banking-card-title');

  const headerElement = document.createElement('div');
  headerElement.className = 'banking-card__header';

  const titleElement = document.createElement('h2');
  titleElement.className = 'banking-card__title';
  titleElement.id = 'banking-card-title';
  titleElement.textContent = 'Online Banking';

  const tabsElement = document.createElement('div');
  tabsElement.className = 'banking-card__tabs';
  tabsElement.setAttribute('role', 'tablist');
  tabsElement.setAttribute('aria-label', 'Account type');

  const personalTab = createTabButton('Personal', 'personal');
  const businessTab = createTabButton('Business', 'business');
  personalTab.addEventListener('click', () => {
    selectedAccountType = 'personal';
    updateTabs();
  });
  businessTab.addEventListener('click', () => {
    selectedAccountType = 'business';
    updateTabs();
  });
  tabsElement.append(personalTab, businessTab);
  headerElement.append(titleElement, tabsElement);

  const bodyElement = document.createElement('div');
  bodyElement.className = 'banking-card__body';

  const forgotPasswordLink = document.createElement('a');
  forgotPasswordLink.className = 'banking-card__forgot-link';
  forgotPasswordLink.href = '#google-login';
  forgotPasswordLink.textContent = 'Start Your Journey Now!';

  const dividerElement = document.createElement('div');
  dividerElement.className = 'banking-card__divider';
  dividerElement.innerHTML = '<span>or</span>';

  const footerElement = document.createElement('p');
  footerElement.className = 'banking-card__footer';

  const signupLink = document.createElement('a');
  signupLink.className = 'banking-card__signup-link';
  signupLink.href = '#';
  signupLink.textContent = 'Create account';
  signupLink.addEventListener('click', (event) => {
    event.preventDefault();
    void authService.startSignUp(selectedAccountType);
  });
  footerElement.append(signupLink);

  bodyElement.append(
    createGoogleLoginButton({
      authService,
      getAccountType: () => selectedAccountType,
    }),
    forgotPasswordLink,
    dividerElement,
    footerElement,
  );

  cardElement.append(headerElement, bodyElement);

  updateTabs();

  return cardElement;

  function updateTabs(): void {
    const isPersonalSelected = selectedAccountType === 'personal';

    personalTab.classList.toggle('banking-card__tab--active', isPersonalSelected);
    businessTab.classList.toggle('banking-card__tab--active', !isPersonalSelected);
    personalTab.setAttribute('aria-selected', String(isPersonalSelected));
    businessTab.setAttribute('aria-selected', String(!isPersonalSelected));
  }
}

function createTabButton(
  label: string,
  accountType: AuthAccountType,
): HTMLButtonElement {
  const buttonElement = document.createElement('button');
  buttonElement.className = 'banking-card__tab';
  buttonElement.type = 'button';
  buttonElement.setAttribute('role', 'tab');
  buttonElement.setAttribute('aria-selected', 'false');
  buttonElement.dataset.accountType = accountType;
  buttonElement.textContent = label;

  return buttonElement;
}
