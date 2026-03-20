import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Loan, CreateLoanDTO } from '../types/loan';
import * as loanService from '../services/loan';
import { useAuth } from './AuthContext';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';

type LoanContextType = {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
  createLoan: (loan: CreateLoanDTO) => Promise<void>;
  updateLoanStatus: (id: string, status: 'PENDING' | 'PAID' | 'OVERDUE') => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  refreshLoans: (force?: boolean) => Promise<void>;
};

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Load persisted loans from local storage on mount
  useEffect(() => {
    (async () => {
      const storedLoans = await loadFromStorage('loans');
      if (storedLoans) {
        setLoans(storedLoans);
      }
    })();
  }, []);

  // Save loans to local storage whenever they change
  useEffect(() => {
    (async () => {
      await saveToStorage('loans', loans);
    })();
  }, [loans]);

  const refreshLoans = useCallback(async (force = false) => {
    if (!session?.user) {
      console.log('No user session, skipping loan refresh');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await loanService.getLoans();
      if (error) throw new Error(error.message);
      setLoans(data || []);
    } catch (err: any) {
      console.error('Error fetching loans:', err);
      setError('Failed to fetch loans');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      refreshLoans(true);
    } else {
      setLoans([]);
    }
  }, [session?.user?.id, refreshLoans]);

  const create = async (loan: CreateLoanDTO) => {
    const { error } = await loanService.createLoan(loan);
    if (error) throw new Error(error.message);
    await refreshLoans(true);
  };

  const updateStatus = async (id: string, status: 'PENDING' | 'PAID' | 'OVERDUE') => {
    const { error } = await loanService.updateLoanStatus(id, status);
    if (error) throw new Error(error.message);
    await refreshLoans(true);
  };

  const remove = async (id: string) => {
    const { error } = await loanService.deleteLoan(id);
    if (error) throw new Error(error.message);
    await refreshLoans(true);
  };

  return (
    <LoanContext.Provider
      value={{
        loans,
        isLoading,
        error,
        createLoan: create,
        updateLoanStatus: updateStatus,
        deleteLoan: remove,
        refreshLoans,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoans() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoans must be used within a LoanProvider');
  }
  return context;
}