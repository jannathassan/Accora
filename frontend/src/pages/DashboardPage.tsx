import { useFinancial } from '../store/FinancialStore';
import { useTheme } from '../store/ThemeProvider';
import { fmtCurrency, periodLabel } from '../utils/format';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import HealthScore from '../components/HealthScore';
import NextBestMoveCard from '../components/NextBestMoveCard';
import CashFlowAlert from '../components/CashFlowAlert';
import ActionCenter from '../components/ActionCenter';
import BusinessSnapshot from '../components/BusinessSnapshot';
import ForecastSection from '../components/ForecastSection';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Percent, Clock, Wallet,
  Sparkles, Info,
} from 'lucide-react';

const PIE_COLORS = ['#7c3aed', '#12b76a', '#f79009', '#a78bfa', '#f04438', '#06aed4'];

export default function DashboardPage() {
  const {
    business, metrics, latest, loading, setCopilotOpen,
  } = useFinancial();

  const { theme } = useTheme();
  const chartGrid = theme === 'dark' ? '#28213b' : theme === 'high-contrast' ? '#b4b4c4' : '#e8e2f2';
  const chartText = theme === 'dark' ? '#9687b8' : theme === 'high-contrast' ? '#000000' : '#736484';
  const tooltipBg = theme === 'dark' ? '#1d182e' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#3b3156' : theme === 'high-contrast' ? '#000000' : '#e8e2f2';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-surface-500 font-sans">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const currency = business?.currency ?? 'PKR';
  const chartData = metrics.map((m) => ({
    period: periodLabel(m.period),
    revenue: m.revenue,
    expenses: m.expenses,
    profit: m.profit,
  }));

  const expenseBreakdown = latest?.expense_breakdown
    ? Object.entries(latest.expense_breakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <>
      <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6 font-sans">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-surface-900 tracking-tight font-sans">
                {business?.name ?? 'Executive Financial Dashboard'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 uppercase tracking-wider font-mono">
                Active Ledger
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-1 flex items-center gap-2 font-sans">
              <span>{business?.industry || 'Business Finance'}</span>
              <span>&middot;</span>
              <span className="font-semibold text-surface-700">Base Currency: {currency}</span>
            </p>
          </div>
          <button
            onClick={() => setCopilotOpen(true)}
            title="Ask Accora Core AI anything about your business"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs md:text-sm font-semibold rounded-xl active:scale-[0.98] transition-all shadow-sm group cursor-pointer font-sans"
          >
            <Sparkles className="w-4 h-4 text-brand-200 group-hover:rotate-12 transition-transform" />
            <span>Ask Financial Copilot</span>
          </button>
        </div>

        {/* ── Estimated Baseline Banner ─────────────────────────── */}
        {latest?.is_estimated && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-sans">
            <div className="flex items-start sm:items-center gap-2.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold text-amber-600 dark:text-amber-400 mr-1.5 font-mono">
                  [Estimated Baseline from Setup]
                </span>
                <span className="text-surface-700">
                  Dashboard metrics, health score, and cash forecast are currently projected from your Business Profile setup figures. Import transactions or add records to unlock historical reporting.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-sans">
              <Link
                to="/app/transactions"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Import CSV / Transactions
              </Link>
              <Link
                to="/app/settings"
                className="px-3 py-1.5 border border-surface-200 hover:bg-surface-100 rounded-lg transition-colors text-surface-700 font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
        )}

        {/* ── Top-level KPI Row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
          <MetricCard
            label="Cash Balance"
            value={fmtCurrency(latest?.cash_balance ?? 0, currency)}
            icon={<Wallet className="w-4 h-4" />}
            iconBg="bg-brand-50"
            iconText="text-brand-600"
          />
          <MetricCard
            label="Monthly Revenue"
            value={fmtCurrency(latest?.revenue ?? 0, currency)}
            changePct={latest?.revenue_change_pct}
            icon={<DollarSign className="w-4 h-4" />}
            iconBg="bg-positive-light"
            iconText="text-positive"
          />
          <MetricCard
            label="Operating Expenses"
            value={fmtCurrency(latest?.expenses ?? 0, currency)}
            changePct={latest?.expenses_change_pct}
            icon={<TrendingDown className="w-4 h-4" />}
            iconBg="bg-risk-light"
            iconText="text-risk"
          />
          <MetricCard
            label="Net Profit"
            value={fmtCurrency(latest?.profit ?? 0, currency)}
            changePct={latest?.profit_change_pct}
            icon={<TrendingUp className="w-4 h-4" />}
            iconBg="bg-positive-light"
            iconText="text-positive"
          />
          <MetricCard
            label="Profit Margin"
            value={`${((latest?.margin ?? 0) * 100).toFixed(1)}%`}
            icon={<Percent className="w-4 h-4" />}
            iconBg="bg-brand-50"
            iconText="text-brand-600"
          />
          <MetricCard
            label="Outstanding"
            value={fmtCurrency(latest?.outstanding ?? 0, currency)}
            icon={<Clock className="w-4 h-4" />}
            iconBg="bg-warning-light"
            iconText="text-warning"
          />
        </div>

        {/* ── Main Grid ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 cols: Charts + Forecast */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue vs Expenses Chart */}
            <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-6 transition-all hover:border-surface-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-surface-200/80">
                <div>
                  <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider font-sans">
                    Revenue vs. Expenses Trend
                  </h2>
                  <p className="text-xs text-surface-500 mt-0.5 font-sans">Historical monthly performance</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-sans">
                  <span className="flex items-center gap-1.5 text-positive font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-positive" /> Revenue
                  </span>
                  <span className="flex items-center gap-1.5 text-risk font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-risk" /> Expenses
                  </span>
                  <span className="flex items-center gap-1.5 text-brand-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600" /> Profit
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f04438" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f04438" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: chartText }} />
                    <YAxis tick={{ fontSize: 11, fill: chartText }} tickFormatter={(v) => fmtCurrency(v)} />
                    <Tooltip
                      formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 10,
                        border: `1px solid ${tooltipBorder}`,
                        backgroundColor: tooltipBg,
                        color: chartText,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      fill="url(#revGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f04438"
                      strokeWidth={2}
                      fill="url(#expGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown Pie + Forecast */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Expense Breakdown */}
              <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-6 transition-all hover:border-surface-300">
                <h2 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1 font-sans">
                  Expense Distribution
                </h2>
                <p className="text-xs text-surface-500 mb-3 font-sans">Current month breakdown</p>

                {expenseBreakdown.length > 0 ? (
                  <>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={2}
                          >
                            {expenseBreakdown.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: any) => `${currency} ${Number(v ?? 0).toLocaleString()}`}
                            contentStyle={{
                              fontSize: 11,
                              borderRadius: 8,
                              border: `1px solid ${tooltipBorder}`,
                              backgroundColor: tooltipBg,
                              color: chartText,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                      {expenseBreakdown.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-surface-600 truncate">{item.name}</span>
                          <span className="font-semibold text-surface-900 ml-auto font-mono tabular-nums">
                            {fmtCurrency(item.value, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-surface-400 py-10 text-center">No expense data available</p>
                )}
              </div>

              {/* Business Snapshot Mini Summary */}
              <BusinessSnapshot />
            </div>

            {/* Forecast Section */}
            <ForecastSection />
          </div>

          {/* Right col: Insights, Action Center, Health Score */}
          <div className="space-y-6">
            <NextBestMoveCard />
            <CashFlowAlert />
            <HealthScore />
            <ActionCenter />
          </div>
        </div>
      </div>
    </>
  );
}
