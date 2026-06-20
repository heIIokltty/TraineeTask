export interface AuthService {
  loginWithGoogle: () => void | Promise<void>;
}
