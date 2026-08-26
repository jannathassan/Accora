import { NavLink, Outlet } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
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
      { to: '/app/intelligence', icon: Lightbulb, label: 'Insights' },
      { to: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
      { to: '/app/scenarios', icon: Sliders, label: 'What-If' },
      { to: '/app/reports', icon: FileText, label: 'Reports' },
    ],
  },
];

// Flat list for mobile bottom nav
const MOBILE_ITEMS = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/invoices', icon: FileSpreadsheet, label: 'Invoices' },
  { to: '/app/intelligence', icon: Lightbulb, label: 'Insights' },
  { to: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/app/reports', icon: FileText, label: 'Reports' },
];

export default function AppLayout() {
  const { notifications } = useFinancial();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-surface-200 bg-surface-card">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-surface-200">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-surface-900 tracking-tight">
            Accora
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }`
                    }
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-surface-200 space-y-1">
          <NavLink
            to="/app/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'
              }`
            }
          >
            <Bell className="w-4.5 h-4.5 shrink-0" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-risk-light text-risk">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'
              }`
            }
          >
            <Settings className="w-4.5 h-4.5 shrink-0" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-surface-50">
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
                `flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                  isActive ? 'text-brand-600' : 'text-surface-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-14">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
