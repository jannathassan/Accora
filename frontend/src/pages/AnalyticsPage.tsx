import { useState, useMemo } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { useTheme } from '../store/ThemeProvider';
import { fmtCurrency, periodLabel } from '../utils/format';
import { clsx } from 'clsx';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const FILTERS = [
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: 'This Year', value: 12 },
];

const PIE_COLORS = ['#7c3aed', '#12b76a', '#f79009', '#a78bfa', '#f04438', '#06aed4', '#8892a6'];

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartGrid = isDark ? '#28213b' : theme === 'high-contrast' ? '#b4b4c4' : '#e8e2f2';
  const chartText = isDark ? '#9687b8' : theme === 'high-contrast' ? '#000000' : '#736484';
  const tooltipBg = isDark ? '#1d182e' : '#ffffff';
  const tooltipBorder = isDark ? '#3b3156' : theme === 'high-contrast' ? '#000000' : '#e8e2f2';
  const { metrics, business } = useFinancial();
  const [months, setMonths] = useState(12);
  const currency = business?.currency ?? 'PKR';

  const filtered = useMemo(() => metrics.slice(-months), [metrics, months]);

  const chartData = filtered.map((m) => ({
    period: periodLabel(m.period),
    revenue: m.revenue,
    expenses: m.expenses,
    profit: m.profit,
    cashFlow: m.cash_flow,
    margin: +(m.margin * 100).toFixed(1),
  }));

  // Aggregate expense breakdown across selected period
  const expenseTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((m) => {
      for (const [cat, val] of Object.entries(m.expense_breakdown ?? {})) {
        map[cat] = (map[cat] || 0) + val;
      }
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Financial Analytics
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Historical burn rate, profit margins, and multi-period financial performance
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setMonths(f.value)}
              className={clsx(
                'px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
                months === f.value
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-card border border-surface-200 text-surface-600 dark:text-surface-300 hover:bg-surface-100',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue vs Expenses */}
      <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-surface-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            Revenue vs Expenses
          </h2>
          <span className="text-[10px] text-surface-400 font-mono">Comparative Trajectory</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f04438" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f04438" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} opacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartText }} />
            <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
            <Tooltip
              formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#aRev)" name="Revenue" />
            <Area type="monotone" dataKey="expenses" stroke="#f04438" strokeWidth={2} fill="url(#aExp)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profit Trend */}
        <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-surface-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Profit Trend
            </h2>
            <span className="text-[10px] text-surface-400 font-mono">Net Operating Margin</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} opacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
              <Tooltip
                formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
              />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]} name="Profit">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? '#12b76a' : '#f04438'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow */}
        <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-surface-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Cash Flow
            </h2>
            <span className="text-[10px] text-surface-400 font-mono">Operational Liquidity</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aCF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12b76a" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#12b76a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} opacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
              <Tooltip
                formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
              />
              <Area type="monotone" dataKey="cashFlow" stroke="#12b76a" strokeWidth={2} fill="url(#aCF)" name="Cash Flow" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-surface-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Expense Breakdown
            </h2>
            <span className="text-[10px] text-surface-400 font-mono">Cost Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenseTotals} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={55} outerRadius={85} paddingAngle={2}>
                {expenseTotals.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {expenseTotals.map((e, i) => (
              <div key={e.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-surface-600 dark:text-surface-300 flex-1 truncate">{e.name}</span>
                <span className="text-surface-900 dark:text-surface-100 font-semibold tabular-nums font-mono">{fmtCurrency(e.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Margin Trend */}
        <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-surface-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              Profit Margin
            </h2>
            <span className="text-[10px] text-surface-400 font-mono">Margin Efficiency (%)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} opacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(v: any) => `${v}%`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
              />
              <Area type="monotone" dataKey="margin" stroke="#7c3aed" strokeWidth={2} fill="url(#aMargin)" name="Margin" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
