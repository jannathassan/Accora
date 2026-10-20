import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Brain,
  Activity,
  Sliders,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export default function LandingProductPreview() {
  const [activeTab, setActiveTab] = useState<'copilot' | 'health' | 'move' | 'whatif'>('copilot');

  // Copilot Mock State
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const copilotQuestions = [
    {
      q: 'Can I afford to hire an engineer at PKR 80,000/month?',
      answer:
        'Yes. Based on your current cash balance of PKR 2,990,000 and monthly net surplus of PKR 390,353, an additional PKR 80,000/month salary will consume approximately 20.5% of your monthly profit buffer while maintaining over 6.8 months of operational runway.',
      evidence: [
        'Current monthly net profit: PKR 390,353',
        'Available cash reserve: PKR 2,990,000 (7.6 months runway)',
        'Proposed salary impact: 20.5% of current monthly surplus',
        'Projected post-hire margin: 20.0% (safely at benchmark)',
      ],
      interpretation:
        'The hiring decision is sustainable without debt or external financing provided the engineer assists in unlocking client project delivery velocity within 90 days.',
      recommendation:
        'Proceed with the hire. Establish 90-day delivery milestones directly tied to Client Projects revenue (your largest income stream at 55%).',
      followUps: [
        'How does this affect my 6-month cash forecast?',
        'What if revenue drops 10% after hiring?',
      ],
    },
    {
      q: 'Why did our profit margin compress this month?',
      answer:
        'Your profit margin compressed from 27.4% to 25.2% due to expense growth (+4.6% MoM) outpacing revenue expansion (+3.4% MoM). Specifically, Operations costs grew by PKR 35,000 and Marketing spend accelerated by 24%.',
      evidence: [
        'MoM Expense Growth: +4.6% (PKR 1,161,400 total)',
        'MoM Revenue Growth: +3.4% (PKR 1,551,500 total)',
        'Operations: 36% of all expenses (PKR 420,000)',
        'Marketing: Spike of PKR 44,400 with lagged return',
      ],
      interpretation:
        'While your business remains solidly in profit, discretionary operational expenses are growing at twice the rate of top-line revenue over the last 60 days.',
      recommendation:
        'Review recent recurring software licenses and vendor agreements. Freezing non-essential SaaS seats can recover ~PKR 25,000/mo instantly.',
      followUps: [
        'Show categorical expense breakdown',
        'What is our projected margin next month?',
      ],
    },
    {
      q: 'Which invoices are currently overdue and need collection?',
      answer:
        'You have 2 overdue client invoices totaling PKR 305,000. Horizon Labs (INV-1006) is 45 days past due for PKR 210,000, and ClearView Analytics (INV-1005) is overdue for PKR 95,000.',
      evidence: [
        'INV-1006: Horizon Labs — PKR 210,000 (Due Aug 1, 2026)',
        'INV-1005: ClearView Analytics — PKR 95,000 (Due Jul 15, 2026)',
        'Total overdue receivables: PKR 305,000',
        'Pending receivables (not yet due): PKR 350,000',
      ],
      interpretation:
        'Collecting these two accounts will immediately boost your liquid cash balance from PKR 2.99M to PKR 3.29M, expanding your runway by approximately 0.8 months.',
      recommendation:
        'Send an automated payment reminder to ClearView Analytics and schedule a direct management check-in with Horizon Labs regarding INV-1006.',
      followUps: [
        'Draft a polite follow-up email for Horizon Labs',
        'View cash flow impact if paid this week',
      ],
    },
  ];

  // What-If Sandbox State
  const [whatIfRev, setWhatIfRev] = useState(10);
  const [whatIfExp, setWhatIfExp] = useState(0);
  const [whatIfSalary, setWhatIfSalary] = useState(0);

  // Baseline data
  const baseRev = 1551500;
  const baseExp = 1161400;
  const baseProfit = baseRev - baseExp;
  const baseHealth = 78;

  // Real-time calculation
  const projRev = Math.round(baseRev * (1 + whatIfRev / 100));
  const projExp = Math.round(baseExp * (1 + whatIfExp / 100) + whatIfSalary);
  const projProfit = projRev - projExp;
  const projMargin = ((projProfit / projRev) * 100).toFixed(1);
  const profitDelta = projProfit - baseProfit;
  const healthDelta = Math.round((profitDelta / baseProfit) * 20);
  const projHealth = Math.max(10, Math.min(100, baseHealth + healthDelta));

  return (
    <section id="preview" className="py-24 bg-[#030714] relative border-t border-cyan-950/80">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-cyan-900/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Interactive Sandbox</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            Test-Drive Accora Right Now
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-sans">
            Click through live simulated components from the real application. Every card reflects grounded business metrics with realistic Pakistani Rupee financials.
          </p>

          {/* Interactive Navigation Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 font-sans">
            {[
              { id: 'copilot', label: 'AI Copilot Q&A', icon: Brain },
              { id: 'health', label: 'Health Diagnostics', icon: Activity },
              { id: 'move', label: 'Next Best Move', icon: Lightbulb },
              { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#090f28] text-violet-200 border border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800/80 hover:text-violet-200 hover:border-violet-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === t.id ? 'text-violet-300' : 'text-slate-500'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── TAB CONTENT DISPLAY CONTAINER ────────────────────────── */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#070c22]/95 border border-violet-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden font-sans">
          {/* Subtle top starlight accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent pointer-events-none" />

          {/* TAB 1: AI COPILOT */}
          {activeTab === 'copilot' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-indigo-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Accora AI Financial Copilot</h3>
                    <p className="text-[11px] text-slate-400 font-sans">Structured analysis grounded strictly in company ledger data</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/60 border border-violet-500/30 text-violet-300">
                  Engine: Deterministic Model
                </span>
              </div>

              {/* Sample Questions Selector */}
              <div>
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Select a live financial query to test:
                </span>
                <div className="grid sm:grid-cols-3 gap-2">
                  {copilotQuestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuestion(idx)}
                      className={`text-left p-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        selectedQuestion === idx
                          ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-glow font-semibold shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                          : 'bg-slate-900/60 border border-cyan-950/60 text-slate-400 hover:text-slate-200 hover:border-cyan-900'
                      }`}
                    >
                      {item.q}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Structured Answer Card */}
              <div className="p-5 rounded-xl bg-[#040817] border border-cyan-950/80 space-y-4">
                {/* Question query echo */}
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[10px] font-mono text-cyan-300 shrink-0">
                    Q
                  </span>
                  <span className="font-semibold text-white font-mono">
                    "{copilotQuestions[selectedQuestion].q}"
                  </span>
                </div>

                {/* Answer Summary */}
                <div className="p-4 rounded-xl bg-[#081026] border border-cyan-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  <div className="flex items-center gap-1.5 text-cyan-glow text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Answer</span>
                  </div>
                  {copilotQuestions[selectedQuestion].answer}
                </div>

                {/* Evidence & Interpretation Two-Column */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Empirical Evidence */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-950 space-y-2">
                    <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Empirical Evidence
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                      {copilotQuestions[selectedQuestion].evidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-glow font-bold">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strategic Interpretation */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-950 space-y-2">
                    <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Strategic Interpretation
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {copilotQuestions[selectedQuestion].interpretation}
                    </p>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-900/50 border border-emerald-800/40">
                  <h4 className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Direct Recommendation
                  </h4>
                  <p className="text-xs text-slate-200 font-sans">
                    {copilotQuestions[selectedQuestion].recommendation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  to="/app"
                  className="text-xs font-mono font-semibold text-cyan-glow hover:text-cyan-200 inline-flex items-center gap-1 uppercase"
                >
                  Test Custom Prompts in Live Cockpit <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH SCORE GAUGE */}
          {activeTab === 'health' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-glow">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Orbital Diagnostic Radar</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Continuous 0-100 telemetry across five core flight dimensions</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50">
                  Flight Grade: Good (78/100)
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 items-center">
                {/* Score Circle Gauge */}
                <div className="p-6 rounded-xl bg-[#040817] border border-cyan-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#0e1b38" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#00f2fe"
                        strokeWidth="8"
                        strokeDasharray={`${(78 / 100) * 314} 314`}
                        strokeLinecap="round"
                        className="filter drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-white font-mono">78</span>
                      <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">/ 100</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3 font-sans">Stable Fundamentals</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-mono">
                    Runway buffer intact; primary optimization is burn rate moderation.
                  </p>
                </div>

                {/* 5 Dimensions breakdown */}
                <div className="md:col-span-2 space-y-3.5 p-5 rounded-xl bg-[#040817] border border-cyan-950">
                  <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                    Dimensional Telemetry Breakdown:
                  </span>

                  {[
                    { label: 'Revenue Performance', score: 84, color: 'bg-cyan-400', note: 'Steady 24% YoY expansion' },
                    { label: 'Profitability Margin', score: 76, color: 'bg-emerald-400', note: '25.2% margin exceeds 20% safe zone' },
                    { label: 'Cash Flow Health', score: 88, color: 'bg-sky-400', note: 'Positive cash generation 12/12 months' },
                    { label: 'Expense Discipline', score: 65, color: 'bg-amber-400', note: 'Operating costs rising faster than revenue' },
                    { label: 'Growth Trend', score: 77, color: 'bg-indigo-400', note: 'Consistent recurring retainer base' },
                  ].map((dim) => (
                    <div key={dim.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{dim.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{dim.note}</span>
                          <span className="font-mono text-cyan-glow font-semibold">{dim.score}/100</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dim.color} transition-all duration-700`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-950 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Orbital score automatically re-indexes upon every new invoice, transaction, or cost reduction.
                </span>
                <Link
                  to="/app"
                  className="text-xs font-mono font-semibold text-cyan-glow hover:text-cyan-200 inline-flex items-center gap-1 uppercase"
                >
                  View in Cockpit <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: NEXT BEST MOVE */}
          {activeTab === 'move' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-glow">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Tactical Mission Directive</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Ranked algorithmic strategic flight plan</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-glow">
                  PRIORITY 1 DIRECTIVE
                </span>
              </div>

              {/* Main Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#081026] via-[#0b1736] to-[#040817] border border-cyan-500/30 space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-cyan-glow text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Primary Opportunity Detected</span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight font-sans">
                    Audit Operations Vendor Contracts to Recover PKR 42,000/mo
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-sans">
                    Operations expenses grew 50% YoY, expanding to PKR 420,000/month (36% of total company outlays). 
                    Renegotiating the top 3 SaaS tooling seats or trimming unused cloud compute will preserve your 25%+ margin target.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-cyan-950">
                    <span className="text-[11px] font-mono font-semibold text-cyan-300 block mb-1">
                      Why this matters:
                    </span>
                    <p className="text-xs text-slate-300 font-sans">
                      Operations costs are outstripping revenue velocity by 1.2% MoM. Trimming 10% returns PKR 504,000 to annual retained surplus.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-cyan-950">
                    <span className="text-[11px] font-mono font-semibold text-cyan-300 block mb-1">
                      Projected Financial Impact:
                    </span>
                    <p className="text-xs text-emerald-400 font-mono font-semibold">
                      +PKR 42,000 / month added to cash buffer
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-cyan-950 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    Suggested action: <strong className="text-slate-200">Review Flight Ledger</strong>
                  </div>
                  <Link
                    to="/app/transactions"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors uppercase shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                  >
                    <span>Execute in Cockpit</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  </Link>
                </div>
              </div>

              {/* Secondary actions preview */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-cyan-950 space-y-2">
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                  Secondary Ranked Directives:
                </span>
                <ul className="text-xs space-y-2 text-slate-300 font-mono">
                  <li className="flex items-center justify-between py-1 border-b border-cyan-950/60">
                    <span>1. Send overdue reminder to Horizon Labs (PKR 210,000 overdue)</span>
                    <span className="text-emerald-400 font-medium">+PKR 210K inflow</span>
                  </li>
                  <li className="flex items-center justify-between py-1">
                    <span>2. Pitch retainer contract to repeat project client "Urban Media"</span>
                    <span className="text-cyan-glow font-medium">+PKR 75K/mo recurring</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: WHAT-IF SCENARIO SIMULATOR SANDBOX */}
          {activeTab === 'whatif' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-glow">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Live Flight Scenario Sandbox</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Adjust the telemetry controls below to stress-test decisions in real time</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setWhatIfRev(10);
                    setWhatIfExp(0);
                    setWhatIfSalary(0);
                  }}
                  className="text-xs font-mono font-semibold text-slate-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-slate-900 border border-cyan-950 transition-colors uppercase"
                >
                  Reset Baseline
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid md:grid-cols-3 gap-6 p-5 rounded-xl bg-[#040817] border border-cyan-950">
                {/* Revenue Change Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono font-medium">Revenue Growth / Dip</span>
                    <span className={`font-mono font-bold ${whatIfRev >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {whatIfRev >= 0 ? `+${whatIfRev}%` : `${whatIfRev}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="5"
                    value={whatIfRev}
                    onChange={(e) => setWhatIfRev(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-30%</span>
                    <span>0%</span>
                    <span>+30%</span>
                  </div>
                </div>

                {/* Expense Change Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono font-medium">Operating Burn</span>
                    <span className={`font-mono font-bold ${whatIfExp <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {whatIfExp >= 0 ? `+${whatIfExp}%` : `${whatIfExp}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-25"
                    max="25"
                    step="5"
                    value={whatIfExp}
                    onChange={(e) => setWhatIfExp(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-25%</span>
                    <span>0%</span>
                    <span>+25%</span>
                  </div>
                </div>

                {/* New Hire Cost Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono font-medium">New Crew Monthly Salary</span>
                    <span className="font-mono font-bold text-cyan-glow">
                      PKR {whatIfSalary.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150000"
                    step="25000"
                    value={whatIfSalary}
                    onChange={(e) => setWhatIfSalary(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0</span>
                    <span>PKR 75K</span>
                    <span>PKR 150K</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Outcome Panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#040817] border border-cyan-950">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Projected Revenue</span>
                  <div className="text-lg font-bold text-white font-mono">PKR {projRev.toLocaleString()}</div>
                  <span className="text-[10px] font-mono text-slate-500">Baseline: PKR 1.55M</span>
                </div>

                <div className="p-4 rounded-xl bg-[#040817] border border-cyan-950">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Projected Outflows</span>
                  <div className="text-lg font-bold text-white font-mono">PKR {projExp.toLocaleString()}</div>
                  <span className="text-[10px] font-mono text-slate-500">Baseline: PKR 1.16M</span>
                </div>

                <div className="p-4 rounded-xl bg-[#040817] border border-cyan-950">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Projected Net Surplus</span>
                  <div className={`text-lg font-bold font-mono ${projProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    PKR {projProfit.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-mono text-cyan-glow font-semibold">{projMargin}% Margin</span>
                </div>

                <div className="p-4 rounded-xl bg-[#040817] border border-cyan-950">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Projected Health</span>
                  <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
                    {projHealth} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${profitDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {profitDelta >= 0 ? `+${healthDelta} pts shift` : `${healthDelta} pts shift`}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-300 font-mono">
                  Accora includes presets like "Hire Senior Lead at PKR 120K", "Revenue -20% Stress Test", and "Burn Trim -15%".
                </p>
                <Link
                  to="/app/scenarios"
                  className="shrink-0 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-glow text-xs font-mono font-bold transition-all uppercase tracking-wider"
                >
                  Open Full Simulator
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
