import React from 'react';

const COLORS: Record<string, string> = {
  Income: 'bg-emerald-100 text-emerald-700',
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Housing: 'bg-purple-100 text-purple-700',
  Health: 'bg-red-100 text-red-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Education: 'bg-indigo-100 text-indigo-700',
  Shopping: 'bg-yellow-100 text-yellow-700',
  Other: 'bg-slate-100 text-slate-600',
};

export default function CategoryBadge({ category }: { category: string }) {
  const cls = COLORS[category] || COLORS.Other;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {category}
    </span>
  );
}
