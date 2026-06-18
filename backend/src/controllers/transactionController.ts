import { Response } from 'express';
import db from '../db';
import { CreateTransactionDTO, UpdateTransactionDTO } from '../types/transaction';
import { AuthRequest } from '../middleware/auth';

const AUTO_CATEGORIES: { keywords: string[]; category: string }[] = [
  { keywords: ['uber', 'taxi', 'bus', 'metro', 'train', 'fuel', 'gas', 'parking'], category: 'Transport' },
  { keywords: ['restaurant', 'food', 'coffee', 'lunch', 'dinner', 'breakfast', 'grocery', 'supermarket', 'pizza', 'burger'], category: 'Food' },
  { keywords: ['salary', 'freelance', 'invoice', 'payment received', 'income', 'bonus', 'dividend'], category: 'Income' },
  { keywords: ['rent', 'mortgage', 'electricity', 'water', 'internet', 'phone', 'utility', 'bill'], category: 'Housing' },
  { keywords: ['gym', 'doctor', 'hospital', 'pharmacy', 'medicine', 'health', 'dental'], category: 'Health' },
  { keywords: ['netflix', 'spotify', 'subscription', 'streaming', 'entertainment', 'movie', 'game'], category: 'Entertainment' },
  { keywords: ['school', 'university', 'course', 'book', 'education', 'tuition'], category: 'Education' },
  { keywords: ['clothes', 'shoes', 'shopping', 'mall'], category: 'Shopping' },
];

function autoCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of AUTO_CATEGORIES) {
    if (rule.keywords.some(kw => lower.includes(kw))) return rule.category;
  }
  return 'Other';
}

const toClient = (r: any) => ({ ...r, completed: Boolean(r.completed) });

export const getTransactions = (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { category, from, to, type } = req.query;
  const rows = db.all(userId, r => {
    if (category && r.category !== category) return false;
    if (from && r.date < (from as string)) return false;
    if (to && r.date > (to as string)) return false;
    if (type === 'income' && r.amount <= 0) return false;
    if (type === 'expense' && r.amount >= 0) return false;
    return true;
  });
  res.json(rows.map(toClient));
};

export const createTransaction = (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { title, amount, category, date, notes }: CreateTransactionDTO = req.body;
  if (!title || amount === undefined || !date) {
    return res.status(400).json({ error: 'title, amount, and date are required' });
  }
  const cat = (!category || category === 'Auto') ? autoCategory(title) : category;
  const row = db.insert({ user_id: userId, title, amount, category: cat, date, notes: notes || '', completed: 0 });
  res.status(201).json(toClient(row));
};

export const updateTransaction = (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id);
  const existing = db.get(id, userId);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { title, amount, category, date, notes, completed }: UpdateTransactionDTO = req.body;
  const row = db.update(id, userId, {
    title: title ?? existing.title,
    amount: amount ?? existing.amount,
    category: category ?? existing.category,
    date: date ?? existing.date,
    notes: notes !== undefined ? notes : existing.notes,
    completed: completed !== undefined ? (completed ? 1 : 0) : existing.completed,
  });
  res.json(toClient(row));
};

export const toggleComplete = (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id);
  const existing = db.get(id, userId);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const row = db.update(id, userId, { completed: existing.completed ? 0 : 1 });
  res.json(toClient(row));
};

export const deleteTransaction = (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const id = parseInt(req.params.id);
  if (!db.delete(id, userId)) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
};

export const getSummary = (req: AuthRequest, res: Response) => {
  res.json(db.summary(req.userId!));
};
