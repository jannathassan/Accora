import { useState } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import {
  Plus,
  Check,
  Copy,
  Printer,
  AlertTriangle,
} from 'lucide-react';

export default function InvoicesPage() {
  const {
    invoices,
    bills,
    addInvoice,
    markInvoicePaid,
    addBill,
    markBillPaid,
    showToast,
  } = useMoneyStore();

  const [activeTab, setActiveTab] = useState<'owed' | 'bills'>('owed');
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);

  // New Invoice Form
  const [invClient, setInvClient] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDueDate, setInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [invTaxPct, setInvTaxPct] = useState('0');

  // New Bill Form
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [billRepeat, setBillRepeat] = useState(true);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(invAmount) || 0;
    if (!invClient || amt <= 0) return;

    await addInvoice({
      client: invClient.trim(),
      amount: amt,
      taxPercent: parseFloat(invTaxPct) || 0,
      dueDate: invDueDate,
      status: 'sent',
    });

    setInvClient('');
    setInvAmount('');
    setShowAddInvoice(false);
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(billAmount) || 0;
    if (!billName || amt <= 0) return;

    await addBill({
      name: billName.trim(),
      amount: amt,
      dueDate: billDueDate,
      repeatMonthly: billRepeat,
    });

    setBillName('');
    setBillAmount('');
    setShowAddBill(false);
  };

  // WhatsApp Reminder Generator (Section 6)
  const handleCopyReminder = (client: string, amount: number, dueDate: string) => {
    const text = `Assalam o Alaikum ${client}, this is a gentle reminder regarding invoice for PKR ${amount.toLocaleString()} due on ${dueDate}. Please let me know once processed. Thank you!`;
    navigator.clipboard.writeText(text);
    showToast({
      message: 'Polite reminder copied! Ready to paste into WhatsApp.',
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Tool #3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
            Bills &amp; Invoices
          </h1>
          <p className="text-sm text-[#5B6785] mt-1">
            Track money owed to you by clients, and recurring bills you must pay on time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FC] rounded-xl border border-[#E2E8F7]">
          <button
            onClick={() => setActiveTab('owed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'owed'
                ? 'bg-white text-[#0B5CE6] shadow-xs'
                : 'text-[#5B6785] hover:text-[#1D2839]'
            }`}
          >
            Money Owed to Me ({invoices.filter((i) => !i.paid).length})
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bills'
                ? 'bg-white text-[#0B5CE6] shadow-xs'
                : 'text-[#5B6785] hover:text-[#1D2839]'
            }`}
          >
            Bills I Must Pay ({bills.filter((b) => !b.paid).length})
          </button>
        </div>
      </div>

      {/* ── Tab 1: Money Owed to Me (Invoices) ── */}
      {activeTab === 'owed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D2839]">Client Invoices &amp; Receivables</h2>
            <button
              onClick={() => setShowAddInvoice(!showAddInvoice)}
              className="btn-lime text-xs py-2 px-4 shadow-2xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Invoice</span>
            </button>
          </div>

          {showAddInvoice && (
            <form
              onSubmit={handleCreateInvoice}
              className="accora-card bg-white border-[#E2E8F7] space-y-4 animate-in fade-in duration-150"
            >
              <h3 className="font-bold text-sm text-[#1D2839]">New Client Invoice</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hassan Traders"
                    value={invClient}
                    onChange={(e) => setInvClient(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 85000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Tax / Withholding %</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={invTaxPct}
                    onChange={(e) => setInvTaxPct(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F7]">
                <button
                  type="button"
                  onClick={() => setShowAddInvoice(false)}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Save &amp; Send Invoice
                </button>
              </div>
            </form>
          )}

          {/* Invoices List */}
          <div className="accora-card bg-white border-[#E2E8F7] p-0 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                  <th className="py-3 px-4 font-bold">Client</th>
                  <th className="py-3 px-4 font-bold">Due Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => {
                    const isOverdue = !inv.paid && inv.dueDate < todayStr;
                    return (
                      <tr key={inv.id} className="border-b border-[#E2E8F7]/70 hover:bg-[#F4F7FC]/40">
                        <td className="py-3.5 px-4 font-bold text-[#1D2839]">{inv.client}</td>
                        <td className="py-3.5 px-4 font-mono text-[#5B6785]">{inv.dueDate}</td>
                        <td className="py-3.5 px-4">
                          {inv.paid ? (
                            <span className="inline-flex items-center gap-1 text-[#1D2839] font-bold bg-[#A3D508] px-2.5 py-0.5 rounded-full text-[10px]">
                              <Check className="w-3 h-3" /> Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[#FD614F] font-bold bg-[#ffefed] px-2.5 py-0.5 rounded-full text-[10px] border border-[#ffd4cf]">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          ) : (
                            <span className="text-[#0B5CE6] font-bold bg-[#e8f0fe] px-2.5 py-0.5 rounded-full text-[10px]">
                              Sent
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-right tabular-nums text-sm text-[#1D2839]">
                          PKR {inv.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!inv.paid && (
                              <>
                                <button
                                  onClick={() => markInvoicePaid(inv.id)}
                                  className="btn-lime text-[11px] py-1 px-2.5 font-bold"
                                  title="Marking paid automatically adds to Income Tracker"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => handleCopyReminder(inv.client, inv.amount, inv.dueDate)}
                                  className="btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1"
                                  title="Copy polite WhatsApp text"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handlePrintPdf()}
                              className="p-1.5 text-[#5B6785] hover:text-[#0B5CE6] rounded-lg cursor-pointer"
                              title="Print / Save PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5B6785]">
                      No invoices recorded yet. Create one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Bills I Must Pay ── */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D2839]">Bills I Must Pay</h2>
            <button
              onClick={() => setShowAddBill(!showAddBill)}
              className="btn-lime text-xs py-2 px-4 shadow-2xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Bill</span>
            </button>
          </div>

          {showAddBill && (
            <form
              onSubmit={handleCreateBill}
              className="accora-card bg-white border-[#E2E8F7] space-y-4 animate-in fade-in duration-150"
            >
              <h3 className="font-bold text-sm text-[#1D2839]">New Expense Bill</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Bill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shop rent, Electricity, Internet"
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 15000"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F7]">
                <label className="flex items-center gap-2 text-xs text-[#1D2839] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billRepeat}
                    onChange={(e) => setBillRepeat(e.target.checked)}
                    className="rounded accent-[#0B5CE6]"
                  />
                  <span>Repeat monthly bill</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBill(false)}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    Save Bill
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Bills List */}
          <div className="accora-card bg-white border-[#E2E8F7] p-0 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F7] text-[#5B6785] bg-[#F4F7FC]">
                  <th className="py-3 px-4 font-bold">Bill Name</th>
                  <th className="py-3 px-4 font-bold">Due Date</th>
                  <th className="py-3 px-4 font-bold text-right">Amount (PKR)</th>
                  <th className="py-3 px-4 font-bold text-center">Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.length > 0 ? (
                  bills.map((b) => (
                    <tr key={b.id} className="border-b border-[#E2E8F7]/70 hover:bg-[#F4F7FC]/40">
                      <td className="py-3.5 px-4 font-bold text-[#1D2839]">{b.name}</td>
                      <td className="py-3.5 px-4 font-mono text-[#5B6785]">{b.dueDate}</td>
                      <td className="py-3.5 px-4 font-extrabold text-right tabular-nums text-sm text-[#FD614F]">
                        PKR {b.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {b.paid ? (
                          <span className="inline-flex items-center gap-1 text-[#1D2839] font-bold bg-[#A3D508] px-2.5 py-0.5 rounded-full text-[10px]">
                            <Check className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => markBillPaid(b.id)}
                            className="btn-lime text-[11px] py-1 px-3 font-bold"
                            title="Marking paid automatically adds a spending transaction"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#5B6785]">
                      No bills recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
