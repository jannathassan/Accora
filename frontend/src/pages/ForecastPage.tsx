import { useState } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { useTheme } from '../store/ThemeProvider';
import { fmtCurrency, periodLabel } from '../utils/format';
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Brain, TrendingUp, TrendingDown, Activity, DollarSign, PiggyBank, Waves } from 'lucide-react';
import { clsx } from 'clsx';

const TABS = [
  { key: 'all', label: 'All Forecasts', icon: Brain },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'expenses', label: 'Expenses', icon: Activity },
  { key: 'profit', label: 'Profit', icon: PiggyBank },
  { key: 'cash_flow', label: 'Cash Flow', icon: Waves },
];

const METRIC_COLORS: Record<string, string> = {
  revenue: '#7c3aed',
  expenses: '#f04438',
  profit: '#12b76a',
  cash_flow: '#8b5cf6',
};

export default function ForecastPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartGrid = isDark ? '#28213b' : theme === 'high-contrast' ? '#b4b4c4' : '#e8e2f2';
  const chartText = isDark ? '#9687b8' : theme === 'high-contrast' ? '#000000' : '#736484';
  const tooltipBg = isDark ? '#1d182e' : '#ffffff';
  const tooltipBorder = isDark ? '#3b3156' : theme === 'high-contrast' ? '#000000' : '#e8e2f2';
  const { forecast, business } = useFinancial();
  const currency = business?.currency ?? 'PKR';
  const [activeTab, setActiveTab] = useState('all');

  const visible = activeTab === 'all' ? forecast : forecast.filter((f) => f.metric === activeTab);

  const buildCombinedData = (metric: string) => {
    const fc = forecast.find((f) => f.metric === metric);
    if (!fc) return [];
    return fc.points.map((p) => ({
      period: periodLabel(p.date),
      value: p.value,
      predicted: p.is_predicted,
      low: p.confidence_low,
      high: p.confidence_high,
      historical: p.is_predicted ? null : p.value,
      projected: p.is_predicted ? p.value : null,
    }));
  };

  const getBoundaryDate = (metric: string) => {
    const fc = forecast.find((f) => f.metric === metric);
    if (!fc) return null;
    const firstPredicted = fc.points.find((p) => p.is_predicted);
    return firstPredicted ? periodLabel(firstPredicted.date) : null;
  };

  const getTrend = (metric: string) => {
    const fc = forecast.find((f) => f.metric === metric);
    if (!fc || fc.points.length < 2) return null;
    const historical = fc.points.filter((p) => !p.is_predicted);
    const predicted = fc.points.filter((p) => p.is_predicted);
    if (!historical.length || !predicted.length) return null;
    const lastActual = historical[historical.length - 1].value;
    const lastPredicted = predicted[predicted.length - 1].value;
    const change = lastPredicted - lastActual;
    const pct = lastActual ? ((change / lastActual) * 100).toFixed(1) : '0';
    return { change, pct, positive: change >= 0 };
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              Forecast Center
            </h1>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            AI-powered projections based on your historical data
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const trend = tab.key !== 'all' ? getTrend(tab.key) : null;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={clsx('inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer',
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-card border border-surface-200 text-surface-600 dark:text-surface-300 hover:bg-surface-100')}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
              {trend && (
                <span className={clsx('ml-1 text-[10px] font-bold tabular-nums font-mono',
                  (tab.key === 'expenses' ? !trend.positive : trend.positive)
                    ? (activeTab === tab.key ? 'text-emerald-200' : 'text-positive')
                    : (activeTab === tab.key ? 'text-rose-200' : 'text-risk')
                )}>
                  {trend.positive ? '+' : ''}{trend.pct}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {forecast.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-500 font-medium">No forecast data available yet</p>
          <p className="text-xs text-surface-400 mt-1">Add more transactions to generate AI-powered forecasts.</p>
        </div>
      ) : activeTab === 'all' ? (
        /* Grid View — all metrics */
        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((fc) => {
            const data = buildCombinedData(fc.metric);
            const color = METRIC_COLORS[fc.metric] ?? '#7c3aed';
            const label = fc.metric.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            const trend = getTrend(fc.metric);

            return (
              <div key={fc.metric} className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-surface-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{label}</h3>
                  {trend && (
                    <span className={clsx('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums font-mono',
                      (fc.metric === 'expenses' ? !trend.positive : trend.positive)
                        ? 'bg-positive-light text-positive border border-positive/20'
                        : 'bg-risk-light text-risk border border-risk/20')}>
                      {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend.positive ? '+' : ''}{trend.pct}%
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`fcg-${fc.metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} opacity={0.6} />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                    <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
                    <Tooltip
                      formatter={(v: any) => [`${currency} ${Number(v ?? 0).toLocaleString()}`, '']}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
                    />
                    <Area type="monotone" dataKey="historical" stroke={color} strokeWidth={2.5}
                      fill={`url(#fcg-${fc.metric})`} connectNulls={false} name="Actual" />
                    <Area type="monotone" dataKey="projected" stroke={color} strokeWidth={2}
                      strokeDasharray="5 3" fill={`url(#fcg-${fc.metric})`} connectNulls={false} name="Projected" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-surface-400">
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} /> Historical</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded border-t border-dashed" style={{ borderColor: color }} /> Projected</span>
                </div>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{fc.explanation}</p>
              </div>
            );
          })}
        </div>
      ) : (
        /* Focused View — single metric */
        visible.map((fc) => {
          const data = buildCombinedData(fc.metric);
          const color = METRIC_COLORS[fc.metric] ?? '#7c3aed';
          const boundary = getBoundaryDate(fc.metric);
          const trend = getTrend(fc.metric);
          const label = fc.metric.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const historical = fc.points.filter((p) => !p.is_predicted);
          const predicted = fc.points.filter((p) => p.is_predicted);

          return (
            <div key={fc.metric} className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Last Actual</p>
                  <p className="text-lg font-bold text-surface-900 dark:text-surface-100 tabular-nums font-mono">
                    {historical.length ? fmtCurrency(historical[historical.length - 1].value) : '—'}
                  </p>
                </div>
                <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Projected End</p>
                  <p className="text-lg font-bold text-surface-900 dark:text-surface-100 tabular-nums font-mono">
                    {predicted.length ? fmtCurrency(predicted[predicted.length - 1].value) : '—'}
                  </p>
                </div>
                <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Projected Change</p>
                  {trend && (
                    <span className={clsx('text-lg font-bold tabular-nums font-mono',
                      (fc.metric === 'expenses' ? !trend.positive : trend.positive) ? 'text-positive' : 'text-risk')}>
                      {trend.positive ? '+' : ''}{trend.pct}%
                    </span>
                  )}
                </div>
                <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Confidence Range</p>
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 font-mono tabular-nums">
                    {predicted.length && predicted[predicted.length - 1].confidence_low != null
                      ? `${fmtCurrency(predicted[predicted.length - 1].confidence_low!)} — ${fmtCurrency(predicted[predicted.length - 1].confidence_high!)}`
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Large Chart */}
              <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">{label} Forecast</h3>
                  <div className="flex items-center gap-4 text-[10px] text-surface-400">
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} /> Historical</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded border-t border-dashed" style={{ borderColor: color }} /> Projected</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`fclg-${fc.metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} opacity={0.6} />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                    <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
                    <Tooltip
                      formatter={(v: any) => [`${currency} ${Number(v ?? 0).toLocaleString()}`, '']}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
                    />
                    {boundary && (
                      <ReferenceLine x={boundary} stroke={chartGrid} strokeDasharray="3 3" label="" />
                    )}
                    <Area type="monotone" dataKey="historical" stroke={color} strokeWidth={2.5}
                      fill={`url(#fclg-${fc.metric})`} connectNulls={false} name="Actual" />
                    <Area type="monotone" dataKey="projected" stroke={color} strokeWidth={2.5}
                      strokeDasharray="6 3" fill={`url(#fclg-${fc.metric})`} connectNulls={false} name="Projected" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* AI Explanation */}
              <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 p-4 shadow-[var(--shadow-card)]">
                <p className="text-xs font-bold text-ai uppercase tracking-wider mb-1">AI Forecast Analysis</p>
                <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{fc.explanation}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
