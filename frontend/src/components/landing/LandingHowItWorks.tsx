import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Cpu,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function LandingHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Connect or Enter Financial Records',
      subtitle: 'Effortless Ledger Ingestion',
      icon: UploadCloud,
      color: 'from-violet-500 to-sky-500',
      description:
        'Log your operational transactions and client invoices. Accora accommodates recurring retainers, variable project income, vendor tools, and payroll with automatic tax calculations.',
      details: [
        'Organized income & expense taxonomy',
        'Invoice tracking with status workflows',
        'Instant multi-period baseline initialization',
      ],
    },
    {
      step: '02',
      title: 'Continuous Analytics Computation',
      subtitle: 'Deterministic Mathematical Core',
      icon: Cpu,
      color: 'from-sky-500 to-indigo-500',
      description:
        'Our analytics engine aggregates your ledger into monthly cash balances, burn rate trends, margin variance, and a multi-dimensional Business Health Score (0-100).',
      details: [
        'Strictly deterministic mathematical engine',
        '5-dimension business health evaluation',
        'Automatic month-over-month variance tracking',
      ],
    },
    {
      step: '03',
      title: 'Autonomous AI Synthesis & Forecasts',
      subtitle: 'Grounded Copilot Intelligence',
      icon: Sparkles,
      color: 'from-indigo-500 to-fuchsia-500',
      description:
        'Accora’s AI provider continuously evaluates your numbers against historical thresholds. It detects if expense acceleration is eating into margins and projects cash flows 3-6 months ahead.',
      details: [
        'Proactive anomaly & risk surfacing',
        'Predictive revenue & cash flow trajectories',
        'Natural-language Q&A grounded in verified records',
      ],
    },
    {
      step: '04',
      title: 'Execute High-Impact Strategic Moves',
      subtitle: 'Empirical Decision Support',
      icon: CheckCircle2,
      color: 'from-fuchsia-500 to-violet-500',
      description:
        'Instead of generic advice, Accora issues prioritized "Next Best Moves" with calculated bottom-line impacts — helping you convert project clients to retainers or rein in operational bloat.',
      details: [
        'Quantified financial upside for every directive',
        'What-If simulator to stress-test hires & pricing',
        'Actionable checklists tailored to small businesses',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#040714] relative overflow-hidden border-t border-indigo-950/80">
      {/* Background galaxy accents */}
      <div className="absolute top-1/3 right-0 w-[550px] h-[550px] bg-violet-600/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-sky-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-25" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-20 font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span>Methodology</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How Accora Operates
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            From raw transaction records to decisive capital allocation in four straightforward steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative rounded-2xl bg-[#080d24]/90 border border-violet-500/20 p-6 sm:p-7 flex flex-col justify-between hover:border-violet-400/40 hover:bg-[#0b1230] transition-all duration-300 shadow-xl shadow-black/40 overflow-hidden group"
              >
                {/* Glowing step sequence number */}
                <div className="absolute -top-3 -right-2 text-6xl font-extrabold text-white/[0.04] group-hover:text-violet-400/[0.08] transition-colors select-none font-mono">
                  {s.step}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-sky-600/10 border border-violet-400/30 flex items-center justify-center text-violet-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-violet-300 px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/30">
                      STEP {s.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-200 transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-[11px] font-mono text-violet-300/80 uppercase tracking-wider mb-4">
                    {s.subtitle}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  {s.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Interactive Flow Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#070c20]/95 border border-violet-500/20 flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Experience the full workflow hands-on</h4>
            <p className="text-xs text-slate-400">
              The live demo is fully interactive. You can record transactions, create invoices, and inspect updated AI forecasts immediately.
            </p>
          </div>
          <Link
            to="/app"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-900/40 transition-all"
          >
            <span>Launch Live App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
