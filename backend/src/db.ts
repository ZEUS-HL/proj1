import { Transaction } from './types/transaction';
import { User } from './types/user';

export interface DbRow extends Omit<Transaction, 'completed'> {
  completed: number;
}

let nextTxId = 1;
let nextUserId = 1;
const transactions: DbRow[] = [];
const users: User[] = [];

export const userDb = {
  findByEmail: (email: string): User | undefined =>
    users.find(u => u.email.toLowerCase() === email.toLowerCase()),

  findById: (id: number): User | undefined => users.find(u => u.id === id),

  insert: (data: Omit<User, 'id' | 'created_at'>): User => {
    const user: User = { ...data, id: nextUserId++, created_at: new Date().toISOString() };
    users.push(user);
    return user;
  },
};

const db = {
  all: (userId: number, filter: (r: DbRow) => boolean = () => true): DbRow[] =>
    transactions
      .filter(r => r.user_id === userId && filter(r))
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.created_at.localeCompare(a.created_at);
      }),

  get: (id: number, userId: number): DbRow | undefined =>
    transactions.find(r => r.id === id && r.user_id === userId),

  insert: (data: Omit<DbRow, 'id' | 'created_at'>): DbRow => {
    const row: DbRow = { ...data, id: nextTxId++, created_at: new Date().toISOString() };
    transactions.push(row);
    return row;
  },

  update: (id: number, userId: number, data: Partial<DbRow>): DbRow | undefined => {
    const idx = transactions.findIndex(r => r.id === id && r.user_id === userId);
    if (idx === -1) return undefined;
    transactions[idx] = { ...transactions[idx], ...data };
    return transactions[idx];
  },

  delete: (id: number, userId: number): boolean => {
    const idx = transactions.findIndex(r => r.id === id && r.user_id === userId);
    if (idx === -1) return false;
    transactions.splice(idx, 1);
    return true;
  },

  summary: (userId: number) => {
    const rows = transactions.filter(r => r.user_id === userId);
    const totalIncome = rows.reduce((s, r) => r.amount > 0 ? s + r.amount : s, 0);
    const totalOutcome = rows.reduce((s, r) => r.amount < 0 ? s + Math.abs(r.amount) : s, 0);
    const balance = rows.reduce((s, r) => s + r.amount, 0);

    const catMap: Record<string, number> = {};
    for (const r of rows) catMap[r.category] = (catMap[r.category] ?? 0) + r.amount;
    const byCategory = Object.entries(catMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    const dayMap: Record<string, { income: number; expense: number }> = {};
    for (const r of rows) {
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
