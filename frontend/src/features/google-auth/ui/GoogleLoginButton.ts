import type { AuthService } from '../model/auth.types';
import './GoogleLoginButton.css';

interface GoogleLoginButtonOptions {
  authService: AuthService;
}

export function createGoogleLoginButton({
  authService,
}: GoogleLoginButtonOptions): HTMLButtonElement {
  const buttonElement = document.createElement('button');
  buttonElement.className = 'google-login-button';
  buttonElement.type = 'button';

  const textElement = document.createElement('span');
  textElement.className = 'google-login-button__text';
  textElement.textContent = 'Login';

  buttonElement.append(textElement);
  buttonElement.addEventListener('click', () => {
    void authService.loginWithGoogle();
  });

  return buttonElement;
}
