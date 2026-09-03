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
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-surface-500">{label}</span>
        {icon && (
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${iconText}`}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-surface-900 tracking-tight">
          {prefix}
          {value}
        </span>
        {changePct !== undefined && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded',
              isPositive && 'bg-positive-light text-positive',
              isNegative && 'bg-risk-light text-risk',
              changePct === 0 && 'bg-surface-100 text-surface-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
