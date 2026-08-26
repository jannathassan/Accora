import { useState } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { fmtCurrency, fmtDate } from '../utils/format';
import type { Transaction, TransactionCreate, TransactionType } from '../types';
import { clsx } from 'clsx';
import {
  Plus, Search, Trash2, Edit3, X, Check, Filter,
} from 'lucide-react';

export default function TransactionsPage() {
  const {
    transactions, loading, addTransaction, editTransaction, removeTransaction,
  } = useFinancial();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionCreate>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    type: 'expense',
    amount: 0,
    status: 'completed',
    notes: '',
  });

  const filtered = transactions.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      description: '', category: '', type: 'expense', amount: 0, status: 'completed', notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.description || !form.category || form.amount <= 0) return;
    if (editingId) {
      await editTransaction(editingId, form);
    } else {
      await addTransaction(form);
    }
    resetForm();
  };

  const startEdit = (t: Transaction) => {
    setForm({
      date: t.date, description: t.description, category: t.category,
      type: t.type, amount: t.amount, status: t.status, notes: t.notes,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-surface-900">Transactions</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-surface-400" />
          {(['', 'income', 'expense'] as const).map((t) => (
            <button
              key={t || 'all'}
              onClick={() => setTypeFilter(t)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                typeFilter === t ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200',
              )}
            >
              {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900">
              {editingId ? 'Edit Transaction' : 'New Transaction'}
            </h3>
            <button onClick={resetForm} className="p-1 hover:bg-surface-100 rounded">
              <X className="w-4 h-4 text-surface-500" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <input placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <input placeholder="Category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <input type="number" placeholder="Amount" value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {(['income', 'expense'] as TransactionType[]).map((t) => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  className={clsx('px-3 py-1.5 text-xs font-medium rounded-lg',
                    form.type === t ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600')}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={handleSubmit}
              className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
              <Check className="w-4 h-4" /> {editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-surface-400">
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {filtered.slice(0, 100).map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors group">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                  t.type === 'income' ? 'bg-positive-light text-positive' : 'bg-risk-light text-risk',
                )}>
                  {t.type === 'income' ? '+' : '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{t.description}</p>
                  <p className="text-[11px] text-surface-400">{t.category} &middot; {fmtDate(t.date)}</p>
                </div>
                <span className={clsx(
                  'text-sm font-semibold tabular-nums',
                  t.type === 'income' ? 'text-positive' : 'text-risk',
                )}>
                  {t.type === 'income' ? '+' : '-'}{fmtCurrency(t.amount)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(t)} className="p-1.5 hover:bg-surface-100 rounded" title="Edit">
                    <Edit3 className="w-3.5 h-3.5 text-surface-400" />
                  </button>
                  <button onClick={() => removeTransaction(t.id)} className="p-1.5 hover:bg-risk-light rounded" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-risk" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
