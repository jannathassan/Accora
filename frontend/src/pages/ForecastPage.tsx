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
  revenue: '#3378ff',
  expenses: '#f04438',
  profit: '#12b76a',
  cash_flow: '#7c3aed',
};

export default function ForecastPage() {
  const { theme } = useTheme();
  const chartGrid = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#cccccc' : '#e4e7ec';
  const chartText = theme === 'dark' ? '#8892a6' : theme === 'high-contrast' ? '#333333' : '#667085';
  const tooltipBg = theme === 'dark' ? '#1a1e28' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#000000' : '#e4e7ec';
  const { forecast, metrics, business } = useFinancial();
  const currency = business?.currency ?? 'PKR';
  const [activeTab, setActiveTab] = useState('all');

  const visible = activeTab === 'all' ? forecast : forecast.filter((f) => f.metric === activeTab);

  // Build a combined historical + forecast dataset for the focused single-chart view
  const buildCombinedData = (metric: string) => {
    const fc = forecast.find((f) => f.metric === metric);
    if (!fc) return [];
    return fc.points.map((p) => ({
      period: periodLabel(p.date),
      value: p.value,
      predicted: p.is_predicted,
      low: p.confidence_low,
      high: p.confidence_high,
      // separate keys for dual rendering
      historical: p.is_predicted ? null : p.value,
      projected: p.is_predicted ? p.value : null,
    }));
  };

  // Find the boundary between historical and predicted
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
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-ai" />
        <h1 className="text-xl font-bold text-surface-900">Forecast Center</h1>
        <span className="text-xs text-surface-400 ml-2">AI-powered projections based on your historical data</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const trend = tab.key !== 'all' ? getTrend(tab.key) : null;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={clsx('inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                activeTab === tab.key ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
              {trend && (
                <span className={clsx('ml-1 text-[10px] font-semibold',
                  (tab.key === 'expenses' ? !trend.positive : trend.positive)
                    ? (activeTab === tab.key ? 'text-white/80' : 'text-positive')
                    : (activeTab === tab.key ? 'text-white/80' : 'text-risk')
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
              <div key={fc.metric} className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-surface-900">{label}</h3>
                  {trend && (
                    <span className={clsx('inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded',
                      (fc.metric === 'expenses' ? !trend.positive : trend.positive)
                        ? 'bg-positive-light text-positive'
                        : 'bg-risk-light text-risk')}>
                      {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend.positive ? '+' : ''}{trend.pct}%
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`fcg-${fc.metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                    <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
                    <Tooltip
                      formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
                    />
                    <Area type="monotone" dataKey="historical" stroke={color} strokeWidth={2}
                      fill={`url(#fcg-${fc.metric})`} connectNulls={false} name="Actual" />
                    <Area type="monotone" dataKey="projected" stroke={color} strokeWidth={2}
                      strokeDasharray="5 3" fill={`url(#fcg-${fc.metric})`} connectNulls={false} name="Projected" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-surface-400">
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} /> Historical</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded border-t border-dashed" style={{ borderColor: color }} /> Projected</span>
                </div>
                <p className="text-[11px] text-surface-500 mt-2 leading-relaxed">{fc.explanation}</p>
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
                <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 mb-1">Last Actual</p>
                  <p className="text-lg font-semibold text-surface-900 tabular-nums">
                    {historical.length ? fmtCurrency(historical[historical.length - 1].value) : '—'}
                  </p>
                </div>
                <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 mb-1">Projected End</p>
                  <p className="text-lg font-semibold text-surface-900 tabular-nums">
                    {predicted.length ? fmtCurrency(predicted[predicted.length - 1].value) : '—'}
                  </p>
                </div>
                <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 mb-1">Projected Change</p>
                  {trend && (
                    <span className={clsx('text-lg font-semibold tabular-nums',
                      (fc.metric === 'expenses' ? !trend.positive : trend.positive) ? 'text-positive' : 'text-risk')}>
                      {trend.positive ? '+' : ''}{trend.pct}%
                    </span>
                  )}
                </div>
                <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
                  <p className="text-xs text-surface-500 mb-1">Confidence Range</p>
                  <p className="text-sm font-medium text-surface-700">
                    {predicted.length && predicted[predicted.length - 1].confidence_low != null
                      ? `${fmtCurrency(predicted[predicted.length - 1].confidence_low!)} — ${fmtCurrency(predicted[predicted.length - 1].confidence_high!)}`
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Large Chart */}
              <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-surface-900">{label} Forecast</h3>
                  <div className="flex items-center gap-4 text-[10px] text-surface-400">
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} /> Historical</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded border-t border-dashed" style={{ borderColor: color }} /> Projected</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id={`fclg-${fc.metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                    <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
                    <Tooltip
                      formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
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
              <div className="bg-ai-light rounded-[var(--radius-card)] p-4">
                <p className="text-xs font-semibold text-ai uppercase tracking-wide mb-1">AI Forecast Analysis</p>
                <p className="text-sm text-surface-700 leading-relaxed">{fc.explanation}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
