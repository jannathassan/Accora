import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Brain,
  TrendingUp,
  Sliders,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LandingFeatures() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'finance' | 'strategy'>('all');

  const features = [
    {
      id: 'dashboard',
      category: 'finance',
      title: 'Executive Financial Dashboard',
      badge: 'Core Command',
      icon: LayoutDashboard,
      iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
      description:
        'A single pane of glass uniting monthly revenue velocity, operating burn limits, net realization margins, and cash flight runway.',
      highlights: ['Real-time revenue & expense curves', 'Profit margin health benchmark', 'Instant 6-card KPI snapshot'],
      appRoute: '/app',
    },
    {
      id: 'transactions',
      category: 'finance',
      title: 'Transaction Tracking & Ledger',
      badge: 'Ledger Engine',
      icon: Receipt,
      iconColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      description:
        'Searchable, filterable ledger covering income streams, operating costs, salaries, and vendor tools. Instant categorization to detect where capital is deployed.',
      highlights: ['Multi-category breakdown', 'Status tracking (Completed, Pending)', 'Instant live ledger recomputation'],
      appRoute: '/app/transactions',
    },
    {
      id: 'invoices',
      category: 'finance',
      title: 'Invoicing & Receivables Management',
      badge: 'Cash Inflow',
      icon: FileSpreadsheet,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      description:
        'Track pending and overdue client receivables. Automated subtotal and tax calculation with rapid status updates to prevent cash flow droughts.',
      highlights: ['Overdue invoice alerts', 'Automated tax calculations', 'Direct cash position updates'],
      appRoute: '/app/invoices',
    },
    {
      id: 'insights',
      category: 'ai',
      title: 'AI-Powered Insights & Anomaly Detection',
      badge: 'Proactive AI',
      icon: Brain,
      iconColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
      description:
        'Autonomous detection of unexpected expense spikes, divergent growth rates, and recurring leakages. Synthesizes trends before they impact your balance sheet.',
      highlights: ['Severity-ranked risk alerts', 'Grounded empirical evidence', 'Direct remedial action directives'],
      appRoute: '/app/intelligence',
    },
    {
      id: 'forecast',
      category: 'ai',
      title: 'Cash-Flow & Revenue Forecasting',
      badge: 'Predictive Model',
      icon: TrendingUp,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description:
        'Forward-looking 3-to-6 month projections comparing historical trends with predictive trajectory lines. Anticipate cash lows weeks before they occur.',
      highlights: ['Dashed projection visualization', 'Confidence boundary modeling', 'Multi-metric forecast (Rev, Exp, Net)'],
      appRoute: '/app/forecast',
    },
    {
      id: 'scenarios',
      category: 'strategy',
      title: 'What-If Scenario Simulator',
      badge: 'Decision Sandbox',
      icon: Sliders,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description:
        'Model pivotal business decisions before committing funds. Test hiring a new full-time employee, adjusting client pricing, or absorbing a 20% revenue drop.',
      highlights: ['Instant delta calculations', 'Impact on Business Health Score', 'One-click quick presets'],
      appRoute: '/app/scenarios',
    },
    {
      id: 'reports',
      category: 'strategy',
      title: 'Executive Financial Reports',
      badge: 'Reporting Suite',
      icon: FileText,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description:
        'Comprehensive Profit & Loss statements, categorical expense distributions, cash flow statements, and AI-authored executive summaries.',
      highlights: ['Multi-period P&L view', 'Expense percentage breakdowns', 'Automated AI business narrative'],
      appRoute: '/app/reports',
    },
  ];

  const filteredFeatures = activeCategory === 'all'
    ? features
    : features.filter((f) => f.category === activeCategory);

  return (
    <section id="features" className="py-24 bg-[#05091a] relative border-t border-indigo-950/80 overflow-hidden">
      {/* Background galaxy lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-r from-violet-900/15 via-indigo-900/15 to-transparent blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Complete Financial Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Seven Pillars of Modern Fintech Operations
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Every capability in Accora is engineered to replace fragmented spreadsheets 
            with an unified, forward-looking financial operating system.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 font-sans">
            {[
              { id: 'all', label: 'All 7 Capabilities' },
              { id: 'ai', label: 'AI Intelligence & Forecasts' },
              { id: 'finance', label: 'Core Finance & Ledger' },
              { id: 'strategy', label: 'Decision Strategy & Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-violet-500/20 text-violet-200 border border-violet-400/40 shadow-sm shadow-violet-500/20'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {filteredFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative rounded-2xl bg-[#090e24]/90 border border-violet-500/20 p-6 sm:p-7 hover:border-violet-400/50 hover:bg-[#0c1330] transition-all duration-300 flex flex-col justify-between shadow-lg shadow-black/40 hover:shadow-violet-950/30 overflow-hidden"
              >
                {/* Subtle top starlight hover beam */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/0 to-transparent group-hover:via-violet-400/60 transition-all pointer-events-none" />

                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${feat.iconColor} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5">
                    {feat.description}
                  </p>

                  {/* Highlights list */}
                  <div className="space-y-2 mb-6 pt-3 border-t border-slate-800/60">
                    {feat.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom link to view in app */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-sans">Live in Accora App</span>
                  <Link
                    to={feat.appRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-300 hover:text-white group-hover:translate-x-0.5 transition-all font-sans"
                  >
                    <span>Experience Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Note */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-indigo-950/40 border border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-slate-300">
              All 7 modules communicate through a unified data bus. An invoice update instantly re-calculates cash flow forecasts and health scores.
            </p>
          </div>
          <Link
            to="/app"
            className="shrink-0 px-4 py-2 rounded-xl bg-violet-900/40 hover:bg-violet-800/60 border border-violet-500/30 text-xs font-semibold text-white transition-colors"
          >
            Open Unified App
          </Link>
        </div>
      </div>
    </section>
  );
}
