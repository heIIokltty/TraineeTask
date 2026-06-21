export type AuthAccountType = 'personal' | 'business';

export interface AuthUser {
  email: string;
  name: string;
  picture: string | null;
}

export interface AuthService {
  loginWithGoogle: (accountType: AuthAccountType) => void | Promise<void>;
  getCurrentUser: () => Promise<AuthUser | null>;
  startSignUp: (accountType: AuthAccountType) => void | Promise<void>;
}
