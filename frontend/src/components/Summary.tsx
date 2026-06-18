import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Summary as SummaryType } from '../types/transaction';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

interface Props {
  summary: SummaryType | null;
}

export default function Summary({ summary }: Props) {
  const income = summary?.totalIncome ?? 0;
  const outcome = summary?.totalOutcome ?? 0;
  const balance = summary?.balance ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(income)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(outcome)}</p>
        </div>
      </div>

      <div className={`rounded-2xl shadow-sm border p-5 flex items-center gap-4 ${balance >= 0 ? 'bg-primary-50 border-primary-100' : 'bg-red-50 border-red-100'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${balance >= 0 ? 'bg-primary-100' : 'bg-red-100'}`}>
          <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-primary-600' : 'text-red-600'}`} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-700' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
