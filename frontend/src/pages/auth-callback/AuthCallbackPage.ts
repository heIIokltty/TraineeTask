export function createAuthCallbackPage(): HTMLElement {
  const pageElement = document.createElement('main');
  pageElement.className = 'app-placeholder';

  pageElement.innerHTML = `
    <section class="app-placeholder__content" aria-labelledby="auth-callback-title">
      <p class="app-placeholder__eyebrow">OAuth</p>
      <h1 class="app-placeholder__title" id="auth-callback-title">Auth callback placeholder</h1>
      <p class="app-placeholder__text">
        The backend Google OAuth2 integration will be connected in a later stage.
      </p>
    </section>
  `;

  return pageElement;
}
