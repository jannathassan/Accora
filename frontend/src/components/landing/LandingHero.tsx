import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Brain,
  Shield,
  Activity,
  ChevronRight,
} from 'lucide-react';

export default function LandingHero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#030712]">
      {/* Background ambient galaxy nebulae */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[520px] bg-gradient-to-tr from-violet-900/25 via-indigo-900/20 to-sky-900/20 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/8 w-[450px] h-[450px] bg-violet-600/12 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-1/8 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 left-2/3 w-[400px] h-[400px] bg-sky-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Realistic cosmic starfield overlay */}
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-50" />

      {/* Tasteful planetary horizon glow curve */}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[1300px] h-[320px] planetary-horizon pointer-events-none opacity-35" />

      {/* Subtle fine cosmic coordinates grid */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(192, 132, 252, 0.7) 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        {/* Main Copy */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a0f24]/90 border border-violet-500/30 text-slate-300 text-xs font-sans shadow-[0_0_20px_rgba(139,92,246,0.18)] hover:border-violet-400/60 transition-colors">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
            </span>
            <span className="text-white font-semibold tracking-wide">Accora v0.1</span>
            <span className="text-violet-800">•</span>
            <span className="text-violet-300 font-mono tracking-wider uppercase text-[11px]">AI Financial Intelligence Platform</span>
          </div>

          {/* Headline with Tagline & Core Message */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-sans">
            Your Business, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-200 via-indigo-200 to-sky-200 bg-clip-text text-transparent font-serif italic font-normal drop-shadow-sm">
              With Intelligence.
            </span>
          </h1>

          {/* Subheading / Core message */}
          <p className="text-lg sm:text-xl font-medium text-slate-200 tracking-tight font-sans">
            Understand your numbers. Predict your future. Act with confidence.
          </p>

          {/* Detailed Product Narrative */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Accora transforms raw transaction records and billing receipts into forward-looking forecasts, 
            instant health diagnostics, and prioritized strategic directives — giving business owners 
            the foresight of a seasoned financial analyst.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-sans">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/80 border border-violet-500/30 hover:bg-violet-950/40 hover:border-violet-400 hover:text-white transition-all shadow-md"
            >
              <span>Launch Live App Demo</span>
              <ChevronRight className="w-4 h-4 text-violet-300" />
            </Link>

            <button
              onClick={() => scrollTo('preview')}
              className="hidden lg:inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-medium text-slate-400 hover:text-violet-300 transition-colors cursor-pointer"
            >
              <span>Explore Interactive Sandbox</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Architecture Pillars Trust Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-sans">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Grounded Deterministic Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Zero LLM Hallucinations</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>3-to-6 Month Forward Projections</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Multi-Dimensional Health Score</span>
            </div>
          </div>
        </div>

        {/* ─── LIVE APP COCKPIT PREVIEW ───────────────────────────────── */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          {/* Ambient galaxy backdrop behind cockpit frame */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600/30 via-sky-600/20 to-fuchsia-600/25 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

          <div className="relative rounded-2xl bg-[#070b1a]/95 backdrop-blur-2xl overflow-hidden border border-violet-500/30 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
            
            {/* Window Title Bar */}
            <div className="px-5 py-3.5 bg-[#040714] border-b border-indigo-950/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-[11px] text-slate-400">
                  app.accora.internal / executive-dashboard
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  LIVE DEMO • PKR
                </span>
                <Link
                  to="/app"
                  className="text-[11px] text-violet-300 hover:text-white font-semibold inline-flex items-center gap-1 transition-colors font-sans"
                >
                  Open Live App <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* App Cockpit Header Mockup */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-950/60">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-bold text-white tracking-tight font-sans">Bright Pixel Studios</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-semibold font-mono">Digital Agency</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans">12-Month Financial Performance & Strategic Directives</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-violet-500/30 flex items-center gap-2 text-xs text-slate-300 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Financial Copilot: <strong className="text-violet-200">Active</strong></span>
                  </div>
                </div>
              </div>

              {/* KPI Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="p-4 rounded-xl bg-[#0b1026] border border-violet-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/60 to-transparent" />
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-sans">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Monthly Revenue</span>
                    <span className="text-emerald-400 font-mono font-semibold text-[11px] tabular-nums">+3.4% MoM</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight font-mono tabular-nums">PKR 1,551,500</div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">55% client projects • 30% retainers</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1026] border border-violet-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500/60 to-transparent" />
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-sans">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Operating Expenses</span>
                    <span className="text-rose-400 font-mono font-semibold text-[11px] tabular-nums">+4.6% MoM</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight font-mono tabular-nums">PKR 1,161,400</div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Salaries & Ops: 66% of burn</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1026] border border-violet-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500/60 to-transparent" />
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-sans">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Net Profit Margin</span>
                    <span className="text-violet-300 font-mono font-semibold text-[11px] tabular-nums">25.2% Margin</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight font-mono tabular-nums">PKR 390,353</div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Healthy buffer above 20% benchmark</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1026] border border-violet-500/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 to-transparent" />
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-sans">
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Health Score</span>
                    <span className="text-emerald-400 font-semibold text-[11px] font-sans">Stable</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-1 font-mono tabular-nums">
                    78 <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Cash runway: ~7.6 months</p>
                </div>
              </div>

              {/* Visual Trajectory & Next Best Move */}
              <div className="grid md:grid-cols-3 gap-4 pt-2">
                {/* Left: Performance Trajectory visual curve */}
                <div className="md:col-span-2 p-5 rounded-xl bg-[#090d22] border border-indigo-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                      12-Month Performance Trajectory
                    </span>
                    <div className="flex items-center gap-4 text-[11px] font-sans">
                      <span className="flex items-center gap-1.5 text-violet-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-violet-400" /> Revenue
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Expenses
                      </span>
                    </div>
                  </div>

                  {/* Stylized SVG Chart */}
                  <div className="h-32 w-full pt-4">
                    <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="heroRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="25" x2="400" y2="25" stroke="#1e1b4b" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#1e1b4b" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="0" y1="75" x2="400" y2="75" stroke="#1e1b4b" strokeWidth="1" strokeDasharray="3 3" />
                      
                      <path
                        d="M 0,82 C 40,80 80,72 120,65 C 160,58 200,60 240,48 C 280,38 320,32 360,24 L 400,18 L 400,100 L 0,100 Z"
                        fill="url(#heroRevGrad)"
                      />
                      <path
                        d="M 0,82 C 40,80 80,72 120,65 C 160,58 200,60 240,48 C 280,38 320,32 360,24 L 400,18"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 0,88 C 40,85 80,82 120,74 C 160,68 200,66 240,60 C 280,52 320,48 360,42 L 400,38"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <circle cx="400" cy="18" r="4" fill="#a78bfa" className="animate-pulse" />
                    </svg>
                  </div>
                </div>

                {/* Right: AI Copilot Priority Directive */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1228] to-[#120f2b] border border-violet-500/30 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300 font-bold">
                        Priority Directive
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                        +PKR 120K/mo
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug font-sans">
                      Transition Top Client from Hourly to Fixed Retainer
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Converting Nexus Global locks in PKR 250,000/mo guaranteed cash flow and stabilizes runway through Q3.
                    </p>
                  </div>

                  <Link
                    to="/app"
                    className="w-full py-2 px-3 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-400/40 text-xs font-semibold text-violet-200 hover:text-white flex items-center justify-between transition-colors font-sans"
                  >
                    <span>Execute in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
