import type { AIInsight } from '../types';
import { clsx } from 'clsx';
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Shield,
} from 'lucide-react';

interface InsightCardProps {
  insight: AIInsight;
}

const TYPE_CONFIG: Record<string, { icon: typeof TrendingUp; label: string; text: string; bg: string }> = {
  expense_spike: {
    icon: TrendingUp,
    label: 'Expense Alert',
    text: 'text-risk',
    bg: 'bg-risk-light text-risk',
  },
  cashflow_warning: {
    icon: TrendingDown,
    label: 'Cash Flow Warning',
    text: 'text-risk',
    bg: 'bg-risk-light text-risk',
  },
  growth_opportunity: {
    icon: Lightbulb,
    label: 'Growth Opportunity',
    text: 'text-positive',
    bg: 'bg-positive-light text-positive',
  },
  margin_compression: {
    icon: AlertTriangle,
    label: 'Margin Risk',
    text: 'text-warning',
    bg: 'bg-warning-light text-warning',
  },
  revenue_concentration: {
    icon: Shield,
    label: 'Concentration Risk',
    text: 'text-warning',
    bg: 'bg-warning-light text-warning',
  },
};

export default function InsightCard({ insight }: InsightCardProps) {
  const cfg = TYPE_CONFIG[insight.type] || {
    icon: Lightbulb,
    label: 'Insight',
    text: 'text-brand-600',
    bg: 'bg-brand-50 text-brand-600',
  };
  const Icon = cfg.icon;

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4.5 hover:shadow-[var(--shadow-card-hover)] hover:border-surface-300 transition-all font-sans">
      <div className="flex items-start gap-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', cfg.bg)}>
          <Icon className={clsx('w-4 h-4', cfg.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={clsx('text-[10px] font-bold uppercase tracking-wider', cfg.text)}>
              {cfg.label}
            </span>
            {insight.severity !== 'low' && (
              <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide">
                [{insight.severity}]
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-surface-900">{insight.title}</h3>
          <p className="text-xs text-surface-600 leading-relaxed mt-1">{insight.explanation}</p>

          {insight.evidence.length > 0 && (
            <ul className="mt-2 space-y-1">
              {insight.evidence.map((e, i) => (
                <li key={i} className="text-[11px] text-surface-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-300 shrink-0" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-2.5 text-xs font-medium text-brand-600 bg-brand-100/70 border border-brand-200/80 rounded-lg px-3 py-2 leading-relaxed">
            {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
