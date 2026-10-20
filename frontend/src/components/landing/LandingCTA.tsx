import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="py-24 bg-[#030712] relative overflow-hidden border-t border-indigo-950/80">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-r from-violet-900/20 via-indigo-900/20 to-sky-900/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 cosmic-starfield pointer-events-none opacity-30" />

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 font-sans">
        <div className="rounded-3xl bg-gradient-to-b from-[#0a0f28] via-[#0d1435] to-[#05091c] border border-violet-500/30 p-8 sm:p-14 text-center space-y-6 shadow-[0_0_60px_rgba(139,92,246,0.18)] relative overflow-hidden backdrop-blur-xl">
          {/* Top border beam */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent pointer-events-none" />
          
          {/* Top pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Ready to upgrade your financial operations?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Take Control of Your Numbers with Intelligent Foresight.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience the complete Accora platform — financial analytics, AI Copilot, multi-period forecasting, 
            and What-If scenarios — preloaded with 12 months of realistic data.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_40px_rgba(139,92,246,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold text-violet-200 bg-slate-900/90 border border-violet-500/30 hover:bg-violet-950/40 hover:border-violet-400 hover:text-white transition-all shadow-md"
            >
              <span>Launch Live App Demo</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-indigo-950/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Instant browser access
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Complete 12-month demo dataset
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
