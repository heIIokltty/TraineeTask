import { saveAuthToken } from '../../features/google-auth/model/auth.service';

const AUTH_REDIRECT_DELAY_MS = 100;

export function createAuthCallbackPage(): HTMLElement {
  const pageElement = document.createElement('main');
  pageElement.className = 'app-placeholder';
  const token = getTokenFromLocation(window.location);
  const error = getErrorFromLocation(window.location);

  logAuthCallbackDebug('callback.loaded', {
    tokenPresent: String(Boolean(token)),
    errorPresent: String(Boolean(error)),
    path: window.location.pathname,
  });

  if (token) {
    saveAuthToken(token);
    logAuthCallbackDebug('callback.token_saved', {
      nextPath: '/',
    });

    pageElement.append(
      createMessageSection({
        title: 'Signing you in',
        text: 'Redirecting to the home page.',
      }),
    );
    window.setTimeout(() => window.location.replace('/'), AUTH_REDIRECT_DELAY_MS);

    return pageElement;
  }

  pageElement.append(
    createMessageSection({
      title: 'Sign in failed',
      text: error ?? 'No authorization token was returned by the backend.',
      showRetryButton: true,
    }),
  );

  return pageElement;
}

function createMessageSection(options: {
  title: string;
  text: string;
  showRetryButton?: boolean;
}): HTMLElement {
  const sectionElement = document.createElement('section');
  sectionElement.className = 'app-placeholder__content';
  sectionElement.setAttribute('aria-labelledby', 'auth-callback-title');

  const eyebrowElement = document.createElement('p');
  eyebrowElement.className = 'app-placeholder__eyebrow';
  eyebrowElement.textContent = 'OAuth';

  const titleElement = document.createElement('h1');
  titleElement.className = 'app-placeholder__title';
  titleElement.id = 'auth-callback-title';
  titleElement.textContent = options.title;

  const textElement = document.createElement('p');
  textElement.className = 'app-placeholder__text';
  textElement.textContent = options.text;

  sectionElement.append(eyebrowElement, titleElement, textElement);

  if (options.showRetryButton) {
    const retryLink = document.createElement('a');
    retryLink.className = 'app-placeholder__button';
    retryLink.href = '/';
    retryLink.textContent = 'Try again';
    sectionElement.append(retryLink);
  }

  return sectionElement;
}

function getTokenFromLocation(location: Location): string | null {
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(location.search);

  return hashParams.get('token') ?? queryParams.get('token');
}

function getErrorFromLocation(location: Location): string | null {
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(location.search);

  return queryParams.get('error') ?? hashParams.get('error');
}

function logAuthCallbackDebug(message: string, context: Record<string, string>): void {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info(`[auth] ${message}`, context);
}
