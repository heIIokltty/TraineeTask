import { renderRoute } from './router';

export function bootstrap(): void {
  const rootElement = document.querySelector<HTMLDivElement>('#app');

  if (!rootElement) {
    throw new Error('Application root element was not found.');
  }

  rootElement.append(renderRoute(window.location.pathname));
}
