import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Filters, TransactionType } from '../types/transaction';

const CATEGORIES = ['', 'Income', 'Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Education', 'Shopping', 'Other'];

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={e => onChange({ search: e.target.value })}
            className="w-full text-sm outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['all', 'income', 'expense'] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => onChange({ type: t })}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors capitalize ${
                filters.type === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <SlidersHorizontal className="w-4 h-4" />
        </div>

        <select
          value={filters.category}
          onChange={e => onChange({ category: e.target.value })}
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="date"
          value={filters.from}
          onChange={e => onChange({ from: e.target.value })}
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          title="From date"
        />
        <input
          type="date"
          value={filters.to}
          onChange={e => onChange({ to: e.target.value })}
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          title="To date"
        />

        {(filters.category || filters.from || filters.to || filters.search) && (
          <button
            onClick={() => onChange({ category: '', from: '', to: '', search: '' })}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
