import { useState } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { clsx } from 'clsx';
import {
  Building2,
  Wallet,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'CAD', 'AUD', 'INR'];
const BUSINESS_TYPES = [
  'SaaS / Software',
  'E-commerce / Retail',
  'Consulting / Agency',
  'Healthcare / Biotech',
  'Manufacturing',
  'Sole Proprietorship',
  'Other',
];

export default function OnboardingWizardModal() {
  const { business, updateBusiness } = useFinancial();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state pre-populated with existing business data
  const [form, setForm] = useState({
    name: business?.name || '',
    industry: business?.industry || 'Technology',
    business_type: business?.business_type || 'SaaS / Software',
    country: business?.country || 'United States',
    currency: business?.currency || 'USD',
    opening_cash_balance: business?.opening_cash_balance || 0,
    avg_monthly_revenue: business?.avg_monthly_revenue || 0,
    monthly_fixed_expenses: business?.monthly_fixed_expenses || 0,
    monthly_variable_expenses: business?.monthly_variable_expenses || 0,
    loan_balance: business?.loan_balance || 0,
    monthly_loan_repayment: business?.monthly_loan_repayment || 0,
    expected_growth_rate: business?.expected_growth_rate || 15,
    financial_goals: business?.financial_goals || '',
  });

  // Only show if business exists and onboarding_completed is false
  if (!business || business.onboarding_completed) {
    return null;
  }

  const numVal = (val: unknown) => {
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const handleSkip = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateBusiness({ onboarding_completed: true });
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateBusiness({
        name: form.name.trim() || business.name,
        industry: form.industry,
        business_type: form.business_type,
        country: form.country,
        currency: form.currency,
        opening_cash_balance: numVal(form.opening_cash_balance),
        avg_monthly_revenue: numVal(form.avg_monthly_revenue),
        monthly_fixed_expenses: numVal(form.monthly_fixed_expenses),
        monthly_variable_expenses: numVal(form.monthly_variable_expenses),
        loan_balance: numVal(form.loan_balance),
        monthly_loan_repayment: numVal(form.monthly_loan_repayment),
        expected_growth_rate: numVal(form.expected_growth_rate),
        financial_goals: form.financial_goals.trim(),
        onboarding_completed: true,
      });
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface-card rounded-2xl shadow-2xl border border-surface-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Wizard Header */}
        <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600 rounded-xl text-white shadow-sm shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900">Welcome to Accora Core</h2>
              <p className="text-xs text-surface-500">
                Let's set up your business profile & financial baseline in 3 quick steps.
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="text-xs text-surface-400 hover:text-surface-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-surface-200/50 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="px-6 pt-4 pb-2 bg-surface-card border-b border-surface-200/60">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === 1
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : step > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-200 text-surface-500',
                )}
              >
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-xs font-semibold text-surface-800 hidden sm:inline">Identity</span>
            </div>

            <div className={clsx('h-0.5 flex-1 mx-3', step > 1 ? 'bg-emerald-500' : 'bg-surface-200')} />

            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === 2
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-200 text-surface-500',
                )}
              >
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-xs font-semibold text-surface-800 hidden sm:inline">Cash & Run Rate</span>
            </div>

            <div className={clsx('h-0.5 flex-1 mx-3', step > 2 ? 'bg-emerald-500' : 'bg-surface-200')} />

            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === 3
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : 'bg-surface-200 text-surface-500',
                )}
              >
                3
              </div>
              <span className="text-xs font-semibold text-surface-800 hidden sm:inline">Debt & Goals</span>
            </div>
          </div>
        </div>

        {/* Wizard Form Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {/* STEP 1: Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50/50 border border-brand-200/50 rounded-xl text-xs text-brand-900 flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Tell us about your business. You can update any of these details later in Settings.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-800 block mb-1">Business Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Apex Dynamics Ltd"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">Industry</label>
                  <input
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="e.g. Software, E-commerce, FinTech"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">Business Structure</label>
                  <select
                    value={form.business_type}
                    onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">Reporting Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 font-semibold"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">Country</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g. United States, Pakistan, UK"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cash & Run Rate */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50/50 border border-brand-200/50 rounded-xl text-xs text-brand-900 flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Baseline averages help Accora Core project runway and cash status before you import transactions.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-surface-800">
                    Current Cash & Bank Balance ({form.currency})
                  </label>
                  <span className="text-[11px] text-surface-400">Opening working capital</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-surface-400 font-semibold">
                    {form.currency}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.opening_cash_balance}
                    onChange={(e) =>
                      setForm({ ...form, opening_cash_balance: numVal(e.target.value) })
                    }
                    className="w-full pl-12 pr-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Avg Monthly Revenue
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.avg_monthly_revenue}
                    onChange={(e) =>
                      setForm({ ...form, avg_monthly_revenue: numVal(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Monthly Fixed Costs
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.monthly_fixed_expenses}
                    onChange={(e) =>
                      setForm({ ...form, monthly_fixed_expenses: numVal(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Monthly Variable Costs
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.monthly_variable_expenses}
                    onChange={(e) =>
                      setForm({ ...form, monthly_variable_expenses: numVal(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <p className="text-[11px] text-surface-400">
                <HelpCircle className="w-3.5 h-3.5 inline mr-1 text-surface-400" />
                These baseline averages are labeled as estimates in your reports until real dated transactions are imported.
              </p>
            </div>
          )}

          {/* STEP 3: Debt & Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50/50 border border-brand-200/50 rounded-xl text-xs text-brand-900 flex items-center gap-2.5">
                <Target className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Financing information allows Accora Core to distinguish cash flow from accounting profit.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Outstanding Loan Balance ({form.currency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.loan_balance}
                    onChange={(e) =>
                      setForm({ ...form, loan_balance: numVal(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Monthly Loan Repayment ({form.currency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.monthly_loan_repayment}
                    onChange={(e) =>
                      setForm({ ...form, monthly_loan_repayment: numVal(e.target.value) })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Target Growth Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={form.expected_growth_rate}
                      onChange={(e) =>
                        setForm({ ...form, expected_growth_rate: numVal(e.target.value) })
                      }
                      className="w-full pr-8 px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-surface-400 font-semibold">%</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-surface-800 block mb-1">
                    Primary Financial Objective
                  </label>
                  <input
                    value={form.financial_goals}
                    onChange={(e) => setForm({ ...form, financial_goals: e.target.value })}
                    placeholder="e.g. Expand gross margin to 35%, secure angel round"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-surface-card text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Actions */}
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50/60 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-200/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="px-3.5 py-2 text-xs font-medium text-surface-600 hover:bg-surface-200/50 rounded-lg transition-colors"
            >
              Skip Setup
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-all shadow-sm active:scale-[0.98]"
              >
                {submitting ? 'Setting Up...' : 'Save & Launch Workspace'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
