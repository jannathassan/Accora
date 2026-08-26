import { Link } from 'react-router-dom';
import { useFinancial } from '../store/FinancialStore';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

export default function NextBestMoveCard() {
  const { nextBestMove } = useFinancial();
  if (!nextBestMove) return null;

  return (
    <div className="bg-gradient-to-br from-brand-50 to-brand-100/40 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-brand/10 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-brand-700 uppercase tracking-wide">
          Your Next Best Move
        </h2>
      </div>

      {/* Primary recommendation */}
      <h3 className="text-lg font-bold text-surface-900 mb-2">{nextBestMove.title}</h3>
      <p className="text-sm text-surface-700 leading-relaxed mb-3">{nextBestMove.description}</p>

      {/* Why it matters */}
      <div className="bg-surface-card/70 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-surface-800 block mb-0.5">Why this matters</span>
            <p className="text-xs text-surface-600 leading-relaxed">{nextBestMove.why_it_matters}</p>
          </div>
        </div>
      </div>

      {/* Impact badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-positive-light text-positive">
          {nextBestMove.impact}
        </span>
      </div>

      {/* Action button */}
      <Link
        to={nextBestMove.action_url}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors shadow-sm"
      >
        {nextBestMove.action_label}
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Secondary recommendations */}
      {nextBestMove.secondary.length > 0 && (
        <div className="mt-5 pt-4 border-t border-brand/10">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2 block">
            Also consider
          </span>
          <ul className="space-y-1.5">
            {nextBestMove.secondary.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-surface-600">
                <span className="w-1 h-1 rounded-full bg-surface-400 shrink-0 mt-1.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
