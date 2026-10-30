import { useState } from 'react';
import {
  User,
  Shield,
  Download,
  Trash2,
  HelpCircle,
  Mail,
  RotateCcw,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useMoneyStore } from '../store/moneyStore';
import { SOCIAL_LINKS } from '../config/links';

export default function SettingsPage() {
  const {
    userName,
    userRole,
    taxRate,
    transactions,
    setTourStep,
    resetDemo,
    showToast,
  } = useMoneyStore();

  const [name, setName] = useState(userName || 'Ali');
  const [role, setRole] = useState(userRole || 'Shop and online-seller owner');
  const [rate, setRate] = useState(taxRate || 1.5);
  const [notifBills, setNotifBills] = useState(true);
  const [notifOverspend, setNotifOverspend] = useState(true);
  const [notifCash, setNotifCash] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount (PKR)', 'Account'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.note.replace(/"/g, '""')}"`,
      t.amount.toString(),
      t.account || 'cash',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `accora-financial-data-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      message: 'Exported your complete financial records as CSV.',
    });
  };

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to clear your local records and reset to clean sample data?')) {
      resetDemo();
      showToast({
        message: 'Your local records were reset to fresh demo data.',
      });
    }
  };

  const faqs = [
    {
      q: 'Does ACCORA store my real bank credentials or passwords?',
      a: 'No, never. ACCORA does not connect directly to your bank account or store bank passwords. You import statements via CSV or enter numbers manually. Your data stays in your browser local storage unless you export it.',
    },
    {
      q: 'Are all numbers displayed in Pakistani Rupees (PKR)?',
      a: 'Yes. ACCORA is built specifically for Pakistan, so all balances, transactions, budgets, committees, and taxes are strictly in PKR.',
    },
    {
      q: 'How does the Committee (BC) Tracker work?',
      a: 'The committee tracker helps you organize who pays when and what month is your payout turn. When you mark a payment as paid, it auto-records a spending entry. When you receive your lump sum payout, it auto-records income.',
    },
    {
      q: 'Is the Tax Helper certified by FBR?',
      a: 'No. ACCORA Tax Helper is an educational planning helper to help you set aside money throughout the tax year (July 1 to June 30). You should always verify tax slabs and filings with FBR Iris or a qualified tax consultant.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Settings &amp; Help
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Manage your profile, tax preferences, data privacy, and access help resources.
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F7]">
          <User className="w-5 h-5 text-[#0B5CE6]" />
          <h2 className="text-base font-bold text-[#1D2839]">Profile Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#5B6785] font-semibold mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839]"
            />
          </div>

          <div>
            <label className="block text-[#5B6785] font-semibold mb-1">Your Persona Group</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#1D2839] bg-white"
            >
              <option value="Shop and online-seller owner">Shop &amp; Online Seller Owner</option>
              <option value="Freelancer and side-hustler">Freelancer &amp; Side-Hustler</option>
              <option value="Working professional">Working Professional (Salaried)</option>
              <option value="Homemaker">Homemaker (Household &amp; Committees)</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div>
            <label className="block text-[#5B6785] font-semibold mb-1">Default Currency</label>
            <input
              type="text"
              disabled
              value="PKR (Pakistani Rupee)"
              className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#5B6785] bg-[#F4F7FC]"
            />
          </div>

          <div>
            <label className="block text-[#5B6785] font-semibold mb-1">Tax-Year Start</label>
            <input
              type="text"
              disabled
              value="July 1 (Pakistan FBR Standard)"
              className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm text-[#5B6785] bg-[#F4F7FC]"
            />
          </div>
        </div>
      </div>

      {/* 2. Tax % & Notification Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tax Preference */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F7]">
            <Shield className="w-5 h-5 text-[#0B5CE6]" />
            <h2 className="text-base font-bold text-[#1D2839]">Tax Planning</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block font-semibold text-[#1D2839]">
              Default Tax Set-Aside Rate (% of Income)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.25"
                min="0"
                max="45"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-[#E2E8F7] rounded-lg text-sm font-bold text-[#1D2839]"
              />
              <span className="text-[#5B6785]">%</span>
            </div>
            <p className="text-[11px] text-[#5B6785] leading-relaxed">
              Used across your income transactions to automatically suggest reserve amounts for year-end filing.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F7]">
            <Bell className="w-5 h-5 text-[#0B5CE6]" />
            <h2 className="text-base font-bold text-[#1D2839]">Alerts &amp; Reminders</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifBills}
                onChange={(e) => setNotifBills(e.target.checked)}
                className="w-4 h-4 accent-[#0B5CE6] rounded"
              />
              <span className="text-[#1D2839] font-medium">Alert me when bills are due within 7 days</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifOverspend}
                onChange={(e) => setNotifOverspend(e.target.checked)}
                className="w-4 h-4 accent-[#0B5CE6] rounded"
              />
              <span className="text-[#1D2839] font-medium">Warn me when spending reaches 80% of budget</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifCash}
                onChange={(e) => setNotifCash(e.target.checked)}
                className="w-4 h-4 accent-[#0B5CE6] rounded"
              />
              <span className="text-[#1D2839] font-medium">Alert me when cash buffer is below 1 month</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Data Privacy & Export (Section 5F: export CSV, delete my data) */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <h2 className="text-base font-bold text-[#1D2839]">Your Data &amp; Controls</h2>
        <p className="text-xs text-[#5B6785]">
          You own 100% of your financial records. You can download everything as a standard CSV or wipe all stored entries at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportCsv}
            className="btn-outline text-xs py-2 px-4 flex items-center gap-2 font-bold cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0B5CE6]" />
            <span>Export My Data (CSV)</span>
          </button>

          <button
            onClick={handleDeleteData}
            className="px-4 py-2 border border-[#FD614F]/40 text-[#FD614F] hover:bg-[#ffefed] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete &amp; Reset My Data</span>
          </button>
        </div>
      </div>

      {/* 4. Interactive Tour & Help */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1D2839]">Guided Tour &amp; Walkthrough</h2>
            <p className="text-xs text-[#5B6785] mt-0.5">
              Need a refresher on how ACCORA works? Replay the 5-step coach marks tour anytime.
            </p>
          </div>
          <button
            onClick={() => {
              setTourStep(0);
              showToast({
                message: 'Tour reloaded! Mascot is guiding you.',
              });
            }}
            className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Tour</span>
          </button>
        </div>
      </div>

      {/* 5. Frequently Asked Questions (FAQ) */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F7]">
          <HelpCircle className="w-5 h-5 text-[#0B5CE6]" />
          <h2 className="text-base font-bold text-[#1D2839]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-[#E2E8F7] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-3.5 bg-[#F4F7FC]/50 hover:bg-[#F4F7FC] flex items-center justify-between text-xs font-bold text-[#1D2839]"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#5B6785]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#5B6785]" />
                )}
              </button>
              {openFaq === idx && (
                <div className="p-3.5 bg-white text-xs text-[#5B6785] leading-relaxed border-t border-[#E2E8F7]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Contact & Support */}
      <div className="p-4 rounded-xl bg-[#e8f0fe] border border-[#0B5CE6]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-bold text-[#1D2839]">Need personal help or have feedback?</h3>
          <p className="text-[#5B6785] mt-0.5">
            Reach out to our Karachi and Lahore support team directly.
          </p>
        </div>
        <a
          href={`mailto:${SOCIAL_LINKS.supportEmail}`}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-2 font-bold shrink-0"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Support ({SOCIAL_LINKS.supportEmail})</span>
        </a>
      </div>
    </div>
  );
}
