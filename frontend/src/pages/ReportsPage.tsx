import { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { fmtCurrency } from '../utils/format';
import type { PLReport, ExpenseReport, CashFlowReport, BusinessSummary } from '../types';
import { clsx } from 'clsx';
import {
  FileText, TrendingUp, TrendingDown, DollarSign, PiggyBank, Waves,
  BarChart3, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, AlertTriangle, RefreshCcw,
  Download, Printer,
} from 'lucide-react';

const TABS = [
  { key: 'pnl', label: 'Profit & Loss', icon: DollarSign },
  { key: 'expenses', label: 'Expense Analysis', icon: BarChart3 },
  { key: 'cashflow', label: 'Cash Flow', icon: Waves },
  { key: 'summary', label: 'Business Summary', icon: Sparkles },
];

const PERIOD_OPTIONS = [
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '12 Months', value: 12 },
];

const CATEGORY_COLORS = ['#3378ff', '#12b76a', '#f79009', '#7c3aed', '#f04438', '#06aed4', '#ee442f', '#2e90fa'];

function exportCSV(tab: string, data: unknown) {
  if (!data) return;
  const rows: string[][] = [];
  if (tab === 'pnl') {
    const d = data as PLReport;
    rows.push(['Metric', 'Value']);
    rows.push(['Revenue', String(d.revenue)]);
    rows.push(['Expenses', String(d.expenses)]);
    rows.push(['Net Profit', String(d.net_profit)]);
    rows.push(['Margin', `${(d.margin * 100).toFixed(1)}%`]);
    rows.push([]);
    rows.push(['Category', 'Amount']);
    Object.entries(d.expense_breakdown).forEach(([cat, amt]) => rows.push([cat, String(amt)]));
  } else if (tab === 'expenses') {
    const d = data as ExpenseReport;
    rows.push(['Category', 'Amount', 'Percentage']);
    d.top_categories.forEach((c) => rows.push([c.category, String(c.amount), `${c.pct.toFixed(1)}%`]));
  } else if (tab === 'cashflow') {
    const d = data as CashFlowReport;
    rows.push(['Metric', 'Value']);
    rows.push(['Inflow', String(d.inflow)]);
    rows.push(['Outflow', String(d.outflow)]);
    rows.push(['Net Cash Flow', String(d.net)]);
    rows.push(['Opening Balance', String(d.opening_balance)]);
    rows.push(['Closing Balance', String(d.closing_balance)]);
  }
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accora-${tab}-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [tab, setTab] = useState('pnl');
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, unknown>>(new Map());

  const [pnl, setPnl] = useState<PLReport | null>(null);
  const [expenses, setExpenses] = useState<ExpenseReport | null>(null);
  const [cashflow, setCashflow] = useState<CashFlowReport | null>(null);
  const [summary, setSummary] = useState<BusinessSummary | null>(null);

  useEffect(() => {
    const load = async () => {
      const cacheKey = `${tab}-${months}`;
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        if (tab === 'pnl') setPnl(cached as PLReport);
        else if (tab === 'expenses') setExpenses(cached as ExpenseReport);
        else if (tab === 'cashflow') setCashflow(cached as CashFlowReport);
        else if (tab === 'summary') setSummary(cached as BusinessSummary);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let data: unknown;
        if (tab === 'pnl') { data = await api.getPLReport(months); setPnl(data as PLReport); }
        else if (tab === 'expenses') { data = await api.getExpenseReport(months); setExpenses(data as ExpenseReport); }
        else if (tab === 'cashflow') { data = await api.getCashFlowReport(months); setCashflow(data as CashFlowReport); }
        else if (tab === 'summary') { data = await api.getBusinessSummary(); setSummary(data as BusinessSummary); }
        if (data) cacheRef.current.set(cacheKey, data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load report');
      } finally { setLoading(false); }
    };
    load();
  }, [tab, months]);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      {exportToast && (
        <div className="toast-enter fixed top-4 right-4 z-50 px-4 py-2.5 bg-surface-900 text-white text-sm font-medium rounded-lg shadow-lg">
          {exportToast}
        </div>
      )}
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-brand-600" />
        <h1 className="text-xl font-bold text-surface-900">Reports</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={clsx('inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                tab === t.key ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {tab !== 'summary' && (
            <div className="flex items-center gap-1">
              {PERIOD_OPTIONS.map((p) => (
                <button key={p.value} onClick={() => setMonths(p.value)}
                  className={clsx('px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    months === p.value ? 'bg-surface-800 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200')}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              const data = tab === 'pnl' ? pnl : tab === 'expenses' ? expenses : tab === 'cashflow' ? cashflow : summary;
              exportCSV(tab, data);
              setExportToast('Report exported to CSV');
              setTimeout(() => setExportToast(null), 2500);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-8 h-8 text-risk mb-3" />
          <p className="text-sm text-surface-600 mb-3">Failed to load report: {error}</p>
          <button onClick={() => { setTab(tab); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : (
        <>
          {tab === 'pnl' && pnl && <PLView report={pnl} />}
          {tab === 'expenses' && expenses && <ExpenseView report={expenses} />}
          {tab === 'cashflow' && cashflow && <CashFlowView report={cashflow} />}
          {tab === 'summary' && summary && <SummaryView report={summary} />}
        </>
      )}
    </div>
  );
}

/* ─── P&L Report ─────────────────────────────────────────────────── */
function PLView({ report }: { report: PLReport }) {
  const entries = Object.entries(report.expense_breakdown).sort(([, a], [, b]) => b - a);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Revenue', value: report.revenue, icon: DollarSign, color: 'text-brand-600' },
          { label: 'Expenses', value: report.expenses, icon: TrendingDown, color: 'text-risk' },
          { label: 'Net Profit', value: report.net_profit, icon: PiggyBank, color: report.net_profit >= 0 ? 'text-positive' : 'text-risk' },
          { label: 'Margin', value: null, icon: TrendingUp, color: 'text-surface-900', display: `${(report.margin * 100).toFixed(1)}%` },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-surface-400" />
                <span className="text-xs text-surface-500">{m.label}</span>
              </div>
              <p className={clsx('text-lg font-semibold tabular-nums', m.color)}>
                {m.display ?? fmtCurrency(m.value!)}
              </p>
            </div>
          );
        })}
      </div>
      <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
        <h3 className="text-sm font-semibold text-surface-900 mb-3">Expense Breakdown</h3>
        <div className="space-y-2">
          {entries.map(([cat, amt], i) => {
            const pct = report.expenses ? ((amt / report.expenses) * 100).toFixed(1) : '0';
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span className="text-sm text-surface-700 flex-1">{cat}</span>
                <span className="text-xs text-surface-400 tabular-nums">{pct}%</span>
                <span className="text-sm font-medium text-surface-900 tabular-nums w-24 text-right">{fmtCurrency(amt)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-[10px] text-surface-400 text-center">Period: {report.period}</div>
    </div>
  );
}

/* ─── Expense Report ─────────────────────────────────────────────── */
function ExpenseView({ report }: { report: ExpenseReport }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
          <p className="text-xs text-surface-500 mb-1">Total Expenses</p>
          <p className="text-lg font-semibold text-risk tabular-nums">{fmtCurrency(report.total)}</p>
        </div>
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
          <p className="text-xs text-surface-500 mb-1">Change vs Prior</p>
          <span className={clsx('inline-flex items-center gap-1 text-lg font-semibold tabular-nums',
            report.change_vs_prior <= 0 ? 'text-positive' : 'text-risk')}>
            {report.change_vs_prior <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            {report.change_vs_prior > 0 ? '+' : ''}{(report.change_vs_prior * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
          <p className="text-xs text-surface-500 mb-1">Top Category</p>
          <p className="text-sm font-semibold text-surface-900">
            {report.top_categories[0]?.category ?? '—'}
          </p>
          <p className="text-xs text-surface-400">
            {report.top_categories[0] ? fmtCurrency(report.top_categories[0].amount) : ''}
          </p>
        </div>
      </div>
      <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
        <h3 className="text-sm font-semibold text-surface-900 mb-3">Top Categories</h3>
        <div className="space-y-3">
          {report.top_categories.map((c, i) => (
            <div key={c.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-surface-700">{c.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-surface-400 tabular-nums">{c.pct.toFixed(1)}%</span>
                  <span className="text-sm font-medium text-surface-900 tabular-nums">{fmtCurrency(c.amount)}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(c.pct, 100)}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-[10px] text-surface-400 text-center">Period: {report.period}</div>
    </div>
  );
}

/* ─── Cash Flow Report ───────────────────────────────────────────── */
function CashFlowView({ report }: { report: CashFlowReport }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Inflow', value: report.inflow, color: 'text-positive' },
          { label: 'Outflow', value: report.outflow, color: 'text-risk' },
          { label: 'Net Cash Flow', value: report.net, color: report.net >= 0 ? 'text-positive' : 'text-risk' },
          { label: 'Opening Balance', value: report.opening_balance, color: 'text-surface-900' },
          { label: 'Closing Balance', value: report.closing_balance, color: 'text-surface-900' },
        ].map((m) => (
          <div key={m.label} className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
            <p className="text-xs text-surface-500 mb-1">{m.label}</p>
            <p className={clsx('text-lg font-semibold tabular-nums', m.color)}>{fmtCurrency(m.value)}</p>
          </div>
        ))}
      </div>
      <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
        <h3 className="text-sm font-semibold text-surface-900 mb-3">Cash Flow Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-surface-500 mb-1">Money In</p>
            <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-positive rounded-full" style={{
                width: `${report.inflow + report.outflow ? (report.inflow / (report.inflow + report.outflow)) * 100 : 50}%`,
              }} />
            </div>
            <p className="text-sm font-medium text-positive mt-1 tabular-nums">{fmtCurrency(report.inflow)}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Money Out</p>
            <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full bg-risk rounded-full" style={{
                width: `${report.inflow + report.outflow ? (report.outflow / (report.inflow + report.outflow)) * 100 : 50}%`,
              }} />
            </div>
            <p className="text-sm font-medium text-risk mt-1 tabular-nums">{fmtCurrency(report.outflow)}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Net Position</p>
            <p className={clsx('text-2xl font-bold tabular-nums mt-2',
              report.net >= 0 ? 'text-positive' : 'text-risk')}>
              {report.net >= 0 ? '+' : ''}{fmtCurrency(report.net)}
            </p>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-surface-400 text-center">Period: {report.period}</div>
    </div>
  );
}

/* ─── Business Summary ───────────────────────────────────────────── */
function SummaryView({ report }: { report: BusinessSummary }) {
  return (
    <div className="space-y-4">
      <div className="bg-ai-light rounded-[var(--radius-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-ai" />
          <h3 className="text-sm font-semibold text-surface-900">AI Business Summary</h3>
        </div>
        <p className="text-sm text-surface-700 leading-relaxed">{report.ai_summary}</p>
      </div>
      {report.highlights.length > 0 && (
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h3 className="text-sm font-semibold text-positive mb-3">Highlights</h3>
          <ul className="space-y-2">
            {report.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
                <ArrowUpRight className="w-4 h-4 text-positive shrink-0 mt-0.5" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.concerns.length > 0 && (
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h3 className="text-sm font-semibold text-risk mb-3">Concerns</h3>
          <ul className="space-y-2">
            {report.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
                <ArrowDownRight className="w-4 h-4 text-risk shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.recommendations.length > 0 && (
        <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5">
          <h3 className="text-sm font-semibold text-brand-600 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-surface-700">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-[10px] text-surface-400 text-center">Period: {report.period}</div>
    </div>
  );
}
