import { getCurrentDate } from '../utils/date';
import { useState, useCallback } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { fmtCurrency, fmtDate } from '../utils/format';
import type { Invoice, InvoiceCreate, InvoiceItem } from '../types';
import { clsx } from 'clsx';
import {
  Plus, Search, Trash2, Edit3, X, Check, FileText, CheckCircle2, Clock, AlertTriangle, Filter
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof CheckCircle2; label: string }> = {
  paid:    { bg: 'bg-positive-light border border-positive/30', text: 'text-positive', icon: CheckCircle2, label: 'Paid' },
  pending: { bg: 'bg-warning-light border border-warning/30',   text: 'text-warning',   icon: Clock,        label: 'Pending' },
  overdue: { bg: 'bg-risk-light border border-risk/30',      text: 'text-risk',    icon: AlertTriangle,label: 'Overdue' },
  sent:    { bg: 'bg-brand-50 border border-brand-200',      text: 'text-brand-600',   icon: FileText,     label: 'Sent' },
  draft:   { bg: 'bg-surface-100 border border-surface-200',     text: 'text-surface-500',   icon: FileText,     label: 'Draft' },
};

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0,
});

const getInitialInvoice = (): InvoiceCreate => ({
  client_name: '',
  client_email: '',
  items: [emptyItem()],
  tax_rate: 0,
  status: 'draft',
  issue_date: getCurrentDate(),
  due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  notes: '',
});

export default function InvoicesPage() {
  const {
    invoices, invoiceSummary, loading, addInvoice, editInvoice, removeInvoice,
  } = useFinancial();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceCreate>(getInitialInvoice);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const filtered = invoices.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return inv.client_name.toLowerCase().includes(q) || inv.invoice_number.toLowerCase().includes(q);
    }
    return true;
  });

  const resetForm = () => {
    setForm(getInitialInvoice());
    setShowForm(false);
    setEditingId(null);
    setTouched(false);
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    const items = [...form.items];
    const item = { ...items[idx], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      item.amount = item.quantity * item.unit_price;
    }
    items[idx] = item;
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem()] });
  const removeItem = (idx: number) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const invoiceIsValid = form.client_name.trim() !== '' && form.items.length > 0 && !form.items.some((i) => !i.description.trim() || i.amount <= 0);
  const showInvoiceErrors = touched && !invoiceIsValid;

  const handleSubmit = async () => {
    setTouched(true);
    if (!invoiceIsValid || submitting) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await editInvoice(editingId, form);
        showToast('Invoice updated');
      } else {
        await addInvoice(form);
        showToast('Invoice created');
      }
      resetForm();
    } catch { showToast('Failed to save invoice'); }
    finally { setSubmitting(false); }
  };

  const startEdit = (inv: Invoice) => {
    setForm({
      client_name: inv.client_name, client_email: inv.client_email,
      items: inv.items, tax_rate: inv.tax_rate, status: inv.status,
      issue_date: inv.issue_date, due_date: inv.due_date, notes: inv.notes,
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const markPaid = async (inv: Invoice) => {
    await editInvoice(inv.id, { status: 'paid', paid_date: getCurrentDate() });
    showToast('Invoice marked as paid');
  };

  const handleDelete = (inv: Invoice) => {
    setPendingDelete(inv.id);
  };

  const confirmDelete = (inv: Invoice) => {
    setPendingDelete(null);
    removeInvoice(inv.id).then(() => showToast('Invoice deleted'));
  };

  const subtotal = form.items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal + subtotal * (form.tax_rate || 0);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-4 font-sans">
      {/* Toast */}
      {toast && (
        <div className="toast-enter fixed top-4 right-4 z-50 px-4 py-2.5 bg-surface-900 text-white text-xs font-semibold rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              Invoices
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-200/50 border border-surface-200 text-surface-600 dark:text-surface-300 text-[11px] font-medium">
              {invoices.length} invoices
            </span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Manage client billing, accounts receivable, and payment statuses
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 p-4 animate-pulse">
              <div className="h-3 w-16 bg-surface-200 rounded mb-2" />
              <div className="h-5 w-24 bg-surface-200 rounded" />
            </div>
          ))}
        </div>
      ) : invoiceSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Total Invoiced', value: invoiceSummary.total_invoiced, color: 'text-surface-900 dark:text-surface-100' },
            { label: 'Paid', value: invoiceSummary.total_paid, color: 'text-positive' },
            { label: 'Pending', value: invoiceSummary.total_pending, color: 'text-warning' },
            { label: 'Overdue', value: invoiceSummary.total_overdue, color: 'text-risk' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4 hover:border-surface-300 transition-all">
              <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">{s.label}</p>
              <p className={clsx('text-lg font-bold tabular-nums font-mono', s.color)}>{fmtCurrency(s.value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            aria-label="Search invoices"
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-surface-400" />
          {(['', 'paid', 'pending', 'overdue', 'sent', 'draft'] as const).map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-card border border-surface-200 text-surface-600 dark:text-surface-300 hover:bg-surface-100',
              )}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4 md:p-5 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
              {editingId ? 'Edit Invoice' : 'New Invoice'}
            </h3>
            <button onClick={resetForm} className="p-1 hover:bg-surface-100 rounded transition-colors"><X className="w-4 h-4 text-surface-500" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Client Name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              aria-label="Client Name"
              className={clsx('px-3 py-2 bg-surface-50 dark:bg-surface-100/50 border rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
                showInvoiceErrors && !form.client_name.trim() ? 'border-risk' : 'border-surface-200')} />
            <input placeholder="Client Email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              aria-label="Client Email"
              className="px-3 py-2 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
            <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
              aria-label="Issue Date"
              className="px-3 py-2 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              aria-label="Due Date"
              className="px-3 py-2 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
          </div>
          {showInvoiceErrors && (
            <p className="text-xs text-risk">Please fill in client name and ensure all line items have descriptions and positive amounts.</p>
          )}
          {/* Line items */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">Line Items</p>
            {form.items.map((item, idx) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-2">
                <input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  aria-label={`Item ${idx + 1} description`}
                  className="flex-1 px-3 py-1.5 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                    <span className="text-[10px] text-surface-400 md:hidden">Qty</span>
                    <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      aria-label={`Item ${idx + 1} quantity`}
                      className="w-full md:w-16 px-2 py-1.5 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                    <span className="text-[10px] text-surface-400 md:hidden">Price</span>
                    <input type="number" placeholder="Price" value={item.unit_price || ''} onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      aria-label={`Item ${idx + 1} price`}
                      className="w-full md:w-24 px-2 py-1.5 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
                  </div>
                  <span className="w-24 text-right text-xs font-semibold tabular-nums font-mono hidden md:block text-surface-900 dark:text-surface-100">{fmtCurrency(item.amount)}</span>
                  <button onClick={() => removeItem(idx)} className="p-1 hover:bg-risk-light rounded transition-colors cursor-pointer" aria-label={`Remove item ${idx + 1}`}><X className="w-3.5 h-3.5 text-risk" /></button>
                </div>
                <span className="text-right text-xs font-semibold tabular-nums font-mono md:hidden text-surface-900 dark:text-surface-100">{fmtCurrency(item.amount)}</span>
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-brand-600 hover:underline font-semibold cursor-pointer">+ Add Line Item</button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-surface-100">
            <div className="text-xs space-x-3 text-surface-500 dark:text-surface-400">
              <span>Subtotal: <strong className="text-surface-900 dark:text-surface-100 tabular-nums font-mono">{fmtCurrency(subtotal)}</strong></span>
              {(form.tax_rate ?? 0) > 0 && (
                <>
                  <span>|</span>
                  <span>Tax ({((form.tax_rate ?? 0) * 100).toFixed(1)}%): <strong className="text-surface-900 dark:text-surface-100 tabular-nums font-mono">{fmtCurrency(subtotal * (form.tax_rate ?? 0))}</strong></span>
                </>
              )}
              <span>|</span>
              <span>Total: <strong className="text-surface-900 dark:text-surface-100 tabular-nums font-mono font-bold">{fmtCurrency(total)}</strong></span>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs md:text-sm font-semibold rounded-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
              <Check className="w-4 h-4" /> {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-surface-300 mx-auto mb-3" />
            <p className="text-sm text-surface-500 font-medium">No invoices found</p>
            <p className="text-xs text-surface-400 mt-1">Create your first invoice to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {filtered.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft;
              const Icon = cfg.icon;
              return (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors group">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon className={clsx('w-4 h-4', cfg.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{inv.client_name}</p>
                    <p className="text-[11px] text-surface-400">{inv.invoice_number} &middot; Due {fmtDate(inv.due_date)}</p>
                  </div>
                  <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.text)}>{cfg.label}</span>
                  <span className="text-sm font-semibold tabular-nums font-mono text-surface-900 dark:text-surface-100">{fmtCurrency(inv.total)}</span>
                  {pendingDelete === inv.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-surface-500">Delete?</span>
                      <button onClick={() => confirmDelete(inv)}
                        className="px-2 py-1 text-xs font-semibold bg-risk text-white rounded-md hover:bg-risk/90 transition-colors cursor-pointer">
                        Yes
                      </button>
                      <button onClick={() => setPendingDelete(null)}
                        className="px-2 py-1 text-xs font-medium bg-surface-100 text-surface-600 rounded-md hover:bg-surface-200 transition-colors cursor-pointer">
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {inv.status !== 'paid' && (
                        <button onClick={() => markPaid(inv)} className="p-1.5 hover:bg-positive-light rounded transition-colors cursor-pointer" title="Mark Paid">
                          <CheckCircle2 className="w-3.5 h-3.5 text-positive" />
                        </button>
                      )}
                      <button onClick={() => startEdit(inv)} className="p-1.5 hover:bg-surface-100 rounded transition-colors cursor-pointer" title="Edit">
                        <Edit3 className="w-3.5 h-3.5 text-surface-400 hover:text-surface-600" />
                      </button>
                      <button onClick={() => handleDelete(inv)} className="p-1.5 hover:bg-risk-light rounded transition-colors cursor-pointer" title="Delete" aria-label="Delete invoice">
                        <Trash2 className="w-3.5 h-3.5 text-risk" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
