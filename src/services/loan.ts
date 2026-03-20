import { supabase } from './supabase';

export type LoanType = 'BORROWED' | 'LENT';
export type LoanStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Loan {
  id: string;
  user_id: string;
  amount: number;
  type: LoanType;
  name: string;
  description?: string;
  due_date?: string;
  status: LoanStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLoanDTO {
  amount: number;
  type: LoanType;
  name: string;
  description?: string;
  due_date?: string;
  notes?: string;
}

export async function createLoan(loan: CreateLoanDTO): Promise<{ data: Loan | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('loans')
      .insert([{
        ...loan,
        user_id: user.id,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data: data as Loan, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getLoans(): Promise<{ data: Loan[] | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return { data: data as Loan[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateLoanStatus(
  id: string, 
  status: LoanStatus,
  notes?: string
): Promise<{ data: Loan | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('loans')
      .update({ 
        status, 
        notes: notes || null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Loan, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteLoan(id: string): Promise<{ error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Keeping the named export for context backward compatibility if they use the object
export const loanService = {
  createLoan,
  getLoans,
  updateLoanStatus,
  deleteLoan
};