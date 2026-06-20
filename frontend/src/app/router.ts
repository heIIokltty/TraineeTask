import { createAuthCallbackPage } from '../pages/auth-callback/AuthCallbackPage';
import { createHomePage } from '../pages/home/HomePage';

export function renderRoute(pathname: string): HTMLElement {
  if (pathname === '/auth/callback') {
    return createAuthCallbackPage();
  }

  return createHomePage();
}
