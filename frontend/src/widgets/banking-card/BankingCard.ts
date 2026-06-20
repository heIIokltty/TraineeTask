import { createGoogleLoginButton } from '../../features/google-auth/ui/GoogleLoginButton';
import type { AuthService } from '../../features/google-auth/model/auth.types';
import './BankingCard.css';

interface BankingCardOptions {
  authService: AuthService;
}

export function createBankingCard({ authService }: BankingCardOptions): HTMLElement {
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

  const personalTab = createTabButton('Personal', true);
  const businessTab = createTabButton('Business', false);
  tabsElement.append(personalTab, businessTab);
  headerElement.append(titleElement, tabsElement);

  const bodyElement = document.createElement('div');
  bodyElement.className = 'banking-card__body';

  const forgotPasswordLink = document.createElement('a');
  forgotPasswordLink.className = 'banking-card__forgot-link';
  forgotPasswordLink.href = '#google-login';
  forgotPasswordLink.textContent = 'Forgot Password?';

  const dividerElement = document.createElement('div');
  dividerElement.className = 'banking-card__divider';
  dividerElement.innerHTML = '<span>or</span>';

  const footerElement = document.createElement('p');
  footerElement.className = 'banking-card__footer';

  const signupLink = document.createElement('a');
  signupLink.className = 'banking-card__signup-link';
  signupLink.href = '#google-login';
  signupLink.textContent = 'Sign Up';
  footerElement.append("Don't have an account?", signupLink);

  bodyElement.append(
    createGoogleLoginButton({ authService }),
    forgotPasswordLink,
    dividerElement,
    footerElement,
  );

  cardElement.append(headerElement, bodyElement);

  return cardElement;
}

function createTabButton(label: string, isSelected: boolean): HTMLButtonElement {
  const buttonElement = document.createElement('button');
  buttonElement.className = isSelected
    ? 'banking-card__tab banking-card__tab--active'
    : 'banking-card__tab';
  buttonElement.type = 'button';
  buttonElement.role = 'tab';
  buttonElement.setAttribute('aria-selected', String(isSelected));
  buttonElement.textContent = label;

  return buttonElement;
}
