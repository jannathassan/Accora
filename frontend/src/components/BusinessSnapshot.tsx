import { useFinancial } from '../store/FinancialStore';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Shield, AlertTriangle, Lightbulb,
} from 'lucide-react';

export default function BusinessSnapshot() {
  const { latest, health, cashFlow, insights, nextBestMove } = useFinancial();

  if (!latest || !health) return null;

  const revTrend = latest.revenue_change_pct > 0 ? 'up' : latest.revenue_change_pct < 0 ? 'down' : 'flat';
  const profTrend = latest.profit_change_pct > 0 ? 'up' : latest.profit_change_pct < 0 ? 'down' : 'flat';

  const topRisk = insights.find((i) => i.severity === 'high');
  const topOpportunity = insights.find((i) => i.type === 'opportunity');

  return (
    <div className="relative overflow-hidden bg-surface-card rounded-[var(--radius-card)] border border-surface-200 dark:border-surface-200/50 shadow-[var(--shadow-card)] p-6 transition-all hover:border-brand-400/40 font-sans group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-600 via-brand-400 to-transparent opacity-60" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          Business Health Snapshot
        </h2>
        <span className="text-[10px] text-surface-400 font-mono">Executive Summary</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${revTrend === 'up' ? 'bg-positive-light' : 'bg-risk-light'}`}>
            {revTrend === 'up'
              ? <TrendingUp className="w-4.5 h-4.5 text-positive" />
              : <TrendingDown className="w-4.5 h-4.5 text-risk" />}
          </div>
          <div>
            <p className="text-[10px] text-surface-400 uppercase tracking-wide">Revenue</p>
            <p className="text-sm font-semibold text-surface-900 flex items-center gap-1 font-mono">
              {revTrend === 'up' ? 'Growing' : revTrend === 'down' ? 'Declining' : 'Flat'}
              {latest.revenue_change_pct !== 0 && (
                <span className={`text-[10px] font-medium flex items-center tabular-nums ${revTrend === 'up' ? 'text-positive' : 'text-risk'}`}>
                  {revTrend === 'up'
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(latest.revenue_change_pct).toFixed(1)}%
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Profit Trend */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${profTrend === 'up' ? 'bg-positive-light' : 'bg-risk-light'}`}>
            {profTrend === 'up'
              ? <TrendingUp className="w-4.5 h-4.5 text-positive" />
              : <TrendingDown className="w-4.5 h-4.5 text-risk" />}
          </div>
          <div>
            <p className="text-[10px] text-surface-400 uppercase tracking-wide">Profit</p>
            <p className="text-sm font-semibold text-surface-900 flex items-center gap-1 font-mono">
              {profTrend === 'up' ? 'Growing' : profTrend === 'down' ? 'Declining' : 'Flat'}
              {latest.profit_change_pct !== 0 && (
                <span className={`text-[10px] font-medium flex items-center tabular-nums ${profTrend === 'up' ? 'text-positive' : 'text-risk'}`}>
                  {profTrend === 'up'
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(latest.profit_change_pct).toFixed(1)}%
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            cashFlow?.status === 'healthy' ? 'bg-positive-light' : cashFlow?.status === 'watch' ? 'bg-warning-light' : 'bg-risk-light'
          }`}>
            <Shield className={`w-4.5 h-4.5 ${
              cashFlow?.status === 'healthy' ? 'text-positive' : cashFlow?.status === 'watch' ? 'text-warning' : 'text-risk'
            }`} />
          </div>
          <div>
            <p className="text-[10px] text-surface-400 uppercase tracking-wide">Cash Flow</p>
            <p className="text-sm font-semibold text-surface-900">{cashFlow?.label ?? '—'}</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            health.overall >= 70 ? 'bg-positive-light' : health.overall >= 50 ? 'bg-warning-light' : 'bg-risk-light'
          }`}>
            <span className={`text-sm font-bold font-mono tabular-nums ${
              health.overall >= 70 ? 'text-positive' : health.overall >= 50 ? 'text-warning' : 'text-risk'
            }`}>
              {health.overall.toFixed(0)}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-surface-400 uppercase tracking-wide">Health</p>
            <p className="text-sm font-semibold text-surface-900">{health.label}</p>
          </div>
        </div>
      </div>

      {/* Top Risk & Opportunity */}
      {(topRisk || topOpportunity || nextBestMove) && (
        <div className="mt-5 pt-4 border-t border-surface-200/70 space-y-2.5">
          {topRisk && (
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-risk shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-risk uppercase tracking-wide">Top Risk</p>
                <p className="text-xs text-surface-600">{topRisk.title}</p>
              </div>
            </div>
          )}
          {topOpportunity && (
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-warning uppercase tracking-wide">Top Opportunity</p>
                <p className="text-xs text-surface-600">{topOpportunity.title}</p>
              </div>
            </div>
          )}
          {nextBestMove && (
            <div className="flex items-start gap-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide">Next Best Move</p>
                <p className="text-xs text-surface-600">{nextBestMove.title}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
