import React from 'react';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '../types/transaction';
import CategoryBadge from './CategoryBadge';
import { format, parseISO } from 'date-fns';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n));
}

interface Props {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export default function TransactionItem({ transaction: t, onEdit, onDelete, onToggle }: Props) {
  const isIncome = t.amount > 0;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-sm ${t.completed ? 'bg-slate-50 opacity-70' : 'bg-white border-slate-100'}`}>
      <button onClick={() => onToggle(t.id)} className="flex-shrink-0 text-slate-300 hover:text-emerald-500 transition-colors">
        {t.completed
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          : <Circle className="w-5 h-5" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-medium truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {t.title}
          </p>
          <CategoryBadge category={t.category} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {format(parseISO(t.date), 'MMM d, yyyy')}
          {t.notes && <span className="ml-2 italic">{t.notes}</span>}
        </p>
      </div>

      <p className={`text-base font-semibold flex-shrink-0 ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
      </p>

      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
