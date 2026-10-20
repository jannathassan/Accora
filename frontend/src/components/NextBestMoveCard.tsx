import { Link } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

export default function NextBestMoveCard() {
  const { nextBestMove } = useFinancial();

  if (!nextBestMove) return null;

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-surface-card border border-brand-200 shadow-[var(--shadow-card)] p-5 md:p-6 transition-all hover:border-brand-300 font-sans">
      {/* Subtle ambient corner warmth */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-200/20 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 border border-brand-300/40 text-brand-600 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block font-mono">
              Strategic Copilot Directive
            </span>
            <h2 className="text-xs font-semibold text-surface-500">
              Prioritized Financial Action
            </h2>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-positive-light text-positive border border-positive/30 font-mono">
          {nextBestMove.impact}
        </span>
      </div>

      {/* Primary recommendation */}
      <h3 className="text-lg md:text-xl font-bold text-surface-900 tracking-tight mb-2 font-sans">
        {nextBestMove.title}
      </h3>
      <p className="text-sm text-surface-600 leading-relaxed mb-4 font-sans">
        {nextBestMove.description}
      </p>

      {/* Why it matters */}
      <div className="bg-surface-100/70 border border-surface-200 rounded-xl p-3.5 mb-4 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-surface-900 block mb-0.5 font-sans">
              Financial Impact Context
            </span>
            <p className="text-xs text-surface-600 leading-relaxed font-sans">
              {nextBestMove.why_it_matters}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Impact badge */}
      <div className="sm:hidden flex items-center gap-2 mb-4 font-mono">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-positive-light text-positive border border-positive/30">
          {nextBestMove.impact}
        </span>
      </div>

      {/* Action button */}
      <div className="flex items-center gap-3">
        <Link
          to={nextBestMove.action_url}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs md:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] font-sans"
        >
          <span>{nextBestMove.action_label}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Secondary recommendations */}
      {nextBestMove.secondary.length > 0 && (
        <div className="mt-5 pt-4 border-t border-surface-200">
          <span className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-2.5 block font-mono">
            Complementary Optimization Steps
          </span>
          <ul className="space-y-1.5">
            {nextBestMove.secondary.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-surface-600 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-1.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
