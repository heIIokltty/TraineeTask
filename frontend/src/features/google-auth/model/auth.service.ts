import type { AuthService } from './auth.types';

export function createAuthService(): AuthService {
  return {
    loginWithGoogle(accountType): void {
      window.dispatchEvent(
        new CustomEvent('auth:google-login-requested', {
          detail: {
            accountType,
          },
        }),
      );
    },
    startSignUp(accountType): void {
      window.dispatchEvent(
        new CustomEvent('auth:signup-requested', {
          detail: {
            accountType,
          },
        }),
      );
    },
  };
}
