import { useFinancial } from '../store/FinancialStore';
import { fmtCurrency } from '../utils/format';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function CashFlowAlert() {
  const { cashFlow } = useFinancial();

  if (!cashFlow) return null;

  const config = {
    at_risk: {
      icon: AlertCircle,
      bg: 'bg-risk-light',
      border: 'border-risk/30',
      text: 'text-risk',
    },
    watch: {
      icon: AlertTriangle,
      bg: 'bg-warning-light',
      border: 'border-warning/30',
      text: 'text-warning',
    },
    healthy: {
      icon: CheckCircle2,
      bg: 'bg-positive-light',
      border: 'border-positive/30',
      text: 'text-positive',
    },
  };

  const cfg = config[cashFlow.status] || config.healthy;
  const Icon = cfg.icon;

  return (
    <div className={clsx('rounded-[var(--radius-card)] border p-4.5 md:p-5 shadow-xs transition-all font-sans', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3.5">
        <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', cfg.text)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx('text-xs font-bold uppercase tracking-wider', cfg.text)}>
              Cash Flow: {cashFlow.label}
            </span>
          </div>
          <p className="text-sm font-medium text-surface-900 leading-relaxed font-sans">{cashFlow.explanation}</p>
          <p className="text-xs text-surface-600 mt-2 font-sans">
            Projected 3-month balance:{' '}
            <strong className="text-surface-900 font-bold tabular-nums font-mono">
              {fmtCurrency(cashFlow.projected_balance_3mo)}
            </strong>
          </p>
          <p className="text-xs font-medium text-surface-800 mt-2.5 bg-surface-card/90 border border-surface-200/80 rounded-lg px-3 py-1.5 inline-block shadow-2xs font-sans">
            {cashFlow.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
