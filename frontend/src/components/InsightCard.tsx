import { clsx } from 'clsx';
import type { AIInsight } from '../types';
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react';

interface Props {
  insight: AIInsight;
}

const CONFIG: Record<string, { icon: typeof AlertTriangle; bg: string; text: string; label: string }> = {
  risk:        { icon: AlertTriangle, bg: 'bg-risk-light',      text: 'text-risk',     label: 'Risk' },
  anomaly:     { icon: AlertTriangle, bg: 'bg-warning-light',   text: 'text-warning',  label: 'Anomaly' },
  opportunity: { icon: Lightbulb,     bg: 'bg-positive-light',  text: 'text-positive', label: 'Opportunity' },
  trend:       { icon: TrendingUp,    bg: 'bg-brand-50',        text: 'text-brand-600',label: 'Trend' },
  positive:    { icon: CheckCircle2,  bg: 'bg-positive-light',  text: 'text-positive', label: 'Positive' },
};

export default function InsightCard({ insight }: Props) {
  const cfg = CONFIG[insight.type] ?? CONFIG.risk;
  const Icon = cfg.icon;

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="flex items-start gap-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
          <Icon className={clsx('w-4 h-4', cfg.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={clsx('text-[10px] font-bold uppercase tracking-wider', cfg.text)}>
              {cfg.label}
            </span>
            {insight.severity !== 'low' && (
              <span className="text-[10px] text-surface-400">{insight.severity}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-surface-900">{insight.title}</h3>
          <p className="text-xs text-surface-600 leading-relaxed mt-1">{insight.explanation}</p>

          {insight.evidence.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {insight.evidence.map((e, i) => (
                <li key={i} className="text-[11px] text-surface-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-surface-300 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-2.5 text-xs font-medium text-brand-700 bg-brand-50 rounded-md px-3 py-2 leading-relaxed">
            {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
