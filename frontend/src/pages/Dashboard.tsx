import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, LogOut, User } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import { Transaction } from '../types/transaction';
import Summary from '../components/Summary';
import SpendingChart from '../components/SpendingChart';
import FilterBar from '../components/FilterBar';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

export default function Dashboard() {
  const {
    transactions, summary, filters, loading, error,
    fetchTransactions, fetchSummary, setFilters,
    createTransaction, updateTransaction, deleteTransaction, toggleComplete,
  } = useTransactionStore();

  const { user, logout } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters.type, filters.category, filters.from, filters.to]);

  const handleEdit = (t: Transaction) => { setEditTarget(t); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditTarget(null); };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'completed' | 'created_at' | 'user_id'>) => {
    if (editTarget) {
      await updateTransaction(editTarget.id, data);
    } else {
      await createTransaction(data);
    }
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            <span className="text-lg font-bold text-slate-800">ExpenseTracker</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchTransactions(); fetchSummary(); }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>

            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-2">
          <p className="text-slate-500 text-sm">Welcome back, <span className="font-medium text-slate-700">{user?.name}</span></p>
        </div>
        <Summary summary={summary} />
        <SpendingChart summary={summary} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Transactions</h2>
            <span className="text-xs text-slate-400">{transactions.length} records</span>
          </div>
          <FilterBar filters={filters} onChange={setFilters} />
          <TransactionList
            transactions={transactions}
            loading={loading}
            error={error}
            search={filters.search}
            onEdit={handleEdit}
            onDelete={deleteTransaction}
            onToggle={toggleComplete}
          />
        </div>
      </main>

      {showForm && (
        <TransactionForm
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initial={editTarget}
        />
      )}
    </div>
  );
}
