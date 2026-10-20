import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
import { logoutUser } from '../services/auth';
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  Sliders,
  Sparkles,
  FileSpreadsheet,
  TrendingUp,
  Lightbulb,
  LogOut,
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: { to: string; icon: typeof LayoutDashboard; label: string; end?: boolean; badge?: () => number | null }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/app/transactions', icon: Receipt, label: 'Transactions' },
      { to: '/app/invoices', icon: FileSpreadsheet, label: 'Invoices' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/app/intelligence', icon: Lightbulb, label: 'Intelligence' },
      { to: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
      { to: '/app/scenarios', icon: Sliders, label: 'Scenarios' },
      { to: '/app/reports', icon: FileText, label: 'Reports' },
    ],
  },
];

// Flat list for mobile bottom nav
const MOBILE_ITEMS = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/app/invoices', icon: FileSpreadsheet, label: 'Invoices' },
  { to: '/app/intelligence', icon: Lightbulb, label: 'Intelligence' },
  { to: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
];

export default function AppLayout() {
  const { notifications, user } = useFinancial();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar: Command Dock */}
      <aside className="hidden md:flex w-64 flex-col border-r border-surface-200 dark:border-surface-200/50 bg-surface-card select-none transition-colors">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-surface-900">
                Accora
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-200 font-mono">
                Copilot
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-100/80 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 font-semibold border-l-2 border-brand-600 dark:border-brand-400 shadow-xs'
                          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-200/40 hover:text-surface-900 dark:hover:text-surface-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                            isActive
                              ? 'text-brand-600 dark:text-brand-300'
                              : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-surface-200 space-y-2">
          <div className="space-y-0.5">
            <NavLink
              to="/app/notifications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-100/80 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 font-semibold border-l-2 border-brand-600 dark:border-brand-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-200/40 hover:text-surface-900 dark:hover:text-surface-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Bell
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-brand-600 dark:text-brand-300' : 'text-surface-400'
                    }`}
                  />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-risk-light text-risk">
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-100/80 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 font-semibold border-l-2 border-brand-600 dark:border-brand-400'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-200/40 hover:text-surface-900 dark:hover:text-surface-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Settings
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-brand-600 dark:text-brand-300' : 'text-surface-400'
                    }`}
                  />
                  <span>Settings</span>
                </>
              )}
            </NavLink>
          </div>

          {/* User Profile & Log Out */}
          <div className="pt-2 border-t border-surface-200">
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-100/80 dark:bg-surface-100/30 border border-surface-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-surface-900 truncate">
                    {user?.name || 'Accora User'}
                  </p>
                  <p className="text-[10px] text-surface-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-surface-400 hover:text-risk hover:bg-risk-light/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-surface-50 transition-colors">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-card border-t border-surface-200 z-50">
        <div className="flex justify-around py-2">
          {MOBILE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors ${
                  isActive ? 'text-brand-600 dark:text-brand-300' : 'text-surface-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                    )}
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className={`truncate max-w-14 ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
