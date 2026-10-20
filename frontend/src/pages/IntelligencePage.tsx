import { useState, useMemo, useEffect, useCallback } from 'react';
import { useFinancial } from '../store/FinancialStore';
import InsightCard from '../components/InsightCard';
import NextBestMoveCard from '../components/NextBestMoveCard';
import * as api from '../services/api';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'risk', label: 'Risks', icon: AlertTriangle },
  { key: 'opportunity', label: 'Opportunities', icon: Lightbulb },
  { key: 'trend', label: 'Trends', icon: TrendingUp },
  { key: 'positive', label: 'Wins', icon: CheckCircle2 },
];

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'resolved', label: 'Resolved' },
];

export default function IntelligencePage() {
  const { insights, updateInsightStatus } = useFinancial();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getInsightStatuses().then((statuses) => {
      setLocalStatuses((prev) => ({ ...statuses, ...prev }));
    }).catch(() => { /* non-critical */ });
  }, []);

  const getStatus = useCallback((id: string) => localStatuses[id] ?? 'new', [localStatuses]);

  const filtered = useMemo(() => {
    return insights.filter((ins) => {
      if (typeFilter !== 'all' && ins.type !== typeFilter) return false;
      if (statusFilter !== 'all' && getStatus(ins.id) !== statusFilter) return false;
      return true;
    });
  }, [insights, typeFilter, statusFilter, getStatus]);

  const handleStatusChange = async (id: string, status: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: status }));
    await updateInsightStatus(id, status);
  };

  const counts = useMemo(() => {
    const c = { risk: 0, opportunity: 0, trend: 0, positive: 0, anomaly: 0 };
    insights.forEach((i) => { if (i.type in c) c[i.type as keyof typeof c]++; });
    return c;
  }, [insights]);

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ai" />
            <h1 className="text-xl md:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              Accora Intelligence
            </h1>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            AI-powered analysis of risks, opportunities, and trends in your financial data
          </p>
        </div>
      </div>

      {/* Next Best Move */}
      <NextBestMoveCard />

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <span className="px-3 py-1.5 rounded-lg bg-risk-light text-risk border border-risk/20 font-semibold tabular-nums font-mono">
          {counts.risk + counts.anomaly} Risks
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-positive-light text-positive border border-positive/20 font-semibold tabular-nums font-mono">
          {counts.opportunity} Opportunities
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 font-semibold tabular-nums font-mono">
          {counts.trend} Trends
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-positive-light text-positive border border-positive/20 font-semibold tabular-nums font-mono">
          {counts.positive} Wins
        </span>
      </div>

      {/* Type Tabs & Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setTypeFilter(tab.key)}
              className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer',
                typeFilter === tab.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-surface-card border border-surface-200 text-surface-600 dark:text-surface-300 hover:bg-surface-100')}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
        <div className="hidden sm:block w-px h-5 bg-surface-200 mx-1" />
        <div className="flex items-center gap-1">
          {STATUS_TABS.map((s) => (
            <button key={s.key} onClick={() => setStatusFilter(s.key)}
              className={clsx('px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer',
                statusFilter === s.key
                  ? 'bg-surface-800 text-white'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100')}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface-card rounded-[var(--radius-card)] border border-surface-200 p-8">
          <Sparkles className="w-10 h-10 text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-500 font-medium">No insights match your filters</p>
          <p className="text-xs text-surface-400 mt-1">Try selecting a different category or status.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((ins) => (
            <div key={ins.id} className="relative group">
              <InsightCard insight={ins} />
              {/* Status Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {getStatus(ins.id) !== 'resolved' && (
                  <button onClick={() => handleStatusChange(ins.id, 'resolved')}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-positive-light text-positive border border-positive/30 rounded-md hover:bg-positive/20 transition-colors cursor-pointer">
                    Resolve
                  </button>
                )}
                {getStatus(ins.id) === 'new' && (
                  <button onClick={() => handleStatusChange(ins.id, 'reviewed')}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-surface-100 text-surface-600 rounded-md hover:bg-surface-200 transition-colors cursor-pointer">
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
