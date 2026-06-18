export interface Transaction {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export type DbRow = Transaction;

export interface CreateTransactionDTO {
  title: string;
  amount: number;
  category?: string;
  date: string;
  notes?: string;
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  completed?: boolean;
}

export interface Summary {
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  byCategory: { category: string; total: number }[];
}
