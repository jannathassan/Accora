import { useState, useMemo } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import { guessCategory } from '../utils/calculations';
import {
  Plus,
  Search,
  Trash2,
  Download,
  Repeat,
  Wallet,
  Building,
  Coins,
} from 'lucide-react';

export default function TransactionsPage() {
  const {
    transactions,
    activePersonaKey,
    addTransaction,
    deleteTransaction,
    loadPersona,
  } = useMoneyStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formType, setFormType] = useState<'in' | 'out'>('out');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formAccount, setFormAccount] = useState<'cash' | 'bank' | 'wallet'>('cash');
  const [formRepeat, setFormRepeat] = useState(false);

  // Categories based on profile (Section 6)
  const isHousehold = activePersonaKey === 'home';
  const categories = useMemo(() => {
    if (isHousehold) {
      return ['Groceries', 'School fees', 'Utilities', 'Medical', 'Transport', 'Committee', 'Shopping', 'Other'];
    }
    return ['Stock', 'Rent', 'Salaries', 'Utilities', 'Ads', 'Software', 'Transport', 'Groceries', 'Sales', 'Client payment', 'Other'];
  }, [isHousehold]);

  // Handle Note Input with Auto-guess Category
  const handleNoteChange = (text: string) => {
    setFormNote(text);
    if (!formCategory || formCategory === 'Other') {
      const guessed = guessCategory(text);
      if (guessed && guessed !== 'Other') {
        setFormCategory(guessed);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount) || 0;
    if (amt <= 0) return;

    const assignedCategory = formCategory || guessCategory(formNote) || 'Other';

    await addTransaction({
      amount: amt,
      type: formType,
      category: assignedCategory,
      note: formNote.trim() || assignedCategory,
      date: formDate,
      account: formAccount,
      repeatMonthly: formRepeat,
    });

    // Reset Form
    setFormAmount('');
    setFormNote('');
    setFormCategory('');
    setFormRepeat(false);
    setShowAddForm(false);
  };

  // Filtered & Searched Rows
  const filteredRows = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.note.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      }
      return true;
    });
  }, [transactions, typeFilter, search]);

  // Monthly totals for filtered view
  const totalIn = filteredRows.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = filteredRows.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Date', 'Type', 'Category', 'Description/Note', 'Account', 'Amount (PKR)'];
    const rows = filteredRows.map((t) => [
      t.date,
      t.type === 'in' ? 'Income' : 'Spending',
      t.category,
      `"${t.note.replace(/"/g, '""')}"`,
      t.account || 'cash',
      t.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accora-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Tool #2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
            Income &amp; Spending Tracker
          </h1>
          <p className="text-sm text-[#5B6785] mt-1">
            Add what comes in and goes out. The category auto-fills as you type the note.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-lime text-xs py-2 px-4 shadow-2xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Entry</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="btn-outline text-xs py-2 px-3.5 bg-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* ── Add / Edit Transaction Form ── */}
      {showAddForm && (
        <form
          onSubmit={handleSave}
          className="accora-card bg-white border-[#E2E8F7] space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F7] pb-3">
            <h2 className="text-base font-bold text-[#1D2839]">Record New Entry</h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#5B6785] hover:text-[#1D2839]"
            >
              Cancel
            </button>
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setFormType('out')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                formType === 'out'
                  ? 'bg-[#ffefed] text-[#FD614F] border-[#ffd4cf] shadow-xs'
                  : 'bg-[#F4F7FC] text-[#5B6785] border-transparent'
              }`}
            >
              Money Out (Spending)
            </button>
            <button
              type="button"
              onClick={() => setFormType('in')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                formType === 'in'
                  ? 'bg-[#f3fbd9] text-[#1D2839] border-[#A3D508] shadow-xs'
                  : 'bg-[#F4F7FC] text-[#5B6785] border-transparent'
              }`}
            >
              Money In (Income)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[#5B6785] font-semibold mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 5000"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm font-bold bg-white"
              />
            </div>

            <div>
              <label className="block text-[#5B6785] font-semibold mb-1">
                Note / Description (auto-picks category)
              </label>
              <input
                type="text"
                placeholder="e.g. Groceries from mart, client payment"
                value={formNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-[#5B6785] font-semibold mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-xs bg-white min-h-[38px]"
              >
                <option value="">Auto-Detect ({guessCategory(formNote)})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#5B6785] font-semibold mb-1">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-xs bg-white min-h-[38px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E2E8F7]">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-semibold text-[#5B6785]">Account:</span>
              {(['cash', 'bank', 'wallet'] as const).map((acc) => (
                <label key={acc} className="flex items-center gap-1.5 cursor-pointer capitalize">
                  <input
                    type="radio"
                    name="account"
                    checked={formAccount === acc}
                    onChange={() => setFormAccount(acc)}
                    className="accent-[#0B5CE6]"
                  />
                  <span>{acc}</span>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-[#1D2839] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formRepeat}
                onChange={(e) => setFormRepeat(e.target.checked)}
                className="rounded accent-[#0B5CE6]"
              />
              <span className="flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-[#0B5CE6]" />
                Repeat monthly (auto-schedules next 2 months)
              </span>
            </label>

            <button type="submit" className="btn-primary text-xs py-2 px-6">
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* ── Filters & Summary Bar ── */}
      <div className="accora-card bg-white border-[#E2E8F7] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5B6785] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by note, category, or amount…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F7] rounded-xl text-xs bg-[#F4F7FC] focus:bg-white"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                typeFilter === 'all' ? 'bg-[#0B5CE6] text-white' : 'bg-[#F4F7FC] text-[#5B6785]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                typeFilter === 'in' ? 'bg-[#f3fbd9] text-[#1D2839] border border-[#A3D508]' : 'bg-[#F4F7FC] text-[#5B6785]'
              }`}
            >
              Money In
            </button>
            <button
              onClick={() => setTypeFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                typeFilter === 'out' ? 'bg-[#ffefed] text-[#FD614F] border border-[#ffd4cf]' : 'bg-[#F4F7FC] text-[#5B6785]'
              }`}
            >
              Money Out
            </button>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-[#E2E8F7] text-[#5B6785]">
          <span>Showing <strong>{filteredRows.length}</strong> entries</span>
          <div className="flex items-center gap-4">
            <span>In: <strong className="text-[#1D2839]">PKR {totalIn.toLocaleString()}</strong></span>
            <span>Out: <strong className="text-[#FD614F]">PKR {totalOut.toLocaleString()}</strong></span>
            <span>Net: <strong className={totalIn >= totalOut ? 'text-[#0B5CE6]' : 'text-[#FD614F]'}>
              PKR {(totalIn - totalOut).toLocaleString()}
            </strong></span>
          </div>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="accora-card bg-white border-[#E2E8F7] p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Note / Description</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Account</th>
                <th className="py-3 px-4 font-bold text-right">Amount (PKR)</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.slice(0, 100).map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[#E2E8F7]/70 hover:bg-[#F4F7FC]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[#5B6785]">{t.date}</td>
                    <td className="py-3 px-4 font-semibold text-[#1D2839]">{t.note}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#F4F7FC] border border-[#E2E8F7] text-[11px] font-medium text-[#1D2839]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5B6785] capitalize">
                      <span className="flex items-center gap-1">
                        {t.account === 'bank' && <Building className="w-3 h-3" />}
                        {t.account === 'wallet' && <Wallet className="w-3 h-3" />}
                        {(!t.account || t.account === 'cash') && <Coins className="w-3 h-3" />}
                        <span>{t.account || 'cash'}</span>
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 font-bold text-right tabular-nums text-sm ${
                        t.type === 'in' ? 'text-[#1D2839]' : 'text-[#FD614F]'
                      }`}
                    >
                      {t.type === 'in' ? '+' : '−'}PKR {t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1.5 rounded-lg text-[#5B6785] hover:text-[#FD614F] hover:bg-[#ffefed] transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5B6785] text-xs">
                    <p className="font-semibold text-[#1D2839] mb-1">No transactions found.</p>
                    <p className="mb-3">Add your first transaction above or load rich sample data to explore:</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => loadPersona('shop')}
                        className="btn-outline text-xs py-1 px-3 bg-white"
                      >
                        Load Ali (Shop)
                      </button>
                      <button
                        onClick={() => loadPersona('free')}
                        className="btn-outline text-xs py-1 px-3 bg-white"
                      >
                        Load Sara (Freelance)
                      </button>
                      <button
                        onClick={() => loadPersona('pro')}
                        className="btn-outline text-xs py-1 px-3 bg-white"
                      >
                        Load Usman (Employee)
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
