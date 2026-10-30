import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
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
  Settings,
  Plus,
  Menu,
  X,
} from 'lucide-react';

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
  const { notifications, addTransaction } = useFinancial();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [activePersonaName, setActivePersonaName] = useState('Ali, shop owner');

  // Quick Add State
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');
  const [addAmount, setAddAmount] = useState('');
  const [addCategory] = useState('Groceries');
  const [addNote, setAddNote] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Check URL query parameters for demo persona
    const hash = window.location.hash;
    if (hash.includes('demo=free')) setActivePersonaName('Sara, freelancer');
    else if (hash.includes('demo=pro')) setActivePersonaName('Usman, employee');
    else if (hash.includes('demo=home')) setActivePersonaName('Ayesha, homemaker');
    else if (hash.includes('demo=shop')) setActivePersonaName('Ali, shop owner');
  }, [location]);

  const handleQuickAdd = async () => {
    const amt = parseFloat(addAmount) || 0;
    if (amt <= 0) return;

    await addTransaction({
      amount: amt,
      type: addType,
      category: addCategory,
      description: addNote || (addType === 'income' ? 'Income' : 'Spending'),
      date: new Date().toISOString().slice(0, 10),
    });

    setAddAmount('');
    setAddNote('');
    setShowAddModal(false);
  };

  const handleResetDemo = () => {
    localStorage.removeItem('accora_demo_data');
    window.location.reload();
  };

  const handleStartOwnData = () => {
    setIsDemoMode(false);
    navigate('/app');
  };

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
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* ── Main App Shell ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Demo Mode Top Banner (Section 5) */}
        {isDemoMode && (
          <div className="bg-[#1D2839] text-white text-xs px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A3D508] animate-pulse" />
              <span>
                <strong>You are viewing demo data:</strong> {activePersonaName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartOwnData}
                className="px-2.5 py-1 rounded bg-[#0B5CE6] text-white font-semibold hover:bg-[#094bbd] cursor-pointer"
              >
                Start with my own data
              </button>
              <button
                onClick={handleResetDemo}
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
              {activePersonaName.split(',')[0]}&apos;s Finances
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick "+ Add" button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-lime text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-2xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add</span>
            </button>

            {/* Help / Tour button */}
            <Link
              to="/app/ask"
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <img src={BRAND_MASCOT} alt="Help" className="w-4 h-4 object-contain" />
              <span>? Help</span>
            </Link>

            {/* Notifications Bell */}
            <Link
              to="/app/notifications"
              className="relative p-2 text-[#5B6785] hover:text-[#1D2839] rounded-lg hover:bg-[#F4F7FC]"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FD614F]" />
              )}
            </Link>
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
              <h3 className="font-bold text-base text-[#1D2839]">Add Record</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-[#5B6785]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAddType('expense')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  addType === 'expense'
                    ? 'bg-[#ffefed] text-[#FD614F] border-[#ffd4cf]'
                    : 'bg-[#F4F7FC] text-[#5B6785] border-transparent'
                }`}
              >
                Money Out (Spending)
              </button>
              <button
                type="button"
                onClick={() => setAddType('income')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  addType === 'income'
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
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6785] mb-1">Note / Description</label>
              <input
                type="text"
                placeholder="e.g. Groceries, client payment, fuel"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F7] rounded-xl text-sm"
              />
            </div>

            <button
              onClick={handleQuickAdd}
              className="btn-primary w-full text-xs py-2.5"
            >
              Save Record
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Mascot Help Button (Section 5) ── */}
      <Link
        to="/app/ask"
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-white border-2 border-[#0B5CE6] shadow-lg flex items-center justify-center p-2 hover:scale-105 transition-transform"
        title="Ask ACCORA Mascot"
      >
        <img src={BRAND_MASCOT} alt="Help" className="w-full h-full object-contain" />
      </Link>

    </div>
  );
}
