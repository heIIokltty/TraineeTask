import { renderRoute } from './router';

const INTRO_DURATION_MS = 2100;

export function bootstrap(): void {
  const rootElement = document.querySelector<HTMLDivElement>('#app');

  if (!rootElement) {
    throw new Error('Application root element was not found.');
  }

  startIntroAnimation();
  rootElement.append(renderRoute(window.location.pathname));
}

function startIntroAnimation(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('intro-complete');
    return;
  }

  const overlayElement = document.createElement('div');
  overlayElement.className = 'intro-overlay';
  overlayElement.setAttribute('aria-hidden', 'true');

  document.body.classList.add('intro-active');
  document.body.append(overlayElement);

  window.setTimeout(() => {
    overlayElement.remove();
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-complete');
  }, INTRO_DURATION_MS);
}
