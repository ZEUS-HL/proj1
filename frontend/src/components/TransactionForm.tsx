import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../types/transaction';

const CATEGORIES = ['Auto', 'Income', 'Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Education', 'Shopping', 'Other'];

interface Props {
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'completed' | 'created_at'>) => Promise<void>;
  initial?: Transaction | null;
}

export default function TransactionForm({ onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    amount: initial ? String(Math.abs(initial.amount)) : '',
    type: initial ? (initial.amount >= 0 ? 'income' : 'expense') : 'expense',
    category: initial?.category ?? 'Auto',
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    notes: initial?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) { setError('Title and amount are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const numAmount = parseFloat(form.amount) * (form.type === 'expense' ? -1 : 1);
      await onSubmit({ title: form.title, amount: numAmount, category: form.category, date: form.date, notes: form.notes });
      onClose();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold">{initial ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Lunch at restaurant"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {['income', 'expense'].map(t => (
                  <button type="button" key={t} onClick={() => set('type', t)}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors capitalize ${
                      form.type === t
                        ? t === 'income' ? 'bg-emerald-500 text-white shadow' : 'bg-red-500 text-white shadow'
                        : 'text-slate-500'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
              <input
                type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                min="0" step="0.01" placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white cursor-pointer">
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'Auto' ? 'Auto-detect' : c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} placeholder="Any additional details..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60">
              {loading ? 'Saving...' : initial ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
