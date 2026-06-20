import { appConfig } from '../../app/app.config';

export function createHomePage(): HTMLElement {
  const pageElement = document.createElement('main');
  pageElement.className = 'app-placeholder';

  pageElement.innerHTML = `
    <section class="app-placeholder__content" aria-labelledby="placeholder-title">
      <p class="app-placeholder__eyebrow">${appConfig.appName}</p>
      <h1 class="app-placeholder__title" id="placeholder-title">Frontend skeleton is ready</h1>
      <p class="app-placeholder__text">
        Vite, TypeScript, plain CSS, and the modular source structure are prepared for the next stage.
      </p>
    </section>
  `;

  return pageElement;
}
