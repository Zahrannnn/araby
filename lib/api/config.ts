/**
 * API configuration and constants
 */

/**
 * Base API configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nedx.premiumasp.net/api';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/Auth/login',
  LOGOUT: '/Auth/logout',
  REFRESH: '/Auth/refresh',
  
  // User management
  USERS: '/users',
  
  // Company management
  COMPANIES: '/companies',
  CLIENTS: '/clients',
  CUSTOMERS: '/customer',
  EMPLOYEES: '/Employees',
  
  // Business operations
  TASKS: '/tasks',
  QUOTES: '/quotes',
  INVOICES: '/invoices',
  EXPENSES: '/expenses',
  EXPENSES_CATEGORY_CHART: '/Expenses/category-chart',
  EXPENSES_MONTHLY_CHART: '/Expenses/monthly-chart',
  REVENUES: '/revenues',
  APPOINTMENTS: '/Appointments',
  
  // Dashboard
  COMPANY_DASHBOARD: '/CompanyDashboard',
  
  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  
  // Super Admin endpoints
  SUPER_ADMIN_NOTIFICATIONS: '/SuperAdmin/notifications',

  // Google Calendar
  GOOGLE_CALENDAR_CONNECT: '/GoogleCalendar/connect',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const; 