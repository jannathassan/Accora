import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  changePct?: number;
  icon?: ReactNode;
  prefix?: string;
  iconBg?: string;
  iconText?: string;
}

export default function MetricCard({
  label,
  value,
  changePct,
  icon,
  prefix,
  iconBg = 'bg-brand-50',
  iconText = 'text-brand-600',
}: MetricCardProps) {
  const isPositive = changePct !== undefined && changePct >= 0;
  const isNegative = changePct !== undefined && changePct < 0;

  return (
    <div className="relative overflow-hidden bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4 md:p-5 transition-all duration-200 hover:border-brand-400/40 hover:shadow-[var(--shadow-card-hover)] group">
      {/* Subtle telemetry top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-500/60 via-brand-300/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider font-sans truncate">
          {label}
        </span>
        {icon && (
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 border border-surface-200/60 shrink-0 ${iconBg} ${iconText}`}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl md:text-2xl font-bold text-surface-900 tracking-tight tabular-nums font-mono">
          {prefix}
          {value}
        </span>

        {changePct !== undefined && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums shrink-0 font-mono',
              isPositive && 'bg-positive-light text-positive border border-positive/20',
              isNegative && 'bg-risk-light text-risk border border-risk/20',
              changePct === 0 && 'bg-surface-100 text-surface-500 border border-surface-200'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-positive" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3 text-risk" />
            ) : null}
            <span>
              {isPositive ? '+' : ''}
              {changePct.toFixed(1)}%
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
