import { useState } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { fmtDate } from '../utils/format';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, CheckCheck, TrendingDown, TrendingUp,
  DollarSign, Sparkles, Info, CheckCircle2, Filter,
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: typeof Bell; bg: string; text: string }> = {
  overdue_invoice:  { icon: DollarSign,    bg: 'bg-risk-light border border-risk/20',     text: 'text-risk' },
  expense_spike:    { icon: TrendingUp,    bg: 'bg-warning-light border border-warning/20',  text: 'text-warning' },
  cashflow_warning: { icon: TrendingDown,  bg: 'bg-risk-light border border-risk/20',     text: 'text-risk' },
  revenue_milestone:{ icon: TrendingUp,    bg: 'bg-positive-light border border-positive/20', text: 'text-positive' },
  insight:          { icon: Sparkles,      bg: 'bg-brand-50 border border-brand-200',       text: 'text-brand-600' },
  general:          { icon: Info,          bg: 'bg-surface-100 border border-surface-200',    text: 'text-surface-500' },
};

const SEVERITY_COLORS: Record<string, string> = {
  high: 'border-l-risk',
  medium: 'border-l-warning',
  low: 'border-l-surface-300',
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFinancial();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (n: typeof notifications[number]) => {
    if (!n.read) markNotificationRead(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-risk-light text-risk border border-risk/20">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllNotificationsRead()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-surface-100 border border-surface-200 rounded-lg transition-colors cursor-pointer">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-surface-400" />
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
              filter === f
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-surface-card border border-surface-200 text-surface-600 dark:text-surface-300 hover:bg-surface-100')}>
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface-card rounded-[var(--radius-card)] border border-surface-200 p-8">
          <BellOff className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-400">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
            const Icon = cfg.icon;
            return (
              <button key={n.id} onClick={() => handleClick(n)}
                className={clsx(
                  'w-full text-left bg-surface-card rounded-[var(--radius-card)] border border-surface-200 dark:border-surface-200/50 shadow-[var(--shadow-card)] p-4',
                  'border-l-4 transition-all hover:border-brand-400/40 cursor-pointer group',
                  SEVERITY_COLORS[n.severity] ?? 'border-l-surface-300',
                  n.read ? 'opacity-65' : '',
                )}>
                <div className="flex items-start gap-3">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon className={clsx('w-4 h-4', cfg.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx('text-sm font-semibold truncate', n.read ? 'text-surface-600 dark:text-surface-400' : 'text-surface-900 dark:text-surface-100')}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-surface-400 mt-1 font-mono">{fmtDate(n.timestamp)}</p>
                  </div>
                  {n.read && (
                    <CheckCircle2 className="w-4 h-4 text-surface-300 shrink-0 mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
