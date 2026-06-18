import { neon } from '@neondatabase/serverless';
import { DbRow } from './types/transaction';
import { User } from './types/user';

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return neon(url);
}

async function init() {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      date DATE NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

// Run migrations on first import (Vercel serverless: runs once per cold start)
let initialized = false;
export async function ensureInit() {
  if (!initialized) { await init(); initialized = true; }
}

const toRow = (r: any): DbRow => ({
  ...r,
  amount: parseFloat(r.amount),
  date: typeof r.date === 'string' ? r.date.slice(0, 10) : r.date.toISOString().slice(0, 10),
  created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  completed: r.completed === true || r.completed === 1,
});

const toUser = (r: any): User => ({
  ...r,
  created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
});

export const userDb = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const db = sql();
    const rows = await db`SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
    return rows[0] ? toUser(rows[0]) : undefined;
  },

  findById: async (id: number): Promise<User | undefined> => {
    const db = sql();
    const rows = await db`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] ? toUser(rows[0]) : undefined;
  },

  insert: async (data: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    const db = sql();
    const rows = await db`
      INSERT INTO users (name, email, password_hash)
      VALUES (${data.name}, ${data.email}, ${data.password_hash})
      RETURNING *
    `;
    return toUser(rows[0]);
  },
};

const db = {
  all: async (userId: number, filters: { category?: string; from?: string; to?: string; type?: string }): Promise<DbRow[]> => {
    const dbConn = sql();
    const rows = await dbConn`
      SELECT * FROM transactions WHERE user_id = ${userId}
      ORDER BY date DESC, created_at DESC
    `;
    return rows.map(toRow).filter(r => {
      if (filters.category && r.category !== filters.category) return false;
      if (filters.from && r.date < filters.from) return false;
      if (filters.to && r.date > filters.to) return false;
      if (filters.type === 'income' && r.amount <= 0) return false;
      if (filters.type === 'expense' && r.amount >= 0) return false;
      return true;
    });
  },

  get: async (id: number, userId: number): Promise<DbRow | undefined> => {
    const dbConn = sql();
    const rows = await dbConn`SELECT * FROM transactions WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
    return rows[0] ? toRow(rows[0]) : undefined;
  },

  insert: async (data: Omit<DbRow, 'id' | 'created_at'>): Promise<DbRow> => {
    const dbConn = sql();
    const rows = await dbConn`
      INSERT INTO transactions (user_id, title, amount, category, date, completed, notes)
      VALUES (${data.user_id}, ${data.title}, ${data.amount}, ${data.category}, ${data.date}, ${Boolean(data.completed)}, ${data.notes ?? null})
      RETURNING *
    `;
    return toRow(rows[0]);
  },

  update: async (id: number, userId: number, data: Partial<DbRow>): Promise<DbRow | undefined> => {
    const existing = await db.get(id, userId);
    if (!existing) return undefined;
    const merged = {
      title: data.title ?? existing.title,
      amount: data.amount ?? existing.amount,
      category: data.category ?? existing.category,
      date: data.date ?? existing.date,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      completed: data.completed !== undefined ? Boolean(data.completed) : existing.completed,
    };
    const dbConn = sql();
    const rows = await dbConn`
      UPDATE transactions SET
        title = ${merged.title},
        amount = ${merged.amount},
        category = ${merged.category},
        date = ${merged.date},
        notes = ${merged.notes ?? null},
        completed = ${merged.completed}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return rows[0] ? toRow(rows[0]) : undefined;
  },

  delete: async (id: number, userId: number): Promise<boolean> => {
    const dbConn = sql();
    const rows = await dbConn`DELETE FROM transactions WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
    return rows.length > 0;
  },

  summary: async (userId: number) => {
    const dbConn = sql();
    const [totals] = await dbConn`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0)::float AS "totalIncome",
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)::float AS "totalOutcome",
        COALESCE(SUM(amount), 0)::float AS balance
      FROM transactions WHERE user_id = ${userId}
    `;
    const byCategory = await dbConn`
      SELECT category, SUM(amount)::float AS total
      FROM transactions WHERE user_id = ${userId}
      GROUP BY category ORDER BY ABS(SUM(amount)) DESC
    `;
    const dailySpending = await dbConn`
      SELECT
        date::text AS date,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)::float AS income,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)::float AS expense
      FROM transactions WHERE user_id = ${userId}
      GROUP BY date ORDER BY date ASC
      LIMIT 30
    `;
    return {
      totalIncome: totals.totalIncome,
      totalOutcome: totals.totalOutcome,
      balance: totals.balance,
      byCategory,
      dailySpending,
    };
  },
};

export type { DbRow };
export default db;
