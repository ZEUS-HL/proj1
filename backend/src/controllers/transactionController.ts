import { Request, Response } from 'express';
import db from '../db';
import { CreateTransactionDTO, UpdateTransactionDTO } from '../types/transaction';

const AUTO_CATEGORIES: { keywords: string[]; category: string }[] = [
  { keywords: ['uber', 'taxi', 'bus', 'metro', 'train', 'fuel', 'gas', 'parking'], category: 'Transport' },
  { keywords: ['restaurant', 'food', 'coffee', 'lunch', 'dinner', 'breakfast', 'grocery', 'supermarket', 'pizza', 'burger'], category: 'Food' },
  { keywords: ['salary', 'freelance', 'invoice', 'payment received', 'income', 'bonus', 'dividend'], category: 'Income' },
  { keywords: ['rent', 'mortgage', 'electricity', 'water', 'internet', 'phone', 'utility', 'bill'], category: 'Housing' },
  { keywords: ['gym', 'doctor', 'hospital', 'pharmacy', 'medicine', 'health', 'dental'], category: 'Health' },
  { keywords: ['netflix', 'spotify', 'amazon', 'subscription', 'streaming', 'entertainment', 'movie', 'game'], category: 'Entertainment' },
  { keywords: ['school', 'university', 'course', 'book', 'education', 'tuition'], category: 'Education' },
  { keywords: ['clothes', 'shoes', 'shopping', 'amazon', 'mall'], category: 'Shopping' },
];

function autoCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of AUTO_CATEGORIES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.category;
  }
  return 'Other';
}

export const getTransactions = (req: Request, res: Response) => {
  const { category, from, to, type } = req.query;
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: (string | number)[] = [];

  if (category) { query += ' AND category = ?'; params.push(category as string); }
  if (from) { query += ' AND date >= ?'; params.push(from as string); }
  if (to) { query += ' AND date <= ?'; params.push(to as string); }
  if (type === 'income') { query += ' AND amount > 0'; }
  if (type === 'expense') { query += ' AND amount < 0'; }

  query += ' ORDER BY date DESC, created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map((r: any) => ({ ...r, completed: Boolean(r.completed) })));
};

export const createTransaction = (req: Request, res: Response) => {
  const { title, amount, category, date, notes }: CreateTransactionDTO = req.body;
  if (!title || amount === undefined || !date) {
    return res.status(400).json({ error: 'title, amount, and date are required' });
  }
  const cat = (!category || category === 'Auto') ? autoCategory(title) : category;
  const stmt = db.prepare('INSERT INTO transactions (title, amount, category, date, notes) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(title, amount, cat, date, notes || null);
  const row: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...row, completed: Boolean(row.completed) });
};

export const updateTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const existing: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { title, amount, category, date, notes, completed }: UpdateTransactionDTO = req.body;
  const updated = {
    title: title ?? existing.title,
    amount: amount ?? existing.amount,
    category: category ?? existing.category,
    date: date ?? existing.date,
    notes: notes !== undefined ? notes : existing.notes,
    completed: completed !== undefined ? (completed ? 1 : 0) : existing.completed,
  };
  db.prepare('UPDATE transactions SET title=?, amount=?, category=?, date=?, notes=?, completed=? WHERE id=?')
    .run(updated.title, updated.amount, updated.category, updated.date, updated.notes, updated.completed, id);
  const row: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.json({ ...row, completed: Boolean(row.completed) });
};

export const toggleComplete = (req: Request, res: Response) => {
  const { id } = req.params;
  const row: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE transactions SET completed = ? WHERE id = ?').run(row.completed ? 0 : 1, id);
  const updated: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.json({ ...updated, completed: Boolean(updated.completed) });
};

export const deleteTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const row = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  res.status(204).send();
};

export const getSummary = (_req: Request, res: Response) => {
  const totals: any = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as totalIncome,
      COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) as totalOutcome,
      COALESCE(SUM(amount), 0) as balance
    FROM transactions
  `).get();

  const byCategory: any[] = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM transactions
    GROUP BY category
    ORDER BY ABS(SUM(amount)) DESC
  `).all() as any[];

  const dailySpending: any[] = db.prepare(`
    SELECT date, SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expense,
           SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income
    FROM transactions
    GROUP BY date
    ORDER BY date ASC
    LIMIT 30
  `).all() as any[];

  res.json({ ...totals, byCategory, dailySpending });
};
