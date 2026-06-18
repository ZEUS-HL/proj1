import { Response } from 'express';
import db, { ensureInit } from '../db';
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

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    await ensureInit();
    const { category, from, to, type } = req.query as Record<string, string>;
    const rows = await db.all(req.userId!, { category, from, to, type });
    res.json(rows);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    await ensureInit();
    const { title, amount, category, date, notes }: CreateTransactionDTO = req.body;
    if (!title || amount === undefined || !date) {
      return res.status(400).json({ error: 'title, amount, and date are required' });
    }
    const cat = (!category || category === 'Auto') ? autoCategory(title) : category;
    const row = await db.insert({ user_id: req.userId!, title, amount, category: cat, date, notes: notes || '', completed: false });
    res.status(201).json(row);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    await ensureInit();
    const id = parseInt(req.params.id);
    const existing = await db.get(id, req.userId!);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const { title, amount, category, date, notes, completed }: UpdateTransactionDTO = req.body;
    const row = await db.update(id, req.userId!, { title, amount, category, date, notes, completed });
    res.json(row);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const toggleComplete = async (req: AuthRequest, res: Response) => {
  try {
    await ensureInit();
    const id = parseInt(req.params.id);
    const existing = await db.get(id, req.userId!);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const row = await db.update(id, req.userId!, { completed: !existing.completed });
    res.json(row);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    await ensureInit();
    const id = parseInt(req.params.id);
    if (!await db.delete(id, req.userId!)) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    await ensureInit();
    res.json(await db.summary(req.userId!));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};
