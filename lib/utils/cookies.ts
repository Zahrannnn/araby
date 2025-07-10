import Cookies from 'js-cookie';

/**
 * Cookie configuration
 */
const COOKIE_CONFIG = {
  TOKEN: 'auth-token',
  USER: 'user-data',
  REMEMBER_ME: 'remember-me',
  EXPIRES_DAYS: 7,
  EXPIRES_DAYS_REMEMBER: 30,
} as const;

/**
 * Cookie utilities for authentication
 */
export const cookieUtils = {
  /**
   * Set authentication token in cookies
   */
  setToken(token: string, rememberMe: boolean = false): void {
    const expires = rememberMe ? COOKIE_CONFIG.EXPIRES_DAYS_REMEMBER : COOKIE_CONFIG.EXPIRES_DAYS;
    
    Cookies.set(COOKIE_CONFIG.TOKEN, token, {
      expires,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  /**
   * Get authentication token from cookies
   */
  getToken(): string | undefined {
    return Cookies.get(COOKIE_CONFIG.TOKEN);
  },

  /**
   * Remove authentication token from cookies
   */
  removeToken(): void {
    Cookies.remove(COOKIE_CONFIG.TOKEN, { path: '/' });
  },

  /**
   * Set user data in cookies
   */
  setUserData(userData: object, rememberMe: boolean = false): void {
    const expires = rememberMe ? COOKIE_CONFIG.EXPIRES_DAYS_REMEMBER : COOKIE_CONFIG.EXPIRES_DAYS;
    
    Cookies.set(COOKIE_CONFIG.USER, JSON.stringify(userData), {
      expires,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },

  /**
   * Get user data from cookies
   */
  getUserData(): object | null {
    try {
      const userData = Cookies.get(COOKIE_CONFIG.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from cookies:', error);
      return null;
    }
  },

  /**
   * Remove user data from cookies
   */
  removeUserData(): void {
    Cookies.remove(COOKIE_CONFIG.USER, { path: '/' });
  },

  /**
   * Set remember me preference
   */
  setRememberMe(rememberMe: boolean): void {
    if (rememberMe) {
      Cookies.set(COOKIE_CONFIG.REMEMBER_ME, 'true', {
        expires: COOKIE_CONFIG.EXPIRES_DAYS_REMEMBER,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
    } else {
      Cookies.remove(COOKIE_CONFIG.REMEMBER_ME, { path: '/' });
    }
  },

  /**
   * Get remember me preference
   */
  getRememberMe(): boolean {
    return Cookies.get(COOKIE_CONFIG.REMEMBER_ME) === 'true';
  },

  /**
   * Clear all authentication cookies
   */
  clearAll(): void {
    this.removeToken();
    this.removeUserData();
    Cookies.remove(COOKIE_CONFIG.REMEMBER_ME, { path: '/' });
  },
}; 