import React from 'react';
import { Receipt, AlertCircle } from 'lucide-react';
import { Transaction } from '../types/transaction';
import TransactionItem from './TransactionItem';

interface Props {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  search: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export default function TransactionList({ transactions, loading, error, search, onEdit, onDelete, onToggle }: Props) {
  const filtered = search
    ? transactions.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes || '').toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
            <div className="flex gap-3 items-center">
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-2 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-400">
        <AlertCircle className="w-10 h-10 mb-3 opacity-60" />
        <p className="text-sm font-medium text-red-500">Failed to load transactions</p>
        <p className="text-xs mt-1 text-red-400 max-w-xs text-center">{error}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Receipt className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-xs mt-1">Add your first transaction using the button above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map(t => (
        <TransactionItem key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
      ))}
    </div>
  );
}
