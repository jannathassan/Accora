import { useState } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { fmtCurrency, fmtDate } from '../utils/format';
import type { Invoice, InvoiceCreate, InvoiceItem, InvoiceStatusType } from '../types';
import { clsx } from 'clsx';
import {
  Plus, Search, Trash2, Edit3, X, Check, FileText, CheckCircle2, Clock, AlertTriangle, Filter,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof CheckCircle2; label: string }> = {
  paid:    { bg: 'bg-positive-light', text: 'text-positive', icon: CheckCircle2, label: 'Paid' },
  pending: { bg: 'bg-warning-light',  text: 'text-warning',  icon: Clock,        label: 'Pending' },
  overdue: { bg: 'bg-risk-light',     text: 'text-risk',     icon: AlertTriangle,label: 'Overdue' },
  sent:    { bg: 'bg-brand-50',       text: 'text-brand-600', icon: FileText,     label: 'Sent' },
  draft:   { bg: 'bg-surface-100',    text: 'text-surface-500', icon: FileText,   label: 'Draft' },
};

const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, amount: 0,
});

export default function InvoicesPage() {
  const {
    invoices, invoiceSummary, loading, addInvoice, editInvoice, removeInvoice,
  } = useFinancial();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceCreate>({
    client_name: '', client_email: '', items: [emptyItem()],
    tax_rate: 0, status: 'draft', issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], notes: '',
  });

  const filtered = invoices.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return inv.client_name.toLowerCase().includes(q) || inv.invoice_number.toLowerCase().includes(q);
    }
    return true;
  });

  const resetForm = () => {
    setForm({
      client_name: '', client_email: '', items: [emptyItem()],
      tax_rate: 0, status: 'draft', issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], notes: '',
    });
    setShowForm(false);
    setEditingId(null);
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

  const handleSubmit = async () => {
    if (!form.client_name || !form.items.length || form.items.some((i) => !i.description || i.amount <= 0)) return;
    if (editingId) {
      await editInvoice(editingId, form);
    } else {
      await addInvoice(form);
    }
    resetForm();
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
    await editInvoice(inv.id, { status: 'paid', paid_date: new Date().toISOString().split('T')[0] });
  };

  const subtotal = form.items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal + subtotal * (form.tax_rate || 0);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-surface-900">Invoices</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      {invoiceSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Invoiced', value: invoiceSummary.total_invoiced, color: 'text-surface-900' },
            { label: 'Paid', value: invoiceSummary.total_paid, color: 'text-positive' },
            { label: 'Pending', value: invoiceSummary.total_pending, color: 'text-warning' },
            { label: 'Overdue', value: invoiceSummary.total_overdue, color: 'text-risk' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
              <p className="text-xs text-surface-500 mb-1">{s.label}</p>
              <p className={clsx('text-lg font-semibold tabular-nums', s.color)}>{fmtCurrency(s.value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-surface-400" />
          {(['', 'paid', 'pending', 'overdue', 'sent', 'draft'] as const).map((s) => (
            <button key={s || 'all'} onClick={() => setStatusFilter(s)}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900">{editingId ? 'Edit Invoice' : 'New Invoice'}</h3>
            <button onClick={resetForm} className="p-1 hover:bg-surface-100 rounded"><X className="w-4 h-4 text-surface-500" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input placeholder="Client Name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <input placeholder="Client Email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          {/* Line items */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-surface-600">Line Items</p>
            {form.items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <input type="number" placeholder="Qty" value={item.quantity || ''} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <input type="number" placeholder="Price" value={item.unit_price || ''} onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1.5 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <span className="w-20 text-right text-sm font-medium tabular-nums">{fmtCurrency(item.amount)}</span>
                <button onClick={() => removeItem(idx)} className="p-1 hover:bg-risk-light rounded"><X className="w-3.5 h-3.5 text-risk" /></button>
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-brand-600 hover:text-brand-700 font-medium">+ Add Line Item</button>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-surface-100">
            <div className="text-sm">
              <span className="text-surface-500">Total: </span>
              <span className="font-semibold text-surface-900 tabular-nums">{fmtCurrency(total)}</span>
            </div>
            <button onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
              <Check className="w-4 h-4" /> {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-surface-400">No invoices found.</div>
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
                    <p className="text-sm font-medium text-surface-900 truncate">{inv.client_name}</p>
                    <p className="text-[11px] text-surface-400">{inv.invoice_number} &middot; Due {fmtDate(inv.due_date)}</p>
                  </div>
                  <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.text)}>{cfg.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-surface-900">{fmtCurrency(inv.total)}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {inv.status !== 'paid' && (
                      <button onClick={() => markPaid(inv)} className="p-1.5 hover:bg-positive-light rounded" title="Mark Paid">
                        <CheckCircle2 className="w-3.5 h-3.5 text-positive" />
                      </button>
                    )}
                    <button onClick={() => startEdit(inv)} className="p-1.5 hover:bg-surface-100 rounded" title="Edit">
                      <Edit3 className="w-3.5 h-3.5 text-surface-400" />
                    </button>
                    <button onClick={() => removeInvoice(inv.id)} className="p-1.5 hover:bg-risk-light rounded" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-risk" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
