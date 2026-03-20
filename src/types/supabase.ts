// Placeholder Database type.
// To generate full types from your Supabase schema, run:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string | null;
          amount: number;
          type: 'INCOME' | 'EXPENSE';
          description: string;
          category: string | null;
          date: string;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'BORROWED' | 'LENT';
          name: string;
          description: string | null;
          due_date: string | null;
          status: 'PENDING' | 'PAID' | 'OVERDUE';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      loan_payments: {
        Row: {
          id: string;
          loan_id: string;
          amount: number;
          date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
