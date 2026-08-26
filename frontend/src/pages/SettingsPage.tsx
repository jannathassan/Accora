import { useState, useEffect } from 'react';
import { useFinancial } from '../store/FinancialStore';
import { useTheme, type ThemeMode } from '../store/ThemeProvider';
import type { AppSettings } from '../types';
import { clsx } from 'clsx';
import { Settings, Save, Building2, User, Brain, RotateCcw, CheckCircle2, Sun, Moon, Contrast } from 'lucide-react';

const CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'INR'];
const REVENUE_RANGES = ['< 100K', '100K - 500K', '500K - 1M', '1M - 5M', '5M - 20M', '20M - 100M', '> 100M'];
const RISK_LEVELS = ['conservative', 'moderate', 'aggressive'];
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const VIEWS = ['dashboard', 'analytics', 'invoices'];

export default function SettingsPage() {
  const { settings, updateSettings } = useFinancial();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm({ ...settings, business: { ...settings.business }, preferences: { ...settings.preferences }, ai_preferences: { ...settings.ai_preferences } });
  }, [settings]);

  if (!form) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    if (settings) setForm({ ...settings, business: { ...settings.business }, preferences: { ...settings.preferences }, ai_preferences: { ...settings.ai_preferences } });
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl font-bold text-surface-900">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <AppearanceSection />

      {/* Business Profile */}
      <Section icon={Building2} title="Business Profile">
        <Field label="Business Name">
          <input value={form.business.business_name} onChange={(e) => setForm({ ...form, business: { ...form.business, business_name: e.target.value } })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
        </Field>
        <Field label="Industry">
          <input value={form.business.industry} onChange={(e) => setForm({ ...form, business: { ...form.business, industry: e.target.value } })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Type">
            <input value={form.business.business_type} onChange={(e) => setForm({ ...form, business: { ...form.business, business_type: e.target.value } })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
          </Field>
          <Field label="Currency">
            <select value={form.business.currency} onChange={(e) => setForm({ ...form, business: { ...form.business, currency: e.target.value } })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-surface-card">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monthly Revenue Range">
            <select value={form.business.monthly_revenue_range} onChange={(e) => setForm({ ...form, business: { ...form.business, monthly_revenue_range: e.target.value } })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-surface-card">
              {REVENUE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Fiscal Year Start">
            <input type="month" value={form.business.fiscal_year_start} onChange={(e) => setForm({ ...form, business: { ...form.business, fiscal_year_start: e.target.value } })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
          </Field>
        </div>
      </Section>

      {/* User Preferences */}
      <Section icon={User} title="Preferences">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date Format">
            <select value={form.preferences.date_format} onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, date_format: e.target.value } })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-surface-card">
              {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Default View">
            <select value={form.preferences.default_view} onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, default_view: e.target.value } })}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-surface-card">
              {VIEWS.map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
            </select>
          </Field>
        </div>
        <Toggle
          label="Compact Mode"
          description="Reduce spacing and padding across the interface"
          checked={form.preferences.compact_mode}
          onChange={(v) => setForm({ ...form, preferences: { ...form.preferences, compact_mode: v } })}
        />
      </Section>

      {/* AI Preferences */}
      <Section icon={Brain} title="AI Preferences">
        <Toggle
          label="Proactive Insights"
          description="Automatically generate insights and recommendations"
          checked={form.ai_preferences.proactive_insights}
          onChange={(v) => setForm({ ...form, ai_preferences: { ...form.ai_preferences, proactive_insights: v } })}
        />
        <Field label="Forecast Horizon (months)">
          <input type="number" min={1} max={24} value={form.ai_preferences.forecast_horizon_months}
            onChange={(e) => setForm({ ...form, ai_preferences: { ...form.ai_preferences, forecast_horizon_months: parseInt(e.target.value) || 3 } })}
            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
        </Field>
        <Field label="Risk Tolerance">
          <div className="flex items-center gap-2">
            {RISK_LEVELS.map((r) => (
              <button key={r} onClick={() => setForm({ ...form, ai_preferences: { ...form.ai_preferences, risk_tolerance: r } })}
                className={clsx('flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-center',
                  form.ai_preferences.risk_tolerance === r ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </Field>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Settings; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-semibold text-surface-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-surface-600 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-surface-800">{label}</p>
        <p className="text-xs text-surface-400">{description}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={clsx('relative w-10 h-5.5 rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-surface-300')}>
        <span className={clsx('absolute top-0.5 w-4.5 h-4.5 rounded-full bg-surface-50 shadow transition-transform',
          checked ? 'left-5' : 'left-0.5')} />
      </button>
    </div>
  );
}

const THEME_OPTIONS: { key: ThemeMode; icon: typeof Sun; label: string; desc: string }[] = [
  { key: 'light', icon: Sun, label: 'Light', desc: 'Clean and bright professional interface' },
  { key: 'dark', icon: Moon, label: 'Dark', desc: 'Comfortable in low light, premium feel' },
  { key: 'high-contrast', icon: Contrast, label: 'High Contrast', desc: 'Maximum readability and accessibility' },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sun className="w-4 h-4 text-brand-600" />
        <h2 className="text-sm font-semibold text-surface-900">Appearance</h2>
      </div>
      <p className="text-xs text-surface-500">Choose how Accora looks. Your preference is saved automatically.</p>

      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setTheme(opt.key)}
              className={clsx(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                active
                  ? 'border-brand-600 bg-brand-50 shadow-sm'
                  : 'border-surface-200 hover:border-surface-300 bg-surface-card',
              )}
            >
              <Icon className={clsx('w-6 h-6', active ? 'text-brand-600' : 'text-surface-500')} />
              <span className={clsx('text-sm font-semibold', active ? 'text-brand-700' : 'text-surface-700')}>
                {opt.label}
              </span>
              <span className="text-[10px] text-center text-surface-500 leading-tight">{opt.desc}</span>
              {active && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
