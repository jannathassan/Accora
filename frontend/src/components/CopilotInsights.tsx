/**
 * CopilotInsights — "What Accora Noticed" sidebar component.
 *
 * Renders proactive insights derived from the current financial data.
 * Each insight card has an "Ask Accora" action that populates the chat input.
 */

import { useFinancial } from '../store/FinancialStore';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Brain,
  MessageSquare,
  Info,
} from 'lucide-react';
import type { InsightType } from '../types';

const ICON_MAP: Record<string, { icon: typeof AlertTriangle; bg: string; text: string }> = {
  risk:        { icon: AlertTriangle, bg: 'bg-risk-light',      text: 'text-risk' },
  anomaly:     { icon: AlertTriangle, bg: 'bg-warning-light',   text: 'text-warning' },
  opportunity: { icon: Lightbulb,     bg: 'bg-positive-light',  text: 'text-positive' },
  trend:       { icon: TrendingUp,    bg: 'bg-brand-50',        text: 'text-brand-600' },
  positive:    { icon: CheckCircle2,  bg: 'bg-positive-light',  text: 'text-positive' },
};

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-risk',
  high: 'bg-warning',
  medium: 'bg-brand-400',
  low: 'bg-surface-300',
};

interface Props {
  onAsk: (question: string) => void;
}

export default function CopilotInsights({ onAsk }: Props) {
  const { insights } = useFinancial();
  const visible = insights.slice(0, 5);

  if (!visible.length) {
    return (
      <div className="text-center py-8">
        <Brain className="w-8 h-8 text-surface-300 mx-auto mb-2" />
        <p className="text-xs text-surface-400">No insights available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((ins) => {
        const cfg = ICON_MAP[ins.type] ?? ICON_MAP.risk;
        const Icon = cfg.icon;
        const question = `Tell me more about: ${ins.title}`;

        return (
          <div
            key={ins.id}
            className="bg-surface-card rounded-xl p-3 border border-surface-100 hover:border-surface-200 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                <Icon className={clsx('w-3.5 h-3.5', cfg.text)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={clsx('text-[10px] font-bold uppercase tracking-wider', cfg.text)}>
                    {ins.type}
                  </span>
                  <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', SEVERITY_DOT[ins.severity] ?? SEVERITY_DOT.low)} />
                </div>
                <h4 className="text-xs font-semibold text-surface-900 leading-snug">{ins.title}</h4>
                <p className="text-[11px] text-surface-500 leading-relaxed mt-0.5 line-clamp-2">
                  {ins.explanation}
                </p>
                <button
                  onClick={() => onAsk(question)}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  aria-label={`Ask Accora about ${ins.title}`}
                >
                  <MessageSquare className="w-3 h-3" />
                  Ask Accora
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Transparency footer */}
      <div className="flex items-center gap-1.5 pt-1 px-1">
        <Info className="w-3 h-3 text-surface-300" />
        <span className="text-[10px] text-surface-400">Based on your Accora data</span>
      </div>
    </div>
  );
}
