import { useState } from 'react';
import { useFinancial } from '../store/FinancialStore';
import * as api from '../services/api';
import type { WhatIfResult } from '../types';
import { fmtCurrency } from '../utils/format';
import { clsx } from 'clsx';
import {
  TrendingUp, TrendingDown, Sliders, ArrowRight, Brain, DollarSign, PiggyBank, Activity, RotateCcw, Info, AlertTriangle,
} from 'lucide-react';

const PRESETS_BASE = [
  { label: 'Revenue +10%', params: { revenue_change_pct: 10, expense_change_pct: 0 } },
  { label: 'Revenue -20%', params: { revenue_change_pct: -20, expense_change_pct: 0 } },
  { label: 'Expenses -15%', params: { revenue_change_pct: 0, expense_change_pct: -15 } },
  { label: 'Expenses +25%', params: { revenue_change_pct: 0, expense_change_pct: 25 } },
];

const SALARY_PRESETS = [
  { label: (c: string) => `Hire at ${c} 80K/mo`, salary: 80000, params: { revenue_change_pct: 0, expense_change_pct: 0, monthly_salary: 80000 } },
  { label: (_c: string) => `Grow 20% + Hire`, salary: 120000, params: { revenue_change_pct: 20, expense_change_pct: 0, monthly_salary: 120000 } },
];

export default function ScenariosPage() {
  const { latest, health, business } = useFinancial();
  const currency = business?.currency ?? 'PKR';
  const [revenueChange, setRevenueChange] = useState(0);
  const [expenseChange, setExpenseChange] = useState(0);
  const [additionalCost, setAdditionalCost] = useState(0);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScenario = async (desc: string, params: Record<string, number>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.whatIfAnalysis({
        scenario_type: 'custom',
        description: desc,
        params,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRun = () => {
    const desc = `Revenue ${revenueChange >= 0 ? '+' : ''}${revenueChange}%, Expenses ${expenseChange >= 0 ? '+' : ''}${expenseChange}%${additionalCost ? `, +${currency} ${additionalCost.toLocaleString()}/mo` : ''}`;
    runScenario(desc, { revenue_change_pct: revenueChange, expense_change_pct: expenseChange, monthly_salary: additionalCost });
  };

  const applyPreset = (preset: { label: string; params: Record<string, number> }) => {
    setRevenueChange(preset.params.revenue_change_pct || 0);
    setExpenseChange(preset.params.expense_change_pct || 0);
    setAdditionalCost(preset.params.monthly_salary || 0);
    runScenario(preset.label, preset.params);
  };

  const delta = (current: number, projected: number) => {
    const diff = projected - current;
    const pct = current ? ((diff / current) * 100).toFixed(1) : '0';
    return { diff, pct, positive: diff >= 0 };
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              What If?
            </h1>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Simulate business decisions and see the impact
          </p>
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-2.5">
          Quick Scenarios
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS_BASE.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className="px-3.5 py-2 bg-surface-card border border-surface-200 hover:border-brand-500/40 hover:bg-surface-50 rounded-xl text-xs font-semibold text-surface-700 dark:text-surface-300 transition-all cursor-pointer shadow-2xs">
              {p.label}
            </button>
          ))}
          {SALARY_PRESETS.map((p) => (
            <button key={p.salary} onClick={() => applyPreset({ label: p.label(currency), params: p.params })}
              className="px-3.5 py-2 bg-surface-card border border-surface-200 hover:border-brand-500/40 hover:bg-surface-50 rounded-xl text-xs font-semibold text-surface-700 dark:text-surface-300 transition-all cursor-pointer shadow-2xs">
              {p.label(currency)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Controls */}
      <div className="relative overflow-hidden bg-surface-card rounded-[var(--radius-card)] border border-surface-200 dark:border-surface-200/50 shadow-[var(--shadow-card)] p-5 md:p-6 space-y-4 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-600 via-brand-400 to-transparent" />
        <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100">Custom Scenario</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-surface-500 dark:text-surface-400 mb-1.5 block">
              Revenue Change: <strong className="text-surface-900 dark:text-surface-100 font-mono">{revenueChange >= 0 ? '+' : ''}{revenueChange}%</strong>
            </label>
            <input type="range" min={-50} max={50} value={revenueChange} onChange={(e) => setRevenueChange(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-surface-500 dark:text-surface-400 mb-1.5 block">
              Expense Change: <strong className="text-surface-900 dark:text-surface-100 font-mono">{expenseChange >= 0 ? '+' : ''}{expenseChange}%</strong>
            </label>
            <input type="range" min={-50} max={50} value={expenseChange} onChange={(e) => setExpenseChange(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-surface-500 dark:text-surface-400 mb-1.5 block">Additional Monthly Cost</label>
            <input type="number" value={additionalCost || ''} onChange={(e) => setAdditionalCost(Number(e.target.value) || 0)}
              placeholder="0" className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-100/50 border border-surface-200 rounded-lg text-xs md:text-sm text-surface-900 dark:text-surface-100 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
        <button onClick={handleCustomRun} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs md:text-sm font-semibold rounded-xl active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs">
          <Brain className="w-4 h-4" /> Simulate Impact
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-risk-light border border-risk/30 rounded-[var(--radius-card)] p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-risk shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-risk">Scenario failed</p>
            <p className="text-xs text-surface-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && !loading && latest && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100">Scenario: {result.description}</h2>
            <button onClick={() => { setResult(null); setRevenueChange(0); setExpenseChange(0); setAdditionalCost(0); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-surface-600 dark:text-surface-300 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Simulation disclaimer */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">All values are simulated estimates based on current trends. Actual results may vary.</p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Revenue', icon: DollarSign, current: latest.revenue, projected: result.projected_revenue },
              { label: 'Expenses', icon: Activity, current: latest.expenses, projected: result.projected_expenses },
              { label: 'Profit', icon: PiggyBank, current: latest.profit, projected: result.projected_profit },
              { label: 'Cash Flow', icon: TrendingUp, current: latest.cash_flow, projected: result.projected_cash_flow },
            ].map((m) => {
              const d = delta(m.current, m.projected);
              const isGood = m.label === 'Expenses' ? !d.positive : d.positive;
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4 hover:border-surface-300 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-surface-400" />
                    <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">{m.label}</span>
                  </div>
                  <p className="text-sm text-surface-400 tabular-nums font-mono">{fmtCurrency(m.current)}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ArrowRight className="w-3 h-3 text-surface-300" />
                    <span className="text-lg font-bold text-surface-900 dark:text-surface-100 tabular-nums font-mono">{fmtCurrency(m.projected)}</span>
                  </div>
                  <span className={clsx('inline-flex items-center gap-0.5 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded-full font-mono',
                    isGood ? 'bg-positive-light text-positive border border-positive/20' : 'bg-risk-light text-risk border border-risk/20')}>
                    {d.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {d.positive ? '+' : ''}{d.pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Health Score Impact */}
          {health && (
            <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 shadow-[var(--shadow-card)] p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Health Score Impact</p>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="text-2xl font-extrabold text-surface-900 dark:text-surface-100 font-mono">{health.overall.toFixed(0)}</span>
                    <ArrowRight className="w-4 h-4 text-surface-300" />
                    <span className={clsx('text-2xl font-extrabold font-mono',
                      result.projected_health_score >= health.overall ? 'text-positive' : 'text-risk')}>
                      {result.projected_health_score.toFixed(0)}
                    </span>
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full font-mono',
                      result.projected_health_score >= health.overall ? 'bg-positive-light text-positive border border-positive/20' : 'bg-risk-light text-risk border border-risk/20')}>
                      {result.projected_health_score >= health.overall ? '+' : ''}
                      {(result.projected_health_score - health.overall).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Interpretation */}
          <div className="bg-surface-card rounded-[var(--radius-card)] border border-surface-200 p-4 md:p-5 shadow-[var(--shadow-card)] space-y-2">
            <p className="text-xs font-bold text-ai uppercase tracking-wider">AI Analysis</p>
            <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{result.ai_interpretation}</p>
            <p className="text-xs font-semibold text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-200/50 rounded-lg px-3 py-2 inline-block">
              {result.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
