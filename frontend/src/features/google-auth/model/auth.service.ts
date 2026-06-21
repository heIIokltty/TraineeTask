import { appConfig } from '../../../app/app.config';
import type { AuthService, AuthUser } from './auth.types';

const AUTH_TOKEN_STORAGE_KEY = 'kairos.authToken';

export function saveAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function createAuthService(): AuthService {
  return {
    loginWithGoogle(accountType): void {
      const searchParams = new URLSearchParams({ accountType });

      window.location.assign(`${appConfig.apiBaseUrl}/api/auth/google/start?${searchParams}`);
    },
    async getCurrentUser(): Promise<AuthUser | null> {
      const token = getAuthToken();

      if (!token) {
        return null;
      }

      const response = await fetch(`${appConfig.apiBaseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        clearAuthToken();
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to load current user.');
      }

      return (await response.json()) as AuthUser;
    },
    logout(): void {
      clearAuthToken();
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
