import { useFinancial } from '../store/FinancialStore';
import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { fmtCurrency } from '../utils/format';

const CONFIG = {
  healthy: { icon: CheckCircle2, bg: 'bg-positive-light', text: 'text-positive', border: 'border-positive/20' },
  watch: { icon: Eye, bg: 'bg-warning-light', text: 'text-warning', border: 'border-warning/20' },
  at_risk: { icon: AlertTriangle, bg: 'bg-risk-light', text: 'text-risk', border: 'border-risk/20' },
};

export default function CashFlowAlert() {
  const { cashFlow } = useFinancial();
  if (!cashFlow) return null;

  const cfg = CONFIG[cashFlow.status];
  const Icon = cfg.icon;

  return (
    <div className={clsx('rounded-[var(--radius-card)] border p-4', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3">
        <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', cfg.text)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('text-sm font-semibold', cfg.text)}>
              Cash Flow: {cashFlow.label}
            </span>
          </div>
          <p className="text-sm text-surface-700">{cashFlow.explanation}</p>
          <p className="text-xs text-surface-500 mt-1.5">
            Projected 3-month balance: <strong className="text-surface-900">{fmtCurrency(cashFlow.projected_balance_3mo)}</strong>
          </p>
          <p className="text-xs font-medium text-surface-700 mt-2 bg-surface-card/60 rounded-md px-3 py-1.5 inline-block">
            {cashFlow.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
