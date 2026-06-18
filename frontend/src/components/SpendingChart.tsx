import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { Summary } from '../types/transaction';
import { format, parseISO } from 'date-fns';

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e'];

interface Props {
  summary: Summary | null;
}

function formatUSD(v: number) { return `$${v.toFixed(2)}`; }

export default function SpendingChart({ summary }: Props) {
  if (!summary) return null;

  const daily = (summary.dailySpending || []).map(d => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }));

  const categoryData = (summary.byCategory || [])
    .filter(c => c.total < 0)
    .map(c => ({ name: c.category, value: Math.abs(c.total) }));

  // Chart grows: base 180px + 22px per category row (legend wraps ~3 per row)
  const legendRows = Math.ceil(categoryData.length / 3);
  const pieHeight = Math.max(220, 180 + legendRows * 24);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Daily Cash Flow */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Daily Cash Flow (last 30 days)</h3>
        {daily.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatUSD(v)} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expenses by Category */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Expenses by Category</h3>
        {categoryData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">No expense data yet</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={pieHeight}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="45%"
                  innerRadius="25%"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatUSD(v)}
                  contentStyle={{ borderRadius: '10px', fontSize: 12 }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Category breakdown list */}
            <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
              {categoryData.map((c, i) => {
                const total = categoryData.reduce((s, x) => s + x.value, 0);
                const pct = total > 0 ? ((c.value / total) * 100).toFixed(1) : '0';
                return (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1 text-slate-600 truncate">{c.name}</span>
                    <span className="text-slate-400">{pct}%</span>
                    <span className="font-medium text-slate-700">{formatUSD(c.value)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
