import { useFinancial } from '../store/FinancialStore';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const TYPE_ROUTES: Record<string, string> = {
  overdue_invoice: '/app/invoices',
  expense_spike: '/app/transactions',
  cashflow_warning: '/app/forecast',
  growth_opportunity: '/app/analytics',
  tax_deadline: '/app/reports',
};

const TYPE_COLORS: Record<string, string> = {
  overdue_invoice: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
  expense_spike: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
  cashflow_warning: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
  growth_opportunity: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
  tax_deadline: 'bg-brand-100 text-brand-600 dark:text-brand-300 hover:bg-brand-200',
};

export default function ActionCenter() {
  const { actions } = useFinancial();
  const navigate = useNavigate();

  if (!actions.length) return null;

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-6 transition-all hover:border-surface-300 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-100 border border-brand-200 text-brand-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider">
            Prioritized Action Center
          </h2>
        </div>
        <span className="text-[10px] text-surface-400 font-mono">Real-time</span>
      </div>

      <div className="space-y-3">
        {actions.slice(0, 5).map((action, idx) => (
          <div
            key={action.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-100/70 border border-surface-200/80 hover:border-brand-300 transition-all group"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-xs font-bold text-surface-800 shrink-0 font-mono">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-surface-900">{action.title}</h3>
              <p className="text-xs text-surface-500 mt-0.5 line-clamp-2 leading-relaxed">{action.description}</p>
              <p className="text-[11px] font-semibold text-brand-600 mt-1">{action.impact}</p>
            </div>
            <button
              onClick={() => navigate(TYPE_ROUTES[action.insight_type] ?? '/app/intelligence')}
              className={clsx(
                'shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-[0.97]',
                TYPE_COLORS[action.insight_type] ?? 'bg-surface-100 text-surface-600',
              )}
            >
              <span>{action.action_label}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
