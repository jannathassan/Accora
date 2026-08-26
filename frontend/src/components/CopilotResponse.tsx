/**
 * CopilotResponse — renders a structured AI response with four distinct sections:
 * Answer, Evidence, Interpretation, Recommendation, Follow-ups, and Navigation Links.
 */

import { Link } from 'react-router-dom';
import type { ChatResponse } from '../types';
import { clsx } from 'clsx';
import {
  Brain,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  FileText,
  Receipt,
  BarChart3,
  TrendingUp,
  Sliders,
  Lightbulb,
  Info,
} from 'lucide-react';

/* ─── Navigation link detection ─────────────────────────────────── */

interface NavLink {
  label: string;
  to: string;
  icon: typeof ArrowRight;
}

const NAV_PATTERNS: { keywords: string[]; link: NavLink }[] = [
  { keywords: ['forecast', 'projection', 'projected'], link: { label: 'View Forecast', to: '/app/forecast', icon: TrendingUp } },
  { keywords: ['invoice', 'overdue', 'billing', 'collect'], link: { label: 'View Invoices', to: '/app/invoices', icon: FileText } },
  { keywords: ['transaction', 'spending', 'expense categor'], link: { label: 'Review Transactions', to: '/app/transactions', icon: Receipt } },
  { keywords: ['analytic', 'breakdown', 'chart', 'trend'], link: { label: 'See Analytics', to: '/app/analytics', icon: BarChart3 } },
  { keywords: ['report', 'summary', 'p&l', 'profit and loss'], link: { label: 'View Reports', to: '/app/reports', icon: FileText } },
  { keywords: ['scenario', 'what-if', 'what if', 'model'], link: { label: 'Try What-If', to: '/app/scenarios', icon: Sliders } },
  { keywords: ['insight', 'risk', 'opportun', 'alert'], link: { label: 'View Insights', to: '/app/intelligence', icon: Lightbulb } },
];

function detectNavLinks(text: string): NavLink[] {
  const lower = text.toLowerCase();
  const found: NavLink[] = [];
  for (const { keywords, link } of NAV_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      found.push(link);
    }
  }
  return found.slice(0, 3); // max 3 nav links
}

/* ─── Component ─────────────────────────────────────────────────── */

interface Props {
  data: ChatResponse;
  onFollowUp: (question: string) => void;
}

export default function CopilotResponse({ data, onFollowUp }: Props) {
  const navLinks = detectNavLinks(
    `${data.recommendation} ${data.interpretation} ${data.answer}`,
  );

  return (
    <div className="space-y-2.5 mt-2">
      {/* Evidence — What I Found */}
      {data.evidence.length > 0 && (
        <div className="bg-surface-50 rounded-xl p-3.5 border border-surface-100">
          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-2">
            What I Found
          </p>
          <ul className="space-y-1">
            {data.evidence.map((e, i) => (
              <li key={i} className="text-xs text-surface-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-300 shrink-0 mt-1.5" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interpretation — Why It Matters */}
      {data.interpretation && (
        <div className="bg-brand-50 rounded-xl p-3.5 border border-brand-100/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-brand-600" />
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
              Why It Matters
            </p>
          </div>
          <p className="text-xs text-surface-700 leading-relaxed">{data.interpretation}</p>
        </div>
      )}

      {/* Recommendation — Recommended Actions */}
      {data.recommendation && (
        <div className="bg-positive-light rounded-xl p-3.5 border border-positive/10">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-positive" />
            <p className="text-[10px] font-bold text-positive uppercase tracking-wider">
              Recommended Actions
            </p>
          </div>
          <p className="text-xs text-surface-700 leading-relaxed">{data.recommendation}</p>
        </div>
      )}

      {/* Navigation Links */}
      {navLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg',
                  'bg-surface-card border border-surface-200 text-surface-700',
                  'hover:bg-surface-100 hover:border-surface-300 transition-colors',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Follow-up Questions */}
      {data.follow_ups && data.follow_ups.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            Follow-up questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.follow_ups.map((f, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(f)}
                className={clsx(
                  'text-xs px-3 py-1.5 rounded-full transition-colors',
                  'bg-brand-50 text-brand-700 hover:bg-brand-100',
                  'border border-brand/10',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transparency footer */}
      <div className="flex items-center gap-1.5 pt-1">
        <Info className="w-3 h-3 text-surface-300" />
        <span className="text-[10px] text-surface-400">
          Based on the data currently available in Accora
        </span>
      </div>
    </div>
  );
}
