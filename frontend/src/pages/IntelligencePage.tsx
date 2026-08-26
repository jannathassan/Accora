import { useState, useMemo } from 'react';
import { useFinancial } from '../store/FinancialStore';
import InsightCard from '../components/InsightCard';
import NextBestMoveCard from '../components/NextBestMoveCard';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp, Sparkles, Filter } from 'lucide-react';

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

  const getStatus = (id: string) => localStatuses[id] ?? 'new';

  const filtered = useMemo(() => {
    return insights.filter((ins) => {
      if (typeFilter !== 'all' && ins.type !== typeFilter) return false;
      if (statusFilter !== 'all' && getStatus(ins.id) !== statusFilter) return false;
      return true;
    });
  }, [insights, typeFilter, statusFilter, localStatuses]);

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
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-ai" />
        <div>
          <h1 className="text-xl font-bold text-surface-900">Accora Intelligence</h1>
          <p className="text-xs text-surface-500 mt-0.5">AI-powered analysis of risks, opportunities, and trends in your financial data</p>
        </div>
      </div>

      {/* Next Best Move */}
      <NextBestMoveCard />

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="px-3 py-1.5 rounded-lg bg-risk-light text-risk font-medium">{counts.risk + counts.anomaly} Risks</span>
        <span className="px-3 py-1.5 rounded-lg bg-positive-light text-positive font-medium">{counts.opportunity} Opportunities</span>
        <span className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 font-medium">{counts.trend} Trends</span>
        <span className="px-3 py-1.5 rounded-lg bg-positive-light text-positive font-medium">{counts.positive} Wins</span>
      </div>

      {/* Type Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setTypeFilter(tab.key)}
              className={clsx('inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                typeFilter === tab.key ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200')}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
        <span className="ml-2 h-4 w-px bg-surface-200" />
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-surface-400" />
          {STATUS_TABS.map((s) => (
            <button key={s.key} onClick={() => setStatusFilter(s.key)}
              className={clsx('px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
                statusFilter === s.key ? 'bg-surface-800 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200')}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-surface-400">
          No insights match the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ins) => {
            const status = getStatus(ins.id);
            return (
              <div key={ins.id} className={clsx(
                'transition-opacity',
                status === 'resolved' && 'opacity-50',
              )}>
                <InsightCard insight={ins} />
                <div className="flex items-center gap-2 mt-2 ml-11">
                  {(['new', 'reviewed', 'resolved'] as const).map((s) => (
                    <button key={s} onClick={() => handleStatusChange(ins.id, s)}
                      className={clsx('px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors',
                        status === s ? 'bg-surface-800 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200')}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
