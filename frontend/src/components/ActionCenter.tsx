import { useNavigate } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const TYPE_COLORS: Record<string, string> = {
  risk: 'text-risk bg-risk-light',
  anomaly: 'text-warning bg-warning-light',
  opportunity: 'text-positive bg-positive-light',
  trend: 'text-brand-600 bg-brand-50',
  positive: 'text-positive bg-positive-light',
};

const TYPE_ROUTES: Record<string, string> = {
  risk: '/app/intelligence',
  anomaly: '/app/intelligence',
  opportunity: '/app/analytics',
  trend: '/app/analytics',
  positive: '/app/intelligence',
};

export default function ActionCenter() {
  const { actions } = useFinancial();
  const navigate = useNavigate();
  if (!actions.length) return null;

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-ai-light flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-ai" />
        </div>
        <h2 className="text-sm font-semibold text-surface-900">What Should I Do Next?</h2>
      </div>

      <div className="space-y-3">
        {actions.slice(0, 5).map((action, idx) => (
          <div
            key={action.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors group"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-xs font-bold text-surface-700 shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-surface-900">{action.title}</h3>
              <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{action.description}</p>
              <p className="text-xs font-medium text-brand-700 mt-1.5">{action.impact}</p>
            </div>
            <button
              onClick={() => navigate(TYPE_ROUTES[action.insight_type] ?? '/app/intelligence')}
              className={clsx(
                'shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                TYPE_COLORS[action.insight_type] ?? 'bg-surface-100 text-surface-600',
              )}
            >
              {action.action_label}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
