import { useState, useEffect } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { useTheme, type ThemeMode } from '../store/ThemeProvider';
import type { AppSettings } from '../types';
import { clsx } from 'clsx';
import {
  Settings,
  Save,
  Building2,
  User,
  Brain,
  RotateCcw,
  CheckCircle2,
  Sun,
  Moon,
  Contrast,
  Wallet,
  TrendingUp,
  Landmark,
  Target,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'CAD', 'AUD', 'INR'];
const REVENUE_RANGES = [
  'Pre-revenue',
  '< $10K / month',
  '$10K - $50K / month',
  '$50K - $100K / month',
  '$100K - $250K / month',
  '$250K - $500K / month',
  '$500K - $1M / month',
  '> $1M / month',
];
const BUSINESS_TYPES = [
  'SaaS / Software',
  'E-commerce / Retail',
  'Consulting / Professional Services',
  'Agency / Marketing',
  'Healthcare / Biotech',
  'Manufacturing / Logistics',
  'Financial Services',
  'Sole Proprietorship',
  'Other',
];
const FISCAL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const RISK_LEVELS = ['conservative', 'moderate', 'aggressive'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const VIEWS = ['dashboard', 'analytics', 'invoices', 'transactions'];

function normalizeSettings(s: AppSettings): AppSettings {
  return {
    ...s,
    business: {
      business_name: s.business?.business_name || '',
      industry: s.business?.industry || '',
      business_type: s.business?.business_type || '',
      country: s.business?.country || 'United States',
      currency: s.business?.currency || 'USD',
      fiscal_year_start: s.business?.fiscal_year_start || 'January',
      business_start_date: s.business?.business_start_date || '',
      employee_count: Number(s.business?.employee_count) || 1,
      opening_cash_balance: Number(s.business?.opening_cash_balance) || 0,
      avg_monthly_revenue: Number(s.business?.avg_monthly_revenue) || 0,
      monthly_fixed_expenses: Number(s.business?.monthly_fixed_expenses) || 0,
      monthly_variable_expenses: Number(s.business?.monthly_variable_expenses) || 0,
      outstanding_ar: Number(s.business?.outstanding_ar) || 0,
      outstanding_ap: Number(s.business?.outstanding_ap) || 0,
      loan_balance: Number(s.business?.loan_balance) || 0,
      monthly_loan_repayment: Number(s.business?.monthly_loan_repayment) || 0,
      expected_growth_rate: Number(s.business?.expected_growth_rate) || 0,
      financial_goals: s.business?.financial_goals || '',
      onboarding_completed: Boolean(s.business?.onboarding_completed ?? true),
      monthly_revenue_range: s.business?.monthly_revenue_range || REVENUE_RANGES[2],
    },
    preferences: { ...s.preferences },
    ai_preferences: { ...s.ai_preferences },
  };
}

export default function SettingsPage() {
  const { settings, updateSettings } = useFinancial();
  const [form, setForm] = useState<AppSettings | null>(() => (settings ? normalizeSettings(settings) : null));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !form) {
      setForm(normalizeSettings(settings));
    }
  }, [settings, form]);

  if (!form) return null;

  const numVal = (val: unknown) => {
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const handleSave = async () => {
    if (saving) return;
    setErrorMessage(null);

    // Validation
    if (!form.business.business_name.trim()) {
      setErrorMessage('Business name cannot be empty.');
      return;
    }
    if (
      numVal(form.business.opening_cash_balance) < 0 ||
      numVal(form.business.avg_monthly_revenue) < 0 ||
      numVal(form.business.monthly_fixed_expenses) < 0 ||
      numVal(form.business.monthly_variable_expenses) < 0 ||
      numVal(form.business.outstanding_ar) < 0 ||
      numVal(form.business.outstanding_ap) < 0 ||
      numVal(form.business.loan_balance) < 0 ||
      numVal(form.business.monthly_loan_repayment) < 0
    ) {
      setErrorMessage('Financial amounts cannot be negative.');
      return;
    }

    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setForm({
        ...settings,
        business: { ...settings.business },
        preferences: { ...settings.preferences },
        ai_preferences: { ...settings.ai_preferences },
      });
      setErrorMessage(null);
    }
  };

  const baselineRev = numVal(form.business.avg_monthly_revenue);
  const baselineExp =
    numVal(form.business.monthly_fixed_expenses) + numVal(form.business.monthly_variable_expenses);
  const baselineProfit = baselineRev - baselineExp;
  const baselineMargin = baselineRev > 0 ? ((baselineProfit / baselineRev) * 100).toFixed(1) : '0.0';
  const baselineNetCash = baselineProfit - numVal(form.business.monthly_loan_repayment);

  return (
    <div className="p-4 md:p-6 pb-28 md:pb-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 pb-4 font-sans">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand-100 border border-brand-200 text-brand-600 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-surface-900 font-sans">
                Settings &amp; Business Profile
              </h1>
              <p className="text-xs text-surface-500 mt-0.5 font-sans">
                Manage your business profile, baseline financial parameters, notifications, and workspace preferences.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 font-sans">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-surface-600 hover:bg-surface-100 border border-surface-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved Successfully' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Banner / Feedback */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to save settings</p>
            <p className="text-rose-700 dark:text-rose-300">{errorMessage}</p>
          </div>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Business profile and financial parameters updated successfully across Accora Core.</span>
        </div>
      )}

      {/* Section 1: Appearance */}
      <AppearanceSection />

      {/* Section 2: Business Identity & Operations */}
      <Section
        icon={Building2}
        title="Business Identity & Operations"
        description="Core legal and operational details defining your business workspace."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Business Name" required description="Official legal or trading name">
            <input
              value={form.business.business_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, business_name: e.target.value },
                })
              }
              placeholder="e.g. Acme Technologies Ltd"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </Field>

          <Field label="Industry" description="Primary operational sector">
            <input
              value={form.business.industry}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, industry: e.target.value },
                })
              }
              placeholder="e.g. Enterprise SaaS, FinTech, Retail"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Business Type" description="Corporate structure">
            <select
              value={form.business.business_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, business_type: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            >
              <option value="">Select structure...</option>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Country" description="Tax jurisdiction / base">
            <input
              value={form.business.country}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, country: e.target.value },
                })
              }
              placeholder="e.g. United States, Pakistan, UK"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </Field>

          <Field label="Base Currency" description="Formatting for all financial reports">
            <select
              value={form.business.currency}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, currency: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 font-medium"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Total Employees" description="Headcount for burn analysis">
            <input
              type="number"
              min={1}
              value={form.business.employee_count}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, employee_count: parseInt(e.target.value) || 1 },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </Field>

          <Field label="Business Start Date" description="Incorporation or founding date">
            <input
              type="date"
              value={form.business.business_start_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, business_start_date: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </Field>

          <Field label="Fiscal Year Start Month" description="Beginning of accounting cycle">
            <select
              value={form.business.fiscal_year_start}
              onChange={(e) =>
                setForm({
                  ...form,
                  business: { ...form.business, fiscal_year_start: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            >
              {FISCAL_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Section 3: Cash & Working Capital */}
      <Section
        icon={Wallet}
        title="Cash & Working Capital"
        description="Opening bank position and current outstanding balances."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label={`Current Cash & Bank Balance (${form.business.currency})`}
            description="Starting reconciled balance across all bank accounts"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.opening_cash_balance}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      opening_cash_balance: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>

          <Field
            label={`Outstanding Accounts Receivable (${form.business.currency})`}
            description="Total uncollected customer invoices"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.outstanding_ar}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      outstanding_ar: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>

          <Field
            label={`Outstanding Accounts Payable (${form.business.currency})`}
            description="Total unpaid supplier and vendor bills"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.outstanding_ap}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      outstanding_ap: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* Section 4: Monthly Run Rate (Baseline Estimates) */}
      <Section
        icon={TrendingUp}
        title="Monthly Financial Run Rate (Baseline Estimates)"
        description="Used as baseline figures for runway and forecasts until sufficient dated transactions are recorded."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label={`Average Monthly Revenue (${form.business.currency})`}
            description="Baseline expected monthly top-line"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.avg_monthly_revenue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      avg_monthly_revenue: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>

          <Field
            label={`Monthly Fixed Expenses (${form.business.currency})`}
            description="Salaries, rent, software licenses, utilities"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.monthly_fixed_expenses}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      monthly_fixed_expenses: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>

          <Field
            label={`Monthly Variable Expenses (${form.business.currency})`}
            description="Marketing spend, COGS, contractors, travel"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.monthly_variable_expenses}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      monthly_variable_expenses: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>
        </div>

        {/* Calculated Baseline Card */}
        <div className="p-4 bg-surface-100/70 dark:bg-surface-800/50 border border-surface-200/80 dark:border-surface-700/60 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-surface-500 block text-[11px] uppercase tracking-wider font-semibold">Total Monthly Burn:</span>
            <span className="font-mono font-bold text-surface-800 dark:text-slate-200 text-sm">
              {form.business.currency} {baselineExp.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-surface-500 block text-[11px] uppercase tracking-wider font-semibold">Baseline Profit:</span>
            <span
              className={clsx(
                'font-mono font-bold text-sm',
                baselineProfit >= 0 ? 'text-positive' : 'text-risk',
              )}
            >
              {baselineProfit >= 0 ? '+' : ''}
              {form.business.currency} {baselineProfit.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-surface-500 block text-[11px] uppercase tracking-wider font-semibold">Estimated Margin:</span>
            <span className="font-mono font-bold text-warning text-sm">{baselineMargin}%</span>
          </div>
          <div>
            <span className="text-surface-500 block text-[11px] uppercase tracking-wider font-semibold">Net Cash Flow:</span>
            <span
              className={clsx(
                'font-mono font-bold text-sm',
                baselineNetCash >= 0 ? 'text-positive' : 'text-risk',
              )}
            >
              {baselineNetCash >= 0 ? '+' : ''}
              {form.business.currency} {baselineNetCash.toLocaleString()}
            </span>
          </div>
        </div>

        <Field label="Monthly Revenue Classification" description="Cohort benchmarking">
          <select
            value={form.business.monthly_revenue_range}
            onChange={(e) =>
              setForm({
                ...form,
                business: {
                  ...form.business,
                  monthly_revenue_range: e.target.value,
                },
              })
            }
            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          >
            {REVENUE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      {/* Section 5: Financing & Debt */}
      <Section
        icon={Landmark}
        title="Financing & Debt Obligations"
        description="Track active liabilities and debt service impacts on true cash flow."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={`Total Outstanding Loan Balance (${form.business.currency})`}
            description="Principal remaining on bank loans or lines of credit"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.loan_balance}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      loan_balance: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>

          <Field
            label={`Monthly Loan Repayment (${form.business.currency})`}
            description="Monthly principal & interest payment deducted from cash flow"
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-medium">
                {form.business.currency}
              </span>
              <input
                type="number"
                step="any"
                min={0}
                value={form.business.monthly_loan_repayment}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      monthly_loan_repayment: numVal(e.target.value),
                    },
                  })
                }
                className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* Section 6: Goals & Projections */}
      <Section
        icon={Target}
        title="Goals & Growth Projections"
        description="Guides the AI Copilot to deliver strategic advice aligned with your milestones."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Field
              label="Target Annual Growth Rate (%)"
              description="Projected annual expansion rate"
            >
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={500}
                  value={form.business.expected_growth_rate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      business: {
                        ...form.business,
                        expected_growth_rate: numVal(e.target.value),
                      },
                    })
                  }
                  className="w-full pr-8 px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-surface-400 font-semibold">%</span>
              </div>
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field
              label="Financial & Strategic Goals"
              description="e.g. Reach profitability by Q4, secure $500k seed, maintain 6-month cash reserve"
            >
              <textarea
                rows={3}
                value={form.business.financial_goals}
                onChange={(e) =>
                  setForm({
                    ...form,
                    business: {
                      ...form.business,
                      financial_goals: e.target.value,
                    },
                  })
                }
                placeholder="Describe your current targets, capital requirements, and milestones..."
                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none"
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Section 7: User Preferences */}
      <Section icon={User} title="User Preferences" description="Configure application layout and localized formatting.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date Format">
            <select
              value={form.preferences.date_format}
              onChange={(e) =>
                setForm({
                  ...form,
                  preferences: { ...form.preferences, date_format: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            >
              {DATE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Default Landing Route">
            <select
              value={form.preferences.default_view}
              onChange={(e) =>
                setForm({
                  ...form,
                  preferences: { ...form.preferences, default_view: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            >
              {VIEWS.map((v) => (
                <option key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Toggle
          label="Compact Density"
          description="Tighten vertical table and card padding to display more information on screen"
          checked={form.preferences.compact_mode}
          onChange={(v) =>
            setForm({
              ...form,
              preferences: { ...form.preferences, compact_mode: v },
            })
          }
        />
      </Section>

      {/* Section 8: AI Preferences */}
      <Section
        icon={Brain}
        title="AI Copilot Preferences"
        description="Fine-tune how Accora Core's intelligence engine analyzes risks and delivers recommendations."
      >
        <Toggle
          label="Proactive Financial Insights"
          description="Automatically evaluate trends and surface anomaly detections on dashboard load"
          checked={form.ai_preferences.proactive_insights}
          onChange={(v) =>
            setForm({
              ...form,
              ai_preferences: { ...form.ai_preferences, proactive_insights: v },
            })
          }
        />
        <Field label="Forecast Horizon (months)" description="Length of machine-learning forecast extrapolation">
          <input
            type="number"
            min={1}
            max={24}
            value={form.ai_preferences.forecast_horizon_months}
            onChange={(e) =>
              setForm({
                ...form,
                ai_preferences: {
                  ...form.ai_preferences,
                  forecast_horizon_months: parseInt(e.target.value) || 3,
                },
              })
            }
            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />
        </Field>
        <Field label="Risk Profile Tolerance" description="Defines recommendation sensitivity for runway buffers">
          <div className="flex items-center gap-2">
            {RISK_LEVELS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    ai_preferences: { ...form.ai_preferences, risk_tolerance: r },
                  })
                }
                className={clsx(
                  'flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-center border',
                  form.ai_preferences.risk_tolerance === r
                    ? 'bg-brand-600 text-white font-bold border-brand-600 shadow-sm'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200/80 dark:border-surface-700/60 hover:bg-surface-200 dark:hover:bg-surface-700',
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Bottom Save Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-200/70 dark:border-surface-800">
        <p className="text-xs text-surface-500 dark:text-surface-400">
          All financial changes persist directly in your isolated SQLite database.
        </p>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200/80 dark:border-surface-700/60 rounded-lg transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved Changes!' : saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 sm:p-6 space-y-4 border border-surface-200 transition-all font-sans">
      <div className="flex items-start gap-3 pb-3 border-b border-surface-200/70">
        <div className="p-2 bg-brand-100 border border-brand-200 rounded-lg text-brand-600 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-surface-900 tracking-tight font-sans">{title}</h2>
          {description && <p className="text-xs text-surface-500 mt-0.5 font-sans">{description}</p>}
        </div>
      </div>
      <div className="space-y-4 pt-1">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  description,
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-surface-700 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {description && (
          <span className="text-[11px] text-surface-400 hidden sm:inline" title={description}>
            <HelpCircle className="w-3 h-3 inline mr-1 text-surface-400" />
            {description}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 font-sans">
      <div>
        <p className="text-sm font-semibold text-surface-900">{label}</p>
        <p className="text-xs text-surface-500">{description}</p>
      </div>
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer',
          checked ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-700',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'left-5.5' : 'left-0.5',
          )}
        />
      </button>
    </div>
  );
}

const THEME_OPTIONS: { key: ThemeMode; icon: React.ElementType; label: string; desc: string }[] = [
  { key: 'light', icon: Sun, label: 'Light Command', desc: 'Pearlescent canvas with soft lavender tinting and crisp command-center elevation' },
  { key: 'dark', icon: Moon, label: 'Dark Command', desc: 'Deep midnight obsidian with sleek soft violet glow and futuristic AI command accents' },
  { key: 'high-contrast', icon: Contrast, label: 'High Contrast Matrix', desc: 'High-definition optical precision with razor-sharp borders and accessible semantic indicators' },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 sm:p-6 space-y-4 border border-surface-200 transition-all font-sans">
      <div className="flex items-center gap-2.5 pb-2 border-b border-surface-200/70">
        <div className="p-2 bg-brand-100 border border-brand-200 rounded-lg text-brand-600 shrink-0">
          <Sun className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-surface-900 tracking-tight font-sans">Theme &amp; Appearance</h2>
          <p className="text-xs text-surface-500 font-sans">Choose how Accora Core displays across your financial workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              className={clsx(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer text-center font-sans',
                active
                  ? 'border-brand-600 bg-brand-100/60 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 shadow-xs'
                  : 'border-surface-200 hover:border-surface-300 bg-surface-card text-surface-700',
              )}
            >
              <Icon className={clsx('w-6 h-6', active ? 'text-brand-600 dark:text-brand-300' : 'text-surface-400')} />
              <span className={clsx('text-xs font-bold tracking-tight', active ? 'text-brand-700 dark:text-brand-200' : 'text-surface-900')}>
                {opt.label}
              </span>
              <span className="text-[10px] text-surface-500 leading-tight">{opt.desc}</span>
              {active && (
                <div className="absolute top-2.5 right-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-300" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
