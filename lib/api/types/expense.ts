/**
 * Expense types and interfaces
 */

/**
 * Add expense payload
 */
export interface AddExpensePayload {
  description: string;
  amountCHF: number;
  expenseDate: string;
  category: string;
}

/**
 * Update expense payload
 */
export interface UpdateExpensePayload extends AddExpensePayload {
  expenseId: number;
} 