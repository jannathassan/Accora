import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import HealthScore from '../components/HealthScore';
import ActionCenter from '../components/ActionCenter';
import CashFlowAlert from '../components/CashFlowAlert';
import NextBestMoveCard from '../components/NextBestMoveCard';
import BusinessSnapshot from '../components/BusinessSnapshot';
import ForecastSection from '../components/ForecastSection';
import CopilotPanel from '../components/CopilotPanel';
import { fmtCurrency, periodLabel } from '../utils/format';
import { useTheme } from '../store/ThemeProvider';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Banknote, CircleDollarSign, MessageSquare, PiggyBank,
  Sparkles, TrendingDown, TrendingUp, Wallet,
  FileSpreadsheet, Lightbulb, Brain, FileText, Sliders, ArrowRight,
} from 'lucide-react';

const PIE_COLORS = ['#3378ff', '#12b76a', '#f79009', '#7c3aed', '#f04438', '#06aed4'];

export default function DashboardPage() {
  const {
    business, metrics, latest, insights, loading,
  } = useFinancial();
  const [copilotOpen, setCopilotOpen] = useState(false);

  const { theme } = useTheme();
  const chartGrid = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#cccccc' : '#e4e7ec';
  const chartText = theme === 'dark' ? '#8892a6' : theme === 'high-contrast' ? '#333333' : '#667085';
  const tooltipBg = theme === 'dark' ? '#1a1e28' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#000000' : '#e4e7ec';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-surface-500">Loading financial data...</p>
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
      <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-surface-900 tracking-tight">
              {business?.name ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              {business?.industry} &middot; {currency}
            </p>
          </div>
          <button
            onClick={() => setCopilotOpen(true)}
            title="Ask Accora AI anything about your business"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ai text-white text-sm font-medium rounded-lg hover:bg-ai/90 active:scale-[0.97] transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Accora</span>
          </button>
        </div>

        {/* ── Cash Flow Alert ────────────────────────────────────── */}
        <CashFlowAlert />

        {/* ── Your Next Best Move ──────────────────────────────────── */}
        <NextBestMoveCard />

        {/* ── Financial Snapshot ─────────────────────────────────── */}
        {latest && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
            <MetricCard
              label="Revenue"
              value={fmtCurrency(latest.revenue, currency)}
              changePct={latest.revenue_change_pct}
              icon={<CircleDollarSign className="w-4 h-4" />}
              prefix={`${currency} `}
              iconBg="bg-brand-50"
              iconText="text-brand-600"
            />
            <MetricCard
              label="Expenses"
              value={fmtCurrency(latest.expenses, currency)}
              changePct={latest.expenses_change_pct}
              icon={<Banknote className="w-4 h-4" />}
              prefix={`${currency} `}
              iconBg="bg-risk-light"
              iconText="text-risk"
            />
            <MetricCard
              label="Net Profit"
              value={fmtCurrency(latest.profit, currency)}
              changePct={latest.profit_change_pct}
              icon={<TrendingUp className="w-4 h-4" />}
              prefix={`${currency} `}
              iconBg="bg-positive-light"
              iconText="text-positive"
            />
            <MetricCard
              label="Profit Margin"
              value={`${(latest.margin * 100).toFixed(1)}%`}
              icon={<PiggyBank className="w-4 h-4" />}
              iconBg="bg-warning-light"
              iconText="text-warning"
            />
            <MetricCard
              label="Cash Flow"
              value={fmtCurrency(latest.cash_flow, currency)}
              icon={<TrendingDown className="w-4 h-4" />}
              prefix={`${currency} `}
              iconBg="bg-ai-light"
              iconText="text-ai"
            />
            <MetricCard
              label="Outstanding"
              value={fmtCurrency(latest.outstanding, currency)}
              icon={<Wallet className="w-4 h-4" />}
              prefix={`${currency} `}
              iconBg="bg-surface-100"
              iconText="text-surface-600"
            />
          </div>
        )}

        {/* ── Charts Row ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Revenue vs Expenses */}
          <div className="lg:col-span-2 bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
            <h2 className="text-sm font-semibold text-surface-900 mb-4">Revenue vs Expenses</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3378ff" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3378ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f04438" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#f04438" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
                <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
                <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }} />
                <Area type="monotone" dataKey="revenue" stroke="#3378ff" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#f04438" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown Pie */}
          <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
            <h2 className="text-sm font-semibold text-surface-900 mb-4">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65} paddingAngle={2}>
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {expenseBreakdown.slice(0, 5).map((e, i) => (
                <div key={e.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-surface-600 flex-1 truncate">{e.name}</span>
                  <span className="text-surface-900 font-medium">{fmtCurrency(e.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Profit Trend ─────────────────────────────────────── */}
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h2 className="text-sm font-semibold text-surface-900 mb-4">Monthly Profit</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: chartText }} />
              <YAxis tick={{ fontSize: 10, fill: chartText }} tickFormatter={fmtCurrency} />
              <Tooltip formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${tooltipBorder}`, backgroundColor: tooltipBg, color: chartText }} />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]} name="Profit">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? '#12b76a' : '#f04438'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Intelligence Section ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-ai" />
              <h2 className="text-sm font-semibold text-surface-900">Accora Intelligence</h2>
            </div>
            <Link to="/app/intelligence" className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </div>

        {/* ── Health + Actions + Snapshot ──────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <HealthScore />
          <ActionCenter />
          <BusinessSnapshot />
        </div>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-surface-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { to: '/app/invoices', icon: FileSpreadsheet, label: 'Invoices', desc: 'Manage billing', color: 'text-brand-600 bg-brand-50' },
              { to: '/app/intelligence', icon: Lightbulb, label: 'Insights', desc: 'AI intelligence', color: 'text-ai bg-ai-light' },
              { to: '/app/forecast', icon: Brain, label: 'Forecast', desc: 'AI projections', color: 'text-purple-600 bg-purple-50' },
              { to: '/app/scenarios', icon: Sliders, label: 'What-If', desc: 'Simulate impact', color: 'text-warning bg-warning-light' },
              { to: '/app/reports', icon: FileText, label: 'Reports', desc: 'P&L, cash flow', color: 'text-positive bg-positive-light' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.to} to={a.to}
                  className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 hover:shadow-md active:scale-[0.98] transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${a.color.split(' ')[1]}`}>
                    <Icon className={`w-4 h-4 ${a.color.split(' ')[0]}`} />
                  </div>
                  <p className="text-sm font-medium text-surface-900">{a.label}</p>
                  <p className="text-[10px] text-surface-400">{a.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Forecast ──────────────────────────────────────────── */}
        <ForecastSection />
      </div>

      {/* ── Copilot Panel ──────────────────────────────────────── */}
      <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* ── Floating Copilot Button (mobile) ──────────────────── */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full bg-ai text-white shadow-lg flex items-center justify-center z-30 hover:bg-ai/90 active:scale-95 transition-all"
        aria-label="Open AI Copilot"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </>
  );
}
