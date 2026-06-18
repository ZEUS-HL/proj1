import { create } from 'zustand';
import { Transaction, Summary, Filters } from '../types/transaction';
import { api } from '../api/client';

interface TransactionState {
  transactions: Transaction[];
  summary: Summary | null;
  filters: Filters;
  loading: boolean;
  error: string | null;
  setFilters: (f: Partial<Filters>) => void;
  fetchTransactions: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  createTransaction: (data: Omit<Transaction, 'id' | 'completed' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  summary: null,
  filters: { type: 'all', category: '', from: '', to: '', search: '' },
  loading: false,
  error: null,

  setFilters: (f) => set(s => ({ filters: { ...s.filters, ...f } })),

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const { type, category, from, to } = get().filters;
      const params: Record<string, string> = {};
      if (type !== 'all') params.type = type;
      if (category) params.category = category;
      if (from) params.from = from;
      if (to) params.to = to;
      const transactions = await api.getTransactions(params);
      set({ transactions, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await api.getSummary();
      set({ summary });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  createTransaction: async (data) => {
    const t = await api.createTransaction(data);
    set(s => ({ transactions: [t, ...s.transactions] }));
    get().fetchSummary();
  },

  updateTransaction: async (id, data) => {
    const t = await api.updateTransaction(id, data);
    set(s => ({ transactions: s.transactions.map(x => x.id === id ? t : x) }));
    get().fetchSummary();
  },

  toggleComplete: async (id) => {
    const t = await api.toggleComplete(id);
    set(s => ({ transactions: s.transactions.map(x => x.id === id ? t : x) }));
  },

  deleteTransaction: async (id) => {
    await api.deleteTransaction(id);
    set(s => ({ transactions: s.transactions.filter(x => x.id !== id) }));
    get().fetchSummary();
  },
}));
