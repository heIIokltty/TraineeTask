import { saveAuthToken } from '../../features/google-auth/model/auth.service';

export function createAuthCallbackPage(): HTMLElement {
  const pageElement = document.createElement('main');
  pageElement.className = 'app-placeholder';
  const token = getTokenFromLocation(window.location);

  if (token) {
    saveAuthToken(token);
    window.location.replace('/');
  }

  pageElement.innerHTML = token
    ? `
    <section class="app-placeholder__content" aria-labelledby="auth-callback-title">
      <p class="app-placeholder__eyebrow">OAuth</p>
      <h1 class="app-placeholder__title" id="auth-callback-title">Signing you in</h1>
      <p class="app-placeholder__text">Redirecting to the home page.</p>
    </section>
  `
    : `
    <section class="app-placeholder__content" aria-labelledby="auth-callback-title">
      <p class="app-placeholder__eyebrow">OAuth</p>
      <h1 class="app-placeholder__title" id="auth-callback-title">Sign in failed</h1>
      <p class="app-placeholder__text">
        No authorization token was returned by the backend.
      </p>
    </section>
  `;

  return pageElement;
}

function getTokenFromLocation(location: Location): string | null {
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(location.search);

  return hashParams.get('token') ?? queryParams.get('token');
}
