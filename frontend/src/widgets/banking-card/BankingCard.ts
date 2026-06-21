import { createGoogleLoginButton } from '../../features/google-auth/ui/GoogleLoginButton';
import type {
  AuthAccountType,
  AuthService,
  AuthUser,
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

  const personalTab = createTabButton({
    accountType: 'personal',
    desktopLabel: 'Sign In',
    mobileLabel: 'Personal',
  });
  const businessTab = createTabButton({
    accountType: 'business',
    desktopLabel: 'Enter Email',
    mobileLabel: 'Business',
  });
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

  cardElement.append(headerElement, bodyElement);

  updateTabs();
  renderLoadingState();
  void renderAuthState();

  return cardElement;

  async function renderAuthState(): Promise<void> {
    try {
      const user = await authService.getCurrentUser();

      if (user) {
        renderAuthenticatedState(user);
        return;
      }

      renderUnauthenticatedState();
    } catch {
      renderUnauthenticatedState();
    }
  }

  function renderLoadingState(): void {
    bodyElement.innerHTML = '<p class="banking-card__status">Checking authorization...</p>';
  }

  function renderAuthenticatedState(user: AuthUser): void {
    bodyElement.replaceChildren(createUserSummary(user));
  }

  function renderUnauthenticatedState(): void {
    const journeyText = document.createElement('p');
    journeyText.className = 'banking-card__journey-text';
    journeyText.textContent = 'Start Your Journey Now!';

    bodyElement.replaceChildren(
      createGoogleLoginButton({
        authService,
        getAccountType: () => selectedAccountType,
      }),
      journeyText,
    );
  }

  function updateTabs(): void {
    const isPersonalSelected = selectedAccountType === 'personal';

    personalTab.classList.toggle('banking-card__tab--active', isPersonalSelected);
    businessTab.classList.toggle('banking-card__tab--active', !isPersonalSelected);
    personalTab.setAttribute('aria-selected', String(isPersonalSelected));
    businessTab.setAttribute('aria-selected', String(!isPersonalSelected));
  }
}

function createUserSummary(user: AuthUser): HTMLElement {
  const summaryElement = document.createElement('section');
  summaryElement.className = 'banking-card__user';
  summaryElement.setAttribute('aria-label', 'Signed in user');

  if (user.picture) {
    const avatarElement = document.createElement('img');
    avatarElement.className = 'banking-card__avatar';
    avatarElement.src = user.picture;
    avatarElement.alt = '';
    avatarElement.referrerPolicy = 'no-referrer';
    summaryElement.append(avatarElement);
  }

  const contentElement = document.createElement('div');
  contentElement.className = 'banking-card__user-content';

  const labelElement = document.createElement('p');
  labelElement.className = 'banking-card__status';
  labelElement.textContent = 'Signed in as';

  const nameElement = document.createElement('p');
  nameElement.className = 'banking-card__user-name';
  nameElement.textContent = user.name;

  const emailElement = document.createElement('p');
  emailElement.className = 'banking-card__user-email';
  emailElement.textContent = user.email;

  contentElement.append(labelElement, nameElement, emailElement);
  summaryElement.append(contentElement);

  return summaryElement;
}

function createTabButton(options: {
  accountType: AuthAccountType;
  desktopLabel: string;
  mobileLabel: string;
}): HTMLButtonElement {
  const buttonElement = document.createElement('button');
  buttonElement.className = 'banking-card__tab';
  buttonElement.type = 'button';
  buttonElement.setAttribute('role', 'tab');
  buttonElement.setAttribute('aria-selected', 'false');
  buttonElement.setAttribute('aria-label', options.mobileLabel);
  buttonElement.dataset.accountType = options.accountType;
  buttonElement.dataset.desktopLabel = options.desktopLabel;
  buttonElement.dataset.mobileLabel = options.mobileLabel;

  return buttonElement;
}
