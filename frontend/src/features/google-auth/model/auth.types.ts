export type AuthAccountType = 'personal' | 'business';

export interface AuthService {
  loginWithGoogle: (accountType: AuthAccountType) => void | Promise<void>;
  startSignUp: (accountType: AuthAccountType) => void | Promise<void>;
}
