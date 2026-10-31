import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useMoneyStore } from '../store/moneyStore';
import { BRAND_LOGO, BRAND_MASCOT } from '../assets/brand';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  Target,
  Users,
  FileText,
  UploadCloud,
  Bell,
  AlertTriangle,
  Settings,
  Plus,
  Menu,
  X,
  ArrowRight,
  Undo2,
} from 'lucide-react';
import OnboardingWizardModal from '../components/OnboardingWizardModal';
import CopilotPanel from '../components/CopilotPanel';
import { Sparkles } from 'lucide-react';
import { sanitizeCsvField } from '../utils/format';

// Exact 10 Tools (Section 3)
const TOOLS_NAV = [
  { to: '/app', icon: LayoutDashboard, label: 'My Money Dashboard', emoji: '🏠', end: true },
  { to: '/app/transactions', icon: Receipt, label: 'Income & Spending Tracker', emoji: '↕️' },
  { to: '/app/invoices', icon: FileSpreadsheet, label: 'Bills & Invoices', emoji: '🧾' },
  { to: '/app/forecast', icon: TrendingUp, label: 'Future Forecast', emoji: '📈' },
  { to: '/app/affordability', icon: HelpCircle, label: '“Can I Afford It?”', emoji: '🤔' },
  { to: '/app/ask', icon: MessageSquare, label: 'Ask ACCORA', emoji: '💬' },
  { to: '/app/budgets', icon: Target, label: 'Budget & Savings Goals', emoji: '🎯' },
  { to: '/app/committee', icon: Users, label: 'Committee (BC) Tracker', emoji: '👥' },
  { to: '/app/tax', icon: FileText, label: 'Tax Helper', emoji: '📑' },
  { to: '/app/upload', icon: UploadCloud, label: 'Easy Upload', emoji: '⬆️' },
];

export default function AppLayout() {
  const {
    isDemo,
    activePersonaKey,
    userName,
    transactions,
    loadPersona,
    resetDemo,
    alerts,
    addTransaction,
    toasts,
    dismissToast,
    tourStep,
    setTourStep,
  } = useMoneyStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [pendingPersona, setPendingPersona] = useState<'shop' | 'free' | 'pro' | 'home' | 'reset' | null>(null);

  const personaNames: Record<string, string> = {
    shop: 'Ali (Shop Owner)',
    free: 'Sara (Freelancer)',
    pro: 'Usman (Salaried Employee)',
    home: 'Ayesha (Homemaker)',
    reset: 'Default Demo Scenario',
  };

  const handleSelectPersona = (key: 'shop' | 'free' | 'pro' | 'home') => {
    // If not demo mode OR user has custom records
    if (!isDemo || transactions.length !== 12 || userName !== 'Ali') {
      setPendingPersona(key);
      setShowOverwriteModal(true);
    } else {
      loadPersona(key);
    }
  };

  const handleResetClick = () => {
    if (!isDemo || transactions.length !== 12) {
      setPendingPersona('reset');
      setShowOverwriteModal(true);
    } else {
      resetDemo();
    }
  };

  const executePendingSwitch = () => {
    if (pendingPersona === 'reset') {
      resetDemo();
    } else if (pendingPersona) {
      loadPersona(pendingPersona);
    }
    setPendingPersona(null);
    setShowOverwriteModal(false);
  };

  const handleBackupAndSwitch = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount (PKR)', 'Account'];
    const rows = transactions.map((t) => [
      sanitizeCsvField(t.id),
      sanitizeCsvField(t.date),
      sanitizeCsvField(t.type === 'in' ? 'Income' : 'Spending'),
      sanitizeCsvField(t.category),
      sanitizeCsvField(t.note),
      sanitizeCsvField(t.amount),
      sanitizeCsvField(t.account || 'cash'),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `accora-data-backup-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    executePendingSwitch();
  };

  // Quick Add State
  const [addType, setAddType] = useState<'in' | 'out'>('out');
  const [addAmount, setAddAmount] = useState('');
  const [addCategory, setAddCategory] = useState('Groceries');
  const [addNote, setAddNote] = useState('');
  const [addAccount, setAddAccount] = useState<'cash' | 'bank' | 'wallet'>('bank');

  // Sync persona param from URL if present
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('demo=free') && activePersonaKey !== 'free') loadPersona('free');
    else if (hash.includes('demo=pro') && activePersonaKey !== 'pro') loadPersona('pro');
    else if (hash.includes('demo=home') && activePersonaKey !== 'home') loadPersona('home');
    else if (hash.includes('demo=shop') && activePersonaKey !== 'shop') loadPersona('shop');
  }, [location, activePersonaKey, loadPersona]);

  const handleQuickAdd = async () => {
    const amt = parseFloat(addAmount) || 0;
    if (amt <= 0) return;

    await addTransaction({
      amount: amt,
      type: addType,
      category: addCategory,
      note: addNote || (addType === 'in' ? 'Income' : 'Spending'),
      date: new Date().toISOString().slice(0, 10),
      account: addAccount,
    });

    setAddAmount('');
    setAddNote('');
    setShowAddModal(false);
  };

  // 5-step tour definitions
  const tourSteps = [
    {
      title: 'Welcome to ACCORA! 👋',
      text: 'I am your friendly mascot helper. Let me show you how to navigate your finances in Pakistan.',
      route: '/app',
    },
    {
      title: '1. My Money Dashboard 🏠',
      text: 'See your real cash balance, money health score (0-100), and 6-month trends at a glance.',
      route: '/app',
    },
    {
      title: '2. Income & Spending Tracker ↕️',
      text: 'Log transactions, auto-suggest categories, and download clean CSVs anytime.',
      route: '/app/transactions',
    },
    {
      title: '3. Future Forecast & "Can I Afford It?" 📈',
      text: 'Predict your balance over the next 6 months and test big purchases before committing.',
      route: '/app/forecast',
    },
    {
      title: '4. Ask ACCORA AI & Committee Tracker 💬',
      text: 'Chat in plain English with answers calculated strictly from your data, plus manage family kametis!',
      route: '/app/ask',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#F4F7FC] text-[#1D2839]">
      
      {/* ── Left Sidebar: The 10 Tools ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#E2E8F7] bg-white shrink-0 select-none z-30 shadow-xs">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#E2E8F7]">
          <Link to="/app" className="flex items-center gap-2 group">
            <img src={BRAND_LOGO} alt="ACCORA" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* The 10 Tools in Exact Order */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold text-[#5B6785] uppercase tracking-wider">
            10 Simple Tools
          </p>

          {TOOLS_NAV.map((tool) => (
            <NavLink
              key={tool.to}
              to={tool.to}
              end={tool.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#e8f0fe] text-[#0B5CE6] border-l-3 border-[#0B5CE6] shadow-2xs font-bold'
                    : 'text-[#1D2839] hover:bg-[#F4F7FC] hover:text-[#0B5CE6]'
                }`
              }
            >
              <span className="text-base shrink-0">{tool.emoji}</span>
              <span className="truncate">{tool.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E2E8F7] space-y-1">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive ? 'text-[#0B5CE6] bg-[#e8f0fe]' : 'text-[#5B6785] hover:bg-[#F4F7FC] hover:text-[#1D2839]'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings &amp; Help</span>
          </NavLink>
        </div>
      </aside>

      {/* ── Main App Shell ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Demo Mode Top Banner (Section 5B) */}
        {isDemo && (
          <div className="bg-[#1D2839] text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A3D508] animate-pulse" />
              <span>
                <strong>Demo Mode:</strong> Viewing 12 months realistic PKR sample data for{' '}
                <span className="text-[#A3D508] font-bold">{userName}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Persona Quick Picker */}
              <select
                value={activePersonaKey}
                onChange={(e) => handleSelectPersona(e.target.value as 'shop' | 'free' | 'pro' | 'home')}
                className="bg-white/10 hover:bg-white/20 text-white rounded px-2 py-0.5 text-xs font-semibold border border-white/20 cursor-pointer focus:outline-none"
              >
                <option value="shop" className="text-[#1D2839]">Ali (Shop owner)</option>
                <option value="free" className="text-[#1D2839]">Sara (Freelancer)</option>
                <option value="pro" className="text-[#1D2839]">Usman (Salaried employee)</option>
                <option value="home" className="text-[#1D2839]">Ayesha (Homemaker)</option>
              </select>

              <button
                onClick={() => setShowOnboarding(true)}
                className="px-2.5 py-1 rounded bg-[#0B5CE6] text-white font-semibold hover:bg-[#094bbd] cursor-pointer"
              >
                Start with my own data
              </button>
              <button
                onClick={handleResetClick}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 font-semibold cursor-pointer"
              >
                Reset demo
              </button>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <header className="h-14 bg-white border-b border-[#E2E8F7] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#1D2839] hover:bg-[#F4F7FC] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-[#1D2839]">
              {userName}&apos;s Finances (PKR)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Co-Pilot drawer trigger */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer text-[#0B5CE6] border-[#0B5CE6]/30 hover:bg-[#e8f0fe] font-bold shadow-2xs"
              title="Open Accora AI Co-Pilot"
            >
              <Sparkles className="w-4 h-4 text-[#0B5CE6]" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* Quick "+ Add" button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-lime text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-2xs font-bold"
            >
              <Plus className="w-4 h-4 text-[#1D2839]" />
              <span>+ Add</span>
            </button>

            {/* Help / Tour button */}
            <button
              onClick={() => setTourStep(0)}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
              title="Start Interactive Tour"
            >
              <img src={BRAND_MASCOT} alt="Help" className="w-4 h-4 object-contain" />
              <span>? Help</span>
            </button>

            {/* Notifications Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2 text-[#5B6785] hover:text-[#1D2839] rounded-lg hover:bg-[#F4F7FC] cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FD614F] border-2 border-white" />
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F7] rounded-xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F7]">
                    <span className="text-xs font-bold text-[#1D2839]">Active Money Alerts</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffefed] text-[#FD614F]">
                      {alerts.length} New
                    </span>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="text-xs text-[#5B6785]">All clear! No pending financial alerts.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {alerts.map((alert, i) => (
                        <div key={i} className="text-xs p-2.5 rounded-lg bg-[#F4F7FC] border border-[#E2E8F7] text-[#1D2839]">
                          {alert}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F7]">
              <img src={BRAND_LOGO} alt="ACCORA" className="h-7 w-auto object-contain" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#5B6785]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {TOOLS_NAV.map((tool) => (
                <NavLink
                  key={tool.to}
                  to={tool.to}
                  end={tool.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-[#e8f0fe] text-[#0B5CE6]' : 'text-[#1D2839]'
                    }`
                  }
                >
                  <span>{tool.emoji}</span>
                  <span>{tool.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ── Quick "+ Add" Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8F7] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1D2839]">Add Money Record</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#5B6785]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAddType('out')}
                className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                  addType === 'out'
                    ? 'bg-[#ffefed] text-[#FD614F] border-[#ffd4cf]'
                    : 'bg-[#F4F7FC] text-[#5B6785] border-transparent'
                }`}
              >
                Money Out (Spending)
              </button>
              <button
                type="button"
                onClick={() => setAddType('in')}
                className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                  addType === 'in'
                    ? 'bg-[#f3fbd9] text-[#1D2839] border-[#A3D508]'
                    : 'bg-[#F4F7FC] text-[#5B6785] border-transparent'
                }`}
              >
                Money In (Income)
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6785] mb-1">Amount (PKR)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5000"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm font-bold text-[#1D2839]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5B6785] mb-1">Category</label>
                <select
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl bg-white text-[#1D2839]"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Stock">Stock &amp; Goods</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities &amp; Bills</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Transport">Transport &amp; Fuel</option>
                  <option value="Software">Software &amp; Tools</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5B6785] mb-1">Account</label>
                <select
                  value={addAccount}
                  onChange={(e) => setAddAccount(e.target.value as 'cash' | 'bank' | 'wallet')}
                  className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl bg-white text-[#1D2839]"
                >
                  <option value="bank">Bank Account</option>
                  <option value="wallet">Mobile Wallet</option>
                  <option value="cash">Cash in hand</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6785] mb-1">Note / Description</label>
              <input
                type="text"
                placeholder="e.g. Weekly vegetable bazaar, client deposit"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm text-[#1D2839]"
              />
            </div>

            <button
              onClick={handleQuickAdd}
              className="btn-primary w-full text-xs py-2.5 font-bold cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </div>
      )}

      {/* ── Interactive Mascot Tour Coach Marks (Section 5D) ── */}
      {tourStep >= 0 && tourStep < tourSteps.length && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border-2 border-[#0B5CE6] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <img src={BRAND_MASCOT} alt="ACCORA Mascot" className="w-14 h-14 object-contain shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5CE6] bg-[#e8f0fe] px-2 py-0.5 rounded-full">
                  Step {tourStep + 1} of {tourSteps.length}
                </span>
                <h3 className="font-bold text-base text-[#1D2839]">
                  {tourSteps[tourStep].title}
                </h3>
                <p className="text-xs text-[#5B6785] leading-relaxed">
                  {tourSteps[tourStep].text}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F7]">
              <button
                onClick={() => setTourStep(-1)}
                className="text-xs text-[#5B6785] hover:text-[#1D2839] font-semibold cursor-pointer"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    onClick={() => {
                      const prev = tourStep - 1;
                      setTourStep(prev);
                      navigate(tourSteps[prev].route);
                    }}
                    className="btn-outline text-xs py-1.5 px-3 cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    const next = tourStep + 1;
                    if (next < tourSteps.length) {
                      setTourStep(next);
                      navigate(tourSteps[next].route);
                    } else {
                      setTourStep(-1);
                    }
                  }}
                  className="btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{tourStep === tourSteps.length - 1 ? 'Got it!' : 'Next'}</span>
                  {tourStep < tourSteps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Toasts Container with Undo & Next-Step Prompts (Section 5) ── */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#1D2839] text-white p-3.5 rounded-xl shadow-xl border border-white/10 text-xs flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2"
          >
            <div className="space-y-0.5">
              <p className="font-medium">{toast.message}</p>
              {toast.nextStepPrompt && toast.nextStepRoute && (
                <button
                  onClick={() => {
                    navigate(toast.nextStepRoute!);
                    dismissToast(toast.id);
                  }}
                  className="text-[11px] font-bold text-[#A3D508] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{toast.nextStepPrompt}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction!();
                    dismissToast(toast.id);
                  }}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Floating Mascot Help Button (Section 5) ── */}
      <button
        onClick={() => setTourStep(0)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-white border-2 border-[#0B5CE6] shadow-lg flex items-center justify-center p-2 hover:scale-105 transition-transform cursor-pointer"
        title="Replay Interactive Tour with Mascot"
      >
        <img src={BRAND_MASCOT} alt="Help Mascot" className="w-full h-full object-contain" />
      </button>

      {/* ── Data Overwrite Confirmation Modal (Fix 3) ── */}
      {showOverwriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border-2 border-[#f79009] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#f79009] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-[#1D2839]">Switch Financial Scenario?</h3>
                <p className="text-xs text-[#5B6785] mt-1 leading-relaxed">
                  You have <strong>{transactions.length} custom transactions</strong> in your active workspace. Loading{' '}
                  <strong>{pendingPersona ? personaNames[pendingPersona] : ''}</strong> will replace your current records with their 12-month sample dataset.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F4F7FC] rounded-xl text-xs text-[#1D2839] border border-[#E2E8F7]">
              Tip: You can download a CSV backup to keep a permanent copy of your records before switching.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#E2E8F7]">
              <button
                type="button"
                onClick={() => {
                  setShowOverwriteModal(false);
                  setPendingPersona(null);
                }}
                className="btn-outline text-xs py-2 px-3 w-full sm:w-auto"
              >
                Cancel &amp; Keep Data
              </button>
              <button
                type="button"
                onClick={handleBackupAndSwitch}
                className="btn-outline text-xs py-2 px-3 text-[#0B5CE6] border-[#0B5CE6]/30 hover:bg-[#e8f0fe] w-full sm:w-auto font-bold"
              >
                Download Backup &amp; Switch
              </button>
              <button
                type="button"
                onClick={executePendingSwitch}
                className="btn-primary text-xs py-2 px-3 w-full sm:w-auto font-bold"
              >
                Yes, Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Onboarding Wizard Modal ── */}
      <OnboardingWizardModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* ── Slide-out Copilot Panel ── */}
      <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />

    </div>
  );
}
