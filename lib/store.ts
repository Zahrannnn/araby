// Global state management with Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';
import { Locale } from '@/i18n';
import { cookieUtils } from '@/lib/utils/cookies';
import { authApi } from '@/lib/api';

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
}

/**
 * Auth actions interface
 */
interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  initializeAuth: () => void;
}

/**
 * App state interface
 */
interface AppState {
  locale: Locale;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

/**
 * App actions interface  
 */
interface AppActions {
  setLocale: (locale: Locale) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * Notification interface
 */
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  createdAt: Date;
}

/**
 * Combined store interface
 */
type StoreState = AuthState & AuthActions & AppState & AppActions;

/**
 * Main Zustand store with persistence
 */
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, 
      hasHydrated: false,

      // Auth actions
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },

      // Initialize auth state from cookies
      initializeAuth: () => {
        const token = cookieUtils.getToken();
        const user = authApi.getCurrentUser();
        
        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // App state
      locale: 'en',
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],

      // App actions
      setLocale: (locale: Locale) => {
        set({ locale });
        // Update document direction for RTL/LTR
        if (typeof document !== 'undefined') {
          document.dir = locale === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = locale;
        }
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        // Update document class for theme
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (sidebarCollapsed: boolean) => {
        set({ sidebarCollapsed });
      },

      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'araby-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          state.initializeAuth();
        }
      },
    }
  )
);

/**
 * Selector hooks for better performance
 */
export const useAuth = () => useStore((state) => ({
  user: state.user,
  token: state.token,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  hasHydrated: state.hasHydrated,
  login: state.login,
  logout: state.logout,
  setUser: state.setUser,
  setLoading: state.setLoading,
  initializeAuth: state.initializeAuth,
}));

export const useApp = () => useStore((state) => ({
  locale: state.locale,
  theme: state.theme,
  sidebarCollapsed: state.sidebarCollapsed,
  setLocale: state.setLocale,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  setSidebarCollapsed: state.setSidebarCollapsed,
}));

export const useNotifications = () => useStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));


export type { Notification }; 