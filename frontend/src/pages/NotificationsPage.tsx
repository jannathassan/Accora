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
  overdue_invoice:  { icon: DollarSign,    bg: 'bg-risk-light',     text: 'text-risk' },
  expense_spike:    { icon: TrendingUp,    bg: 'bg-warning-light',  text: 'text-warning' },
  cashflow_warning: { icon: TrendingDown,  bg: 'bg-risk-light',     text: 'text-risk' },
  revenue_milestone:{ icon: TrendingUp,    bg: 'bg-positive-light', text: 'text-positive' },
  insight:          { icon: Sparkles,      bg: 'bg-ai-light',       text: 'text-ai' },
  general:          { icon: Info,          bg: 'bg-surface-100',    text: 'text-surface-500' },
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
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl font-bold text-surface-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-risk-light text-risk">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllNotificationsRead()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-surface-400" />
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              filter === f ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BellOff className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-400">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general;
            const Icon = cfg.icon;
            return (
              <button key={n.id} onClick={() => handleClick(n)}
                className={clsx(
                  'w-full text-left bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4',
                  'border-l-4 transition-all hover:shadow-md',
                  SEVERITY_COLORS[n.severity] ?? 'border-l-surface-300',
                  n.read ? 'opacity-60' : '',
                )}>
                <div className="flex items-start gap-3">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon className={clsx('w-4 h-4', cfg.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx('text-sm font-medium truncate', n.read ? 'text-surface-600' : 'text-surface-900')}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-surface-400 mt-1">{fmtDate(n.timestamp)}</p>
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
