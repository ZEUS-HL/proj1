export interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface Summary {
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  byCategory: { category: string; total: number }[];
  dailySpending: { date: string; expense: number; income: number }[];
}

export type TransactionType = 'all' | 'income' | 'expense';

export interface Filters {
  type: TransactionType;
  category: string;
  from: string;
  to: string;
  search: string;
}
