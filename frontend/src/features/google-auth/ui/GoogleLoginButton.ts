import type { AuthAccountType, AuthService } from '../model/auth.types';
import './GoogleLoginButton.css';

interface GoogleLoginButtonOptions {
  authService: AuthService;
  getAccountType: () => AuthAccountType;
}

export function createGoogleLoginButton({
  authService,
  getAccountType,
}: GoogleLoginButtonOptions): HTMLButtonElement {
  const buttonElement = document.createElement('button');
  buttonElement.className = 'google-login-button';
  buttonElement.type = 'button';

  const textElement = document.createElement('span');
  textElement.className = 'google-login-button__text';
  textElement.textContent = 'Google';

  const iconElement = document.createElement('span');
  iconElement.className = 'google-login-button__icon';
  iconElement.setAttribute('aria-hidden', 'true');
  iconElement.textContent = 'G';

  buttonElement.append(iconElement, textElement);
  buttonElement.addEventListener('click', () => {
    void authService.loginWithGoogle(getAccountType());
  });

  return buttonElement;
}
