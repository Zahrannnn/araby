// Quote and invoice related type definitions

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
}

export interface Quote {
  id: string;
  companyId: string;
  clientId: string;
  quoteNumber: string;
  title: string;
  description?: string;
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: 'EUR' | 'USD' | 'SAR';
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
  };
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  quoteId?: string; // If generated from quote
  invoiceNumber: string;
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: 'EUR' | 'USD' | 'SAR';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'SAR';
  method: 'bank_transfer' | 'credit_card' | 'paypal' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
  notes?: string;
} 