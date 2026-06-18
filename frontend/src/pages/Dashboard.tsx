import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { Transaction } from '../types/transaction';
import Summary from '../components/Summary';
import SpendingChart from '../components/SpendingChart';
import FilterBar from '../components/FilterBar';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';

export default function Dashboard() {
  const {
    transactions, summary, filters, loading,
    fetchTransactions, fetchSummary, setFilters,
    createTransaction, updateTransaction, deleteTransaction, toggleComplete,
  } = useTransactionStore();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters.type, filters.category, filters.from, filters.to]);

  const handleEdit = (t: Transaction) => { setEditTarget(t); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditTarget(null); };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'completed' | 'created_at'>) => {
    if (editTarget) {
      await updateTransaction(editTarget.id, data);
    } else {
      await createTransaction(data);
    }
  };

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
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
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
