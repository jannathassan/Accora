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

const PIE_COLORS = ['#3378ff', '#12b76a', '#f79009', '#7c3aed', '#f04438', '#06aed4', '#98a2b3'];

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const chartGrid = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#cccccc' : '#e4e7ec';
  const chartText = theme === 'dark' ? '#8892a6' : theme === 'high-contrast' ? '#333333' : '#667085';
  const tooltipBg = theme === 'dark' ? '#1a1e28' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#000000' : '#e4e7ec';
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
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-surface-900">Financial Analytics</h1>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setMonths(f.value)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                months === f.value ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue vs Expenses */}
      <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
        <h2 className="text-sm font-semibold text-surface-900 mb-4">Revenue vs Expenses</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3378ff" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3378ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f04438" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#f04438" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartText }} />
            <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={fmtCurrency} />
            <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3378ff" strokeWidth={2} fill="url(#aRev)" name="Revenue" />
            <Area type="monotone" dataKey="expenses" stroke="#f04438" strokeWidth={2} fill="url(#aExp)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profit Trend */}
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Profit Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
              <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
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
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Cash Flow</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aCF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12b76a" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#12b76a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
              <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
              />
              <Area type="monotone" dataKey="cashFlow" stroke="#12b76a" strokeWidth={2} fill="url(#aCF)" name="Cash Flow" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Pie */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenseTotals} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={55} outerRadius={85} paddingAngle={2}>
                {expenseTotals.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {expenseTotals.map((e, i) => (
              <div key={e.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-surface-600 flex-1 truncate">{e.name}</span>
                <span className="text-surface-900 font-medium tabular-nums">{fmtCurrency(e.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Margin Trend */}
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Profit Margin</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="aMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v}%`}
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
