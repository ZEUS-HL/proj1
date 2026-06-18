import { Transaction } from './types/transaction';

export interface DbRow extends Omit<Transaction, 'completed'> {
  completed: number;
}

let nextId = 1;
const store: DbRow[] = [];

const db = {
  all: (filter: (r: DbRow) => boolean = () => true): DbRow[] =>
    store.filter(filter).sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.created_at.localeCompare(a.created_at);
    }),

  get: (id: number): DbRow | undefined => store.find(r => r.id === id),

  insert: (data: Omit<DbRow, 'id' | 'created_at'>): DbRow => {
    const row: DbRow = { ...data, id: nextId++, created_at: new Date().toISOString() };
    store.push(row);
    return row;
  },

  update: (id: number, data: Partial<DbRow>): DbRow | undefined => {
    const idx = store.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    store[idx] = { ...store[idx], ...data };
    return store[idx];
  },

  delete: (id: number): boolean => {
    const idx = store.findIndex(r => r.id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  },

  summary: () => {
    const totalIncome = store.reduce((s, r) => r.amount > 0 ? s + r.amount : s, 0);
    const totalOutcome = store.reduce((s, r) => r.amount < 0 ? s + Math.abs(r.amount) : s, 0);
    const balance = store.reduce((s, r) => s + r.amount, 0);

    const catMap: Record<string, number> = {};
    for (const r of store) catMap[r.category] = (catMap[r.category] ?? 0) + r.amount;
    const byCategory = Object.entries(catMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    const dayMap: Record<string, { income: number; expense: number }> = {};
    for (const r of store) {
      if (!dayMap[r.date]) dayMap[r.date] = { income: 0, expense: 0 };
      if (r.amount > 0) dayMap[r.date].income += r.amount;
      else dayMap[r.date].expense += Math.abs(r.amount);
    }
    const dailySpending = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, v]) => ({ date, ...v }));

    return { totalIncome, totalOutcome, balance, byCategory, dailySpending };
  },
};

export default db;
