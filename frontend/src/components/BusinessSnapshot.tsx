import { useFinancial } from '../store/FinancialStore';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Lightbulb, Shield,
} from 'lucide-react';

export default function BusinessSnapshot() {
  const { latest, health, cashFlow, insights, nextBestMove } = useFinancial();
  if (!latest || !health) return null;

  const topRisk = insights.find((i) => i.type === 'risk' || i.severity === 'high');
  const topOpportunity = insights.find((i) => i.type === 'opportunity');

  const revTrend = latest.revenue_change_pct > 0 ? 'up' : latest.revenue_change_pct < 0 ? 'down' : 'flat';
  const profTrend = latest.profit_change_pct > 0 ? 'up' : latest.profit_change_pct < 0 ? 'down' : 'flat';

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-brand-600" />
        Business Snapshot
      </h2>

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
            <p className="text-sm font-semibold text-surface-900 flex items-center gap-1">
              {revTrend === 'up' ? 'Growing' : revTrend === 'down' ? 'Declining' : 'Flat'}
              {latest.revenue_change_pct !== 0 && (
                <span className={`text-[10px] font-medium flex items-center ${revTrend === 'up' ? 'text-positive' : 'text-risk'}`}>
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
            <p className="text-sm font-semibold text-surface-900 flex items-center gap-1">
              {profTrend === 'up' ? 'Growing' : profTrend === 'down' ? 'Declining' : 'Flat'}
              {latest.profit_change_pct !== 0 && (
                <span className={`text-[10px] font-medium flex items-center ${profTrend === 'up' ? 'text-positive' : 'text-risk'}`}>
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
            <span className={`text-sm font-bold ${
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
      {(topRisk || topOpportunity) && (
        <div className="mt-5 pt-4 border-t border-surface-100 space-y-2.5">
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
