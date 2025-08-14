/**
 * Company types and interfaces
 */

/**
 * Company details response from API
 */
export interface CompanyDetailsResponse {
  companyInfo: {
    id: number;
    companyName: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    vatNumber: string;
    subsType: string;
    subscriptionTypeId: number;
    isActive: boolean;
    isSubStripe: boolean;
    stripeSubCreatedAt: string;
    bank: string;
    nameOfBankAccount: string;
    iban: string;
    bic: string;
    transportInsurancePolicyNo: string;
    businessInsurancePolicyNo: string;
    companyLogoUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    subscriptionEndDate: string;
    notes: string | null;
  };
  managerInfo: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    createdAt: string;
    isActive: boolean;
  };
  metrics: {
    subscriptionDate: string;
    customerCount: number;
    employeeCount: number;
    totalProfit: number;
    paidInvoiceCount: number;
  };
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  topCards: {
    currentMonthIncome: number;
    currentMonthProfit: number;
    profitChangeFromLastMonth: number;
    totalIncome: number;
    totalExpenses: number;
    totalProfit: number;
    totalOffers: number;
    pendingOffers: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
  };
  monthlyFinanceChart: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  offerStatusChart: {
    accepted: number;
    pending: number;
    rejected: number;
  };
  revenueByService: Array<{
    serviceType: string;
    revenue: number;
  }>;
  companyLogoUrl: string;
  importantTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
} 