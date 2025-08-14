// Form validation utilities using Zod
import { z } from 'zod';

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

/**
 * Validation messages in multiple languages
 */
export const VALIDATION_MESSAGES = {
  ar: {
    REQUIRED: 'هذا الحقل مطلوب',
    EMAIL_INVALID: 'البريد الإلكتروني غير صحيح',
    PASSWORD_WEAK: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتتضمن أحرف كبيرة وصغيرة وأرقام',
    PHONE_INVALID: 'رقم الهاتف غير صحيح',
    MIN_LENGTH: (min: number) => `يجب أن يكون الحد الأدنى ${min} أحرف`,
    MAX_LENGTH: (max: number) => `يجب ألا يتجاوز ${max} حرف`,
    QUANTITY_POSITIVE: 'الكمية يجب أن تكون أكبر من صفر',
    PRICE_NON_NEGATIVE: 'السعر يجب أن يكون أكبر من أو يساوي صفر',
    AMOUNT_POSITIVE: 'المبلغ يجب أن يكون أكبر من صفر',
    MIN_ITEMS: 'يجب إضافة عنصر واحد على الأقل',
  },
  de: {
    REQUIRED: 'Dieses Feld ist erforderlich',
    EMAIL_INVALID: 'E-Mail-Adresse ist ungültig',
    PASSWORD_WEAK: 'Passwort muss mindestens 8 Zeichen enthalten mit Groß- und Kleinbuchstaben und Zahlen',
    PHONE_INVALID: 'Telefonnummer ist ungültig',
    MIN_LENGTH: (min: number) => `Mindestens ${min} Zeichen erforderlich`,
    MAX_LENGTH: (max: number) => `Darf nicht mehr als ${max} Zeichen haben`,
    QUANTITY_POSITIVE: 'Menge muss größer als null sein',
    PRICE_NON_NEGATIVE: 'Preis muss null oder größer sein',
    AMOUNT_POSITIVE: 'Betrag muss größer als null sein',
    MIN_ITEMS: 'Mindestens ein Element muss hinzugefügt werden',
  },
  en: {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Email address is invalid',
    PASSWORD_WEAK: 'Password must contain at least 8 characters with uppercase, lowercase letters and numbers',
    PHONE_INVALID: 'Phone number is invalid',
    MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
    MAX_LENGTH: (max: number) => `Must not exceed ${max} characters`,
    QUANTITY_POSITIVE: 'Quantity must be greater than zero',
    PRICE_NON_NEGATIVE: 'Price must be zero or greater',
    AMOUNT_POSITIVE: 'Amount must be greater than zero',
    MIN_ITEMS: 'At least one item must be added',
  },
} as const;

/**
 * Get validation messages for a specific locale
 */
export function getValidationMessages(locale: 'ar' | 'de' | 'en' = 'ar') {
  return VALIDATION_MESSAGES[locale];
}

/**
 * Create Zod schemas with localized messages
 */
export function createValidationSchemas(locale: 'ar' | 'de' | 'en' = 'ar') {
  const messages = getValidationMessages(locale);

  // User login schema
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, messages.REQUIRED)
      .email(messages.EMAIL_INVALID),
    password: z
      .string()
      .min(1, messages.REQUIRED)
      .min(8, messages.MIN_LENGTH(8)),
  });

  // User registration schema
  const registerSchema = z.object({
    name: z
      .string()
      .min(1, messages.REQUIRED)
      .min(2, messages.MIN_LENGTH(2)),
    email: z
      .string()
      .min(1, messages.REQUIRED)
      .email(messages.EMAIL_INVALID),
    password: z
      .string()
      .min(1, messages.REQUIRED)
      .regex(VALIDATION_PATTERNS.PASSWORD, messages.PASSWORD_WEAK),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || VALIDATION_PATTERNS.PHONE.test(val),
        messages.PHONE_INVALID
      ),
  });

  // Company creation schema
  const companySchema = z.object({
    name: z
      .string()
      .min(1, messages.REQUIRED)
      .min(2, messages.MIN_LENGTH(2)),
    email: z
      .string()
      .min(1, messages.REQUIRED)
      .email(messages.EMAIL_INVALID),
    phone: z
      .string()
      .min(1, messages.REQUIRED)
      .regex(VALIDATION_PATTERNS.PHONE, messages.PHONE_INVALID),
    address: z
      .string()
      .min(1, messages.REQUIRED),
    taxId: z.string().optional(),
  });

  // Client management schema
  const clientSchema = z.object({
    name: z
      .string()
      .min(1, messages.REQUIRED)
      .min(2, messages.MIN_LENGTH(2)),
    email: z
      .string()
      .min(1, messages.REQUIRED)
      .email(messages.EMAIL_INVALID),
    phone: z
      .string()
      .min(1, messages.REQUIRED)
      .regex(VALIDATION_PATTERNS.PHONE, messages.PHONE_INVALID),
    address: z.string().optional(),
    notes: z.string().optional(),
  });

  // Task creation schema
  const taskSchema = z.object({
    title: z
      .string()
      .min(1, messages.REQUIRED)
      .min(3, messages.MIN_LENGTH(3)),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    assignedTo: z.string().min(1, messages.REQUIRED),
    clientId: z.string().optional(),
    estimatedHours: z.number().positive().optional(),
    dueDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
  });

  // Quote item schema
  const quoteItemSchema = z.object({
    description: z
      .string()
      .min(1, messages.REQUIRED),
    quantity: z
      .number()
      .min(1, messages.QUANTITY_POSITIVE),
    unitPrice: z
      .number()
      .min(0, messages.PRICE_NON_NEGATIVE),
    taxRate: z
      .number()
      .min(0)
      .max(100)
      .optional(),
  });

  // Quote creation schema
  const quoteSchema = z.object({
    clientId: z.string().min(1, messages.REQUIRED),
    title: z
      .string()
      .min(1, messages.REQUIRED),
    description: z.string().optional(),
    items: z
      .array(quoteItemSchema)
      .min(1, messages.MIN_ITEMS),
    currency: z.enum(['EUR', 'USD', 'SAR']),
    validUntil: z.date(),
  });

  // Expense tracking schema
  const expenseSchema = z.object({
    title: z
      .string()
      .min(1, messages.REQUIRED),
    description: z.string().optional(),
    amount: z
      .number()
      .positive(messages.AMOUNT_POSITIVE),
    currency: z.enum(['EUR', 'USD', 'SAR']),
    category: z
      .string()
      .min(1, messages.REQUIRED),
    date: z.date(),
    taskId: z.string().optional(),
    projectId: z.string().optional(),
  });

  return {
    loginSchema,
    registerSchema,
    companySchema,
    clientSchema,
    taskSchema,
    quoteItemSchema,
    quoteSchema,
    expenseSchema,
  };
}

// Default schemas (Arabic)
const defaultSchemas = createValidationSchemas('ar');

// Export default schemas for backward compatibility
export const loginSchema = defaultSchemas.loginSchema;
export const registerSchema = defaultSchemas.registerSchema;
export const companySchema = defaultSchemas.companySchema;
export const clientSchema = defaultSchemas.clientSchema;
export const taskSchema = defaultSchemas.taskSchema;
export const quoteItemSchema = defaultSchemas.quoteItemSchema;
export const quoteSchema = defaultSchemas.quoteSchema;
export const expenseSchema = defaultSchemas.expenseSchema;

/**
 * Type exports for form data
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;

/**
 * Generic validation helper
 */
export function validateField(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  return validateField(email, VALIDATION_PATTERNS.EMAIL);
}

/**
 * Password strength validation
 */
export function isValidPassword(password: string): boolean {
  return validateField(password, VALIDATION_PATTERNS.PASSWORD);
}

/**
 * Hook to get validation schemas based on current locale
 */
export function useValidationSchemas() {
  return (locale: 'ar' | 'de' | 'en' = 'en') => createValidationSchemas(locale);
}

/**
 * Validation helper for forms with next-intl
 */
export function getLocalizedSchemas(locale: string) {
  const supportedLocale = ['ar', 'de', 'en'].includes(locale) ? locale as 'ar' | 'de' | 'en' : 'en';
  return createValidationSchemas(supportedLocale);
} 