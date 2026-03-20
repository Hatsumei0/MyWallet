/**
 * Represents a Loan object as returned from Supabase (snake_case columns).
 */
export type Loan = {
  id: string;
  user_id: string;
  amount: number;
  type: 'BORROWED' | 'LENT';
  name: string;
  description?: string;
  due_date?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  notes?: string;
  created_at: string;
  updated_at: string;
  payment_history?: PaymentRecord[];
};

/**
 * Represents a payment record for a loan.
 */
export type PaymentRecord = {
  id: string;
  loan_id: string;
  amount: number;
  date: string;
  notes?: string;
};

/**
 * Data required for creating a new loan.
 */
export interface CreateLoanDTO {
  amount: number;
  name: string;
  description?: string;
  due_date?: string;
  type: 'BORROWED' | 'LENT';
  notes?: string;
}

/**
 * LoanStatus represents the possible status values for a loan.
 */
export type LoanStatus = 'PENDING' | 'PAID' | 'OVERDUE';