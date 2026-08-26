import { useFinancial } from '../store/FinancialStore';
import { useTheme } from '../store/ThemeProvider';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function HealthScore() {
  const { health } = useFinancial();
  const { theme } = useTheme();
  if (!health) return null;

  const ringBg = theme === 'dark' ? '#252a36' : theme === 'high-contrast' ? '#cccccc' : '#e4e7ec';

  const color = health.overall >= 70 ? '#12b76a' : health.overall >= 50 ? '#f79009' : '#f04438';
  const dims = [
    { label: 'Revenue', value: health.revenue_performance },
    { label: 'Profitability', value: health.profitability },
    { label: 'Expense Control', value: health.expense_control },
    { label: 'Cash Flow', value: health.cash_flow_health },
    { label: 'Growth', value: health.growth_trend },
  ];

  return (
    <div className="bg-surface-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6">
      <h2 className="text-sm font-semibold text-surface-900 mb-1">Financial Health</h2>

      {/* Score ring */}
      <div className="flex items-center gap-6 my-4">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke={ringBg} strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${(health.overall / 100) * 314} 314`} strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-surface-900">{health.overall.toFixed(0)}</span>
            <span className="text-[10px] text-surface-400 uppercase tracking-wide">/ 100</span>
          </div>
        </div>
        <div>
          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
            style={{ backgroundColor: `${color}18`, color }}>
            {health.label}
          </span>
          <p className="text-xs text-surface-500 mt-2 leading-relaxed">{health.explanation}</p>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-2.5">
        {dims.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-surface-600">{d.label}</span>
              <span className="font-medium text-surface-900">{d.value.toFixed(0)}</span>
            </div>
            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${d.value}%`,
                  backgroundColor: d.value >= 70 ? '#12b76a' : d.value >= 50 ? '#f79009' : '#f04438',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Improvements */}
      {(health.strengths.length > 0 || health.improvements.length > 0) && (
        <div className="mt-5 space-y-3">
          {health.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-positive shrink-0 mt-0.5" />
              <span className="text-surface-600">{s}</span>
            </div>
          ))}
          {health.improvements.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <XCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <span className="text-surface-600">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
