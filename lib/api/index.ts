/**
 * Main API module exports
 * This file maintains backward compatibility while providing the new modular structure
 */

// Configuration
export * from './config';

// Client
export { apiClient } from './client';

// All types
export * from './types';

// Service APIs
export { authApi } from './services/auth';
export { customerApi } from './services/customer';
export { employeeApi } from './services/employee';
export { tasksApi } from './services/task';
export { offersApi } from './services/offer';
export { expensesApi } from './services/expense';
export { companyApi } from './services/company';
export { dashboardApi } from './services/dashboard';
export { superAdminApi } from './services/super-admin';
export { appointmentsApi } from './services/appointment';
export { googleCalendarApi } from './services/google-calendar';

// React Query
export { queryClient } from './query/client';
export { queryKeys } from './query/keys'; 