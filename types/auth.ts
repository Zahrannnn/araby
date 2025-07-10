import { z } from 'zod';

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'company_manager' | 'employee';
  companyId?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login form validation schema
export const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .min(1, t('auth.errors.emailRequired'))
    .email(t('auth.errors.emailInvalid')),
  password: z
    .string()
    .min(1, t('auth.errors.passwordRequired'))
    .min(6, t('auth.errors.passwordMin')),
  rememberMe: z.boolean().optional(),
});

// Dictionary types for translations
export interface AuthTranslations {
  login: string;
  password: string;
  email: string;
  rememberMe: string;
  forgotPassword: string;
  loginButton: string;
  noAccount: string;
  contactAdmin: string;
  welcomeBack: string;
  loginTitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  invalidCredentials: string;
  loginError: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  loggingIn: string;
}

export interface Dictionary {
  // Basic translations
  dashboard: string;
  login: string;
  logout: string;
  profile: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  view: string;
  active: string;
  inactive: string;
  pending: string;
  completed: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  amount: string;
  status: string;
  actions: string;
  companies: string;
  clients: string;
  employees: string;
  tasks: string;
  quotes: string;
  invoices: string;
  expenses: string;
  revenues: string;
  subscriptions: string;
  welcome: string;
  settings: string;
  reports: string;
  notifications: string;

  // Auth section
  auth: AuthTranslations;

  // Home section
  home: {
    title: string;
    subtitle: string;
    hero: {
      heading: string;
      subheading: string;
      getStarted: string;
      learnMore: string;
    };
    features: {
      title: string;
      subtitle: string;
      clientManagement: {
        title: string;
        description: string;
      };
      invoicing: {
        title: string;
        description: string;
      };
      taskTracking: {
        title: string;
        description: string;
      };
      reporting: {
        title: string;
        description: string;
      };
      multiLanguage: {
        title: string;
        description: string;
      };
      teamWork: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      subtitle: string;
      startTrial: string;
      contactSales: string;
    };
    footer: {
      copyright: string;
      privacy: string;
      terms: string;
      support: string;
    };
  };
} 