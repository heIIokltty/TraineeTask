import type { AuthService } from './auth.types';

export function createAuthService(): AuthService {
  return {
    loginWithGoogle(): void {
      window.dispatchEvent(new CustomEvent('auth:google-login-requested'));
    },
  };
}
